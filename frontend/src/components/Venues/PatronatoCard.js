import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiMapPin, FiStar, FiPhone } from 'react-icons/fi';
import { GiSoccerBall, GiVolleyballBall, GiTennisCourt } from 'react-icons/gi';

const PatronatoCardWrapper = styled(motion.div)`
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #DC143C 100%);
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.xl};
  color: white;
  box-shadow: ${props => props.theme.shadows.xl};
  border: 2px solid #DC143C;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(220, 20, 60, 0.3);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #DC143C 0%, #FF6B6B 50%, #DC143C 100%);
  }
`;

const PatronatoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const PatronatoLogo = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #DC143C 0%, #FF4444 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 24px;
  color: white;
  border: 3px solid #000;
  box-shadow: 0 4px 15px rgba(220, 20, 60, 0.4);
`;

const PatronatoInfo = styled.div`
  flex: 1;
`;

const PatronatoName = styled.h3`
  color: white;
  font-size: 1.4rem;
  font-weight: bold;
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const PatronatoSubtitle = styled.p`
  color: #DC143C;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const PatronatoDescription = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  line-height: 1.4;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const PatronatoFeatures = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;

  svg {
    color: #DC143C;
  }
`;

const SportsList = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: center;
  padding: ${props => props.theme.spacing.md} 0;
  border-top: 1px solid rgba(220, 20, 60, 0.3);
  margin-top: ${props => props.theme.spacing.md};
`;

const SportIcon = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  transition: all 0.3s ease;

  svg {
    font-size: 24px;
    color: #DC143C;
    transition: all 0.3s ease;
  }

  &:hover {
    color: white;
    
    svg {
      color: #FF4444;
      transform: scale(1.1);
    }
  }
`;

const PatronatoCard = ({ venue, onClick }) => {
  return (
    <PatronatoCardWrapper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <PatronatoHeader>
        <PatronatoLogo>
          P
        </PatronatoLogo>
        <PatronatoInfo>
          <PatronatoName>{venue.name}</PatronatoName>
          <PatronatoSubtitle>Club Tradicional</PatronatoSubtitle>
        </PatronatoInfo>
      </PatronatoHeader>

      <PatronatoDescription>
        {venue.description}
      </PatronatoDescription>

      <PatronatoFeatures>
        <Feature>
          <FiMapPin />
          <span>{venue.neighborhood}</span>
        </Feature>
        <Feature>
          <FiStar />
          <span>{venue.averageRating} ({venue.totalReviews} reseñas)</span>
        </Feature>
        <Feature>
          <FiPhone />
          <span>Reservas</span>
        </Feature>
        <Feature>
          <span style={{ color: '#DC143C', fontWeight: 'bold' }}>
            {venue.courts?.length} canchas
          </span>
        </Feature>
      </PatronatoFeatures>

      <SportsList>
        <SportIcon>
          <GiSoccerBall />
          <span>Fútbol</span>
        </SportIcon>
        <SportIcon>
          <GiVolleyballBall />
          <span>Vóley</span>
        </SportIcon>
        <SportIcon>
          <GiTennisCourt />
          <span>Pádel</span>
        </SportIcon>
      </SportsList>
    </PatronatoCardWrapper>
  );
};

export default PatronatoCard;
