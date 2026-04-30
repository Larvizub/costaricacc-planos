import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase/firebaseConfig';
import { 
  FaArrowLeft, FaDownload, FaCheck, FaTimes, FaSpinner, FaClock, 
  FaListAlt, FaComments, FaFile, FaUsers, FaImage
} from 'react-icons/fa';
import { theme } from '../styles/GlobalStyles';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Alert from '../components/Alert';
import FileUploader from '../components/FileUploader';
import ApprovalFlow, { approvalGroups } from '../components/ApprovalFlow';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatDateTime } from '../utils/formatters';
import { updateRecord, uploadFile } from '../utils/firebaseHelpers';
import useAsync from '../hooks/useAsync';
import emailNotificationService from '../services/emailNotificationService';
import ImageViewer from '../components/ImageViewer';
import { NOTIFICATION_TYPES } from '../config/emailConfig';

// Estilos para el contenedor principal
const DetailContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

// Estilos para el encabezado
const HeaderBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.md};
  }
`;

const BackButton = styled(Button)`
  margin-right: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-right: 0;
  }
`;

const EventoTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0;
  flex: 1;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-top: ${theme.spacing.sm};
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  font-size: 0.9rem;
  font-weight: 500;
  margin-left: auto;
  gap: ${theme.spacing.xs};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-left: 0;
  }
  
  background-color: ${({ status }) => {
    switch (status) {
      case 'aprobado': return `${theme.colors.success}20`;
      case 'rechazado': return `${theme.colors.error}20`;
      case 'en_revision': return `${theme.colors.warning}20`;
      case 'pendiente': return `${theme.colors.info}20`;
      default: return `${theme.colors.textLight}20`;
    }
  }};
  
  color: ${({ status }) => {
    switch (status) {
      case 'aprobado': return theme.colors.success;
      case 'rechazado': return theme.colors.error;
      case 'en_revision': return theme.colors.warning;
      case 'pendiente': return theme.colors.info;
      default: return theme.colors.textLight;
    }
  }};
`;

// Estilos para secciones
const Section = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  margin-top: 0;
  margin-bottom: ${theme.spacing.md};
  padding-bottom: ${theme.spacing.xs};
  border-bottom: 1px solid ${theme.colors.border};
  color: ${theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${theme.spacing.lg};
`;

const InfoItem = styled.div`
  margin-bottom: ${theme.spacing.md};
  
  .label {
    font-size: 0.8rem;
    color: ${theme.colors.textLight};
    margin-bottom: ${theme.spacing.xs};
  }
  
  .value {
    font-size: 1rem;
    word-break: break-word;
  }
`;

const DocumentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const Document = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.card};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  transition: all ${theme.transitions.default};
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .document-info {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    flex: 1;
    
    .icon {
      color: ${theme.colors.primary};
      font-size: 1.5rem;
      min-width: 24px;
    }
    
    .content {
      flex: 1;
      
      .name {
        font-weight: 500;
        font-size: 1rem;
        margin-bottom: ${theme.spacing.xs};
        color: ${theme.colors.text};
      }
      
      .meta {
        font-size: 0.85rem;
        color: ${theme.colors.textLight};
        display: flex;
        flex-wrap: wrap;
        gap: ${theme.spacing.sm};
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: ${theme.spacing.xs};
        }
      }
    }
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.md};
    
    .document-info {
      width: 100%;
    }
  }
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const Comment = styled.div`
  background-color: ${({ isOwn }) => 
    isOwn ? `${theme.colors.primary}10` : theme.colors.card};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.md};
  
  .comment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: ${theme.spacing.sm};
    
    .author {
      font-weight: 500;
    }
    
    .date {
      font-size: 0.8rem;
      color: ${theme.colors.textLight};
    }
  }
  
  .comment-content {
    margin-bottom: ${theme.spacing.sm};
  }
`;

const CommentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
  
  textarea {
    width: 100%;
    min-height: 100px;
    padding: ${theme.spacing.md};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.borderRadius.medium};
    resize: vertical;
  }
  
  .submit-button {
    align-self: flex-end;
  }
`;

const CommentFormActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

const ImageUploadLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  cursor: pointer;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border: 1px dashed ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  color: ${theme.colors.textLight};
  font-size: 0.875rem;
  transition: all ${theme.transitions.default};
  user-select: none;

  &:hover {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
    background-color: ${theme.colors.primary}10;
  }
`;

const ImagePreviewGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
`;

const PreviewItem = styled.div`
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: ${theme.borderRadius.small};
  overflow: visible;

  img {
    width: 72px;
    height: 72px;
    object-fit: cover;
    border-radius: ${theme.borderRadius.small};
    border: 1px solid ${theme.colors.border};
    display: block;
  }

  button {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${theme.colors.error};
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6rem;
    padding: 0;
    line-height: 1;
  }
`;

const CommentImages = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.sm};
`;

const CommentThumb = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: ${theme.borderRadius.small};
  border: 1px solid ${theme.colors.border};
  cursor: pointer;
  transition: all ${theme.transitions.default};

  &:hover {
    opacity: 0.85;
    transform: scale(1.04);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  }
`;

const ApprovalActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
  justify-content: flex-end;
