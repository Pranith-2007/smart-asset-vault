import { Pressable, StyleSheet, View } from 'react-native';
import { space } from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

/** A simple section heading in plain sans-serif with an optional link on the right. */
export function PlainSection({ title, action }: { title: string; action?: { label: string; onPress: () => void } }) {
  return (
    <View style={styles.row}>
      <AppText variant="headline" accessibilityRole="header" style={{ flex: 1 }}>{title}</AppText>
      {action ? (
        <Pressable onPress={action.onPress} hitSlop={8} accessibilityRole="button" accessibilityLabel={action.label} style={styles.link}>
          <AppText variant="label" tone="patina" style={{ fontSize: 16 }}>{action.label}</AppText>
          <Icon name="arrow-right" size={18} color="#1B4D45" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.xl, paddingTop: space.x3, paddingBottom: space.md, minHeight: 48 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 },
});
