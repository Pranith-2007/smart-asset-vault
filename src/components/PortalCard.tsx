import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, space } from '@/theme';
import type { Portal, PortalId } from '@/domain/portals';
import { AppText } from './AppText';
import { Button } from './Button';
import { Icon } from './Icon';

/** Each portal gets its own icon-tile treatment, all drawn from the existing palette. */
const tiles: Record<PortalId, { bg: string; fg: string; border: string }> = {
  personal: { bg: colors.patina, fg: colors.folio, border: colors.patina },
  organisation: { bg: colors.ink, fg: colors.folio, border: colors.ink },
  government: { bg: colors.patinaTint, fg: colors.patina, border: colors.patina },
};

export function PortalCard({ portal, onPress }: { portal: Portal; onPress: () => void }) {
  const t = tiles[portal.id];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${portal.title}. ${portal.audience}. ${portal.summary}`}
      android_ripple={{ color: colors.patinaTint }}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.top}>
        <View style={[styles.tile, { backgroundColor: t.bg, borderColor: t.border }]}>
          <Icon name={portal.icon} size={22} color={t.fg} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="heading">{portal.title}</AppText>
          <AppText variant="caption" tone="muted">{portal.audience}</AppText>
        </View>
        <Icon name="chevron-right" size={20} color={colors.ruleStrong} />
      </View>
      <AppText tone="soft">{portal.summary}</AppText>
    </Pressable>
  );
}

/** Shows which portal was chosen, with a way back to choose another. Display only: it grants nothing. */
export function SelectedPortal({ portal, caption, onChange }: { portal: Portal; caption: string; onChange: () => void }) {
  const t = tiles[portal.id];
  return (
    <View style={styles.selected}>
      <View style={[styles.tileSmall, { backgroundColor: t.bg, borderColor: t.border }]}>
        <Icon name={portal.icon} size={18} color={t.fg} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="caption" tone="muted">{caption}</AppText>
        <AppText variant="bodyMedium" numberOfLines={1}>{portal.title}</AppText>
      </View>
      <Button title="Change portal" variant="quiet" compact onPress={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: space.lg, padding: space.xl, borderRadius: radius.panel, borderWidth: 1, borderColor: colors.rule, backgroundColor: colors.folio,
  },
  cardPressed: { borderColor: colors.patina },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  tile: { width: 48, height: 48, borderRadius: radius.field, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  tileSmall: { width: 36, height: 36, borderRadius: radius.chip, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  selected: {
    flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm, paddingLeft: space.md, paddingRight: space.xs,
    borderRadius: radius.field, borderWidth: 1, borderColor: colors.rule, backgroundColor: colors.folio,
  },
});