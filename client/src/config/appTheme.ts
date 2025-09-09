export const appTheme = {
  colors: {
    robot: {
      primary: '#60a5fa',
      secondary: '#3730a3',
      glow: '#0ea5e9',
      accent: '#10b981'
    },
    
    primary: {
      light: '#10b981',
      DEFAULT: '#059669',
      dark: '#047857'
    },
    
    secondary: {
      light: '#14b8a6',
      DEFAULT: '#0d9488',
      dark: '#0f766e'
    },
    
    accent: {
      orange: '#f97316',
      amber: '#f59e0b',
      rose: '#f43f5e'
    },
    
    status: {
      success: '#22c55e',
      warning: '#eab308',
      error: '#ef4444',
      info: '#3b82f6'
    },
    
    neutral: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
      950: '#09090b'
    },
    
    background: {
      light: '#ffffff',
      lightAlt: '#fafafa',
      dark: '#0f172a',
      darkAlt: '#1e293b'
    },
    
    text: {
      primary: {
        light: '#18181b',
        dark: '#fafafa'
      },
      secondary: {
        light: '#52525b',
        dark: '#a1a1aa'
      },
      muted: {
        light: '#71717a',
        dark: '#71717a'
      }
    }
  },
  
  gradients: {
    robot: 'radial-gradient(circle, #60a5fa 0%, #3730a3 100%)',
    primary: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
    secondary: 'linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)',
    warm: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
    cool: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    sunset: 'linear-gradient(135deg, #f97316 0%, #f43f5e 100%)',
    
    surface: {
      light: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
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
    emerald: '0 0 20px rgba(16, 185, 129, 0.3)',
    teal: '0 0 20px rgba(20, 184, 166, 0.3)'
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
  }
};

export type AppTheme = typeof appTheme;