import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMicrosoftJobAndDepartment } from '../services/microsoftGraphService';

/**
 * Hook personalizado para obtener y gestionar datos de perfil de Microsoft
 * @returns {Object} Datos del perfil y estado de carga
 */
const useMicrosoftProfile = () => {
  const { currentUser } = useAuth();
  const [jobTitle, setJobTitle] = useState(null);
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMicrosoftProfile = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Verificar si es un usuario de Microsoft
        const isMicrosoftUser = currentUser.providerData.some(
          provider => provider.providerId === 'microsoft.com'
        );

        if (!isMicrosoftUser) {
          console.log('El usuario no está autenticado con Microsoft');
          setLoading(false);
          return;
        }

        // Obtener datos específicos de Microsoft
        const profileData = await getMicrosoftJobAndDepartment(currentUser);
        console.log('Datos de Microsoft obtenidos:', profileData);

        // Actualizar estados solo si los datos son válidos
        if (profileData?.jobTitle && profileData.jobTitle !== 'No especificado') {
          setJobTitle(profileData.jobTitle);
        }

        if (profileData?.department && profileData.department !== 'No especificado') {
          setDepartment(profileData.department);
        }
      } catch (err) {
        console.error('Error al obtener datos de Microsoft:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMicrosoftProfile();
  }, [currentUser]);

  return {
    jobTitle,
    department,
    loading,
    error,
    isMicrosoftUser: currentUser?.providerData?.some(p => p.providerId === 'microsoft.com') || false
  };
};

export default useMicrosoftProfile;
