import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../categories/core/AuthGate';
import { useLocale } from '../../../categories/core/LocaleStore';
import { LANGUAGE_NAMES, type LanguageCode } from '../../../categories/core/countries';
import { hasTranslation } from '../../../shared/i18n';
import { useT } from '../../../shared/i18n/useT';
import { getCategory } from '../../../categories/core/registry';
import { useApiStatus } from '../../../shared/api/useApiStatus';
import { closeListing, fetchMyListings, type ServerListing } from '../../../shared/api/listings';
import { apiErrorText } from '../../../shared/api/client';
import { BlockGuard } from '../../../components/safety/SafeBoundary';
import { safe } from '../../../components/safety/safeAction';
import {
  readWorkActions,
  removeWorkAction,
  WORK_ACTIONS_EVENT,
  type WorkActionRecord,
} from '../../work/model/WorkActionsStore';
import {
  deleteUserListing,
  loadUserListings,
  updateUserListing,
  type UserListing,
} from '../../listings/model/UserListingsStore';

type EditDraft = {
  id: string;
  title: string;
  price: string;
  /** Поле с ошибкой — подсветка не зависит от текста сообщения. */
  errorField: 'title' | 'price' | null;
  error: string;
};

function parsePrice(value: string) {
  const normalized = value.replace(/[\s\u00a0\u202f]/g, '').replace(',', '.');
  if (!normalized || !/^\d+(?:\.\d+)?$/.test(normalized)) return null;
  const price = Number(normalized);
  return Number.isFinite(price) && price >= 0 ? price : null;
}

