import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaTimes } from 'react-icons/fa';
import { theme } from '../styles/GlobalStyles';

// Estilos para el componente Alert
const AlertContainer = styled.div`
  display: ${({ visible }) => (visible ? 'flex' : 'none')};
  align-items: flex-start;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  margin-bottom: ${theme.spacing.md};
  
  background-color: ${({ type }) => {
    switch (type) {
      case 'success': return `${theme.colors.success}20`;
      case 'warning': return `${theme.colors.warning}20`;
      case 'error': return `${theme.colors.error}20`;
      case 'info':
      default: return `${theme.colors.info}20`;
    }
  }};
  
  border-left: 4px solid ${({ type }) => {
    switch (type) {
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      case 'info':
      default: return theme.colors.info;
    }
  }};
`;

const IconContainer = styled.div`
  margin-right: ${theme.spacing.md};
  font-size: 1.25rem;
  color: ${({ type }) => {
    switch (type) {
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      case 'info':
      default: return theme.colors.info;
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContentContainer = styled.div`
  flex: 1;
`;

const AlertTitle = styled.h4`
  margin: 0;
  margin-bottom: ${({ hasDescription }) => (hasDescription ? theme.spacing.xs : '0')};
  font-size: 1rem;
  font-weight: 600;
  color: ${theme.colors.text};
`;

const AlertDescription = styled.p`
  margin: 0;
  color: ${theme.colors.textLight};
  font-size: 0.9rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${theme.colors.textLight};
  margin-left: ${theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xs};
  
  &:hover {
    color: ${theme.colors.text};
  }
`;

/**
 * Componente Alert para mostrar mensajes informativos, de éxito, advertencia o error
 * @param {object} props - Propiedades del componente
 * @returns {JSX.Element} Componente Alert
 */
const Alert = ({ 
  title, 
  description, 
  type = 'info', 
  closable = true,
  duration = 0,
  visible: propVisible = true,
  onClose
}) => {
  const [visible, setVisible] = useState(propVisible);
  
  // Obtener el icono adecuado según el tipo
  const getIcon = () => {
    switch (type) {
      case 'success': return <FaCheckCircle />;
      case 'warning': return <FaExclamationTriangle />;
      case 'error': return <FaTimesCircle />;
      case 'info':
      default: return <FaInfoCircle />;
    }
  };
  
  // Manejar el cierre de la alerta
  const handleClose = React.useCallback(() => {
    setVisible(false);
    if (onClose) {
      onClose();
    }
  }, [onClose]);
  
  // Cerrar automáticamente después de cierto tiempo si se especifica duración
  useEffect(() => {
    let timer;
    
    if (duration > 0 && visible) {
      timer = setTimeout(() => {
        handleClose();
      }, duration);
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [duration, visible, handleClose]);
  
  // Actualizamos el estado visible cuando cambia la prop
  useEffect(() => {
    setVisible(propVisible);
  }, [propVisible]);
  
  return (
    <AlertContainer type={type} visible={visible}>
      <IconContainer type={type}>
        {getIcon()}
      </IconContainer>
      
      <ContentContainer>
        {title && <AlertTitle hasDescription={!!description}>{title}</AlertTitle>}
        {description && <AlertDescription>{description}</AlertDescription>}
      </ContentContainer>
      
      {closable && (
        <CloseButton onClick={handleClose} aria-label="Cerrar">
          <FaTimes />
        </CloseButton>
      )}
    </AlertContainer>
  );
};

export default Alert;
