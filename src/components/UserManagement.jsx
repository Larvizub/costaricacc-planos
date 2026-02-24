import React, { useState, useEffect } from 'react';
import { getAllUsers, searchUsers } from '../services/userManagementService';
import DeleteUserButton from './DeleteUserButton';
import { useAuth } from '../context/AuthContext';
import { FaSearch } from 'react-icons/fa';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser, userRoles, accessLevel, debugCurrentUserRoles, refreshUserRoles } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar si el usuario actual es administrador
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (currentUser?.uid) {
        try {
          // Mostrar información de depuración de roles
          debugCurrentUserRoles();
          
          // Primera verificación basada en roles actuales
          let isAdmin = 
            (userRoles && userRoles.some(role => 
              role.toLowerCase() === 'admin' || 
              role.toLowerCase().includes('admin') ||
              role.toLowerCase() === 'administrador')) || 
            accessLevel === 'Administrador' || 
            accessLevel === 'Avanzado';
          
          // Si no es admin, intentamos refrescar roles desde Firebase
          if (!isAdmin) {
            console.log('Usuario no parece ser admin, intentando refrescar roles...');
            await refreshUserRoles(); // Usamos la función del contexto ya extraída
            
            // Verificamos nuevamente con roles actualizados
            isAdmin = 
              (userRoles && userRoles.some(role => 
                role.toLowerCase() === 'admin' || 
                role.toLowerCase().includes('admin'))) || 
              accessLevel === 'Administrador' || 
              accessLevel === 'Avanzado';
          }
          
          console.log('Verificación final de roles admin:', { 
            userRoles, 
            accessLevel, 
            isAdmin,
            userId: currentUser.uid,
            email: currentUser.email
          });
          
          setIsAdmin(isAdmin);
          if (!isAdmin) {
            console.warn('Acceso restringido: Usuario no es administrador');
          }
        } catch (error) {
          console.error('Error al verificar rol de administrador:', error);
        }
      }
    };

    checkAdminStatus();
  }, [currentUser, userRoles, accessLevel, debugCurrentUserRoles]);

  // Cargar usuarios
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const usersData = await getAllUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  // Manejar búsqueda
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const results = await searchUsers(searchTerm);
      setUsers(results);
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refrescar lista de usuarios después de eliminar uno
  const refreshUsers = async () => {
    try {
      setLoading(true);
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error al refrescar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="access-denied">
        <h2>Acceso Restringido</h2>
        <p>No tienes permisos para acceder a la administración de usuarios.</p>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <h2>Administración de Usuarios</h2>

      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Buscar por nombre, email o departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">
            <FaSearch /> Buscar
          </button>
        </div>
      </form>

      {loading ? (
        <div className="loading">Cargando usuarios...</div>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Departamento</th>
              <th>Roles</th>
              <th>Nivel de acceso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.uid}>
                  <td>{user.displayName || 'Sin nombre'}</td>
                  <td>{user.email}</td>
                  <td>{user.department || 'No asignado'}</td>
                  <td>
                    {user.roles && Array.isArray(user.roles) 
                      ? user.roles.join(', ') 
                      : 'Sin roles'}
                  </td>
                  <td>{user.accessLevel || 'Básico'}</td>
                  <td className="action-buttons">
                    {/* Botón de edición y otros controles */}
                    
                    {/* Botón de eliminación */}
                    <DeleteUserButton 
                      userId={user.uid}
                      userName={user.displayName || user.email}
                      onSuccess={refreshUsers}
                      isAdmin={isAdmin}
                      buttonText="Eliminar"
                      buttonClassName="admin-delete-btn"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-results">
                  No se encontraron usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManagement;
