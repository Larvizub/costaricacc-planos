import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { FaHome, FaFileAlt, FaMapMarkedAlt, FaUsers } from 'react-icons/fa';
import { theme } from '../styles/GlobalStyles';

const BottomNavContainer = styled.nav`
  display: flex;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 84px;
  padding-top: 8px;
  padding-bottom: env(safe-area-inset-bottom, 14px);
  padding-left: 12px;
  padding-right: 12px;
  background: ${theme.colors.card};
  border-top: 3px solid ${theme.colors.border};
  z-index: 2147483647;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -8px 24px rgba(0,0,0,0.12);

  @media (min-width: ${theme.breakpoints.md}) {
    /* Opcional: en pantallas grandes lo mantenemos pero con menos prominencia */
    height: 56px;
  }
`;

const NavAction = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  font-size: 0.9rem;
  width: 100%;
  height: 100%;
  padding: 6px 10px 12px;
  &.active {
    color: ${props => props.theme.colors.primary};
  }
`;

const IconWrapper = styled.div`
  font-size: 1.9rem;
  line-height: 1;
`;

const Label = styled.div`
  font-size: 0.95rem;
  margin-top: 6px;
  margin-bottom: 14px;
`;

const BottomNav = () => {
  return (
    <BottomNavContainer>
      <NavAction to="/" exact>
        <IconWrapper><FaHome /></IconWrapper>
        <Label>Inicio</Label>
      </NavAction>
      <NavAction to="/solicitudes">
        <IconWrapper><FaFileAlt /></IconWrapper>
        <Label>Solicitudes</Label>
      </NavAction>
      <NavAction to="/planos">
        <IconWrapper><FaMapMarkedAlt /></IconWrapper>
        <Label>Planos</Label>
      </NavAction>
      <NavAction to="/usuarios">
        <IconWrapper><FaUsers /></IconWrapper>
        <Label>Usuarios</Label>
      </NavAction>
    </BottomNavContainer>
  );
};

export default BottomNav;
