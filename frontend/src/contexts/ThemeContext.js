import React, { createContext, useContext, useState, useEffect } from 'react';

// Sports-themed colors and design system
const lightTheme = {
  name: 'light',
  colors: {
    // Primary colors - Sports field green theme
    primary: '#2ECC40',      // Field green (universal for sports)
    primaryDark: '#27AE3D',  // Darker green
    primaryLight: '#4DD055', // Lighter green
    
    // Secondary colors - Multi-sport complementary
    secondary: '#FF6B35',    // Orange (energy, sport equipment)
    secondaryDark: '#E5542A',
    secondaryLight: '#FF8A65',
    
    // Accent colors
    accent: '#FFD700',       // Gold (trophies, medals, victory)
    accentDark: '#FFC107',
    accentLight: '#FFEB3B',
    
    // Neutrals
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceSecondary: '#F5F5F5',
    
    // Text colors
    text: '#2C3E50',         // Dark navy
    textSecondary: '#546E7A',
    textLight: '#78909C',
    textInverse: '#FFFFFF',
    
    // Status colors
    success: '#4CAF50',      // Green
    error: '#F44336',        // Red card red
    warning: '#FF9800',      // Yellow card yellow
    info: '#2196F3',         // Blue
    
    // UI Elements
    border: '#E0E0E0',
    borderLight: '#F0F0F0',
    shadow: 'rgba(0, 0, 0, 0.1)',
    
    // Sports-specific
    field: '#228B22',        // Field/court color
    equipment: '#FFFFFF',    // Sports equipment (balls, nets, goals)
    lines: '#FFFFFF',        // Court/field lines
    officials: '#000000',    // Referee/umpire uniforms
    
    // Interactive states
    hover: 'rgba(46, 204, 64, 0.1)',
    active: 'rgba(46, 204, 64, 0.2)',
    disabled: '#BDBDBD',
    
    // Gradients
    gradients: {
      primary: 'linear-gradient(135deg, #2ECC40 0%, #27AE3D 100%)',
      secondary: 'linear-gradient(135deg, #FF6B35 0%, #E5542A 100%)',
      field: 'linear-gradient(180deg, #32CD32 0%, #228B22 100%)',
      court: 'linear-gradient(135deg, #4CAF50 0%, #2ECC40 50%, #66BB6A 100%)',
      sunset: 'linear-gradient(135deg, #FF6B35 0%, #FFD700 100%)',
      trophy: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)'
    }
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    round: '50%'
  },
  
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    fontSizes: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
      heading: '32px'
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 700
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6
    }
  },
  
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 8px rgba(0, 0, 0, 0.12)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.15)',
    xl: '0 16px 32px rgba(0, 0, 0, 0.2)'
  },
  
  breakpoints: {
    xs: '480px',
    sm: '768px',
    md: '1024px',
    lg: '1280px',
    xl: '1440px'
  },
  
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070
  }
};

// Dark theme for night games
const darkTheme = {
  ...lightTheme,
  name: 'dark',
  colors: {
    ...lightTheme.colors,
    
    // Background colors
    background: '#1A1A1A',
    backgroundSecondary: '#2D2D2D',
    surface: '#2D2D2D',
    surfaceSecondary: '#404040',
    
    // Text colors
    text: '#FFFFFF',
    textSecondary: '#B0BEC5',
    textLight: '#90A4AE',
    textInverse: '#2C3E50',
    
    // UI Elements
    border: '#404040',
    borderLight: '#505050',
    shadow: 'rgba(0, 0, 0, 0.3)',
    
    // Interactive states
    hover: 'rgba(46, 204, 64, 0.2)',
    active: 'rgba(46, 204, 64, 0.3)',
    
    // Stadium lighting effect
    stadiumLight: '#FFE082',
    nightField: '#1B5E20'
  }
};

// Create context
const ThemeContext = createContext();

// Provider component
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('tuturno-ya-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });

  const theme = isDarkMode ? darkTheme : lightTheme;

  // Persist theme preference
  useEffect(() => {
    localStorage.setItem('tuturno-ya-dark-mode', JSON.stringify(isDarkMode));
    
    // Update CSS custom properties for dynamic styling
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(`--color-${key}`, value);
      }
    });
    
    // Apply theme class to body
    document.body.className = isDarkMode ? 'theme-dark' : 'theme-light';
  }, [isDarkMode, theme]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Utility functions for responsive design
  const getBreakpoint = (size) => theme.breakpoints[size];
  const getColor = (color, variant = '') => {
    if (variant) {
      return theme.colors[`${color}${variant.charAt(0).toUpperCase() + variant.slice(1)}`] || theme.colors[color];
    }
    return theme.colors[color];
  };

  // Football-themed utility functions
  const getFieldGradient = () => theme.colors.gradients.field;
  const getStadiumColors = () => ({
    grass: theme.colors.grass,
    lines: theme.colors.goalpost,
    stands: theme.colors.backgroundSecondary
  });

  const value = {
    theme,
    isDarkMode,
    toggleTheme,
    
    // Utility functions
    getBreakpoint,
    getColor,
    getFieldGradient,
    getStadiumColors,
    
    // Theme constants
    LIGHT_THEME: 'light',
    DARK_THEME: 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Styled-components theme helper
export const getTheme = (isDark = false) => isDark ? darkTheme : lightTheme;

export default ThemeContext;
