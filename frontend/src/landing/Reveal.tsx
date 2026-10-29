import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, ViewStyle } from 'react-native';

/** Fades/slides content in once it scrolls into view (web). Shows instantly on native or with reduced motion. */
export default function Reveal({ children, style, delay = 0 }: { children: React.ReactNode; style?: ViewStyle; delay?: number }) {
  const [shown, setShown] = useState(false);
  const v = useRef(new Animated.Value(0)).current;
  const node = useRef<any>(null);
  const reduce = useRef(false);

  useEffect(() => {
    const el = node.current;
    reduce.current = Platform.OS === 'web' && typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (Platform.OS !== 'web' || reduce.current || typeof IntersectionObserver === 'undefined' || !(el instanceof Element)) {
      v.setValue(1);
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, [v]);

  useEffect(() => {
    if (shown && !reduce.current) Animated.timing(v, { toValue: 1, duration: 560, delay, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [shown, v, delay]);

  return (
    <Animated.View ref={node} style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}
