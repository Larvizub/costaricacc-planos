// Configuración de EmailJS
export const EMAIL_CONFIG = {
// ...otras configuraciones de email si aplica...
};

// Configuración de áreas y correos de aprobación - Centro de Convenciones de Costa Rica
export const APPROVAL_AREAS = {
  'areas_sostenibilidad': {
    name: 'Áreas y Sostenibilidad',
    emails: [
      'luis.alpizar@costaricacc.com',
      'silvia.navarro@costaricacc.com',
      'montajes2@costaricacc.com'
    ],
    color: '#2ecc71'
  },  
  'audiovisuales': {
    name: 'Audiovisuales',
    emails: [
      'director.operativo@costaricacc.com',
      'director.comercial@costaricacc.com'
    ],
    color: '#9b59b6'
  },
  'gastronomia': {
    name: 'Gastronomía',
    emails: [
      'kendall.solano@costaricacc.com',
      'oscar.carranza@costaricacc.com'
    ],
    color: '#f39c12'
  },
  'gestion_proteccion': {
    name: 'Gestión de la Protección',
    emails: [
      'luis.arvizu@costaricacc.com',
      'yoxsy.chaves@costaricacc.com'
    ],
    color: '#e74c3c'
  },
  'salud_ocupacional': {
    name: 'Salud Ocupacional',
    emails: [
      'fernan.cambronero@costaricacc.com',
      'silvia.montiel@costaricacc.com', 
      'pamela.apuy@costaricacc.com'
    ],
    color: '#3498db'
  }
};

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
