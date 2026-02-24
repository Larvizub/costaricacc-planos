import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/GlobalStyles';

// Estilos para el contenedor del input
const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${theme.spacing.md};
  width: 100%;
`;

// Estilos para la etiqueta
const StyledLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: ${theme.spacing.xs};
  color: ${theme.colors.text};
`;

// Estilos para el input
const StyledInput = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  padding-left: ${({ hasIcon }) => hasIcon ? theme.spacing.xl : theme.spacing.md};
  font-size: 1rem;
  border: 1px solid ${({ error }) => 
    error ? theme.colors.error : theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  background-color: ${props => props.disabled ? theme.colors.background : '#fff'};
  transition: all ${theme.transitions.default};
  color: ${theme.colors.text};
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: ${({ error }) => 
      error ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ error }) => 
      error ? `${theme.colors.error}33` : `${theme.colors.primary}33`};
  }
  
  &::placeholder {
    color: ${theme.colors.textLight};
    opacity: 0.7;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

// Estilos para el textarea
const StyledTextarea = styled(StyledInput).attrs({ as: 'textarea' })`
  min-height: 100px;
  resize: vertical;
`;

// Estilos para el select
const StyledSelect = styled(StyledInput).attrs({ as: 'select' })`
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right ${theme.spacing.md} center;
  padding-right: ${theme.spacing.xl};
`;

// Estilos para el mensaje de error
const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  font-size: 0.8rem;
  margin-top: ${theme.spacing.xs};
`;

// Estilos para el mensaje de ayuda
const HelperText = styled.div`
  color: ${theme.colors.textLight};
  font-size: 0.8rem;
  margin-top: ${theme.spacing.xs};
`;

// Estilos para el contenedor de entrada con iconos
const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

// Estilos para el icono
const IconWrapper = styled.div`
  position: absolute;
  left: ${theme.spacing.sm};
  color: ${theme.colors.textLight};
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Componente Input
const Input = ({ 
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  disabled = false,
  required = false,
  options = [],
  multiple = false,
  icon,
  ...props 
}) => {
  // Renderiza el campo de entrada adecuado según el tipo
  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <StyledTextarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          error={error ? true : false}
          {...props}
        />
      );
    } else if (type === 'select') {
      return (
        <InputWrapper>
          {icon && <IconWrapper>{icon}</IconWrapper>}
          <StyledSelect
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            error={error ? true : false}
            multiple={multiple}
            hasIcon={icon ? true : false}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </StyledSelect>
        </InputWrapper>
      );
    } else {
      return (
        <InputWrapper>
          {icon && <IconWrapper>{icon}</IconWrapper>}
          <StyledInput
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            error={error ? true : false}
            hasIcon={icon ? true : false}
            {...props}
          />
        </InputWrapper>
      );
    }
  };

  return (
    <InputContainer>
      {label && (
        <StyledLabel htmlFor={name}>
          {label} {required && <span style={{ color: theme.colors.error }}>*</span>}
        </StyledLabel>
      )}
      {renderInput()}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {helperText && !error && <HelperText>{helperText}</HelperText>}
    </InputContainer>
  );
};

export default Input;
