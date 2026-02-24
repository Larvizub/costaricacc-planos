import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged, OAuthProvider } from 'firebase/auth';
import { ref, set, update, get } from 'firebase/database';
import { toast } from 'react-toastify';

/**
 * Función de utilidad para mostrar logs solo en entorno de desarrollo
 * @param {string} message - Mensaje a mostrar
 * @param {*} data - Datos opcionales a mostrar
 */
const debugLog = (message, data) => {
  if (import.meta.env.DEV) {
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
};

// Crear proveedor para Microsoft con los scopes necesarios
const microsoftProvider = new OAuthProvider('microsoft.com');
// User.Read es suficiente para información básica del usuario incluido departamento y cargo
microsoftProvider.addScope('https://graph.microsoft.com/User.Read');

// Crear contexto de autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [accessLevel, setAccessLevel] = useState('basico');
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Función para depurar los roles de usuario actual - útil para desarrollo
   */
  const debugCurrentUserRoles = () => {
    console.group('Depuración de Roles de Usuario');
    console.log('Usuario actual:', currentUser?.email);
    console.log('Roles asignados:', userRoles);
    console.log('Nivel de acceso:', accessLevel);
    console.groupEnd();
  };

  // Función para refrescar roles de usuario desde Firebase
  const refreshUserRoles = async () => {
    if (!currentUser) {
      console.warn('No hay usuario autenticado para refrescar roles');
      return null;
    }
    
    try {
      console.group('Refrescando roles desde Firebase');
      console.log('Usuario:', currentUser.email);
      
      // Obtenemos datos directamente de Firebase
      const userRef = ref(db, `users/${currentUser.uid}`);
      const snapshot = await get(userRef);
      const userData = snapshot.exists() ? snapshot.val() : {};
      
      console.log('Datos obtenidos de Firebase:', userData);
      
      // Extraemos roles del usuario
      let roles = [];
      
      // Intentar obtener de 'roles' (formato preferido)
      if (userData.roles) {
        console.log('Campo "roles" encontrado:', userData.roles);
        // Si viene como cadena (separada por comas), la convertimos a array
        if (typeof userData.roles === 'string') {
          roles = userData.roles.split(',').map(r => r.trim()).filter(r => r);
        } 
        // Si ya viene como array
        else if (Array.isArray(userData.roles)) {
          roles = userData.roles;
        }
      } 
      // Compatibilidad con campo legacy "role"
      else if (userData.role) {
        console.log('Campo "role" (legacy) encontrado:', userData.role);
        if (typeof userData.role === 'string') {
          roles = userData.role.split(',').map(r => r.trim()).filter(r => r);
        } else if (Array.isArray(userData.role)) {
          roles = userData.role;
        }
      }
      
      // Verificar si hay rol de admin o algún rol especial
      const hasAdminRole = roles.some(r => 
        r.toLowerCase() === 'admin' || 
        r.toLowerCase().includes('admin')
      );
      
      // Si tiene accessLevel avanzado o es Administrador, asegurarnos de que tenga rol admin
      if (userData.accessLevel === 'Administrador' || userData.accessLevel === 'Avanzado') {
        if (!hasAdminRole) {
          console.log('Usuario tiene accessLevel avanzado pero no rol admin. Añadiendo rol admin');
          roles.push('admin');
        } else {
          console.log('Usuario tiene accessLevel avanzado y ya tiene rol admin. Verificando consistencia...');
          // Asegurar que tenga específicamente 'admin' para mayor consistencia
          if (!roles.some(r => r.toLowerCase() === 'admin')) {
            roles.push('admin');
            console.log('Añadido rol admin explícito para mayor consistencia');
          }
        }
      }
      
      // Si no hay roles, asignamos 'cliente' por defecto
      if (roles.length === 0) {
        console.log('No se encontraron roles, asignando rol predeterminado: cliente');
        roles = ['cliente'];
      }
      
      // Actualizamos estado local (usando función para evitar problemas de cierre en el efecto)
      setUserRoles(roles);
      setAccessLevel(userData.accessLevel || 'Básico');
      
      // IMPORTANTE: Guardar los roles en Firebase para que persistan
      // Si los roles son diferentes a los que hay en Firebase, actualizarlos
      const shouldUpdateFirebase = !areArraysEqual(roles, userData.roles);
      if (shouldUpdateFirebase) {
        console.log('Actualizando roles en Firebase para asegurar persistencia...');
        try {
          // Usar try-catch independiente para no interrumpir el flujo principal
          await update(userRef, { 
            roles: roles,
            // Remover el campo legacy "role" para evitar inconsistencias
            role: null,
            accessLevel: userData.accessLevel || 'Básico',
            updatedAt: new Date().toISOString()
          });
          console.log('Roles guardados en Firebase correctamente');
        } catch (updateError) {
          console.error('Error al guardar roles en Firebase:', updateError);
          // No propagamos este error para no interrumpir el flujo principal
        }
      }
      
      console.log('Roles refrescados correctamente:', { 
        roles, 
        accessLevel: userData.accessLevel || 'Básico' 
      });
      console.groupEnd();
      
      return roles;
    } catch (error) {
      console.error('Error al refrescar roles:', error);
      toast.error('Error al cargar los permisos de usuario');
      return null;
    }
  };
  
  // Función de utilidad para comparar arrays de roles
  const areArraysEqual = (array1, array2) => {
    if (!array1 || !array2) return false;
    if (array1.length !== array2.length) return false;
    
    // Ordenamos para comparar independientemente del orden
    const sorted1 = [...array1].sort();
    const sorted2 = [...array2].sort();
    
    return sorted1.every((val, idx) => val === sorted2[idx]);
  };

  // Función para iniciar sesión con Microsoft
  const signInWithMicrosoft = async () => {
    try {
      console.log('Iniciando sesión con Microsoft y solicitando scopes:', microsoftProvider.scopes);
      
      // Usamos signInWithPopup con un timeout de seguridad para evitar bloqueos
      const authPromise = signInWithPopup(auth, microsoftProvider);
      
      // Agregar un timeout para evitar que se quede bloqueado indefinidamente
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Tiempo de espera agotado para el inicio de sesión')), 30000);
      });
      
      // Usar Promise.race para establecer un tiempo límite
      const result = await Promise.race([authPromise, timeoutPromise]);
      
      console.log('Autenticación con Microsoft completada');
      
      // Guardar información básica del usuario inmediatamente
      // No esperar a la respuesta de Microsoft Graph que podría fallar
      if (result?.user?.uid) {
        const userRef = ref(db, `users/${result.user.uid}`);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.exists() ? userSnapshot.val() : {};
        
        // Actualizar información básica sin esperar a Microsoft Graph
        await update(userRef, {
          displayName: result.user.displayName || userData.displayName || 'Usuario',
          email: result.user.email || userData.email,
          microsoftAccount: true,
          lastLogin: new Date().toISOString(),
          // Preservar roles existentes si los hay
          roles: userData.roles || ['cliente']
        });
        
        console.log('Información básica de usuario guardada en Firebase');
        
        // Programar actualización de datos de Microsoft Graph en segundo plano
        // para no bloquear el flujo de autenticación
        setTimeout(async () => {
          try {
            // Obtener token solo si es necesario
            const token = result.user.providerData[0]?.uid && 
                         result._tokenResponse?.oauthAccessToken;
                       
            if (token) {
              console.log('Token de acceso obtenido, actualizando datos adicionales...');
              const { refreshMicrosoftUserData } = await import('../services/microsoftService');
              await refreshMicrosoftUserData();
              console.log('Datos de Microsoft actualizados correctamente');
            }
          } catch (graphError) {
            console.warn('Error al actualizar datos de Microsoft Graph (no crítico):', graphError);
          }
        }, 100);
      }
      
      return result;
    } catch (error) {
      // Mejorar el manejo de errores
      console.error("Error en la autenticación con Microsoft:", error);
      
      // Categorizar errores para mejor diagnóstico
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Ventana de inicio de sesión cerrada. Por favor, intente nuevamente.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('El navegador bloqueó la ventana emergente. Por favor, permita ventanas emergentes e intente nuevamente.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Se canceló la solicitud. Por favor, intente nuevamente.');
      } else if (error.message === 'Tiempo de espera agotado para el inicio de sesión') {
        throw new Error('El inicio de sesión tomó demasiado tiempo. Por favor, compruebe su conexión e intente nuevamente.');
      } else {
        throw error;
      }
    }
  };

  // Función para iniciar sesión con email y contraseña
  const signInWithEmail = async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      // Los errores siempre se muestran, pero de manera controlada
      console.error("Error al iniciar sesión con email:", error);
      throw error;
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      return await signOut(auth);
    } catch (error) {
      // Los errores siempre se muestran, pero de manera controlada
      console.error("Error al cerrar sesión:", error);
      throw error;
    }
  };

  // Función para actualizar roles y nivel de acceso en RTDB y estado local
  const updateUserPermissions = async (roles, level) => {
    if (!currentUser) throw new Error('Usuario no autenticado');
    try {
      // Asegurarnos de que los roles estén en formato adecuado (array)
      const normalizedRoles = Array.isArray(roles) ? roles : [roles];
      
      // Referencia al usuario en Firebase
      const userRef = ref(db, `users/${currentUser.uid}`);
      
      // Obtener datos actuales para preservar otros campos
      const snapshot = await get(userRef);
      const currentData = snapshot.exists() ? snapshot.val() : {};
      
      // Preparar datos para actualizar
      const updateData = {
        ...currentData,
        roles: normalizedRoles,
        // Eliminamos cualquier campo 'role' para evitar inconsistencias
        role: null,
        accessLevel: level || 'Básico',
        updatedAt: new Date().toISOString()
      };
      
      // Guardar en Firebase con set para asegurar que todos los campos se actualicen correctamente
      await set(userRef, updateData);
      
      // Actualizar estado local
      setUserRoles(normalizedRoles);
      setAccessLevel(level);
      
      console.log('Permisos actualizados correctamente:', {
        uid: currentUser.uid,
        roles: normalizedRoles,
        accessLevel: level
      });
      
      toast.success('Permisos actualizados con éxito');
    } catch (error) {
      console.error('Error al actualizar permisos:', error);
      toast.error('Error al actualizar permisos');
      throw error;
    }
  };

  // Efecto para observar cambios en el estado de autenticación
  useEffect(() => {
    let isMounted = true; // Flag para evitar actualizaciones después de desmontar
    
    const handleAuthChange = async (user) => {
      if (!isMounted) return; // No hacer nada si el componente se desmontó
      
      setCurrentUser(user);
      
      if (user) {
        // Primero refrescamos los roles para asegurar consistencia
        try {
          // Refreshing roles directly from database on login
          console.log('Refrescando roles de usuario al iniciar sesión...');
          
          // Obtener datos directamente desde Firebase sin usar refreshUserRoles
          // para evitar dependencia circular
          const userRef = ref(db, `users/${user.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            
            // Extraer y normalizar roles
            let roles = [];
            
            if (userData.roles) {
              if (typeof userData.roles === 'string') {
                roles = userData.roles.split(',').map(r => r.trim()).filter(Boolean);
              } else if (Array.isArray(userData.roles)) {
                roles = [...userData.roles];
              }
            } else if (userData.role) { // Campo legacy
              if (typeof userData.role === 'string') {
                roles = userData.role.split(',').map(r => r.trim()).filter(Boolean);
              } else if (Array.isArray(userData.role)) {
                roles = [...userData.role];
              }
            }
            
            // Asignar rol predeterminado si no hay roles
            if (roles.length === 0) {
              roles = ['cliente'];
            }
            
            if (isMounted) {
              setUserRoles(roles);
              setAccessLevel(userData.accessLevel || 'Básico');
            }
            
            // Si no hay roles explícitos en Firebase, guardarlos
            if (!userData.roles) {
              console.log('Usuario sin roles guardados en Firebase, guardando roles predeterminados...');
              await update(userRef, { 
                roles: roles, 
                role: null, // Eliminar campo legacy
                accessLevel: userData.accessLevel || 'Básico',
                updatedAt: new Date().toISOString()
              });
            }
          } else {
            // Usuario nuevo sin datos en Firebase
            if (isMounted) {
              setUserRoles(['cliente']);
              setAccessLevel('Básico');
            }
          }
        } catch (refreshRolesError) {
          console.warn('No se pudieron refrescar roles al iniciar sesión:', refreshRolesError);
        }
        
        // Si es un usuario de Microsoft, intentamos refrescar sus datos
        if (user.providerData.some(p => p.providerId === 'microsoft.com')) {
          debugLog('Usuario Microsoft detectado, refrescando datos...');
          try {
            // Importamos dinámicamente para evitar dependencias circulares
            const { refreshMicrosoftUserData, getUserProfile } = await import('../services/microsoftService');
            
            // Intentar refrescar los datos del usuario
            const refreshedData = await refreshMicrosoftUserData();
            debugLog('Datos refrescados con éxito:', refreshedData);
            
            // Cargar el perfil completo después de refrescar
            const profile = await getUserProfile();
            setUserProfile(profile);
            debugLog('Perfil de usuario actualizado después de refrescar:', profile);
          } catch (refreshError) {
            console.error('Error al refrescar datos de Microsoft:', refreshError);
            // No mostramos este error al usuario para no impactar la experiencia
          }
        }
        
        try {
          const { getUserProfile } = await import('../services/microsoftService');
          const userProfile = await getUserProfile();
          
          // Guardamos el perfil de usuario completo
          setUserProfile(userProfile);
          debugLog('Perfil de usuario cargado:', userProfile);
          
          // Obtenemos los roles del perfil - corregir para usar consistentemente "roles" en lugar de "role"
          let roles = [];
          if (userProfile.roles) {
            // Si viene como cadena (separada por comas), la convertimos a array
            if (typeof userProfile.roles === 'string') {
              roles = userProfile.roles.split(',').map(r => r.trim()).filter(r => r);
            } 
            // Si ya viene como array
            else if (Array.isArray(userProfile.roles)) {
              roles = userProfile.roles;
            }
          }
          
          debugLog('Roles asignados al usuario:', roles);
          setUserRoles(roles);
          // Establecer nivel de acceso desde el perfil o usar 'basico' por defecto
          const level = userProfile.accessLevel || 'basico';
          setAccessLevel(level);
          debugLog('Nivel de acceso asignado al usuario:', level);
          
          // Si no se asignaron roles, asignamos 'cliente' como predeterminado
          if (roles.length === 0) {
            console.warn('Usuario sin roles, asignando rol predeterminado: cliente');
            toast.info('Se te ha asignado el rol de cliente basado en tu perfil.');
            setUserRoles(['cliente']);
          }
        } catch (error) {
          // Los errores siempre se muestran, pero de manera controlada
          console.error('Error al cargar roles del usuario:', error);
          // En caso de error, asignar un rol predeterminado para permitir funcionalidad básica
          setUserRoles(['cliente']);
          toast.error('Error al cargar tu perfil. Se te ha asignado el rol de cliente por defecto.');
        }
      } else {
        setUserRoles([]);
        setAccessLevel('basico');
            }
      
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, handleAuthChange);

    // Limpiar el observer cuando se desmonte el componente
    return unsubscribe;
  }, []); // Quitamos refreshUserRoles para evitar dependencia circular

  // Valores proporcionados por el contexto
  const value = {
    currentUser,
    userRoles,
    accessLevel,
    userProfile,
    signInWithMicrosoft,
    signInWithEmail,
    logout,
    // Corregido para verificar correctamente roles
    hasRole: (role) => {
      if (!userRoles || userRoles.length === 0) return false;
      return userRoles.some(r => r.toLowerCase() === role.toLowerCase());
    },
    // Función para consultar roles (útil para la UI)
    getUserRoles: () => userRoles,
    // Función para establecer roles (útil para actualizaciones)
    setUserRoles,
    // Función para depuración
    debugCurrentUserRoles,
    // Función para refrescar roles explícitamente
    refreshUserRoles,
    // Exponer la nueva función para la UI:
    updateUserPermissions
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
