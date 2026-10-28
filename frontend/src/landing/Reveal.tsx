import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, ViewStyle } from 'react-native';

/** Fades/slides content in once it scrolls into view (web). Shows instantly on native or with reduced motion. */
export default function Reveal({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const [shown, setShown] = useState(false);
  const v = useRef(new Animated.Value(0)).current;
  const node = useRef<any>(null);

  useEffect(() => {
    const el = node.current;
    const reduce = Platform.OS === 'web' && typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (Platform.OS !== 'web' || reduce || typeof IntersectionObserver === 'undefined' || !(el instanceof Element)) {
      setShown(true); return;
    }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (shown) Animated.timing(v, { toValue: 1, duration: 650, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [shown, v]);

  return (
    <Animated.View ref={node} style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [32, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}
