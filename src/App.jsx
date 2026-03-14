import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import styled, { ThemeProvider, keyframes } from 'styled-components';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import GlobalStyles, { theme } from './styles/GlobalStyles';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

const SolicitudesPage = lazy(() => import('./pages/SolicitudesPage'));
const NuevaSolicitudPage = lazy(() => import('./pages/NuevaSolicitudPage'));
const DetalleSolicitudPage = lazy(() => import('./pages/DetalleSolicitudPage'));
const PlanosPage = lazy(() => import('./pages/PlanosPage'));
const Profile = lazy(() => import('./pages/Profile'));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const RouteLoaderContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.background};
`;

const RouteSpinner = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 5px solid rgba(0, 131, 14, 0.2);
  border-top-color: ${theme.colors.primary};
  animation: ${spin} 0.8s linear infinite;
`;

const RouteLoader = () => (
  <RouteLoaderContainer aria-label="Cargando módulo">
    <RouteSpinner />
  </RouteLoaderContainer>
);

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <GlobalStyles />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <Suspense fallback={<RouteLoader />}>
            <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/solicitudes" element={
              <ProtectedRoute>
                <SolicitudesPage />
              </ProtectedRoute>
            } />
            <Route path="/solicitudes/nueva" element={
              <ProtectedRoute allowedRoles={['cliente', 'admin']}>
                <NuevaSolicitudPage />
              </ProtectedRoute>
            } />
            <Route path="/solicitudes/:id" element={
              <ProtectedRoute>
                <DetalleSolicitudPage />
              </ProtectedRoute>
            } />
            <Route path="/planos" element={
              <ProtectedRoute allowedRoles={['ingeniero', 'arquitecto', 'admin']}>
                <PlanosPage />
              </ProtectedRoute>
            } />
            <Route path="/usuarios" element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            } />
            <Route path="/perfil" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/perfil/editar" element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<HomePage />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
