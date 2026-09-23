import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../categories/core/AuthGate';
import { safe } from '../../../components/safety/safeAction';
import { useT } from '../../../shared/i18n/useT';
import type { TranslationKey } from '../../../shared/i18n';

/**
 * Поддержка.
 *
 * Раньше здесь была одна мёртвая кнопка «Написать специалисту». Кнопка,
 * которая ничего не делает, хуже её отсутствия: человек приходит сюда,
 * когда у него уже что-то не получилось.
 *
 * Пока нет канала связи, экран честно говорит об этом и делает то, что
 * может: отвечает на частые вопросы и принимает обращение.
 */

/** Частые вопросы хранятся ключами — тексты живут в словарях. */
const TOPICS: { q: TranslationKey; a: TranslationKey }[] = [
  { q: 'support.q1', a: 'support.a1' },
  { q: 'support.q2', a: 'support.a2' },
  { q: 'support.q3', a: 'support.a3' },
  { q: 'support.q4', a: 'support.a4' },
];

export function SupportPage() {
  const t = useT();
  const { isSignedIn, identifier } = useAuth();
  const [open, setOpen] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function send() {
    // Правило доступа: написать в поддержку может и гость — именно гость
    // чаще всего не может войти и ищет помощь.
    if (message.trim().length < 10) return;
    // MVP работает автономно: сохраняем обращение локально, чтобы оно не
    // пропадало при перезагрузке. Серверную синхронизацию можно подключить позже.
    try {
      const key = 'nova.support.tickets';
      const prev = JSON.parse(localStorage.getItem(key) ?? '[]');
      const tickets = Array.isArray(prev) ? prev : [];
      tickets.push({ id: `local-${Date.now()}`, message: message.trim(), author: isSignedIn ? identifier || 'user' : 'guest', createdAt: new Date().toISOString(), status: 'new' });
      localStorage.setItem(key, JSON.stringify(tickets));
    } catch {}
    setSent(true);
  }

  return (
    <main className="page narrow">
      <h1>{t('support.titleFull')}</h1>

      <div className="panel">
        <span className="eyebrow">{t('support.faq')}</span>
        <div className="nova-faq">
          {TOPICS.map((topic, i) => (
            <div className="nova-faq-item" key={topic.q}>
              <button
                className="nova-faq-question"
                onClick={() => setOpen(open === i ? null : i)}
                type="button"
                aria-expanded={open === i}
              >
                <span>{t(topic.q)}</span>
                <b>{open === i ? '−' : '+'}</b>
              </button>
              {open === i && <p className="nova-faq-answer">{t(topic.a)}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <span className="eyebrow">{t('support.noAnswer')}</span>
        <h2>{t('support.writeUs')}</h2>

        {sent ? (
          <>
            <p>
              {t('support.savedLocal')}
            </p>
            <Link className="primary-action" to="/">
              {t('app.toHome')}
            </Link>
          </>
        ) : (
          <>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('support.placeholderFull')}
            />
            <p className="nova-hint">
              {isSignedIn
                ? t('support.hintSignedIn')
                : t('support.guest')}
            </p>
            <button
              className="primary-action"
              onClick={safe(t('support.send'), send)}
              disabled={message.trim().length < 10}
              type="button"
            >
              {t('support.send')}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
