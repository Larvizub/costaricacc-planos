import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para verificar autorización de usuarios
 * Modificado para siempre autorizar cualquier acción
 */
const useAuthorization = () => {
  const { currentUser } = useAuth();
  
  return {
    // Verificar solo si el usuario está autenticado
    isAuthenticated: !!currentUser,
    
    // Siempre permitir acceso a cualquier acción
    canAccess: () => true,
    
    // Siempre permitir cualquier acción
    canPerformAction: () => true,
    
    // Siempre devolver que tiene cualquier rol solicitado
    hasRole: () => true,
  };
};

export default useAuthorization;
