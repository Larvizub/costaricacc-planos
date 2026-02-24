import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUserShield, FaCheck, FaUser } from 'react-icons/fa';
import styled from 'styled-components';

const RoleContainer = styled.div`
  margin: 10px 0;
`;

const RoleBadge = styled.span`
  display: inline-flex;
  align-items: center;
  background-color: ${props => props.isAdmin ? '#f8d7da' : '#e9ecef'};
  color: ${props => props.isAdmin ? '#721c24' : '#212529'};
  padding: 5px 10px;
  margin-right: 5px;
  margin-bottom: 5px;
  border-radius: 4px;
  font-size: 0.9rem;
  gap: 4px;
`;

/**
 * Componente para mostrar roles del usuario con iconos descriptivos
 * Este componente obtiene los roles directamente del contexto Auth
 * para asegurar que siempre muestra la información más actualizada
 */
const RoleDisplay = () => {
  const { userRoles, accessLevel } = useAuth();
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    // Asegurar que siempre tengamos un array de roles
    if (userRoles && userRoles.length > 0) {
      console.log('RoleDisplay: Actualizando roles desde contexto:', userRoles);
      // Eliminar duplicados si hay alguno (por seguridad)
      const uniqueRoles = [...new Set(userRoles.map(role => role.toLowerCase()))].map(role => {
        // Si es un rol admin, asegurarnos de que se muestre como 'admin' para consistencia
        if (role === 'admin' || role.includes('admin') || role === 'administrador') {
          return 'Administrador';
        }
        // Capitalizar primera letra de otros roles
        return role.charAt(0).toUpperCase() + role.slice(1);
      });
      setRoles(uniqueRoles);
    } else {
      console.log('RoleDisplay: No se encontraron roles, mostrando predeterminado');
      setRoles(['Cliente']); // Rol predeterminado
    }
  }, [userRoles]);

  // Verificar si un rol es administrativo para mostrar icono
  const isAdminRole = (role) => {
    return role.toLowerCase() === 'admin' || 
           role.toLowerCase().includes('admin') || 
           role.toLowerCase() === 'administrador';
  };

  // Mapear roles a iconos
  const getRoleIcon = (role) => {
    if (isAdminRole(role)) {
      return <FaUserShield />;
    }
    switch(role.toLowerCase()) {
      case 'revisor':
        return <FaCheck />;
      default:
        return <FaUser />;
    }
  };

  return (
    <RoleContainer>
      <div><strong>Roles asignados:</strong></div>
      <div style={{ marginTop: '5px' }}>
        {roles.map((role, index) => (
          <RoleBadge 
            key={index}
            isAdmin={isAdminRole(role)}
          >
            {getRoleIcon(role)} {role}
          </RoleBadge>
        ))}
      </div>
      <div style={{ marginTop: '10px' }}>
        <strong>Nivel de acceso:</strong> {accessLevel || 'Básico'}
      </div>
    </RoleContainer>
  );
};

export default RoleDisplay;
