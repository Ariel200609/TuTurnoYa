import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiInfo } from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';
import DemoLogin from './DemoLogin';

const DemoNotification = styled(motion.div)`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${props => props.theme.colors.gradients.primary};
  color: white;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.lg};
  z-index: ${props => props.theme.zIndex.modal};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  max-width: 300px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  margin-left: auto;
  
  &:hover {
    opacity: 0.8;
  }
`;

const DemoModeButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: ${props => props.theme.colors.gradients.primary};
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  box-shadow: ${props => props.theme.shadows.lg};
  z-index: ${props => props.theme.zIndex.modal};
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: ${props => props.theme.shadows.xl};
  }

  animation: pulse 2s infinite;

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;

const DemoWrapper = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [showDemoLogin, setShowDemoLogin] = useState(false);
  const { theme } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    checkDemoMode();
  }, []);

  const checkDemoMode = async () => {
    try {
      const response = await apiService.utils.healthCheck();
      if (response.mode === 'DEMO') {
        setIsDemoMode(true);
        if (!isAuthenticated && !isLoading) {
          setTimeout(() => setShowDemoLogin(true), 1000);
        }
      }
    } catch (error) {
      console.log('No se pudo conectar con el backend - modo demo no detectado');
    }
  };

  if (showDemoLogin && !isAuthenticated) {
    return <DemoLogin />;
  }

  return (
    <>
      {children}
      
      <AnimatePresence>
        {isDemoMode && showNotification && (
          <DemoNotification
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            theme={theme}
          >
            <FiInfo />
            <div>
              <strong>Modo Demo Activo</strong>
              <br />
              Datos de prueba cargados
            </div>
            <CloseButton 
              onClick={() => setShowNotification(false)}
              theme={theme}
            >
              <FiX />
            </CloseButton>
          </DemoNotification>
        )}
      </AnimatePresence>

      {isDemoMode && !showNotification && (
        <DemoModeButton 
          onClick={() => setShowDemoLogin(true)}
          theme={theme}
          title="Cambiar Usuario Demo"
        >
          <GiSoccerBall />
        </DemoModeButton>
      )}

      <AnimatePresence>
        {showDemoLogin && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: theme.zIndex.modal,
              pointerEvents: 'auto'
            }}
          >
            <DemoLogin onClose={() => setShowDemoLogin(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DemoWrapper;
