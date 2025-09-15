import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './app/app';
import { useThemeStore } from './store/theme.store';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const theme = (localStorage.getItem('theme') as 'dark'|'light') || 'dark';
document.documentElement.setAttribute('data-theme', theme);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);