# Nova React + TypeScript + Node.js

Модульная версия Nova. Главный принцип: каждая пользовательская функция находится в своей ветке `apps/web/src/features/<feature>/`.

## Быстрый поиск кнопок

Смотрите `BUTTON_MAP.md`.

## Запуск

```bash
npm install
npm run dev:web
npm run dev:api
```

Web: Vite/React/TypeScript. API: Node.js/Express/TypeScript.

## Статус

Ветки Search, Shorts, Favorites, Cart, Auth/Account, Publish, Support, Location/i18n и Listings добавлены. Nova Bot намеренно не включён — он оставлен на финальный этап.

В текущей рабочей среде установка npm-зависимостей не завершилась в отведённое время, поэтому финальная сборка здесь не была подтверждена. После `npm install` проект следует проверить командами `npm run build` и `npm run typecheck`.
