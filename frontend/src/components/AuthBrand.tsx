
import { View, Image } from 'react-native';
import { space } from '@/theme';
import { AppText } from './AppText';

/** The wordmark shown at the top of the portal, sign-in and sign-up screens. */
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
        source={require('../../assets/Smart Asset Vault Security Badge.png')}
        style={{ width: 64, height: 64 }}
        resizeMode="contain"
      />

      <AppText variant="heading">Smart Asset Vault</AppText>
    </View>
  );
}
