import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/GlobalStyles';
import { 
  FaUserCog, 
  FaMicrosoft, 
  FaUsers
} from 'react-icons/fa';
import Card from '../Card';
import { appGroups } from './GroupRolesModal';

// Estilos para el componente
const UsersListContainer = styled(Card)`
  margin-bottom: ${theme.spacing.xl};
  overflow-x: auto;
`;

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background-color: ${theme.colors.background};
  
  th {
    padding: ${theme.spacing.md};
    text-align: left;
    font-weight: 600;
    color: ${theme.colors.text};
    border-bottom: 1px solid ${theme.colors.border};
  }
`;

const TableBody = styled.tbody`
  tr {
    border-bottom: 1px solid ${theme.colors.border};
    
    &:hover {
      background-color: ${theme.colors.background};
    }
  }
  
  td {
    padding: ${theme.spacing.md};
    vertical-align: middle;
  }
`;

const UserName = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
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
  color: ${theme.colors.primary};
  font-weight: 600;
  font-size: 1.2rem;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const DisplayName = styled.div`
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const Email = styled.div`
  font-size: 0.85rem;
  color: ${theme.colors.textLight};
`;

const DepartmentInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Department = styled.div`
  font-size: 0.9rem;
`;

const JobTitle = styled.div`
  font-size: 0.85rem;
  color: ${theme.colors.textLight};
  margin-top: 2px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  cursor: pointer;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.small};
  transition: background-color 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${theme.colors.primaryLight};
  }
  
  & + & {
    margin-left: ${theme.spacing.sm};
  }
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  margin-right: 4px;
  margin-bottom: 4px;
  border-radius: 4px;
  font-size: 0.8rem;
  background-color: ${({ isAdmin }) => isAdmin ? `${theme.colors.error}20` : `${theme.colors.info}20`};
  color: ${({ isAdmin }) => isAdmin ? theme.colors.error : theme.colors.info};
`;

const GroupBadge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  margin-right: 4px;
  margin-bottom: 4px;
  border-radius: 4px;
  font-size: 0.8rem;
  background-color: ${theme.colors.successLight};
  color: ${theme.colors.success};
`;

const MicrosoftBadge = styled.span`
  display: inline-flex;
  align-items: center;
  color: #0078d4;
  font-size: 0.85rem;
  margin-left: ${theme.spacing.xs};
`;

const EmptyState = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.textLight};
`;

const LoadingState = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.textLight};
`;

const UsersList = ({ users, loading, onEditRoles, onEditGroups }) => {
  // Función para obtener inicial del nombre
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };
  
  // Función para mostrar roles
  const renderRoles = (user) => {
    let roles = [];
    
    // Determinar si hay roles asignados
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
    
    // Filtrar los roles para que no incluyan los que están asignados por grupos de aprobación
    // Esto asegura que los roles y grupos se muestren separados
    const filteredRoles = roles.filter(role => {
      // Verificar si este rol pertenece a algún grupo de aprobación
      const belongsToApprovalGroup = appGroups.some(group => 
        group.roles.includes(role)
      );
      
      // Solo incluir en los roles si NO pertenece a algún grupo de aprobación
      // o si es un rol administrativo (admin)
      return !belongsToApprovalGroup || role.toLowerCase() === 'admin';
    });
    
    // Mostrar roles como badges
    return filteredRoles.map(role => (
      <RoleBadge 
        key={role} 
        isAdmin={role.toLowerCase() === 'admin'}
      >
        {role}
      </RoleBadge>
    ));
  };

  // Función para mostrar grupos
  const renderGroups = (user) => {
    let groups = [];
    
    // Determinar si hay grupos asignados explícitamente (campo userGroups)
    if (user.userGroups) {
      if (typeof user.userGroups === 'string') {
        groups = user.userGroups.split(',').map(g => g.trim());
      } else if (Array.isArray(user.userGroups)) {
        groups = user.userGroups;
      }
    } else {
      // Si no hay grupos definidos explícitamente, intentamos deducirlos de los roles
      // Este es un caso de compatibilidad hacia atrás para usuarios existentes
      if (user.roles && Array.isArray(user.roles)) {
        // Para cada grupo de aprobación, verificar si el usuario tiene algún rol de ese grupo
        appGroups.forEach(group => {
          const hasRoleInGroup = group.roles.some(role => user.roles.includes(role));
          if (hasRoleInGroup && !groups.includes(group.id)) {
            groups.push(group.id);
          }
        });
      }
    }
    
    // Si no hay grupos, mostrar mensaje
    if (groups.length === 0) {
      return <span style={{ fontSize: '0.85rem', color: theme.colors.textLight }}>Sin grupos asignados</span>;
    }
    
    // Mostrar grupos como badges, usando nombres legibles desde appGroups
    return groups.map(groupId => {
      // Buscar el grupo en la definición de appGroups importada
      const appGroup = appGroups.find(g => g.id === groupId);
      
      // Usar el nombre legible si existe, o convertir el ID a un nombre legible
      const groupName = appGroup 
        ? appGroup.name 
        : groupId.split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
      return (
        <GroupBadge key={groupId}>
          {groupName}
        </GroupBadge>
      );
    });
  };
  
  if (loading) {
    return (
      <UsersListContainer>
        <Card.Content>
          <LoadingState>Cargando usuarios...</LoadingState>
        </Card.Content>
      </UsersListContainer>
    );
  }
  
  if (!users || users.length === 0) {
    return (
      <UsersListContainer>
        <Card.Content>
          <EmptyState>No se encontraron usuarios</EmptyState>
        </Card.Content>
      </UsersListContainer>
    );
  }
  
  return (
    <UsersListContainer>
      <UserTable>
        <TableHeader>
          <tr>
            <th>Usuario</th>
            <th>Departamento</th>
            <th>Roles</th>
            <th>Grupos de Aprobación</th>
            <th>Acciones</th>
          </tr>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <tr key={user.uid}>
              <td>
                <UserName>
                  <UserAvatar>
                    {user.photo ? (
                      <img src={user.photo} alt={user.displayName} />
                    ) : (
                      <AvatarInitial>
                        {getInitial(user.displayName)}
                      </AvatarInitial>
                    )}
                  </UserAvatar>
                  <UserInfo>
                    <DisplayName>
                      {user.displayName}
                      {user.microsoftAccount && (
                        <MicrosoftBadge title="Cuenta Microsoft">
                          <FaMicrosoft />
                        </MicrosoftBadge>
                      )}
                    </DisplayName>
                    <Email>{user.email}</Email>
                  </UserInfo>
                </UserName>
              </td>
              <td>
                <DepartmentInfo>
                  <Department>
                    {user.department && user.department !== 'No especificado' 
                      ? user.department 
                      : 'Sin departamento'}
                  </Department>
                  <JobTitle>
                    {user.jobTitle && user.jobTitle !== 'No especificado'
                      ? user.jobTitle
                      : 'Sin puesto'}
                  </JobTitle>
                </DepartmentInfo>
              </td>
              <td>
                {renderRoles(user)}
              </td>
              <td>
                {renderGroups(user)}
              </td>
              <td style={{ whiteSpace: 'nowrap' }}>
                <ActionButton
                  onClick={() => onEditRoles(user)}
                  title="Editar roles y permisos"
                >
                  <FaUserCog />
                </ActionButton>
                <ActionButton
                  onClick={() => onEditGroups(user)}
                  title="Gestionar grupos de aprobación"
                >
                  <FaUsers />
                </ActionButton>
              </td>
            </tr>
          ))}
        </TableBody>
      </UserTable>
    </UsersListContainer>
  );
};

export default UsersList;
