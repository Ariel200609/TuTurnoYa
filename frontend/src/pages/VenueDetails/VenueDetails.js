import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiClock, FiStar, FiCalendar } from 'react-icons/fi';
import { GiSoccerField } from 'react-icons/gi';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const VenueWrapper = styled.div`
  min-height: 60vh;
`;

const VenueHeader = styled.div`
  background: white;
  box-shadow: ${props => props.theme.shadows.sm};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const VenueHero = styled.div`
  height: 400px;
  background: ${props => props.theme.colors.gradients.field};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 72px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%);
  }
`;

const VenueInfo = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl} ${props => props.theme.spacing.lg};
`;

const VenueTitle = styled.h1`
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const VenueContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${props => props.theme.spacing.xl};
  margin-top: ${props => props.theme.spacing.xl};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const DetailsSection = styled.div``;

const SidebarSection = styled.div``;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const CourtsSection = styled.div`
  background: white;
  padding: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.md};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const CourtsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-top: ${props => props.theme.spacing.lg};
`;

const CourtCard = styled(motion.div)`
  background: ${props => props.theme.colors.backgroundSecondary};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
  }
`;

const CourtName = styled.h4`
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const CourtInfo = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const CourtPrice = styled.div`
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.fontSizes.lg};
  margin-top: ${props => props.theme.spacing.sm};
`;

const BookButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.gradients.primary};
  color: white;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  text-decoration: none;
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  margin-top: ${props => props.theme.spacing.md};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
    text-decoration: none;
    color: white;
  }
`;

const VenueSidebar = styled.div`
  background: white;
  padding: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.md};
  height: fit-content;
`;

const AmenityTag = styled.span`
  display: inline-block;
  background: ${props => props.theme.colors.hover};
  color: ${props => props.theme.colors.primary};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  margin-right: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const VenueDetails = () => {
  const { id } = useParams();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadVenue();
  }, [id]);

  const loadVenue = async () => {
    try {
      setLoading(true);
      const response = await apiService.venues.getById(id);
      setVenue(response.venue);
    } catch (error) {
      console.error('Error loading venue:', error);
      setVenue(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullHeight text="Cargando detalles del complejo..." />;
  }

  if (!venue) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Venue no encontrado</h2>
        <Link to="/search">← Volver a la búsqueda</Link>
      </div>
    );
  }

  return (
    <VenueWrapper theme={theme}>
      <VenueHeader theme={theme}>
        <VenueHero theme={theme}>
          {venue.mainImage ? (
            <img 
              src={venue.mainImage} 
              alt={venue.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <GiSoccerField />
          )}
        </VenueHero>
        
        <VenueInfo theme={theme}>
          <VenueTitle theme={theme}>{venue.name}</VenueTitle>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.lg }}>
            <InfoItem theme={theme}>
              <FiMapPin />
              {venue.address}
            </InfoItem>
            
            <InfoItem theme={theme}>
              <FiPhone />
              {venue.phoneNumber}
            </InfoItem>
            
            <InfoItem theme={theme}>
              <FiStar />
              {venue.averageRating ? `${venue.averageRating}/5` : 'Sin reseñas'} 
              ({venue.totalReviews || 0} reseñas)
            </InfoItem>
          </div>
        </VenueInfo>
      </VenueHeader>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: `0 ${theme.spacing.lg}` }}>
        <VenueContent theme={theme}>
          <DetailsSection>
            {venue.description && (
              <div style={{ marginBottom: theme.spacing.xl }}>
                <h3 style={{ color: theme.colors.text, marginBottom: theme.spacing.md }}>
                  Descripción
                </h3>
                <p style={{ color: theme.colors.textSecondary, lineHeight: 1.6 }}>
                  {venue.description}
                </p>
              </div>
            )}

            <CourtsSection theme={theme}>
              <h3 style={{ color: theme.colors.text, marginBottom: theme.spacing.md }}>
                Canchas Disponibles
              </h3>
              
              {venue.courts && venue.courts.length > 0 ? (
                <CourtsGrid theme={theme}>
                  {venue.courts.map((court, index) => (
                    <CourtCard
                      key={court.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      theme={theme}
                    >
                      <CourtName theme={theme}>
                        {court.name}
                      </CourtName>
                      
                      <CourtInfo theme={theme}>
                        <strong>Tipo:</strong> {court.courtType}
                      </CourtInfo>
                      
                      <CourtInfo theme={theme}>
                        <strong>Superficie:</strong> {court.surfaceType}
                      </CourtInfo>
                      
                      <CourtInfo theme={theme}>
                        <strong>Jugadores:</strong> Hasta {court.maxPlayers}
                      </CourtInfo>
                      
                      <CourtPrice theme={theme}>
                        Desde ${court.basePrice}/hora
                      </CourtPrice>

                      {isAuthenticated ? (
                        <BookButton to={`/book/${court.id}`} theme={theme}>
                          <FiCalendar />
                          Reservar
                        </BookButton>
                      ) : (
                        <BookButton to="/login" theme={theme}>
                          <FiCalendar />
                          Iniciar Sesión para Reservar
                        </BookButton>
                      )}
                    </CourtCard>
                  ))}
                </CourtsGrid>
              ) : (
                <p style={{ color: theme.colors.textSecondary }}>
                  No hay canchas disponibles en este momento.
                </p>
              )}
            </CourtsSection>
          </DetailsSection>

          <SidebarSection>
            <VenueSidebar theme={theme}>
              <h3 style={{ color: theme.colors.text, marginBottom: theme.spacing.md }}>
                Comodidades
              </h3>
              
              {venue.amenities && venue.amenities.length > 0 ? (
                <div>
                  {venue.amenities.map((amenity, index) => (
                    <AmenityTag key={index} theme={theme}>
                      {amenity}
                    </AmenityTag>
                  ))}
                </div>
              ) : (
                <p style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSizes.sm }}>
                  Sin información de comodidades
                </p>
              )}
              
              <div style={{ marginTop: theme.spacing.xl }}>
                <h4 style={{ color: theme.colors.text, marginBottom: theme.spacing.md }}>
                  Horarios
                </h4>
                <InfoItem theme={theme}>
                  <FiClock />
                  Lunes a Domingo: 8:00 - 23:00
                </InfoItem>
              </div>
            </VenueSidebar>
          </SidebarSection>
        </VenueContent>
      </div>
    </VenueWrapper>
  );
};

export default VenueDetails;
