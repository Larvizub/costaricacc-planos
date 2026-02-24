import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// BottomNav se renderiza dentro de la app (Dashboard).

const root = ReactDOM.createRoot(document.getElementById('root'));
// Fallback DOM bottom nav: solo se inyecta si la barra React no existe tras el montaje.
function injectFallbackBottomNav() {
  try {
    if (typeof window === 'undefined' || !document) return;
    if (document.getElementById('react-bottom-nav')) return;
    if (document.getElementById('fallback-bottom-nav')) return;

    const style = document.createElement('style');
    style.id = 'fallback-bottom-nav-style';
    style.textContent = `
      #fallback-bottom-nav {
        display: none;
      }
      @media (max-width: 768px) {
        #fallback-bottom-nav {
          display: flex !important;
        }
        body {
          padding-bottom: calc(104px + env(safe-area-inset-bottom, 0px)) !important;
        }
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
      left: '12px',
      right: '12px',
      bottom: '10px',
      minHeight: '72px',
      display: 'none',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '6px',
      padding: '8px',
      paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
      background: 'rgba(255, 255, 255, 0.96)',
      border: '1px solid #e0e0e0',
      borderRadius: '20px',
      zIndex: '2147483647',
      boxShadow: '0 8px 24px rgba(0,0,0,0.16)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      fontFamily: 'Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
      color: '#666'
    });

    const items = [
      {label:'Inicio', path:'/', svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>'},
      {label:'Solicitudes', path:'/solicitudes', svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'},
      {label:'Planos', path:'/planos', svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18v10H3z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 7v10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>'},
      {label:'Usuarios', path:'/usuarios', svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 11c1.657 0 3-1.567 3-3.5S18.157 4 16.5 4s-3 1.567-3 3.5S14.843 11 16.5 11zM7.5 11c1.657 0 3-1.567 3-3.5S9.157 4 7.5 4s-3 1.567-3 3.5S5.843 11 7.5 11z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 20c0-3 4-5 9-5s9 2 9 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>'}
    ];

    const currentPath = window.location.pathname;

    items.forEach(it => {
      const a = document.createElement('a');
      a.href = it.path;
      a.style.textDecoration = 'none';
      a.style.color = '#666666';
      a.style.display = 'flex';
      a.style.flexDirection = 'column';
      a.style.alignItems = 'center';
      a.style.justifyContent = 'center';
      a.style.width = '25%';
      a.style.minHeight = '56px';
      a.style.borderRadius = '14px';
      a.style.padding = '8px 6px';
      a.style.fontSize = '12px';
      a.style.fontWeight = '600';
      a.style.lineHeight = '1';
      a.style.transition = 'all 0.2s ease';

      const isActive = (it.path === '/' && currentPath === '/') || (it.path !== '/' && currentPath.startsWith(it.path));
      if (isActive) {
        a.style.background = '#00830e';
        a.style.color = '#ffffff';
        a.style.boxShadow = '0 6px 14px rgba(0, 131, 14, 0.25)';
      }

      a.innerHTML = `<div style="line-height:1;display:flex;align-items:center;justify-content:center">${it.svg}</div><div style="font-size:12px;margin-top:6px;font-weight:600;letter-spacing:0.01em">${it.label}</div>`;
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

// Inyectar fallback solo como contingencia real
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (!document.getElementById('react-bottom-nav')) {
        injectFallbackBottomNav();
      }
    }, 1200);
  });
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
