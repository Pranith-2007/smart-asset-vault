import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, space } from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

type Tone = 'success' | 'error';
interface ToastValue { show: (message: string, tone?: Tone) => void }
const Ctx = createContext<ToastValue>({ show: () => {} });

/** Brief confirmation of something the person just did. Fades in and out; nothing else animates. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: Tone } | null>(null);

  const show = useCallback((message: string, tone: Tone = 'success') => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, tone });
    Animated.timing(opacity, { toValue: 1, duration: 140, useNativeDriver: true }).start();
    timer.current = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setToast(null));
    }, 2800);
  }, [opacity]);

  const value = useMemo(() => ({ show }), [show]);
  return (
    <Ctx.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={[styles.wrap, { opacity, bottom: insets.bottom + 84 }]}
        >
          <View style={[styles.toast, toast.tone === 'error' && { backgroundColor: colors.brick }]}>
            <Icon name={toast.tone === 'error' ? 'alert-circle' : 'check'} size={18} color={colors.folio} />
            <AppText variant="label" tone="inverse" style={{ flex: 1 }}>{toast.message}</AppText>
          </View>
        </Animated.View>
      ) : null}
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: space.xl, right: space.xl },
  toast: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.ink, borderRadius: radius.field, paddingHorizontal: space.lg, paddingVertical: 14 },
});
