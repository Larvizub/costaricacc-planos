import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/GlobalStyles';

// Estilos para los botones
const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  padding: ${({ size }) => {
    switch (size) {
      case 'small': return `${theme.spacing.xs} ${theme.spacing.md}`;
      case 'large': return `${theme.spacing.md} ${theme.spacing.xl}`;
      default: return `${theme.spacing.sm} ${theme.spacing.lg}`;
    }
  }};
  font-size: ${({ size }) => {
    switch (size) {
      case 'small': return '0.85rem';
      case 'large': return '1.1rem';
      default: return '1rem';
    }
  }};
  font-weight: 500;
  border-radius: ${theme.borderRadius.medium};
  border: none;
  cursor: pointer;
  transition: all ${theme.transitions.default};
  position: relative;
  overflow: hidden;
  
  /* Variantes de color */
  background-color: ${({ variant }) => {
    switch (variant) {
      case 'secondary': return theme.colors.secondary;
      case 'outline': return 'transparent';
      case 'text': return 'transparent';
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.error;
      case 'warning': return theme.colors.warning;
      case 'info': return theme.colors.info;
      default: return theme.colors.primary;
    }
  }};
  
  color: ${({ variant }) => {
    switch (variant) {
      case 'outline': return theme.colors.primary;
      case 'text': return theme.colors.primary;
      case 'secondary':
      case 'primary':
      case 'success':
      case 'error':
      case 'warning':
      case 'info':
        return '#ffffff';
      default: return '#ffffff';
    }
  }};
  
  border: ${({ variant }) => 
    variant === 'outline' ? `2px solid ${theme.colors.primary}` : 'none'};
  
  &:hover, &:focus {
    background-color: ${({ variant }) => {
      switch (variant) {
        case 'secondary': return theme.colors.secondary + 'e6';
        case 'outline': return theme.colors.primary + '10';
        case 'text': return theme.colors.primary + '10';
        case 'success': return theme.colors.success + 'e6';
        case 'error': return theme.colors.error + 'e6';
        case 'warning': return theme.colors.warning + 'e6';
        case 'info': return theme.colors.info + 'e6';
        default: return theme.colors.primary + 'e6';
      }
    }};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.small};
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
  
  &:disabled {
    background-color: ${theme.colors.border};
    color: ${theme.colors.textLight};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  /* Efecto de ripple */
  &:after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%);
    transform-origin: 50% 50%;
  }
  
  &:focus:not(:active)::after {
    animation: ripple 1s ease-out;
  }
  
  @keyframes ripple {
    0% {
      transform: scale(0, 0);
      opacity: 0.5;
    }
    20% {
      transform: scale(25, 25);
      opacity: 0.3;
    }
    100% {
      opacity: 0;
      transform: scale(40, 40);
    }
  }
`;

// Componente Button
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  type = 'button',
  disabled = false,
  onClick, 
  ...props 
}) => {
  return (
    <StyledButton 
      variant={variant} 
      size={size} 
      type={type} 
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
