import { useState, useCallback } from 'react';
import emailNotificationService from '../services/emailNotificationService';
import { APPROVAL_AREAS } from '../config/emailConfig';

export const useEmailNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const sendNotification = useCallback(async (type, data, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      switch (type) {
        case 'newRequest':
          result = await emailNotificationService.notifyNewRequest(data);
          break;
          
        case 'statusUpdate':
          result = await emailNotificationService.notifyStatusUpdate(
            data, 
            options.previousStatus
          );
          break;
          
        case 'newComment':
          result = await emailNotificationService.notifyNewComment(
            data, 
            options.comment
          );
          break;
          
        case 'custom':
          result = await emailNotificationService.sendNotificationToAreas(
            data,
            options.notificationType,
            options.areas || Object.keys(APPROVAL_AREAS)
          );
          break;
          
        default:
          throw new Error(`Tipo de notificación no válido: ${type}`);
      }
      
      setLastResult(result);
      return result;
      
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendDirectEmail = useCallback(async (emailData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await emailNotificationService.sendNotificationEmail(emailData);
      setLastResult([{ success: true, result }]);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const testEmailConfiguration = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const testData = {
        requestId: 'TEST-001',
        projectName: 'Proyecto de Prueba',
        applicantName: 'Usuario de Prueba',
        applicantEmail: 'test@example.com',
        status: 'pending',
        message: 'Este es un correo de prueba del sistema de notificaciones.',
        recipientEmail: 'test@example.com',
        areaName: 'Pruebas',
        areaKey: 'arquitectura',
        notificationType: 'nueva_solicitud'
      };
      
      const result = await emailNotificationService.sendNotificationEmail(testData);
      setLastResult([{ success: true, result }]);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getNotificationStats = useCallback(() => {
    if (!lastResult) return null;
    
    const successful = lastResult.filter(r => r.success).length;
    const failed = lastResult.filter(r => !r.success).length;
    
    return {
      total: lastResult.length,
      successful,
      failed,
      successRate: (successful / lastResult.length) * 100
    };
  }, [lastResult]);

  return {
    loading,
    error,
    lastResult,
    sendNotification,
    sendDirectEmail,
    testEmailConfiguration,
    getNotificationStats
  };
};
