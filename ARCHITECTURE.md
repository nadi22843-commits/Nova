# Nova — архитектура проекта

## Главное правило

Каждая заметная функция интерфейса живёт в собственной ветке `features/<имя-функции>/`. По имени файла должно быть понятно, что он представляет: `ShortsButton.tsx`, `ShortsPage.tsx`, `FavoritesStore.tsx`.

## Frontend

```text
apps/web/src/features/
├── auth/
│   ├── components/LoginButton.tsx
│   ├── pages/LoginPage.tsx
│   ├── pages/AccountPage.tsx
│   └── model/AuthService.ts
├── cart/
│   ├── components/CartButton.tsx
│   ├── components/AddToCartButton.tsx
│   ├── pages/CartPage.tsx
│   └── model/CartStore.tsx
├── favorites/
│   ├── components/FavoritesButton.tsx
│   ├── components/FavoriteButton.tsx
│   ├── pages/FavoritesPage.tsx
│   └── model/FavoritesStore.tsx
├── i18n/components/LanguageSelector.tsx
├── listings/
│   ├── components/ListingGrid.tsx
│   ├── pages/ListingPage.tsx
│   └── model/listingsData.ts
├── location/components/CountrySelector.tsx
├── publish/
│   ├── components/PublishButton.tsx
│   ├── pages/PublishPage.tsx
│   └── model/PublishService.ts
├── search/
│   ├── components/SearchButton.tsx
│   ├── pages/SearchPage.tsx
│   └── model/SearchService.ts
├── shorts/
│   ├── components/ShortsButton.tsx
│   ├── pages/ShortsPage.tsx
│   └── model/
└── support/
    ├── components/SupportButton.tsx
    └── pages/SupportPage.tsx
```

## Backend

Серверные функции также разделены по модулям в `apps/api/src/modules/`: `auth`, `cart`, `favorites`, `listings`, `location`, `search`, `shorts`, `support`.

## Как искать неисправность

Если не работает кнопка — сначала открываем файл `*Button.tsx`. Если кнопка работает, но экран нет — `*Page.tsx`. Если проблема в данных/состоянии — `model/*Service.ts` или `*Store.tsx`. Если ошибка приходит с сервера — соответствующий модуль `apps/api/src/modules/<feature>/`.

## Важно

Nova Bot в эту архитектуру сейчас не включён. Он остаётся на финальный этап проекта.


## UI icons
Минималистичные SVG-иконки интерфейса централизованы в `apps/web/src/components/ui/NovaIcon.tsx`. Это позволяет менять визуальный стиль иконок независимо от бизнес-логики кнопок.


## Предохранители (изоляция сбоев)
Файлы: `apps/web/src/components/safety/`.
- `SafeBoundary` — граница ошибок с уровнями `page` / `block` / `action` и сбросом по адресу.
- `PageGuard`, `BlockGuard`, `ActionGuard` — готовые обёртки.
- `safe()` / `runSafely()` — защита обработчиков нажатий (включая async): ошибки в onClick не ловятся границами React.
- `ActionErrorNotice` — короткое уведомление «действие не сработало».

Правило для новых кнопок: компонент кнопки оборачивается в `ActionGuard`, обработчик — в `safe('Название', …)`.
Правило для новых категорий: свои действия карточки — через `categories/ui/detailActions.tsx`, они автоматически получают `BlockGuard`.

## Окна и подтверждения
Модальных окон в приложении нет. Подтверждения и формы редактирования встроены в страницу
(пример — карточка объявления в «Личном кабинете»). Системные `prompt` / `alert` / `confirm` не используются:
ошибки показываются через `.nova-error` рядом с полем, сбои кнопок — через `ActionErrorNotice`.

## Связь с сервером
Файлы: `apps/web/src/shared/api/`.
- `client.ts` — адрес API (`VITE_API_URL`), токен, таймаут, разбор ошибок (`ApiError`), статус сервера.
- `auth.ts` — вход по телефону и коду; `listings.ts` — списки, карточка, публикация, «мои объявления», снятие с публикации.
- `ServerCatalog.ts` — объявления сервера кладутся отдельной корзиной в общий каталог, поэтому экраны не переделывались.
- `useApiStatus.ts` — статус сервера для подсказок в интерфейсе.

Правило: экраны не вызывают `fetch` напрямую, только функции из `shared/api/*`.
Если сервер недоступен, приложение продолжает работать на локальных данных.
