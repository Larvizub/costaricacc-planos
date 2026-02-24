import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
// Importar las páginas necesarias
import LoginPage from '../pages/LoginPage';
import SolicitudesPage from '../pages/SolicitudesPage';
import PlanosPage from '../pages/PlanosPage';
import HomePage from '../pages/HomePage';
import EnvTestPage from '../pages/EnvTestPage';
import NotificationAdminPage from '../pages/NotificationAdminPage';
import EmailDiagnosticPage from '../pages/EmailDiagnosticPage';
import NotificationTestPage from '../pages/NotificationTestPage';
import FileUploadTestPage from '../pages/FileUploadTestPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Rutas protegidas (solo verifican autenticación, no roles) */}
      <Route 
        path="/solicitudes" 
        element={
          <ProtectedRoute>
            <SolicitudesPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/planos" 
        element={
          <ProtectedRoute>
            <PlanosPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Otras rutas protegidas */}
      {/* ... */}
      
      {/* Páginas de diagnóstico y herramientas */}
      <Route 
        path="/env-test" 
        element={
          <ProtectedRoute>
            <EnvTestPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/notifications" 
        element={
          <ProtectedRoute>
            <NotificationAdminPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/email-diagnostic" 
        element={
          <ProtectedRoute>
            <EmailDiagnosticPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/test-notifications" 
        element={
          <ProtectedRoute>
            <NotificationTestPage />
          </ProtectedRoute>
        } 
      />
      

      
      <Route 
        path="/file-upload-test" 
        element={
          <ProtectedRoute>
            <FileUploadTestPage />
          </ProtectedRoute>
        } 
      />

      {/* Ruta por defecto */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
};

export default AppRoutes;
