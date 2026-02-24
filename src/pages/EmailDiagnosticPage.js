import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import emailNotificationService from '../services/emailNotificationService';
import { APPROVAL_AREAS } from '../config/emailConfig';

const EmailDiagnosticPage = () => {
  //
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);



  const testNewRequestNotification = async () => {
    setLoading(true);
    const testData = {
      requestId: 'TEST-' + Date.now(),
      projectName: 'Proyecto de Prueba - Nueva Solicitud',
      applicantName: 'Usuario de Prueba',
      applicantEmail: 'test@centrodeconvencionescr.com',
      status: 'pending',
      approvalAreas: ['areas_sostenibilidad']
    };

    try {
      const result = await emailNotificationService.notifyNewRequest(testData);
      setTestResults(prev => [...prev, {
        type: 'Nueva Solicitud',
        success: true,
        result,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      setTestResults(prev => [...prev, {
        type: 'Nueva Solicitud',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }]);
    }
    setLoading(false);
  };

  const testStatusUpdateNotification = async () => {
    setLoading(true);
    const testData = {
      requestId: 'TEST-' + Date.now(),
      projectName: 'Proyecto de Prueba - Cambio Estado',
      applicantName: 'Usuario de Prueba',
      applicantEmail: 'test@centrodeconvencionescr.com',
      status: 'approved',
      message: 'Aprobado por Usuario Test del área Áreas y Sostenibilidad',
      approvalAreas: ['areas_sostenibilidad']
    };

    try {
      const result = await emailNotificationService.notifyStatusUpdate(testData, 'pending');
      setTestResults(prev => [...prev, {
        type: 'Cambio de Estado',
        success: true,
        result,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      setTestResults(prev => [...prev, {
        type: 'Cambio de Estado',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }]);
    }
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };


  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🔧 Diagnóstico de Notificaciones por Correo</h1>
      
      {/* Configuración */}
      <Card>
        <h2>📋 Áreas de Aprobación</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {Object.entries(APPROVAL_AREAS).map(([key, area]) => (
            <div key={key} style={{ marginBottom: '10px' }}>
              <strong>{area.name}:</strong>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {area.emails.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Pruebas */}
      <Card>
        <h2>🧪 Pruebas de Notificación</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <Button 
            onClick={testNewRequestNotification}
            disabled={loading}
            style={{ background: '#3498db' }}
          >
            {loading ? 'Enviando...' : 'Probar Nueva Solicitud'}
          </Button>
          <Button 
            onClick={testStatusUpdateNotification}
            disabled={loading}
            style={{ background: '#27ae60' }}
          >
            {loading ? 'Enviando...' : 'Probar Cambio de Estado'}
          </Button>
          <Button 
            onClick={clearResults}
            style={{ background: '#95a5a6' }}
          >
            Limpiar Resultados
          </Button>
        </div>

        {/* Resultados */}
        {testResults.length > 0 && (
          <div>
            <h3>📊 Resultados de Pruebas</h3>
            {testResults.map((result, index) => (
              <div key={index} style={{
                padding: '15px',
                margin: '10px 0',
                borderRadius: '8px',
                background: result.success ? '#d4edda' : '#f8d7da',
                border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{result.success ? '✅' : '❌'} {result.type}</strong>
                  <small>{new Date(result.timestamp).toLocaleString()}</small>
                </div>
                
                {result.success ? (
                  <div style={{ marginTop: '10px' }}>
                    <p><strong>Emails enviados:</strong> {result.result?.length || 0}</p>
                    {result.result && result.result.length > 0 && (
                      <details>
                        <summary>Ver detalles</summary>
                        <pre style={{ fontSize: '12px', background: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
                          {JSON.stringify(result.result, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ) : (
                  <div style={{ marginTop: '10px', color: '#721c24' }}>
                    <strong>Error:</strong> {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Información adicional */}
      <Card>
        <h2>ℹ️ Información de Diagnóstico</h2>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <h3>¿Qué hace esta página?</h3>
          <ul>
            <li>Prueba el envío de correos para nuevas solicitudes</li>
            <li>Prueba el envío de correos para cambios de estado</li>
            <li>Muestra los emails configurados para cada área de aprobación</li>
          </ul>
          
          <h3>Si las pruebas fallan:</h3>
          <ol>
            <li>Verifica que las variables de entorno en <code>.env</code> sean correctas</li>
            <li>Reinicia el servidor de desarrollo (<code>npm start</code>)</li>
            <li>Verifica la configuración del template de notificación</li>
            <li>Revisa la consola del navegador para errores específicos</li>
          </ol>
        </div>
      </Card>
    </div>
  );
};

export default EmailDiagnosticPage;
