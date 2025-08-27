import React from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { GiSoccerBall } from 'react-icons/gi';
import { useTheme } from '../contexts/ThemeContext';

const PlaceholderWrapper = styled.div`
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
`;

const Icon = styled.div`
  font-size: 80px;
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
  animation: bounce 2s infinite;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSizes.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const DemoNote = styled.div`
  background: ${props => props.theme.colors.backgroundSecondary};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  border-left: 4px solid ${props => props.theme.colors.primary};
  max-width: 500px;
  
  strong {
    color: ${props => props.theme.colors.primary};
  }
`;

const Placeholder = ({ title, description }) => {
  const { theme } = useTheme();
  const location = useLocation();

  const getPageName = () => {
    const path = location.pathname;
    if (path.includes('booking')) return 'Reservas';
    if (path.includes('venue-owner')) return 'Panel de Propietario';
    if (path.includes('admin')) return 'Panel de Administrador';
    return title || 'Página';
  };

  return (
    <PlaceholderWrapper theme={theme}>
      <Icon theme={theme}>
        <GiSoccerBall />
      </Icon>
      
      <Title theme={theme}>
        {getPageName()}
      </Title>
      
      <Subtitle theme={theme}>
        {description || 'Esta página está en construcción'}
      </Subtitle>

      <DemoNote theme={theme}>
        <strong>Modo Demo:</strong> Esta sección estará disponible en la versión completa. 
        Por ahora podés explorar la página principal, búsqueda de canchas y detalles de venues.
      </DemoNote>
    </PlaceholderWrapper>
  );
};

export default Placeholder;
