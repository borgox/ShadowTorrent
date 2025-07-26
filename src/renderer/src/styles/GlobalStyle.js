import { createGlobalStyle } from 'styled-components';

export const darkTheme = {
  colors: {
    background: '#1a1a1a',
    surface: '#2a2a2a',
    surfaceHover: '#333333',
    primary: '#00d4aa',
    primaryHover: '#00b894',
    secondary: '#74b9ff',
    text: '#ffffff',
    textSecondary: '#b2b2b2',
    textMuted: '#666666',
    border: '#444444',
    borderLight: '#333333',
    success: '#00b894',
    warning: '#fdcb6e',
    error: '#e17055',
    info: '#74b9ff'
  },
  fonts: {
    primary: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    mono: '"Fira Code", "SF Mono", Monaco, Consolas, monospace'
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
    lg: '12px'
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.2)',
    md: '0 4px 6px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 25px rgba(0, 0, 0, 0.4)'
  }
};

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${props => props.theme.fonts.primary};
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow: hidden;
  }

  #root {
    height: 100vh;
    width: 100vw;
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.textMuted};
  }

  /* Selection */
  ::selection {
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.background};
  }

  /* Input focus styles */
  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary};
  }

  /* Button base styles */
  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
  }

  /* Links */
  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
  }

  a:hover {
    color: ${props => props.theme.colors.primaryHover};
  }

  /* Drag and drop */
  .drag-over {
    background-color: ${props => props.theme.colors.surface};
    border: 2px dashed ${props => props.theme.colors.primary};
  }

  /* Progress bar animations */
  @keyframes progress {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 40px 0;
    }
  }

  .progress-animated {
    animation: progress 1s linear infinite;
  }

  /* Tooltips */
  .tooltip {
    position: relative;
  }

  .tooltip::before {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.text};
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
    border-radius: ${props => props.theme.borderRadius.sm};
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
    z-index: 1000;
  }

  .tooltip:hover::before {
    opacity: 1;
  }

  /* Context menu */
  .context-menu {
    position: fixed;
    background: ${props => props.theme.colors.surface};
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.md};
    box-shadow: ${props => props.theme.shadows.lg};
    z-index: 10000;
    min-width: 150px;
  }

  .context-menu-item {
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.sm};
    transition: background-color 0.2s;
  }

  .context-menu-item:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }

  .context-menu-item:first-child {
    border-radius: ${props => props.theme.borderRadius.md} ${props => props.theme.borderRadius.md} 0 0;
  }

  .context-menu-item:last-child {
    border-radius: 0 0 ${props => props.theme.borderRadius.md} ${props => props.theme.borderRadius.md};
  }

  .context-menu-separator {
    height: 1px;
    background: ${props => props.theme.colors.border};
    margin: ${props => props.theme.spacing.xs} 0;
  }

  /* Loading spinner */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  /* Fade in animation */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }

  /* Slide in animation */
  @keyframes slideIn {
    from { transform: translateY(-10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .slide-in {
    animation: slideIn 0.3s ease-out;
  }
`;

export default GlobalStyle;
