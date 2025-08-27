import React from 'react';
import styled from 'styled-components';
import { FiUser, FiCalendar, FiStar } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const ProfileWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
`;

const ProfileCard = styled.div`
  background: white;
  padding: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.md};
  text-align: center;
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => props.theme.colors.gradients.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
  margin: 0 auto ${props => props.theme.spacing.lg};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-top: ${props => props.theme.spacing.xl};
`;

const StatCard = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: ${props => props.theme.borderRadius.lg};

  .icon {
    font-size: 32px;
    color: ${props => props.theme.colors.primary};
    margin-bottom: ${props => props.theme.spacing.sm};
  }

  .value {
    font-size: ${props => props.theme.typography.fontSizes.xl};
    font-weight: ${props => props.theme.typography.fontWeights.bold};
    color: ${props => props.theme.colors.text};
    margin-bottom: ${props => props.theme.spacing.xs};
  }

  .label {
    color: ${props => props.theme.colors.textSecondary};
    font-size: ${props => props.theme.typography.fontSizes.sm};
  }
`;

const Profile = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  if (!user) {
    return <div>Loading...</div>;
  }

  const getUserInitials = () => {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  };

  return (
    <ProfileWrapper theme={theme}>
      <ProfileCard theme={theme}>
        <Avatar theme={theme}>
          {getUserInitials()}
        </Avatar>
        
        <h1 style={{ color: theme.colors.text, marginBottom: theme.spacing.sm }}>
          {user.firstName} {user.lastName}
        </h1>
        
        <p style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.lg }}>
          {user.email || user.phoneNumber}
        </p>

        <StatsGrid theme={theme}>
          <StatCard theme={theme}>
            <div className="icon">
              <FiCalendar />
            </div>
            <div className="value">0</div>
            <div className="label">Reservas</div>
          </StatCard>

          <StatCard theme={theme}>
            <div className="icon">
              <FiStar />
            </div>
            <div className="value">0</div>
            <div className="label">Reseñas</div>
          </StatCard>

          <StatCard theme={theme}>
            <div className="icon">
              <FiUser />
            </div>
            <div className="value">Demo</div>
            <div className="label">Usuario</div>
          </StatCard>
        </StatsGrid>
      </ProfileCard>
    </ProfileWrapper>
  );
};

export default Profile;