`;

// Obtener icono según el estado
const getStatusIcon = (status) => {
  switch (status) {
    case 'aprobado':
      return <FaCheck />;
    case 'rechazado':
      return <FaTimes />;
    case 'en_revision':
      return <FaClock />;
    case 'pendiente':
    default:
      return <FaListAlt />;
  }
};

// Formatear estado
const formatEstado = (estado) => {
  switch (estado) {
    case 'aprobado': return 'Aprobado';
    case 'rechazado': return 'Rechazado';
    case 'en_revision': return 'En revisión';
    case 'pendiente': return 'Pendiente';
    default: return estado || 'Pendiente';
  }
};

// Verificar si el usuario pertenece a un grupo específico según sus roles
const isUserInGroup = (userRoles, group) => {
  if (!userRoles || !Array.isArray(userRoles) || userRoles.length === 0) return false;
  if (!group || !group.roles || !Array.isArray(group.roles)) return false;
  
  return userRoles.some(role => group.roles.includes(role));
};

// Obtener los grupos a los que pertenece el usuario
const getUserApprovalGroups = (userRoles) => {
  if (!userRoles || !Array.isArray(userRoles) || userRoles.length === 0) return [];
  
  return Object.values(approvalGroups)
    .filter(group => isUserInGroup(userRoles, group))
    .sort((a, b) => a.index - b.index);
};

// Determinar si un grupo es requerido para una solicitud
const isGroupRequired = (solicitud, groupId) => {
  const group = approvalGroups[groupId];
  if (!group) return false;
  
  // Áreas y Sostenibilidad siempre es requerido (es el primer grupo en el flujo)
  if (groupId === 'areas_sostenibilidad') return true;
  
  // Si el grupo no tiene requisito condicional, siempre es requerido
  if (!group.conditionalService) return true;
  
  // Verificar si el servicio asociado está contratado
  return solicitud.serviciosContratados && 
         Array.isArray(solicitud.serviciosContratados) && 
         solicitud.serviciosContratados.includes(group.conditionalService);
};

// Obtener el grupo actual que debe aprobar
const getCurrentApprovalGroup = (solicitud) => {
  if (!solicitud || !solicitud.approvals) return null;
  
  // Filtrar y ordenar los grupos requeridos para esta solicitud
  const requiredGroups = Object.values(approvalGroups)
    .filter(group => isGroupRequired(solicitud, group.id))
    .sort((a, b) => a.index - b.index);
  
  // Encontrar el primer grupo que no esté aprobado
  for (const group of requiredGroups) {
    const groupApproval = solicitud.approvals[group.id];
    if (!groupApproval || groupApproval.status === 'pendiente' || groupApproval.status === 'en_revision') {
      return group;
    }
  }
  
  return null; // Todos los grupos han aprobado o rechazado
};

// Obtener el siguiente grupo en la secuencia de aprobación
const getNextApprovalGroup = (solicitud, currentGroupId) => {
  if (!solicitud || !currentGroupId) return null;
  
  // Filtrar y ordenar los grupos requeridos para esta solicitud
  const requiredGroups = Object.values(approvalGroups)
    .filter(group => isGroupRequired(solicitud, group.id))
    .sort((a, b) => a.index - b.index);
  
  // Encontrar el índice del grupo actual
  const currentIndex = requiredGroups.findIndex(group => group.id === currentGroupId);
  
  // Si se encuentra y hay un grupo siguiente, devolverlo
  if (currentIndex >= 0 && currentIndex < requiredGroups.length - 1) {
    return requiredGroups[currentIndex + 1];
  }
  
  return null; // No hay más grupos en la secuencia
};

// Inicializar el flujo de aprobación para una solicitud
const initializeApprovalFlow = (solicitud) => {
  if (!solicitud) return null;
  
  // Crear objeto de aprobaciones iniciales
  const approvals = {};
  
  // Filtrar y ordenar los grupos requeridos para esta solicitud
  const requiredGroups = Object.values(approvalGroups)
    .filter(group => isGroupRequired(solicitud, group.id))
    .sort((a, b) => a.index - b.index);
  
  // Asegurar que areas_sostenibilidad esté incluido siempre
  const hasAreasSostenibilidad = requiredGroups.some(group => group.id === 'areas_sostenibilidad');
  if (!hasAreasSostenibilidad && approvalGroups['areas_sostenibilidad']) {
    console.log('Añadiendo Áreas y Sostenibilidad al flujo de aprobación ya que no estaba incluido');
    requiredGroups.unshift(approvalGroups['areas_sostenibilidad']);
  }
  
  // Para cada grupo requerido, inicializar su estado
  requiredGroups.forEach(group => {
    approvals[group.id] = {
      status: group.id === 'areas_sostenibilidad' ? 'en_revision' : 'pendiente'
    };
  });
  
  // Log para verificar que Áreas y Sostenibilidad siempre está incluido
  console.log("Grupos inicializados:", requiredGroups.map(g => g.name));
  console.log("¿Áreas y Sostenibilidad incluido?", requiredGroups.some(g => g.id === 'areas_sostenibilidad'));
  
  return approvals;
};

// Verificar si el usuario puede subir planos
const canUploadPlanos = (userRoles, solicitud) => {
  // Solo usuarios de "Áreas y Sostenibilidad" pueden subir planos
  const areasSostenibilidadGroup = approvalGroups.areas_sostenibilidad;
  
  // Verificar si el grupo es requerido para esta solicitud
  if (!isGroupRequired(solicitud, areasSostenibilidadGroup.id)) return false;
  
  // Verificar si el usuario pertenece al grupo
  const isAreasUser = isUserInGroup(userRoles, areasSostenibilidadGroup);
  
  if (!isAreasUser) return false;
  
  // MODIFICADO: Los usuarios de "Áreas y Sostenibilidad" pueden subir planos en cualquier momento,
  // sin importar el estado de la solicitud (pendiente, aprobada, rechazada, etc.)
  // Esto permite gestionar planos incluso después de que las solicitudes estén cerradas
  return true;
};

// Obtener el nombre textual de la prioridad
const getPrioridadNombre = (prioridad) => {
  switch (Number(prioridad)) {
    case 1: return 'Baja';
    case 2: return 'Media';
    case 3: return 'Alta';
    case 4: return 'Urgente';
    default: return 'Media';
  }
};

// Obtener color según la prioridad
const getPrioridadColor = (prioridad) => {
  switch (Number(prioridad)) {
    case 1: return '#28a745'; // Verde para baja
    case 2: return '#17a2b8'; // Azul para media
    case 3: return '#ffc107'; // Amarillo para alta
    case 4: return '#dc3545'; // Rojo para urgente
    default: return '#17a2b8'; // Azul por defecto
  }
};

// Página de detalle de solicitud
const DetalleSolicitudPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userRoles } = useAuth();
  const { loading, error, execute } = useAsync();
  
  // Estados
  const [solicitud, setSolicitud] = useState(null);
  const [comentario, setComentario] = useState('');
  const [archivos, setArchivos] = useState([]);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [userApprovalGroups, setUserApprovalGroups] = useState([]);

  // Estados para imágenes en comentarios
  const [comentarioFiles, setComentarioFiles] = useState([]);
  const [comentarioPreviews, setComentarioPreviews] = useState([]);
  const [imageViewer, setImageViewer] = useState(null); // { images, initialIndex }
  const imageInputRef = useRef(null);

  // Limpiar object URLs al desmontar
  useEffect(() => {
    return () => {
      comentarioPreviews.forEach((p) => URL.revokeObjectURL(p.blobUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCommentImageSelect = useCallback((e) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;
    setComentarioFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => ({ blobUrl: URL.createObjectURL(f), name: f.name }));
    setComentarioPreviews((prev) => [...prev, ...newPreviews]);
    // resetear el input para permitir volver a seleccionar el mismo archivo
    e.target.value = '';
  }, []);

  const handleRemovePreview = useCallback((index) => {
    setComentarioPreviews((prev) => {
      URL.revokeObjectURL(prev[index].blobUrl);
      return prev.filter((_, i) => i !== index);
    });
    setComentarioFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);
  
  // Cargar datos de la solicitud
  useEffect(() => {
    const fetchSolicitud = async () => {
      try {
        const solicitudRef = ref(db, `solicitudes/${id}`);
        
        onValue(solicitudRef, (snapshot) => {
          if (snapshot.exists()) {
            const solicitudData = {
              id: snapshot.key,
              ...snapshot.val()
            };
            
            // Inicializar flujo de aprobación si no existe
            if (!solicitudData.approvals) {
              solicitudData.approvals = initializeApprovalFlow(solicitudData);
              
              // Guardar inicialización en la base de datos
              updateRecord('solicitudes', id, { 
                approvals: solicitudData.approvals,
                status: 'en_revision'
              });
              
              // Enviar notificación al usuario solicitante cuando se inicia el flujo de aprobación
              (async () => {
                try {
                  const solicitudParaNotificacion = {
                    ...solicitudData,
                    requestId: id
                  };
                  
                  await emailNotificationService.notifyApplicantApprovalFlowStarted(solicitudParaNotificacion);
                  console.log('✅ Notificación de inicio de flujo enviada al solicitante');
                } catch (notificationError) {
                  console.error('❌ Error enviando notificación de inicio de flujo al solicitante:', notificationError);
                }
              })();
            }
            
            setSolicitud(solicitudData);
          } else {
            toast.error('La solicitud no existe');
            navigate('/solicitudes');
          }
        });
      } catch (err) {
        console.error('Error al cargar la solicitud:', err);
        toast.error('Error al cargar los datos de la solicitud');
      }
    };
    
    execute(fetchSolicitud);
  }, [id, navigate, execute]);
  
  // Determinar grupos de aprobación del usuario actual
  useEffect(() => {
    if (userRoles && userRoles.length > 0) {
      const groups = getUserApprovalGroups(userRoles);
      setUserApprovalGroups(groups);
    } else {
      setUserApprovalGroups([]);
    }
  }, [userRoles]);
  
  // Determinar si el usuario puede aprobar/rechazar
  const canApprove = () => {
    if (!solicitud || !userRoles || userRoles.length === 0 || userApprovalGroups.length === 0) {
      return false;
    }
    
    // Obtener el grupo actual que debe aprobar
    const currentGroup = getCurrentApprovalGroup(solicitud);
    if (!currentGroup) return false;
    
    // Verificar si el usuario pertenece al grupo actual de aprobación
    const isUserInCurrentGroup = userApprovalGroups.some(group => group.id === currentGroup.id);
    
    // Verificar si el grupo está "en_revision"
    const groupStatus = solicitud.approvals[currentGroup.id]?.status;
    
    return isUserInCurrentGroup && groupStatus === 'en_revision';
  };
  
  // Manejar aprobación de solicitud
  const handleApprove = async () => {
    try {
      setApprovalLoading(true);
      
      // Obtener el grupo actual que debe aprobar
      const currentGroup = getCurrentApprovalGroup(solicitud);
      if (!currentGroup) {
        toast.error('No se pudo determinar el grupo actual de aprobación');
        return;
      }
      
      console.log(`Procesando aprobación para el grupo: ${currentGroup.name} (${currentGroup.id})`);
      
      // Crear copia de las aprobaciones existentes
      const updatedApprovals = { ...solicitud.approvals };
      
      // Marcar este grupo como aprobado
      updatedApprovals[currentGroup.id] = {
        status: 'aprobado',
        approved_by: currentUser.uid,
        approved_by_name: currentUser.displayName || currentUser.email,
        approved_at: new Date().toISOString()
      };
      
      // Determinar el siguiente grupo en la secuencia
      let nextGroup;
      
      // Si hay un rechazo previo y estamos en Áreas y Sostenibilidad, ir directamente al grupo que rechazó
      if (currentGroup.id === 'areas_sostenibilidad' && solicitud.last_rejection) {
        const rejectedGroupId = solicitud.last_rejection.by_group;
        nextGroup = approvalGroups[rejectedGroupId];
        console.log(`Re-enviando a grupo que rechazó: ${nextGroup?.name} (${rejectedGroupId})`);
      } else {
        // Flujo normal: siguiente grupo en secuencia
        nextGroup = getNextApprovalGroup(solicitud, currentGroup.id);
      }
      
      let newStatus = solicitud.status;
      
      if (nextGroup) {
        console.log(`Siguiente grupo: ${nextGroup.name} (${nextGroup.id})`);
        
        // Si hay siguiente grupo, ponerlo en revisión
        updatedApprovals[nextGroup.id] = {
          ...updatedApprovals[nextGroup.id],
          status: 'en_revision'
        };
        
        newStatus = 'en_revision';
      } else {
        console.log('No hay más grupos en la secuencia de aprobación. Solicitud completamente aprobada.');
        // Si no hay siguiente grupo, la solicitud está completamente aprobada
        newStatus = 'aprobado';
      }
      
      // Preparar datos de actualización
      const updateData = {
        approvals: updatedApprovals,
        status: newStatus,
      };
      
      // Si es una re-aprobación después de rechazo, limpiar la información del rechazo
      if (currentGroup.id === 'areas_sostenibilidad' && solicitud.last_rejection) {
        updateData.last_rejection = null; // Limpiar el rechazo previo
      }
      
      // Si no hay grupo siguiente, incluir los datos de aprobación final
      if (!nextGroup) {
        updateData.aprobado_por = currentUser.uid;
        updateData.aprobado_por_nombre = currentUser.displayName || currentUser.email;
        updateData.fecha_aprobacion = new Date().toISOString();
      }
      
      console.log('Enviando actualización de aprobación:', updateData);
      
      // Actualizar en Firebase
      await updateRecord('solicitudes', id, updateData);
      
      // Enviar notificación al usuario solicitante si la solicitud está completamente aprobada
      if (!nextGroup && newStatus === 'aprobado') {
        try {
          const solicitudParaNotificacion = {
            ...solicitud,
            ...updateData,
            requestId: id
          };
          
          await emailNotificationService.notifyApplicantFinalApproval(solicitudParaNotificacion);
          console.log('✅ Notificación de aprobación final enviada al solicitante');
        } catch (notificationError) {
          console.error('❌ Error enviando notificación de aprobación final al solicitante:', notificationError);
        }
      }

      // Notificar al siguiente grupo (departamento) que la solicitud llegó a su etapa de aprobación
      if (nextGroup) {
        try {
          await emailNotificationService.sendNotificationToAreas({
            requestId: id,
            projectName: solicitud.nombreEvento || solicitud.nombreProyecto || 'Evento sin nombre',
            eventName: solicitud.nombreEvento || solicitud.nombreProyecto,
            applicantName: solicitud.createdByName || solicitud.nombreCompleto || 'Solicitante',
            applicantEmail: solicitud.createdByEmail || solicitud.email || '',
            jobPosition: solicitud.jobPosition || solicitud.puesto || '',
            status: 'in_review',
            message: `La solicitud ha llegado a su etapa de aprobación para el área ${nextGroup.name}.`,
          }, NOTIFICATION_TYPES.STATUS_UPDATE, [nextGroup.id]);
        } catch (err) {
          // Silenciar errores de notificación para no interrumpir el flujo principal
        }
      }
      
      // Mensaje personalizado según el contexto
      let successMessage;
      if (currentGroup.id === 'areas_sostenibilidad' && solicitud.last_rejection) {
        successMessage = `Documentos re-aprobados por ${currentGroup.name}. Enviado nuevamente a ${nextGroup?.name || 'finalización'}.`;
      } else {
        successMessage = nextGroup 
          ? `Aprobado por ${currentGroup.name}. Ahora en revisión por ${nextGroup.name}.` 
          : 'Solicitud completamente aprobada';
      }
      
      toast.success(successMessage);
    } catch (err) {
      console.error('Error al aprobar solicitud:', err);
      toast.error('Error al aprobar la solicitud');
    } finally {
      setApprovalLoading(false);
    }
  };
  
  // Manejar rechazo de solicitud
  const handleReject = async () => {
    try {
      setApprovalLoading(true);
      
      // Obtener el grupo actual que debe aprobar
      const currentGroup = getCurrentApprovalGroup(solicitud);
      if (!currentGroup) {
        toast.error('No se pudo determinar el grupo actual de aprobación');
        return;
      }
      
      // Crear copia de las aprobaciones existentes
      const updatedApprovals = { ...solicitud.approvals };
      
      // Marcar este grupo como rechazado
      updatedApprovals[currentGroup.id] = {
        status: 'rechazado',
        rejected_by: currentUser.uid,
        rejected_by_name: currentUser.displayName || currentUser.email,
        rejected_at: new Date().toISOString(),
        rejection_reason: `Rechazado por ${currentGroup.name}. Requiere revisión de documentos.`
      };
      
      // Devolver el flujo a Áreas y Sostenibilidad para que puedan resubir documentos
      const areasSostenibilidadGroup = approvalGroups.areas_sostenibilidad;
      if (areasSostenibilidadGroup) {
        updatedApprovals[areasSostenibilidadGroup.id] = {
          status: 'en_revision',
          returned_from: currentGroup.id,
          returned_from_name: currentGroup.name,
          returned_at: new Date().toISOString(),
          needs_document_review: true
        };
      }
      
      // Preparar datos de actualización
      const updateData = {
        approvals: updatedApprovals,
        status: 'en_revision', // Devolver a estado en revisión
        last_rejection: {
          by_group: currentGroup.id,
          by_group_name: currentGroup.name,
          by_user: currentUser.uid,
          by_user_name: currentUser.displayName || currentUser.email,
          date: new Date().toISOString(),
          reason: `Rechazado por ${currentGroup.name}. Requiere revisión de documentos.`
        }
      };
      
      console.log('Enviando actualización de rechazo:', updateData);
      
      // Actualizar en Firebase
      await updateRecord('solicitudes', id, updateData);
      
      // Notificar a Áreas y Sostenibilidad que la solicitud fue devuelta para revisión
      if (areasSostenibilidadGroup) {
        try {
          await emailNotificationService.sendNotificationToAreas({
            requestId: id,
            projectName: solicitud.nombreEvento || solicitud.nombreProyecto || 'Evento sin nombre',
            eventName: solicitud.nombreEvento || solicitud.nombreProyecto,
            applicantName: solicitud.createdByName || solicitud.nombreCompleto || 'Solicitante',
            applicantEmail: solicitud.createdByEmail || solicitud.email || '',
            jobPosition: solicitud.jobPosition || solicitud.puesto || '',
            status: 'in_review',
            message: `La solicitud fue devuelta por ${currentGroup.name}. Se requiere revisión de documentos en Áreas y Sostenibilidad.`
          }, NOTIFICATION_TYPES.STATUS_UPDATE, [areasSostenibilidadGroup.id]);
        } catch (err) {
          // Silenciar errores de notificación
        }
      }
      toast.success(`Solicitud rechazada por ${currentGroup.name}. Devuelta a Áreas y Sostenibilidad para revisión de documentos.`);
    } catch (err) {
      console.error('Error al rechazar solicitud:', err);
      toast.error('Error al rechazar la solicitud');
    } finally {
      setApprovalLoading(false);
    }
  };
  
  // Manejar comentarios
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!comentario.trim() && comentarioFiles.length === 0) return;
    
    try {
      // Subir imágenes adjuntas al comentario
      let uploadedImageUrls = [];
      if (comentarioFiles.length > 0) {
        const uploadPromises = comentarioFiles.map(async (file) => {
          const path = `solicitudes/${id}/comentarios/${Date.now()}_${file.name}`;
          return await uploadFile(path, file);
        });
        uploadedImageUrls = await Promise.all(uploadPromises);
      }

      const newComment = {
        autor: currentUser.uid,
        autor_nombre: currentUser.displayName || currentUser.email,
        contenido: comentario,
        fecha: new Date().toISOString(),
        ...(uploadedImageUrls.length > 0 && { imagenes: uploadedImageUrls })
      };
      
      const comentariosActuales = solicitud.comentarios || [];
      
      // Actualizar en Firebase
      await updateRecord('solicitudes', id, {
        comentarios: [...comentariosActuales, newComment]
      });
      
      // Enviar notificación por correo de nuevo comentario
      try {
        // Determinar los grupos requeridos para esta solicitud
        const requiredGroups = solicitud.serviciosContratados 
          ? Object.keys(approvalGroups).filter(groupKey => {
              const group = approvalGroups[groupKey];
              return groupKey === 'areas_sostenibilidad' || 
                     !group.conditionalService || 
                     solicitud.serviciosContratados.includes(group.conditionalService);
            })
          : Object.keys(approvalGroups);
          
        // Asegurar que pasamos claves (strings)
        const normalizedRequiredGroups = Array.isArray(requiredGroups) && requiredGroups.length > 0 && typeof requiredGroups[0] === 'string'
          ? requiredGroups
          : (Array.isArray(requiredGroups) ? requiredGroups.map(g => g.id).filter(Boolean) : []);

        await emailNotificationService.notifyNewComment({
          requestId: id,
          projectName: solicitud.nombreEvento || 'Proyecto sin nombre',
          applicantName: solicitud.createdByName || 'Solicitante',
          applicantEmail: solicitud.createdByEmail || '',
          status: solicitud.status || 'pending',
          approvalAreas: normalizedRequiredGroups
        }, {
          author: currentUser.displayName || currentUser.email,
          date: new Date().toLocaleString(),
          text: comentario,
          images: uploadedImageUrls
        });
        console.log('Notificación de nuevo comentario enviada exitosamente');
      } catch (emailError) {
        console.error('Error al enviar notificación de comentario:', emailError);
        // No detener el flujo si hay error en las notificaciones
      }
      
      setComentario('');
      // Limpiar imágenes seleccionadas
      comentarioPreviews.forEach((p) => URL.revokeObjectURL(p.blobUrl));
      setComentarioFiles([]);
      setComentarioPreviews([]);
      toast.success('Comentario agregado');
    } catch (err) {
      console.error('Error al agregar comentario:', err);
      toast.error('Error al agregar el comentario');
    }
  };

  // Manejar carga de archivos
  const handleFileUpload = async (files) => {
    if (files.length === 0) return;
    
    // Verificar si el usuario puede subir planos
    if (!canUploadPlanos(userRoles, solicitud)) {
      toast.error('No tienes permisos para subir planos. Solo el equipo de Áreas y Sostenibilidad puede hacerlo.');
      return;
    }
    
    try {
      const uploadPromises = files.map(async (file) => {
        const filePath = `solicitudes/${id}/${file.name}`;
        const fileUrl = await uploadFile(filePath, file);
        
        return {
          nombre: file.name,
          url: fileUrl,
          tipo: file.type,
          tamaño: file.size,
          subido_por: currentUser.uid,
          subido_por_nombre: currentUser.displayName || currentUser.email,
          fecha_subida: new Date().toISOString()
        };
      });
      
      const uploadedFiles = await Promise.all(uploadPromises);
      const planosActuales = solicitud.planos || [];
      const nuevosPlanos = [...planosActuales, ...uploadedFiles];
      
      // Preparar datos de actualización
      const updateData = {
        planos: nuevosPlanos
      };
      
      // Si hay un rechazo previo, marcar que los documentos han sido revisados
      if (solicitud.last_rejection && solicitud.approvals?.areas_sostenibilidad?.needs_document_review) {
        updateData.approvals = {
          ...solicitud.approvals,
          areas_sostenibilidad: {
            ...solicitud.approvals.areas_sostenibilidad,
            needs_document_review: false,
            documents_revised_at: new Date().toISOString(),
            revised_by: currentUser.uid,
            revised_by_name: currentUser.displayName || currentUser.email
          }
        };
      }
      
      // Actualizar en Firebase
      await updateRecord('solicitudes', id, updateData);
      
      // Actualizar el estado local para mostrar los archivos inmediatamente
      setSolicitud(prev => ({
        ...prev,
        planos: nuevosPlanos,
        approvals: updateData.approvals || prev.approvals
      }));
      
      // Enviar notificaciones a otros departamentos para informar sobre los nuevos planos
      try {
        await notifyDepartmentsAboutPlanos(solicitud, uploadedFiles);
      } catch (notificationError) {
        console.error('Error al enviar notificaciones:', notificationError);
        // No detener el flujo si hay error en las notificaciones
      }
      
      setArchivos([]);
      
      // Mensaje personalizado según el contexto
      const message = solicitud.last_rejection 
        ? `${uploadedFiles.length} archivo(s) subido(s) correctamente. Documentos revisados después del rechazo.`
        : `${uploadedFiles.length} archivo(s) subido(s) correctamente. Se ha notificado a los departamentos correspondientes.`;
      
      toast.success(message);
    } catch (err) {
      console.error('Error al subir archivos:', err);
      toast.error('Error al subir los archivos');
    }
  };

  // Función para notificar a otros departamentos sobre nuevos planos
  const notifyDepartmentsAboutPlanos = async (solicitud, archivos) => {
    try {
      // Determinar qué grupos necesitan ser notificados (todos los grupos requeridos excepto áreas_sostenibilidad)
      const requiredGroups = Object.values(approvalGroups)
        .filter(group => isGroupRequired(solicitud, group.id))
        .filter(group => group.id !== 'areas_sostenibilidad');
      
      // Crear el mensaje de notificación
      const archivosNombres = archivos.map(archivo => archivo.nombre).join(', ');
      const message = `Nuevos planos disponibles para la solicitud "${solicitud.nombreEvento}": ${archivosNombres}`;
      
      // Enviar notificación a cada grupo requerido
      const notificationPromises = requiredGroups.map(async (group) => {
        try {
          await emailNotificationService.sendNotification(
            group.emails,
            'Nuevos planos disponibles para revisión',
            message,
            {
              solicitudId: solicitud.id,
              nombreEvento: solicitud.nombreEvento,
              archivos: archivos.map(archivo => ({
                nombre: archivo.nombre,
                url: archivo.url
              })),
              urlDetalle: `${window.location.origin}/solicitudes/${solicitud.id}`,
              applicantEmail: solicitud.email || solicitud.applicantEmail || solicitud.createdByEmail || ''
            }
          );
          
          console.log(`Notificación enviada a ${group.name}`);
        } catch (error) {
          console.error(`Error al enviar notificación a ${group.name}:`, error);
        }
      });
      
      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Error general en notificaciones:', error);
    }
  };
  
  // Función para eliminar un archivo existente
  const handleDeleteFile = async (fileIndex) => {
    try {
      const fileToDelete = solicitud.planos[fileIndex];
      if (!fileToDelete) return;
      
      // Confirmar eliminación
      if (!window.confirm(`¿Está seguro de que desea eliminar el archivo "${fileToDelete.nombre}"?`)) {
        return;
      }
      
      // Crear copia de los planos actuales sin el archivo a eliminar
      const updatedPlanos = [...solicitud.planos];
      updatedPlanos.splice(fileIndex, 1);
      
      // Actualizar en Firebase
      await updateRecord('solicitudes', id, {
        planos: updatedPlanos
      });
      
      // Actualizar el estado local
      setSolicitud(prev => ({
        ...prev,
        planos: updatedPlanos
      }));
      
      toast.success(`Archivo "${fileToDelete.nombre}" eliminado correctamente`);
    } catch (err) {
      console.error('Error al eliminar archivo:', err);
      toast.error('Error al eliminar el archivo');
    }
  };

  // Verificar si el usuario puede eliminar archivos
  const canDeleteFiles = (userRoles, solicitud) => {
    // Solo Áreas y Sostenibilidad puede eliminar archivos
    const areasSostenibilidadGroup = approvalGroups.areas_sostenibilidad;
    const isAreasUser = isUserInGroup(userRoles, areasSostenibilidadGroup);
    
    // MODIFICADO: Los usuarios de "Áreas y Sostenibilidad" pueden eliminar archivos en cualquier momento,
    // sin importar el estado de la solicitud (pendiente, aprobada, rechazada, etc.)
    // Esto permite gestionar planos incluso después de que las solicitudes estén cerradas
    return isAreasUser;
  };

  // Mostrar indicador de carga
  if (loading || !solicitud) {
    return (
      <Layout title="Detalle de Solicitud">
        <DetailContainer>
          <Card elevation="small">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              padding: theme.spacing.xl 
            }}>
              <FaSpinner 
                style={{ 
                  fontSize: '2rem', 
                  animation: 'spin 1s linear infinite',
                  color: theme.colors.primary
                }} 
              />
            </div>
          </Card>
        </DetailContainer>
      </Layout>
    );
  }
  
  return (
    <Layout title="Detalle de Solicitud">
      <DetailContainer>
        {error && (
          <Alert
            type="error"
            title="Error al cargar datos"
            description="No se pudieron cargar los datos de la solicitud."
            closable
          />
        )}
        
        <HeaderBar>
          <BackButton 
            variant="text" 
            onClick={() => navigate('/solicitudes')}
          >
            <FaArrowLeft /> Volver
          </BackButton>
          
          <EventoTitle>{solicitud.nombreEvento}</EventoTitle>
          
          <StatusBadge status={solicitud.status}>
            {getStatusIcon(solicitud.status)}
            {formatEstado(solicitud.status)}
          </StatusBadge>
        </HeaderBar>

        {/* Alerta contextual para rechazos */}
        {solicitud.last_rejection && solicitud.approvals?.areas_sostenibilidad?.needs_document_review && (
          <Alert
            type="warning"
            title={`Solicitud rechazada por ${solicitud.last_rejection?.by_group_name || 'N/A'}`}
            description={`Esta solicitud fue rechazada el ${formatDateTime(solicitud.last_rejection?.date || solicitud.last_rejection?.fecha || '')} por ${solicitud.last_rejection?.by_user_name || 'N/A'}. Motivo: ${solicitud.last_rejection?.reason || 'Sin motivo'}. Puede eliminar documentos existentes y subir nuevos antes de re-aprobar.`}
          />
        )}

        <Section>
          <Card>
            <Card.Header>
              <Card.Title>Información de Solicitud</Card.Title>
            </Card.Header>
            <Card.Content>
              <InfoGrid>
                <InfoItem>
                  <div className="label">Nombre del evento</div>
                  <div className="value">{solicitud.nombreEvento}</div>
                </InfoItem>
                <InfoItem>
                  <div className="label">Salón del evento</div>
                  <div className="value">{solicitud.salonEvento}</div>
                </InfoItem>
                <InfoItem>
                  <div className="label">Fecha del evento</div>
                  <div className="value">{formatDate(solicitud.fechaEvento)}</div>
                </InfoItem>
                <InfoItem>
                  <div className="label">Cantidad de participantes</div>
                  <div className="value">{solicitud.cantidadParticipantes}</div>
                </InfoItem>
                <InfoItem>
                  <div className="label">Tipo de montaje</div>
                  <div className="value">{solicitud.tipoMontaje}</div>
                </InfoItem>
                <InfoItem>
                  <div className="label">Orientación del montaje</div>
                  <div className="value">{solicitud.orientacionMontaje}</div>
                </InfoItem>
                <InfoItem>
                  <div className="label">Fecha de solicitud</div>
                  <div className="value">{formatDateTime(solicitud.fechaSolicitud)}</div>
                </InfoItem>
                <InfoItem>
                  <div className="label">Estado</div>
                  <div className="value">{formatEstado(solicitud.status)}</div>
                </InfoItem>
                <InfoItem>
                  <div className="label">Prioridad</div>
                  <div className="value" style={{
                    color: getPrioridadColor(solicitud.prioridad),
                    fontWeight: 'bold'
                  }}>
                    {getPrioridadNombre(solicitud.prioridad) || 'Media'}
                  </div>
                </InfoItem>
                {/* Nuevo campo: Usuario solicitante */}
                <InfoItem>
                  <div className="label">Usuario solicitante</div>
                  <div className="value">{solicitud.createdByName || solicitud.createdByEmail}</div>
                </InfoItem>
              </InfoGrid>
              
              <InfoItem>
                <div className="label">Servicios contratados</div>
                <div className="value">
                  {solicitud.serviciosContratados && solicitud.serviciosContratados.length > 0
                    ? solicitud.serviciosContratados.map((servicio, index) => (
                        <span key={index} style={{marginRight: theme.spacing.sm, display: 'inline-block'}}>
                          • {servicio.charAt(0).toUpperCase() + servicio.slice(1)}
                        </span>
                      ))
                    : 'Ninguno'}
                </div>
              </InfoItem>
              <InfoItem>
                <div className="label">Especificaciones adicionales</div>
                <div className="value">{solicitud.especificacionesAdicionales || 'Ninguna'}</div>
              </InfoItem>
            </Card.Content>
          </Card>
        </Section>
        
        <Section>
          <SectionTitle>
            <FaFile /> Archivos adjuntos
          </SectionTitle>
          <DocumentsList>
            {Array.isArray(solicitud.archivos) && solicitud.archivos.length > 0 ? (
              solicitud.archivos.map((archivo, idx) => (
                <Document key={idx}>
                  <div className="document-info">
                    <span className="icon"><FaFile /></span>
                    <div className="content">
                      <div className="name">{archivo.name}</div>
                      <div className="meta">
                        <span className="meta-item">{archivo.type}</span>
                        <span className="meta-item">{(archivo.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={archivo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: theme.colors.primary, fontWeight: 500 }}
                  >
                    <FaDownload style={{ marginRight: 4 }} /> Descargar
                  </a>
                </Document>
              ))
            ) : (
              <span style={{ color: theme.colors.textLight }}>No hay archivos adjuntos</span>
            )}
          </DocumentsList>
        </Section>

        <Section>
          <SectionTitle>
            <FaDownload /> Planos y Documentos
          </SectionTitle>
          <Card>
            <Card.Content>
              {/* Alerta de rechazo que requiere revisión de documentos */}
              {solicitud.last_rejection && solicitud.approvals?.areas_sostenibilidad?.needs_document_review && (
                <Alert
                  type="warning"
                  title="Solicitud rechazada - Requiere revisión de documentos"
                  description={`${solicitud.last_rejection?.reason || 'Sin motivo'} 
                    Rechazado el ${formatDateTime(solicitud.last_rejection?.date || solicitud.last_rejection?.fecha || '')} por ${solicitud.last_rejection?.by_user_name || 'N/A'}.
                    ${isUserInGroup(userRoles, approvalGroups.areas_sostenibilidad) ? 'Puede eliminar archivos existentes y subir nuevos documentos.' : 'Esperando revisión de Áreas y Sostenibilidad.'}`}
                  style={{ marginBottom: theme.spacing.md }}
                />
              )}
              
              {solicitud.planos && solicitud.planos.length > 0 ? (
                <DocumentsList>
                  {solicitud.planos.map((plano, index) => (
                    <Document key={index}>
                      <div className="document-info">
                        <div className="icon">
                          <FaFile />
                        </div>
                        <div className="content">
                          <div className="name">{plano.nombre}</div>
                          <div className="meta">
                            <div className="meta-item">
                              📅 {formatDateTime(plano.fecha_subida)}
                            </div>
                            <div className="meta-item">
                              👤 {plano.subido_por_nombre || 'Usuario desconocido'}
                            </div>
                            <div className="meta-item">
                              📁 {(plano.tamaño / (1024 * 1024)).toFixed(2)} MB
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                        <Button
                          variant="outline"
                          size="small"
                          as="a"
                          href={plano.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaDownload /> Descargar
                        </Button>
                        {canDeleteFiles(userRoles, solicitud) && (
                          <Button
                            variant="error"
                            size="small"
                            onClick={() => handleDeleteFile(index)}
                          >
                            <FaTimes /> Eliminar
                          </Button>
                        )}
                      </div>
                    </Document>
                  ))}
                </DocumentsList>
              ) : (
                <p>No hay planos o documentos adjuntos</p>
              )}
              
              {canUploadPlanos(userRoles, solicitud) ? (
                <FileUploader
                  label="Subir nuevos documentos"
                  name="files"
                  accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png"
                  multiple
                  maxFiles={5}
                  maxSize={20} // 20MB
                  helperText="Archivos permitidos: PDF, DWG, DXF, JPG, PNG (Máx 20MB)"
                  value={archivos}
                  onChange={(e) => setArchivos(e.target.value)}
                  onUpload={handleFileUpload}
                  showUploadButton={true}
                />
              ) : (
                solicitud.planos && solicitud.planos.length === 0 &&
                <Alert
                  type="info"
                  title="Subida de planos restringida"
                  description="Solo el equipo de Áreas y Sostenibilidad puede subir planos para esta solicitud."
                />
              )}
            </Card.Content>
          </Card>
        </Section>
        
        <Section>
          <SectionTitle>
            <FaComments /> Comentarios
          </SectionTitle>
          <Card>
            <Card.Content>
              {solicitud.comentarios && solicitud.comentarios.length > 0 ? (
                <CommentsList>
                  {solicitud.comentarios.map((comentario, index) => (
                    <Comment 
                      key={index}
                      isOwn={comentario.autor === currentUser.uid}
                    >
                      <div className="comment-header">
                        <div className="author">{comentario.autor_nombre}</div>
                        <div className="date">{formatDateTime(comentario.fecha)}</div>
                      </div>
                      {comentario.contenido && (
                        <div className="comment-content">{comentario.contenido}</div>
                      )}
                      {comentario.imagenes && comentario.imagenes.length > 0 && (
                        <CommentImages>
                          {comentario.imagenes.map((url, imgIdx) => (
                            <CommentThumb
                              key={imgIdx}
                              src={url}
                              alt={`Imagen ${imgIdx + 1}`}
                              onClick={() => setImageViewer({ images: comentario.imagenes, initialIndex: imgIdx })}
                              title="Clic para ampliar"
                            />
                          ))}
                        </CommentImages>
                      )}
                    </Comment>
                  ))}
                </CommentsList>
              ) : (
                <p>No hay comentarios</p>
              )}
              
              <CommentForm onSubmit={handleCommentSubmit}>
                <textarea
                  placeholder="Escribe un comentario..."
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                />

                {/* Previews de imágenes seleccionadas */}
                {comentarioPreviews.length > 0 && (
                  <ImagePreviewGrid>
                    {comentarioPreviews.map((preview, idx) => (
                      <PreviewItem key={idx}>
                        <img src={preview.blobUrl} alt={preview.name} />
                        <button
                          type="button"
                          onClick={() => handleRemovePreview(idx)}
                          title={`Quitar ${preview.name}`}
                        >
                          <FaTimes />
                        </button>
                      </PreviewItem>
                    ))}
                  </ImagePreviewGrid>
                )}

                <CommentFormActions>
                  <ImageUploadLabel title="Adjuntar imagen">
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={handleCommentImageSelect}
                    />
                    <FaImage /> Agregar imagen
                  </ImageUploadLabel>

                  <Button
                    type="submit"
                    variant="primary"
                    className="submit-button"
                  >
                    Enviar comentario
                  </Button>
                </CommentFormActions>
              </CommentForm>
            </Card.Content>
          </Card>
        </Section>
        
        <Section>
          <SectionTitle>
            <FaUsers /> Flujo de Aprobación
          </SectionTitle>
          <Card>
            <Card.Content>
              <ApprovalFlow solicitud={solicitud} />
              
              {/* Mostrar información de rechazo si existe */}
              {solicitud.last_rejection && (
                <Alert
                  type="warning"
                  title="Última acción: Rechazo"
                  description={
                    <div>
                      <p><strong>Rechazado por:</strong> {solicitud.last_rejection?.by_user_name || 'N/A'} ({solicitud.last_rejection?.by_group_name || 'N/A'})</p>
                      <p><strong>Fecha:</strong> {formatDateTime(solicitud.last_rejection?.date || solicitud.last_rejection?.fecha || '')}</p>
                      <p><strong>Razón:</strong> {solicitud.last_rejection?.reason || 'Sin motivo'}</p>
                      {solicitud.approvals?.areas_sostenibilidad?.needs_document_review && (
                        <p><strong>Estado:</strong> Esperando revisión de documentos por Áreas y Sostenibilidad</p>
                      )}
                    </div>
                  }
                  style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.md }}
                />
              )}
              
              {canApprove() && solicitud.status !== 'aprobado' && solicitud.status !== 'rechazado' && (
                <ApprovalActions>
                  <Button
                    variant="error"
                    onClick={handleReject}
                    disabled={approvalLoading}
                  >
                    {approvalLoading ? <FaSpinner /> : <FaTimes />} Rechazar
                  </Button>
                  <Button
                    variant="success"
                    onClick={handleApprove}
                    disabled={approvalLoading}
                  >
                    {approvalLoading ? <FaSpinner /> : <FaCheck />} 
                    {solicitud.last_rejection && getCurrentApprovalGroup(solicitud)?.id === 'areas_sostenibilidad' 
                      ? 'Re-aprobar documentos' 
                      : 'Aprobar'}
                  </Button>
                </ApprovalActions>
              )}
              
              {!canApprove() && solicitud.status !== 'aprobado' && solicitud.status !== 'rechazado' && (
                <Alert
                  type="info"
                  title="Aprobación restringida"
                  description="No tienes permisos para aprobar esta solicitud en su estado actual. La aprobación debe seguir el orden del flujo definido."
                />
              )}
              
              {(solicitud.status === 'aprobado' || solicitud.status === 'rechazado') && (
                <Alert
                  type={solicitud.status === 'aprobado' ? 'success' : 'error'}
                  title={solicitud.status === 'aprobado' ? 'Solicitud aprobada' : 'Solicitud rechazada'}
                  description={solicitud.status === 'aprobado' 
                    ? `Aprobada por ${solicitud.aprobado_por_nombre || 'un aprobador'} el ${formatDateTime(solicitud.fecha_aprobacion)}`
                    : `Rechazada por ${solicitud.rechazado_por_nombre || 'un revisor'} el ${formatDateTime(solicitud.fecha_rechazo)}`
                  }
                />
              )}
            </Card.Content>
          </Card>
        </Section>
        
      </DetailContainer>

      {/* Visor de imágenes (lightbox) */}
      {imageViewer && (
        <ImageViewer
          images={imageViewer.images}
          initialIndex={imageViewer.initialIndex}
          onClose={() => setImageViewer(null)}
        />
      )}
    </Layout>
  );
};

export default DetalleSolicitudPage;
