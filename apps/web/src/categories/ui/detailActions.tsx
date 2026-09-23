import type { ComponentType } from 'react';
import type { CatalogItem } from '../core/catalogData';
import { WorkActions } from '../../features/work/components/WorkActions';
import type { TranslationKey } from '../../shared/i18n';

/**
 * Дополнительные действия карточки объявления по категориям.
 *
 * Общая карточка (DetailPage) не содержит ветвлений по названию категории:
 * она спрашивает этот реестр. Чтобы добавить категории свои кнопки — одна
 * строка здесь. Блок подключается под отдельным предохранителем: его сбой
 * не ломает карточку и другие категории.
 */
export type DetailActionsComponent = ComponentType<{ item: CatalogItem }>;

const DETAIL_ACTIONS: Record<string, { nameKey: TranslationKey; component: DetailActionsComponent; replacesMessage?: boolean }> = {
  // «Работа»: вместо общего «Написать» — «Написать работодателю / кандидату».
  work: { nameKey: 'work.detailActions', component: WorkActions, replacesMessage: true },
};

export function getDetailActions(categoryId: string) {
  return DETAIL_ACTIONS[categoryId];
}
