import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n/config';

// Self-hosted fonts — RGPD compliant, no external round-trip
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cinzel/400.css';
import '@fontsource/cinzel/600.css';
import '@fontsource/bodoni-moda/400.css';
import '@fontsource/bodoni-moda/400-italic.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';

import './styles/tokens.css';
import './styles/global.css';

import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
