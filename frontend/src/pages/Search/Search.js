import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSearchParams, Link } from 'react-router-dom';
import { FiSearch, FiMapPin, FiStar } from 'react-icons/fi';
import { GiSoccerField } from 'react-icons/gi';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const SearchWrapper = styled.div`
  min-height: 60vh;
`;

const SearchHeader = styled.div`
  background: ${props => props.theme.colors.gradients.primary};
  color: white;
  padding: ${props => props.theme.spacing.xl} 0;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const SearchContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.lg};
`;

const SearchBox = styled.div`
  max-width: 600px;
  margin: 0 auto;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.lg};
  border: none;
  border-radius: ${props => props.theme.borderRadius.xl};
  font-size: ${props => props.theme.typography.fontSizes.lg};
  box-shadow: ${props => props.theme.shadows.lg};

  &:focus {
    outline: none;
    box-shadow: ${props => props.theme.shadows.xl};
  }
`;

const ResultsSection = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.lg};
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.xl};
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
`;

const VenueContent = styled.div`
  padding: ${props => props.theme.spacing.lg};
`;

const VenueName = styled.h3`
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

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl} 0;
  color: ${props => props.theme.colors.textSecondary};

  .icon {
    font-size: 64px;
    margin-bottom: ${props => props.theme.spacing.lg};
    opacity: 0.5;
  }
`;

const Search = () => {
  const [searchParams] = useSearchParams();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const { theme } = useTheme();

  useEffect(() => {
    loadVenues();
  }, [searchParams]);

  const loadVenues = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchParams.get('q'),
        courtType: searchParams.get('courtType'),
        neighborhood: searchParams.get('neighborhood')
      };

      const response = await apiService.venues.getAll(filters);
      setVenues(response.venues || []);
    } catch (error) {
      console.error('Error loading venues:', error);
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SearchWrapper theme={theme}>
      <SearchHeader theme={theme}>
        <SearchContainer theme={theme}>
          <h1 style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
            Encontrá tu cancha ideal
          </h1>
          <SearchBox theme={theme}>
            <SearchInput
              type="text"
              placeholder="Buscá por nombre, barrio o tipo de cancha..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              theme={theme}
            />
          </SearchBox>
        </SearchContainer>
      </SearchHeader>

      <ResultsSection theme={theme}>
        {loading ? (
          <LoadingSpinner text="Buscando las mejores canchas..." />
        ) : venues.length > 0 ? (
          <>
            <h2 style={{ marginBottom: theme.spacing.lg, color: theme.colors.text }}>
              {venues.length} cancha{venues.length !== 1 ? 's' : ''} encontrada{venues.length !== 1 ? 's' : ''}
            </h2>
            <ResultsGrid theme={theme}>
              {venues.map((venue, index) => (
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
                    <VenueInfo theme={theme}>
                      <GiSoccerField />
                      {venue.courts?.length || 0} canchas disponibles
                    </VenueInfo>
                  </VenueContent>
                </VenueCard>
              ))}
            </ResultsGrid>
          </>
        ) : (
          <EmptyState theme={theme}>
            <div className="icon">
              <FiSearch />
            </div>
            <h3>No se encontraron canchas</h3>
            <p>Probá con otros términos de búsqueda</p>
          </EmptyState>
        )}
      </ResultsSection>
    </SearchWrapper>
  );
};

export default Search;
