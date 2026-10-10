import { Text, type TextProps } from 'react-native';
import { colors, type TypeVariant, type } from '@/theme';

export type Tone = 'ink' | 'soft' | 'muted' | 'patina' | 'brick' | 'brass' | 'inverse';

export const toneColor: Record<Tone, string> = {
  ink: colors.ink,
  soft: colors.inkSoft,
  muted: colors.muted,
  patina: colors.patina,
  brick: colors.brick,
  brass: colors.brassInk,
  inverse: colors.folio,
};

interface Props extends TextProps {
  variant?: TypeVariant;
  tone?: Tone;
}

export function AppText({ variant = 'body', tone = 'ink', style, ...rest }: Props) {
  return <Text maxFontSizeMultiplier={1.3} {...rest} style={[type[variant], { color: toneColor[tone] }, style]} />;
}
