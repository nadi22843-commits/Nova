# Web mobile adaptation (iOS / Android)

Точечный патч без изменения структуры и компонентной логики.

Изменено только:
- `apps/web/index.html` — добавлен `viewport-fit=cover` для safe area на iOS.
- `apps/web/src/shared/styles/global.css` — в конец добавлен адаптивный слой для мобильного web.

Что покрывает патч:
- fluid-ширину под фактический viewport телефона, без привязки к моделям устройств;
- iOS safe-area (`notch`, Dynamic Island, home indicator) через `env(safe-area-inset-*)`;
- Android viewport и узкие экраны;
- компактные экраны до 390 px;
- landscape с небольшой высотой;
- защиту от горизонтального overflow;
- `100dvh` там, где мобильная адресная строка меняет доступную высоту.

Дизайн, маршруты, React-компоненты, категории и бизнес-логика не изменялись.
