import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { FaHome, FaFileAlt, FaMapMarkedAlt, FaUsers } from 'react-icons/fa';
import { theme } from '../styles/GlobalStyles';

const BottomNavContainer = styled.nav`
  display: none;
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 10px;
  min-height: 72px;
  padding: 8px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid ${theme.colors.border};
  border-radius: 20px;
  z-index: 2147483647;
  justify-content: space-between;
  gap: 6px;
  align-items: center;
  box-shadow: ${theme.shadows.large};

  @media (max-width: ${theme.breakpoints.sm}) {
    display: flex;
  }

  @media (max-width: 360px) {
    left: 8px;
    right: 8px;
    border-radius: 16px;
  }
`;

const NavAction = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textLight};
  text-decoration: none;
  width: 25%;
  min-height: 56px;
  border-radius: 14px;
  padding: 8px 6px;
  transition: transform 0.2s ease, background-color 0.2s ease, color 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  &.active {
    background: ${props => props.theme.colors.primary};
    color: #ffffff;
    box-shadow: 0 6px 14px rgba(0, 131, 14, 0.25);
  }
`;

const IconWrapper = styled.div`
  font-size: 1.3rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Label = styled.div`
  font-size: 0.76rem;
  margin-top: 6px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.01em;
`;

const BottomNav = () => {
  return (
    <BottomNavContainer id="react-bottom-nav">
      <NavAction to="/" end>
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
