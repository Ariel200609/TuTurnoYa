import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiSearch, FiBell, FiUser, FiLogOut, FiSun, FiMoon, FiSettings } from 'react-icons/fi';
import { GiSoccerBall, GiWhistle, GiTennisRacket, GiBasketballBall, GiVolleyballBall } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';

const HeaderWrapper = styled.header`
  background: ${props => props.theme.colors.surface};
  box-shadow: ${props => props.theme.shadows.md};
  position: sticky;
  top: 0;
  z-index: ${props => props.theme.zIndex.sticky};
  backdrop-filter: blur(10px);
  border-bottom: 2px solid ${props => props.theme.colors.primary};
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    gap: ${props => props.theme.spacing.md};
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  text-decoration: none;
  color: ${props => props.theme.colors.primary};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  font-size: ${props => props.theme.typography.fontSizes.xl};
  
  &:hover {
    text-decoration: none;
    color: ${props => props.theme.colors.primaryDark};
  }
`;

const BallIcon = styled(GiSoccerBall)`
  font-size: 28px;
  animation: rotate 20s linear infinite;
  color: ${props => props.theme.colors.primary};

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  &:hover {
    animation: bounce-ball 0.6s ease-in-out;
  }
`;

const SportIcons = styled.div`
  display: flex;
  gap: 4px;
  margin-left: 8px;
  
  svg {
    font-size: 16px;
    color: ${props => props.theme.colors.textSecondary};
    transition: all 0.3s ease;
    
    &:hover {
      color: ${props => props.theme.colors.primary};
      transform: scale(1.1);
    }
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    display: none;
  }
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: ${props => props.theme.colors.text};
  font-size: 20px;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.hover};
    color: ${props => props.theme.colors.primary};
  }

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    display: ${props => props.showOnDesktop ? 'flex' : 'none'};
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 400px;
  position: relative;

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    display: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  padding-left: 40px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  background-color: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSizes.md};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    background-color: ${props => props.theme.colors.surface};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.hover};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textLight};
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.textLight};
  font-size: 16px;
  pointer-events: none;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: ${props => props.theme.colors.text};
  font-size: 20px;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.hover};
    color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
  }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    display: ${props => props.hideOnMobile ? 'none' : 'flex'};
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  background: ${props => props.theme.colors.error};
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

const UserMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.lg};
  border: 1px solid ${props => props.theme.colors.border};
  min-width: 200px;
  overflow: hidden;
  z-index: ${props => props.theme.zIndex.dropdown};
`;

const UserMenuItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  border-bottom: 1px solid ${props => props.theme.colors.borderLight};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.hover};
    color: ${props => props.theme.colors.primary};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const UserMenuButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: none;
  border: none;
  color: ${props => props.theme.colors.text};
  text-align: left;
  cursor: pointer;
  border-bottom: 1px solid ${props => props.theme.colors.borderLight};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.hover};
    color: ${props => props.theme.colors.primary};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.theme.colors.gradients.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
`;

const AuthButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    display: none;
  }
`;

const LoginButton = styled(Link)`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.hover};
    text-decoration: none;
  }
`;

const SignUpButton = styled(Link)`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.gradients.primary};
  color: white;
  text-decoration: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  transition: all 0.2s ease;
  box-shadow: ${props => props.theme.shadows.sm};

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
    text-decoration: none;
    color: white;
  }
`;

const Header = ({ onToggleSidebar, onToggleMobileNav, showSidebarToggle }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user, userType, logout } = useAuth();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef();

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
    toast.success('Sesión cerrada correctamente');
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  };

  const getUserDashboardLink = () => {
    switch (userType) {
      case 'admin':
        return '/admin/dashboard';
      case 'venue_owner':
        return '/venue-owner/dashboard';
      default:
        return '/profile';
    }
  };

  return (
    <HeaderWrapper theme={theme}>
      <HeaderContainer theme={theme}>
        <LeftSection theme={theme}>
          {/* Sidebar toggle for desktop */}
          {showSidebarToggle && (
            <MenuButton 
              onClick={onToggleSidebar}
              showOnDesktop={true}
              theme={theme}
            >
              <FiMenu />
            </MenuButton>
          )}
          
          {/* Mobile menu toggle */}
          <MenuButton 
            onClick={onToggleMobileNav}
            theme={theme}
          >
            <FiMenu />
          </MenuButton>

          <Logo to="/" theme={theme}>
            <BallIcon />
            <span>TuTurnoYa</span>
            <SportIcons theme={theme}>
              <GiTennisRacket />
              <GiBasketballBall />
              <GiVolleyballBall />
            </SportIcons>
          </Logo>
        </LeftSection>

        {/* Search Bar */}
        <SearchContainer theme={theme}>
          <form onSubmit={handleSearch}>
            <SearchInput
              type="text"
              placeholder="Buscar canchas, barrios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              theme={theme}
            />
            <SearchIcon />
          </form>
        </SearchContainer>

        <RightSection theme={theme}>
          {/* Theme toggle */}
          <IconButton onClick={toggleTheme} theme={theme} hideOnMobile>
            {isDarkMode ? <FiSun /> : <FiMoon />}
          </IconButton>

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <IconButton theme={theme} hideOnMobile>
                <FiBell />
                {/* TODO: Add notification count */}
                {/* <NotificationBadge>3</NotificationBadge> */}
              </IconButton>

              {/* User Menu */}
              <div style={{ position: 'relative' }} ref={menuRef}>
                <IconButton 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  theme={theme}
                >
                  <UserAvatar theme={theme}>
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt="Profile" 
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      getUserInitials()
                    )}
                  </UserAvatar>
                </IconButton>

                <AnimatePresence>
                  {userMenuOpen && (
                    <UserMenu
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      theme={theme}
                    >
                      <UserMenuItem 
                        to={getUserDashboardLink()} 
                        onClick={() => setUserMenuOpen(false)}
                        theme={theme}
                      >
                        <FiUser />
                        Mi Perfil
                      </UserMenuItem>
                      
                      {userType === 'user' && (
                        <UserMenuItem 
                          to="/my-bookings" 
                          onClick={() => setUserMenuOpen(false)}
                          theme={theme}
                        >
                          <GiWhistle />
                          Mis Reservas
                        </UserMenuItem>
                      )}

                      <UserMenuItem 
                        to="/settings" 
                        onClick={() => setUserMenuOpen(false)}
                        theme={theme}
                      >
                        <FiSettings />
                        Configuración
                      </UserMenuItem>
                      
                      <UserMenuButton onClick={handleLogout} theme={theme}>
                        <FiLogOut />
                        Cerrar Sesión
                      </UserMenuButton>
                    </UserMenu>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <AuthButtons theme={theme}>
              <LoginButton to="/login" theme={theme}>
                Iniciar Sesión
              </LoginButton>
              <SignUpButton to="/register" theme={theme}>
                Registrarse
              </SignUpButton>
            </AuthButtons>
          )}
        </RightSection>
      </HeaderContainer>
    </HeaderWrapper>
  );
};

export default Header;
