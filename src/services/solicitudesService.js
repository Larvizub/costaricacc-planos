import { db } from '../firebase/firebaseConfig';
import { ref, set, get, update } from 'firebase/database';
import { toast } from 'react-toastify';
import * as freshDeskService from './freshdeskService';
import { approvalGroups } from '../components/ApprovalFlow';
import emailNotificationService from './emailNotificationService';
import { NOTIFICATION_TYPES } from '../config/emailConfig';

/**
 * Función de utilidad para mostrar logs solo en entorno de desarrollo
 * @param {string} message - Mensaje a mostrar
 * @param {*} data - Datos opcionales a mostrar
 */
const debugLog = (message, data) => {
  if (import.meta.env.DEV) {
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
};

/**
 * Crea una nueva solicitud de aprobación de plano
 * @param {Object} solicitudData - Datos de la solicitud a crear
 * @returns {Promise<string>} - ID de la nueva solicitud creada
 */
export const createSolicitud = async (solicitudData) => {
  try {
    const newSolicitudRef = ref(db, 'solicitudes/' + Date.now());
    
    // Permite incluir adjuntos de referencia en la creación
    const initialData = {
      ...solicitudData,
      freshDeskTickets: {},
      adjuntosReferencia: solicitudData.adjuntosReferencia || [] // <-- adjuntos para orientar al dibujante
    };
    
    // Crear la solicitud en Firebase
    await set(newSolicitudRef, initialData);
    
    // Añadir ID a los datos de la solicitud
    const solicitudId = newSolicitudRef.key;
    const solicitudWithId = {
      ...initialData,
      id: solicitudId
    };
    
  // Determinar el primer grupo de aprobación (se mantiene por compatibilidad)
  // Nota: Freshdesk está deshabilitado, no se usará para crear tickets.
    
    // Freshdesk integration disabled: do not create tickets or update freshDeskTickets.
    console.info('Freshdesk disabled: skipping ticket creation for new solicitud');
    
    // Enviar notificaciones por correo
    try {
      // Determinar los grupos requeridos para esta solicitud
      const requiredGroups = getRequiredApprovalGroups({
        serviciosContratados: solicitudData.serviciosContratados
      });

  // No ticket ids to include since Freshdesk is disabled
      
      // Normalizar requiredGroups a claves de área (strings) si vienen como objetos
      const normalizedRequiredGroups = Array.isArray(requiredGroups) && requiredGroups.length > 0 && typeof requiredGroups[0] === 'string'
        ? requiredGroups
        : (Array.isArray(requiredGroups) ? requiredGroups.map(g => g.id).filter(Boolean) : []);

      await emailNotificationService.notifyNewRequest({
        requestId: solicitudId,
        projectName: solicitudData.nombreEvento || solicitudData.nombreProyecto || 'Evento sin nombre',
        eventName: solicitudData.nombreEvento || solicitudData.nombreProyecto,
        applicantName: solicitudData.nombreCompleto || 'Solicitante',
        applicantEmail: solicitudData.createdByEmail || solicitudData.email || '',
        jobPosition: solicitudData.jobPosition || solicitudData.puesto || '',
        status: 'pending',
        approvalAreas: normalizedRequiredGroups
      });
      
      // Enviar notificación al usuario solicitante sobre el inicio del flujo de aprobación
      try {
        await emailNotificationService.notifyApplicantApprovalFlowStarted({
          requestId: solicitudId,
          nombreEvento: solicitudData.nombreEvento || solicitudData.nombreProyecto || 'Evento sin nombre',
          createdByEmail: solicitudData.createdByEmail || solicitudData.email,
          createdByName: solicitudData.createdByName || solicitudData.nombreCompleto || 'Solicitante'
        });
        console.log('✅ Notificación de inicio de flujo enviada al solicitante');
      } catch (applicantNotificationError) {
        console.error('❌ Error enviando notificación de inicio de flujo al solicitante:', applicantNotificationError);
      }
      
      console.log('Notificaciones por correo enviadas exitosamente');
    } catch (emailError) {
      console.error('Error al enviar notificaciones por correo:', emailError);
      // No detener el flujo si hay error en las notificaciones
      toast.warning('La solicitud se creó, pero algunas notificaciones por correo podrían no haberse enviado.');
    }
    
    toast.success('Solicitud creada con éxito');
    debugLog('Nueva solicitud creada:', solicitudWithId);
    return solicitudId;
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    toast.error('Error al crear solicitud: ' + error.message);
    throw error;
  }
};

/**
 * Obtiene los datos de una solicitud por su ID
 * @param {string} solicitudId - ID de la solicitud a obtener
 * @returns {Promise<Object|null>} - Datos de la solicitud o null si no se encuentra
 */
export const getSolicitudById = async (solicitudId) => {
  try {
    const snapshot = await get(ref(db, 'solicitudes/' + solicitudId));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      debugLog('Solicitud no encontrada:', solicitudId);
      return null;
    }
  } catch (error) {
    console.error('Error al obtener solicitud:', error);
    throw error;
  }
};

