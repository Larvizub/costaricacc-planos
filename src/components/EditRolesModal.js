import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from 'react-modal';

const EditRolesModal = ({ isOpen, onClose, initialRoles, initialLevel }) => {
  const { updateUserPermissions } = useAuth();
  const [rolesSeleccionados, setRolesSeleccionados] = useState(initialRoles);
  const [nivelSeleccionado, setNivelSeleccionado] = useState(initialLevel);
  const [error, setError] = useState('');

  const handleGuardar = async () => {
    try {
      // ahora: persiste en Firebase y actualiza contexto
      await updateUserPermissions(rolesSeleccionados, nivelSeleccionado);
      onClose();
    } catch (err) {
      console.error('Error al actualizar los roles:', err);
      setError(`Error al actualizar los roles: ${err.message}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose}>
      <h2>Editar Roles y Permisos</h2>
      {/* Aquí irían los inputs o selects para modificar roles y nivel */}
      <div>
        <label>Roles:</label>
        <input
          type="text"
          value={rolesSeleccionados}
          onChange={(e) => setRolesSeleccionados(e.target.value)}
        />
      </div>
      <div>
        <label>Nivel de Acceso:</label>
        <select
          value={nivelSeleccionado}
          onChange={(e) => setNivelSeleccionado(e.target.value)}
        >
          <option value="basico">Básico</option>
          <option value="avanzado">Avanzado</option>
        </select>
      </div>
      {error && <div className="error">{error}</div>}
      <button onClick={handleGuardar}>Guardar Cambios</button>
      <button onClick={onClose}>Cancelar</button>
    </Modal>
  );
};

export default EditRolesModal;