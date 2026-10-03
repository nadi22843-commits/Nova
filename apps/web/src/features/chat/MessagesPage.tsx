import { Link } from 'react-router-dom';
import { findItem } from '../../categories/core/catalogData';

export function MessagesPage(){
  const ids = Object.keys(localStorage).filter((k) => k.startsWith('nova.chat.') && k.endsWith('.v1')).map((k) => k.slice('nova.chat.'.length, -3));
  return <main className="feature-page"><h1>Сообщения</h1><section className="panel messages-list">
    {ids.length === 0 ? <p className="nova-muted">Диалогов пока нет. Откройте объявление и нажмите «Написать».</p> : ids.map((id) => {
      const item = findItem(id);
      return <Link key={id} to={`/chat/${id}`} className="message-row"><b>{item?.title ?? 'Объявление'}</b><span>Открыть диалог ›</span></Link>;
    })}
  </section></main>;
}
