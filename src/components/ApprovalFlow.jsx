import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/GlobalStyles';
import { 
  FaCheck, 
  FaTimes, 
  FaClock, 
  FaUsers, 
  FaSpinner
} from 'react-icons/fa';

// Definir el orden de aprobación de los grupos
export const approvalGroups = {
  areas_sostenibilidad: {
    id: 'areas_sostenibilidad',
    name: 'Áreas y Sostenibilidad',
    description: 'Equipo de áreas, montajes y sostenibilidad',
    roles: ['jefe_areas_sostenibilidad', 'coordinadora_areas', 'areas_montajes'],
    index: 0,
    canUploadPlanos: true,
    conditionalService: 'montajes',
    icon: <FaUsers />
  },
  audiovisuales: {
    id: 'audiovisuales',
    name: 'Audiovisuales',
    description: 'Directores de operaciones y comerciales',
    roles: ['director_operaciones', 'director_comercial'],
    index: 1,
    conditionalService: 'audiovisuales',
    icon: <FaUsers />
  },
  gastronomia: {
    id: 'gastronomia',
    name: 'Gastronomía',
    description: 'Jefes y coordinadores de experiencia gastronómica',
    roles: ['jefe_experiencia_gastronomica', 'coordinador_experiencia_gastronomica'],
    index: 2,
    conditionalService: 'gastronomia',
    icon: <FaUsers />
  },
  gestion_proteccion: {
    id: 'gestion_proteccion',
    name: 'Gestión de la Protección',
    description: 'Jefes y supervisores de gestión de la protección',
    roles: ['jefe_gestion_proteccion', 'supervisor_gestion_proteccion'],
    index: 3,
    icon: <FaUsers />
  },
  salud_ocupacional: {
    id: 'salud_ocupacional',
    name: 'Salud Ocupacional',
    description: 'Asistentes de talento humano',
    roles: ['asistente_talento_humano'],
    index: 4,
    icon: <FaUsers />
  }
};

// Componente para la barra de estado de aprobación
const ApprovalFlowContainer = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const ApprovalTitle = styled.h3`
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

const ApprovalSteps = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const StepItem = styled.div`
  flex: 1;
  min-width: 160px;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  background-color: ${({ status }) => {
    switch (status) {
      case 'aprobado': return `${theme.colors.success}20`;
      case 'rechazado': return `${theme.colors.error}20`;
      case 'en_revision': return `${theme.colors.warning}20`;
      case 'pendiente': return `${theme.colors.background}`;
      default: return `${theme.colors.background}`;
    }
  }};
  
  border: 1px solid ${({ status }) => {
    switch (status) {
      case 'aprobado': return theme.colors.success;
      case 'rechazado': return theme.colors.error;
      case 'en_revision': return theme.colors.warning;
      case 'pendiente': return theme.colors.border;
      default: return theme.colors.border;
    }
  }};
  
  position: relative;
  
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    width: 100%;
  }
`;

const StepIcon = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  
  svg {
    font-size: 1.2rem;
    color: ${({ status }) => {
      switch (status) {
        case 'aprobado': return theme.colors.success;
        case 'rechazado': return theme.colors.error;
        case 'en_revision': return theme.colors.warning;
        case 'pendiente': return theme.colors.textLight;
        default: return theme.colors.textLight;
      }
    }};
  }
`;

const StepName = styled.div`
  font-weight: 500;
  font-size: 0.95rem;
  color: ${theme.colors.text};
`;

const StepInfo = styled.div`
  font-size: 0.85rem;
  color: ${theme.colors.textLight};
`;

const Connector = styled.div`
  flex: 0;
  width: 20px;
  height: 2px;
  background-color: ${theme.colors.border};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    display: none;
  }
`;

// Función para obtener el estado de aprobación por grupo
const getGroupApprovalStatus = (solicitud, groupId) => {
  if (!solicitud || !solicitud.approvals) {
    return 'pendiente';
  }

  const groupApproval = solicitud.approvals[groupId];
  if (!groupApproval) {
    return 'pendiente';
  }

  return groupApproval.status || 'pendiente';
};

// Función para obtener el icono del estado
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
      return <FaSpinner />;
  }
};

// Función para formatear la fecha
const getApprovalInfo = (solicitud, groupId) => {
  if (!solicitud || !solicitud.approvals || !solicitud.approvals[groupId]) {
    return 'Esperando revisión';
  }

  const approval = solicitud.approvals[groupId];
  if (approval.status === 'aprobado') {
    return `Aprobado por ${approval.approved_by_name || 'un aprobador'}`;
  } else if (approval.status === 'rechazado') {
    return `Rechazado por ${approval.rejected_by_name || 'un revisor'}`;
  } else if (approval.status === 'en_revision') {
    return 'En revisión actualmente';
  }

  return 'Esperando revisión';
};

// Función para determinar qué grupos son necesarios según los servicios
const getRequiredGroups = (solicitud) => {
  if (!solicitud) {
    // Si no hay solicitud, devolver al menos "Áreas y Sostenibilidad"
    return [approvalGroups['areas_sostenibilidad']];
  }

  // Filtrar los grupos que siempre son requeridos o que son condicionales y 
  // el servicio correspondiente está contratado
  let groups = Object.values(approvalGroups)
    .filter(group => {
      // Áreas y Sostenibilidad siempre es requerido
      if (group.id === 'areas_sostenibilidad') {
        return true;
      }
      
      if (!group.conditionalService) {
        return true; // Este grupo siempre es requerido
      }
      
      // Verificar si el servicio condicional está contratado
      return solicitud.serviciosContratados && 
             Array.isArray(solicitud.serviciosContratados) && 
             solicitud.serviciosContratados.includes(group.conditionalService);
    })
    .sort((a, b) => a.index - b.index); // Ordenar por el índice de flujo
  
  // Verificar que "Áreas y Sostenibilidad" esté incluido
  const hasAreasSostenibilidad = groups.some(group => group.id === 'areas_sostenibilidad');
  
  if (!hasAreasSostenibilidad && approvalGroups['areas_sostenibilidad']) {
    // Si no está presente, añadirlo al principio
    console.log('Asegurando que Áreas y Sostenibilidad esté incluido en el flujo');
    groups.unshift(approvalGroups['areas_sostenibilidad']);
    
    // Reordenar por índice para mantener la consistencia
    groups = groups.sort((a, b) => a.index - b.index);
  }
  
  console.log('Grupos requeridos para la solicitud:', groups.map(g => g.name));
  
  return groups;
};

// Componente principal del flujo de aprobación
const ApprovalFlow = ({ solicitud }) => {
  // Determinar qué grupos son necesarios para esta solicitud
  const requiredGroups = getRequiredGroups(solicitud);
  
  return (
    <ApprovalFlowContainer>
      <ApprovalTitle>
        <FaUsers /> Flujo de Aprobación
      </ApprovalTitle>
      
      <ApprovalSteps>
        {requiredGroups.map((group, index) => (
          <React.Fragment key={group.id}>
            <StepItem status={getGroupApprovalStatus(solicitud, group.id)}>
              <StepIcon status={getGroupApprovalStatus(solicitud, group.id)}>
                {getStatusIcon(getGroupApprovalStatus(solicitud, group.id))}
                <StepName>{group.name}</StepName>
              </StepIcon>
              <StepInfo>{getApprovalInfo(solicitud, group.id)}</StepInfo>
            </StepItem>
            
            {index < requiredGroups.length - 1 && (
              <Connector />
            )}
          </React.Fragment>
        ))}
      </ApprovalSteps>
    </ApprovalFlowContainer>
  );
};

export default ApprovalFlow;
