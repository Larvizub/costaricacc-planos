import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FaCamera, FaTrash, FaUser } from 'react-icons/fa';
import { theme } from '../styles/GlobalStyles';
import { uploadProfileImage, removeProfileImage } from '../services/profileService';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext'; // Asegúrate de tener el contexto de Auth importado

const ProfileImageContainer = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
  background-color: ${theme.colors.backgroundAlt};
  box-shadow: ${theme.shadows.small};
  
  /* Eliminar cualquier pseudo-elemento que pueda crear el círculo verde */
  &::before, &::after {
    display: none !important;
  }
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  display: none; /* Ocultamos el placeholder con la letra */
`;

const ImageActions = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs};
  background-color: rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  opacity: 0;
  
  ${ProfileImageContainer}:hover & {
    opacity: 1;
  }
`;

const ImageActionButton = styled.button`
  background-color: ${({ danger }) => danger ? theme.colors.error : theme.colors.primary};
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &:disabled {
    background-color: ${theme.colors.border};
    cursor: not-allowed;
    transform: none;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ProfileImageUploader = ({ currentImage, displayName, onImageChange }) => {
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const fileInputRef = useRef(null);
  const { currentUser } = useAuth(); // Importar el contexto de Auth para verificar si es usuario de Microsoft
  
  // Determinar si es una cuenta de Microsoft para mostrar una UI específica
  const isMicrosoftAccount = currentUser?.providerData?.some(p => p.providerId === 'microsoft.com');
  
  const handleOpenFileDialog = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setUploading(true);
      toast.info('Subiendo imagen...');
      
      const imageUrl = await uploadProfileImage(file);
      
      toast.success('Imagen de perfil actualizada');
      if (onImageChange) onImageChange(imageUrl);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error('Error upload:', error);
    } finally {
      setUploading(false);
    }
  };
  
  const handleRemoveImage = async () => {
    if (!currentImage) return;
    
    if (!window.confirm('¿Está seguro que desea eliminar su foto de perfil?')) {
      return;
    }
    
    try {
      setRemoving(true);
      toast.info('Eliminando imagen...');
      
      await removeProfileImage();
      
      toast.success('Imagen de perfil eliminada');
      if (onImageChange) onImageChange(null);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error('Error removing:', error);
    } finally {
      setRemoving(false);
    }
  };
  
  const getInitial = () => {
    return <FaUser size={40} />; // En lugar de la letra, siempre mostramos el icono de usuario
  };
  
  return (
    <ProfileImageContainer>
      {currentImage ? (
        <ProfileImage src={currentImage} alt="Foto de perfil" />
      ) : (
        <AvatarPlaceholder>
          {getInitial()}
        </AvatarPlaceholder>
      )}
      
      <ImageActions>
        {/* Mostrar botón de cambiar imagen solo para usuarios que no sean de Microsoft */}
        {!isMicrosoftAccount && (
          <ImageActionButton 
            onClick={handleOpenFileDialog} 
            disabled={uploading || removing}
            title="Cambiar imagen"
          >
            <FaCamera />
          </ImageActionButton>
        )}
        
        {/* Mostrar botón de eliminar solo si no es cuenta de Microsoft o hay una imagen subida manualmente */}
        {(currentImage && !isMicrosoftAccount) && (
          <ImageActionButton 
            onClick={handleRemoveImage}
            disabled={uploading || removing}
            danger
            title="Eliminar imagen"
          >
            <FaTrash />
          </ImageActionButton>
        )}
      </ImageActions>
      
      <HiddenInput 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*"
      />
    </ProfileImageContainer>
  );
};

export default ProfileImageUploader;
