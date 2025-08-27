import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

const LayoutWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.background};
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: ${props => props.theme.spacing.lg};
  min-height: calc(100vh - 120px); /* Account for header and footer */
  transition: margin-left 0.3s ease;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing.md};
    margin-left: 0 !important;
  }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing.sm};
  }

  /* Add subtle field pattern to background on larger screens */
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    background-image: 
      linear-gradient(90deg, rgba(46, 204, 64, 0.01) 50%, transparent 50%),
      linear-gradient(rgba(46, 204, 64, 0.01) 50%, transparent 50%);
    background-size: 40px 40px;
  }
`;

const SidebarOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: ${props => props.theme.zIndex.modalBackdrop};
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const Layout = ({ children, showSidebar = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { isAuthenticated, userType } = useAuth();
  const { theme } = useTheme();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  const closeMobileNav = () => {
    setMobileNavOpen(false);
  };

  // Show sidebar for authenticated venue owners and admins
  const shouldShowSidebar = showSidebar || (isAuthenticated && (userType === 'venue_owner' || userType === 'admin'));

  return (
    <LayoutWrapper theme={theme}>
      <Header 
        onToggleSidebar={toggleSidebar}
        onToggleMobileNav={toggleMobileNav}
        showSidebarToggle={shouldShowSidebar}
      />
      
      <MainContent>
        {shouldShowSidebar && (
          <>
            <Sidebar 
              isOpen={sidebarOpen}
              onClose={closeSidebar}
              userType={userType}
            />
            <SidebarOverlay 
              isOpen={sidebarOpen} 
              onClick={closeSidebar}
              theme={theme}
            />
          </>
        )}
        
        <ContentArea 
          theme={theme}
          style={{
            marginLeft: shouldShowSidebar && sidebarOpen ? '280px' : '0'
          }}
        >
          {children}
        </ContentArea>
      </MainContent>

      {/* Mobile Navigation */}
      <MobileNav 
        isOpen={mobileNavOpen}
        onClose={closeMobileNav}
        userType={userType}
        isAuthenticated={isAuthenticated}
      />
      
      <Footer />
    </LayoutWrapper>
  );
};

export default Layout;
