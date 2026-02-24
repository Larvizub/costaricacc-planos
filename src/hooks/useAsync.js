import { useState, useCallback } from 'react';

/**
 * Hook para manejar operaciones asíncronas con estado de carga y errores
 * @returns {object} Métodos y estado de la operación asíncrona
 */
const useAsync = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * Ejecuta una función asíncrona manejando los estados de carga y error
   * @param {function} asyncFunction - Función asíncrona a ejecutar
   * @param {array} args - Argumentos para la función
   * @returns {Promise<any>} Resultado de la función asíncrona
   */
  const execute = useCallback(async (asyncFunction, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction(...args);
      setData(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Restablece los estados a sus valores iniciales
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset
  };
};

export default useAsync;
