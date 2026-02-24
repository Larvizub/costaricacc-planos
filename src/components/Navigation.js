import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../styles/GlobalStyles';
import { useAuth } from '../context/AuthContext';

const NavbarContainer = styled.nav`
  background-color: ${theme.colors.background};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  box-shadow: ${theme.shadows.small};
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
`;

const MenuItem = styled(Link)`
  text-decoration: none;
  color: ${theme.colors.text};
  font-weight: 500;
  position: relative;
  
  &.active {
    color: ${theme.colors.primary};
    
    &::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 2px;
      bottom: -2px;
      left: 0;
      background: ${theme.colors.primary};
    }
  }
`;

const Navigation = () => {
  const { userRoles } = useAuth();

  // Asegurarse de mostrar todos los elementos de navegación
  const renderNavItems = () => {
    return (
      <>
        <MenuItem to="/dashboard">Dashboard</MenuItem>
        <MenuItem to="/solicitudes">Solicitudes</MenuItem>
        <MenuItem to="/planos">Planos</MenuItem>
        <MenuItem to="/admin">Administración</MenuItem>
        {/* Otros elementos de navegación */}
      </>
    );
  };

  return (
    <NavbarContainer>
      <NavList>
        {renderNavItems()}
      </NavList>
    </NavbarContainer>
  );
};

export default Navigation;