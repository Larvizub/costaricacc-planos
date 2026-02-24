import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Componente que renderiza su contenido dependiendo de los roles del usuario
 * Modificado para mostrar contenido a cualquier usuario sin restricción
 */
const RoleBasedComponent = ({ 
  children, 
  requiredRoles = [], 
  fallback = null 
}) => {
  // Ya no necesitamos verificar roles, siempre mostramos el contenido
  return children;
};

export default RoleBasedComponent;
