// Tipos de notificación
export const NOTIFICATION_TYPES = {
  NEW_REQUEST: 'nueva_solicitud',
  STATUS_UPDATE: 'cambio_estado',
  APPROVAL: 'aprobacion',
  REJECTION: 'rechazo',
  COMMENT_ADDED: 'comentario_agregado',
  DOCUMENT_UPDATED: 'documento_actualizado',
  APPROVAL_FLOW_STARTED: 'flujo_aprobacion_iniciado',
  FINAL_APPROVAL_COMPLETED: 'aprobacion_final_completada'
};

// Plantillas de asunto por tipo
export const EMAIL_SUBJECTS = {
  [NOTIFICATION_TYPES.NEW_REQUEST]: 'Nueva Solicitud de Plano | #{eventName} - #{requestId}',
  [NOTIFICATION_TYPES.STATUS_UPDATE]: 'Actualización de Estado | #{eventName} - #{requestId}',
  [NOTIFICATION_TYPES.APPROVAL]: 'Solicitud Aprobada | #{eventName} - #{requestId}',
  [NOTIFICATION_TYPES.REJECTION]: 'Solicitud Rechazada | #{eventName} - #{requestId}',
  [NOTIFICATION_TYPES.COMMENT_ADDED]: 'Nuevo Comentario | #{eventName} - #{requestId}',
  [NOTIFICATION_TYPES.DOCUMENT_UPDATED]: 'Documentos Actualizados | #{eventName} - #{requestId}',
  [NOTIFICATION_TYPES.APPROVAL_FLOW_STARTED]: 'Su solicitud ha entrado en proceso de aprobación | #{eventName} - #{requestId}',
  [NOTIFICATION_TYPES.FINAL_APPROVAL_COMPLETED]: '¡Su solicitud ha sido aprobada! Descargue sus planos | #{eventName} - #{requestId}'
};