/**
 * Actualiza los datos de una solicitud existente
 * @param {string} solicitudId - ID de la solicitud a actualizar
 * @param {Object} updatedData - Nuevos datos para la solicitud
 * @returns {Promise<void>}
 */
export const updateSolicitud = async (solicitudId, updatedData) => {
  try {
    // Obtener datos actuales de la solicitud
    const snapshot = await get(ref(db, 'solicitudes/' + solicitudId));
    if (!snapshot.exists()) {
      throw new Error(`No se encontró la solicitud con ID ${solicitudId}`);
    }
    
    // Actualizar en Firebase
    await update(ref(db, 'solicitudes/' + solicitudId), updatedData);
    
    toast.success('Solicitud actualizada con éxito');
  } catch (error) {
    console.error('Error al actualizar solicitud:', error);
    toast.error('Error al actualizar solicitud: ' + error.message);
    throw error;
  }
};

/**
 * Elimina una solicitud existente
 * @param {string} solicitudId - ID de la solicitud a eliminar
 * @returns {Promise<void>}
 */
export const deleteSolicitud = async (solicitudId) => {
  try {
    await set(ref(db, 'solicitudes/' + solicitudId), null);
    toast.success('Solicitud eliminada con éxito');
  } catch (error) {
    console.error('Error al eliminar solicitud:', error);
    toast.error('Error al eliminar solicitud: ' + error.message);
    throw error;
  }
};

/**
 * Actualiza el estado de aprobación de una solicitud
 * @param {string} solicitudId - ID de la solicitud a actualizar
 * @param {Object} approvalData - Datos de aprobación
 * @param {Object} approvalData.approvals - Estado de aprobaciones por grupo
 * @param {string} approvalData.status - Nuevo estado general de la solicitud
 * @param {Object} groupInfo - Información del grupo que aprueba/rechaza
 * @param {Object} userData - Datos del usuario que realiza la acción
 * @param {string} action - Acción realizada ('aprobado' o 'rechazado')
 * @returns {Promise<void>}
 */
