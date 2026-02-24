import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FaUpload, FaFile, FaFileAlt, FaFilePdf, FaFileImage, FaFileArchive, FaTimes, FaCloudUploadAlt } from 'react-icons/fa';
import { theme } from '../styles/GlobalStyles';

// Estilos del componente
const UploaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: ${theme.spacing.lg};
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-weight: 500;
  margin-bottom: ${theme.spacing.sm};
  
  span {
    margin-bottom: ${theme.spacing.xs};
  }
  
  .required {
    color: ${theme.colors.error};
    margin-left: ${theme.spacing.xs};
  }
`;

const DropZone = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 120px;
  border: 2px dashed ${props => props.isDragActive ? theme.colors.primary : theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.lg};
  background-color: ${props => props.isDragActive ? `${theme.colors.primary}10` : theme.colors.card};
  transition: all ${theme.transitions.default};
  cursor: pointer;
  
  &:hover {
    border-color: ${theme.colors.primary};
    background-color: ${`${theme.colors.primary}10`};
  }
`;

const UploadIcon = styled.div`
  font-size: 2rem;
  color: ${theme.colors.primary};
  margin-bottom: ${theme.spacing.sm};
`;

const UploadText = styled.div`
  text-align: center;
  color: ${theme.colors.textLight};
  
  p {
    margin-bottom: ${theme.spacing.xs};
  }
  
  .browse {
    color: ${theme.colors.primary};
    font-weight: 500;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FilePreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
  width: 100%;
`;

