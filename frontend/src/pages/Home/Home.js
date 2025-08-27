import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiClock, FiStar, FiArrowRight } from 'react-icons/fi';
import { GiSoccerBall, GiSoccerField, GiWhistle, GiTennisCourt, GiBasketballBall, GiVolleyballBall, GiTennisRacket } from 'react-icons/gi';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const HomeWrapper = styled.div`
  min-height: 100vh;
`;

const HeroSection = styled.section`
  background: linear-gradient(
    135deg, 
    ${props => props.theme.colors.primary} 0%, 
    ${props => props.theme.colors.primaryDark} 100%
  );
  color: white;
  padding: ${props => props.theme.spacing.xxl} 0;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(90deg, rgba(255, 255, 255, 0.02) 50%, transparent 50%),
      linear-gradient(rgba(255, 255, 255, 0.02) 50%, transparent 50%);
    background-size: 60px 60px;
    pointer-events: none;
  }
`;

const HeroContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.lg};
  position: relative;
  z-index: 2;
`;

const HeroTitle = styled(motion.h1)`
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  margin-bottom: ${props => props.theme.spacing.lg};
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

  .highlight {
    color: ${props => props.theme.colors.accent};
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  margin-bottom: ${props => props.theme.spacing.xxl};
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const SearchContainer = styled(motion.div)`
  max-width: 500px;
  margin: 0 auto ${props => props.theme.spacing.xl};
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.lg};
  padding-left: 50px;
  border: none;
  border-radius: ${props => props.theme.borderRadius.xl};
  font-size: ${props => props.theme.typography.fontSizes.lg};
  box-shadow: ${props => props.theme.shadows.lg};
  background: white;

  &:focus {
    outline: none;
    box-shadow: ${props => props.theme.shadows.xl};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textLight};
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.primary};
  font-size: 20px;
`;

const QuickActions = styled(motion.div)`
  display: flex;
  justify-content: center;
  gap: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
`;

const QuickActionButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    text-decoration: none;
    color: white;
  }
`;

const FeaturesSection = styled.section`
  padding: ${props => props.theme.spacing.xxl} 0;
  background: ${props => props.theme.colors.backgroundSecondary};
`;

const FeaturesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: ${props => props.theme.typography.fontSizes.heading};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xxl};
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.xl};
`;

const FeatureCard = styled(motion.div)`
  background: white;
  padding: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.md};
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: ${props => props.theme.shadows.lg};
    transform: translateY(-4px);
  }
`;

const FeatureIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.gradients.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 36px;
`;

const FeatureTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const FeatureDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;
`;

const PopularVenuesSection = styled.section`
  padding: ${props => props.theme.spacing.xxl} 0;
  background: ${props => props.theme.colors.background};
`;

const VenuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.xl};
  margin-top: ${props => props.theme.spacing.xl};
`;

const VenueCard = styled(motion.div)`
  background: white;
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.md};
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: ${props => props.theme.shadows.lg};
    transform: translateY(-4px);
  }
`;

const VenueImage = styled.div`
  height: 200px;
  background: ${props => props.theme.colors.gradients.field};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 48px;
  position: relative;

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

const VenueContent = styled.div`
  padding: ${props => props.theme.spacing.lg};
`;

const VenueName = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const VenueInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSizes.sm};
`;

const VenuePrice = styled.div`
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.fontSizes.lg};
`;

const CTASection = styled.section`
  background: ${props => props.theme.colors.gradients.sunset};
  padding: ${props => props.theme.spacing.xxl} 0;
  text-align: center;
  color: white;
