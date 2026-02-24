import React from 'react';
import styled from 'styled-components';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';
import { theme } from '../styles/GlobalStyles';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${theme.colors.background};
  width: 100%; /* Asegurar ancho completo */
  overflow-x: hidden; /* Prevenir scroll horizontal */
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%; /* Ocupar todo el ancho */
  align-items: center;
`;

const ContentWrapper = styled.div`
  flex: 1;
  width: 100%;
  max-width: 1200px;
  padding: ${theme.spacing.lg};
  margin: 0 auto;
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing.md};
    max-width: 100%;
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing.sm};
    padding-bottom: calc(${theme.spacing.sm} + 104px + env(safe-area-inset-bottom, 0px));
  }
`;

const PageTitle = styled.h1`
  margin-top: 0;
  margin-bottom: ${theme.spacing.lg};
  color: ${theme.colors.text};
  font-size: 1.8rem;
  text-align: center;
  width: 100%;
`;

const Layout = ({ children, title }) => {
  return (
    <LayoutContainer>
      <Navbar />
      
      <MainContent>
        <ContentWrapper>
          {title && <PageTitle>{title}</PageTitle>}
          {children}
        </ContentWrapper>
      </MainContent>

      <BottomNav />
      
      <Footer />
    </LayoutContainer>
  );
};

export default Layout;
