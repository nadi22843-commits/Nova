/**
 * Предохранитель для обработчиков кнопок.
 *
 * Границы ошибок React (SafeBoundary) ловят только сбои отрисовки. Ошибка
 * внутри onClick до них не доходит: кнопка просто «молчит», а человек не
 * понимает, что произошло. Здесь обработчик выполняется под защитой:
 * сбой логируется, пользователь видит короткое сообщение, остальной экран
 * продолжает работать.
 *
 * Файл без React — его можно проверять обычными тестами в Node.
 */

export type ActionErrorDetail = { action: string };

export const ACTION_ERROR_EVENT = 'nova:action-error';

/** Сообщает об ошибке действия: консоль + событие для всплывающего уведомления. */
export function reportActionError(action: string, error: unknown): void {
  console.error(`[Nova/action] «${action}» не выполнено`, error);
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      // Текст собирается в ActionErrorNotice: там доступен выбранный язык.
      const detail: ActionErrorDetail = { action };
      window.dispatchEvent(new CustomEvent<ActionErrorDetail>(ACTION_ERROR_EVENT, { detail }));
    }
  } catch {
    /* уведомление — не критично */
  }
}

/**
 * Выполняет действие под защитой. Поддерживает и обычные, и async-функции.
 * Возвращает результат действия или undefined при сбое.
 */
export function runSafely<T>(
  action: string,
  fn: () => T,
  onError: (error: unknown) => void = (error) => reportActionError(action, error),
): T | undefined {
  try {
    const result = fn();
    if (result && typeof (result as unknown as Promise<unknown>).then === 'function') {
      (result as unknown as Promise<unknown>).catch((error) => onError(error));
    }
    return result;
  } catch (error) {
    onError(error);
    return undefined;
  }
}

/**
 * Оборачивает обработчик: `onClick={safe('Позвонить', () => contact('call'))}`.
 * Аргументы (например, событие формы) передаются как есть.
 */
export function safe<A extends unknown[]>(action: string, fn: (...args: A) => unknown) {
  return (...args: A): void => {
    runSafely(action, () => fn(...args));
  };
}
