import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaFileAlt, FaMapMarkedAlt, FaUsers } from 'react-icons/fa';
import { theme } from '../styles/GlobalStyles';

const activeTabIn = keyframes`
  0% {
    transform: scale(0.94) translateY(2px);
    box-shadow: 0 0 0 rgba(0, 131, 14, 0);
  }
  60% {
    transform: scale(1.03) translateY(-1px);
    box-shadow: 0 10px 20px rgba(0, 131, 14, 0.22);
  }
  100% {
    transform: scale(1) translateY(0);
    box-shadow: 0 6px 14px rgba(0, 131, 14, 0.25);
  }
`;

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

const NavAction = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme, $active }) => ($active ? '#ffffff' : theme.colors.textLight)};
  text-decoration: none;
  width: 25%;
  min-height: 56px;
  border-radius: 14px;
  padding: 8px 6px;
  transition: transform 0.22s ease, background-color 0.26s ease, color 0.26s ease, box-shadow 0.26s ease;
  background: ${({ theme, $active }) => ($active ? theme.colors.primary : 'transparent')};
  box-shadow: ${({ $active }) => ($active ? '0 6px 14px rgba(0, 131, 14, 0.25)' : 'none')};
  animation: ${({ $active }) => ($active ? activeTabIn : 'none')} 300ms cubic-bezier(0.2, 0.9, 0.2, 1);

  &:active {
    transform: scale(0.98);
  }
`;

const IconWrapper = styled.div`
  font-size: 1.3rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${({ $active }) => ($active ? 'translateY(-1px) scale(1.06)' : 'translateY(0) scale(1)')};
  transition: transform 0.24s ease;
`;

const Label = styled.div`
  font-size: 0.76rem;
  margin-top: 6px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.01em;
  transform: ${({ $active }) => ($active ? 'translateY(-1px)' : 'translateY(0)')};
  transition: transform 0.24s ease, opacity 0.24s ease;
  opacity: ${({ $active }) => ($active ? 1 : 0.95)};
`;

const BottomNav = () => {
  const { pathname } = useLocation();

  const isActive = (path) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const inicioActive = isActive('/');
  const solicitudesActive = isActive('/solicitudes');
  const planosActive = isActive('/planos');
  const usuariosActive = isActive('/usuarios');

  return (
    <BottomNavContainer id="react-bottom-nav">
      <NavAction to="/" $active={inicioActive}>
        <IconWrapper $active={inicioActive}><FaHome /></IconWrapper>
        <Label $active={inicioActive}>Inicio</Label>
      </NavAction>
      <NavAction to="/solicitudes" $active={solicitudesActive}>
        <IconWrapper $active={solicitudesActive}><FaFileAlt /></IconWrapper>
        <Label $active={solicitudesActive}>Solicitudes</Label>
      </NavAction>
      <NavAction to="/planos" $active={planosActive}>
        <IconWrapper $active={planosActive}><FaMapMarkedAlt /></IconWrapper>
        <Label $active={planosActive}>Planos</Label>
      </NavAction>
      <NavAction to="/usuarios" $active={usuariosActive}>
        <IconWrapper $active={usuariosActive}><FaUsers /></IconWrapper>
        <Label $active={usuariosActive}>Usuarios</Label>
      </NavAction>
    </BottomNavContainer>
  );
};

export default BottomNav;
