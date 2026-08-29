import '@/global.css';

import { Platform } from 'react-native';

export const Palette = {
  forestDark: '#093322',
  forestCard: '#062E1E',
  forest: '#174D2D',
  green: '#247A43',
  leaf: '#46A35F',
  emerald: '#10B981',
  emeraldLight: '#D1FAE5',
  mint: '#E8F5EB',
  mintDark: '#D2E8D7',
  paleMint: '#F3F9F4',
  pillTeal: '#0F766E',
  stageReproductive: '#F97316',
  stageMaturation: '#064E3B',
  sun: '#F3B63F',
  earth: '#8B5A2B',
  tomato: '#EF4444',
  ink: '#17201A',
  muted: '#68746C',
  line: '#E2EAE4',
  white: '#FFFFFF',
  canvas: '#F4F7F4',
} as const;

export const Colors = {
  light: {
    text: Palette.ink,
    background: Palette.canvas,
    backgroundElement: Palette.white,
    backgroundSelected: Palette.mint,
    textSecondary: Palette.muted,
  },
  dark: {
    text: '#F1F7F2',
    background: '#0D1710',
    backgroundElement: '#152219',
    backgroundSelected: '#1D3826',
    textSecondary: '#A7B5AB',
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
  six: 48,
  seven: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 82, android: 84, web: 88 }) ?? 84;
export const MaxContentWidth = 1120;
