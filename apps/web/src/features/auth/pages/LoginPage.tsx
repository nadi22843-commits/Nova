import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../categories/core/AuthGate';
import { useLocale } from '../../../categories/core/LocaleStore';
import { safe } from '../../../components/safety/safeAction';
import { ApiError, apiErrorText } from '../../../shared/api/client';
import { normalizePhone, requestCode, verifyCode } from '../../../shared/api/auth';
import { useT } from '../../../shared/i18n/useT';
import type { TranslationKey } from '../../../shared/i18n';

/**
 * Вход по телефону и одноразовому коду — так же, как на сервере.
 *
 * Пароля нет намеренно: код в SMS снимает целый класс проблем (забытые и
 * повторно использованные пароли). При разработке код печатается в журнал API.
 *
 * Если сервер выключен, экран не превращается в тупик: предлагается
 * автономный вход, при котором объявления и избранное живут в браузере.
 *
 * Экран помнит, ради какого действия его открыли, и возвращает туда же.
 */
export function LoginPage() {
  const t = useT();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { country } = useLocale();
  const { state } = useLocation() as { state?: { returnTo?: string; reasonKey?: TranslationKey } };

  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [offline, setOffline] = useState(false);
  const [busy, setBusy] = useState(false);

  const returnTo = state?.returnTo ?? '/account';

  async function sendCode(e?: FormEvent) {
    e?.preventDefault();
    setError('');
    const normalized = normalizePhone(phone);
    if (!normalized) {
      setError(t('login.badPhone', { example: country?.phoneCode ? `${country.phoneCode} 999 123-45-67` : '+7 999 123-45-67' }));
      return;
    }
    setBusy(true);
    try {
      const { expiresInMinutes } = await requestCode(normalized);
      setPhone(normalized);
      setStep('code');
      setNote(t('login.codeSent', { phone: normalized, minutes: expiresInMinutes }));
    } catch (err) {
      setError(apiErrorText(err));
      if (err instanceof ApiError && err.isOffline) setOffline(true);
    } finally {
      setBusy(false);
    }
  }

  async function confirmCode(e?: FormEvent) {
    e?.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(code.trim())) {
      setError(t('login.badCode'));
      return;
    }
    setBusy(true);
    try {
      const { token, user } = await verifyCode(phone, code.trim(), country?.code);
      signIn(user.name || user.phone, token);
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(apiErrorText(err));
      if (err instanceof ApiError && err.isOffline) setOffline(true);
    } finally {
      setBusy(false);
    }
  }

  /** Автономный вход: без сервера, всё хранится в браузере. */
  function signInOffline() {
    signIn(normalizePhone(phone) ?? phone.trim() ?? '');
    navigate(returnTo, { replace: true });
  }

  return (
    <main className="page narrow">
      <h1>{t('login.title')}</h1>
      {state?.reasonKey && <p className="nova-note">{t('login.reason', { action: t(state.reasonKey) })}</p>}

      {step === 'phone' ? (
        <form className="form-card" onSubmit={safe(t('login.getCode'), sendCode)}>
          <input
            placeholder={t('login.phone', { example: country?.phoneCode ? `${country.phoneCode} 999 123-45-67` : '+7 999 123-45-67' })}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
          />
          {error && <p className="nova-error">{error}</p>}
          <button className="primary-action" type="submit" disabled={busy}>
            {busy ? t('login.sending') : t('login.getCode')}
          </button>
        </form>
      ) : (
        <form className="form-card" onSubmit={safe(t('nav.login'), confirmCode)}>
          {note && <p className="nova-note">{note}</p>}
          <input
            placeholder={t('login.code')}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
          />
          {error && <p className="nova-error">{error}</p>}
          <button className="primary-action" type="submit" disabled={busy}>
            {busy ? t('login.checking') : t('nav.login')}
          </button>
          <button
            className="secondary-action"
            type="button"
            onClick={safe(t('login.changePhone'), () => {
              setStep('phone');
              setCode('');
              setError('');
            })}
          >
            {t('login.changePhone')}
          </button>
        </form>
      )}

      {offline && (
        <div className="nova-note">
          {t('login.offlineNote')}
          <div className="nova-actions-row" style={{ marginTop: 12 }}>
            <button className="secondary-action" type="button" onClick={safe(t('login.offlineSignIn'), signInOffline)}>
              {t('login.offlineAction')}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