const FilePreview = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: ${`${theme.colors.primary}10`};
  border-radius: ${theme.borderRadius.small};
  
  .file-info {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    
    .file-icon {
      color: ${theme.colors.primary};
      font-size: 1.2rem;
    }
    
    .file-name {
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    .file-size {
      font-size: 0.8rem;
      color: ${theme.colors.textLight};
    }
  }
  
  .remove-button {
    cursor: pointer;
    color: ${theme.colors.error};
    border: none;
    background: none;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xs};
    
    &:hover {
      background-color: ${`${theme.colors.error}10`};
      border-radius: 50%;
    }
  }
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  font-size: 0.8rem;
  margin-top: ${theme.spacing.xs};
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.small};
  cursor: pointer;
  font-weight: 500;
  margin-top: ${theme.spacing.md};
  transition: all ${theme.transitions.default};
  
  &:hover {
    background-color: ${theme.colors.primaryDark};
  }
  
  &:disabled {
    background-color: ${theme.colors.border};
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
`;

/**
 * Componente para cargar archivos con vista previa
 * @param {object} props - Propiedades del componente
 * @returns {JSX.Element} Componente FileUploader
 */
const FileUploader = ({ 
  label, 
  name, 
  accept = '*/*',
  multiple = false,
  maxFiles = 5,
  maxSize = 10, // en MB
  required = false,
  value = [],
  onChange,
  onBlur,
  onUpload, // Nueva prop para manejar la subida
  error,
  helperText,
  showUploadButton = true // Mostrar botón de subida por defecto
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);
  
  // Determinar el icono según el tipo de archivo
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <FaFilePdf />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FaFileImage />;
      case 'zip':
      case 'rar':
        return <FaFileArchive />;
      case 'txt':
      case 'doc':
      case 'docx':
        return <FaFileAlt />;
      default:
        return <FaFile />;
    }
  };
  
  // Formatear el tamaño del archivo
  const formatFileSize = (size) => {
    if (size < 1024) {
      return size + ' B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(1) + ' KB';
    } else {
      return (size / (1024 * 1024)).toFixed(1) + ' MB';
    }
  };
  
  // Verificar si el archivo es válido
  const validateFile = (file) => {
    // Log para depuración
    console.log('Validando archivo:', {
      name: file.name,
      type: file.type,
      size: file.size,
      accept: accept
    });
    
    // Verificar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      return {
        isValid: false,
        message: `El archivo excede el tamaño máximo de ${maxSize} MB`
      };
    }
    
    // Verificar tipo si se especificó
    if (accept !== '*/*') {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      const acceptTypes = accept.split(',').map(type => type.trim());
      
      // Si no coincide con ninguno de los tipos aceptados
      if (!acceptTypes.some(type => {
        if (type.includes('*')) {
          const baseMimeType = type.split('/')[0];
          return fileType.startsWith(baseMimeType);
        }
        // Si el tipo comienza con punto, es una extensión
        if (type.startsWith('.')) {
          return fileName.endsWith(type.toLowerCase());
        }
        // Si no, es un tipo MIME
        return type === fileType;
      })) {
        return {
          isValid: false,
          message: `Tipo de archivo no permitido. Archivos permitidos: ${accept.replace(/\./g, '').toUpperCase()}`
        };
      }
    }
    
    return { isValid: true };
  };
  
  // Manejar cambio de archivos
  const handleFileChange = (e) => {
    e.preventDefault();
    
    const files = e.target.files;
    processFiles(files);
    
    // Limpiar el valor del input para permitir seleccionar el mismo archivo nuevamente
    e.target.value = null;
  };
  
  // Procesar los archivos seleccionados
  const processFiles = (files) => {
    if (!files || files.length === 0) return;
    
    // Limitar cantidad de archivos
    const totalFiles = multiple ? value.length + files.length : 1;
    if (totalFiles > maxFiles) {
      alert(`No se pueden subir más de ${maxFiles} archivos`);
      return;
    }
    
    // Convertir FileList a Array
    const filesArray = Array.from(files);
    let newFiles = [];
    let errors = [];
    
    // Validar cada archivo
    filesArray.forEach(file => {
      const validation = validateFile(file);
      
      if (validation.isValid) {
        newFiles.push(file);
      } else {
        errors.push(`Error en archivo ${file.name}: ${validation.message}`);
      }
    });
    
    // Mostrar errores si los hay
    if (errors.length > 0) {
      console.error('Errores de validación:', errors);
      alert(errors.join('\n'));
    }
    
    // Si hay archivos válidos, actualizar
    if (newFiles.length > 0) {
      const updatedFiles = multiple ? [...value, ...newFiles] : newFiles;
      
      if (onChange) {
        onChange({
          target: {
            name,
            value: updatedFiles
          }
        });
      }
    }
  };
  
  // Manejar eliminación de un archivo
  const handleRemoveFile = (index) => {
    const updatedFiles = [...value];
    updatedFiles.splice(index, 1);
    
    if (onChange) {
      onChange({
        target: {
          name,
          value: updatedFiles
        }
      });
    }
  };
  
  // Eventos de arrastrar y soltar
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const { files } = e.dataTransfer;
    processFiles(files);
    
    if (onBlur) {
      onBlur({
        target: { name }
      });
    }
  };
  
  // Abrir el diálogo de selección de archivos
  const openFileDialog = () => {
    inputRef.current.click();
  };
  
  // Manejar subida de archivos
  const handleUpload = async () => {
    if (!onUpload || value.length === 0) return;
    
    setIsUploading(true);
    try {
      await onUpload(value);
      // Limpiar archivos después de subir exitosamente
      if (onChange) {
        onChange({
          target: {
            name,
            value: []
          }
        });
      }
    } catch (error) {
      console.error('Error al subir archivos:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Limpiar archivos seleccionados
  const handleClear = () => {
    if (onChange) {
      onChange({
        target: {
          name,
          value: []
        }
      });
    }
  };
  
  return (
    <UploaderContainer>
      <Label htmlFor={name}>
        <span>{label}{required && <span className="required">*</span>}</span>
      </Label>
      
      <DropZone
        isDragActive={dragActive}
        onClick={openFileDialog}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <UploadIcon>
          <FaUpload />
        </UploadIcon>
        <UploadText>
          <p>Arrastra y suelta archivos aquí, o</p>
          <span className="browse">Buscar en dispositivo</span>
          {helperText && <p>{helperText}</p>}
        </UploadText>
        <FileInput
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          onBlur={onBlur}
        />
      </DropZone>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {value && value.length > 0 && (
        <FilePreviewContainer>
          {value.map((file, index) => (
            <FilePreview key={index}>
              <div className="file-info">
                <span className="file-icon">{getFileIcon(file.name)}</span>
                <span className="file-name">{file.name}</span>
                <span className="file-size">({formatFileSize(file.size)})</span>
              </div>
              <button
                type="button"
                className="remove-button"
                onClick={() => handleRemoveFile(index)}
                aria-label="Eliminar archivo"
              >
                <FaTimes />
              </button>
            </FilePreview>
          ))}
          
          {showUploadButton && onUpload && (
            <ButtonGroup>
              <UploadButton
                type="button"
                onClick={handleUpload}
                disabled={isUploading || value.length === 0}
              >
                <FaCloudUploadAlt />
                {isUploading ? 'Subiendo...' : 'Subir Archivos'}
              </UploadButton>
              
              <UploadButton
                type="button"
                onClick={handleClear}
                disabled={isUploading}
                style={{ backgroundColor: theme.colors.border, color: theme.colors.text }}
              >
                <FaTimes />
                Limpiar
              </UploadButton>
            </ButtonGroup>
          )}
        </FilePreviewContainer>
      )}
    </UploaderContainer>
  );
};

export default FileUploader;
