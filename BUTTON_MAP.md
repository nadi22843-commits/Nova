# Nova — карта кнопок

| Что видно пользователю | Кнопка / компонент | Страница / логика |
|---|---|---|
| Поиск | `features/search/components/SearchButton.tsx` | `features/search/pages/SearchPage.tsx` |
| Shorts | `features/shorts/components/ShortsButton.tsx` | `features/shorts/pages/ShortsPage.tsx` |
| Избранное в шапке | `features/favorites/components/FavoritesButton.tsx` | `features/favorites/pages/FavoritesPage.tsx` |
| Сердце на карточке | `features/favorites/components/FavoriteButton.tsx` | `features/favorites/model/FavoritesStore.tsx` |
| Корзина в шапке | `features/cart/components/CartButton.tsx` | `features/cart/pages/CartPage.tsx` |
| В корзину | `features/cart/components/AddToCartButton.tsx` | `features/cart/model/CartStore.tsx` |
| Личный кабинет | `features/auth/components/LoginButton.tsx` | `features/auth/pages/LoginPage.tsx` |
| Разместить | `features/publish/components/PublishButton.tsx` | `features/publish/pages/PublishPage.tsx` |
| Поддержка | `features/support/components/SupportButton.tsx` | `features/support/pages/SupportPage.tsx` |
| Страна | `features/location/components/CountrySelector.tsx` | локальное состояние, позже API географии |
| Язык | `features/i18n/components/LanguageSelector.tsx` | локальное состояние, позже словари i18n |

Правило: название функции + назначение файла. Никаких `button2`, `handler-new`, `final-final`.


## Header v3
В верхней навигации: Shorts, Избранное, Корзина, Личный кабинет, Разместить объявление. Пункт «Сообщения» удалён по решению продукта. Иконки собраны в `apps/web/src/components/ui/NovaIcon.tsx`.

## Работа (общий шаблон категорий)
- Главная → Работа (`/work`) → «Найти работу / Найти сотрудника / Разместить вакансию / Разместить резюме».
- Списки, фильтры, карточка, мастер — общие экраны `categories/ui/*`, поля — `packages/core/src/work`.
- Кнопки карточки «Работы» — `features/work/components/WorkActions.tsx`, данные — `features/work/model/WorkActionsStore.ts`.
  - Вакансия: «Откликнуться», «Написать работодателю», «Отменить отклик».
  - Резюме: «Пригласить на собеседование» (открывает чат с готовым текстом), «Написать кандидату», «Отменить приглашение».
  - Всё — только после входа. Список откликов и приглашений — в «Личном кабинете».
- Подключение к карточке — реестр `categories/ui/detailActions.tsx` (без ветвлений по названию категории).
- Старый отдельный модуль `features/work` (свои страницы вакансий/резюме) удалён: он не был подключён ни к одному маршруту.

## Личный кабинет
- Редактирование объявления — прямо в карточке (поля «Название» и «Цена», «Сохранить» / «Отмена»), ошибка показывается под полями.
- Удаление — подтверждение в той же карточке («Удалить» / «Отмена»).
- Системных окон браузера (`prompt`, `alert`, `confirm`) в приложении нет. Общее модальное окно `ModalRoot` и кнопка «Nova+» удалены как неиспользуемые.

## Предохранители
| Что защищено | Чем |
|---|---|
| Всё приложение | `app/AppErrorBoundary.tsx` |
| Каждый экран (Поиск, Shorts, Кабинет…) | `PageGuard` в `app/App.tsx` |
| Каждая категория, подкатегория, карточка объявления | `categories/core/CategoryBoundary.tsx` |
| Шапка, блоки главной, панели кабинета, поля мастера, выбор места, карточки в сетках | `BlockGuard` / `SafeBoundary level="block"` |
| Каждая кнопка (отрисовка) | `ActionGuard` |
| Каждая кнопка (нажатие) | `safe('Название', обработчик)` из `components/safety/safeAction.ts` |

Сбой показывается локально (заглушка / «Повторить») и всплывающим уведомлением; предохранитель сбрасывается при смене адреса.
