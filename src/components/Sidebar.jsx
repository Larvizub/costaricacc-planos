import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { FaHome, FaFileAlt, FaMapMarkedAlt, FaUsers, FaChartBar, FaCog, FaBell } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const SidebarContainer = styled.div`
  background-color: ${props => props.theme.colors.background};
  width: 250px;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  box-shadow: ${props => props.theme.shadows.medium};
  display: flex;
  flex-direction: column;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    transition: transform 0.3s ease;
  }
`;

const LogoContainer = styled.div`
  padding: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const NavContainer = styled.nav`
  flex: 1;
  padding: ${props => props.theme.spacing.md} 0;
  overflow-y: auto;
`;

const NavSection = styled.div`
  padding: 0 ${props => props.theme.spacing.md} ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  
  &:not(:last-child) {
    border-bottom: 1px solid ${props => props.theme.colors.border};
  }
`;

const NavSectionTitle = styled.h3`
  color: ${props => props.theme.colors.textLight};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  color: ${props => props.theme.colors.text};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.medium};
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme.colors.backgroundAlt};
  }
  
  &.active {
    background-color: ${props => props.theme.colors.primary};
    color: #fff;
  }
`;

const NavIcon = styled.div`
  margin-right: ${props => props.theme.spacing.sm};
  display: flex;
  align-items: center;
  font-size: 1.2rem;
`;

const NavText = styled.div`
  font-size: 0.9rem;
`;

const Sidebar = ({ isOpen, onClose }) => {
  const { hasRole } = useAuth();
  
  return (
    <SidebarContainer isOpen={isOpen}>
      <LogoContainer>
        <Logo width="180px" />
      </LogoContainer>
      
      <NavContainer>
        <NavSection>
          <NavSectionTitle>General</NavSectionTitle>
          <NavItem to="/" onClick={onClose}>
            <NavIcon><FaHome /></NavIcon>
            <NavText>Inicio</NavText>
          </NavItem>
        </NavSection>
        
        <NavSection>
          <NavSectionTitle>Gestión de Solicitudes</NavSectionTitle>
          <NavItem to="/solicitudes" onClick={onClose}>
            <NavIcon><FaFileAlt /></NavIcon>
            <NavText>Solicitudes</NavText>
          </NavItem>
          <NavItem to="/planos" onClick={onClose}>
            <NavIcon><FaMapMarkedAlt /></NavIcon>
            <NavText>Planos</NavText>
          </NavItem>
        </NavSection>
        
        {hasRole('admin') && (
          <NavSection>
            <NavSectionTitle>Administración</NavSectionTitle>
            <NavItem to="/usuarios" onClick={onClose}>
              <NavIcon><FaUsers /></NavIcon>
              <NavText>Usuarios</NavText>
            </NavItem>
            <NavItem to="/admin/notifications" onClick={onClose}>
              <NavIcon><FaBell /></NavIcon>
              <NavText>Notificaciones</NavText>
            </NavItem>
            <NavItem to="/reportes" onClick={onClose}>
              <NavIcon><FaChartBar /></NavIcon>
              <NavText>Reportes</NavText>
            </NavItem>
            <NavItem to="/configuracion" onClick={onClose}>
              <NavIcon><FaCog /></NavIcon>
              <NavText>Configuración</NavText>
            </NavItem>
          </NavSection>
        )}
      </NavContainer>
    </SidebarContainer>
  );
};

export default Sidebar;
