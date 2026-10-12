import { StyleSheet, View } from 'react-native';
import { colors, radius, space } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

interface EmptyProps {
  icon: IconName;
  title: string;
  body: string;
  action?: { label: string; onPress: () => void; icon?: IconName };
  secondary?: { label: string; onPress: () => void };
}

/** An empty screen is an invitation to act, so it always says what to do next. */
export function EmptyState({ icon, title, body, action, secondary }: EmptyProps) {
  return (
    <View style={styles.block}>
      <View style={styles.badge}>
        <Icon name={icon} size={22} color={colors.patina} />
      </View>
      <View style={{ gap: 6 }}>
        <AppText variant="heading">{title}</AppText>
        <AppText tone="soft">{body}</AppText>
      </View>
      {action ? <Button title={action.label} icon={action.icon} onPress={action.onPress} style={{ alignSelf: 'stretch' }} /> : null}
      {secondary ? <Button title={secondary.label} variant="quiet" onPress={secondary.onPress} style={{ alignSelf: 'stretch' }} /> : null}
    </View>
  );
}

/** Says what failed and offers one way to retry. No apology, no vagueness. */
export function ErrorState({ title = 'Couldn’t load this', body, onRetry }: { title?: string; body: string; onRetry?: () => void }) {
  return (
    <View style={styles.block} accessibilityLiveRegion="polite">
      <View style={[styles.badge, { backgroundColor: colors.brickTint }]}>
        <Icon name="alert-circle" size={22} color={colors.brick} />
      </View>
      <View style={{ gap: 6 }}>
        <AppText variant="heading">{title}</AppText>
        <AppText tone="soft">{body}</AppText>
      </View>
      {onRetry ? <Button title="Try again" icon="refresh-cw" variant="secondary" onPress={onRetry} style={{ alignSelf: 'stretch' }} /> : null}
    </View>
  );
}

/** Static placeholder rows. Deliberately not animated. */
export function SkeletonRows({ count = 5, icon = true }: { count?: number; icon?: boolean }) {
  return (
    <View style={styles.skelWrap} accessibilityLabel="Loading" accessibilityLiveRegion="polite">
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.skelRow}>
          {icon ? <View style={styles.skelIcon} /> : null}
          <View style={{ flex: 1, gap: 8 }}>
            <View style={[styles.bar, { width: `${62 - (i % 3) * 9}%` }]} />
            <View style={[styles.bar, { width: `${38 + (i % 2) * 12}%`, height: 10 }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

type BannerTone = 'info' | 'warn' | 'bad' | 'good';
const bannerTones = {
  info: { bg: colors.patinaTint, fg: colors.patina, icon: 'info' as IconName },
  good: { bg: colors.patinaTint, fg: colors.patina, icon: 'check-circle' as IconName },
  warn: { bg: colors.brassTint, fg: colors.brassInk, icon: 'alert-triangle' as IconName },
  bad: { bg: colors.brickTint, fg: colors.brick, icon: 'alert-circle' as IconName },
};

export function Banner({ tone = 'info', title, body }: { tone?: BannerTone; title: string; body?: string }) {
  const t = bannerTones[tone];
  return (
    <View style={[styles.banner, { backgroundColor: t.bg }]} accessibilityLiveRegion="polite">
      <Icon name={t.icon} size={18} color={t.fg} />
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="bodyMedium" style={{ color: t.fg }}>{title}</AppText>
        {body ? <AppText variant="small" tone="soft">{body}</AppText> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { paddingHorizontal: space.xl, paddingVertical: space.x3, gap: space.xl },
  badge: { width: 48, height: 48, borderRadius: radius.field, backgroundColor: colors.patinaTint, alignItems: 'center', justifyContent: 'center' },
  skelWrap: { backgroundColor: colors.folio, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.rule },
  skelRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 68, paddingHorizontal: space.xl, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.rule },
  skelIcon: { width: 38, height: 38, borderRadius: radius.chip, backgroundColor: colors.paper },
  bar: { height: 13, borderRadius: 3, backgroundColor: colors.paper },
  banner: { flexDirection: 'row', gap: space.md, padding: space.lg, borderRadius: radius.field, alignItems: 'flex-start' },
});
