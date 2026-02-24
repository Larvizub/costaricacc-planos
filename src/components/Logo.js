import React from 'react';

// Componente Logo
const Logo = ({ variant = 'default', width, className }) => {
  const logoUrl = 'https://costaricacc.com/cccr/Logocccr.png';
  
  // Estilo condicional basado en la variante
  const getStyle = () => {
    const baseStyle = {
      width: width || 'auto',
      height: 'auto',
      maxWidth: '100%'
    };
    
    if (variant === 'white') {
      return {
        ...baseStyle,
        filter: 'brightness(0) invert(1)'
      };
    }
    
    return baseStyle;
  };
  
  return (
    <img 
      src={logoUrl} 
      alt="Centro de Convenciones de Costa Rica" 
      style={getStyle()}
      className={className}
    />
  );
};

export default Logo;
