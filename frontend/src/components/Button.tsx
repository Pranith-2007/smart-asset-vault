import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, space } from '@/theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'quiet' | 'danger';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

const palette = {
  primary: { bg: colors.patina, pressed: colors.patinaPressed, fg: colors.folio, border: colors.patina },
  secondary: { bg: 'transparent', pressed: colors.patinaTint, fg: colors.patina, border: colors.patina },
  quiet: { bg: 'transparent', pressed: colors.patinaTint, fg: colors.patina, border: 'transparent' },
  danger: { bg: 'transparent', pressed: colors.brickTint, fg: colors.brick, border: colors.brick },
} as const;

export function Button({ title, onPress, variant = 'primary', loading, disabled, icon, compact, style }: Props) {
  const p = palette[variant];
  const inactive = !!disabled || !!loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { minHeight: compact ? 44 : 52, backgroundColor: pressed ? p.pressed : p.bg, borderColor: p.border, opacity: disabled && !loading ? 0.45 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={18} color={p.fg} /> : null}
          <AppText variant="bodyMedium" style={{ color: p.fg }}>{title}</AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: 1.5, borderRadius: radius.field, paddingHorizontal: space.xl, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});
