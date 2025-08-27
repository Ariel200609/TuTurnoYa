import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GiSoccerBall } from 'react-icons/gi';
import { useTheme } from '../contexts/ThemeContext';

const NotFoundWrapper = styled.div`
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
`;

const Ball = styled(motion.div)`
  font-size: 120px;
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  font-size: 3rem;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSizes.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const HomeButton = styled(Link)`
  background: ${props => props.theme.colors.gradients.primary};
  color: white;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius.lg};
  text-decoration: none;
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
    text-decoration: none;
    color: white;
  }
`;

const NotFound = () => {
  const { theme } = useTheme();

  return (
    <NotFoundWrapper theme={theme}>
      <Ball
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        theme={theme}
      >
        <GiSoccerBall />
      </Ball>
      
      <Title theme={theme}>404</Title>
      
      <Subtitle theme={theme}>
        ¡Ups! Esta página se fue fuera del campo
      </Subtitle>
      
      <HomeButton to="/" theme={theme}>
        Volver al Campo de Juego
      </HomeButton>
    </NotFoundWrapper>
  );
};

export default NotFound;
