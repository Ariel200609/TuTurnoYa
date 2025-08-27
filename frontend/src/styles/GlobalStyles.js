import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  /* Reset and base styles */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${props => props.theme.typography.fontFamily};
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    line-height: ${props => props.theme.typography.lineHeights.normal};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  /* Football field pattern background (subtle) */
  .field-pattern {
    background-image: 
      linear-gradient(90deg, rgba(46, 204, 64, 0.03) 50%, transparent 50%),
      linear-gradient(rgba(46, 204, 64, 0.03) 50%, transparent 50%);
    background-size: 20px 20px;
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-weight: ${props => props.theme.typography.fontWeights.bold};
    line-height: ${props => props.theme.typography.lineHeights.tight};
    color: ${props => props.theme.colors.text};
  }

  h1 {
    font-size: ${props => props.theme.typography.fontSizes.heading};
    margin-bottom: ${props => props.theme.spacing.lg};
  }

  h2 {
    font-size: ${props => props.theme.typography.fontSizes.xxl};
    margin-bottom: ${props => props.theme.spacing.md};
  }

  h3 {
    font-size: ${props => props.theme.typography.fontSizes.xl};
    margin-bottom: ${props => props.theme.spacing.md};
  }

  p {
    margin-bottom: ${props => props.theme.spacing.md};
    color: ${props => props.theme.colors.textSecondary};
  }

  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: ${props => props.theme.colors.primaryDark};
      text-decoration: underline;
    }
  }

  /* Form elements */
  input, textarea, select {
    font-family: inherit;
    font-size: ${props => props.theme.typography.fontSizes.md};
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.md};
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
    background-color: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.text};
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.primary};
      box-shadow: 0 0 0 3px ${props => props.theme.colors.hover};
    }

    &:disabled {
      background-color: ${props => props.theme.colors.surfaceSecondary};
      color: ${props => props.theme.colors.disabled};
      cursor: not-allowed;
    }

    &::placeholder {
      color: ${props => props.theme.colors.textLight};
    }
  }

  /* Button base styles */
  button {
    font-family: inherit;
    font-size: ${props => props.theme.typography.fontSizes.md};
    font-weight: ${props => props.theme.typography.fontWeights.medium};
    border: none;
    border-radius: ${props => props.theme.borderRadius.md};
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${props => props.theme.spacing.xs};

    &:disabled {
      background-color: ${props => props.theme.colors.disabled};
      color: ${props => props.theme.colors.textLight};
      cursor: not-allowed;
    }
  }

  /* Primary button - Football theme */
  .btn-primary {
    background: ${props => props.theme.colors.gradients.primary};
    color: ${props => props.theme.colors.textInverse};
    box-shadow: ${props => props.theme.shadows.sm};

    &:hover:not(:disabled) {
      box-shadow: ${props => props.theme.shadows.md};
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  /* Secondary button */
  .btn-secondary {
    background-color: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.primary};
    border: 1px solid ${props => props.theme.colors.primary};

    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.primary};
      color: ${props => props.theme.colors.textInverse};
    }
  }

  /* Success button (for bookings) */
  .btn-success {
    background-color: ${props => props.theme.colors.success};
    color: ${props => props.theme.colors.textInverse};

    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.success};
      filter: brightness(1.1);
    }
  }

  /* Warning button (yellow card style) */
  .btn-warning {
    background-color: ${props => props.theme.colors.warning};
    color: ${props => props.theme.colors.text};

    &:hover:not(:disabled) {
      filter: brightness(1.1);
    }
  }

  /* Error button (red card style) */
  .btn-error {
    background-color: ${props => props.theme.colors.error};
    color: ${props => props.theme.colors.textInverse};

    &:hover:not(:disabled) {
      filter: brightness(1.1);
    }
  }

  /* Utility classes */
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .text-right { text-align: right; }

  .font-light { font-weight: ${props => props.theme.typography.fontWeights.light}; }
  .font-normal { font-weight: ${props => props.theme.typography.fontWeights.normal}; }
  .font-medium { font-weight: ${props => props.theme.typography.fontWeights.medium}; }
  .font-bold { font-weight: ${props => props.theme.typography.fontWeights.bold}; }

  .text-primary { color: ${props => props.theme.colors.primary}; }
  .text-secondary { color: ${props => props.theme.colors.secondary}; }
  .text-success { color: ${props => props.theme.colors.success}; }
  .text-warning { color: ${props => props.theme.colors.warning}; }
  .text-error { color: ${props => props.theme.colors.error}; }

  /* Loading spinner - Football theme */
  .spinner {
    width: 24px;
    height: 24px;
    border: 3px solid ${props => props.theme.colors.border};
    border-top: 3px solid ${props => props.theme.colors.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Football bouncing animation */
  @keyframes bounce-ball {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }

  .bounce-ball {
    animation: bounce-ball 2s infinite;
  }

  /* Card styles */
  .card {
    background-color: ${props => props.theme.colors.surface};
    border-radius: ${props => props.theme.borderRadius.lg};
    box-shadow: ${props => props.theme.shadows.md};
    padding: ${props => props.theme.spacing.lg};
    transition: box-shadow 0.2s ease, transform 0.2s ease;

    &:hover {
      box-shadow: ${props => props.theme.shadows.lg};
      transform: translateY(-2px);
    }
  }

  /* Container */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${props => props.theme.spacing.md};

    @media (min-width: ${props => props.theme.breakpoints.sm}) {
      padding: 0 ${props => props.theme.spacing.lg};
    }
  }

  /* Grid system */
  .row {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -${props => props.theme.spacing.sm};
  }

  .col {
    flex: 1;
    padding: 0 ${props => props.theme.spacing.sm};
  }

  .col-2 { flex: 0 0 50%; }
  .col-3 { flex: 0 0 33.333333%; }
  .col-4 { flex: 0 0 25%; }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    .col-2, .col-3, .col-4 {
      flex: 0 0 100%;
    }
  }

  /* Spacing utilities */
  .mb-sm { margin-bottom: ${props => props.theme.spacing.sm}; }
  .mb-md { margin-bottom: ${props => props.theme.spacing.md}; }
  .mb-lg { margin-bottom: ${props => props.theme.spacing.lg}; }

  .mt-sm { margin-top: ${props => props.theme.spacing.sm}; }
  .mt-md { margin-top: ${props => props.theme.spacing.md}; }
  .mt-lg { margin-top: ${props => props.theme.spacing.lg}; }

  .p-sm { padding: ${props => props.theme.spacing.sm}; }
  .p-md { padding: ${props => props.theme.spacing.md}; }
  .p-lg { padding: ${props => props.theme.spacing.lg}; }

  /* Hide scrollbar but allow scrolling */
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }

  /* Focus styles for accessibility */
  *:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }

  /* Dark theme specific styles */
  .theme-dark {
    /* Stadium night lighting effect */
    .stadium-lights {
      background: radial-gradient(circle at 50% 0%, rgba(255, 224, 130, 0.1) 0%, transparent 70%);
    }
  }

  /* Print styles */
  @media print {
    * {
      color: black !important;
      background: white !important;
    }
    
    .no-print {
      display: none !important;
    }
  }

  /* Responsive breakpoints */
  @media (max-width: ${props => props.theme.breakpoints.xs}) {
    html {
      font-size: 14px;
    }
    
    .container {
      padding: 0 ${props => props.theme.spacing.sm};
    }
  }

  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    .container {
      max-width: 1400px;
    }
  }
`;

export default GlobalStyles;
