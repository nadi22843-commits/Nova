import { registerReference } from '../registry';

/**
 * Регистрация справочников.
 *
 * Каждый — отдельный динамический импорт, то есть отдельный чанк. Он грузится
 * только когда человек открыл форму или фильтр, где это поле есть. Человек,
 * зашедший продать диван, не скачивает справочник из 386 автомобильных записей.
 *
 * Чтобы добавить справочник: создать файл в этой папке и дописать строку ниже.
 * Поле начинает им пользоваться через `reference: '<имя>'`.
 */
export function initReferences(): void {
  registerReference('auto-brands', () => import('./auto-brands'));
  registerReference('moto-brands', () => import('./moto-brands'));
  registerReference('electronics-brands', () => import('./electronics-brands'));
  registerReference('appliance-brands', () => import('./appliance-brands'));
  registerReference('pet-breeds', () => import('./pet-breeds'));
  registerReference('clothing-brands', () => import('./clothing-brands'));
  registerReference('professions', () => import('./professions'));
}
