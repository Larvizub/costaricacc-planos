/**
 * Servicio para interactuar con la API de Fresh Desk
 * La configuración de Fresh Desk debe estar en un archivo .env o similar
 */
// Freshdesk integration has been disabled. Export a minimal stub that preserves API
// surface so callers won't break. All functions are no-ops or return safe defaults.

console.warn('freshdeskService: Freshdesk integration disabled. Using stub implementations.');

export const getPrioridadNombre = (prioridad) => {
  const map = {1: 'Baja', 2: 'Media', 3: 'Alta', 4: 'Urgente'};
  return map[Number(prioridad)] || 'Media';
};

export const createTicket = async (ticketData) => {
  console.info('freshdeskService.createTicket called but integration disabled. ticketData:', ticketData);
  // Return a fake ticket object to keep callers working if they expect an id
  return { id: null, disabled: true };
};

export const getTicketById = async (ticketId) => {
  console.info('freshdeskService.getTicketById called but integration disabled:', ticketId);
  return null;
};

export const updateTicket = async () => {
  console.info('freshdeskService.updateTicket called but integration disabled');
  return null;
};

export const closeTicket = async () => {
  console.info('freshdeskService.closeTicket called but integration disabled');
  return null;
};

export const createTicketForApproval = async () => {
  console.info('freshdeskService.createTicketForApproval called but integration disabled');
  return { id: null, disabled: true };
};

export const getTicketPortalUrl = (ticketId) => {
  return '';
};

const freshdeskService = {
  createTicket,
  getTicketById,
  updateTicket,
  closeTicket,
  createTicketForApproval,
  getTicketPortalUrl,
  getPrioridadNombre,
  handleApprovalTransition: async () => ({ success: true, currentTicket: null, newTicket: null }),
  handleRejectionTransition: async () => ({ closedTicket: null, newTicket: null })
};

export default freshdeskService;
