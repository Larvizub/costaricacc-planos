import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { useEmailNotifications } from '../hooks/useEmailNotifications';
import { APPROVAL_AREAS } from '../config/emailConfig';

export const EmailNotificationSettings = () => {
  const [showTestModal, setShowTestModal] = useState(false);
  const [areaEmails, setAreaEmails] = useState(APPROVAL_AREAS);
  const [editingArea, setEditingArea] = useState(null);
  const [testEmail, setTestEmail] = useState('');
  
  const { loading, testEmailConfiguration } = useEmailNotifications();





  const handleAreaEmailsChange = (areaKey, newEmails) => {
    setAreaEmails(prev => ({
      ...prev,
      [areaKey]: {
        ...prev[areaKey],
        emails: newEmails
      }
    }));
  };

  const addEmailToArea = (areaKey, email) => {
    if (!email || !email.includes('@')) return;
    
    const currentEmails = areaEmails[areaKey].emails;
    if (!currentEmails.includes(email)) {
      handleAreaEmailsChange(areaKey, [...currentEmails, email]);
    }
  };

  const removeEmailFromArea = (areaKey, emailToRemove) => {
    const currentEmails = areaEmails[areaKey].emails;
    handleAreaEmailsChange(areaKey, currentEmails.filter(email => email !== emailToRemove));
  };

  const handleTestEmail = async () => {
    try {
      await testEmailConfiguration();
      setShowTestModal(false);
    } catch (error) {
      console.error('Error en prueba de correo:', error);
    }
  };



  return (
    <div className="space-y-6">


      {/* Configuración de Áreas y Correos */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="bg-purple-100 text-purple-800 p-2 rounded-lg mr-3">
              📋
            </span>
            Áreas de Aprobación y Correos
          </h3>

          <div className="space-y-4">
            {Object.entries(areaEmails).map(([areaKey, area]) => (
              <div
                key={areaKey}
                className="border border-gray-200 rounded-lg p-4"
                style={{ borderLeftColor: area.color, borderLeftWidth: '4px' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <span 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: area.color }}
                    ></span>
                    {area.name}
                  </h4>
                  <Button
                    onClick={() => setEditingArea(areaKey)}
                    variant="outline"
                    size="sm"
                  >
                    ✏️ Editar
                  </Button>
                </div>

                <div className="space-y-2">
                  {area.emails.map((email, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span className="text-sm text-gray-700">{email}</span>
                      <Button
                        onClick={() => removeEmailFromArea(areaKey, email)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </Button>
                    </div>
                  ))}
                </div>

                {editingArea === areaKey && (
                  <div className="mt-3 flex gap-2">
                    <Input
                      placeholder="nuevo@correo.com"
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addEmailToArea(areaKey, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <Button
                      onClick={() => setEditingArea(null)}
                      variant="outline"
                      size="sm"
                    >
                      ✅
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Modal de Prueba */}
      {showTestModal && (
        <Modal
          isOpen={showTestModal}
          onClose={() => setShowTestModal(false)}
          title="Probar Configuración de Correo"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Se enviará un correo de prueba para verificar que la configuración funciona correctamente.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo de prueba (opcional)
              </label>
              <Input
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@ejemplo.com"
                type="email"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Si no especifica un correo, se usará el primer correo del área de Arquitectura
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleTestEmail}
                variant="primary"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Enviando...' : '📧 Enviar Prueba'}
              </Button>
              <Button
                onClick={() => setShowTestModal(false)}
                variant="outline"
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
