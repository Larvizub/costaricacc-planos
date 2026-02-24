/**
 * Servicio simplificado para gestionar usuarios de Microsoft
 */
import { auth, db } from '../firebase/firebaseConfig';
import { getUserData, getUserProfilePhoto } from './microsoftGraphService';
import { ref, get, set } from 'firebase/database';
import { toast } from 'react-toastify';

/**
 * Obtiene el perfil completo del usuario
 * @returns {Promise<Object>} Datos del perfil del usuario
 */
export const getUserProfile = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No hay usuario autenticado');
    }
    
    // Obtener datos guardados en Firebase
    const userRef = ref(db, `users/${currentUser.uid}`);
    const snapshot = await get(userRef);
    const userData = snapshot.exists() ? snapshot.val() : {};
    
    // Verificar si es cuenta Microsoft
    const isMicrosoftAccount = currentUser.providerData.some(p => p.providerId === 'microsoft.com');
    
    // Normalizar roles para asegurar que sea un array
    let userRoles = [];
    
    // Primero verificamos si hay field 'roles' 
    if (userData.roles) {
      if (typeof userData.roles === 'string') {
        userRoles = userData.roles.split(',').map(r => r.trim()).filter(r => r);
      } else if (Array.isArray(userData.roles)) {
        userRoles = userData.roles;
      }
    } 
    // Si no hay 'roles', verificamos 'role' por compatibilidad
    else if (userData.role) {
      if (typeof userData.role === 'string') {
        userRoles = userData.role.split(',').map(r => r.trim()).filter(r => r);
      } else if (Array.isArray(userData.role)) {
        userRoles = userData.role;
      }
    }
    
    // Si no hay roles, usar 'cliente' por defecto
    if (userRoles.length === 0) {
      userRoles = ['cliente'];
    }
    
    // Verificar si tiene nivel de acceso que debería tener rol de admin
    if ((userData.accessLevel === 'Administrador' || userData.accessLevel === 'Avanzado') && 
        !userRoles.some(r => r.toLowerCase() === 'admin')) {
      userRoles.push('admin');
    }
    
    console.log('Roles normalizados para el usuario:', {
      uid: currentUser.uid,
      email: currentUser.email,
      roles: userRoles,
      accessLevel: userData.accessLevel || 'Básico'
    });
    
    let profileData = {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName || userData.displayName || 'Usuario',
      photo: currentUser.photoURL || userData.photo || null,
      department: userData.department || 'No especificado',
      jobTitle: userData.jobTitle || 'No especificado',
      // Usamos los roles normalizados
      roles: userRoles,
      accessLevel: userData.accessLevel || 'Básico',
      microsoftAccount: isMicrosoftAccount
    };      // Si es cuenta Microsoft, intentar obtener datos actualizados
      if (isMicrosoftAccount) {
        try {
          console.log('Obteniendo datos recientes desde Microsoft Graph para cuenta Microsoft');
          
          // Obtener datos desde Graph API
          const graphData = await getUserData(currentUser);
          console.log('Datos recibidos de Microsoft Graph:', graphData);
          
          if (graphData) {
            // Procesamiento más controlado para evitar mezclar datos
            // Solo usamos valores de Microsoft si existen y no son "No especificado"
            if (graphData.department && graphData.department !== 'No especificado') {
              profileData.department = graphData.department;
              console.log('Actualizando department con valor de Microsoft:', graphData.department);
            } else {
              console.log('Manteniendo department existente:', profileData.department);
            }
            
            if (graphData.jobTitle && graphData.jobTitle !== 'No especificado') {
              profileData.jobTitle = graphData.jobTitle;
              console.log('Actualizando jobTitle con valor de Microsoft:', graphData.jobTitle);
            } else {
              console.log('Manteniendo jobTitle existente:', profileData.jobTitle);
            }
            
            if (graphData.displayName) {
              profileData.displayName = graphData.displayName;
            }
            
            // Actualizar base de datos con datos nuevos
            console.log('Guardando datos en Firebase:', {
              department: profileData.department,
              jobTitle: profileData.jobTitle,
              displayName: profileData.displayName
            });
            
            await set(userRef, {
              department: profileData.department,
              jobTitle: profileData.jobTitle,
              displayName: profileData.displayName,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
        
        // Obtener foto de perfil
        const photoURL = await getUserProfilePhoto(currentUser);
        if (photoURL) {
          profileData.photo = photoURL;
          
          // Actualizar foto en Firebase si cambió
          if (photoURL !== userData.photo) {
            await set(userRef, { photo: photoURL }, { merge: true });
          }
        }
      } catch (graphError) {
        console.error('Error al obtener datos de Microsoft Graph:', graphError);
      }
    }
    
    return profileData;
  } catch (error) {
    console.error('Error al obtener perfil de usuario:', error);
    throw error;
  }
};

/**
 * Actualiza el perfil del usuario
 * @param {Object} profileData - Datos a actualizar
 * @returns {Promise<boolean>} - Éxito de la operación
 */
export const updateUserProfile = async (profileData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No hay usuario autenticado');
    }
    
    // Referencia a datos en Firebase
    const userRef = ref(db, `users/${currentUser.uid}`);
    const snapshot = await get(userRef);
    const currentData = snapshot.exists() ? snapshot.val() : {};
    
    // Verificar si es cuenta Microsoft
    const isMicrosoftAccount = currentUser.providerData.some(p => p.providerId === 'microsoft.com');
    
    // Si es cuenta Microsoft, no permitir cambios en department y jobTitle
    const { department, jobTitle, ...restProfileData } = profileData;
    
    // Normalizar los roles existentes
    let existingRoles = [];
    if (currentData.roles) {
      if (typeof currentData.roles === 'string') {
        existingRoles = currentData.roles.split(',').map(r => r.trim()).filter(r => r);
      } else if (Array.isArray(currentData.roles)) {
        existingRoles = currentData.roles;
      }
    } 
    // Compatibilidad con campo legacy "role"
    else if (currentData.role) {
      if (typeof currentData.role === 'string') {
        existingRoles = currentData.role.split(',').map(r => r.trim()).filter(r => r);
      } else if (Array.isArray(currentData.role)) {
        existingRoles = currentData.role;
      }
    }
    
    // Si no hay roles, usar 'cliente' por defecto
    if (existingRoles.length === 0) {
      existingRoles = ['cliente'];
    }
    
    console.log('Preservando roles existentes en la actualización del perfil:', existingRoles);
    
    // Datos actualizados
    const updatedData = {
      ...currentData,
      ...restProfileData,
      // Mantener valores existentes si es cuenta Microsoft
      department: isMicrosoftAccount ? currentData.department : (department || currentData.department || 'No especificado'),
      jobTitle: isMicrosoftAccount ? currentData.jobTitle : (jobTitle || currentData.jobTitle || 'No especificado'),
      // CORREGIDO: Preservamos roles existentes de manera adecuada
      roles: existingRoles,
      // Eliminamos campo legacy "role" para evitar inconsistencias
      role: null,
      accessLevel: currentData.accessLevel || 'Básico', // Conservar nivel de acceso existente
      microsoftAccount: isMicrosoftAccount,
      updatedAt: new Date().toISOString()
    };
    
    // Guardar datos
    await set(userRef, updatedData);
    toast.success('Perfil actualizado con éxito');
    return true;
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    toast.error('Error al actualizar el perfil: ' + error.message);
    throw error;
  }
};

