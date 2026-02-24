import React, { useState } from 'react';
import { deleteUser } from '../services/userManagementService';
import { FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

/**
 * Botón para eliminar usuarios con confirmación
 * @param {Object} props - Propiedades del componente
 * @param {string} props.userId - ID del usuario a eliminar
 * @param {string} props.userName - Nombre del usuario (para confirmación)
 * @param {Function} props.onSuccess - Función a ejecutar tras eliminar exitosamente
 * @param {boolean} props.isSelfDelete - Indica si el usuario está eliminando su propia cuenta
 * @param {string} props.buttonText - Texto personalizado para el botón (opcional)
 * @param {string} props.buttonClassName - Clase CSS personalizada para el botón (opcional)
 * @param {boolean} props.isAdmin - Indica si el usuario actual es administrador
 */
const DeleteUserButton = ({ 
  userId, 
  userName, 
  onSuccess, 
  isSelfDelete = false,
  buttonText = "Eliminar Usuario",
  buttonClassName = "delete-user-btn",
  isAdmin = false
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await deleteUser(userId);
      
      if (isSelfDelete) {
        // Si es auto-eliminación, redirigir al login
        navigate('/login');
      } else {
        // Si es eliminación por admin, ejecutar callback
        onSuccess();
      }
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
    }
  };

  // Verificar si se debe mostrar el botón (solo admin puede eliminar otros usuarios)
  const shouldShowButton = isSelfDelete || isAdmin;

  if (!shouldShowButton) return null;

  return (
    <>
      <button
        className={buttonClassName}
        onClick={() => setIsConfirming(true)}
        type="button"
      >
        <FaTrash /> {buttonText}
      </button>

      {isConfirming && (
        <div className="delete-confirmation">
          <p>
            {isSelfDelete 
              ? "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer."
              : `¿Estás seguro de que deseas eliminar a ${userName}? Esta acción no se puede deshacer.`
            }
          </p>
          <div className="delete-actions">
            <button
              className="btn-confirm"
              onClick={handleDelete}
              type="button"
            >
              Confirmar
            </button>
            <button
              className="btn-cancel"
              onClick={() => setIsConfirming(false)}
              type="button"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteUserButton;