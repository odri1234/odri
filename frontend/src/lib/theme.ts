// ODRI WiFi Management System Theme Configuration
// Modern, professional theme with beautiful gradients and colors

export const theme = {
  // Color Palette - Modern and Professional
  colors: {
    // Primary Colors - Blue to Purple Gradient
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
      950: '#172554',
    },

    // Secondary Colors - Purple Gradient
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87',
      950: '#3b0764',
    },

    // Success Colors - Green Gradient
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },

    // Warning Colors - Orange Gradient
    warning: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
      950: '#431407',
    },

    // Error Colors - Red Gradient
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },

    // Neutral Colors - Gray Scale
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },

    // Special Colors for ODRI Brand
    odri: {
      // Brand Colors
      brand: {
        primary: '#3b82f6', // Blue
        secondary: '#8b5cf6', // Purple
        accent: '#06b6d4', // Cyan
        success: '#10b981', // Emerald
        warning: '#f59e0b', // Amber
        error: '#ef4444', // Red
      },

      // Gradient Colors
      gradients: {
        primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        warning: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        error: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        dark: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        light: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      },

      // Glass Morphism Colors
      glass: {
        primary: 'rgba(59, 130, 246, 0.1)',
        secondary: 'rgba(139, 92, 246, 0.1)',
        success: 'rgba(16, 185, 129, 0.1)',
        warning: 'rgba(245, 158, 11, 0.1)',
        error: 'rgba(239, 68, 68, 0.1)',
        neutral: 'rgba(255, 255, 255, 0.1)',
        dark: 'rgba(0, 0, 0, 0.1)',
      },
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
      display: ['Poppins', 'system-ui', 'sans-serif'],
    },

    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
      '8xl': '6rem',
      '9xl': '8rem',
    },

    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },

    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },

  // Spacing
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
  },

  // Transitions
  transitions: {
    duration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms',
    },

    timing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Z-Index
  zIndex: {
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    auto: 'auto',
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modalBackdrop: '1040',
    modal: '1050',
    popover: '1060',
    tooltip: '1070',
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// Component-specific theme configurations
export const componentThemes = {
  // Card Themes
  card: {
    default: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    },
    elevated: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      shadow: '0 12px 40px 0 rgba(31, 38, 135, 0.45)',
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      shadow: '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
    },
  },

  // Button Themes
  button: {
    primary: {
      background: theme.colors.odri.gradients.primary,
      color: 'white',
      hover: {
        transform: 'translateY(-2px)',
        shadow: theme.shadows.lg,
      },
    },
    secondary: {
      background: theme.colors.odri.gradients.secondary,
      color: 'white',
      hover: {
        transform: 'translateY(-2px)',
        shadow: theme.shadows.lg,
      },
    },
    success: {
      background: theme.colors.odri.gradients.success,
      color: 'white',
      hover: {
        transform: 'translateY(-2px)',
        shadow: theme.shadows.lg,
      },
    },
    warning: {
      background: theme.colors.odri.gradients.warning,
      color: 'white',
      hover: {
        transform: 'translateY(-2px)',
        shadow: theme.shadows.lg,
      },
    },
    error: {
      background: theme.colors.odri.gradients.error,
      color: 'white',
      hover: {
        transform: 'translateY(-2px)',
        shadow: theme.shadows.lg,
      },
    },
  },

  // Metric Card Themes
  metricCard: {
    blue: {
      background: theme.colors.odri.gradients.primary,
      iconBackground: 'rgba(255, 255, 255, 0.2)',
      iconColor: 'white',
    },
    green: {
      background: theme.colors.odri.gradients.success,
      iconBackground: 'rgba(255, 255, 255, 0.2)',
      iconColor: 'white',
    },
    purple: {
      background: theme.colors.odri.gradients.secondary,
      iconBackground: 'rgba(255, 255, 255, 0.2)',
      iconColor: 'white',
    },
    orange: {
      background: theme.colors.odri.gradients.warning,
      iconBackground: 'rgba(255, 255, 255, 0.2)',
      iconColor: 'white',
    },
  },

  // Status Indicators
  status: {
    online: {
      color: theme.colors.success[500],
      background: theme.colors.success[50],
      border: `1px solid ${theme.colors.success[200]}`,
    },
    offline: {
      color: theme.colors.error[500],
      background: theme.colors.error[50],
      border: `1px solid ${theme.colors.error[200]}`,
    },
    warning: {
      color: theme.colors.warning[500],
      background: theme.colors.warning[50],
      border: `1px solid ${theme.colors.warning[200]}`,
    },
    maintenance: {
      color: theme.colors.neutral[500],
      background: theme.colors.neutral[50],
      border: `1px solid ${theme.colors.neutral[200]}`,
    },
  },
};

// Animation configurations
export const animations = {
  // Fade animations
  fade: {
    in: {
      opacity: [0, 1],
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    out: {
      opacity: [1, 0],
      transition: { duration: 0.3, ease: 'easeIn' },
    },
  },

  // Slide animations
  slide: {
    up: {
      y: [20, 0],
      opacity: [0, 1],
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    down: {
      y: [-20, 0],
      opacity: [0, 1],
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    left: {
      x: [20, 0],
      opacity: [0, 1],
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    right: {
      x: [-20, 0],
      opacity: [0, 1],
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  },

  // Scale animations
  scale: {
    in: {
      scale: [0.9, 1],
      opacity: [0, 1],
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    out: {
      scale: [1, 0.9],
      opacity: [1, 0],
      transition: { duration: 0.3, ease: 'easeIn' },
    },
  },

  // Loading animations
  loading: {
    spin: {
      rotate: [0, 360],
      transition: { duration: 1, repeat: Infinity, ease: 'linear' },
    },
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.7, 1],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
    bounce: {
      y: [0, -10, 0],
      transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
    },
  },
};

// Utility functions for theme usage
export const themeUtils = {
  // Get gradient background
  getGradient: (type: keyof typeof theme.colors.odri.gradients) => {
    return theme.colors.odri.gradients[type];
  },

  // Get glass morphism background
  getGlass: (type: keyof typeof theme.colors.odri.glass) => {
    return theme.colors.odri.glass[type];
  },

  // Get component theme
  getComponentTheme: (component: keyof typeof componentThemes, variant: string) => {
    return componentThemes[component][variant] || componentThemes[component].default;
  },

  // Get animation
  getAnimation: (type: keyof typeof animations, variant: string) => {
    return animations[type][variant];
  },

  // Create custom gradient
  createGradient: (colors: string[], direction: string = '135deg') => {
    return `linear-gradient(${direction}, ${colors.join(', ')})`;
  },

  // Create glass morphism effect
  createGlass: (color: string, opacity: number = 0.1, blur: number = 12) => {
    return {
      background: `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
      backdropFilter: `blur(${blur}px)`,
    };
  },
};

export default theme;






