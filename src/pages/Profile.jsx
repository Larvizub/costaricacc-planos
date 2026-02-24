import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaBriefcase, FaBuilding, FaUserTag, FaLock, FaUsers } from 'react-icons/fa';
import { getUserProfile } from '../services/microsoftService';
import { theme } from '../styles/GlobalStyles';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import ProfileImageUploader from '../components/ProfileImageUploader';
import { appGroups as appGroupsData } from '../components/users/GroupRolesModal';

// Estilos para la página de perfil
const ProfileContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
    text-align: center;
  }
`;

const ProfileAvatar = styled.div`
  margin-right: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.md}) {
    margin-right: 0;
    margin-bottom: ${theme.spacing.md};
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h2`
  margin: 0;
  color: ${theme.colors.text};
  font-size: 1.8rem;
`;

const ProfileEmail = styled.p`
  margin: ${theme.spacing.xs} 0 0;
  color: ${theme.colors.textLight};
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  
  @media (max-width: ${theme.breakpoints.md}) {
    justify-content: center;
  }
`;

const ProfileSection = styled.div`
  margin-top: ${theme.spacing.xl};
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.text};
  border-bottom: 1px solid ${theme.colors.border};
  padding-bottom: ${theme.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.lg};
`;

const ProfileItem = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

const ProfileLabel = styled.div`
  font-weight: 600;
  color: ${theme.colors.textLight};
  margin-bottom: ${theme.spacing.xs};
  font-size: 0.9rem;
`;

const ProfileValue = styled.div`
  color: ${theme.colors.text};
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${theme.spacing.xl};
`;

const ProfileBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.small};
  font-size: 0.85rem;
  font-weight: 500;
  gap: ${theme.spacing.xs};
  background-color: ${theme.colors.primary}20;
  color: ${theme.colors.primary};
  margin-right: ${theme.spacing.sm};
