import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// BottomNav is rendered inside the app (Dashboard) — do not mount here.

const root = ReactDOM.createRoot(document.getElementById('root'));
// Fallback DOM bottom nav: inyecta una barra inferior simple directamente en el DOM
// para que los iconos de navegación estén disponibles incluso si React falla.
function injectFallbackBottomNav() {
  try {
    if (typeof window === 'undefined' || !document) return;
    if (document.getElementById('fallback-bottom-nav')) return;

    const style = document.createElement('style');
    style.id = 'fallback-bottom-nav-style';
    style.textContent = `
      #fallback-bottom-nav { display: none; }
      @media (max-width: 768px) {
        #fallback-bottom-nav { display: flex !important; }
        body { padding-bottom: 88px !important; }
      }
      @media (min-width: 769px) {
        #fallback-bottom-nav { display: none !important; }
      }
    `;
    document.head.appendChild(style);

    const nav = document.createElement('div');
    nav.id = 'fallback-bottom-nav';
    nav.setAttribute('data-fallback-bottom-nav-mounted', '1');
    Object.assign(nav.style, {
      position: 'fixed',
      left: '0',
      right: '0',
      bottom: '0',
      height: '84px',
      display: 'none',
      paddingTop: '8px',
      justifyContent: 'space-around',
      alignItems: 'center',
      background: '#00830e',
      borderTop: '3px solid rgba(0,0,0,0.12)',
      zIndex: '2147483647',
      boxShadow: '0 -8px 24px rgba(0,0,0,0.14)',
      paddingBottom: 'env(safe-area-inset-bottom, 14px)',
      paddingLeft: '12px',
      paddingRight: '12px',
      fontFamily: 'Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
      color: '#fff'
    });

    const items = [
      {label:'Inicio', path:'/', svg: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'},
      {label:'Solicitudes', path:'/solicitudes', svg: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18M7 11h10M7 15h10" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'},
      {label:'Planos', path:'/planos', svg: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18v10H3z" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 7v10" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'},
      {label:'Usuarios', path:'/usuarios', svg: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11c1.657 0 3-1.567 3-3.5S17.657 4 16 4s-3 1.567-3 3.5S14.343 11 16 11zM8 11c1.657 0 3-1.567 3-3.5S9.657 4 8 4 5 5.567 5 7.5 6.343 11 8 11z" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 20c0-3 4-5 9-5s9 2 9 5" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'}
    ];

    items.forEach(it => {
      const a = document.createElement('a');
      a.href = it.path;
      a.style.textDecoration = 'none';
      a.style.color = '#fff';
      a.style.display = 'flex';
      a.style.flexDirection = 'column';
      a.style.alignItems = 'center';
      a.style.justifyContent = 'center';
      a.style.flex = '1';
      a.style.maxWidth = '160px';
      a.style.height = '100%';
      a.style.padding = '6px 10px 12px';
      a.style.fontSize = '14px';
      a.innerHTML = `<div style="line-height:1">${it.svg}</div><div style="font-size:15px;font-weight:600;margin-top:8px;margin-bottom:14px;color:rgba(255,255,255,0.98)">${it.label}</div>`;
      a.addEventListener('click', function(e){
        e.preventDefault();
        try {
          window.history.pushState({}, '', it.path);
          window.dispatchEvent(new PopStateEvent('popstate'));
        } catch(err) {
          window.location.href = it.path;
        }
      });
      nav.appendChild(a);
    });

    document.body.appendChild(nav);
  } catch (e) {
    // No bloquear la app si algo falla aquí
    console.warn('No se pudo montar fallback-bottom-nav:', e);
  }
}

// Inyectar fallback siempre en cliente
if (typeof window !== 'undefined') {
  // Ejecutar después de DOMContentLoaded para asegurar body
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', injectFallbackBottomNav);
  } else {
    injectFallbackBottomNav();
  }
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
