/**
 * Utilidad para probar la subida de archivos y diagnosticar problemas
 */

// Función para validar archivos (copia de la lógica del FileUploader)
export const validateFile = (file, accept = '*/*', maxSize = 10) => {
  // Verificar tamaño
  if (file.size > maxSize * 1024 * 1024) {
    return {
      isValid: false,
      message: `El archivo excede el tamaño máximo de ${maxSize} MB`
    };
  }
  
  // Verificar tipo si se especificó
  if (accept !== '*/*') {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const acceptTypes = accept.split(',').map(type => type.trim());
    
    console.log('Validando archivo:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      acceptTypes
    });
    
    // Si no coincide con ninguno de los tipos aceptados
    if (!acceptTypes.some(type => {
      if (type.includes('*')) {
        const baseMimeType = type.split('/')[0];
        const matches = fileType.startsWith(baseMimeType);
        console.log(`Comparando tipo MIME wildcard: ${type} vs ${fileType} = ${matches}`);
        return matches;
      }
      // Si el tipo comienza con punto, es una extensión
      if (type.startsWith('.')) {
        const matches = fileName.endsWith(type.toLowerCase());
        console.log(`Comparando extensión: ${type} vs ${fileName} = ${matches}`);
        return matches;
      }
      // Si no, es un tipo MIME
      const matches = type === fileType;
      console.log(`Comparando tipo MIME exacto: ${type} vs ${fileType} = ${matches}`);
      return matches;
    })) {
      return {
        isValid: false,
        message: `Tipo de archivo no permitido. Archivos permitidos: ${accept.replace(/\./g, '').toUpperCase()}`
      };
    }
  }
  
  return { isValid: true };
};

// Función para diagnosticar problemas con archivos PDF
export const diagnosePDFUpload = (file) => {
  console.log('=== DIAGNÓSTICO DE ARCHIVO PDF ===');
  console.log('Nombre del archivo:', file.name);
  console.log('Tipo MIME:', file.type);
  console.log('Tamaño:', file.size, 'bytes (', (file.size / (1024 * 1024)).toFixed(2), 'MB)');
  console.log('Extensión:', file.name.split('.').pop().toLowerCase());
  
  // Probar diferentes configuraciones de accept
  const testConfigs = [
    { accept: '.pdf', maxSize: 20 },
    { accept: 'application/pdf', maxSize: 20 },
    { accept: '.pdf,.dwg,.dxf,.jpg,.jpeg,.png', maxSize: 20 },
    { accept: 'application/pdf,image/*', maxSize: 20 }
  ];
  
  testConfigs.forEach((config, index) => {
    const result = validateFile(file, config.accept, config.maxSize);
    console.log(`Test ${index + 1} (accept: "${config.accept}"):`, result);
  });
  
  console.log('=== FIN DEL DIAGNÓSTICO ===');
};

// Función para verificar si el navegador soporta File API
export const checkFileAPISupport = () => {
  const support = {
    File: typeof File !== 'undefined',
    FileReader: typeof FileReader !== 'undefined',
    FileList: typeof FileList !== 'undefined',
    Blob: typeof Blob !== 'undefined'
  };
  
  console.log('Soporte de File API:', support);
  return Object.values(support).every(Boolean);
};
