# Firebase Function: Envío de Correos

## Descripción
Función HTTP para recibir solicitudes de envío de correo y procesarlas usando `nodemailer`.

## Configuración
1. Instala dependencias en la carpeta `functions`:
   ```sh
   cd functions
   npm install firebase-functions firebase-admin nodemailer
   ```
2. Configura las variables de entorno en Firebase:
   ```sh
   firebase functions:config:set email.user="tu_email@gmail.com" email.pass="tu_contraseña"
   ```
3. Despliega la función:
   ```sh
   firebase deploy --only functions
   ```

## Seguridad
- Usa variables de entorno, nunca credenciales en el código.
- Limita el acceso a la función si es necesario (por ejemplo, validando un API Key en el header).

## Ejemplo de petición HTTP
```json
POST /sendEmail
{
  "to": "destinatario@dominio.com",
  "subject": "Asunto",
  "html": "<b>Contenido</b>"
}
```
