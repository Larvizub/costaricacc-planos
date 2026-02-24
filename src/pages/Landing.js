import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    // Redirigir inmediatamente basado en estado de autenticación
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // No renderizar nada, solo mostrar una pantalla en blanco mientras se redirecciona
  return null;
};

export default Landing;
