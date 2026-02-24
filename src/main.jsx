import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// BottomNav se renderiza dentro de la app (Dashboard).

function registerServiceWorker() {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  if (!import.meta.env.PROD) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('No se pudo registrar el service worker:', error);
    });
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));

registerServiceWorker();

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
