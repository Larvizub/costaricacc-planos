import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import { getUserProfile, updateUserProfile } from '../services/microsoftService';
import { theme } from '../styles/GlobalStyles';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ProfileImageUploader from '../components/ProfileImageUploader';

// Estilos para la página de edición de perfil
const ProfileContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const ProfileImageSection = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${theme.spacing.xl};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const FormSection = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.text};
  border-bottom: 1px solid ${theme.colors.border};
  padding-bottom: ${theme.spacing.sm};
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.xl};
`;

const EditProfilePage = () => {
    const [profileData, setProfileData] = useState({
        displayName: '',
        department: '',
        jobTitle: '',
        phoneNumber: '',
        photo: null
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const profile = await getUserProfile();
                setProfileData({
                    displayName: profile.displayName || '',
                    department: profile.department || 'No especificado',
                    jobTitle: profile.jobTitle || 'No especificado',
                    phoneNumber: profile.phoneNumber || '',
                    photo: profile.photo || null
                });
                setLoading(false);
            } catch (err) {
                setError('Error al cargar los datos del perfil. Por favor intente de nuevo.');
                setLoading(false);
                console.error('Error fetching profile:', err);
            }
        };

        if (currentUser) {
            fetchUserProfile();
        } else {
            setError('Debe iniciar sesión para editar su perfil');
            setLoading(false);
        }
    }, [currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setSubmitting(true);
            await updateUserProfile(profileData);
            setSubmitting(false);
            toast.success('Perfil actualizado correctamente');
            navigate('/perfil');
        } catch (err) {
            setSubmitting(false);
            setError('Error al actualizar el perfil. Por favor intente de nuevo.');
            console.error('Error updating profile:', err);
        }
    };

    const handleImageChange = (imageUrl) => {
        setProfileData(prev => ({
            ...prev,
            photo: imageUrl
        }));
    };

    const handleCancel = () => {
        navigate('/perfil');
    };

    return (
        <Layout title="Editar Perfil">
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
                ) : (
                    <form onSubmit={handleSubmit}>
                        <Card elevation="medium">
                            <Card.Content>
                                <ProfileImageSection>
                                    <ProfileImageUploader 
                                        currentImage={profileData.photo}
                                        displayName={profileData.displayName}
                                        onImageChange={handleImageChange}
                                    />
                                </ProfileImageSection>
                                
                                <FormSection>
                                    <SectionTitle>Información Personal</SectionTitle>
                                    <FormRow>
                                        <Input
                                            label="Nombre completo"
                                            name="displayName"
                                            value={profileData.displayName}
                                            onChange={handleChange}
                                            placeholder="Ingrese su nombre completo"
                                            required
                                        />
                                        <Input
                                            label="Número de teléfono"
                                            name="phoneNumber"
                                            value={profileData.phoneNumber}
                                            onChange={handleChange}
                                            placeholder="Ingrese su número de teléfono"
                                        />
                                    </FormRow>
                                </FormSection>
                                
                                <FormSection>
                                    <SectionTitle>Información Laboral</SectionTitle>
                                    <FormRow>
                                        <Input
                                            label="Departamento"
                                            name="department"
                                            value={profileData.department}
                                            readOnly
                                            disabled
                                            helper="Este valor se obtiene automáticamente de su cuenta de Microsoft"
                                        />
                                        <Input
                                            label="Puesto"
                                            name="jobTitle"
                                            value={profileData.jobTitle}
                                            readOnly
                                            disabled
                                            helper="Este valor se obtiene automáticamente de su cuenta de Microsoft"
                                        />
                                    </FormRow>
                                </FormSection>
                                
                                <ButtonContainer>
                                    <Button 
                                        variant="outline" 
                                        type="button" 
                                        onClick={handleCancel}
                                    >
                                        <FaTimes /> Cancelar
                                    </Button>
                                    <Button 
                                        variant="primary" 
                                        type="submit" 
                                        disabled={submitting}
                                    >
                                        <FaSave /> {submitting ? 'Guardando...' : 'Guardar Cambios'}
                                    </Button>
                                </ButtonContainer>
                            </Card.Content>
                        </Card>
                    </form>
                )}
            </ProfileContainer>
        </Layout>
    );
};

export default EditProfilePage;
