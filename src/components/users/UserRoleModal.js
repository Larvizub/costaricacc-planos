import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUserShield, FaUser, FaUsers, FaCheck } from 'react-icons/fa';
import Modal from '../Modal';
import Button from '../Button';
import { theme } from '../../styles/GlobalStyles';
import { updateUserRoles } from '../../services/userManagementService';
import { useAuth } from '../../context/AuthContext';

const ModalContent = styled.div`
  padding: ${theme.spacing.lg};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
  gap: ${theme.spacing.md};
`;

const UserAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  background-color: ${theme.colors.backgroundAlt};
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

const RoleOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const RoleCard = styled.div`
  border: 1px solid ${props => props.selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.md};
  cursor: pointer;
  flex: 1;
  min-width: 150px;
  background-color: ${props => props.selected ? `${theme.colors.primary}10` : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${theme.colors.primary};
    background-color: ${props => props.selected ? `${theme.colors.primary}10` : `${theme.colors.primary}05`};
  }
`;

const RoleIcon = styled.div`
  font-size: 1.5rem;
  color: ${props => props.selected ? theme.colors.primary : theme.colors.textLight};
  margin-bottom: ${theme.spacing.sm};
`;

const RoleName = styled.div`
  font-weight: 500;
  color: ${theme.colors.text};
`;

const RoleDescription = styled.div`
  font-size: 0.8rem;
  color: ${theme.colors.textLight};
  margin-top: ${theme.spacing.xs};
`;

const AccessLevelOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const AccessLevelOption = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.small};
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${theme.colors.backgroundAlt};
  }
`;

const RadioInput = styled.input`
  margin-right: ${theme.spacing.sm};
`;

const AccessLevelName = styled.span`
  font-weight: 500;
  color: ${theme.colors.text};
`;

const AccessLevelDescription = styled.span`
  font-size: 0.8rem;
  color: ${theme.colors.textLight};
  margin-left: ${theme.spacing.sm};
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

const UserRoleModal = ({ isOpen, onClose, user, onSave }) => {
  const { currentUser, setUserRoles } = useAuth();
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [accessLevel, setAccessLevel] = useState('Básico');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Inicializar valores al abrir el modal
  useEffect(() => {
    if (user) {
      // Determinar roles seleccionados
      let roles = [];
      if (user.roles) {
        if (typeof user.roles === 'string') {
          roles = user.roles.split(',').map(r => r.trim());
        } else if (Array.isArray(user.roles)) {
          roles = user.roles;
        }
      }
      
      // Si no hay roles, asignar "cliente" por defecto
      if (roles.length === 0) {
        roles = ['cliente'];
      }
      
      setSelectedRoles(roles);
      setAccessLevel(user.accessLevel || 'Básico');
    }
  }, [user]);
  
  // Definir roles disponibles
  const availableRoles = [
    {
      id: 'admin',
      name: 'Administrador',
      description: 'Acceso completo a todas las funciones',
      icon: <FaUserShield />
    },
    {
      id: 'revisor',
      name: 'Revisor',
      description: 'Puede revisar y aprobar planos',
      icon: <FaCheck />
    },
    {
      id: 'cliente',
      name: 'Cliente',
      description: 'Acceso básico para solicitar planos',
      icon: <FaUser />
    }
  ];
  
  // Definir niveles de acceso
  const accessLevels = [
    {
      id: 'Básico',
      description: 'Acceso solo a funciones básicas'
    },
    {
      id: 'Intermedio',
      description: 'Acceso a la mayoría de las funciones'
    },
    {
      id: 'Avanzado',
      description: 'Acceso completo a todas las funciones'
    }
  ];
  
  // Obtener inicial para avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };
  
  // Alternar selección de rol
  const toggleRole = (roleId) => {
    if (selectedRoles.includes(roleId)) {
      // No permitir quitar todos los roles
      if (selectedRoles.length > 1) {
        setSelectedRoles(selectedRoles.filter(id => id !== roleId));
      }
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };
  
  // Guardar cambios
  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Guardando roles:', selectedRoles, 'y nivel de acceso:', accessLevel);
      
      // Crear objeto con datos actualizados
      const updatedUserData = {
        ...user,
        roles: selectedRoles,
        accessLevel
      };
      
      // Guardar en Firebase
      await updateUserRoles(user.uid, {
        roles: selectedRoles,
        accessLevel
      });
      
      // Actualizar localmente el contexto de autenticación si es el usuario actual
      if (currentUser && currentUser.uid === user.uid) {
        console.log('Actualizando roles del usuario actual');
        setUserRoles(selectedRoles);
      }
      
      // Notificar al componente padre
      onSave(updatedUserData);
      
      // Cerrar el modal automáticamente después de guardar
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error al actualizar roles:', err);
      setError(`Error al actualizar los roles: ${err.message || 'Error desconocido'}`);
      setLoading(false);
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Roles y Permisos"
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
            <FaUsers /> Roles del Usuario
          </SectionTitle>
          <RoleOptions>
            {availableRoles.map(role => (
              <RoleCard 
                key={role.id}
                selected={selectedRoles.includes(role.id)}
                onClick={() => toggleRole(role.id)}
              >
                <RoleIcon selected={selectedRoles.includes(role.id)}>
                  {role.icon}
                </RoleIcon>
                <RoleName>{role.name}</RoleName>
                <RoleDescription>{role.description}</RoleDescription>
              </RoleCard>
            ))}
          </RoleOptions>
        </FormSection>
        
        <FormSection>
          <SectionTitle>
            <FaUserShield /> Nivel de Acceso
          </SectionTitle>
          <AccessLevelOptions>
            {accessLevels.map(level => (
              <AccessLevelOption key={level.id}>
                <RadioInput 
                  type="radio" 
                  name="accessLevel" 
                  checked={accessLevel === level.id}
                  onChange={() => setAccessLevel(level.id)}
                />
                <AccessLevelName>{level.id}</AccessLevelName>
                <AccessLevelDescription>({level.description})</AccessLevelDescription>
              </AccessLevelOption>
            ))}
          </AccessLevelOptions>
        </FormSection>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <ModalActions>
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};

export default UserRoleModal;
