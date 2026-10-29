import React, { useEffect, useState } from 'react';
import {
  Image, Pressable, StyleSheet, Text, View, useWindowDimensions,
  type ImageSourcePropType, type LayoutChangeEvent, type PressableStateCallbackType, type StyleProp, type TextStyle, type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { font, pal, radii, shadow, sp, web } from './tokens';

export type SectionKey = 'home' | 'features' | 'showcase' | 'how' | 'about' | 'contact';
export type IconName = React.ComponentProps<typeof Ionicons>['name'];

/* ---------- layout ---------- */

/** Single source of truth for responsive sizes, so every section uses the same rhythm. */
export function useLayout() {
  const { width } = useWindowDimensions();
  const desktop = width >= 960;
  const tablet = width >= 700;
  return {
    width, desktop, tablet, mobile: !tablet,
    shellMarginX: desktop ? 28 : tablet ? 16 : 8,
    shellMarginY: desktop ? 24 : 8,
    shellPad: desktop ? 16 : tablet ? 12 : 8,
    panelGap: desktop ? 16 : 12,
    panelRadius: desktop ? 36 : tablet ? 30 : 24,
    panelPadX: desktop ? 64 : tablet ? 40 : 20,
    panelPadY: desktop ? 72 : tablet ? 56 : 40,
    cols: width >= 1100 ? 4 : width >= 600 ? 2 : 1,
    t: {
      display: { fontSize: desktop ? 58 : tablet ? 48 : 36, lineHeight: desktop ? 62 : tablet ? 52 : 40, letterSpacing: desktop ? -1.8 : tablet ? -1.4 : -1 },
      h2: { fontSize: desktop ? 40 : tablet ? 34 : 28, lineHeight: desktop ? 46 : tablet ? 40 : 34, letterSpacing: desktop ? -1 : -0.7 },
      h3: { fontSize: desktop ? 30 : tablet ? 28 : 24, lineHeight: desktop ? 36 : tablet ? 34 : 30, letterSpacing: -0.5 },
      lead: { fontSize: desktop ? 18 : tablet ? 17 : 16, lineHeight: desktop ? 29 : tablet ? 27 : 25 },
    },
  };
}

export function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const q = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(q.matches);
    const on = (e: MediaQueryListEvent) => setReduce(e.matches);
    q.addEventListener?.('change', on);
    return () => q.removeEventListener?.('change', on);
  }, []);
  return reduce;
}

export type PState = PressableStateCallbackType & { hovered?: boolean; focused?: boolean };

export const focusRing = (color: string) => web({ outlineStyle: 'solid', outlineWidth: 2, outlineColor: color, outlineOffset: 2 });
export const transition = (reduce: boolean) =>
  web({ transitionProperty: 'transform, box-shadow, background-color, border-color, opacity', transitionDuration: reduce ? '0ms' : '180ms', transitionTimingFunction: 'ease' });

/* ---------- panels ---------- */

type Tone = 'dark' | 'light' | 'mint' | 'lime';
const TONES: Record<Tone, { bg: string; image?: string; border: string }> = {
  dark: {
    bg: pal.forestDeep,
    image: 'radial-gradient(760px 460px at 90% 0%, rgba(200,245,66,0.11), transparent 62%), radial-gradient(640px 460px at 0% 100%, rgba(16,185,129,0.24), transparent 62%), linear-gradient(135deg, #0B2A1E 0%, #0F3D24 55%, #14532D 100%)',
    border: 'rgba(200,245,66,0.16)',
  },
  light: { bg: pal.offWhite, border: 'rgba(255,255,255,0.7)' },
  mint: { bg: pal.mint, image: 'radial-gradient(700px 420px at 100% 0%, rgba(16,185,129,0.14), transparent 60%), radial-gradient(600px 400px at 0% 100%, rgba(200,245,66,0.18), transparent 60%)', border: 'rgba(255,255,255,0.7)' },
  lime: { bg: pal.lime, image: 'linear-gradient(120deg, #D9FF5C 0%, #BDF53F 55%, #98E64A 100%)', border: 'rgba(255,255,255,0.5)' },
};

