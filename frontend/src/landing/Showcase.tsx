import { StyleSheet, Text, View } from 'react-native';
import { featureScreenshots, type LandingScreenshot } from '../data/landingScreenshots';
import { font, pal, radii, sp, web } from './tokens';
import Reveal from './Reveal';
import { Dots, Heading, Label, Lead, Panel, PhoneFrame, SectionHead, useLayout } from './ui';

/** A tinted stage that frames one phone, so each screenshot reads as a deliberate focal point. */
function Stage({ shot, total, phoneW }: { shot: LandingScreenshot; total: number; phoneW: number }) {
  const L = useLayout();
  const num = String(shot.order).padStart(2, '0');
  return (
    <View style={[styles.stage, { paddingVertical: L.desktop ? sp.xxl : sp.xl }, web({ backgroundImage: 'linear-gradient(160deg, #FFFFFF 0%, #EAF6EC 100%)' })]}>
      <View pointerEvents="none" style={styles.blob} />
      <View style={styles.stageChip}>
        <Label>{`Screen ${num} / ${String(total).padStart(2, '0')}`}</Label>
      </View>
      <View style={{ paddingTop: sp.x3 - 8 }}>
        <PhoneFrame source={shot.image} alt={shot.alt} placeholder={shot.placeholder} width={phoneW} />
      </View>
    </View>
  );
}

function Copy({ shot, total }: { shot: LandingScreenshot; total: number }) {
  const L = useLayout();
  return (
    <View style={{ flex: L.desktop ? 1 : undefined, gap: sp.lg, maxWidth: 480, width: L.desktop ? undefined : '100%' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: sp.md }}>
        <Text style={styles.num}>{String(shot.order).padStart(2, '0')}</Text>
        <View style={{ height: 1, flex: 1, backgroundColor: 'rgba(20,83,45,0.22)' }} />
        <Text style={styles.total}>{String(total).padStart(2, '0')}</Text>
      </View>
      <Heading level={3}>{shot.title}</Heading>
      <Lead>{shot.description}</Lead>
    </View>
  );
}

export function Showcase({ onLayout }: { onLayout: (e: any) => void }) {
  const L = useLayout();
  const total = featureScreenshots.length;
  const phoneW = L.desktop ? 236 : L.tablet ? 228 : Math.min(212, Math.round(L.width * 0.56));

  return (
    <Panel tone="mint" label="App screenshots" onLayout={onLayout} decor={<Dots color="rgba(20,83,45,0.07)" />}>
      <SectionHead label="The app" title="Explore Smart Asset Vault on Your Phone." />
      <View style={{ gap: L.desktop ? sp.x4 : sp.x3 }}>
        {featureScreenshots.map((shot) => {
          const stageFirst = !L.desktop || shot.position === 'left';
          const stage = <View style={{ flex: L.desktop ? 1 : undefined, maxWidth: 560, width: '100%', alignSelf: L.desktop ? 'auto' : 'center' }}><Stage shot={shot} total={total} phoneW={phoneW} /></View>;
          const copy = <Copy shot={shot} total={total} />;
          return (
            <Reveal key={shot.id}>
              <View style={{ flexDirection: L.desktop ? 'row' : 'column', alignItems: L.desktop ? 'center' : 'stretch', gap: L.desktop ? sp.x4 : sp.xl, justifyContent: 'center' }}>
                {stageFirst ? <>{stage}{copy}</> : <>{copy}{stage}</>}
              </View>
            </Reveal>
          );
        })}
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center', borderRadius: 32, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(20,83,45,0.12)', backgroundColor: pal.white },
  blob: { position: 'absolute', width: '78%', aspectRatio: 1, borderRadius: radii.pill, backgroundColor: 'rgba(16,185,129,0.13)', alignSelf: 'center', top: '14%' },
  stageChip: { position: 'absolute', top: 16, left: 16, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.pill, backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 1, borderColor: pal.line },
  num: { fontFamily: font.monoBold, fontSize: 15, color: pal.greenText, letterSpacing: 1.5 },
  total: { fontFamily: font.mono, fontSize: 13, color: pal.muted, letterSpacing: 1.5 },
});
