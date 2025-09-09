export const theme = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    },
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
      950: '#3b0764'
    },
    accent: {
      light: '#60a5fa',
      DEFAULT: '#3730a3',
      dark: '#1e1b4b'
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: {
      light: '#ffffff',
      dark: '#0f172a'
    },
    surface: {
      light: '#f8fafc',
      dark: '#1e293b'
    },
    text: {
      primary: {
        light: '#0f172a',
        dark: '#f1f5f9'
      },
      secondary: {
        light: '#475569',
        dark: '#94a3b8'
      },
      muted: {
        light: '#64748b',
        dark: '#64748b'
      }
    }
  },
  gradients: {
    primary: 'linear-gradient(135deg, #60a5fa 0%, #3730a3 100%)',
    secondary: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
    accent: 'linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)',
    glow: 'radial-gradient(circle, #60a5fa 0%, #3730a3 100%)',
    surface: {
      light: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      dark: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
    }
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    glow: '0 0 20px rgba(96, 165, 250, 0.4)',
    'glow-lg': '0 0 40px rgba(96, 165, 250, 0.6)'
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  },
  glassmorphism: {
    light: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)'
    },
    dark: {
      background: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }
  }
};

export type Theme = typeof theme;