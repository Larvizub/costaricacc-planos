/**
 * Utilidades para validación de datos en la aplicación
 */

/**
 * Valida si un email tiene formato válido
 * @param {string} email - Email a validar
 * @returns {boolean} true si el email es válido
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida si una contraseña cumple los requisitos mínimos
 * @param {string} password - Contraseña a validar
 * @returns {object} Resultado de la validación con mensaje
 */
export const validatePassword = (password) => {
  if (!password) {
    return { 
      isValid: false, 
      message: 'La contraseña es requerida' 
    };
  }
  
  if (password.length < 8) {
    return { 
      isValid: false, 
      message: 'La contraseña debe tener al menos 8 caracteres' 
    };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { 
      isValid: false, 
      message: 'La contraseña debe contener al menos una letra mayúscula' 
    };
  }
  
  if (!/[a-z]/.test(password)) {
    return { 
      isValid: false, 
      message: 'La contraseña debe contener al menos una letra minúscula' 
    };
  }
  
  if (!/[0-9]/.test(password)) {
    return { 
      isValid: false, 
      message: 'La contraseña debe contener al menos un número' 
    };
  }
  
  return { 
    isValid: true, 
    message: 'Contraseña válida' 
  };
};

/**
 * Valida si un número de teléfono tiene formato válido
 * @param {string} phone - Número de teléfono a validar
 * @returns {boolean} true si el número es válido
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  
  // Eliminar espacios, guiones y paréntesis
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  
  // Validar que solo contiene números y tiene una longitud apropiada (8-12 dígitos)
  return /^\d{8,12}$/.test(cleanPhone);
};

/**
 * Valida si una fecha está en el futuro
 * @param {string|Date} date - Fecha a validar
 * @returns {boolean} true si la fecha está en el futuro
 */
export const isFutureDate = (date) => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  const today = new Date();
  
  // Resetear horas, minutos, segundos para comparar solo fechas
  today.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);
  
  return dateObj > today;
};

/**
 * Valida si un valor es un número positivo
 * @param {number|string} value - Valor a validar
 * @returns {boolean} true si es un número positivo
 */
export const isPositiveNumber = (value) => {
  if (value === null || value === undefined || value === '') return false;
  
  const number = Number(value);
  return !isNaN(number) && number > 0;
};
