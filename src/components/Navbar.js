import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaBars, FaTimes, FaHome, FaFileAlt, FaMapMarkedAlt, FaUsers, FaBell } from 'react-icons/fa';
import { theme } from '../styles/GlobalStyles';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const NavbarContainer = styled.header`
  background-color: #fff;
  box-shadow: ${theme.shadows.small};
  padding: 0 ${theme.spacing.lg};
  position: sticky;
  top: 0;
  z-index: 100;
`;

const NavbarContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
`;

const NavbarLogo = styled.div`
  display: flex;
  align-items: center;
`;

const NavMenu = styled.nav`
  display: flex;
  align-items: center;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    /* En móviles pequeños, ocultamos el menú superior (usaremos BottomNav) */
    display: none !important;
  }
`;

const NavItem = styled(Link)`
  color: ${theme.colors.text};
  text-decoration: none;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.small};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: ${theme.colors.backgroundAlt};
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing.sm} 0;
    width: 100%;
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
`;

const UserMenuToggle = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  color: ${theme.colors.text};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.small};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${theme.colors.backgroundAlt};
  }
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: ${theme.spacing.sm};
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserMenuDropdown = styled.div`
  position: absolute;
  top: 60px;
  right: ${theme.spacing.lg};
  background-color: #fff;
  box-shadow: ${theme.shadows.medium};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.sm} 0;
  min-width: 180px;
  z-index: 200;
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
`;

const UserMenuItem = styled(Link)`
  display: flex;
  align-items: center;
  color: ${theme.colors.text};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${theme.colors.backgroundAlt};
  }
  
  svg {
    margin-right: ${theme.spacing.sm};
  }
`;

const UserMenuButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  color: ${theme.colors.text};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${theme.colors.backgroundAlt};
  }
  
  svg {
    margin-right: ${theme.spacing.sm};
  }
`;

const MenuToggle = styled.button`
  display: none; /* ocultamos el botón hamburguesa por defecto */
  background: none;
  border: none;
  cursor: pointer;
  color: ${theme.colors.text};
  font-size: 1.5rem;
  
  /* Forzadamente oculto en móvil para usar BottomNav */
  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

const Divider = styled.div`
  height: 1px;
  background-color: ${theme.colors.border};
  margin: ${theme.spacing.xs} 0;
`;

const Navbar = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, userProfile, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
  
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };
  
  return (
    <NavbarContainer>
      <NavbarContent>
        <NavbarLogo>
          <Link to="/">
            <Logo width="100px" />
          </Link>
        </NavbarLogo>
        
        <MenuToggle onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </MenuToggle>
        
        <NavMenu isOpen={mobileMenuOpen}>
          <NavItem to="/" onClick={() => setMobileMenuOpen(false)}>
            <FaHome /> Inicio
          </NavItem>
          <NavItem to="/solicitudes" onClick={() => setMobileMenuOpen(false)}>
            <FaFileAlt /> Solicitudes
          </NavItem>
          <NavItem to="/planos" onClick={() => setMobileMenuOpen(false)}>
            <FaMapMarkedAlt /> Planos
          </NavItem>
          <NavItem to="/usuarios" onClick={() => setMobileMenuOpen(false)}>
            <FaUsers /> Usuarios
          </NavItem>
        </NavMenu>
        
        <NavActions>
          {currentUser ? (
            <>
              <UserMenuToggle onClick={toggleUserMenu}>
                <UserAvatar>
                  {userProfile?.photo ? (
                    <img src={userProfile.photo} alt="Perfil" />
                  ) : (
                    getInitial(currentUser.displayName)
                  )}
                </UserAvatar>
                {currentUser.displayName}
              </UserMenuToggle>
              
              <UserMenuDropdown isOpen={userMenuOpen}>
                <UserMenuItem to="/perfil" onClick={() => setUserMenuOpen(false)}>
                  <FaUser /> Perfil
                </UserMenuItem>
                {hasRole('admin') && (
                  <>
                    <UserMenuItem to="/admin/notifications" onClick={() => setUserMenuOpen(false)}>
                      <FaBell /> Notificaciones
                    </UserMenuItem>
                    <UserMenuItem to="/usuarios" onClick={() => setUserMenuOpen(false)}>
                      <FaUsers /> Usuarios
                    </UserMenuItem>
                  </>
                )}
                <Divider />
                <UserMenuButton onClick={handleLogout}>
                  <FaSignOutAlt /> Cerrar sesión
                </UserMenuButton>
              </UserMenuDropdown>
            </>
          ) : (
            <NavItem to="/login">Iniciar sesión</NavItem>
          )}
        </NavActions>
      </NavbarContent>
    </NavbarContainer>
  );
};

export default Navbar;