export const updateApprovalStatus = async (solicitudId, approvalData, groupInfo, userData, action) => {
  try {
    // Obtener datos actuales de la solicitud
    const snapshot = await get(ref(db, 'solicitudes/' + solicitudId));
    const currentData = snapshot.exists() ? snapshot.val() : null;
    
    if (!currentData) {
      throw new Error('La solicitud no existe');
    }
    
    debugLog(`Actualizando estado de aprobación para solicitud ${solicitudId}, grupo ${groupInfo.id}, acción ${action}`);
    
    // Eliminar cualquier valor undefined del objeto de actualización
    const cleanData = {};
    Object.keys(approvalData).forEach(key => {
      if (approvalData[key] !== undefined) {
        cleanData[key] = approvalData[key];
      }
    });
    
    // Gestionar tickets de Fresh Desk
    const currentFreshDeskTickets = currentData.freshDeskTickets || {};
    let updatedFreshDeskTickets = { ...currentFreshDeskTickets };
    
    try {
      // 1. Si existe un ticket para este grupo, actualizarlo
      if (currentFreshDeskTickets[groupInfo.id] && currentFreshDeskTickets[groupInfo.id].ticketId) {
        const ticketId = currentFreshDeskTickets[groupInfo.id].ticketId;
        
        // Cerrar el ticket del grupo actual
        await freshDeskService.closeTicket(ticketId);
        
        // Actualizar el estado del ticket en la base de datos
        updatedFreshDeskTickets[groupInfo.id] = {
          ...updatedFreshDeskTickets[groupInfo.id],
          status: 'closed',
          closedAt: new Date().toISOString(),
          closedBy: userData.name || userData.email || 'Usuario del sistema'
        };
      }
      
      // 2. Si la acción es 'aprobado', crear ticket para el siguiente grupo (si existe)
      if (action === 'aprobado') {
  // Obtener todos los grupos requeridos para esta solicitud
  const requiredGroups = Object.values(approvalGroups)
          .filter(group => {
            // Si no tiene servicio condicional, siempre es requerido
            if (!group.conditionalService) return true;
            
            // Si tiene servicio condicional, verificar si está contratado
            return currentData.serviciosContratados && 
                  Array.isArray(currentData.serviciosContratados) && 
                  currentData.serviciosContratados.includes(group.conditionalService);
          })
          .sort((a, b) => a.index - b.index);
        
        // Buscar el índice del grupo actual
        const currentGroupIndex = requiredGroups.findIndex(g => g.id === groupInfo.id);
        
        // Si hay un siguiente grupo, crear ticket para él
  if (currentGroupIndex !== -1 && currentGroupIndex < requiredGroups.length - 1) {
          const nextGroup = requiredGroups[currentGroupIndex + 1];
          
            // Freshdesk integration disabled: skip ticket creation and simply notify the next group
            console.info('Freshdesk disabled: skipping ticket creation for next group', nextGroup.id);
            try {
              console.log(`📣 Notificando al siguiente grupo ${nextGroup.name} (${nextGroup.id}) que la solicitud está en su etapa`);
              await emailNotificationService.sendNotificationToAreas({
                requestId: solicitudId,
                projectName: currentData.nombreEvento || currentData.nombreProyecto || 'Evento sin nombre',
                eventName: currentData.nombreEvento || currentData.nombreProyecto,
                applicantName: currentData.createdByName || currentData.nombreCompleto || 'Solicitante',
                applicantEmail: currentData.createdByEmail || currentData.email || '',
                jobPosition: currentData.jobPosition || currentData.puesto || '',
                status: 'in_review',
                message: `La solicitud ha llegado a su etapa de aprobación para el área ${nextGroup.name}.`
              }, NOTIFICATION_TYPES.STATUS_UPDATE, [nextGroup.id]);
              console.log(`✅ Notificación enviada al grupo ${nextGroup.name}`);
            } catch (notifyErr) {
              console.error(`❌ Error notificando al siguiente grupo ${nextGroup.name}:`, notifyErr);
            }
        }
      }
      
  // Freshdesk disabled: do not add freshDeskTickets to cleanData
      
    } catch (freshDeskError) {
      console.error('Error al gestionar tickets de Fresh Desk:', freshDeskError);
      // No detener el flujo si hay error en Fresh Desk
      toast.warning('La solicitud se actualizó, pero hubo un problema con los tickets de soporte.');
    }
    
    // Actualizar historial con área
    const historialActual = currentData.historial || [];
    const nuevoHistorial = [
      ...historialActual,
      {
        fecha: new Date().toISOString(),
        accion: 'status_updated',
        usuario: userData.name || userData.email || 'Usuario del sistema',
        area: groupInfo.id,
        estadoAnterior: currentData.status,
        estadoNuevo: approvalData.status,
        comentario: approvalData.comentario || ''
      }
    ];
    cleanData.historial = nuevoHistorial;
    // Actualizar en Firebase
    await update(ref(db, 'solicitudes/' + solicitudId), cleanData);
    
    // Enviar notificaciones por correo después de la actualización
    try {
      const updatedData = { ...currentData, ...cleanData };
      
  // Determinar los grupos requeridos para esta solicitud (como claves)
  const requiredGroups = getRequiredApprovalGroups(updatedData);

      // Freshdesk disabled: no ticket IDs to include in notifications
      
        if (action === 'aprobado') {
          console.log('🔔 Preparando notifyStatusUpdate para acción (aprobado):', {
            solicitudId,
            action,
            requiredGroups: Array.isArray(requiredGroups) ? (typeof requiredGroups[0] === 'string' ? requiredGroups : requiredGroups.map(g => g.id)) : [],
          });
        await emailNotificationService.notifyStatusUpdate({
          requestId: solicitudId,
          projectName: updatedData.nombreEvento || updatedData.nombreProyecto || 'Evento sin nombre',
          eventName: updatedData.nombreEvento || updatedData.nombreProyecto,
          applicantName: updatedData.createdByName || updatedData.nombreCompleto || 'Solicitante',
          applicantEmail: updatedData.createdByEmail || updatedData.email || '',
          jobPosition: updatedData.jobPosition || updatedData.puesto || '',
          // freshdeskTicket intentionally omitted (Freshdesk disabled)
          status: 'approved',
          message: `Aprobado por ${userData.name || userData.email} del área ${groupInfo.name}`,
          // Asegurarse de pasar solo las claves de área (strings)
          approvalAreas: Array.isArray(requiredGroups) && requiredGroups.length > 0 && typeof requiredGroups[0] === 'string'
            ? requiredGroups
            : requiredGroups.map(g => g.id)
        }, updatedData.status || 'pending');
      } else if (action === 'rechazado') {
          console.log('🔔 Preparando notifyStatusUpdate para acción (rechazado):', {
            solicitudId,
            action,
            requiredGroups: Array.isArray(requiredGroups) ? (typeof requiredGroups[0] === 'string' ? requiredGroups : requiredGroups.map(g => g.id)) : [],
          });
        await emailNotificationService.notifyStatusUpdate({
          requestId: solicitudId,
          projectName: updatedData.nombreEvento || updatedData.nombreProyecto || 'Evento sin nombre',
          eventName: updatedData.nombreEvento || updatedData.nombreProyecto,
          applicantName: updatedData.createdByName || updatedData.nombreCompleto || 'Solicitante',
          applicantEmail: updatedData.createdByEmail || updatedData.email || '',
          jobPosition: updatedData.jobPosition || updatedData.puesto || '',
          // freshdeskTicket intentionally omitted (Freshdesk disabled)
          status: 'rejected',
          message: `Rechazado por ${userData.name || userData.email} del área ${groupInfo.name}`,
          // Asegurarse de pasar solo las claves de área (strings)
          approvalAreas: Array.isArray(requiredGroups) && requiredGroups.length > 0 && typeof requiredGroups[0] === 'string'
            ? requiredGroups
            : requiredGroups.map(g => g.id)
        }, updatedData.status || 'pending');
      }
      // Notificación de cambio de estado enviada exitosamente(funciona con un catch)
      console.log('Notificaciones de cambio de estado enviadas exitosamente');
    } catch (emailError) {
      console.error('Error al enviar notificaciones de cambio de estado:', emailError);
      // Mostrar error específico al usuario pero no detener el flujo
      toast.warning(`La solicitud se actualizó correctamente, pero hubo un problema enviando las notificaciones por correo: ${emailError.message}`);
    }
    // console.log de solicitud guardada con exito
    toast.success(`Solicitud ${action} con éxito`);
  } catch (error) {
    console.error(`Error al ${action} solicitud:`, error);
    toast.error(`Error al ${action} solicitud: ${error.message}`);
    throw error;
  }
};

