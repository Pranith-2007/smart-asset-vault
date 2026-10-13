
import type { TextStyle } from 'react-native';

/** Smart Asset Vault — clean, colourful, accessible design system. */
export const colors = {
  // App surfaces
  paper: '#FFFFFF',
  folio: '#FFFFFF',

  // Text
  ink: '#243247',
  inkSoft: '#4D5D70',
  muted: '#68788B',
  placeholder: '#8B98A7',

  // Borders
  rule: '#E0E7EF',
  ruleStrong: '#C8D3DF',

  // Primary green: actions and success
  patina: '#24734D',
  patinaPressed: '#195B3B',
  patinaTint: '#E3F3E8',

  // Saffron: warnings and important dates
  brass: '#995600',
  brassInk: '#80500D',
  brassTint: '#FFF0D8',

  // Red: errors and critical alerts
  brick: '#B33D36',
  brickTint: '#FCE9E7',

  // Blue: identity and information
  blue: '#285BA6',
  bluePressed: '#204983',
  blueTint: '#E3EEFF',
  blueSoft: '#F3F7FB',

  // Purple: security and permissions
  purple: '#7042A5',
  purpleTint: '#F0E8FF',

  // Shared UI
  scrim: 'rgba(36,50,71,0.42)',
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  x3: 32,
  x4: 40,
} as const;

export const radius = {
  chip: 8,
  field: 10,
  panel: 12,
  card: 16,
  sheet: 20,
  round: 999,
} as const;

/** Category colours for featured document cards. */
export const docTints = {
  blue: {
    bg: '#E3EEFF',
    fg: '#285BA6',
  },
  saffron: {
    bg: '#FFF0D8',
    fg: '#995600',
  },
  green: {
    bg: '#E3F3E8',
    fg: '#24734D',
  },
  purple: {
    bg: '#F0E8FF',
    fg: '#7042A5',
  },
} as const;

/** Keep existing font names to avoid breaking current component references. */
export const fonts = {
  serif: 'InstrumentSans_600SemiBold',
  serifRegular: 'InstrumentSans_400Regular',
  serifSemi: 'InstrumentSans_600SemiBold',
  sans: 'InstrumentSans_400Regular',
  sansMedium: 'InstrumentSans_500Medium',
  sansSemi: 'InstrumentSans_600SemiBold',
} as const;

export type TypeVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'headline'
  | 'cardTitle'
  | 'figure'
  | 'figureSmall'
  | 'bodyLarge'
  | 'body'
  | 'bodyMedium'
  | 'label'
  | 'small'
  | 'caption';

export const type: Record<TypeVariant, TextStyle> = {
  display: {
    fontFamily: fonts.sansSemi,
    fontSize: 32,
    lineHeight: 39,
    letterSpacing: -0.4,
  },
  title: {
    fontFamily: fonts.sansSemi,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.2,
  },
  heading: {
    fontFamily: fonts.sansSemi,
    fontSize: 20,
    lineHeight: 26,
  },
  headline: {
    fontFamily: fonts.sansSemi,
    fontSize: 22,
    lineHeight: 28,
  },
  cardTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 20,
    lineHeight: 26,
  },
  figure: {
    fontFamily: fonts.sansSemi,
    fontSize: 30,
    lineHeight: 36,
    fontVariant: ['tabular-nums'],
  },
  figureSmall: {
    fontFamily: fonts.sansMedium,
    fontSize: 18,
    lineHeight: 24,
    fontVariant: ['tabular-nums'],
  },
  bodyLarge: {
    fontFamily: fonts.sans,
    fontSize: 17,
    lineHeight: 25,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 23,
  },
  bodyMedium: {
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    lineHeight: 22,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  small: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fonts.sansMedium,
    fontSize: 12.5,
    lineHeight: 17,
  },
};
