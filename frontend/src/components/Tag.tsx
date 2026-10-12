import { StyleSheet, View } from 'react-native';
import { colors, radius } from '@/theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

type Tone = 'neutral' | 'good' | 'warn' | 'bad' | 'seal';
const tones = {
  neutral: { bg: colors.paper, fg: colors.inkSoft },
  good: { bg: colors.patinaTint, fg: colors.patina },
  warn: { bg: colors.brassTint, fg: colors.brassInk },
  bad: { bg: colors.brickTint, fg: colors.brick },
  seal: { bg: colors.brassTint, fg: colors.brassInk },
} as const;

export function Tag({ label, tone = 'neutral', icon }: { label: string; tone?: Tone; icon?: IconName }) {
  const t = tones[tone];
  return (
    <View style={[styles.tag, { backgroundColor: t.bg }]}>
      {icon ? <Icon name={icon} size={12} color={tone === 'seal' ? colors.brass : t.fg} /> : null}
      <AppText variant="caption" style={{ color: t.fg }}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', borderRadius: radius.chip, paddingHorizontal: 7, paddingVertical: 2 },
});