/**
 * Actualiza el estado de una solicitud de forma simple
 * @param {string} solicitudId - ID de la solicitud
 * @param {string} nuevoEstado - Nuevo estado
 * @param {string} comentario - Comentario opcional
 * @param {string} usuario - Usuario que hace el cambio
 */
export const actualizarEstadoSolicitud = async (solicitudId, nuevoEstado, comentario = '', usuario = '') => {
  try {
    debugLog('Actualizando estado de solicitud:', { solicitudId, nuevoEstado, comentario });

    // Obtener solicitud actual
    const solicitudRef = ref(db, `solicitudes/${solicitudId}`);
    const snapshot = await get(solicitudRef);
    
    if (!snapshot.exists()) {
      throw new Error('Solicitud no encontrada');
    }

    const solicitudActual = snapshot.val();
    const estadoAnterior = solicitudActual.estado;

    // Preparar actualización
    const actualizacion = {
      estado: nuevoEstado,
      fechaActualizacion: new Date().toISOString(),
      historial: [
        ...(solicitudActual.historial || []),
        {
          fecha: new Date().toISOString(),
          accion: 'status_updated',
          usuario: usuario,
          area: solicitudActual.approvalAreas && Array.isArray(solicitudActual.approvalAreas) ? solicitudActual.approvalAreas[0] : 'desconocido',
          estadoAnterior: estadoAnterior,
          estadoNuevo: nuevoEstado,
          comentario: comentario
        }
      ]
    };

    // Actualizar en Firebase
    await update(solicitudRef, actualizacion);

    // Enviar notificaciones de cambio de estado
    try {
      debugLog('Enviando notificaciones de cambio de estado...');

      // Freshdesk disabled: no ticket IDs to include in notifications
      
      // Normalizar approvalAreas antes de notificar
      const normalizedApprovalAreasForStatus = Array.isArray(solicitudActual.approvalAreas) && solicitudActual.approvalAreas.length > 0 && typeof solicitudActual.approvalAreas[0] === 'string'
        ? solicitudActual.approvalAreas
        : (Array.isArray(solicitudActual.approvalAreas) ? solicitudActual.approvalAreas.map(g => g.id).filter(Boolean) : getRequiredApprovalGroups(solicitudActual));

      await emailNotificationService.notifyStatusUpdate({
        requestId: solicitudId,
        projectName: solicitudActual.nombreEvento || solicitudActual.nombreProyecto || 'Evento sin nombre',
        eventName: solicitudActual.nombreEvento || solicitudActual.nombreProyecto,
        applicantName: solicitudActual.createdByName || solicitudActual.nombreCompleto || 'Solicitante',
        applicantEmail: solicitudActual.createdByEmail || solicitudActual.email || '',
        jobPosition: solicitudActual.jobPosition || solicitudActual.puesto || '',
        // freshdeskTicket intentionally omitted (Freshdesk disabled)
        status: nuevoEstado,
        approvalAreas: normalizedApprovalAreasForStatus,
        message: comentario
      }, estadoAnterior);
      
      debugLog('✅ Notificaciones de cambio de estado enviadas');
    } catch (emailError) {
      console.error('❌ Error enviando notificaciones de cambio de estado:', emailError);
      toast.warning('Estado actualizado pero hubo problemas enviando notificaciones');
    }

    toast.success('Estado actualizado exitosamente');
    return true;

  } catch (error) {
    console.error('Error actualizando estado:', error);
    toast.error('Error al actualizar el estado: ' + error.message);
    throw error;
  }
};

