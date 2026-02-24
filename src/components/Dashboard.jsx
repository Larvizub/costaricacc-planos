import React, { useState } from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';
import { theme } from '../styles/GlobalStyles';

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${theme.colors.background};
`;

const DashboardContent = styled.main`
  flex: 1;
  margin-left: 250px;
  display: flex;
  flex-direction: column;
  
  @media (max-width: ${theme.breakpoints.md}) {
    margin-left: 0;
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding-bottom: calc(${theme.spacing.lg} + 96px + env(safe-area-inset-bottom, 0px));
  }
`;

const Dashboard = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${theme.breakpoints.sm})`);
    const handler = (e) => setIsMobile(e.matches);
    handler(mq);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  
  return (
    <DashboardContainer>
      {!isMobile && <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />}
      
      <DashboardContent>
        <Header toggleSidebar={toggleSidebar} />
        
        <MainContent>
          {children}
        </MainContent>
        
        <Footer />
        <BottomNav />
      </DashboardContent>
    </DashboardContainer>
  );
};

export default Dashboard;
