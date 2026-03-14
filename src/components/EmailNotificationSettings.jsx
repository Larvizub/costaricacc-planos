import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { useEmailNotifications } from '../hooks/useEmailNotifications';

export const EmailNotificationSettings = () => {
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  
  const { loading, testEmailConfiguration } = useEmailNotifications();

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
            Grupos de Aprobación
          </h3>

          <p className="text-sm text-gray-700">
            Los destinatarios de aprobación se calculan dinámicamente desde los usuarios que tengan asignado el grupo correspondiente en <strong>userGroups</strong>.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Para modificar quién recibe correos, edita los grupos de aprobación en la administración de usuarios.
          </p>
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