/**
 * Refresca datos del usuario de Microsoft
 * @returns {Promise<Object|null>} - Datos actualizados o null
 */
export const refreshMicrosoftUserData = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    
    // Verificar si es cuenta Microsoft
    if (!currentUser.providerData.some(p => p.providerId === 'microsoft.com')) {
      return null;
    }
    
    // Obtener datos frescos
    const graphData = await getUserData(currentUser);
    if (graphData) {
      // Actualizar en Firebase
      const userRef = ref(db, `users/${currentUser.uid}`);
      await set(userRef, {
        department: graphData.department,
        jobTitle: graphData.jobTitle,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      return graphData;
    }
    
    return null;
  } catch (error) {
    console.error('Error al refrescar datos de Microsoft:', error);
    return null;
  }
};

/**
 * Función para probar si podemos obtener datos de Microsoft Graph
 * Esta función es solo para diagnóstico y no debe interrumpir el flujo principal
 * @param {Object} user - Usuario autenticado con Firebase
 * @returns {Promise<Object>} - Resultado de la prueba
 */
export const testMicrosoftData = async (user) => {
  try {
    if (!user) return { success: false, error: 'No hay usuario' };
    
    // Verificar si es cuenta Microsoft
    const isMicrosoftAccount = user.providerData?.some(p => p.providerId === 'microsoft.com');
    if (!isMicrosoftAccount) {
      return { success: false, error: 'No es una cuenta de Microsoft' };
    }
    
    // Intentar obtener token (sin lanzar error)
    const { getGraphAccessToken } = await import('./microsoftGraphService');
    const accessToken = await getGraphAccessToken(user);
    
    if (!accessToken) {
      return { 
        success: false, 
        error: 'No se pudo obtener token',
        critical: false // No es un error crítico
      };
    }
    
    // Intentar obtener datos básicos (sin lanzar error)
    try {
      const { getUserData } = await import('./microsoftGraphService');
      const userData = await getUserData(user);
      
      return {
        success: true,
        data: userData,
        token: accessToken ? '✓ Disponible' : '✗ No disponible'
      };
    } catch (dataError) {
      return { 
        success: false, 
        error: `Error al obtener datos: ${dataError.message}`,
        critical: false // No es un error crítico
      };
    }
  } catch (error) {
    // Nunca debe interrumpir el flujo, siempre devuelve un objeto
    return { 
      success: false, 
      error: error.message,
      critical: false
    };
  }
};
