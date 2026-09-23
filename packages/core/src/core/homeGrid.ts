import { getCategory } from './registry';

/**
 * Канонический набор плиток главного экрана.
 *
 * В исходных схемах сетка отличалась на каждом макете: где-то «Детское»,
 * где-то «Хобби и отдых», разный порядок и разное число плиток. Здесь она
 * описана один раз, и все экраны берут её отсюда.
 *
 * Плитка ведёт в категорию, только если та реально поднялась в реестре.
 * Незарегистрированная категория остаётся видимой, но помечается как
 * готовящаяся — вместо перехода в тупик.
 */

export type HomeTile = {
  /** id категории в реестре, если она уже реализована. */
  categoryId?: string;
  icon: string;
  label: string;
};

export const HOME_TILES: HomeTile[] = [
  { categoryId: 'realty', icon: 'home', label: 'Недвижимость' },
  { categoryId: 'auto', icon: 'car', label: 'Авто' },
  { categoryId: 'home', icon: 'sofa', label: 'Для дома' },
  { categoryId: 'services', icon: 'services', label: 'Услуги' },
  { categoryId: 'work', icon: 'work', label: 'Работа' },
  { categoryId: 'electronics', icon: 'electronics', label: 'Электроника' },
  { categoryId: 'personal', icon: 'more', label: 'Личные вещи' },
  { categoryId: 'hobby', icon: 'hobby', label: 'Хобби и отдых' },
  { categoryId: 'pets', icon: 'more', label: 'Животные' },
  { categoryId: 'travel', icon: 'more', label: 'Путешествия' },
  { categoryId: 'kids', icon: 'more', label: 'Детское' },
  { icon: 'more', label: 'Ещё' },
];

export type ResolvedTile = HomeTile & { to: string; available: boolean };

export function resolveHomeTiles(): ResolvedTile[] {
  return HOME_TILES.map((tile) => {
    const category = tile.categoryId ? getCategory(tile.categoryId) : undefined;
    return {
      ...tile,
      to: category ? category.path : '/search',
      // Плитка без categoryId (например, «Все категории») ведёт в поиск и
      // работает всегда — «скоро» относится только к настоящей категории,
      // которая не поднялась в реестре.
      available: Boolean(category) || !tile.categoryId,
    };
  });
}