/** Faint dot grid used as texture on dark and mint panels. */
export function Dots({ color = 'rgba(255,255,255,0.08)' }: { color?: string }) {
  return <View pointerEvents="none" style={[StyleSheet.absoluteFill, web({ backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`, backgroundSize: '24px 24px' })]} />;
}

interface PanelProps {
  tone: Tone;
  children: React.ReactNode;
  label?: string;
  onLayout?: (e: LayoutChangeEvent) => void;
  decor?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** A large rounded section panel. Content is centred in a 1120px column inside consistent padding. */
export function Panel({ tone, children, label, onLayout, decor, style }: PanelProps) {
  const L = useLayout();
  const t = TONES[tone];
  return (
    <View
      role="region"
      aria-label={label}
      onLayout={onLayout}
      style={[
        { borderRadius: L.panelRadius, overflow: 'hidden', backgroundColor: t.bg, borderWidth: 1, borderColor: t.border },
        web(t.image ? { backgroundImage: t.image } : {}),
        style,
      ]}
    >
      {decor}
      <View style={{ width: '100%', maxWidth: 1200 + L.panelPadX * 2, alignSelf: 'center', paddingVertical: L.panelPadY, paddingHorizontal: L.panelPadX }}>{children}</View>
    </View>
  );
}

/* ---------- type ---------- */

/** Small technical label in Roboto Mono: section indices, eyebrows. */
export function Label({ children, tone = 'light', style }: { children: React.ReactNode; tone?: 'light' | 'dark' | 'limeOn'; style?: StyleProp<TextStyle> }) {
  const color = tone === 'dark' ? pal.lime : tone === 'limeOn' ? pal.forest : pal.greenText;
  return <Text style={[{ fontFamily: font.mono, fontSize: 12, letterSpacing: 1.6, textTransform: 'uppercase', color }, style]}>{children}</Text>;
}

export function Heading({ level, tone = 'light', children, style }: { level: 1 | 2 | 3; tone?: 'light' | 'dark'; children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const L = useLayout();
  const base = level === 1 ? L.t.display : level === 2 ? L.t.h2 : L.t.h3;
  const props: any = { role: 'heading', 'aria-level': level };
  return (
    <Text {...props} style={[{ fontFamily: level === 3 ? font.sansBold : font.sansXBold, color: tone === 'dark' ? pal.onDark : pal.forestInk }, base, style]}>
      {children}
    </Text>
  );
}

export function Lead({ children, tone = 'light', style }: { children: React.ReactNode; tone?: 'light' | 'dark'; style?: StyleProp<TextStyle> }) {
  const L = useLayout();
  return <Text style={[{ fontFamily: font.sans, color: tone === 'dark' ? pal.mutedOnDark : pal.muted }, L.t.lead, style]}>{children}</Text>;
}

/** Eyebrow label, title and optional intro, kept tight together so headings never drift from their content. */
export function SectionHead({ label, title, tone = 'light', align = 'left', children }: { label: string; title: string; tone?: 'light' | 'dark'; align?: 'left' | 'center'; children?: React.ReactNode }) {
  const L = useLayout();
  return (
    <View style={{ gap: sp.md, marginBottom: L.desktop ? sp.x3 : sp.xl, alignItems: align === 'center' ? 'center' : 'flex-start', maxWidth: 900, alignSelf: align === 'center' ? 'center' : 'flex-start' }}>
      <Label tone={tone === 'dark' ? 'dark' : 'light'}>{label}</Label>
      <Heading level={2} tone={tone} style={{ textAlign: align }}>{title}</Heading>
      {children}
    </View>
  );
}

/* ---------- controls ---------- */

type Variant = 'lime' | 'forest' | 'ghostDark' | 'ghostLight';
const VARIANTS: Record<Variant, { bg: string; fg: string; border: string; hoverBg: string; ring: string }> = {
  lime: { bg: pal.lime, fg: pal.forestInk, border: pal.lime, hoverBg: pal.limeSoft, ring: pal.white },
  forest: { bg: pal.forest, fg: pal.white, border: pal.forest, hoverBg: pal.forestDeep, ring: pal.emerald },
  ghostDark: { bg: 'rgba(255,255,255,0.04)', fg: pal.onDark, border: 'rgba(255,255,255,0.38)', hoverBg: 'rgba(255,255,255,0.12)', ring: pal.lime },
  ghostLight: { bg: 'transparent', fg: pal.forest, border: 'rgba(20,83,45,0.35)', hoverBg: pal.mint, ring: pal.emerald },
};

export function LButton({ label, onPress, variant = 'lime', icon, iconRight, compact }: { label: string; onPress: () => void; variant?: Variant; icon?: IconName; iconRight?: IconName; compact?: boolean }) {
  const v = VARIANTS[variant];
  const reduce = useReducedMotion();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={(s) => {
        const st = s as PState;
        return [
          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sp.sm, minHeight: compact ? 44 : 52, paddingHorizontal: compact ? 18 : 26, borderRadius: radii.pill, borderWidth: 1.5, backgroundColor: v.bg, borderColor: v.border },
          transition(reduce),
          (st.hovered || st.pressed) && { backgroundColor: v.hoverBg, transform: reduce ? [] : [{ translateY: -1 }] },
          st.focused && focusRing(v.ring),
        ];
      }}
    >
      {icon ? <Ionicons name={icon} size={18} color={v.fg} /> : null}
      <Text style={{ fontFamily: font.sansBold, fontSize: 15, color: v.fg }}>{label}</Text>
      {iconRight ? <Ionicons name={iconRight} size={18} color={v.fg} /> : null}
    </Pressable>
  );
}

/* ---------- phone mockup ---------- */

/**
 * A phone frame whose screen is exactly 1:2, matching the 540x1080 screenshots,
 * so images are never cropped or stretched. Placeholders are clearly badged.
 */
export function PhoneFrame({ source, alt, placeholder, width }: { source: ImageSourcePropType; alt: string; placeholder: boolean; width: number }) {
  const pad = Math.max(6, Math.round(width * 0.035));
  return (
    <View style={[{ width, padding: pad, borderRadius: Math.round(width * 0.15), backgroundColor: '#0E1A14', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' }, shadow.lg]}>
      <View style={{ width: '100%', aspectRatio: 1 / 2, borderRadius: Math.round(width * 0.12), overflow: 'hidden', backgroundColor: pal.mint }}>
        <Image source={source} alt={placeholder ? `Placeholder image: ${alt}` : alt} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
        {placeholder ? (
          <View style={{ position: 'absolute', top: 10, alignSelf: 'center', backgroundColor: pal.forest, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radii.pill }}>
            <Text style={{ fontFamily: font.monoBold, color: pal.white, fontSize: 10, letterSpacing: 1 }}>PLACEHOLDER</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
