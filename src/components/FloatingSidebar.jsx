import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FaHome, FaFileAlt, FaMapMarkedAlt, FaUsers, FaBell, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { theme } from '../styles/GlobalStyles';
import { useAuth } from '../context/AuthContext';

const SidebarShell = styled.aside`
  position: fixed;
  top: 76px;
  left: ${theme.spacing.md};
  bottom: ${theme.spacing.md};
  width: ${({ $expanded }) => ($expanded ? '228px' : '78px')};
  background: ${theme.colors.card};
  border: 1px solid ${theme.colors.border};
  border-radius: 16px;
  box-shadow: ${theme.shadows.medium};
  z-index: 95;
  overflow: visible;
  transition: width 0.24s ease;
  display: flex;
  flex-direction: column;

  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

const SidebarHeader = styled.div`
  min-height: 74px;
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: ${({ $expanded }) => ($expanded ? 'flex-start' : 'center')};
  gap: ${({ $expanded }) => ($expanded ? theme.spacing.sm : '0px')};
`;

const BrandMark = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: ${theme.colors.primary};
  color: #fff;
  font-weight: 700;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const BrandText = styled.span`
  color: ${theme.colors.text};
  font-size: 0.88rem;
  font-weight: 600;
  white-space: nowrap;
  display: ${({ $expanded }) => ($expanded ? 'inline' : 'none')};
`;

const NavList = styled.nav`
  flex: 1;
  padding: ${theme.spacing.md} ${theme.spacing.sm};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: ${({ $expanded }) => ($expanded ? 'flex-start' : 'center')};
  gap: ${({ $expanded }) => ($expanded ? theme.spacing.sm : '0px')};
  min-height: ${({ $expanded }) => ($expanded ? '46px' : '44px')};
  width: ${({ $expanded }) => ($expanded ? '100%' : '44px')};
  align-self: ${({ $expanded }) => ($expanded ? 'stretch' : 'center')};
  padding: ${({ $expanded }) => ($expanded ? `${theme.spacing.sm} ${theme.spacing.md}` : '0px')};
  border-radius: 12px;
  text-decoration: none;
  color: ${theme.colors.textLight};
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;

  &:hover {
    background-color: ${theme.colors.backgroundAlt};
    color: ${theme.colors.primaryDark};
    transform: translateY(-1px);
  }

  &.active {
    background-color: ${theme.colors.primary};
    color: #fff;
    box-shadow: 0 8px 18px rgba(0, 131, 14, 0.2);
  }
`;

const NavIcon = styled.div`
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  min-width: 22px;
`;

const NavLabel = styled.span`
  white-space: nowrap;
  font-size: 0.92rem;
  font-weight: 600;
  display: ${({ $expanded }) => ($expanded ? 'inline' : 'none')};
`;

const SidebarFooter = styled.div`
  margin-top: auto;
  border-top: 1px solid ${theme.colors.border};
  padding: ${theme.spacing.sm};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const UserQuickAction = styled.button`
  display: flex;
  align-items: center;
  justify-content: ${({ $expanded }) => ($expanded ? 'flex-start' : 'center')};
  gap: ${({ $expanded }) => ($expanded ? theme.spacing.sm : '0px')};
  min-height: 46px;
  width: ${({ $expanded }) => ($expanded ? '100%' : '44px')};
  align-self: ${({ $expanded }) => ($expanded ? 'stretch' : 'center')};
  padding: ${({ $expanded }) => ($expanded ? `6px ${theme.spacing.sm}` : '0px')};
  border: none;
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  color: ${theme.colors.text};
  transition: background-color 0.2s ease;

  &:hover {
    background: ${theme.colors.backgroundAlt};
  }
`;

const UserInitialBadge = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: ${theme.colors.primary};
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const UserText = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${theme.colors.text};
  display: ${({ $expanded }) => ($expanded ? 'inline' : 'none')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserMenuPanel = styled.div`
  display: ${({ $open, $expanded }) => ($open && $expanded ? 'flex' : 'none')};
  flex-direction: column;
  gap: 2px;
  background: ${theme.colors.card};
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  padding: ${theme.spacing.xs};
  box-shadow: ${theme.shadows.small};
`;

const UserActionLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  min-height: 40px;
  padding: 0 ${theme.spacing.sm};
  text-decoration: none;
  color: ${theme.colors.text};
  border-radius: 10px;

  &:hover {
    background: ${theme.colors.backgroundAlt};
  }
`;

const UserActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  min-height: 40px;
  width: 100%;
  padding: 0 ${theme.spacing.sm};
  border: none;
  background: transparent;
  color: ${theme.colors.text};
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background: ${theme.colors.backgroundAlt};
  }
`;

const FloatingSidebar = () => {
  const [expanded, setExpanded] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { hasRole, currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const getInitial = (nameOrEmail) => {
    return nameOrEmail ? nameOrEmail.charAt(0).toUpperCase() : 'U';
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const links = useMemo(() => {
    const baseLinks = [
      { to: '/', label: 'Inicio', icon: <FaHome />, end: true },
      { to: '/solicitudes', label: 'Solicitudes', icon: <FaFileAlt /> },
      { to: '/planos', label: 'Planos', icon: <FaMapMarkedAlt /> },
      { to: '/usuarios', label: 'Usuarios', icon: <FaUsers /> },
    ];

    if (hasRole('admin')) {
      baseLinks.push({ to: '/admin/notifications', label: 'Notificaciones', icon: <FaBell /> });
    }

    return baseLinks;
  }, [hasRole]);

  return (
    <SidebarShell
      $expanded={expanded}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => {
        setExpanded(false);
        setUserMenuOpen(false);
      }}
    >
      <SidebarHeader $expanded={expanded}>
        <BrandMark>CR</BrandMark>
        <BrandText $expanded={expanded}>Navegacion</BrandText>
      </SidebarHeader>

      <NavList>
        {links.map((link) => (
          <NavItem key={link.to} to={link.to} end={link.end} $expanded={expanded}>
            <NavIcon>{link.icon}</NavIcon>
            <NavLabel $expanded={expanded}>{link.label}</NavLabel>
          </NavItem>
        ))}
      </NavList>

      <SidebarFooter>
        <UserMenuPanel $open={userMenuOpen} $expanded={expanded}>
          <UserActionLink to="/perfil" onClick={() => setUserMenuOpen(false)}>
            <FaUser /> Perfil
          </UserActionLink>
          {hasRole('admin') && (
            <>
              <UserActionLink to="/admin/notifications" onClick={() => setUserMenuOpen(false)}>
                <FaBell /> Notificaciones
              </UserActionLink>
              <UserActionLink to="/usuarios" onClick={() => setUserMenuOpen(false)}>
                <FaUsers /> Usuarios
              </UserActionLink>
            </>
          )}
          <UserActionButton type="button" onClick={handleLogout}>
            <FaSignOutAlt /> Cerrar sesion
          </UserActionButton>
        </UserMenuPanel>

        <UserQuickAction
          type="button"
          $expanded={expanded}
          onClick={() => setUserMenuOpen((prev) => !prev)}
          title="Gestionar usuario"
        >
          <UserInitialBadge>
            {getInitial(currentUser?.displayName || userProfile?.displayName || currentUser?.email)}
          </UserInitialBadge>
          <UserText $expanded={expanded}>
            {currentUser?.displayName || 'Mi cuenta'}
          </UserText>
        </UserQuickAction>
      </SidebarFooter>
    </SidebarShell>
  );
};

export default FloatingSidebar;