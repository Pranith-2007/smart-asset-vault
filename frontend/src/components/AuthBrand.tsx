
import { Image, View } from 'react-native';
import { space } from '@/theme';
import { AppText } from './AppText';

export function AuthBrand() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
      }}
    >
      <Image
        source={require('../../assets/sav-logo.png')}
        style={{ width: 48, height: 48 }}
        resizeMode="contain"
        accessibilityLabel="Smart Asset Vault logo"
      />

      <AppText variant="heading">Smart Asset Vault</AppText>
    </View>
  );
}
