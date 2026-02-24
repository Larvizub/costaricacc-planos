/**
 * Configuración para Microsoft Graph API
 * Permisos requeridos: User.Read, Directory.Read.All
 */

// URL base de Microsoft Graph API
export const MS_GRAPH_API_URL = 'https://graph.microsoft.com/v1.0';

// Endpoint para obtener información del usuario
export const MS_GRAPH_USER_ENDPOINT = `${MS_GRAPH_API_URL}/me?$select=displayName,mail,jobTitle,department,userPrincipalName`;

// Endpoint para obtener foto de perfil
export const MS_GRAPH_PHOTO_ENDPOINT = `${MS_GRAPH_API_URL}/me/photo/$value`;
