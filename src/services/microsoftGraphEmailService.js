import axios from 'axios';

// Cambia la URL para apuntar a la función de Firebase desplegada
// Reemplaza el dominio por el de tu proyecto en Firebase
const EMAIL_BACKEND_URL = 'https://us-central1-costaricacc-planos.cloudfunctions.net/sendEmail';
// Si implementas validación de API Key en la función, usa la variable de entorno
const EMAIL_API_KEY = import.meta.env.REACT_APP_EMAIL_API_KEY || '';

// Envía un correo usando el backend de Firebase Functions
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await axios.post(
      EMAIL_BACKEND_URL,
      { to, subject, html },
      {
        headers: EMAIL_API_KEY ? { 'x-api-key': EMAIL_API_KEY } : {}
      }
    );
    // Devolver información útil para logging
    return { status: response.status, data: response.data };
  } catch (error) {
    // Propagar un error más informativo
    if (error.response) {
      // Error HTTP desde el backend
      const msg = `Email backend responded ${error.response.status}: ${JSON.stringify(error.response.data)}`;
      console.error('❌ microsoftGraphEmailService.sendEmail error:', msg);
      const err = new Error(msg);
      err.original = error;
      throw err;
    }
    console.error('❌ microsoftGraphEmailService.sendEmail network/error:', error.message || error);
    throw error;
  }
};