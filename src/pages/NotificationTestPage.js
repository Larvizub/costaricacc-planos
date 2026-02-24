import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import emailNotificationService from '../services/emailNotificationService';
import { APPROVAL_AREAS } from '../config/emailConfig';

const NotificationTestPage = () => {
  const [logs, setLogs] = useState([]);
  const [testing, setTesting] = useState(false);
  //

  useEffect(() => {
    // Interceptar console.log para capturar logs del servicio de notificaciones
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const logEntry = (level, ...args) => {
      const message = args.join(' ');
      const timestamp = new Date().toISOString();
      
      // Solo capturar logs relacionados con emails o notificaciones
      if (message.toLowerCase().includes('email') || 
          message.toLowerCase().includes('notif') ||
          message.toLowerCase().includes('correo') ||
          message.includes('📧') || 
          message.includes('✅') || 
          message.includes('❌')) {
        
        setLogs(prev => [...prev, {
          timestamp,
          level,
          message,
          args
        }]);
      }
    };

    console.log = (...args) => {
      logEntry('log', ...args);
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      logEntry('error', ...args);
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      logEntry('warn', ...args);
      originalWarn.apply(console, args);
    };

    // Cleanup
    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const testStatusUpdateNotification = async () => {
    setTesting(true);
    
    const testData = {
      requestId: 'TEST-' + Date.now(),
      projectName: 'Evento de Prueba - Notificaciones',
      applicantName: 'Usuario Test',
      applicantEmail: 'usuario.solicitante@centrodeconvencionescr.com', // Cambia aquí por el correo real de prueba
      status: 'approved',
      message: 'Aprobado por Usuario Test del área Áreas y Sostenibilidad',
      approvalAreas: ['areas_sostenibilidad']
    };

    try {
      console.log('🧪 Iniciando prueba de notificación de cambio de estado');
      const result = await emailNotificationService.notifyStatusUpdate(testData, 'pending');
      console.log('🎉 Prueba completada:', result);
    } catch (error) {
      console.error('❌ Error en la prueba:', error);
    }
    
    setTesting(false);
  };

  const testNewRequestNotification = async () => {
    setTesting(true);
    
    const testData = {
      requestId: 'TEST-NEW-' + Date.now(),
      projectName: 'Nueva Solicitud de Prueba',
      applicantName: 'Usuario Test',
      applicantEmail: 'usuario.solicitante@centrodeconvencionescr.com', // Cambia aquí por el correo real de prueba
      status: 'pending',
      approvalAreas: ['areas_sostenibilidad']
    };

    try {
      console.log('🧪 Iniciando prueba de notificación de nueva solicitud');
      const result = await emailNotificationService.notifyNewRequest(testData);
      console.log('🎉 Prueba completada:', result);
    } catch (error) {
      console.error('❌ Error en la prueba:', error);
    }
    
    setTesting(false);
  };

  const testWithMockApprovalFlow = async () => {
    setTesting(true);
    
    try {
      console.log('🎭 Simulando flujo completo de aprobación...');
      
      // Simular datos como los que vienen del servicio de solicitudes
      const mockSolicitudData = {
        id: 'MOCK-' + Date.now(),
        nombreEvento: 'Concierto de Prueba',
        nombreCompleto: 'Juan Pérez Solicitante',
        email: 'juan.perez@test.com',
        createdByName: 'Juan Pérez',
        createdByEmail: 'juan.perez@test.com',
        serviciosContratados: ['audiovisuales', 'gastronomia'],
        status: 'pending'
      };

      const mockUserData = {
        name: 'María García',
        email: 'maria.garcia@centrodeconvencionescr.com'
      };

      const mockGroupInfo = {
        id: 'areas_sostenibilidad',
        name: 'Áreas y Sostenibilidad'
      };

      // Simular exactamente lo que hace updateApprovalStatus
      console.log('📋 Datos de simulación:', {
        solicitud: mockSolicitudData,
        usuario: mockUserData,
        grupo: mockGroupInfo
      });

      const notificationData = {
        requestId: mockSolicitudData.id,
        projectName: mockSolicitudData.nombreEvento || 'Proyecto sin nombre',
        applicantName: mockSolicitudData.createdByName || 'Solicitante',
        applicantEmail: mockSolicitudData.email || mockSolicitudData.createdByEmail || '',
        status: 'approved',
        message: `Aprobado por ${mockUserData.name || mockUserData.email} del área ${mockGroupInfo.name}`,
        approvalAreas: ['areas_sostenibilidad']
      };

      console.log('📧 Datos para notificación:', notificationData);

      const result = await emailNotificationService.notifyStatusUpdate(notificationData, 'pending');
      console.log('🎉 Simulación completada:', result);

    } catch (error) {
      console.error('❌ Error en la simulación:', error);
    }
    
    setTesting(false);
  };

  const getLogColor = (level) => {
    switch(level) {
      case 'error': return '#dc3545';
      case 'warn': return '#ffc107';
      default: return '#333';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🧪 Pruebas de Notificaciones por Correo</h1>
      
      {/* Controles de prueba */}
      <Card>
        <h2>🎮 Controles de Prueba</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <Button 
            onClick={testStatusUpdateNotification}
            disabled={testing}
            style={{ background: '#28a745' }}
          >
            {testing ? 'Probando...' : 'Probar Cambio de Estado'}
          </Button>
          
          <Button 
            onClick={testNewRequestNotification}
            disabled={testing}
            style={{ background: '#007bff' }}
          >
            {testing ? 'Probando...' : 'Probar Nueva Solicitud'}
          </Button>
          
          <Button 
            onClick={testWithMockApprovalFlow}
            disabled={testing}
            style={{ background: '#6f42c1' }}
          >
            {testing ? 'Probando...' : 'Simular Flujo Completo'}
          </Button>
          
          <Button 
            onClick={clearLogs}
            style={{ background: '#6c757d' }}
          >
            Limpiar Logs
          </Button>
        </div>
        
        <div style={{ fontSize: '14px', color: '#666' }}>
          <p><strong>Cambio de Estado:</strong> Simula cuando un usuario aprueba/rechaza una solicitud</p>
          <p><strong>Nueva Solicitud:</strong> Simula cuando se crea una nueva solicitud</p>
          <p><strong>Flujo Completo:</strong> Simula exactamente los datos que se usan en el sistema real</p>
        </div>
      </Card>

      {/* Configuración actual */}
      <Card>
        <h2>⚙️ Configuración Actual</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <h3>Áreas de Notificación</h3>
            {Object.entries(APPROVAL_AREAS).map(([key, area]) => (
              <div key={key} style={{ marginBottom: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
                <strong style={{ color: area.color }}>{area.name}</strong>
                <div style={{ fontSize: '12px', marginTop: '5px' }}>
                  {area.emails.map((email, index) => (
                    <div key={index}>📧 {email}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          

        </div>
      </Card>

      {/* Logs en tiempo real */}
      <Card>
        <h2>📜 Logs en Tiempo Real</h2>
        <div style={{ 
          background: '#1e1e1e', 
          color: '#fff', 
          padding: '15px', 
          borderRadius: '4px', 
          height: '400px', 
          overflow: 'auto',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {logs.length === 0 ? (
            <div style={{ color: '#888' }}>Esperando logs... Ejecuta una prueba para ver la actividad.</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                <span style={{ color: '#666' }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span style={{ color: getLogColor(log.level), marginLeft: '5px' }}>{log.message}</span>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Instrucciones */}
      <Card>
        <h2>📖 Instrucciones de Uso</h2>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <ol>
            <li>Ejecuta una de las pruebas usando los botones de arriba</li>
            <li>Observa los logs en tiempo real para ver qué está pasando</li>
            <li>Revisa la consola del navegador (F12) para logs adicionales</li>
            <li>Si hay errores, aparecerán en rojo en los logs</li>
            <li>Los correos exitosos aparecerán en verde</li>
          </ol>
          
          <h3>Posibles Problemas:</h3>
          <ul>
            <li><strong>Error de inicialización:</strong> Verifica que las variables de entorno estén correctas</li>
            <li><strong>Error de template:</strong> Verifica que el template de notificación esté configurado correctamente</li>
            <li><strong>Error de red:</strong> Problemas de conectividad con el backend de email</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default NotificationTestPage;
