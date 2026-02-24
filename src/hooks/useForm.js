import { useState } from 'react';

/**
 * Hook personalizado para manejar formularios
 * @param {object} initialValues - Valores iniciales del formulario
 * @param {function} onSubmit - Función a ejecutar al enviar el formulario
 * @param {function} validateForm - Función de validación (opcional)
 * @returns {object} Métodos y estado del formulario
 */
const useForm = (initialValues, onSubmit, validateForm) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  /**
   * Maneja el cambio en un campo del formulario
   * @param {Event|string} eventOrField - Evento o nombre del campo
   * @param {any} value - Valor (solo se usa si el primer parámetro es string)
   */
  const handleChange = (eventOrField, value) => {
    if (typeof eventOrField === 'string') {
      setValues(prevValues => ({
        ...prevValues,
        [eventOrField]: value
      }));
    } else {
      const { name, value: fieldValue, type, checked } = eventOrField.target;
      setValues(prevValues => ({
        ...prevValues,
        [name]: type === 'checkbox' ? checked : fieldValue
      }));
    }
  };

  /**
   * Maneja el evento blur (salida del foco) de un campo
   * @param {Event} event - Evento blur
   */
  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true
    }));
    
    if (validateForm) {
      const validationErrors = validateForm(values);
      setErrors(validationErrors);
    }
  };

  /**
   * Maneja el envío del formulario
   * @param {Event} event - Evento submit
   */
  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    
    let validationErrors = {};
    if (validateForm) {
      validationErrors = validateForm(values);
      setErrors(validationErrors);
    }
    
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Error en envío de formulario:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  /**
   * Restablece el formulario a sus valores iniciales
   */
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  /**
   * Establece múltiples valores en el formulario
   * @param {object} newValues - Nuevos valores a establecer
   */
  const setMultipleValues = (newValues) => {
    setValues(prevValues => ({
      ...prevValues,
      ...newValues
    }));
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues: setMultipleValues
  };
};

export default useForm;
