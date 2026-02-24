import React, { useState, useEffect } from 'react';
import { getUserById } from '../services/userManagementService';
import DeleteUserButton from './DeleteUserButton';
import { useAuth } from '../context/AuthContext'; // Usando el contexto correcto

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { 
    currentUser, 
    userRoles, 
    accessLevel, 
    userProfile: contextUserProfile,
    refreshUserRoles, 
    debugCurrentUserRoles,
    updateUserPermissions
  } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        try {
          // Primero refrescamos los roles desde Firebase para asegurar datos actualizados
          console.log('Refrescando roles antes de cargar perfil...');
          await refreshUserRoles();

          // Luego obtenemos los datos del usuario
          const data = await getUserById(currentUser.uid);
          
          // Sincronizar datos - si hay diferencias entre contexto y base de datos
          const contextRolesExist = userRoles && userRoles.length > 0;
          const dbRolesExist = data.roles && data.roles.length > 0;
          
          // Si hay roles en el contexto pero no en la DB, los guardamos en la DB
          if (contextRolesExist && !dbRolesExist) {
            console.log('Roles encontrados en contexto pero no en DB. Sincronizando...');
            await updateUserPermissions(userRoles, accessLevel || 'Básico');
            data.roles = userRoles;
            data.accessLevel = accessLevel || 'Básico';
          } 
          // Si hay roles en la DB pero son diferentes a los del contexto, actualizamos el contexto
          else if (dbRolesExist) {
            // Normalizar roles para comparación (convertir a minúsculas y ordenar)
            const dbRolesNormalized = [...data.roles].map(r => r.toLowerCase()).sort();
            const contextRolesNormalized = [...userRoles].map(r => r.toLowerCase()).sort();
            const rolesAreDifferent = JSON.stringify(dbRolesNormalized) !== JSON.stringify(contextRolesNormalized);
            
            if (rolesAreDifferent) {
              console.log('Roles diferentes entre DB y contexto. Sincronizando...');
              console.log('DB roles:', dbRolesNormalized);
              console.log('Contexto roles:', contextRolesNormalized);
              await updateUserPermissions(data.roles, data.accessLevel || 'Básico');
            }
          }
          
          console.log('Datos de perfil cargados y sincronizados:', { 
            fromDB: data, 
            fromContext: { userRoles, accessLevel, contextUserProfile } 
          });
          
          setUserData(data);
        } catch (error) {
          console.error('Error al cargar datos del perfil:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [currentUser, userRoles, accessLevel, contextUserProfile, refreshUserRoles, updateUserPermissions]);

  if (loading) {
    return <div className="loading">Cargando perfil...</div>;
  }

  if (!userData) {
    return <div className="error">No se pudo cargar la información del perfil</div>;
  }

  // Importar componente RoleDisplay
  const RoleDisplay = React.lazy(() => import('./RoleDisplay'));

  return (
    <div className="user-profile-container">
      <h2>Mi Perfil</h2>
      
      <div className="profile-info">
        <div className="profile-section">
          <h3>Información Personal</h3>
          <p><strong>Nombre:</strong> {userData.displayName || 'No disponible'}</p>
          <p><strong>Email:</strong> {userData.email || 'No disponible'}</p>
          <p><strong>Departamento:</strong> {userData.department || 'No asignado'}</p>
        </div>

        <div className="profile-section">
          <h3>Permisos del Sistema</h3>
          {/* Usar el nuevo componente para mostrar roles en tiempo real desde el contexto */}
          <React.Suspense fallback={<div>Cargando información de roles...</div>}>
            <RoleDisplay />
          </React.Suspense>
        </div>
      </div>

      {/* Añadir botón para refrescar permisos manualmente */}
      <div className="profile-refresh-actions" style={{ marginTop: '20px', marginBottom: '15px' }}>
        <button 
          className="btn btn-outline-primary btn-sm"
          onClick={async () => {
            try {
              // Refrescar roles y guardar en Firebase
              const roles = await refreshUserRoles();
              
              // Mostrar información de depuración en consola
              debugCurrentUserRoles();
              
              if (roles) {
                // Asegurar que los roles estén guardados en Firebase
                await updateUserPermissions(roles, accessLevel || 'Básico');
                
                // Actualizar datos locales
                setUserData(prevData => ({
                  ...prevData,
                  roles: roles,
                  accessLevel: accessLevel || 'Básico'
                }));
                
                // Mostrar notificación de éxito
                alert(`Permisos actualizados correctamente: ${roles.join(', ')}`);
              } else {
                alert('No se pudieron cargar los permisos');
              }
            } catch (error) {
              console.error('Error al refrescar roles:', error);
              alert('Error al actualizar permisos');
            }
          }}
        >
          Refrescar mis permisos
        </button>
        <small style={{ display: 'block', marginTop: '5px', color: '#6c757d' }}>
          Haz clic para verificar tus permisos de acceso actuales
        </small>
      </div>
      
      <div className="profile-actions">
        {/* Otros botones de acción aquí */}
        
        <DeleteUserButton 
          userId={userData.uid}
          userName={userData.displayName || 'tu cuenta'}
          isSelfDelete={true}
          buttonText="Eliminar mi cuenta"
          buttonClassName="profile-delete-btn"
        />
      </div>
    </div>
  );
};

export default UserProfile;
