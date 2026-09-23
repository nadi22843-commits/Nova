import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { safe } from '../../components/safety/safeAction';
import { findItem } from '../../categories/core/catalogData';
import { useAuth } from '../../categories/core/AuthGate';
import { useT } from '../../shared/i18n/useT';
import { useCatalogVersion } from '../../shared/api/useServerCatalog';

type Msg = { id: string; text: string; at: string; mine: boolean };
const key = (id: string) => `nova.chat.${id}.v1`;
function read(id: string): Msg[] {
  try {
    const x = JSON.parse(localStorage.getItem(key(id)) || '[]');
    return Array.isArray(x) ? x : [];
  } catch {
    return [];
  }
}

export function ChatPage() {
  const t = useT();
  const { listingId = '' } = useParams();
  const nav = useNavigate();
  const { isSignedIn, requireAuth } = useAuth();
  const catalogVersion = useCatalogVersion();
  const item = useMemo(() => findItem(listingId), [listingId, catalogVersion]);
  const [messages, setMessages] = useState<Msg[]>(() => read(listingId));
  // Готовый текст (например, приглашение на собеседование) приходит в state перехода.
  const { state } = useLocation() as { state?: { draft?: string } };
  const [text, setText] = useState(() => (typeof state?.draft === 'string' ? state.draft : ''));

  // Правило доступа: переписка с продавцом — только после входа.
  // Кнопка «Написать» это проверяла, но прямая ссылка /chat/:id — нет.
  useEffect(() => {
    if (!isSignedIn) requireAuth('contact', { replace: true });
  }, [isSignedIn, requireAuth]);

  // Переход между диалогами без размонтирования не должен показывать
  // сообщения предыдущего объявления.
  useEffect(() => {
    setMessages(read(listingId));
  }, [listingId]);

  function send(e: FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    const next = [...messages, { id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text: value, at: new Date().toISOString(), mine: true }];
    setMessages(next);
    try {
      localStorage.setItem(key(listingId), JSON.stringify(next));
    } catch {
      /* хранилище переполнено или запрещено — сообщение останется до перезагрузки */
    }
    setText('');
  }

  if (!isSignedIn) return <main className="feature-page"><section className="work-panel"><p className="nova-muted">{t('chat.opening')}</p></section></main>;

  if (!item) return <main className="feature-page"><section className="work-panel nova-empty"><h1>{t('listing.notFound')}</h1><button className="primary-action" onClick={() => nav(-1)}>{t('app.back')}</button></section></main>;

  return <main className="feature-page"><section className="work-panel"><button className="nova-back" onClick={safe(t('app.back'), () => nav(-1))}>‹ {t('app.back')}</button><h1>{t('chat.title')}</h1><p className="nova-muted">{item.title} · {item.seller.name}</p><div className="nova-chat-list">{messages.length === 0 ? <p className="nova-note">{t('chat.first')}</p> : messages.map(m => <div className={m.mine ? 'nova-chat-message mine' : 'nova-chat-message'} key={m.id}>{m.text}<small>{new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></div>)}</div><form className="nova-chat-form" onSubmit={safe(t('chat.send'), send)}><input value={text} onChange={e => setText(e.target.value)} maxLength={1000} placeholder={t('chat.placeholder')} /><button className="primary-action" type="submit">{t('chat.send')}</button></form></section></main>;
}
