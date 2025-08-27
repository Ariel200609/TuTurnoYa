import React from 'react';
import styled, { keyframes } from 'styled-components';
import { GiSoccerBall } from 'react-icons/gi';
import { useTheme } from '../../contexts/ThemeContext';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${props => props.$fullHeight ? '100vh' : '200px'};
  gap: ${props => props.theme.spacing.lg};
`;

const SpinnerBall = styled(GiSoccerBall)`
  font-size: ${props => props.size === 'small' ? '24px' : props.size === 'large' ? '48px' : '32px'};
  color: ${props => props.theme.colors.primary};
  animation: ${props => props.variant === 'bounce' ? bounce : spin} 
             ${props => props.variant === 'bounce' ? '2s' : '1s'} 
             linear infinite;
`;

const SpinnerText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSizes.md};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  text-align: center;
  margin: 0;
`;

const StandardSpinner = styled.div`
  width: ${props => props.size === 'small' ? '20px' : props.size === 'large' ? '48px' : '32px'};
  height: ${props => props.size === 'small' ? '20px' : props.size === 'large' ? '48px' : '32px'};
  border: ${props => props.size === 'small' ? '2px' : '3px'} solid ${props => props.theme.colors.border};
  border-top: ${props => props.size === 'small' ? '2px' : '3px'} solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingSpinner = ({ 
  size = 'medium', // small, medium, large
  variant = 'ball', // ball, bounce, standard
  text = '', 
  fullHeight = false,
  inline = false 
}) => {
  const { theme } = useTheme();

  if (inline) {
    return variant === 'standard' ? (
      <StandardSpinner size={size} theme={theme} />
    ) : (
      <SpinnerBall 
        size={size} 
        variant={variant}
        theme={theme} 
      />
    );
  }

  const getLoadingText = () => {
    if (text) return text;
    
    const messages = [
      'Cargando...',
      'Preparando la cancha...',
      'Buscando el mejor horario...',
      '¡Ya casi está listo!',
      'Verificando disponibilidad...'
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <SpinnerContainer $fullHeight={fullHeight} theme={theme}>
      {variant === 'standard' ? (
        <StandardSpinner size={size} theme={theme} />
      ) : (
        <SpinnerBall 
          size={size} 
          variant={variant}
          theme={theme} 
        />
      )}
      
      {!inline && (
        <SpinnerText theme={theme}>
          {getLoadingText()}
        </SpinnerText>
      )}
    </SpinnerContainer>
  );
};

export default LoadingSpinner;
