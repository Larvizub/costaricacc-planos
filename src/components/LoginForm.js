import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaMicrosoft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { theme } from '../styles/GlobalStyles';
import Button from './Button';
import Input from './Input';
import Alert from './Alert';

// Estilos para el formulario de inicio de sesión
const LoginContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: ${theme.spacing.lg};
  background-color: #fff;
  border-radius: ${theme.borderRadius.medium};
  box-shadow: ${theme.shadows.medium};
`;

const LoginTitle = styled.h2`
  margin: 0 0 ${theme.spacing.md};
  color: ${theme.colors.text};
  font-size: 1.5rem;
  text-align: center;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const LoginFooter = styled.div`
  margin-top: ${theme.spacing.md};
  text-align: center;
`;

const LoginLink = styled.a`
  color: ${theme.colors.primary};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const LoginFormComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { currentUser, signInWithMicrosoft, signInWithEmail } = useAuth();
  const navigate = useNavigate();
  
  // Redireccionar si el usuario ya está autenticado
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  // ========== Función para manejar inicio de sesión con Microsoft ==========
  const handleMicrosoftLogin = async (e) => {
    if (e) e.preventDefault();
    
    // Evitar múltiples clics durante la carga
    if (loading) {
      console.log('Ya hay una operación de inicio de sesión en progreso');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔑 Iniciando proceso de login con Microsoft...');
      
      // Implementar un timeout para evitar bloqueo indefinido
      const loginPromise = signInWithMicrosoft();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('El inicio de sesión está tardando demasiado. Por favor, inténtelo nuevamente.')), 20000);
      });
      
      // Usar Promise.race para evitar que se quede bloqueado
      await Promise.race([loginPromise, timeoutPromise]);
      
      // La redirección se manejará en el useEffect
      console.log('🎉 Login con Microsoft exitoso');
    } catch (error) {
      console.error('❌ Error en login Microsoft:', error);
      // Mejorar los mensajes de error para el usuario
      if (error.message.includes('popup')) {
        setError('Error: No se pudo abrir la ventana de inicio de sesión. Verifique que no esté bloqueada por su navegador.');
      } else if (error.message.includes('network')) {
        setError('Error de red: Verifique su conexión a internet e inténtelo nuevamente.');
      } else if (error.message.includes('timeout') || error.message.includes('tiempo')) {
        setError('La operación tomó demasiado tiempo. Por favor, inténtelo nuevamente.');
      } else {
        setError(error.message || 'Error al iniciar sesión con Microsoft');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Función para manejar el envío del formulario
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, complete todos los campos.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔑 Iniciando proceso de login con email...');
      await signInWithEmail(email, password);
      
      // La redirección se manejará en el useEffect
      console.log('🎉 Login con email exitoso');
    } catch (error) {
      console.error('❌ Error en login email:', error);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Credenciales incorrectas.');
      } else {
        setError(error.message || 'Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <LoginContainer>
      <LoginTitle>Iniciar Sesión</LoginTitle>
      
      {error && (
        <Alert 
          type="error"
          title="Error"
          description={error}
          visible={true}
        />
      )}
      
      <LoginForm onSubmit={handleEmailLogin}>
        <Input 
          type="email" 
          placeholder="Correo electrónico" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required
        />
        
        <Input 
          type="password" 
          placeholder="Contraseña" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required
        />
        
        <Button 
          type="submit" 
          variant="primary" 
          loading={loading}
        >
          Iniciar Sesión con Email
        </Button>
      </LoginForm>
      
      <div style={{textAlign: 'center', margin: '20px 0', color: theme.colors.textLight}}>
        - O -
      </div>
      
      <Button 
        variant="secondary" 
        onClick={handleMicrosoftLogin}
        disabled={loading}
        style={{width: '100%'}}
        loading={loading}
      >
        {!loading && <FaMicrosoft style={{ marginRight: '8px' }} />}
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión con Microsoft'}
      </Button>
    </LoginContainer>
  );
};

export default LoginFormComponent;