import { useEffect, useState } from 'react';
import { ACTION_ERROR_EVENT, type ActionErrorDetail } from './safeAction';
import { useT } from '../../shared/i18n/useT';

/**
 * Короткое уведомление о несработавшей кнопке.
 * Показывается поверх экрана на несколько секунд и не блокирует работу.
 */
export function ActionErrorNotice() {
  const t = useT();
  const [message, setMessage] = useState('');

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onError = (event: Event) => {
      const detail = (event as CustomEvent<ActionErrorDetail>).detail;
      setMessage(t('error.action', { action: detail?.action ?? '' }));
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setMessage(''), 5000);
    };
    window.addEventListener(ACTION_ERROR_EVENT, onError);
    return () => {
      window.removeEventListener(ACTION_ERROR_EVENT, onError);
      if (timer) clearTimeout(timer);
    };
  }, [t]);

  if (!message) return null;
  return (
    <div className="nova-action-toast" role="alert" onClick={() => setMessage('')}>
      {message}
    </div>
  );
}
