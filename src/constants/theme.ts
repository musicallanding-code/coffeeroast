/**
 * App color tokens (light + dark). Keep both palettes with identical keys.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1C140D',
    textSecondary: '#6B5B4D',
    background: '#FBF7F2',
    backgroundElement: '#F1E9DF',
    backgroundSelected: '#E4D6C6',
    border: '#E0D4C4',
    tint: '#8A4B2B',
    tintText: '#FFFFFF',
    accent: '#C2410C',
    danger: '#B42318',
    success: '#1A7F4B',
    beanTemp: '#B4470F',
    drumTemp: '#7C7CA8',
    ror: '#1A7F4B',
    marker: '#3B2417',
  },
  dark: {
    text: '#F4EBE1',
    textSecondary: '#B6A794',
    background: '#17110C',
    backgroundElement: '#241B13',
    backgroundSelected: '#33261A',
    border: '#3A2C1F',
    tint: '#D98A5F',
    tintText: '#1C140D',
    accent: '#F97316',
    danger: '#F97066',
    success: '#4ED08A',
    beanTemp: '#F59E5B',
    drumTemp: '#A6A6D6',
    ror: '#4ED08A',
    marker: '#E7D8C6',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
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
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
