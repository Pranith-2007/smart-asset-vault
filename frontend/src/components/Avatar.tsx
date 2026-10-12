import { View } from 'react-native';
import { colors } from '@/theme';
import { initials } from '@/utils/format';
import { AppText } from './AppText';

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <View
      accessible
      accessibilityLabel={name}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.patina, alignItems: 'center', justifyContent: 'center' }}
    >
      <AppText variant="heading" tone="inverse" style={{ fontSize: size * 0.4, lineHeight: size * 0.5 }}>{initials(name)}</AppText>
    </View>
  );
}