/**
 * Agrega un adjunto de referencia a la solicitud (para orientar al dibujante)
 * @param {string} solicitudId - ID de la solicitud
 * @param {Object} adjunto - { nombre, url, tamaño, subido_por, fecha_subida }
 * @returns {Promise<void>}
 */
export const agregarAdjuntoReferenciaSolicitud = async (solicitudId, adjunto) => {
  try {
    const solicitudRef = ref(db, `solicitudes/${solicitudId}`);
    const snapshot = await get(solicitudRef);
    if (!snapshot.exists()) throw new Error('Solicitud no encontrada');
    const solicitudActual = snapshot.val();

    const nuevosAdjuntos = [...(solicitudActual.adjuntosReferencia || []), adjunto];
    await update(solicitudRef, { adjuntosReferencia: nuevosAdjuntos });
    toast.success('Adjunto de referencia agregado exitosamente');
  } catch (error) {
    console.error('Error agregando adjunto de referencia:', error);
    toast.error('Error al agregar adjunto de referencia: ' + error.message);
    throw error;
  }
};

/**
 * Determina qué grupos de aprobación son requeridos para una solicitud
 * @param {Object} solicitud - Datos de la solicitud
 * @returns {Array} - Array de claves de grupos requeridos
 */
export const getRequiredApprovalGroups = (solicitud) => {
  if (!solicitud) {
    return ['areas_sostenibilidad']; // Por defecto, al menos áreas y sostenibilidad
  }

  // Filtrar los grupos que son requeridos basados en los servicios contratados
  const requiredGroups = Object.keys(approvalGroups)
    .filter(groupKey => {
      const group = approvalGroups[groupKey];
      
      // Áreas y Sostenibilidad siempre es requerido
      if (groupKey === 'areas_sostenibilidad') {
        return true;
      }
      
      // Si no tiene servicio condicional, es requerido
      if (!group.conditionalService) {
        return true;
      }
      
      // Verificar si el servicio condicional está contratado
      return solicitud.serviciosContratados && 
             Array.isArray(solicitud.serviciosContratados) && 
             solicitud.serviciosContratados.includes(group.conditionalService);
    })
    .sort((a, b) => {
      const groupA = approvalGroups[a];
      const groupB = approvalGroups[b];
      return groupA.index - groupB.index;
    });

  // Asegurar que al menos 'areas_sostenibilidad' esté incluido
  if (!requiredGroups.includes('areas_sostenibilidad')) {
    requiredGroups.unshift('areas_sostenibilidad');
  }

  return requiredGroups;
};
