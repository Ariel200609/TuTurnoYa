import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiCalendar, 
  FiMapPin, 
  FiUsers, 
  FiSettings, 
  FiBarChart2,
  FiShield
} from 'react-icons/fi';
import { GiSoccerField, GiTennisCourt, GiBasketballBall, GiVolleyballBall } from 'react-icons/gi';
import { useTheme } from '../../contexts/ThemeContext';

const SidebarWrapper = styled.aside`
  position: fixed;
  left: 0;
  top: 80px; /* Header height */
  bottom: 0;
  width: 280px;
  background: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  transform: translateX(${props => props.isOpen ? '0' : '-100%'});
  transition: transform 0.3s ease;
  z-index: ${props => props.theme.zIndex.fixed};
  overflow-y: auto;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    top: 0;
    width: 280px;
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const SidebarContent = styled.div`
  padding: ${props => props.theme.spacing.lg} 0;
`;

const SidebarSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const SidebarLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  color: ${props => props.isActive ? props.theme.colors.primary : props.theme.colors.text};
  background-color: ${props => props.isActive ? props.theme.colors.hover : 'transparent'};
  text-decoration: none;
  font-weight: ${props => props.isActive ? props.theme.typography.fontWeights.medium : props.theme.typography.fontWeights.normal};
  border-right: 3px solid ${props => props.isActive ? props.theme.colors.primary : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.hover};
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    transform: translateX(2px);
  }

  svg {
    font-size: 18px;
  }
`;

const Sidebar = ({ isOpen, onClose, userType }) => {
  const { theme } = useTheme();
  const location = useLocation();

  const getMenuItems = () => {
    const commonItems = [
      {
        section: 'Principal',
        items: [
          { path: `/${userType}/dashboard`, icon: FiHome, label: 'Dashboard' }
        ]
      }
    ];

    if (userType === 'venue_owner') {
      return [
        ...commonItems,
        {
          section: 'Gestión',
          items: [
            { path: '/venue-owner/venues', icon: GiSoccerField, label: 'Mis Complejos' },
            { path: '/venue-owner/bookings', icon: FiCalendar, label: 'Reservas' },
            { path: '/venue-owner/reviews', icon: FiUsers, label: 'Reseñas' },
            { path: '/venue-owner/analytics', icon: FiBarChart2, label: 'Estadísticas' }
          ]
        },
        {
          section: 'Cuenta',
          items: [
            { path: '/venue-owner/settings', icon: FiSettings, label: 'Configuración' }
          ]
        }
      ];
    }

    if (userType === 'admin') {
      return [
        ...commonItems,
        {
          section: 'Administración',
          items: [
            { path: '/admin/users', icon: FiUsers, label: 'Usuarios' },
            { path: '/admin/venues', icon: GiSoccerField, label: 'Complejos' },
            { path: '/admin/bookings', icon: FiCalendar, label: 'Reservas' },
            { path: '/admin/reports', icon: FiBarChart2, label: 'Reportes' }
          ]
        },
        {
          section: 'Sistema',
          items: [
            { path: '/admin/settings', icon: FiSettings, label: 'Configuración' },
            { path: '/admin/security', icon: FiShield, label: 'Seguridad' }
          ]
        }
      ];
    }

    return commonItems;
  };

  return (
    <SidebarWrapper isOpen={isOpen} theme={theme}>
      <SidebarContent theme={theme}>
        {getMenuItems().map((section) => (
          <SidebarSection key={section.section} theme={theme}>
            {section.section && (
              <SectionTitle theme={theme}>
                {section.section}
              </SectionTitle>
            )}
            {section.items.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <SidebarLink
                  key={item.path}
                  to={item.path}
                  isActive={isActive}
                  theme={theme}
                  onClick={onClose}
                >
                  <IconComponent />
                  {item.label}
                </SidebarLink>
              );
            })}
          </SidebarSection>
        ))}
      </SidebarContent>
    </SidebarWrapper>
  );
};

export default Sidebar;