`;

const CTAButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.xl};
  background: white;
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  border-radius: ${props => props.theme.borderRadius.xl};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  font-size: ${props => props.theme.typography.fontSizes.lg};
  box-shadow: ${props => props.theme.shadows.lg};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.xl};
    text-decoration: none;
    color: ${props => props.theme.colors.primary};
  }
`;

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [popularVenues, setPopularVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadPopularVenues();
  }, []);

  const loadPopularVenues = async () => {
    try {
      const response = await apiService.venues.getAll({
        limit: 3,
        sortBy: 'rating',
        sortOrder: 'desc'
      });
      setPopularVenues(response.venues || []);
    } catch (error) {
      console.error('Error loading popular venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const features = [
    {
      icon: <GiSoccerField />,
      title: 'Reservá en Segundos',
      description: 'Encontrá y reservá canchas deportivas en Bahía Blanca de forma rápida y sencilla.'
    },
    {
      icon: <FiClock />,
      title: 'Disponibilidad 24/7',
      description: 'Consultá horarios disponibles en tiempo real y reservá cuando quieras.'
    },
    {
      icon: <GiWhistle />,
      title: 'Confirmación Inmediata',
      description: 'Recibí confirmación al instante y recordatorios antes de tu partido.'
    }
  ];

  const sports = [
    {
      icon: <GiSoccerBall />,
      name: 'Fútbol',
      description: 'Fútbol 5, 7, 8 y 11',
      color: '#2ECC40'
    },
    {
      icon: <GiTennisRacket />,
      name: 'Tenis',
      description: 'Canchas de tenis',
      color: '#FF6B35'
    },
    {
      icon: <GiBasketballBall />,
      name: 'Básquet',
      description: 'Canchas de básquet',
      color: '#FF9800'
    },
    {
      icon: <GiVolleyballBall />,
      name: 'Vóley',
      description: 'Canchas de vóley',
      color: '#9C27B0'
    },
    {
      icon: <GiTennisCourt />,
      name: 'Pádel',
      description: 'Canchas de pádel',
      color: '#00BCD4'
    }
  ];

  return (
    <HomeWrapper theme={theme}>
      {/* Hero Section */}
      <HeroSection theme={theme}>
        <HeroContainer theme={theme}>
          <HeroTitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            theme={theme}
          >
            Reservá tu cancha <span className="highlight">deportiva</span> favorita
          </HeroTitle>

          <HeroSubtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            theme={theme}
          >
            La forma más fácil de encontrar y reservar canchas deportivas en Bahía Blanca
          </HeroSubtitle>

          <SearchContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            theme={theme}
          >
            <form onSubmit={handleSearch}>
              <SearchInput
                type="text"
                placeholder="Buscá por barrio, nombre o tipo de cancha..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                theme={theme}
              />
              <SearchIcon />
            </form>
          </SearchContainer>

          <QuickActions
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            theme={theme}
          >
            <QuickActionButton to="/search?courtType=Fútbol 5" theme={theme}>
              <GiSoccerBall />
              Fútbol 5
            </QuickActionButton>
            <QuickActionButton to="/search?courtType=Fútbol 7" theme={theme}>
              <GiSoccerBall />
              Fútbol 7
            </QuickActionButton>
            <QuickActionButton to="/search" theme={theme}>
              <FiMapPin />
              Cerca de mí
            </QuickActionButton>
          </QuickActions>
        </HeroContainer>
      </HeroSection>

      {/* Features Section */}
      <FeaturesSection theme={theme}>
        <FeaturesContainer theme={theme}>
          <SectionTitle theme={theme}>
            ¿Por qué elegir TuTurnoYa?
          </SectionTitle>

          <FeaturesGrid theme={theme}>
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                theme={theme}
              >
                <FeatureIcon theme={theme}>
                  {feature.icon}
                </FeatureIcon>
                <FeatureTitle theme={theme}>
                  {feature.title}
                </FeatureTitle>
                <FeatureDescription theme={theme}>
                  {feature.description}
                </FeatureDescription>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </FeaturesContainer>
      </FeaturesSection>

      {/* Popular Venues Section */}
      <PopularVenuesSection theme={theme}>
        <FeaturesContainer theme={theme}>
          <SectionTitle theme={theme}>
            Canchas Populares
          </SectionTitle>

          {loading ? (
            <div style={{ textAlign: 'center' }}>
              <LoadingSpinner text="Cargando canchas populares..." />
            </div>
          ) : (
            <VenuesGrid theme={theme}>
              {popularVenues.length > 0 ? (
                popularVenues.map((venue, index) => (
                  <VenueCard
                    key={venue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    as={Link}
                    to={`/venue/${venue.id}`}
                    theme={theme}
                  >
                    <VenueImage theme={theme}>
                      {venue.mainImage ? (
                        <img 
                          src={venue.mainImage} 
                          alt={venue.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <GiSoccerField />
                      )}
                    </VenueImage>
                    <VenueContent theme={theme}>
                      <VenueName theme={theme}>
                        {venue.name}
                      </VenueName>
                      <VenueInfo theme={theme}>
                        <FiMapPin />
                        {venue.neighborhood || venue.address}
                      </VenueInfo>
                      <VenueInfo theme={theme}>
                        <FiStar />
                        {venue.averageRating ? `${venue.averageRating}/5` : 'Sin reseñas'}
                      </VenueInfo>
                      <VenuePrice theme={theme}>
                        Desde $
                        {venue.courts && venue.courts.length > 0 
                          ? Math.min(...venue.courts.map(c => c.basePrice))
                          : '0'
                        }/hora
                      </VenuePrice>
                    </VenueContent>
                  </VenueCard>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: theme.colors.textSecondary }}>
                  No hay venues disponibles en este momento
                </div>
              )}
            </VenuesGrid>
          )}
        </FeaturesContainer>
      </PopularVenuesSection>

      {/* CTA Section */}
      <CTASection theme={theme}>
        <FeaturesContainer theme={theme}>
          <HeroTitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            theme={theme}
            style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: theme.spacing.lg }}
          >
            ¿Tenés un complejo deportivo?
          </HeroTitle>
          
          <HeroSubtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            theme={theme}
            style={{ marginBottom: theme.spacing.xl }}
          >
            Uní tu local a nuestra plataforma y aumentá tus reservas
          </HeroSubtitle>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <CTAButton to="/venue-owner/register" theme={theme}>
              Registrar mi Local
              <FiArrowRight />
            </CTAButton>
          </motion.div>
        </FeaturesContainer>
      </CTASection>
    </HomeWrapper>
  );
};

export default Home;
