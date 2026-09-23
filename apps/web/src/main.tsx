import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { setStorageAdapter, browserStorage } from '@nova/core';
import { App } from './app/App';
import './shared/styles/global.css';

// Черновики публикации (packages/core/draftStore) читают/пишут через общий
// адаптер хранилища — в браузере это localStorage. Подставляется один раз,
// до первого рендера.
setStorageAdapter(browserStorage());

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><App/></BrowserRouter></React.StrictMode>);
