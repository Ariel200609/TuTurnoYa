import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiUser, FiSettings, FiShield, FiLogIn } from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';
import apiService from '../../services/apiService';

const DemoWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.gradients.field};
  padding: ${props => props.theme.spacing.lg};
`;

const DemoCard = styled(motion.div)`
  background: white;
  padding: ${props => props.theme.spacing.xxl};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.xl};
  text-align: center;
  max-width: 500px;
  width: 100%;
`;

const DemoTitle = styled.h1`
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  
  svg {
    animation: spin 3s linear infinite;
  }
`;

const DemoSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.xl};
  font-size: ${props => props.theme.typography.fontSizes.lg};
`;

const UserTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const UserTypeCard = styled(motion.button)`
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.isSelected ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
  }

  .icon {
    font-size: 32px;
    color: ${props => props.isSelected ? props.theme.colors.primary : props.theme.colors.textSecondary};
    margin-bottom: ${props => props.theme.spacing.sm};
  }

  .title {
    font-weight: ${props => props.theme.typography.fontWeights.bold};
    color: ${props => props.isSelected ? props.theme.colors.primary : props.theme.colors.text};
    margin-bottom: ${props => props.theme.spacing.xs};
  }

  .description {
    font-size: ${props => props.theme.typography.fontSizes.sm};
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const LoginButton = styled(motion.button)`
  width: 100%;
  background: ${props => props.theme.colors.gradients.primary};
  color: white;
  border: none;
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }

  &:disabled {
    background: ${props => props.theme.colors.disabled};
    cursor: not-allowed;
    transform: none;
  }
`;

const InfoBox = styled.div`
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  
  strong {
    color: ${props => props.theme.colors.primary};
  }
`;

const DemoLogin = () => {
  const [selectedType, setSelectedType] = useState('user');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const userTypes = [
    {
      type: 'user',
      icon: FiUser,
      title: 'Usuario',
      description: 'Buscar y reservar canchas',
      email: 'user@demo.com'
    },
    {
      type: 'venue_owner', 
      icon: FiSettings,
      title: 'Propietario',
      description: 'Gestionar venues',
      email: 'owner@demo.com'
    },
    {
      type: 'admin',
      icon: FiShield,
      title: 'Admin',
      description: 'Panel administrativo',
      email: 'admin@demo.com'
    }
  ];

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const selectedUser = userTypes.find(u => u.type === selectedType);
      
      const response = await apiService.utils.demoLogin(selectedUser.email, selectedType);
      
      // Simular login exitoso
      localStorage.setItem('token', response.token);
      localStorage.setItem('userType', response.userType);
      
      toast.success(`¡Bienvenido como ${selectedUser.title}!`);
      
      // Recargar página para que se active el contexto de auth
      window.location.href = '/';
      
    } catch (error) {
      console.error('Demo login error:', error);
      toast.error('Error en login demo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DemoWrapper theme={theme}>
      <DemoCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        theme={theme}
      >
        <DemoTitle theme={theme}>
          <GiSoccerBall />
          TuTurnoYa Demo
        </DemoTitle>

        <DemoSubtitle theme={theme}>
          Elegí el tipo de usuario para probar la plataforma
        </DemoSubtitle>

        <UserTypeGrid theme={theme}>
          {userTypes.map(({ type, icon: Icon, title, description }) => (
            <UserTypeCard
              key={type}
              isSelected={selectedType === type}
              onClick={() => setSelectedType(type)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              theme={theme}
            >
              <div className="icon">
                <Icon />
              </div>
              <div className="title">{title}</div>
              <div className="description">{description}</div>
            </UserTypeCard>
          ))}
        </UserTypeGrid>

        <LoginButton
          onClick={handleDemoLogin}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          theme={theme}
        >
          <FiLogIn />
          {loading ? 'Cargando...' : `Entrar como ${userTypes.find(u => u.type === selectedType)?.title}`}
        </LoginButton>

        <InfoBox theme={theme}>
          <strong>Modo Demo:</strong> Esta es una versión de prueba con datos de ejemplo.
          No se requiere registro real ni configuración de base de datos.
        </InfoBox>
      </DemoCard>
    </DemoWrapper>
  );
};

export default DemoLogin;
