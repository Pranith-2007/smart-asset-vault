import { StyleSheet, Switch, View } from 'react-native';
import { colors, space } from '@/theme';
import { AppText } from './AppText';

export function ToggleRow({ title, description, value, onChange }: { title: string; description?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="bodyMedium">{title}</AppText>
        {description ? <AppText variant="small" tone="muted">{description}</AppText> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityLabel={title}
        trackColor={{ false: colors.ruleStrong, true: colors.patina }}
        thumbColor={colors.folio}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: space.lg, minHeight: 64, paddingVertical: space.md, paddingHorizontal: space.xl,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.rule, backgroundColor: colors.folio,
  },
});
