import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { readToken, writeToken } from '../../shared/api/client';
import type { TranslationKey } from '../../shared/i18n';
import { logoutOnServer } from '../../shared/api/auth';

/**
 * Точки входа.
 *
 * В исходных схемах авторизации не было ни в одном пути, хотя отклик, публикация
 * и связь с продавцом её требуют. Здесь она вынесена в одно место: экран сам не
 * решает, авторизован ли пользователь, он просто вызывает requireAuth.
 */

export type AuthAction = 'publish' | 'contact' | 'respond' | 'favorite' | 'shorts';

/** Причина показывается на экране входа и переводится там же. */
const ACTION_TEXT: Record<AuthAction, TranslationKey> = {
  publish: 'auth.action.publish',
  contact: 'auth.action.contact',
  respond: 'auth.action.respond',
  favorite: 'auth.action.favorite',
  shorts: 'auth.action.shorts',
};

type AuthContextValue = {
  isSignedIn: boolean;
  /** token — сессия сервера; без него вход считается автономным. */
  signIn: (identifier?: string, token?: string) => void;
  /** true — вход подтверждён сервером, запросы уходят с токеном. */
  isServerSession: boolean;
  identifier: string;
  signOut: () => void;
  /** Возвращает true, если действие можно продолжать. Иначе уводит на вход. */
  requireAuth: (action: AuthAction, options?: { replace?: boolean }) => boolean;
};

const AuthContext = createContext<AuthContextValue>({
  isSignedIn: false,
  isServerSession: false,
  signIn: () => {},
  identifier: '',
  signOut: () => {},
  requireAuth: () => true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isSignedIn, setSignedIn] = useState(() => { try { return localStorage.getItem('nova.auth') === '1'; } catch { return false; } });
  const [identifier, setIdentifier] = useState(() => { try { return localStorage.getItem('nova.auth.identifier') ?? ''; } catch { return ''; } });
  const [isServerSession, setServerSession] = useState(() => Boolean(readToken()));
  const navigate = useNavigate();
  const location = useLocation();

  const requireAuth = useCallback(
    (action: AuthAction, options?: { replace?: boolean }) => {
      if (isSignedIn) return true;
      // replace — для защитных редиректов при входе на экран: иначе «Назад»
      // со страницы входа снова открывает закрытый экран и опять уводит на вход.
      navigate('/login', {
        replace: options?.replace,
        state: { returnTo: location.pathname + location.search, reasonKey: ACTION_TEXT[action] },
      });
      return false;
    },
    [isSignedIn, navigate, location],
  );

  const signIn = useCallback((id = '', token?: string) => {
    if (token) writeToken(token);
    setServerSession(Boolean(token));
    setSignedIn(true);
    setIdentifier(id);
    try {
      localStorage.setItem('nova.auth', '1');
      if (id) localStorage.setItem('nova.auth.identifier', id);
    } catch {
      /* хранилище запрещено — вход проживёт до перезагрузки */
    }
  }, []);

  const signOut = useCallback(() => {
    // Сессию на сервере закрываем, но выход на устройстве происходит в любом случае.
    if (readToken()) void logoutOnServer();
    else writeToken('');
    setServerSession(false);
    setSignedIn(false);
    setIdentifier('');
    try {
      localStorage.removeItem('nova.auth');
      localStorage.removeItem('nova.auth.identifier');
    } catch {
      /* хранилище запрещено */
    }
  }, []);

  const value = useMemo(
    () => ({ isSignedIn, isServerSession, identifier, signIn, signOut, requireAuth }),
    [isSignedIn, isServerSession, identifier, signIn, signOut, requireAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
