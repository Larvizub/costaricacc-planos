// Configuración de Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, OAuthProvider, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Eliminar variable debugLog si no se usa
/* eslint-disable no-unused-vars */
const debugLog = (message, data) => {
  if (import.meta.env.DEV) {
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
};
/* eslint-enable no-unused-vars */

// Configuración de Firebase
const firebaseConfig = {
  apiKey: import.meta.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.REACT_APP_FIREBASE_DATABASE_URL,
  storageBucket: import.meta.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.REACT_APP_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Servicios de Firebase
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);

// Configuración para proveedores de autenticación
const googleProvider = new GoogleAuthProvider();

// Microsoft OAuth Provider con scopes específicos para obtener datos de perfil
const microsoftProvider = new OAuthProvider('microsoft.com');
microsoftProvider.addScope('https://graph.microsoft.com/User.Read');
microsoftProvider.addScope('https://graph.microsoft.com/Directory.Read.All');
microsoftProvider.setCustomParameters({
  prompt: 'consent', // Forzar consentimiento para asegurar obtener todos los permisos
});

// Función para iniciar sesión con Google
export const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

// Función para iniciar sesión con Microsoft (con permisos específicos)
export const signInWithMicrosoft = () => {
  return signInWithPopup(auth, microsoftProvider);
};

/**
 * Obtiene datos del usuario desde Microsoft
 * Esta función NO debe incluir datos ficticios
 * @param {Object} user - Usuario autenticado
 * @returns {Promise<Object|null>} Datos del usuario o null
 */
export const fetchMicrosoftUserData = async (user) => {
  try {
    if (!user) return null;
    
    // Verificar si el usuario se autenticó con Microsoft
    const microsoftProvider = user.providerData?.find(provider => 
      provider.providerId === 'microsoft.com'
    );
    
    if (!microsoftProvider) {
      console.log('El usuario no está autenticado con Microsoft');
      return null;
    }
    
    console.log('Obteniendo datos del usuario desde Microsoft...');
    
    // Intentar obtener datos del proveedor
    let userData = {
      displayName: user.displayName || '',
      email: user.email || '',
      department: null,
      jobTitle: null
    };
    
    // Intentar obtener datos específicos de department y jobTitle
    if (microsoftProvider.department) {
      userData.department = microsoftProvider.department;
      console.log('Departamento obtenido:', userData.department);
    }
    
    if (microsoftProvider.jobTitle) {
      userData.jobTitle = microsoftProvider.jobTitle;
      console.log('Puesto obtenido:', userData.jobTitle);
    }
    
    // Si hay _tokenResponse, intentar obtener datos adicionales
    if (microsoftProvider._tokenResponse) {
      // Buscar en el objeto principal
      if (!userData.department && microsoftProvider._tokenResponse.department) {
        userData.department = microsoftProvider._tokenResponse.department;
      }
      
      if (!userData.jobTitle && microsoftProvider._tokenResponse.jobTitle) {
        userData.jobTitle = microsoftProvider._tokenResponse.jobTitle;
      }
      
      // Buscar en additionalUserInfo.profile si existe
      if (microsoftProvider._tokenResponse.additionalUserInfo?.profile) {
        const profile = microsoftProvider._tokenResponse.additionalUserInfo.profile;
        
        if (!userData.department && profile.department) {
          userData.department = profile.department;
        }
        
        if (!userData.jobTitle && profile.jobTitle) {
          userData.jobTitle = profile.jobTitle;
        }
      }
    }
    
    console.log('Datos finales obtenidos de Microsoft:', userData);
    return userData;
  } catch (error) {
    console.error('Error al obtener datos de Microsoft:', error);
    return null;
  }
}

// Configuración mejorada para el proveedor de Microsoft
// con los permisos explícitos para acceder a department y jobTitle
export const createMicrosoftProvider = () => {
  const provider = new OAuthProvider('microsoft.com');
  
  // Estos scopes son cruciales para acceder a información de departamento y puesto
  provider.addScope('https://graph.microsoft.com/User.Read');
  provider.addScope('https://graph.microsoft.com/Directory.Read.All');
  
  // Configuraciones adicionales para asegurar obtener máxima información
  provider.setCustomParameters({
    prompt: 'consent', // Forzar consentimiento para asegurar obtener todos los permisos
    domain_hint: 'tudominio.com' // Opcional: reemplazar con tu dominio de Microsoft
  });
  
  return provider;
};

// Función mejorada para inicio de sesión con Microsoft
export const signInWithMicrosoftImproved = async () => {
  const microsoftProvider = createMicrosoftProvider();
  console.log('Iniciando sesión con Microsoft, solicitando scopes:', microsoftProvider.scopes);
  
  try {
    const result = await signInWithPopup(auth, microsoftProvider);
    
    // Verificar inmediatamente los permisos obtenidos
    console.log('Inicio de sesión con Microsoft exitoso, verificando permisos...');
    
    // Verificar si tenemos acceso a Graph API
    const { getGraphAccessToken, verifyTokenScopes } = await import('../services/microsoftGraphService');
    const accessToken = await getGraphAccessToken(result.user);
    
    if (accessToken) {
      const tokenInfo = verifyTokenScopes(accessToken);
      console.log('Análisis del token Microsoft:', tokenInfo);
      
      if (!tokenInfo.hasDirectoryRead) {
        console.warn('ADVERTENCIA: No se obtuvo el permiso Directory.Read.All necesario para acceder a información de departamento y puesto');
      }
    } else {
      console.warn('No se pudo obtener token de acceso para Microsoft Graph');
    }
    
    return result;
  } catch (error) {
    console.error('Error en inicio de sesión con Microsoft:', error);
    throw error;
  }
};

export default app;
