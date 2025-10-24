/**
 * 极简主义设计系统
 * Minimalist Design System for PartFlow
 */

export const colors = {
  // 主色调 - 柔和的蓝灰色
  primary: '#2C3E50',
  primaryLight: '#34495E',
  primaryDark: '#1A252F',
  
  // 强调色 - 清新的青色
  accent: '#3498DB',
  accentLight: '#5DADE2',
  accentDark: '#2874A6',
  
  // 中性色
  white: '#FFFFFF',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // 语义色
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB',
  
  // 背景色
  background: '#FAFAFA',
  surface: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const typography = {
  // 字体家族
  fontFamily: {
    base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace',
  },
  
  // 字体大小
  fontSize: {
    xs: '11px',
    sm: '13px',
    base: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '32px',
  },
  
  // 字重
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // 行高
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '48px',
  '5xl': '64px',
};

export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 2px 8px rgba(0, 0, 0, 0.08)',
  lg: '0 4px 16px rgba(0, 0, 0, 0.1)',
  xl: '0 8px 32px rgba(0, 0, 0, 0.12)',
};

export const transitions = {
  fast: '150ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '300ms ease-in-out',
};

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
};

// 全局样式
export const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: ${typography.fontFamily.base};
    font-size: ${typography.fontSize.base};
    line-height: ${typography.lineHeight.normal};
    color: ${colors.gray900};
    background-color: ${colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  button {
    font-family: ${typography.fontFamily.base};
    cursor: pointer;
    border: none;
    outline: none;
  }
  
  input, textarea, select {
    font-family: ${typography.fontFamily.base};
    outline: none;
  }
  
  a {
    text-decoration: none;
    color: inherit;
  }
`;

// 常用组件样式
export const components = {
  button: {
    base: {
      padding: `${spacing.sm} ${spacing.lg}`,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      borderRadius: borderRadius.md,
      transition: transitions.base,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      cursor: 'pointer',
      border: 'none',
      outline: 'none',
    },
    primary: {
      backgroundColor: colors.accent,
      color: colors.white,
      ':hover': {
        backgroundColor: colors.accentLight,
      },
    },
    secondary: {
      backgroundColor: colors.gray100,
      color: colors.gray900,
      ':hover': {
        backgroundColor: colors.gray200,
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.gray700,
      ':hover': {
        backgroundColor: colors.gray100,
      },
    },
  },
  
  card: {
    base: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      boxShadow: shadows.sm,
      border: `1px solid ${colors.gray200}`,
      transition: transitions.base,
    },
    hover: {
      boxShadow: shadows.md,
      borderColor: colors.gray300,
    },
  },
  
  input: {
    base: {
      width: '100%',
      padding: `${spacing.md} ${spacing.lg}`,
      fontSize: typography.fontSize.sm,
      backgroundColor: colors.surface,
      border: `1px solid ${colors.gray300}`,
      borderRadius: borderRadius.md,
      transition: transitions.base,
      ':focus': {
        borderColor: colors.accent,
        boxShadow: `0 0 0 3px ${colors.accent}20`,
      },
    },
  },
  
  badge: {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: `${spacing.xs} ${spacing.sm}`,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      borderRadius: borderRadius.full,
      backgroundColor: colors.gray100,
      color: colors.gray700,
    },
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  globalStyles,
  components,
};

