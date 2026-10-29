import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { font, pal, radii, shadow, sp } from './tokens';
import Reveal from './Reveal';
import { Panel, SectionHead, transition, useLayout, useReducedMotion, type IconName, type PState } from './ui';

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  { icon: 'lock-closed-outline', title: 'Secure Storage', text: 'Keep every important document safely in one place.' },
  { icon: 'shield-checkmark-outline', title: 'Blockchain Verification', text: 'Prove a document has not been altered.' },
  { icon: 'share-social-outline', title: 'Controlled Sharing', text: 'Share only what is needed, with the right people.' },
  { icon: 'people-outline', title: 'Role-Based Access', text: 'Each portal sees only what its role allows.' },
];

function FeatureCard({ icon, title, text, index }: { icon: IconName; title: string; text: string; index: number }) {
  const reduce = useReducedMotion();
  return (
    <Pressable
      accessible={false}
      focusable={false}
      style={(s) => [
        styles.card,
        shadow.sm,
        transition(reduce),
        (s as PState).hovered && { borderColor: pal.emerald, transform: reduce ? [] : [{ translateY: -4 }] },
      ]}
    >
      <View style={styles.cardTop}>
        <View style={styles.icon}>
          <Ionicons name={icon} size={24} color={pal.forest} />
        </View>
        <Text style={styles.index}>{String(index + 1).padStart(2, '0')}</Text>
      </View>
      <View style={{ gap: 6 }}>
        <Text role="heading" {...({ 'aria-level': 3 } as any)} style={styles.title}>{title}</Text>
        <Text style={styles.text}>{text}</Text>
      </View>
    </Pressable>
  );
}

export function Features({ onLayout }: { onLayout: (e: any) => void }) {
  const L = useLayout();
  const rows: (typeof FEATURES)[] = [];
  for (let i = 0; i < FEATURES.length; i += L.cols) rows.push(FEATURES.slice(i, i + L.cols));

  return (
    <Panel tone="light" label="Features" onLayout={onLayout}>
      <SectionHead label="Features" title="Everything your documents need" />
      <View style={{ gap: sp.lg }}>
        {rows.map((row, r) => (
          <View key={r} style={{ flexDirection: 'row', gap: sp.lg }}>
            {row.map((f, c) => (
              <Reveal key={f.title} delay={c * 70} style={{ flex: 1 }}>
                <FeatureCard {...f} index={r * L.cols + c} />
              </Reveal>
            ))}
          </View>
        ))}
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, gap: sp.xl, padding: sp.xl, borderRadius: radii.card, backgroundColor: pal.white, borderWidth: 1, borderColor: pal.line },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  icon: { width: 52, height: 52, borderRadius: radii.tile, backgroundColor: pal.mint, alignItems: 'center', justifyContent: 'center' },
  index: { fontFamily: font.mono, fontSize: 12, letterSpacing: 1.4, color: pal.muted },
  title: { fontFamily: font.sansBold, fontSize: 19, lineHeight: 25, color: pal.forestInk, letterSpacing: -0.2 },
  text: { fontFamily: font.sans, fontSize: 15, lineHeight: 23, color: pal.muted },
});