`;

const Profile = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const profileData = await getUserProfile();
                
                // Log para depuración
                if (import.meta.env.DEV) {
                    console.log('Datos de perfil obtenidos:', profileData);
                }
                
                setUserProfile(profileData);
                setLoading(false);
            } catch (err) {
                setError('Error al cargar los datos del perfil. Por favor intente de nuevo.');
                setLoading(false);
                console.error('Error fetching profile:', err);
            }
        };

        // Solo intentar cargar el perfil si hay un usuario autenticado
        if (currentUser) {
            fetchUserProfile();
        } else {
            setError('Debe iniciar sesión para ver su perfil');
            setLoading(false);
        }
    }, [currentUser]);

    const handleEditProfile = () => {
        navigate('/perfil/editar');
    };
    
    const handleImageChange = (imageUrl) => {
        if (userProfile) {
            setUserProfile({
                ...userProfile,
                photo: imageUrl
            });
        }
    };

    return (
        <Layout title="Perfil de Usuario">
            <ProfileContainer>
                {loading ? (
                    <Card>
                        <Card.Content>
                            Cargando datos del perfil...
                        </Card.Content>
                    </Card>
                ) : error ? (
                    <Alert 
                        type="error"
                        title="Error"
                        description={error}
                        visible={true}
                    />
                ) : userProfile ? (
                    <Card elevation="medium">
                        <Card.Content>
                            <ProfileHeader>
                                <ProfileAvatar>
                                    <ProfileImageUploader 
                                        currentImage={userProfile.photo}
                                        displayName={userProfile.displayName}
                                        onImageChange={handleImageChange}
                                    />
                                </ProfileAvatar>
                                <ProfileInfo>
                                    <ProfileName>{userProfile.displayName}</ProfileName>
                                    <ProfileEmail>
                                        <FaEnvelope size={14} /> {userProfile.email}
                                    </ProfileEmail>
                                </ProfileInfo>
                            </ProfileHeader>

                            <ProfileSection>
                                <SectionTitle>
                                    <FaBriefcase /> Información Laboral
                                </SectionTitle>
                                <ProfileGrid>
                                    <ProfileItem>
                                        <ProfileLabel>Departamento</ProfileLabel>
                                        <ProfileValue>
                                            <FaBuilding size={14} /> {userProfile.department && userProfile.department !== 'No especificado' 
                                                ? userProfile.department 
                                                : 'No especificado'}
                                        </ProfileValue>
                                    </ProfileItem>
                                    <ProfileItem>
                                        <ProfileLabel>Puesto</ProfileLabel>
                                        <ProfileValue>
                                            <FaBriefcase size={14} /> {userProfile.jobTitle && userProfile.jobTitle !== 'No especificado' 
                                                ? userProfile.jobTitle 
                                                : 'No especificado'}
                                        </ProfileValue>
                                    </ProfileItem>
                                </ProfileGrid>
                            </ProfileSection>

                            <ProfileSection>
                              <SectionTitle>
                                <FaUserTag /> Roles y Permisos
                              </SectionTitle>
                              <ProfileGrid>
                                <ProfileItem>
                                  <ProfileLabel>Roles Asignados</ProfileLabel>
                                  <ProfileValue>
                                    {/* Filtrar roles para no mostrar los que pertenecen a grupos de aprobación */}
                                    {(() => {
                                      let roles = [];
                                      
                                      // Obtener roles del usuario
                                      if (Array.isArray(userProfile.roles)) {
                                        roles = [...userProfile.roles];
                                      } else if (typeof userProfile.roles === 'string') {
                                        roles = userProfile.roles.split(',').map(r => r.trim());
                                      } else {
                                        roles = ['cliente']; // Valor por defecto
                                      }
                                      
                                      // Filtrar roles para excluir aquellos que pertenecen a grupos de aprobación
                                      // excepto el rol de admin
                                      const filteredRoles = roles.filter(role => {
                                        // Verificar si este rol pertenece a algún grupo de aprobación
                                        const belongsToApprovalGroup = appGroupsData.some(group => 
                                          group.roles.includes(role)
                                        );
                                        
                                        // Solo incluir en los roles si NO pertenece a grupo de aprobación o es admin
                                        return !belongsToApprovalGroup || role.toLowerCase() === 'admin';
                                      });
                                      
                                      if (filteredRoles.length > 0) {
                                        return filteredRoles.map((role, index) => (
                                          <ProfileBadge key={index}>
                                            <FaUserTag size={14} /> {role.trim()}
                                          </ProfileBadge>
                                        ));
                                      } else {
                                        return (
                                          <span style={{ fontSize: '0.95rem', color: theme.colors.textLight }}>
                                            Sin roles específicos asignados
                                          </span>
                                        );
                                      }
                                    })()}
                                  </ProfileValue>
                                </ProfileItem>
                                <ProfileItem>
                                  <ProfileLabel>Nivel de Acceso</ProfileLabel>
                                  <ProfileValue>
                                    <FaLock size={14} /> {userProfile.accessLevel || 'Básico'}
                                  </ProfileValue>
                                </ProfileItem>
                              </ProfileGrid>
                            </ProfileSection>
                            
                            <ProfileSection>
                              <SectionTitle>
                                <FaUsers /> Grupos de Aprobación
                              </SectionTitle>
                              <ProfileItem>
                                <ProfileValue>
                                  {(() => {
                                    // Determinar grupos a mostrar
                                    let groups = [];
                                    
                                    // Primero intentar usar userGroups explícitamente definidos
                                    if (Array.isArray(userProfile.userGroups) && userProfile.userGroups.length > 0) {
                                      groups = userProfile.userGroups;
                                    } 
                                    // Si no hay grupos explícitos, intentar deducirlos de los roles asignados
                                    else if (Array.isArray(userProfile.roles) && userProfile.roles.length > 0) {
                                      // Para cada grupo de aprobación, verificar si el usuario tiene algún rol de ese grupo
                                      appGroupsData.forEach(group => {
                                        const hasRoleInGroup = group.roles.some(role => userProfile.roles.includes(role));
                                        if (hasRoleInGroup && !groups.includes(group.id)) {
                                          groups.push(group.id);
                                        }
                                      });
                                    }
                                    
                                    // Ahora mostrar los grupos
                                    if (groups && groups.length > 0) {
                                      return groups.map((groupId, index) => {
                                        // Buscar el nombre del grupo en appGroups
                                        const group = appGroupsData.find(g => g.id === groupId);
                                        const groupName = group ? group.name : groupId
                                          .split('_')
                                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                          .join(' ');
                                          
                                        return (
                                          <ProfileBadge key={index} style={{backgroundColor: `${theme.colors.success}20`, color: theme.colors.success}}>
                                            <FaUsers size={14} /> {groupName}
                                          </ProfileBadge>
                                        );
                                      });
                                    } else {
                                      return (
                                        <span style={{ fontSize: '0.95rem', color: theme.colors.textLight }}>
                                          Sin grupos de aprobación asignados
                                        </span>
                                      );
                                    }
                                  })()}
                                </ProfileValue>
                              </ProfileItem>
                            </ProfileSection>

                            <ButtonContainer>
                                <Button 
                                    variant="primary" 
                                    onClick={handleEditProfile}
                                >
                                    Editar Perfil
                                </Button>
                            </ButtonContainer>
                        </Card.Content>
                    </Card>
                ) : (
                    <Alert 
                        type="warning"
                        title="Sin datos"
                        description="No se encontraron datos de perfil para este usuario."
                        visible={true}
                    />
                )}
            </ProfileContainer>
        </Layout>
    );
};

export default Profile;