export function AccountPage() {
  const { isSignedIn, isServerSession, identifier, signOut } = useAuth();
  const apiStatus = useApiStatus();
  const { country, resetCountry, language, setLanguage } = useLocale();
  const t = useT();
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(() => localStorage.getItem('nova.profile.name') || '');
  const [items, setItems] = useState<UserListing[]>(() => loadUserListings());
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [work, setWork] = useState<WorkActionRecord[]>(() => readWorkActions());
  /** Объявления с сервера — только для входа, подтверждённого сервером. */
  const [serverItems, setServerItems] = useState<ServerListing[]>([]);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (!isSignedIn || !isServerSession) {
      setServerItems([]);
      return;
    }
    let live = true;
    fetchMyListings()
      .then((items) => live && setServerItems(items))
      .catch((error) => live && setServerError(apiErrorText(error)));
    return () => {
      live = false;
    };
  }, [isSignedIn, isServerSession]);

  const reloadServerItems = () => {
    fetchMyListings()
      .then(setServerItems)
      .catch((error) => setServerError(apiErrorText(error)));
  };

  useEffect(() => {
    const refresh = () => setItems(loadUserListings());
    const refreshWork = () => setWork(readWorkActions());
    window.addEventListener('nova:user-listings', refresh);
    window.addEventListener(WORK_ACTIONS_EVENT, refreshWork);
    return () => {
      window.removeEventListener('nova:user-listings', refresh);
      window.removeEventListener(WORK_ACTIONS_EVENT, refreshWork);
    };
  }, []);

  /** Отклики на вакансии и приглашения кандидатам — из карточек «Работы». */
  const workPanel = (
    <BlockGuard name={t('account.work')}>
      <div className="panel" style={{ marginTop: 16 }}>
        <h3>{t('account.work')}</h3>
        {work.length === 0 ? (
          <p className="nova-muted">{t('account.noWork')}</p>
        ) : work.map((record) => (
          <article className="account-listing" key={record.id}>
            <strong>{record.title}</strong>
            <p className="nova-muted">
              {record.kind === 'response' ? t('account.response') : t('account.invite')} ·{' '}
              {new Date(record.createdAt).toLocaleDateString(country?.locale ?? 'ru-RU')}
            </p>
            <div className="account-listing-actions">
              <Link
                className="secondary-action"
                to={`${getCategory(record.categoryId)?.path ?? `/${record.categoryId}`}/item/${record.itemId}`}
              >
                {t('app.open')}
              </Link>
              <button
                className="secondary-action"
                onClick={safe(t('work.cancel'), () => removeWorkAction(record.kind, record.itemId))}
              >
                {t('work.cancel')}
              </button>
            </div>
          </article>
        ))}
      </div>
    </BlockGuard>
  );

  const countryPanel = (
    <div className="panel" style={{ marginTop: 16 }}>
      <h3>{t('account.country')}</h3>
      <p className="nova-muted">
        {country ? `${country.flag} ${country.nativeName} · ${country.currency}` : ''}
      </p>
      {/* Язык интерфейса: по умолчанию язык страны, но человек может выбрать
          любой из языков этой страны. Выбор сохраняется вместе со страной. */}
      {country && country.languages.length > 1 && (
        <label className="nova-field">
          <span>{t('account.language')}</span>
          <select
            value={language}
            onChange={(event) => safe(t('account.language'), () => setLanguage(event.target.value as LanguageCode))()}
          >
            {country.languages.map((code) => (
              <option key={code} value={code}>
                {LANGUAGE_NAMES[code]}
                {hasTranslation(code) ? '' : ' · English'}
              </option>
            ))}
          </select>
        </label>
      )}
      <button className="secondary-action" onClick={safe(t('account.changeCountry'), () => resetCountry())}>
        {t('account.changeCountry')}
      </button>
    </div>
  );

  if (!isSignedIn) {
    return (
      <main className="page narrow">
        <h1>{t('account.title')}</h1>
        <Link className="primary-action" to="/login">{t('nav.login')}</Link>
        <BlockGuard name={t('account.country')}>{countryPanel}</BlockGuard>
      </main>
    );
  }

  const startEdit = (item: UserListing) => {
    setDeleteId(null);
    setEditDraft({ id: item.id, title: item.title, price: String(item.price), errorField: null, error: '' });
  };

  const saveEdit = () => {
    if (!editDraft) return;
    const title = editDraft.title.trim();
    const price = parsePrice(editDraft.price);
    if (!title) {
      setEditDraft({ ...editDraft, errorField: 'title', error: t('account.needTitle') });
      return;
    }
    if (price === null) {
      setEditDraft({ ...editDraft, errorField: 'price', error: t('account.needPrice') });
      return;
    }
    updateUserListing(editDraft.id, { title, price });
    setEditDraft(null);
  };

  return (
    <main className="page">
      <h1>{t('account.title')}</h1>
      <BlockGuard name={t('account.profile')}>
      <div className="panel">
        <h3>{t('account.profile')}</h3>
        <label className="nova-field">
          <span>{t('account.name')}</span>
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <p className="nova-muted">{identifier}</p>
        <div className="nova-actions-row">
          <button
            className="primary-action"
            onClick={safe(t('app.save'), () => {
              try { localStorage.setItem('nova.profile.name', name.trim()); } catch { /* хранилище недоступно */ }
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            })}
          >
            {saved ? t('app.saved') : t('app.save')}
          </button>
          <button className="secondary-action" onClick={safe(t('account.signOut'), signOut)}>{t('account.signOut')}</button>
        </div>
      </div>
      </BlockGuard>

      <BlockGuard name={t('account.listings')}>
      <div className="panel account-listings">
        <h3>{t('account.listings')}</h3>
        {apiStatus === 'offline' && (
          <p className="nova-note">{t('account.offline')}</p>
        )}
        {serverError && <p className="nova-error">{serverError}</p>}
        {serverItems.map((item) => (
          <article className="account-listing" key={item.id}>
            <strong>{item.title}</strong>
            <p className="nova-muted">
              {Number(item.price).toLocaleString(country?.locale ?? 'ru-RU')} {item.currency} ·{' '}
              {item.status === 'active' ? t('account.statusActive') : item.status === 'moderation' ? t('account.statusModeration') : t('account.statusClosed')} · {t('account.onServer')}
            </p>
            {item.status !== 'closed' && (
              <div className="account-listing-actions">
                <button
                  className="secondary-action"
                  onClick={safe(t('account.close'), () => {
                    setServerError('');
                    closeListing(item.id)
                      .then(reloadServerItems)
                      .catch((error) => setServerError(apiErrorText(error)));
                  })}
                >
                  {t('account.close')}
                </button>
              </div>
            )}
          </article>
        ))}
        {items.length === 0 && serverItems.length === 0 ? (
          <p className="nova-muted">{t('account.noListings')}</p>
        ) : items.map((item) => {
          const isEditing = editDraft?.id === item.id;
          const isDeleting = deleteId === item.id;
          return (
            <BlockGuard key={item.id} name={t('published.listingWord')}>
            <article className="account-listing">
              {isEditing && editDraft ? (
                <div className="account-listing-edit">
                  <div className="nova-field-row">
                    <label className="nova-field">
                      <span>{t('shorts.name')}</span>
                      <input
                        autoFocus
                        value={editDraft.title}
                        aria-invalid={editDraft.errorField === 'title' || undefined}
                        onChange={(event) => setEditDraft({ ...editDraft, title: event.target.value, errorField: null, error: '' })}
                      />
                    </label>
                    <label className="nova-field">
                      <span>{t('listing.price')}</span>
                      <input
                        inputMode="decimal"
                        value={editDraft.price}
                        aria-invalid={editDraft.errorField === 'price' || undefined}
                        onChange={(event) => setEditDraft({ ...editDraft, price: event.target.value, errorField: null, error: '' })}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') saveEdit();
                          if (event.key === 'Escape') setEditDraft(null);
                        }}
                      />
                    </label>
                  </div>
                  {editDraft.error && <p className="nova-error" role="alert">{editDraft.error}</p>}
                  <div className="account-listing-actions">
                    <button className="primary-action" onClick={safe(t('app.save'), saveEdit)}>{t('app.save')}</button>
                    <button className="secondary-action" onClick={safe(t('app.cancel'), () => setEditDraft(null))}>{t('app.cancel')}</button>
                  </div>
                </div>
              ) : (
                <>
                  <strong>{item.title}</strong>
                  <p className="nova-muted">
                    {Number(item.price).toLocaleString(country?.locale ?? 'ru-RU')} {item.currency} ·{' '}
                    {item.status === 'active' ? t('account.statusActive') : t('account.statusPaused')}
                  </p>
                  {isDeleting ? (
                    <div className="account-delete-confirm" role="group" aria-label={t('account.deleteConfirmLabel')}>
                      <p>{t('account.confirmDelete', { title: item.title })}</p>
                      <div className="account-listing-actions">
                        <button
                          className="danger-action"
                          onClick={safe(t('app.delete'), () => {
                            deleteUserListing(item.id);
                            setDeleteId(null);
                          })}
                        >
                          {t('app.delete')}
                        </button>
                        <button className="secondary-action" onClick={() => setDeleteId(null)}>{t('app.cancel')}</button>
                      </div>
                    </div>
                  ) : (
                    <div className="account-listing-actions">
                      <button className="secondary-action" onClick={safe(t('app.edit'), () => startEdit(item))}>{t('app.edit')}</button>
                      <button
                        className="secondary-action"
                        onClick={safe(t('account.statusAction'), () => updateUserListing(item.id, { status: item.status === 'active' ? 'paused' : 'active' }))}
                      >
                        {item.status === 'active' ? t('account.pause') : t('account.publish')}
                      </button>
                      <button
                        className="secondary-action"
                        onClick={safe(t('app.delete'), () => {
                          setEditDraft(null);
                          setDeleteId(item.id);
                        })}
                      >
                        {t('app.delete')}
                      </button>
                    </div>
                  )}
                </>
              )}
            </article>
            </BlockGuard>
          );
        })}
      </div>
      </BlockGuard>
      {workPanel}
      <BlockGuard name={t('account.country')}>{countryPanel}</BlockGuard>
    </main>
  );
}
