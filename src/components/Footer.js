import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import Logo from './Logo';
import { theme } from '../styles/GlobalStyles';

const FooterContainer = styled.footer`
  background-color: ${theme.colors.primary};
  color: #fff;
  padding: ${theme.spacing.lg} 0;
  margin-top: auto;
  width: 100%; /* Asegurar que ocupe todo el ancho disponible */
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.xl};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.xl};
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const FooterLogo = styled.div`
  margin-bottom: ${theme.spacing.md};
  
  img {
    max-width: 180px;
    height: auto;
  }
`;

const FooterTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: ${theme.spacing.md};
  font-weight: 600;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 2px;
    background-color: ${theme.colors.accent};
  }
`;

const FooterText = styled.p`
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: ${theme.spacing.md};
`;

const FooterLink = styled(Link)`
  color: #fff;
  margin-bottom: ${theme.spacing.sm};
  font-size: 0.9rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${theme.colors.accent};
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
  text-align: center;
  font-size: 0.85rem;
  width: 100%; /* Asegurar que el borde inferior ocupe todo el ancho */
  max-width: 1200px;
  margin: ${theme.spacing.lg} auto 0;
  padding: ${theme.spacing.md} ${theme.spacing.xl} 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    text-align: center;
    
    & > * {
      width: 100%;
    }
  }
`;

const FooterCopyright = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterLogo>
            <Logo width="180px" variant="white" />
          </FooterLogo>
          <FooterTitle>Sobre nosotros</FooterTitle>
          <FooterText>
            El Centro de Convenciones de Costa Rica ofrece esta plataforma para facilitar
            la gestión de planos de eventos, optimizando la comunicación entre departamentos
            y mejorando la eficiencia operativa.
          </FooterText>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Enlaces rápidos</FooterTitle>
          <FooterLink to="/">Inicio</FooterLink>
          <FooterLink to="/solicitudes">Solicitudes</FooterLink>
          <FooterLink to="/planos">Planos</FooterLink>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Contacto</FooterTitle>
          <FooterText>
            Centro de Convenciones de Costa Rica<br />
            Departamento de Areas y Sostenibilidad<br />
            Tel: (506) 8316 2816<br />
            Email: silvia.navarro@costaricacc.com
          </FooterText>
        </FooterSection>
      </FooterContent>
      
      <FooterBottom>
        <FooterCopyright>
          <Logo width="24px" variant="white" style={{ marginRight: theme.spacing.sm }} />
          &copy; {currentYear} Centro de Convenciones de Costa Rica
        </FooterCopyright>
        <div>
          Hecho con <FaHeart style={{ color: theme.colors.accent, margin: '0 4px' }} /> para mejorar nuestros servicios
        </div>
      </FooterBottom>
    </FooterContainer>
  );
};

export default Footer;
