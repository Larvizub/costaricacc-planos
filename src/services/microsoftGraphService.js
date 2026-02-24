/**
 * Servicio simplificado para interactuar con Microsoft Graph API
 */
import axios from 'axios';
import { MS_GRAPH_USER_ENDPOINT, MS_GRAPH_PHOTO_ENDPOINT } from '../config/microsoftGraphConfig';
import { db } from '../firebase/firebaseConfig';
import { ref, get } from 'firebase/database';

/**
 * Obtiene un token de acceso para Microsoft Graph API
 * @param {Object} user - Usuario autenticado con Firebase
 * @returns {Promise<string|null>} Token de acceso o null
 */
export const getGraphAccessToken = async (user) => {
  try {
    if (!user || !user.getIdToken) return null;
    
    // Importante: En Firebase v9 con Microsoft, los tokens se almacenan
    // de manera diferente a versiones anteriores. En lugar de buscar en 
    // múltiples lugares, primero verificamos si tenemos el token ya guardado
    
    // Verificar si ya tenemos el token almacenado en nuestra base de datos
    const userTokenRef = ref(db, `userTokens/${user.uid}/microsoftToken`);
    const tokenSnapshot = await get(userTokenRef);
    
    if (tokenSnapshot.exists()) {
      const tokenData = tokenSnapshot.val();
      // Verificar si el token no ha expirado (no implementado por simplicidad)
      return tokenData.accessToken;
    }
    
    // Si no tenemos el token guardado, intentaremos las opciones anteriores
    // Intentar obtener token desde providerData
    const microsoftProvider = user.providerData?.find(p => p.providerId === 'microsoft.com');
    if (microsoftProvider?._tokenResponse?.accessToken) {
      return microsoftProvider._tokenResponse.accessToken;
    }
    
    // Intentar obtener desde claims
    const idTokenResult = await user.getIdTokenResult(true);
    if (idTokenResult?.claims?.microsoft_access_token) {
      return idTokenResult.claims.microsoft_access_token;
    }
    
    // Intentar obtener desde sign_in_attributes
    if (idTokenResult?.claims?.firebase?.sign_in_attributes?.accessToken) {
      return idTokenResult.claims.firebase.sign_in_attributes.accessToken;
    }
    
    console.log('No se pudo obtener token para Microsoft Graph');
    
    // Si no pudimos obtener el token, consideremos intentar renovar las credenciales
    console.log('Considerando renovar la sesión para obtener un nuevo token');
    return null;
  } catch (error) {
    console.error('Error al obtener token:', error);
    return null;
  }
};

/**
 * Obtiene los datos básicos del usuario desde Microsoft Graph
 * @param {Object} user - Usuario autenticado
 * @returns {Promise<Object|null>} Datos del usuario o null
 */
export const getUserData = async (user) => {
  try {
    if (!user) return null;
    
    const accessToken = await getGraphAccessToken(user);
    if (!accessToken) return null;
    
    // Añadir manejo de errores específicos de Graph API y reintentos
    try {
      const response = await axios.get(MS_GRAPH_USER_ENDPOINT, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          // Opcional: mejorar la consistencia en solicitudes de directorio
          'ConsistencyLevel': 'eventual'
        }
      });
      
      return {
        displayName: response.data.displayName,
        email: response.data.mail || response.data.userPrincipalName,
        jobTitle: response.data.jobTitle || 'No especificado',
        department: response.data.department || 'No especificado'
      };
    } catch (apiError) {
      // Implementar manejo específico según códigos de error de Microsoft Graph
      if (apiError.response) {
        const status = apiError.response.status;
        
        // Token expirado o inválido
        if (status === 401) {
          console.warn('Token expirado o inválido para Microsoft Graph');
          // Aquí se podría intentar obtener un nuevo token si se implementa refresh
        }
        // Permisos insuficientes
        else if (status === 403) {
          console.warn('Permisos insuficientes para acceder a Microsoft Graph');
        }
        // Otros errores con respuesta
        else {
          console.error('Error API Graph:', status, apiError.response.data);
        }
      }
      throw apiError; // Relanzar para que el llamador pueda manejar el error
    }
  } catch (error) {
    console.error('Error al obtener datos de usuario:', error);
    return null;
  }
};

/**
 * Obtiene la foto de perfil del usuario
 * @param {Object} user - Usuario autenticado
 * @returns {Promise<string|null>} URL de la foto o null
 */
export const getUserProfilePhoto = async (user) => {
  try {
    if (!user) return null;
    
    // Intentar obtener foto de proveedor primero (más rápido)
    const microsoftProvider = user.providerData?.find(p => p.providerId === 'microsoft.com');
    if (microsoftProvider?.photoURL) {
      return microsoftProvider.photoURL;
    }
    
    // Si no hay foto en proveedor, intentar con Graph API
    const accessToken = await getGraphAccessToken(user);
    if (!accessToken) return null;
    
    try {
      const response = await axios.get(MS_GRAPH_PHOTO_ENDPOINT, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        responseType: 'arraybuffer'
      });
      
      const base64Image = Buffer.from(response.data, 'binary').toString('base64');
      return `data:${response.headers['content-type']};base64,${base64Image}`;
    } catch (photoError) {
      // Manejar específicamente cuando no hay foto (código 404)
      if (photoError.response && photoError.response.status === 404) {
        console.log('El usuario no tiene foto de perfil configurada en Microsoft');
      } else {
        console.error('Error al obtener foto de perfil:', photoError);
      }
      return null;
    }
  } catch (error) {
    console.error('Error general al obtener foto de perfil:', error);
    return null;
  }
};

/**
 * Determina si el token actual tiene los permisos necesarios
 * @param {string} accessToken - Token de acceso
 * @returns {boolean} - True si tiene permisos suficientes
 */
export const verifyTokenPermissions = (accessToken) => {
  // Esta es una función simplificada para analizar scopes del token
  // Solo implementa si encuentras problemas de permisos específicos
  try {
    if (!accessToken) return false;
    
    // En un JWT, el payload está en la segunda parte (después del primer .)
    const payload = accessToken.split('.')[1];
    if (!payload) return false;
    
    // Decodificar el payload (Base64Url)
    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    // Verificar si tiene los scopes necesarios
    const scopes = decodedPayload.scp || ''; // scp contiene los scopes
    return scopes.includes('User.Read');
  } catch (error) {
    console.error('Error al verificar permisos del token:', error);
    return false;
  }
}

// Crear un objeto nombrado para la exportación por defecto
const microsoftGraphService = {
  getGraphAccessToken,
  getUserData,
  getUserProfilePhoto,
  verifyTokenPermissions
};

export default microsoftGraphService;
