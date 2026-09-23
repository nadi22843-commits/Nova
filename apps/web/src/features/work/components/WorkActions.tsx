import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../categories/core/AuthGate';
import type { CatalogItem } from '../../../categories/core/catalogData';
import { getCategory } from '../../../categories/core/registry';
import { pushNotification } from '../../notifications/NotificationStore';
import { ActionGuard } from '../../../components/safety/SafeBoundary';
import { safe } from '../../../components/safety/safeAction';
import {
  addWorkAction,
  findWorkAction,
  removeWorkAction,
  WORK_ACTIONS_EVENT,
  type WorkActionKind,
} from '../model/WorkActionsStore';
import { useT } from '../../../shared/i18n/useT';

/**
 * Действия в карточке «Работы».
 *
 * Вакансия: «Откликнуться», «Написать работодателю».
 * Резюме:   «Пригласить на собеседование», «Написать кандидату».
 *
 * Подключается к общей карточке объявления через реестр действий категорий
 * (categories/ui/detailActions.tsx). Каждая кнопка — под своим предохранителем.
 * Отклик, приглашение и переписка — только после входа.
 */
export function WorkActions({ item }: { item: CatalogItem }) {
  const t = useT();
  const navigate = useNavigate();
  const { requireAuth } = useAuth();

  const isVacancy = item.deal === 'vacancy';
  const kind: WorkActionKind = isVacancy ? 'response' : 'invite';
  const isOwn = (item as { owner?: boolean }).owner === true;

  const [done, setDone] = useState(() => Boolean(findWorkAction(kind, item.id)));

  // Статус меняется и с других экранов (отмена в кабинете) — слушаем событие.
  useEffect(() => {
    const refresh = () => setDone(Boolean(findWorkAction(kind, item.id)));
    refresh();
    window.addEventListener(WORK_ACTIONS_EVENT, refresh);
    return () => window.removeEventListener(WORK_ACTIONS_EVENT, refresh);
  }, [kind, item.id]);

  // Резюме и вакансии — только эти два вида. Остальное здесь не показываем.
  if (item.deal !== 'vacancy' && item.deal !== 'resume') return null;

  const path = getCategory(item.categoryId)?.path ?? `/${item.categoryId}`;
  const itemHref = `${path}/item/${item.id}`;

  function openChat(draft?: string) {
    if (!requireAuth('contact')) return;
    navigate(`/chat/${item.id}`, { state: draft ? { draft } : undefined });
  }

  function respond() {
    if (!requireAuth('respond')) return;
    const { created } = addWorkAction('response', item);
    if (created) pushNotification(t('work.responseSent'), t('work.responseSentBody', { title: item.title }), itemHref);
    setDone(true);
  }

  function invite() {
    if (!requireAuth('respond')) return;
    const { created } = addWorkAction('invite', item);
    if (created) pushNotification(t('work.inviteSent'), t('work.inviteSentBody', { title: item.title }), itemHref);
    setDone(true);
    openChat(t('work.inviteDraft', { title: item.title }));
  }

  function cancel() {
    removeWorkAction(kind, item.id);
    setDone(false);
  }

  if (isOwn) {
    return <p className="nova-note">{t('work.own')}</p>;
  }

  return (
    <>
      {done && (
        <div className="work-success">
          <b>✓ {isVacancy ? t('work.responseSent') : t('work.inviteSent')}</b>
          <p>{t('work.statusNote')}</p>
        </div>
      )}

      <div className="nova-actions-row" style={{ marginTop: 12 }}>
        {isVacancy ? (
          <>
            {!done && (
              <ActionGuard name={t('work.respond')}>
                <button className="primary-action" type="button" onClick={safe(t('work.respond'), respond)}>
                  {t('work.respond')}
                </button>
              </ActionGuard>
            )}
            <ActionGuard name={t('work.messageEmployer')}>
              <button className="secondary-action" type="button" onClick={safe(t('work.messageEmployer'), () => openChat())}>
                {t('work.messageEmployer')}
              </button>
            </ActionGuard>
          </>
        ) : (
          <>
            {!done && (
              <ActionGuard name={t('work.invite')}>
                <button className="primary-action" type="button" onClick={safe(t('work.invite'), invite)}>
                  {t('work.invite')}
                </button>
              </ActionGuard>
            )}
            <ActionGuard name={t('work.messageCandidate')}>
              <button className="secondary-action" type="button" onClick={safe(t('work.messageCandidate'), () => openChat())}>
                {t('work.messageCandidate')}
              </button>
            </ActionGuard>
          </>
        )}

        {done && (
          <ActionGuard nameKey="work.cancel">
            <button className="secondary-action" type="button" onClick={safe(t('work.cancel'), cancel)}>
              {isVacancy ? t('work.cancelResponse') : t('work.cancelInvite')}
            </button>
          </ActionGuard>
        )}
      </div>
    </>
  );
}
