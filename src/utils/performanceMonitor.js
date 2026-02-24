/**
 * Utilidades para monitorear el rendimiento de las solicitudes
 */

// Almacén de métricas de rendimiento
const performanceMetrics = {
  operations: {},
  requests: []
};

/**
 * Mide el tiempo de ejecución de una función
 * @param {string} operationName - Nombre de la operación
 * @param {Function} fn - Función a ejecutar
 * @param {Array} args - Argumentos para la función
 * @returns {Promise<any>} - Resultado de la función
 */
export const measureOperationTime = async (operationName, fn, ...args) => {
  const startTime = performance.now();
  try {
    const result = await fn(...args);
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Registrar métrica
    if (!performanceMetrics.operations[operationName]) {
      performanceMetrics.operations[operationName] = {
        calls: 0,
        totalDuration: 0,
        averageDuration: 0,
        maxDuration: 0
      };
    }
    
    const metric = performanceMetrics.operations[operationName];
    metric.calls += 1;
    metric.totalDuration += duration;
    metric.averageDuration = metric.totalDuration / metric.calls;
    metric.maxDuration = Math.max(metric.maxDuration, duration);
    
    if (duration > 2000) {
      console.warn(`Operación lenta detectada: ${operationName} (${Math.round(duration)}ms)`);
    }
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    console.error(`Error en operación ${operationName} (${Math.round(endTime - startTime)}ms):`, error);
    throw error;
  }
};

/**
 * Obtiene un reporte de rendimiento
 * @returns {Object} - Reporte de métricas de rendimiento
 */
export const getPerformanceReport = () => {
  return {
    ...performanceMetrics,
    timestamp: new Date().toISOString()
  };
};

/**
 * Identifica cuellos de botella en el rendimiento
 * @returns {Array} - Lista de operaciones lentas
 */
export const identifyBottlenecks = () => {
  const bottlenecks = [];
  for (const [operation, metrics] of Object.entries(performanceMetrics.operations)) {
    if (metrics.averageDuration > 1000 || metrics.maxDuration > 3000) {
      bottlenecks.push({
        operation,
        averageDuration: Math.round(metrics.averageDuration),
        maxDuration: Math.round(metrics.maxDuration),
        calls: metrics.calls
      });
    }
  }
  return bottlenecks;
};

export default {
  measureOperationTime,
  getPerformanceReport,
  identifyBottlenecks
};
