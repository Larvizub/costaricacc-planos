import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider } from 'styled-components';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import GlobalStyles, { theme } from './styles/GlobalStyles';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SolicitudesPage from './pages/SolicitudesPage';
import NuevaSolicitudPage from './pages/NuevaSolicitudPage';
import DetalleSolicitudPage from './pages/DetalleSolicitudPage';
import PlanosPage from './pages/PlanosPage';
import Profile from './pages/Profile';
import EditProfilePage from './pages/EditProfilePage';
import UsersPage from './pages/UsersPage';

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
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
