// Firebase Function para envío de correos HTTP usando Microsoft Graph
// Implementación robusta, lista para producción, sin recomendaciones

const functions = require('firebase-functions');
const { Client } = require('@microsoft/microsoft-graph-client');
const { TokenCredentialAuthenticationProvider } = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');
const { ClientSecretCredential } = require('@azure/identity');

// Configuración de credenciales para Microsoft Graph
const tenantId = functions.config().graph.tenantid;
const clientId = functions.config().graph.clientid;
const clientSecret = functions.config().graph.clientsecret;
const sender = functions.config().graph.sender; // correo del remitente autorizado

// Inicializa el cliente de Microsoft Graph
const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ['https://graph.microsoft.com/.default']
});
const graphClient = Client.initWithMiddleware({ authProvider });

// Función HTTP para enviar correos usando Microsoft Graph
exports.sendEmail = functions.https.onRequest(async (req, res) => {
  // Configuración CORS básica
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  // Manejar preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  // Permitir solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Logging de la solicitud
  functions.logger.info('Solicitud recibida para enviar correo', { body: req.body });

  // Extracción y validación de parámetros
  let { to, subject, html } = req.body;

  // Permitir múltiples destinatarios separados por coma o array
  if (typeof to === 'string') {
    to = to.split(',').map(addr => addr.trim()).filter(Boolean);
  } else if (Array.isArray(to)) {
    to = to.map(addr => String(addr).trim()).filter(Boolean);
  } else {
    to = [];
  }

  if (!to.length || !subject || !html) {
    functions.logger.warn('Solicitud inválida', { to, subject, html });
    return res.status(400).json({ error: 'Faltan campos requeridos: to, subject, html' });
  }

  // Construcción del mensaje para Microsoft Graph
  const message = {
    message: {
      subject,
      body: {
        contentType: 'HTML',
        content: html
      },
      toRecipients: to.map(address => ({ emailAddress: { address } }))
    },
    saveToSentItems: 'true'
  };

  try {
    await graphClient.api(`/users/${sender}/sendMail`).post(message);
    functions.logger.info('Correo enviado correctamente', { to, subject });
    res.status(200).json({ message: 'Correo enviado' });
  } catch (error) {
    // Logging detallado del error
    functions.logger.error('Error enviando correo', { error: error.message, stack: error.stack });
    let errorMsg = 'Error enviando correo';
    if (error.body && error.body.error && error.body.error.message) {
      errorMsg = error.body.error.message;
    }
    res.status(500).json({ error: errorMsg });
  }
});
