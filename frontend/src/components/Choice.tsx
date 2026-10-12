import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { colors, radius, space } from '@/theme';
import { AppText } from './AppText';

interface Option<T extends string> { value: T; label: string }

/** Filter chips. Scrolls horizontally by default; `wrap` lays them out in a form. */
export function Chips<T extends string>({ options, value, onChange, wrap }: { options: Option<T>[]; value: T; onChange: (v: T) => void; wrap?: boolean }) {
  const items = options.map((o) => {
    const on = o.value === value;
    return (
      <Pressable
        key={o.value}
        onPress={() => onChange(o.value)}
        accessibilityRole="radio"
        accessibilityState={{ selected: on }}
        style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
      >
        <AppText variant="label" style={{ color: on ? colors.folio : colors.ink }}>{o.label}</AppText>
      </Pressable>
    );
  });
  if (wrap) return <View style={styles.wrap}>{items}</View>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {items}
    </ScrollView>
  );
}

/** Equal-width switch between two to four mutually exclusive choices. */
export function Segmented<T extends string>({ options, value, onChange }: { options: Option<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={styles.seg} accessibilityRole="radiogroup">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            style={[styles.segItem, on && { backgroundColor: colors.patina }]}
          >
            <AppText variant="label" numberOfLines={1} style={{ color: on ? colors.folio : colors.ink }}>{o.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: space.xl, gap: space.sm, paddingVertical: space.xs },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: { minHeight: 40, paddingHorizontal: 14, borderRadius: radius.chip, justifyContent: 'center', borderWidth: 1 },
  chipOn: { backgroundColor: colors.patina, borderColor: colors.patina },
  chipOff: { backgroundColor: colors.folio, borderColor: colors.rule },
  seg: { flexDirection: 'row', borderWidth: 1.5, borderColor: colors.ruleStrong, borderRadius: radius.field, padding: 2, backgroundColor: colors.folio },
  segItem: { flex: 1, minHeight: 44, borderRadius: 4, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
});
