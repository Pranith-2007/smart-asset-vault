import { Platform } from 'react-native';

/**
 * Landing-page design tokens.
 * Surfaces: dark forest panels carry light text, mint/off-white panels carry dark forest text,
 * lime carries dark text. Never put green text on a green surface.
 */
export const pal = {
  frame: '#0A2418', // page behind the gradient shell
  forestInk: '#0B2A1E',
  forestDeep: '#0D3A22',
  forest: '#14532D',
  green: '#15803D',
  greenText: '#166534', // small green text on light/mint panels (6:1+)
  emerald: '#10B981',
  lime: '#C8F542',
  limeSoft: '#E4FAA0',
  white: '#FFFFFF',
  offWhite: '#F7FAF7',
  mint: '#E8F5E9',
  mintDeep: '#D1EBD6',
  text: '#17251D',
  muted: '#4B5D52', // on white / mint: > 6:1
  onDark: '#EAF6EC',
  mutedOnDark: '#A9C9B6', // on forest: > 6:1
  line: 'rgba(20,83,45,0.12)',
  lineOnDark: 'rgba(255,255,255,0.14)',
} as const;

/** One spacing scale for the whole page. */
export const sp = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, x3: 40, x4: 56, x5: 72 } as const;

export const radii = { tile: 14, card: 24, pill: 999 } as const;

export const font = {
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemi: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
  sansXBold: 'Inter_800ExtraBold',
  mono: 'RobotoMono_500Medium',
  monoBold: 'RobotoMono_700Bold',
} as const;

export const isWeb = Platform.OS === 'web';

/** Applies web-only style keys (gradients, transitions, outlines). Native ignores them. */
export const web = (style: Record<string, unknown>): any => (isWeb ? style : {});

const soft = (px: number, a: number) => `0 ${px}px ${px * 2.4}px rgba(11,42,30,${a})`;
const mk = (px: number, a: number, elevation: number): any =>
  isWeb
    ? { boxShadow: soft(px, a) }
    : { elevation, shadowColor: pal.forestInk, shadowOpacity: a, shadowRadius: px * 1.6, shadowOffset: { width: 0, height: px } };

export const shadow = { sm: mk(4, 0.1, 2), md: mk(10, 0.14, 5), lg: mk(22, 0.22, 10) };
