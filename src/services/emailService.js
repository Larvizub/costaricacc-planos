import axios from 'axios';

// Cambia la URL si tu backend corre en otro puerto o dominio
const EMAIL_BACKEND_URL = 'http://201.207.1.98:4000/send-email';
const EMAIL_API_KEY = process.env.REACT_APP_EMAIL_API_KEY || 'COSTARICACC_API_MAIL'; // Usa variable de entorno o valor por defecto

// Envía un correo usando el backend Express
export const sendEmail = async ({ to, subject, html }) => {
  await axios.post(
    EMAIL_BACKEND_URL,
    { to, subject, html },
    {
      headers: {
        'x-api-key': EMAIL_API_KEY
      }
    }
  );
};