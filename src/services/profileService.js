import { auth, db, storage } from '../firebase/firebaseConfig';
import { ref as dbRef, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';

/**
 * Sube una imagen al storage de Firebase y actualiza la foto de perfil del usuario
 * @param {File} file - Archivo de imagen a subir
 * @returns {Promise<string>} URL de la imagen subida
 */
export const uploadProfileImage = async (file) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No hay usuario autenticado');

    // Validar que sea una imagen
    if (!file.type.includes('image/')) {
      throw new Error('El archivo debe ser una imagen (jpg, png, etc.)');
    }

    // Limitar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('La imagen es demasiado grande. Máximo 5MB.');
    }

    // Definir ruta en el storage
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile_${currentUser.uid}_${Date.now()}.${fileExtension}`;
    const imageRef = storageRef(storage, `profile_images/${fileName}`);

    // Subir imagen
    const snapshot = await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Actualizar perfil en Firebase Auth
    await updateProfile(currentUser, {
      photoURL: downloadURL
    });

    // Actualizar perfil en Realtime Database
    const userRef = dbRef(db, `users/${currentUser.uid}`);
    await update(userRef, {
      photoURL: downloadURL,
      updatedAt: new Date().toISOString()
    });

    return downloadURL;
  } catch (error) {
    console.error('Error al subir imagen de perfil:', error);
    throw error;
  }
};

/**
 * Elimina la foto de perfil del usuario
 * @returns {Promise<void>}
 */
export const removeProfileImage = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No hay usuario autenticado');

    // Actualizar perfil en Firebase Auth
    await updateProfile(currentUser, {
      photoURL: null
    });

    // Actualizar perfil en Realtime Database
    const userRef = dbRef(db, `users/${currentUser.uid}`);
    await update(userRef, {
      photoURL: null,
      updatedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error al eliminar imagen de perfil:', error);
    throw error;
  }
};

/**
 * Obtiene el departamento y cargo directamente desde Microsoft Graph API
 * @param {Object} user - Usuario Firebase
 * @returns {Promise<Object>} - Datos de departamento y cargo
 */
export const getMicrosoftDepartmentAndJob = async (user) => {
  try {
    // Importar el servicio de Microsoft Graph
    const { getMicrosoftJobAndDepartment } = await import('./microsoftGraphService');
    
    // Obtener los datos específicos
    const data = await getMicrosoftJobAndDepartment(user);
    
    // Solo retornar valores reales, no valores por defecto
    return {
      department: data.department !== 'No especificado' ? data.department : null,
      jobTitle: data.jobTitle !== 'No especificado' ? data.jobTitle : null
    };
  } catch (error) {
    console.error('Error al obtener departamento y cargo desde Microsoft:', error);
    return { department: null, jobTitle: null };
  }
};

/**
 * Verifica si los datos departamento y cargo son accesibles para el usuario actual
 * a través de Microsoft Graph API
 * @returns {Promise<Object>} - Resultado del diagnóstico
 */
export const diagnoseMicrosoftProfileAccess = async () => {
  try {
    const { currentUser } = await import('../firebase/firebaseConfig').then(m => m.auth);
    if (!currentUser) {
      return { 
        success: false, 
        message: 'No hay usuario autenticado',
        hasMicrosoftProvider: false
      };
    }
    
    // Verificar si el usuario tiene proveedor Microsoft
    const microsoftProvider = currentUser.providerData.find(p => p.providerId === 'microsoft.com');
    if (!microsoftProvider) {
      return {
        success: false,
        message: 'El usuario no está autenticado con Microsoft',
        hasMicrosoftProvider: false
      };
    }
    
    // Importar funciones de diagnóstico
    const { 
      diagnoseMicrosoftGraphIssues, 
      getMicrosoftJobAndDepartment 
    } = await import('./microsoftGraphService');
    
    // Ejecutar diagnóstico completo
    const diagResult = await diagnoseMicrosoftGraphIssues(currentUser);
    
    // Intentar obtener datos específicos
    const profileData = await getMicrosoftJobAndDepartment(currentUser);
    
    return {
      success: diagResult.tests.some(t => t.name.includes('Graph API') && t.result),
      message: diagResult.tests.some(t => t.name.includes('Graph API') && t.result) 
        ? 'Microsoft Graph API accesible' 
        : 'No se pudo acceder a Microsoft Graph API',
      hasMicrosoftProvider: true,
      hasDirectoryReadScope: diagResult.tokenInfo?.hasDirectoryRead || false,
      hasDepartment: profileData.department !== 'No especificado',
      hasJobTitle: profileData.jobTitle !== 'No especificado',
      recommendations: diagResult.recommendations,
      diagnosticDetails: diagResult
    };
  } catch (error) {
    console.error('Error en diagnóstico de acceso a perfil Microsoft:', error);
    return {
      success: false,
      message: `Error: ${error.message}`,
      error: error.toString()
    };
  }
};
