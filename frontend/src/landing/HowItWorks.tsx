import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { font, pal, radii, sp } from './tokens';
import Reveal from './Reveal';
import { Dots, Panel, SectionHead, useLayout, type IconName } from './ui';

const STEPS: { icon: IconName; t: string; d: string }[] = [
  { icon: 'cloud-upload-outline', t: 'Upload', d: 'Add a document from your phone.' },
  { icon: 'lock-closed-outline', t: 'Secure', d: 'It is stored with protected access.' },
  { icon: 'folder-open-outline', t: 'Organise', d: 'Keep your important documents organised and easy to find.' },
  { icon: 'paper-plane-outline', t: 'Share', d: 'Give access to specific people, on your terms.' },
];

function Node({ icon }: { icon: IconName }) {
  return (
    <View style={styles.node}>
      <Ionicons name={icon} size={24} color={pal.lime} />
    </View>
  );
}

function Text_({ n, t, d }: { n: number; t: string; d: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.stepNum}>{`STEP ${String(n).padStart(2, '0')}`}</Text>
      <Text role="heading" {...({ 'aria-level': 3 } as any)} style={styles.stepTitle}>{t}</Text>
      <Text style={styles.stepText}>{d}</Text>
    </View>
  );
}

export function HowItWorks({ onLayout }: { onLayout: (e: any) => void }) {
  const L = useLayout();
  const horizontal = L.tablet;

  return (
    <Panel tone="dark" label="How it works" onLayout={onLayout} decor={<Dots />}>
      <SectionHead tone="dark" label="Workflow" title="How It Works" />
      {horizontal ? (
        <View style={{ flexDirection: 'row' }}>
          {STEPS.map((s, i) => (
            <Reveal key={s.t} delay={i * 80} style={{ flex: 1 }}>
              <View style={{ gap: sp.xl, paddingRight: i < STEPS.length - 1 ? sp.lg : 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Node icon={s.icon} />
                  {i < STEPS.length - 1 ? <View style={styles.hLine} /> : null}
                </View>
                <Text_ n={i + 1} t={s.t} d={s.d} />
              </View>
            </Reveal>
          ))}
        </View>
      ) : (
        <View>
          {STEPS.map((s, i) => (
            <Reveal key={s.t}>
              <View style={{ flexDirection: 'row', gap: sp.lg }}>
                <View style={{ alignItems: 'center' }}>
                  <Node icon={s.icon} />
                  {i < STEPS.length - 1 ? <View style={styles.vLine} /> : null}
                </View>
                <View style={{ flex: 1, paddingBottom: i < STEPS.length - 1 ? sp.xl : 0, paddingTop: 2 }}>
                  <Text_ n={i + 1} t={s.t} d={s.d} />
                </View>
              </View>
            </Reveal>
          ))}
        </View>
      )}
    </Panel>
  );
}

const styles = StyleSheet.create({
  node: { width: 60, height: 60, borderRadius: radii.pill, backgroundColor: 'rgba(200,245,66,0.10)', borderWidth: 1.5, borderColor: 'rgba(200,245,66,0.55)', alignItems: 'center', justifyContent: 'center' },
  hLine: { flex: 1, height: 1.5, marginHorizontal: sp.md, backgroundColor: 'rgba(200,245,66,0.30)' },
  vLine: { flex: 1, width: 1.5, minHeight: 24, marginVertical: sp.sm, backgroundColor: 'rgba(200,245,66,0.30)' },
  stepNum: { fontFamily: font.mono, fontSize: 12, letterSpacing: 1.6, color: pal.lime },
  stepTitle: { fontFamily: font.sansBold, fontSize: 22, lineHeight: 28, color: pal.onDark, letterSpacing: -0.3 },
  stepText: { fontFamily: font.sans, fontSize: 15, lineHeight: 23, color: pal.mutedOnDark },
});

