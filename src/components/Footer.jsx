import React from 'react';
import styled from 'styled-components';
import { FaHeart } from 'react-icons/fa';
import Logo from './Logo';
import { theme } from '../styles/GlobalStyles';

const FooterContainer = styled.footer`
  background-color: ${theme.colors.primary};
  color: #fff;
  padding: ${theme.spacing.md} 0;
  margin-top: auto;
  width: 100%;
`;

const FooterBottom = styled.div`
  padding-top: ${theme.spacing.xs};
  text-align: center;
  font-size: 0.85rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.xl};
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
