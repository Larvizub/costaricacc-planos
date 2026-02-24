/**
 * Utilidades para formateo de datos en la aplicación
 */

/**
 * Formatea una fecha en formato ISO a formato local (DD/MM/YYYY)
 * @param {string} isoDate - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatDate = (isoDate) => {
  if (!isoDate) return 'N/A';
  
  const date = new Date(isoDate);
  
  if (isNaN(date)) return 'Fecha inválida';
  
  return date.toLocaleDateString('es-CR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formatea una fecha y hora en formato ISO a formato local (DD/MM/YYYY HH:MM)
 * @param {string} isoDate - Fecha en formato ISO
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTime = (isoDate) => {
  if (!isoDate) return 'N/A';
  
  const date = new Date(isoDate);
  
  if (isNaN(date)) return 'Fecha inválida';
  
  return date.toLocaleDateString('es-CR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Convierte la primera letra de cada palabra a mayúscula
 * @param {string} text - Texto a formatear
 * @returns {string} Texto formateado
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formatea un estado a un formato legible
 * @param {string} status - Estado de la solicitud
 * @returns {string} Estado formateado
 */
export const formatStatus = (status) => {
  if (!status) return 'Desconocido';
  
  const statusMap = {
    'pendiente': 'Pendiente',
    'en_revision': 'En Revisión',
    'aprobado': 'Aprobado',
    'rechazado': 'Rechazado',
    'en_proceso': 'En Proceso',
    'finalizado': 'Finalizado'
  };
  
  return statusMap[status] || capitalizeWords(status);
};

/**
 * Trunca un texto a una longitud máxima
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength) + '...';
};
