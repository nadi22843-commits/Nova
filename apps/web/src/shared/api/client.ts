/**
 * Клиент Nova API.
 *
 * Одно место, где приложение ходит на сервер: адрес, токен, таймаут и разбор
 * ошибок. Экраны про сеть ничего не знают — они вызывают функции из
 * shared/api/* и получают либо данные, либо ApiError.
 *
 * Если сервер выключен, приложение продолжает работать автономно: запрос
 * завершается ошибкой 'offline', вызывающий код переходит на локальные данные,
 * а общий статус переключается в «сервер недоступен».
 */

const RAW_BASE = (import.meta.env?.VITE_API_URL as string | undefined) ?? 'http://localhost:3001/api';
export const API_BASE = RAW_BASE.replace(/\/+$/, '');

const TOKEN_KEY = 'nova.auth.token';
const DEFAULT_TIMEOUT_MS = 8000;

export class ApiError extends Error {
  /** Код из ответа сервера ('bad_request', 'not_found', …) или 'offline'. */
  readonly code: string;
  /** HTTP-статус; 0 — до сервера не дошли. */
  readonly status: number;
  readonly details?: unknown;

  constructor(code: string, status: number, details?: unknown) {
    super(`${code} (${status})`);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  /** Сервер недоступен или сеть пропала — повод уйти в автономный режим. */
  get isOffline(): boolean {
    return this.status === 0;
  }
}

export function readToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
}

export function writeToken(token: string): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* хранилище запрещено — сессия проживёт до перезагрузки */
  }
}

/* ── Статус сервера ───────────────────────────────────────────────── */

export type ApiStatus = 'unknown' | 'online' | 'offline';

let status: ApiStatus = 'unknown';
const listeners = new Set<() => void>();

export function getApiStatus(): ApiStatus {
  return status;
}

export function subscribeApiStatus(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setStatus(next: ApiStatus): void {
  if (status === next) return;
  status = next;
  listeners.forEach((l) => {
    try {
      l();
    } catch {
      /* один подписчик не должен ломать остальных */
    }
  });
}

/* ── Запрос ──────────────────────────────────────────────────────── */

type RequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
  /** Добавить заголовок Authorization с сохранённым токеном. */
  auth?: boolean;
  query?: Record<string, string | number | undefined>;
  timeoutMs?: number;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth, query, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

  const url = new URL(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = readToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  // Таймаут обязателен: без него выключенный сервер оставляет кнопку
  // в состоянии «Отправляем…» навсегда.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    setStatus('offline');
    throw new ApiError('offline', 0);
  } finally {
    clearTimeout(timer);
  }

  setStatus('online');

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const data = payload as { error?: string; details?: unknown } | null;
    throw new ApiError(data?.error ?? 'request_failed', response.status, data?.details);
  }

  return payload as T;
}

/** Разовая проверка доступности сервера. Обновляет общий статус. */
export async function probeApi(timeoutMs = 3000): Promise<boolean> {
  try {
    await apiRequest<{ status?: string }>('/health', { timeoutMs });
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.isOffline) return false;
    // Ответ с ошибкой — сервер всё-таки на связи.
    return true;
  }
}

/** Человеческий текст ошибки — чтобы экраны не собирали его каждый сам. */
export function apiErrorText(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Что-то пошло не так. Попробуйте ещё раз.';
  const known: Record<string, string> = {
    offline: 'Сервер недоступен. Работаем в автономном режиме.',
    bad_phone: 'Проверьте номер телефона.',
    too_many_requests: 'Слишком много запросов кода. Попробуйте позже.',
    too_many_attempts: 'Слишком много попыток. Запросите новый код.',
    code_expired: 'Срок действия кода истёк. Запросите новый.',
    wrong_code: 'Неверный код.',
    unauthorized: 'Нужно войти заново.',
    not_found: 'Не найдено.',
    bad_request: 'Проверьте заполненные поля.',
    internal: 'Ошибка на сервере. Попробуйте позже.',
  };
  return known[error.code] ?? 'Что-то пошло не так. Попробуйте ещё раз.';
}
