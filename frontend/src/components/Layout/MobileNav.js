import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { 
  FiHome, 
  FiSearch, 
  FiCalendar, 
  FiUser, 
  FiLogOut,
  FiLogIn 
} from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const MobileNavOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: ${props => props.theme.zIndex.modal};

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const MobileNavWrapper = styled(motion.nav)`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: ${props => props.theme.colors.surface};
  z-index: ${props => props.theme.zIndex.modal + 1};
  box-shadow: ${props => props.theme.shadows.lg};
`;

const MobileNavHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.primary};
  color: white;
`;

const MobileNavContent = styled.div`
  padding: ${props => props.theme.spacing.lg} 0;
  overflow-y: auto;
`;

const NavSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};

  &:last-child {
    margin-bottom: 0;
  }
`;

const NavSectionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.hover};
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
  }

  svg {
    font-size: 18px;
  }
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  width: 100%;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: none;
  border: none;
  color: ${props => props.theme.colors.text};
  text-align: left;
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.hover};
    color: ${props => props.theme.colors.primary};
  }

  svg {
    font-size: 18px;
  }
`;

const UserInfo = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  text-align: center;

  .avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: ${props => props.theme.colors.gradients.primary};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 20px;
    margin: 0 auto ${props => props.theme.spacing.md};
  }

  .name {
    font-weight: ${props => props.theme.typography.fontWeights.bold};
    color: ${props => props.theme.colors.text};
    margin-bottom: ${props => props.theme.spacing.xs};
  }

  .type {
    font-size: ${props => props.theme.typography.fontSizes.sm};
    color: ${props => props.theme.colors.textLight};
  }
`;

const MobileNav = ({ isOpen, onClose, userType, isAuthenticated }) => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  const handleLogout = () => {
    logout();
    onClose();
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  };

  const getUserTypeLabel = () => {
    switch (userType) {
      case 'admin':
        return 'Administrador';
      case 'venue_owner':
        return 'Propietario';
      default:
        return 'Usuario';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <MobileNavOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            theme={theme}
          />
          <MobileNavWrapper
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            theme={theme}
          >
            <MobileNavHeader theme={theme}>
              <GiSoccerBall size={24} />
              <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
                TuTurnoYa
              </span>
            </MobileNavHeader>

            {isAuthenticated && user && (
              <UserInfo theme={theme}>
                <div className="avatar">
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt="Profile" 
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    getUserInitials()
                  )}
                </div>
                <div className="name">
                  {user.firstName} {user.lastName}
                </div>
                <div className="type">
                  {getUserTypeLabel()}
                </div>
              </UserInfo>
            )}

            <MobileNavContent theme={theme}>
              <NavSection theme={theme}>
                <NavLink to="/" onClick={onClose} theme={theme}>
                  <FiHome />
                  Inicio
                </NavLink>
                <NavLink to="/search" onClick={onClose} theme={theme}>
                  <FiSearch />
                  Buscar Canchas
                </NavLink>
              </NavSection>

              {isAuthenticated ? (
                <>
                  <NavSection theme={theme}>
                    <NavSectionTitle theme={theme}>Mi Cuenta</NavSectionTitle>
                    
                    {userType === 'user' && (
                      <>
                        <NavLink to="/profile" onClick={onClose} theme={theme}>
                          <FiUser />
                          Mi Perfil
                        </NavLink>
                        <NavLink to="/my-bookings" onClick={onClose} theme={theme}>
                          <FiCalendar />
                          Mis Reservas
                        </NavLink>
                      </>
                    )}

                    {userType === 'venue_owner' && (
                      <>
                        <NavLink to="/venue-owner/dashboard" onClick={onClose} theme={theme}>
                          <FiHome />
                          Dashboard
                        </NavLink>
                        <NavLink to="/venue-owner/venues" onClick={onClose} theme={theme}>
                          <GiSoccerBall />
                          Mis Venues
                        </NavLink>
                        <NavLink to="/venue-owner/bookings" onClick={onClose} theme={theme}>
                          <FiCalendar />
                          Reservas
                        </NavLink>
                      </>
                    )}

                    {userType === 'admin' && (
                      <>
                        <NavLink to="/admin/dashboard" onClick={onClose} theme={theme}>
                          <FiHome />
                          Dashboard
                        </NavLink>
                        <NavLink to="/admin/users" onClick={onClose} theme={theme}>
                          <FiUser />
                          Usuarios
                        </NavLink>
                        <NavLink to="/admin/venues" onClick={onClose} theme={theme}>
                          <GiSoccerBall />
                          Venues
                        </NavLink>
                      </>
                    )}
                  </NavSection>

                  <NavSection theme={theme}>
                    <NavButton onClick={handleLogout} theme={theme}>
                      <FiLogOut />
                      Cerrar Sesión
                    </NavButton>
                  </NavSection>
                </>
              ) : (
                <NavSection theme={theme}>
                  <NavSectionTitle theme={theme}>Cuenta</NavSectionTitle>
                  <NavLink to="/login" onClick={onClose} theme={theme}>
                    <FiLogIn />
                    Iniciar Sesión
                  </NavLink>
                  <NavLink to="/register" onClick={onClose} theme={theme}>
                    <FiUser />
                    Registrarse
                  </NavLink>
                </NavSection>
              )}

              <NavSection theme={theme}>
                <NavSectionTitle theme={theme}>Para Propietarios</NavSectionTitle>
                <NavLink to="/venue-owner/register" onClick={onClose} theme={theme}>
                  <GiSoccerBall />
                  Registrar Local
                </NavLink>
                <NavLink to="/venue-owner/login" onClick={onClose} theme={theme}>
                  <FiLogIn />
                  Acceso Propietarios
                </NavLink>
              </NavSection>
            </MobileNavContent>
          </MobileNavWrapper>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileNav;
