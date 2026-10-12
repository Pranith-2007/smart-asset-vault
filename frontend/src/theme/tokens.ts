import type { TextStyle } from 'react-native';

/**
 * Design tokens for "The Registry" direction.
 * Green is structure and action. Brass is reserved for one meaning: a certified copy.
 */
export const colors = {
  paper: '#E8EBE8', // app ground, cool slate paper
  folio: '#F6F7F5', // raised surface: rows, fields, sheets
  ink: '#16211E',
  inkSoft: '#3F4D49',
  muted: '#56635F',
  placeholder: '#7C8984',
  rule: '#CBD1CD',
  ruleStrong: '#A9B3AE',
  patina: '#1B4D45',
  patinaPressed: '#143B35',
  patinaTint: '#DAE6E1',
  brass: '#A9843A',
  brassInk: '#76591C',
  brassTint: '#F0E7D0',
  brick: '#9E3B2B',
  brickTint: '#F2DED9',
  scrim: 'rgba(22,33,30,0.45)',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, x3: 32, x4: 40 } as const;

/** Radius is graded by role, never one value for everything. */
export const radius = { chip: 4, field: 6, panel: 10, sheet: 18, round: 999 } as const;

export const fonts = {
  serif: 'Newsreader_500Medium',
  serifRegular: 'Newsreader_400Regular',
  serifSemi: 'Newsreader_600SemiBold',
  sans: 'InstrumentSans_400Regular',
  sansMedium: 'InstrumentSans_500Medium',
  sansSemi: 'InstrumentSans_600SemiBold',
} as const;

export type TypeVariant =
  | 'display' | 'title' | 'heading' | 'figure' | 'figureSmall'
  | 'bodyLarge' | 'body' | 'bodyMedium' | 'label' | 'small' | 'caption';

export const type: Record<TypeVariant, TextStyle> = {
  display: { fontFamily: fonts.serif, fontSize: 34, lineHeight: 39, letterSpacing: -0.5 },
  title: { fontFamily: fonts.serif, fontSize: 27, lineHeight: 32, letterSpacing: -0.3 },
  heading: { fontFamily: fonts.serifSemi, fontSize: 20, lineHeight: 26, letterSpacing: -0.1 },
  figure: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 34, fontVariant: ['tabular-nums'] },
  figureSmall: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 23, fontVariant: ['tabular-nums'] },
  bodyLarge: { fontFamily: fonts.sans, fontSize: 17, lineHeight: 25 },
  body: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 23 },
  bodyMedium: { fontFamily: fonts.sansMedium, fontSize: 16, lineHeight: 22 },
  label: { fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 20 },
  small: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.sansMedium, fontSize: 12.5, lineHeight: 17 },
};
