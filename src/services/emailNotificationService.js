import { NOTIFICATION_TYPES, EMAIL_SUBJECTS } from '../config/emailConfig';
import { sendEmail } from './microsoftGraphEmailService';
import { db } from '../firebase/firebaseConfig';
import { ref, get } from 'firebase/database';

class EmailNotificationService {
  constructor() {
    this.initialized = false;
    this.init();
  }

  normalizeGroupList(userGroups) {
    if (Array.isArray(userGroups)) {
      return userGroups.map(group => String(group).trim()).filter(Boolean);
    }

    if (typeof userGroups === 'string') {
      return userGroups.split(',').map(group => group.trim()).filter(Boolean);
    }

    return [];
  }

  async getUsersByApprovalGroup(areaKey) {
    try {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);

      if (!snapshot.exists()) {
        return [];
      }

      const usersData = snapshot.val();
      const users = Object.values(usersData || {});

      return users
        .filter(user => {
          const groups = this.normalizeGroupList(user?.userGroups);
          return groups.includes(areaKey);
        })
        .map(user => String(user?.email || '').trim().toLowerCase())
        .filter(Boolean);
    } catch (error) {
      console.error(`❌ Error consultando usuarios del grupo ${areaKey}:`, error);
      return [];
    }
  }

  async getAllApprovalGroups() {
    try {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);

      if (!snapshot.exists()) {
        return [];
      }

      const usersData = snapshot.val();
      const users = Object.values(usersData || {});
      const groupsSet = new Set();

      users.forEach(user => {
        const groups = this.normalizeGroupList(user?.userGroups);
        groups.forEach(group => groupsSet.add(group));
      });

      return Array.from(groupsSet);
    } catch (error) {
      console.error('❌ Error obteniendo lista de grupos de aprobacion:', error);
      return [];
    }
  }

  getAreaColor(areaKey) {
    // Color estable derivado del nombre del grupo para mantener consistencia visual sin configuracion hardcodeada.
    const key = String(areaKey || 'default');
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 60%, 45%)`;
  }

  getAreaName(areaKey) {
    if (!areaKey) return 'Grupo de Aprobacion';
    return String(areaKey)
      .split('_')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  init() {
    this.initialized = true;
  }
  /**
   * Genera el HTML del correo con el diseño de la plataforma
   */  generateEmailHTML(data) {
    const {
      requestId,
      projectName,     // Este debería ser el nombre del evento
      eventName,       // Agregar soporte para eventName también
      applicantEmail,
      createdByEmail,
  jobPosition,     // Agregar soporte para jobPosition
      status,
      message,
      actionUrl,
      notificationType,
      areaName,
      comments
    } = data;

    // Usar eventName si está disponible, sino usar projectName
    const displayEventName = eventName || projectName || 'Sin nombre';
    const displayJobPosition = jobPosition || 'No especificada';
    // Mostrar siempre el correo del solicitante, usando todas las variantes posibles
    const displayApplicantEmail = applicantEmail || createdByEmail || 'No especificado';

    const areaColor = this.getAreaColor(data.areaKey);

    return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Notificación - Centro de Convenciones de Costa Rica</title>
  </head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, ${areaColor} 0%, ${this.darkenColor(areaColor, 20)} 100%); color: white; padding: 30px; text-align: center;">
              <img src="https://costaricacc-planos.web.app/logo.png" alt="Centro de Convenciones de Costa Rica" style="height: 50px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #00830e;">Sistema de Aprobación de Planos</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; color: #00830e; font-weight: bold;">${areaName || 'Notificación del Sistema'}</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
              <div style="background-color: #f8f9fa; border-left: 4px solid ${areaColor}; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
                  <h2 style="margin: 0 0 10px 0; color: ${areaColor}; font-size: 20px;">
                      ${this.getNotificationTitle(notificationType)}
                  </h2>
                  <p style="margin: 0; color: #666; font-size: 14px;">Solicitud #${requestId}</p>
              </div>

              <div style="margin-bottom: 30px;">
                  <h3 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px;">
                      Detalles de la Solicitud
                  </h3>                  <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: 600; color: #555; width: 30%;">Evento:</td>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333; font-weight: 600;">${displayEventName}</td>
                      </tr>
                      <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: 600; color: #555;">Posición:</td>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333;">${displayJobPosition}</td>
                      </tr>
                      <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: 600; color: #555;">Email del Solicitante:</td>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333;">
                              <a href="mailto:${displayApplicantEmail}" style="color: #00830e; text-decoration: none;">${displayApplicantEmail}</a>
                          </td>
                      </tr>
            <!-- Ticket info removed -->
                      <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: 600; color: #555;">Estado:</td>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                              <span style="background-color: ${this.getStatusColor(status)}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                  ${this.getStatusText(status)}
                              </span>
                          </td>
                      </tr>
                  </table>
              </div>

                ${message ? `
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <h4 style="margin: 0 0 10px 0; color: #333;">Mensaje:</h4>
                    <p style="margin: 0; color: #666; white-space: pre-wrap;">${message}</p>
                </div>
                ` : ''}

                ${comments && comments.length > 0 ? `
                <div style="margin-bottom: 30px;">
                    <h4 style="color: #333; margin-bottom: 15px;">Comentarios Recientes:</h4>
                    ${comments.map(comment => `
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid ${areaColor};">
                            <div style="font-weight: 600; color: #333; margin-bottom: 5px;">${comment.author}</div>
                            <div style="color: #666; font-size: 14px; margin-bottom: 5px;">${comment.date}</div>
                            <div style="color: #555;">${comment.text}</div>
                            ${comment.images && comment.images.length > 0 ? `
                            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
                                ${comment.images.map(url => `
                                    <a href="${url}" target="_blank" rel="noopener noreferrer" style="display: inline-block; line-height: 0;">
                                        <img src="${url}" alt="Imagen adjunta" width="140" height="140"
                                            style="width: 140px; height: 140px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd;" />
                                    </a>
                                `).join('')}
                            </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
                ` : ''}                <!-- Action Button -->
                <div style="text-align: center; margin: 40px 0;">
                    <a href="${actionUrl}" 
                       style="background-color: #00830e; 
                              color: white; 
                              text-decoration: none; 
                              padding: 15px 30px; 
                              border-radius: 25px; 
                              font-weight: 600; 
                              font-size: 16px; 
                              display: inline-block; 
                              box-shadow: 0 4px 15px rgba(0,131,14,0.3);
                              transition: transform 0.2s ease;">
                        Ver Solicitud Completa
                    </a>
                </div>

                <!-- Instructions -->
                <div style="background-color: #e8f4f8; padding: 20px; border-radius: 8px; border: 1px solid #bee5eb;">
                    <h4 style="margin: 0 0 10px 0; color: #0c5460;">Instrucciones:</h4>
                    <ul style="margin: 0; padding-left: 20px; color: #0c5460;">
                        <li>Haga clic en el botón "Ver Solicitud Completa" para acceder al sistema</li>
                        <li>Revise todos los documentos adjuntos</li>
                        <li>Agregue sus comentarios si es necesario</li>
                        <li>Cambie el estado de la solicitud según corresponda</li>
                    </ul>
                </div>
            </div>            <!-- Footer -->
            <div style="background-color: #00830e; color: white; padding: 30px; text-align: center;">
                <img src="https://costaricacc-planos.web.app/logo.png" alt="Centro de Convenciones de Costa Rica" style="height: 40px; margin-bottom: 15px; filter: brightness(0) invert(1);">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: white;">
                    Este es un mensaje automático del Sistema de Aprobación de Planos
                </p>
                <p style="margin: 0; font-size: 12px; color: white; opacity: 0.9;">
                    Centro de Convenciones de Costa Rica © ${new Date().getFullYear()}
                </p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: white; opacity: 0.9;">
                    <a href="https://costaricacc-planos.web.app" style="color: white; text-decoration: none; opacity: 0.9;">
                        Acceder al Sistema
                    </a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Envía notificación a las áreas correspondientes
   */
  async sendNotificationToAreas(requestData, notificationType, areas = []) {

    // Normalizar "areas": aceptar arrays de claves (strings) o arrays de objetos de grupo
    let normalizedAreas = [];
    if (!Array.isArray(areas)) {
      console.warn('⚠️ El parámetro "areas" no es un array, intentando coerción:', areas);
      normalizedAreas = Array.isArray(requestData.approvalAreas) ? requestData.approvalAreas : [];
    } else if (areas.length > 0 && typeof areas[0] === 'object' && areas[0] !== null) {
      // Si recibimos objetos de grupo, mapear a sus ids
      console.log('� Normalizando array de objetos de grupo a claves de área');
      normalizedAreas = areas.map(g => g.id).filter(Boolean);
    } else {
      normalizedAreas = areas.slice();
    }

    if (normalizedAreas.length === 0) {
      normalizedAreas = await this.getAllApprovalGroups();
    }

    console.log('�📧 Enviando notificaciones a áreas (normalizadas):', {
      areas: normalizedAreas,
      originalAreas: areas,
      notificationType,
      requestId: requestData.requestId
    });

    const results = [];

    for (const areaKey of normalizedAreas) {
      if (typeof areaKey !== 'string') {
        console.warn('⚠️ Área inválida (no string), omitiendo:', areaKey);
        continue;
      }

      const areaName = this.getAreaName(areaKey);

      const groupUsersEmails = await this.getUsersByApprovalGroup(areaKey);

      // Usar unicamente los usuarios reales asignados al grupo de aprobacion.
      const recipientEmails = groupUsersEmails
        .map(email => String(email).trim().toLowerCase())
        .filter(Boolean)
        .filter((email, index, arr) => arr.indexOf(email) === index);

      if (recipientEmails.length === 0) {
        console.warn(`⚠️ No hay destinatarios para el grupo ${areaName} (${areaKey})`);
        results.push({ areaKey, success: false, error: 'No recipients found for approval group' });
        continue;
      }

      console.log(`📍 Procesando área: ${areaName} (${areaKey}) - ${recipientEmails.length} destinatarios`);

      for (const email of recipientEmails) {
        try {
          console.log(`📤 Enviando correo a: ${email}`);
          const result = await this.sendNotificationEmail({
            ...requestData,
            recipientEmail: email,
            areaKey,
            areaName,
            notificationType
          });
          console.log(`✅ Correo enviado exitosamente a ${email}:`, result);
          results.push({ email, areaKey, success: true, result });
        } catch (error) {
          console.error(`❌ Error enviando correo a ${email}:`, error);
          results.push({ email, areaKey, success: false, error: error.message });
        }
      }
    }

    console.log('📊 Resumen de envíos:', {
      total: results.length,
      exitosos: results.filter(r => r.success).length,
      fallidos: results.filter(r => !r.success).length
    });

    return results;
  }

  async sendNotificationEmail(data) {
    const {
      requestId,
      projectName,
      eventName,
      applicantName,
      applicantEmail,
      createdByEmail,
      jobPosition,
      recipientEmail,
      status,
      message,
      notificationType,
      areaName,
      areaKey,
      comments = []
    } = data;

    const actionUrl = `https://costaricacc-planos.web.app/solicitudes/${requestId}`;
    const displayEventName = eventName || projectName || 'Sin nombre';
    let subject = EMAIL_SUBJECTS[notificationType] || `Notificación del Sistema - Solicitud #${requestId}`;
    subject = subject
      .replace('#{requestId}', requestId)
      .replace('#{eventName}', displayEventName);

    // Siempre pasar ambos: applicantEmail y createdByEmail
    const emailHTML = this.generateEmailHTML({
      requestId,
      projectName,
      eventName,
      applicantName,
      applicantEmail: applicantEmail || createdByEmail,
      createdByEmail: createdByEmail || applicantEmail,
      jobPosition,
      status,
      message,
      actionUrl,
      notificationType,
      areaName,
      areaKey,
      comments
    });

    try {
      const result = await sendEmail({
        to: recipientEmail,
        subject,
        html: emailHTML
      });
      console.log(`✅ Correo enviado exitosamente a ${recipientEmail}`, result);
      return { success: true, result };
    } catch (error) {
      console.error(`❌ Error enviando correo a ${recipientEmail}:`, error);
      // Incluir detalles si vienen en el error
      const details = error && error.message ? error.message : (error && error.original ? error.original : error);
      return { success: false, error: details };
    }
  }
  /**
   * Notifica nueva solicitud
   */
  async notifyNewRequest(requestData) {
    // Usar grupos de la solicitud; si no vienen, se resolveran dinamicamente desde userGroups.
    const areas = requestData.approvalAreas;
    return await this.sendNotificationToAreas(
      requestData,
      NOTIFICATION_TYPES.NEW_REQUEST,
      areas
    );
  }

  /**
   * Notifica cambio de estado
   */  async notifyStatusUpdate(requestData, previousStatus) {
    console.log('🔄 Iniciando notificación de cambio de estado:', {
      requestId: requestData.requestId,
      previousStatus,
      newStatus: requestData.status,
      approvalAreas: requestData.approvalAreas
    });

    // Usar grupos de la solicitud; si no vienen, se resolveran dinamicamente desde userGroups.
    const areas = requestData.approvalAreas;
    const notificationType = this.getNotificationTypeByStatus(requestData.status);

    console.log('📧 Configuración de envío:', {
      areas,
      notificationType,
      totalAreas: Array.isArray(areas) ? areas.length : 'dinamico'
    });

    return await this.sendNotificationToAreas({
      ...requestData,
      message: `Estado cambiado de "${this.getStatusText(previousStatus)}" a "${this.getStatusText(requestData.status)}"`
    }, notificationType, areas);
  }

  /**
   * Notifica nuevo comentario
   */
  async notifyNewComment(requestData, comment) {
    // Usar grupos de la solicitud; si no vienen, se resolveran dinamicamente desde userGroups.
    const areas = requestData.approvalAreas;

    return await this.sendNotificationToAreas({
      ...requestData,
      message: `Nuevo comentario de ${comment.author}`,
      comments: [comment]
    }, NOTIFICATION_TYPES.COMMENT_ADDED, areas);
  }

  /**
   * Notifica al usuario solicitante cuando su solicitud entra en proceso de aprobación
   */
  async notifyApplicantApprovalFlowStarted(requestData) {
    const { requestId, nombreEvento, createdByEmail, createdByName } = requestData;
    
    if (!createdByEmail) {
      console.warn('No se puede enviar notificación: email del solicitante no disponible');
      return null;
    }
    
    try {
      const result = await this.sendNotificationEmail({
        requestId,
        projectName: nombreEvento,
        eventName: nombreEvento,
        applicantName: createdByName,
        applicantEmail: createdByEmail,
        recipientEmail: createdByEmail,
        status: 'en_proceso',
        message: `Su solicitud para el evento "${nombreEvento}" ha entrado en el proceso de aprobación. Los departamentos correspondientes han sido notificados y comenzarán la revisión de su solicitud.`,
        notificationType: NOTIFICATION_TYPES.APPROVAL_FLOW_STARTED,
        areaName: 'Sistema de Aprobación',
        areaKey: 'system'
      });
      
      console.log(`✅ Notificación de inicio de flujo enviada al solicitante: ${createdByEmail}`);
      return result;
    } catch (error) {
      console.error('❌ Error enviando notificación de inicio de flujo al solicitante:', error);
      throw error;
    }
  }

  /**
   * Notifica al usuario solicitante cuando su solicitud es completamente aprobada
   */
  async notifyApplicantFinalApproval(requestData) {
    const { 
      requestId, 
      nombreEvento, 
      createdByEmail, 
      createdByName, 
      planos = [],
      fecha_aprobacion,
      approvalAreas // <-- Asegurarse de obtener las áreas involucradas
    } = requestData;
    
    const downloadLinks = planos.map(plano => ({
      name: plano.nombre,
      url: plano.url,
      size: this.formatFileSize(plano.tamaño),
      uploadedBy: plano.subido_por_nombre,
      uploadedAt: this.formatDate(plano.fecha_subida)
    }));

    const actionUrl = `https://costaricacc-planos.web.app/solicitudes/${requestId}`;

    // Notificar al solicitante (como antes)
    let results = [];
    if (createdByEmail) {
      try {
        const result = await this.sendApprovalNotificationWithDownloads({
          requestId,
          projectName: nombreEvento,
          eventName: nombreEvento,
          applicantName: createdByName,
          applicantEmail: createdByEmail,
          recipientEmail: createdByEmail,
          status: 'aprobado',
          approvalDate: fecha_aprobacion,
          downloadLinks,
          actionUrl,
          notificationType: NOTIFICATION_TYPES.FINAL_APPROVAL_COMPLETED
        });
        console.log(`✅ Notificación de aprobación final enviada al solicitante: ${createdByEmail}`);
        results.push({ email: createdByEmail, success: true, result });
      } catch (error) {
        console.error('❌ Error enviando notificación de aprobación final al solicitante:', error);
        results.push({ email: createdByEmail, success: false, error: error.message });
      }
    } else {
      console.warn('No se puede enviar notificación: email del solicitante no disponible');
    }

    // Notificar a todos los involucrados en el flujo usando unicamente grupos de aprobacion.
    const areas = Array.isArray(approvalAreas) && approvalAreas.length > 0
      ? approvalAreas
      : await this.getAllApprovalGroups();
    const allGroupRecipients = new Set();

    for (const areaKey of areas) {
      const groupUsersEmails = await this.getUsersByApprovalGroup(areaKey);

      for (const email of groupUsersEmails) {
        allGroupRecipients.add(String(email).trim().toLowerCase());
      }
    }

    const applicantEmailNormalized = String(createdByEmail || '').trim().toLowerCase();

    for (const email of allGroupRecipients) {
        // Evitar duplicar el envío al solicitante si ya se notificó arriba
      if (email === applicantEmailNormalized) continue;
        try {
          const result = await this.sendApprovalNotificationWithDownloads({
            requestId,
            projectName: nombreEvento,
            eventName: nombreEvento,
            applicantName: createdByName,
            applicantEmail: createdByEmail,
            recipientEmail: email,
            status: 'aprobado',
            approvalDate: fecha_aprobacion,
            downloadLinks,
            actionUrl,
            notificationType: NOTIFICATION_TYPES.FINAL_APPROVAL_COMPLETED
          });
          console.log(`✅ Notificación de aprobación final enviada a involucrado: ${email}`);
          results.push({ email, success: true, result });
        } catch (error) {
          console.error(`❌ Error enviando notificación de aprobación final a ${email}:`, error);
          results.push({ email, success: false, error: error.message });
        }
    }

    return results;
  }

  /**
   * Envía notificación de aprobación con enlaces de descarga
   */
  async sendApprovalNotificationWithDownloads(data) {
    const {
      requestId,
      projectName,
      eventName,
      applicantName,
      applicantEmail,
      createdByEmail,
      recipientEmail,
      status,
      approvalDate,
      downloadLinks = [],
      actionUrl,
      notificationType
    } = data;

    const displayEventName = eventName || projectName || 'Sin nombre';
    let subject = EMAIL_SUBJECTS[notificationType] || `Solicitud Aprobada - ${displayEventName} #${requestId}`;
    subject = subject
      .replace('#{eventName}', displayEventName)
      .replace('#{requestId}', requestId);

    // Siempre pasar ambos: applicantEmail y createdByEmail
    const htmlContent = this.generateApprovalEmailWithDownloadsHTML({
      requestId,
      eventName: displayEventName,
      applicantName,
      applicantEmail: applicantEmail || createdByEmail,
      createdByEmail: createdByEmail || applicantEmail,
      status,
      approvalDate,
      downloadLinks,
      actionUrl
    });

    try {
      await sendEmail({
        to: recipientEmail,
        subject,
        html: htmlContent
      });
      console.log(`✅ Correo de aprobación con descargas enviado a ${recipientEmail}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Error enviando correo de aprobación a ${recipientEmail}:`, error);
      throw error;
    }
  }

  /**
   * Genera HTML específico para notificación de aprobación con enlaces de descarga
   */
  generateApprovalEmailWithDownloadsHTML(data) {
    const {
      requestId,
      eventName,
      applicantName,
      applicantEmail,
      createdByEmail,
      approvalDate,
      downloadLinks,
      actionUrl
    } = data;
    const displayApplicantEmail = applicantEmail || createdByEmail || 'No especificado';

    return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Solicitud Aprobada! - Centro de Convenciones de Costa Rica</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #00830e 0%, #005a0a 100%); color: #00830e; padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700;">
                  ¡Felicitaciones! Su solicitud ha sido aprobada
              </h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                  Centro de Convenciones de Costa Rica
              </p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
              
              <!-- Success Message -->
              <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;">
                  <div style="font-size: 24px; margin-bottom: 10px;">🎉</div>
                  <h2 style="margin: 0; color: #155724; font-size: 20px;">¡Su solicitud ha sido completamente aprobada!</h2>
                  <p style="margin: 10px 0 0 0; color: #155724;">Ya puede descargar sus planos aprobados</p>
              </div>

              <!-- Event Details -->
              <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #00830e;">
                  <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Detalles del Evento</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                          <td style="padding: 8px 0; color: #666; font-weight: 600; width: 140px;">Evento:</td>
                          <td style="padding: 8px 0; color: #333;">${eventName}</td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0; color: #666; font-weight: 600;">Solicitud #:</td>
                          <td style="padding: 8px 0; color: #333;">${requestId}</td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0; color: #666; font-weight: 600;">Solicitante:</td>
                          <td style="padding: 8px 0; color: #333;">${applicantName}</td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0; color: #666; font-weight: 600;">Email del Solicitante:</td>
                          <td style="padding: 8px 0; color: #333;"><a href="mailto:${displayApplicantEmail}" style="color: #00830e; text-decoration: none;">${displayApplicantEmail}</a></td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0; color: #666; font-weight: 600;">Fecha de Aprobación:</td>
                          <td style="padding: 8px 0; color: #333;">${this.formatDate(approvalDate)}</td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0; color: #666; font-weight: 600;">Estado:</td>
                          <td style="padding: 8px 0;">
                              <span style="background-color: #27ae60; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                  APROBADO
                              </span>
                          </td>
                      </tr>
                  </table>
              </div>

              ${downloadLinks.length > 0 ? `
              <!-- Download Links -->
              <div style="margin-bottom: 30px;">
                  <h3 style="color: #333; margin-bottom: 20px; font-size: 18px;">📄 Descarga tus Planos Aprobados</h3>
                  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; border: 1px solid #dee2e6;">
                      ${downloadLinks.map(link => `
                          <div style="display: flex; align-items: center; padding: 15px; background-color: white; border-radius: 6px; margin-bottom: 10px; border: 1px solid #e9ecef; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                              <div style="flex: 1;">
                                  <div style="font-weight: 600; color: #333; margin-bottom: 5px;">${link.name}</div>
                                  <div style="font-size: 12px; color: #666;">
                                      Tamaño: ${link.size} | Subido por: ${link.uploadedBy} | ${link.uploadedAt}
                                  </div>
                              </div>
                              <a href="${link.url}" 
                                 style="background-color: #00830e; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: 600; font-size: 14px; margin-left: 15px;"
                                 download>
                                  Descargar
                              </a>
                          </div>
                      `).join('')}
                  </div>
              </div>
              ` : ''}

              <!-- Action Button -->
              <div style="text-align: center; margin: 40px 0;">
                  <a href="${actionUrl}" 
                     style="background-color: #00830e; 
                            color: white; 
                            text-decoration: none; 
                            padding: 15px 30px; 
                            border-radius: 25px; 
                            font-weight: 600; 
                            font-size: 16px; 
                            display: inline-block; 
                            box-shadow: 0 4px 15px rgba(0,131,14,0.3);
                            transition: transform 0.2s ease;">
                      Ver Solicitud Completa
                  </a>
              </div>

              <!-- Instructions -->
              <div style="background-color: #e8f4f8; padding: 20px; border-radius: 8px; border: 1px solid #bee5eb;">
                  <h4 style="margin: 0 0 10px 0; color: #0c5460;">📋 Próximos Pasos:</h4>
                  <ul style="margin: 0; padding-left: 20px; color: #0c5460;">
                      <li>Descargue todos los planos aprobados usando los enlaces de arriba</li>
                      <li>Guarde una copia de seguridad de los archivos</li>
                      <li>Los planos están listos para su implementación</li>
                      <li>Si necesita modificaciones, deberá crear una nueva solicitud</li>
                  </ul>
              </div>

              <!-- Footer -->
              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee; text-align: center; color: #666;">
                  <p style="margin: 0; font-size: 14px;">
                      <strong>Centro de Convenciones de Costa Rica</strong><br>
                      Sistema de Aprobación de Planos<br>
                      Este es un mensaje automático, por favor no responda a este correo.
                  </p>
              </div>
          </div>
      </div>
  </body>
  </html>
    `;
  }

  // Métodos auxiliares
  formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString) {
    if (!dateString) return 'Fecha no disponible';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha no válida';
    }
  }

  getNotificationTitle(type) {
    const titles = {
      [NOTIFICATION_TYPES.NEW_REQUEST]: '📋 Nueva Solicitud de Aprobación',
      [NOTIFICATION_TYPES.STATUS_UPDATE]: '🔄 Actualización de Estado',
      [NOTIFICATION_TYPES.APPROVAL]: '✅ Solicitud Aprobada',
      [NOTIFICATION_TYPES.REJECTION]: '❌ Solicitud Rechazada',
      [NOTIFICATION_TYPES.COMMENT_ADDED]: '💬 Nuevo Comentario',
      [NOTIFICATION_TYPES.DOCUMENT_UPDATED]: '📄 Documentos Actualizados',
      [NOTIFICATION_TYPES.APPROVAL_FLOW_STARTED]: '🚀 Proceso de Aprobación Iniciado',
      [NOTIFICATION_TYPES.FINAL_APPROVAL_COMPLETED]: '🎉 ¡Solicitud Completamente Aprobada!'
    };
    return titles[type] || '📢 Notificación del Sistema';
  }

  getStatusText(status) {
    const statusMap = {
      'pending': 'Pendiente',
      'in_review': 'En Revisión',
      'approved': 'Aprobado',
      'rejected': 'Rechazado',
      'requires_changes': 'Requiere Cambios'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status) {
    const colorMap = {
      'pending': '#f39c12',
      'in_review': '#3498db',
      'approved': '#27ae60',
      'rejected': '#e74c3c',
      'requires_changes': '#e67e22'
    };
    return colorMap[status] || '#95a5a6';
  }

  getNotificationTypeByStatus(status) {
    if (status === 'approved') return NOTIFICATION_TYPES.APPROVAL;
    if (status === 'rejected') return NOTIFICATION_TYPES.REJECTION;
    return NOTIFICATION_TYPES.STATUS_UPDATE;
  }
  darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  }
}

// Crear instancia singleton
const emailNotificationService = new EmailNotificationService();
export default emailNotificationService;
