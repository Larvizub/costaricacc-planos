import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserShield, FaCheck, FaTimes } from 'react-icons/fa';
import styled from 'styled-components';
import { theme } from '../../styles/GlobalStyles';
import Modal from '../Modal';
import Button from '../Button';
import { useAuth } from '../../context/AuthContext';
import { updateUserRoles } from '../../services/userManagementService';

// Estilos para el contenido del modal
const ModalContent = styled.div`
  padding: ${theme.spacing.lg};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  padding-bottom: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
`;

const UserAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  background-color: ${theme.colors.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarInitial = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${theme.colors.text};
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${theme.colors.text};
`;

const UserEmail = styled.div`
  font-size: 0.9rem;
  color: ${theme.colors.textLight};
`;

const UserDepartment = styled.div`
  font-size: 0.9rem;
  color: ${theme.colors.text};
  margin-top: ${theme.spacing.xs};
`;

const FormSection = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const GroupOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
`;

const GroupCard = styled.div`
  flex: 1;
  min-width: 200px;
  padding: ${theme.spacing.md};
  border: 1px solid ${props => props.selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  background-color: ${props => props.selected ? `${theme.colors.primary}10` : theme.colors.card};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${theme.colors.primary};
    background-color: ${props => props.selected ? `${theme.colors.primary}10` : `${theme.colors.primary}05`};
  }
`;

const GroupIcon = styled.div`
  color: ${props => props.selected ? theme.colors.primary : theme.colors.textLight};
  margin-bottom: ${theme.spacing.sm};
  font-size: 1.2rem;
`;

const GroupName = styled.div`
  font-weight: 500;
  margin-bottom: ${theme.spacing.xs};
`;

const GroupDescription = styled.div`
  font-size: 0.85rem;
  color: ${theme.colors.textLight};
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.xl};
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  margin-top: ${theme.spacing.md};
  font-size: 0.9rem;
`;

// Definir grupos basados en los requisitos
export const appGroups = [
  {
    id: 'gestion_proteccion',
    name: 'Gestión de la Protección',
    description: 'Jefes y supervisores de gestión de la protección',
    roles: ['jefe_gestion_proteccion', 'supervisor_gestion_proteccion'],
    icon: <FaUserShield />,
    requiredForApproval: true
  },
  {
    id: 'salud_ocupacional',
    name: 'Salud Ocupacional',
    description: 'Asistentes de talento humano',
    roles: ['asistente_talento_humano'],
    icon: <FaUserShield />,
    requiredForApproval: true
  },
  {
    id: 'audiovisuales',
    name: 'Audiovisuales',
    description: 'Directores de operaciones y comerciales',
    roles: ['director_operaciones', 'director_comercial'],
    icon: <FaUsers />,
    requiredForApproval: true,
    conditionalService: 'audiovisuales'
  },
  {
    id: 'gastronomia',
    name: 'Gastronomía',
    description: 'Jefes y coordinadores de experiencia gastronómica',
    roles: ['jefe_experiencia_gastronomica', 'coordinador_experiencia_gastronomica'],
    icon: <FaUsers />,
    requiredForApproval: true,
    conditionalService: 'gastronomia'
  },
  {
    id: 'areas_sostenibilidad',
    name: 'Áreas y Sostenibilidad',
    description: 'Equipo de áreas, montajes y sostenibilidad',
    roles: ['jefe_areas_sostenibilidad', 'coordinadora_areas', 'areas_montajes'],
    icon: <FaUsers />,
    requiredForApproval: true,
    canUploadPlanos: true,
    conditionalService: 'montajes'
  }
];

const GroupRolesModal = ({ isOpen, onClose, user, onSave }) => {
  const { currentUser, setUserRoles } = useAuth();
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Inicializar valores al abrir el modal
  useEffect(() => {
    if (user) {
      let groups = [];
      let jobTitle = user.jobTitle || '';
      
      // Prioridad 1: Usar los grupos explícitamente asignados si están disponibles
      if (user.userGroups && Array.isArray(user.userGroups) && user.userGroups.length > 0) {
        groups = [...user.userGroups];
        console.log('Usando grupos explícitos del usuario:', groups);
      }
      // Prioridad 2: Si no hay grupos explícitos, deducirlos de los roles
      else if (user.roles && Array.isArray(user.roles)) {
        console.log('No hay grupos explícitos, deduciendo de roles');
        // Buscar coincidencias en los roles de usuario que corresponden a grupos definidos
        appGroups.forEach(group => {
          // Si alguno de los roles del usuario coincide con los roles del grupo
          const hasRole = group.roles.some(role => 
            user.roles.includes(role)
          );
          
          if (hasRole) {
            groups.push(group.id);
          }
        });
      }
      
      console.log('Grupos seleccionados inicialmente:', groups);
      setSelectedGroups(groups);
      setSelectedJobTitle(jobTitle);
    }
  }, [user]);
  
  // Obtener inicial para avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };
  
  // Alternar selección de grupo
  const toggleGroup = (groupId) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId));
    } else {
      setSelectedGroups([...selectedGroups, groupId]);
    }
  };
  
  // Guardar cambios
  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener todos los roles necesarios según el puesto actual del usuario
      // pero separando completamente esta lógica de los grupos de aprobación
      let newRoles = [];
      
      // Conservar los roles existentes que no están relacionados con grupos de aprobación
      if (user.roles && Array.isArray(user.roles)) {
        // Filtrar roles que no pertenecen a ningún grupo de aprobación
        newRoles = user.roles.filter(role => {
          // Verificar si este rol pertenece a algún grupo de aprobación
          const belongsToApprovalGroup = appGroups.some(group => 
            group.roles.includes(role)
          );
          
          // Mantenemos solo los roles que NO pertenecen a grupos de aprobación
          return !belongsToApprovalGroup;
        });
      }
      
      // Agregar roles específicos basados en el jobTitle y los grupos seleccionados
      selectedGroups.forEach(groupId => {
        const group = appGroups.find(g => g.id === groupId);
        
        if (group) {
          // Si el jobTitle coincide exactamente con alguno de los roles del grupo,
          // solo agregar ese rol específico
          const matchingRole = group.roles.find(
            role => selectedJobTitle && selectedJobTitle.toLowerCase() === role.replace(/_/g, ' ')
          );
          
          if (matchingRole) {
            // Agregar solo el rol que coincide con el puesto
            if (!newRoles.includes(matchingRole)) {
              newRoles.push(matchingRole);
            }
          } else {
            // Si no hay coincidencia exacta, incluir el primer rol como representante del grupo
            if (group.roles.length > 0 && !newRoles.includes(group.roles[0])) {
              newRoles.push(group.roles[0]);
            }
          }
        }
      });
      
      // Asegurarse de preservar el rol de admin si ya lo tiene
      if (user.roles && user.roles.includes('admin') && !newRoles.includes('admin')) {
        newRoles.push('admin');
      }
      
      // Asegurarse de tener siempre al menos el rol de 'cliente'
      if (newRoles.length === 0) {
        newRoles.push('cliente');
      }
      
      console.log('Guardando grupos:', selectedGroups);
      console.log('Guardando roles actualizados:', newRoles);
      
      // Crear objeto con datos actualizados
      const updatedUserData = {
        ...user,
        roles: newRoles,
        userGroups: selectedGroups // Los grupos se guardan separadamente
      };
      
      // Guardar en Firebase asegurando que userGroups es un campo separado de roles
      await updateUserRoles(user.uid, {
        roles: newRoles,
        userGroups: selectedGroups
      });
      
      // Actualizar localmente el contexto de autenticación si es el usuario actual
      if (currentUser && currentUser.uid === user.uid) {
        console.log('Actualizando roles y grupos del usuario actual');
        // Actualizar roles del usuario en el contexto de autenticación
        setUserRoles(newRoles);
        
        // Si hay una función para actualizar grupos en el contexto, utilizarla
        if (typeof currentUser.setUserGroups === 'function') {
          currentUser.setUserGroups(selectedGroups);
        }
      }
      
      // Crear una copia profunda del objeto actualizado para evitar problemas de referencia
      const cleanUpdatedData = JSON.parse(JSON.stringify({
        ...updatedUserData,
        userGroups: selectedGroups // Asegurar que los grupos estén explícitamente establecidos
      }));
      
      // Notificar al componente padre con la copia del objeto
      onSave(cleanUpdatedData);
      
      // Cerrar el modal automáticamente después de guardar
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error al actualizar grupos y roles:', err);
      setError(`Error al actualizar los grupos: ${err.message || 'Error desconocido'}`);
      setLoading(false);
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asignar Grupos de Aprobación"
    >
      <ModalContent>
        <UserInfo>
          <UserAvatar>
            {user?.photo ? (
              <img src={user.photo} alt={user.displayName} />
            ) : (
              <AvatarInitial>
                {getInitial(user?.displayName)}
              </AvatarInitial>
            )}
          </UserAvatar>
          <UserDetails>
            <UserName>{user?.displayName}</UserName>
            <UserEmail>{user?.email}</UserEmail>
            <UserDepartment>
              {user?.department && user.department !== 'No especificado' 
                ? `${user.department} • ${user.jobTitle !== 'No especificado' ? user.jobTitle : 'Sin puesto'}`
                : 'Sin departamento/puesto asignado'}
            </UserDepartment>
          </UserDetails>
        </UserInfo>
        
        <FormSection>
          <SectionTitle>
            <FaUsers /> Grupos de Aprobación
          </SectionTitle>
          <p style={{ marginBottom: theme.spacing.md, fontSize: '0.9rem' }}>
            Seleccione los grupos a los que pertenecerá este usuario según su rol en la organización.
          </p>
          <GroupOptions>
            {appGroups.map(group => (
              <GroupCard 
                key={group.id}
                selected={selectedGroups.includes(group.id)}
                onClick={() => toggleGroup(group.id)}
              >
                <GroupIcon selected={selectedGroups.includes(group.id)}>
                  {group.icon}
                </GroupIcon>
                <GroupName>{group.name}</GroupName>
                <GroupDescription>{group.description}</GroupDescription>
              </GroupCard>
            ))}
          </GroupOptions>
        </FormSection>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <ModalActions>
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={loading}
          >
            <FaTimes /> Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={loading}
          >
            <FaCheck /> {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};

export default GroupRolesModal;
