import { Platform } from 'react-native';
export const C = {
  forest: '#14532D', emerald: '#15803D', mint: '#D1FAE5', offWhite: '#F7FAF7',
  white: '#FFFFFF', text: '#17251D', sage: '#E4EDE5', cream: '#FBF8F0', muted: '#4B5D52',
};
export const shadow = (Platform.OS === 'web'
  ? { boxShadow: '0 12px 32px rgba(20,83,45,0.12)' }
  : { elevation: 4, shadowColor: C.forest, shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } }) as any;
// Web-only soft gradients; native falls back to the flat colour.
export const gradient = (css: string) => (Platform.OS === 'web' ? ({ backgroundImage: css } as any) : {});
