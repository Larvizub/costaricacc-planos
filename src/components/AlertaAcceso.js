import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/GlobalStyles';

const AlertContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  margin: 15px 0;
  background-color: ${theme.colors.warning || '#fff3cd'};
  color: ${theme.colors.warningText || '#856404'};
  border: 1px solid ${theme.colors.warningBorder || '#ffeeba'};
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  svg {
    margin-right: 12px;
    font-size: 20px;
    color: ${theme.colors.warningIcon || '#856404'};
  }

  p {
    margin: 0;
    font-size: 14px;
  }
`;

// Modificar el componente para que nunca se muestre
const AlertaAcceso = ({ message, requiredRoles }) => {
  // Devolver null para que la alerta nunca se muestre
  return null;
};

export default AlertaAcceso;
