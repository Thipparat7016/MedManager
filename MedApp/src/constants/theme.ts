import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1E293B',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    background: '#FFFFFF',
    backgroundSecondary: '#F8FAFC',
    backgroundElement: '#F1F5F9',
    backgroundSelected: '#EDE9FE',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    
    // Brand & Accent Colors matching the designs
    primary: '#8B95F6',
    primaryLight: '#EEF0FF',
    primaryDark: '#6366F1',
    primaryHover: '#7C83FD',

    // Soft Category / Quick Action Palette
    purpleSoft: '#F1F3FE',
    purpleSoftText: '#5B68E4',
    
    greenSoft: '#EBF8F1',
    greenSoftText: '#10B981',
    greenBorder: '#BBF7D0',
    
    pinkSoft: '#FEEFEF',
    pinkSoftText: '#EF4444',
    pinkBorder: '#FECACA',
    
    blueSoft: '#EBF4FE',
    blueSoftText: '#3B82F6',
    blueBorder: '#BFDBFE',

    orangeSoft: '#FEF4EB',
    orangeSoftText: '#F97316',
    orangeBorder: '#FED7AA',

    yellowSoft: '#FEFBEB',
    yellowSoftText: '#D97706',
    yellowBorder: '#FEF08A',

    // Status Badges & Alerts
    severityHigh: {
      bg: '#FEE2E2',
      text: '#DC2626',
      border: '#FCA5A5',
      tag: 'สูง',
    },
    severityMed: {
      bg: '#FFEDD5',
      text: '#EA580C',
      border: '#FDBA74',
      tag: 'กลาง',
    },
    severityLow: {
      bg: '#FEF9C3',
      text: '#CA8A04',
      border: '#FDE047',
      tag: 'ต่ำ',
    },
    statusSuccess: {
      bg: '#DCFCE7',
      text: '#16A34A',
      border: '#86EFAC',
    },
    statusPending: {
      bg: '#FEF3C7',
      text: '#D97706',
      border: '#FDE68A',
    },
    statusPassed: {
      bg: '#F1F5F9',
      text: '#94A3B8',
      border: '#E2E8F0',
    },
  },
  dark: {
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    backgroundElement: '#334155',
    backgroundSelected: '#3730A3',
    border: '#334155',
    borderLight: '#1E293B',
    
    primary: '#8B95F6',
    primaryLight: '#312E81',
    primaryDark: '#6366F1',
    primaryHover: '#7C83FD',

    purpleSoft: '#1E1B4B',
    purpleSoftText: '#A5B4FC',
    greenSoft: '#064E3B',
    greenSoftText: '#6EE7B7',
    greenBorder: '#065F46',
    pinkSoft: '#4C0519',
    pinkSoftText: '#FDA4AF',
    pinkBorder: '#9F1239',
    blueSoft: '#172554',
    blueSoftText: '#93C5FD',
    blueBorder: '#1E40AF',
    orangeSoft: '#431407',
    orangeSoftText: '#FDBA74',
    orangeBorder: '#9A3412',
    yellowSoft: '#422006',
    yellowSoftText: '#FDE047',
    yellowBorder: '#854D0E',

    severityHigh: {
      bg: '#7F1D1D',
      text: '#FCA5A5',
      border: '#991B1B',
      tag: 'สูง',
    },
    severityMed: {
      bg: '#7C2D12',
      text: '#FDBA74',
      border: '#9A3412',
      tag: 'กลาง',
    },
    severityLow: {
      bg: '#713F12',
      text: '#FEF08A',
      border: '#854D0E',
      tag: 'ต่ำ',
    },
    statusSuccess: {
      bg: '#064E3B',
      text: '#86EFAC',
      border: '#047857',
    },
    statusPending: {
      bg: '#78350F',
      text: '#FDE68A',
      border: '#92400E',
    },
    statusPassed: {
      bg: '#1E293B',
      text: '#64748B',
      border: '#334155',
    },
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    medium: 'system-ui',
    bold: 'system-ui',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    medium: 'normal',
    bold: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Thai", sans-serif',
    medium: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Thai", sans-serif',
    bold: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Thai", sans-serif',
    mono: 'monospace',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 9999,
} as const;

export const BottomTabInset = Platform.select({ ios: 65, android: 70 }) ?? 65;
export const MaxContentWidth = 600;
