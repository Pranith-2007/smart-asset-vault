import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, space } from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}

export function ScreenHeader({ title, subtitle, onBack, right }: Props) {
  return (
    <View style={styles.wrap}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          android_ripple={{ color: colors.patinaTint, radius: 24, borderless: true }}
          style={styles.back}
        >
          <Icon name="arrow-left" size={22} />
        </Pressable>
      ) : null}
      <View style={styles.titles}>
        <AppText variant="title" accessibilityRole="header" numberOfLines={2}>{title}</AppText>
        {subtitle ? <AppText variant="small" tone="muted" numberOfLines={2}>{subtitle}</AppText> : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.xl, paddingTop: space.md, paddingBottom: space.lg, gap: space.sm, minHeight: 64 },
  back: { width: 44, height: 44, marginLeft: -space.md, alignItems: 'center', justifyContent: 'center' },
  titles: { flex: 1, gap: 2 },
  right: { marginLeft: space.sm },
});

export function HeaderIconButton({ icon, label, onPress }: { icon: Parameters<typeof Icon>[0]['name']; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      android_ripple={{ color: colors.patinaTint, radius: 24 }}
      style={({ pressed }) => [hb.btn, pressed && { backgroundColor: colors.patinaTint }]}
    >
      <Icon name={icon} size={20} color={colors.patina} />
    </Pressable>
  );
}
const hb = StyleSheet.create({
  btn: { width: 44, height: 44, borderRadius: 6, borderWidth: 1.5, borderColor: colors.patina, alignItems: 'center', justifyContent: 'center' },
});
