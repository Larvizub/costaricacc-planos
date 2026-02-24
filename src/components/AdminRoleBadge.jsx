import React from 'react';
import styled from 'styled-components';
import { FaUserShield } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #f8d7da;
  color: #721c24;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-left: 10px;
`;

/**
 * Componente que muestra un distintivo de administrador si el usuario
 * tiene el rol de admin. Útil para mostrar en la UI elementos que indiquen
 * los privilegios de administrador.
 */
const AdminRoleBadge = () => {
  const { userRoles, accessLevel } = useAuth();
  
  // Verificar si el usuario es administrador revisando todas las condiciones posibles
  const isAdmin = 
    // Comprobar en arreglo de roles
    (userRoles?.some(role => 
      role.toLowerCase() === 'admin' || 
      role.toLowerCase().includes('admin') ||
      role.toLowerCase() === 'administrador')) || 
    // Comprobar por nivel de acceso
    accessLevel === 'Administrador' || 
    accessLevel === 'Avanzado';
  
  // Solo mostrar el distintivo si el usuario es administrador
  if (!isAdmin) return null;
  
  return (
    <Badge>
      <FaUserShield /> Administrador
    </Badge>
  );
};

export default AdminRoleBadge;
