import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, space } from '@/theme';
import { AppText, type Tone } from './AppText';
import { Icon, type IconName } from './Icon';

/** A ruled strip of rows. Rows sit on the folio surface between hairlines, like a register. */
export function Register({ children }: { children: ReactNode }) {
  return <View style={styles.register}>{children}</View>;
}

const iconTones = {
  patina: { bg: colors.patinaTint, fg: colors.patina },
  brass: { bg: colors.brassTint, fg: colors.brassInk },
  brick: { bg: colors.brickTint, fg: colors.brick },
} as const;

interface EntryProps {
  title: string;
  subtitle?: string;
  subtitleTone?: Tone;
  icon?: IconName;
  iconTone?: keyof typeof iconTones;
  meta?: string;
  metaSub?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  titleLines?: number;
}

export function Entry({ title, subtitle, subtitleTone = 'muted', icon, iconTone = 'patina', meta, metaSub, trailing, onPress, chevron, titleLines = 1 }: EntryProps) {
  const showChevron = chevron ?? !!onPress;
  const body = (
    <>
      {icon ? (
        <View style={[styles.icon, { backgroundColor: iconTones[iconTone].bg }]}>
          <Icon name={icon} size={18} color={iconTones[iconTone].fg} />
        </View>
      ) : null}
      <View style={styles.text}>
        <AppText variant="bodyMedium" numberOfLines={titleLines}>{title}</AppText>
        {subtitle ? <AppText variant="small" tone={subtitleTone} numberOfLines={2}>{subtitle}</AppText> : null}
      </View>
      {meta || metaSub ? (
        <View style={styles.meta}>
          {meta ? <AppText variant="figureSmall">{meta}</AppText> : null}
          {metaSub}
        </View>
      ) : null}
      {trailing}
      {showChevron ? <Icon name="chevron-right" size={18} color={colors.ruleStrong} /> : null}
    </>
  );
  if (!onPress) return <View style={styles.row}>{body}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[title, subtitle, meta].filter(Boolean).join(', ')}
      android_ripple={{ color: colors.patinaTint }}
      style={styles.row}
    >
      {body}
    </Pressable>
  );
}

export function SectionHeader({ title, count, action }: { title: string; count?: number; action?: { label: string; onPress: () => void } }) {
  return (
    <View style={styles.section}>
      <AppText variant="heading" accessibilityRole="header" style={{ flex: 1 }}>
        {title}
        {count !== undefined ? <AppText variant="heading" tone="muted">{`  ${count}`}</AppText> : null}
      </AppText>
      {action ? (
        <Pressable onPress={action.onPress} hitSlop={10} accessibilityRole="button" accessibilityLabel={action.label}>
          <AppText variant="label" tone="patina">{action.label}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function KeyValue({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.kv, last && { borderBottomWidth: 0 }]}>
      <AppText variant="small" tone="muted" style={{ width: 112 }}>{label}</AppText>
      <AppText variant="body" style={{ flex: 1, textAlign: 'right' }}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  register: { backgroundColor: colors.folio, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.rule },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 64,
    paddingVertical: space.md, paddingHorizontal: space.xl,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.rule, backgroundColor: colors.folio,
  },
  icon: { width: 38, height: 38, borderRadius: radius.chip, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  meta: { alignItems: 'flex-end', gap: 3 },
  section: { flexDirection: 'row', alignItems: 'baseline', paddingHorizontal: space.xl, paddingTop: space.x3, paddingBottom: space.md },
  kv: {
    flexDirection: 'row', alignItems: 'flex-start', gap: space.md, paddingVertical: 13, paddingHorizontal: space.xl,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.rule, backgroundColor: colors.folio,
  },
});
