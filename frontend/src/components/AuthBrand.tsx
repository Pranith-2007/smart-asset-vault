import { View } from 'react-native';
import { space } from '@/theme';
import { AppText } from './AppText';
import { Dial } from './Dial';

/** The wordmark shown at the top of the portal, sign-in and sign-up screens. */
export function AuthBrand() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
      <Dial value={8} size={40} showValue={false} />
      <AppText variant="heading">Smart Asset Vault</AppText>
    </View>
  );
}