import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/GlobalStyles';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import UsersList from '../components/users/UsersList';
import UserRoleModal from '../components/users/UserRoleModal';
import GroupRolesModal from '../components/users/GroupRolesModal';
import { getAllUsers, searchUsers } from '../services/userManagementService';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

// Estilos para la página
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const SearchInputWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const SearchInput = styled(Input)`
  padding-left: ${theme.spacing.xl};
  width: 100%;
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

const StatsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const StatCard = styled(Card)`
  flex: 1;
  text-align: center;
  min-width: 150px;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${theme.colors.primary};
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${theme.colors.textLight};
`;

// Página principal de gestión de usuarios
const UsersPage = () => {
  const { currentUser, setUserRoles } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  
  // Cargar usuarios al iniciar
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllUsers();
        setUsers(data);
        setFilteredUsers(data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar la lista de usuarios');
        setLoading(false);
        console.error('Error cargando usuarios:', err);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Manejar búsqueda
  const handleSearch = async () => {
    try {
      setLoading(true);
      const results = await searchUsers(searchTerm);
      setFilteredUsers(results);
      setLoading(false);
    } catch (err) {
      setError('Error al realizar la búsqueda');
      setLoading(false);
    }
  };
  
  // Reiniciar filtros
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilteredUsers(users);
  };
  
  // Manejo del modal de edición de roles
  const handleEditRoles = (user) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };
  
  const handleCloseRoleModal = () => {
    setIsRoleModalOpen(false);
    setSelectedUser(null);
  };
  
  // Manejo del modal de edición de grupos
  const handleEditGroups = (user) => {
    setSelectedUser(user);
    setIsGroupModalOpen(true);
  };
  
  const handleCloseGroupModal = () => {
    setIsGroupModalOpen(false);
    setSelectedUser(null);
  };
  
  // Función para actualizar un usuario después de cambiar sus roles
  const handleUpdateRoles = async (updatedUser) => {
    try {
      console.log('Usuario actualizado:', updatedUser);
      
      // Actualizar usuario en lista local
      const updatedUsers = users.map(user => 
        user.uid === updatedUser.uid ? { ...user, ...updatedUser } : user
      );
      
      // Actualizar ambas listas
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      // Si el usuario actualizado es el usuario actual, actualizar también el contexto
      if (currentUser && currentUser.uid === updatedUser.uid) {
        setUserRoles(updatedUser.roles);
      }
      
      // Cerrar el modal
      setIsRoleModalOpen(false);
      setIsGroupModalOpen(false);
      setSelectedUser(null);
      
      // Mostrar mensaje de éxito
      toast.success('Roles y permisos actualizados con éxito');
      
      // Actualizar datos después de un breve retraso
      setTimeout(async () => {
        try {
          const refreshedUsers = await getAllUsers();
          setUsers(refreshedUsers);
          setFilteredUsers(refreshedUsers);
        } catch (refreshErr) {
          console.warn('Error al refrescar lista de usuarios:', refreshErr);
        }
      }, 1000);
    } catch (error) {
      console.error('Error al actualizar roles de usuario:', error);
      toast.error('Error al actualizar roles de usuario');
    }
  };
  
  // Cálculo de estadísticas
  const stats = {
    total: users.length,
    admins: users.filter(user => 
      user.roles && (Array.isArray(user.roles) 
        ? user.roles.includes('admin') 
        : user.roles.includes('admin'))
    ).length,
    microsoft: users.filter(user => user.microsoftAccount).length
  };
  
  return (
    <Layout title="Gestión de Usuarios">
      <PageContainer>
        <StatsContainer>
          <StatCard>
            <Card.Content>
              <StatValue>{stats.total}</StatValue>
              <StatLabel>Total de Usuarios</StatLabel>
            </Card.Content>
          </StatCard>
          <StatCard>
            <Card.Content>
              <StatValue>{stats.admins}</StatValue>
              <StatLabel>Administradores</StatLabel>
            </Card.Content>
          </StatCard>
          <StatCard>
            <Card.Content>
              <StatValue>{stats.microsoft}</StatValue>
              <StatLabel>Cuentas Microsoft</StatLabel>
            </Card.Content>
          </StatCard>
        </StatsContainer>
        
        <SearchContainer>
          <SearchInputWrapper>
            <SearchInput 
              placeholder="Buscar por nombre, email o departamento"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </SearchInputWrapper>
          <Button onClick={handleSearch}>Buscar</Button>
          <Button variant="secondary" onClick={handleResetFilters}>
            Limpiar
          </Button>
        </SearchContainer>
        
        <FilterContainer>
          <div>
            <strong>Total:</strong> {filteredUsers.length} usuarios
          </div>
        </FilterContainer>
        
        {error && (
          <Alert
            type="error"
            title="Error"
            description={error}
            visible={true}
          />
        )}
        
        <UsersList 
          users={filteredUsers} 
          loading={loading} 
          onEditRoles={handleEditRoles}
          onEditGroups={handleEditGroups}
        />
        
        {/* Modal de edición de roles */}
        {selectedUser && (
          <UserRoleModal
            isOpen={isRoleModalOpen}
            onClose={handleCloseRoleModal}
            user={selectedUser}
            onSave={handleUpdateRoles}
          />
        )}
        
        {/* Modal de gestión de grupos de aprobación */}
        {selectedUser && (
          <GroupRolesModal
            isOpen={isGroupModalOpen}
            onClose={handleCloseGroupModal}
            user={selectedUser}
            onSave={handleUpdateRoles}
          />
        )}
      </PageContainer>
    </Layout>
  );
};

export default UsersPage;
