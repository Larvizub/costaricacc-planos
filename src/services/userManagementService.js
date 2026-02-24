import { db } from '../firebase/firebaseConfig';
import { ref, get, set, remove } from 'firebase/database';
import { toast } from 'react-toastify';

/**
 * Obtiene la lista de todos los usuarios
 * @returns {Promise<Array>} - Lista de usuarios
 */
export const getAllUsers = async () => {
  try {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    // Convertir el objeto de Firebase a un array
    const usersData = snapshot.val();
    return Object.entries(usersData).map(([uid, userData]) => ({
      uid,
      ...userData
    }));
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    toast.error('Error al cargar la lista de usuarios');
    throw error;
  }
};

/**
 * Obtiene un usuario específico por UID
 * @param {string} uid - ID del usuario
 * @returns {Promise<Object>} - Datos del usuario
 */
export const getUserById = async (uid) => {
  try {
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      throw new Error('Usuario no encontrado');
    }
    
    return {
      uid,
      ...snapshot.val()
    };
  } catch (error) {
    console.error(`Error al obtener usuario ${uid}:`, error);
    toast.error('Error al cargar los datos del usuario');
    throw error;
  }
};

/**
 * Actualiza los roles, grupos de aprobación y permisos de un usuario
 * @param {string} uid - ID del usuario
 * @param {Object} userData - Datos actualizados
 * @returns {Promise<boolean>} - Éxito de la operación
 */
export const updateUserRoles = async (uid, userData) => {
  try {
    const { roles, accessLevel, userGroups } = userData;
    
    // Comprobar que tenemos los datos necesarios
    if (!uid || !roles) {
      console.error('Datos incompletos para actualizar roles:', { uid, roles, accessLevel });
      throw new Error('Datos de usuario incompletos');
    }
    
    console.log(`Actualizando datos para usuario ${uid}:`, { 
      roles, 
      accessLevel,
      userGroups: userGroups || 'No especificados'
    });
    
    // Asegurarnos de que roles sea un array
    const normalizedRoles = Array.isArray(roles) ? roles : [roles];
    
    // Asegurarnos de que userGroups sea un array si está presente
    const normalizedUserGroups = userGroups 
      ? (Array.isArray(userGroups) ? userGroups : [userGroups])
      : undefined;
    
    // Referencia al usuario en Firebase
    const userRef = ref(db, `users/${uid}`);
    
    // Obtener datos actuales para preservar otros campos
    const snapshot = await get(userRef);
    const currentData = snapshot.exists() ? snapshot.val() : {};
    
    // Preparar datos para actualizar
    const updateData = {
      ...currentData,
      roles: normalizedRoles,
      // Eliminamos cualquier campo 'role' para evitar inconsistencias
      role: null,
      accessLevel: accessLevel || 'Básico',
      updatedAt: new Date().toISOString()
    };
    
    // Agregar userGroups explícitamente si están definidos
    if (normalizedUserGroups) {
      updateData.userGroups = normalizedUserGroups;
    }
    
    // Usar set con merge para actualizar
    await set(userRef, updateData);
    
    console.log('Roles actualizados exitosamente');
    toast.success('Roles y permisos actualizados con éxito');
    return true;
  } catch (error) {
    console.error('Error al actualizar roles del usuario:', error);
    toast.error('Error al actualizar roles y permisos: ' + error.message);
    throw error;
  }
};

/**
 * Busca usuarios por nombre, email o departamento
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Promise<Array>} - Lista de usuarios que coinciden
 */
export const searchUsers = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      return getAllUsers();
    }
    
    // Obtenemos todos los usuarios y filtramos en el cliente
    // (Firebase RTDB no soporta búsqueda de texto completo)
    const users = await getAllUsers();
    const searchTermLower = searchTerm.toLowerCase();
    
    return users.filter(user => 
      (user.displayName && user.displayName.toLowerCase().includes(searchTermLower)) ||
      (user.email && user.email.toLowerCase().includes(searchTermLower)) ||
      (user.department && user.department.toLowerCase().includes(searchTermLower))
    );
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    toast.error('Error al realizar la búsqueda');
    throw error;
  }
};

/**
 * Elimina un usuario de la base de datos
 * @param {string} uid - ID del usuario a eliminar
 * @returns {Promise<boolean>} - Éxito de la operación
 */
export const deleteUser = async (uid) => {
  try {
    if (!uid) {
      throw new Error('ID de usuario no válido');
    }
    
    // Verificar que el usuario existe
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      throw new Error('Usuario no encontrado');
    }
    
    // Eliminar el usuario
    await remove(userRef);
    
    console.log(`Usuario ${uid} eliminado con éxito`);
    toast.success('Usuario eliminado correctamente');
    return true;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    toast.error(`Error al eliminar usuario: ${error.message}`);
    throw error;
  }
};
