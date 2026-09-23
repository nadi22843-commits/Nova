# Nova — просмотр web-версии на телефоне

Web-интерфейс теперь адаптивный: desktop, tablet, iPhone и Android. Используется fluid-layout, а не отдельная верстка под одну модель телефона. Учтены safe-area iPhone (чёлка/Dynamic Island и нижняя зона), узкие Android-экраны и landscape.

## Запуск на ПК

Из корня проекта:

```powershell
npm install
npm run preview:phone
```

Vite покажет две строки: Local и Network. На телефоне, подключённом к той же Wi-Fi сети, открой в Safari/Chrome именно адрес `Network`, например `http://192.168.x.x:5173`.

Это web-preview и ему не нужны Expo Go или ngrok.

## Если Network-адрес не открывается

Это означает, что Windows/роутер блокирует локальный доступ к серверу. Сам web-проект при этом может работать на ПК. Для постоянной публичной ссылки соберите `npm run build:web` и разместите содержимое `apps/web/dist` на любом статическом web-хостинге.
