import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaMicrosoft, FaLock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { theme } from '../styles/GlobalStyles';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Logo from '../components/Logo';
import useForm from '../hooks/useForm';
import { toast } from 'react-toastify';
import { isValidEmail } from '../utils/validators';

// Estilos para el contenedor del login
const LoginContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: ${theme.spacing.xl} 0;
`;

const LoginCard = styled(Card)`
  padding: ${theme.spacing.xl};
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${theme.spacing.lg};
  
  img {
    max-width: 200px;
    height: auto;
  }
`;

const LoginTitle = styled.h2`
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: ${theme.spacing.lg};
  color: ${theme.colors.text};
`;

const LoginDescription = styled.p`
  color: ${theme.colors.textLight};
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
`;

const LoginButton = styled(Button)`
  width: 100%;
  margin-bottom: ${theme.spacing.md};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: ${theme.spacing.lg} 0;
  
  &:before, &:after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${theme.colors.border};
  }
  
  span {
    margin: 0 ${theme.spacing.md};
    color: ${theme.colors.textLight};
    font-size: 0.9rem;
  }
`;

const FormContainer = styled.form`
  margin-top: ${theme.spacing.lg};
`;

const InputGroup = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

const PasswordContainer = styled.div`
  position: relative;
  
  .password-toggle {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: ${theme.colors.textLight};
    
    &:hover {
      color: ${theme.colors.primary};
    }
  }
`;

const ErrorMessage = styled.div`
  background-color: ${theme.colors.error + '20'};
  color: ${theme.colors.error};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  margin-bottom: ${theme.spacing.md};
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: ${theme.spacing.sm};
  }
`;

// Página de login
const LoginPage = () => {
  const { signInWithMicrosoft, signInWithEmail } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Validar el formulario
  const validateLoginForm = (values) => {
    const errors = {};
    
    if (!values.email) {
      errors.email = 'El correo electrónico es requerido';
    } else if (!isValidEmail(values.email)) {
      errors.email = 'Ingrese un correo electrónico válido';
    }
    
    if (!values.password) {
      errors.password = 'La contraseña es requerida';
    }
    
    return errors;
  };
  
  // Hook de formulario
  const { 
    values, 
    errors, 
    touched,
    handleChange, 
    handleBlur, 
    handleSubmit 
  } = useForm(
    { email: '', password: '' }, 
    async (values) => {
      try {
        setError('');
        setLoading(true);
        await signInWithEmail(values.email, values.password);
        navigate('/');
        toast.success('Sesión iniciada correctamente');
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        setError('Credenciales incorrectas. Por favor, inténtelo de nuevo.');
      } finally {
        setLoading(false);
      }
    },
    validateLoginForm
  );
  
  // Manejar login con Microsoft
  const handleMicrosoftLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithMicrosoft();
      navigate('/');
      toast.success('Sesión iniciada correctamente');
    } catch (error) {
      console.error('Error al iniciar sesión con Microsoft:', error);
      setError('No se pudo iniciar sesión con Microsoft. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Alternar visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Layout title="Iniciar sesión">
      <LoginContainer>
        <LoginCard elevation="medium">
          <LogoContainer>
            <Logo width="200px" />
          </LogoContainer>
          <LoginTitle>Bienvenido a la App de Aprobación de Planos</LoginTitle>
          <LoginDescription>
            Inicia sesión para acceder a la plataforma
          </LoginDescription>
          
          {error && (
            <ErrorMessage>
              <FaLock /> {error}
            </ErrorMessage>
          )}
          
          <LoginButton 
            variant="secondary" 
            size="large" 
            onClick={handleMicrosoftLogin}
            disabled={loading}
          >
            <FaMicrosoft />
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión con Microsoft'}
          </LoginButton>
          
          <Divider>
            <span>o</span>
          </Divider>
          
          <FormContainer onSubmit={handleSubmit}>
            <InputGroup>
              <Input
                type="email"
                name="email"
                label="Correo electrónico"
                placeholder="ejemplo@dominio.com"
                icon={<FaEnvelope />}
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && errors.email}
                required
              />
            </InputGroup>
            
            <InputGroup>
              <PasswordContainer>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  label="Contraseña"
                  placeholder="••••••••"
                  icon={<FaLock />}
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && errors.password}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  tabIndex="-1"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </PasswordContainer>
            </InputGroup>
            
            <LoginButton
              type="submit"
              variant="primary"
              size="large"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </LoginButton>
          </FormContainer>
          
          <Divider>
            <span>Centro de Convenciones de Costa Rica</span>
          </Divider>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: theme.spacing.md }}>
            <Logo width="150px" />
          </div>
          
          <LoginDescription>
            Esta plataforma es exclusiva para los empleados y colaboradores del 
            Centro de Convenciones de Costa Rica.
          </LoginDescription>
        </LoginCard>
      </LoginContainer>
    </Layout>
  );
};

export default LoginPage;
