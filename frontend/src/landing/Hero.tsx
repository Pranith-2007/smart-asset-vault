import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { heroScreenshot } from '../data/landingScreenshots';
import { font, pal, radii, shadow, sp } from './tokens';
import { Dots, Heading, LButton, Label, Lead, Panel, PhoneFrame, useLayout, type IconName } from './ui';

const TRUST = ['Blockchain Verified', 'Tamper Proof', 'Role-Based Access'];

/** Decorative capability labels. They describe features, not results, so they never imply fake data. */
function Float({ icon, title, sub, style }: { icon: IconName; title: string; sub?: string; style: object }) {
  const props: any = { 'aria-hidden': true };
  return (
    <View {...props} accessible={false} importantForAccessibility="no-hide-descendants" style={[styles.float, shadow.md, style]}>
      <View style={styles.floatIcon}>
        <Ionicons name={icon} size={17} color={pal.forest} />
      </View>
      <View>
        <Text style={styles.floatTitle}>{title}</Text>
        {sub ? <Text style={styles.floatSub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

export function Hero({ onChoosePortal, onWatchDemo }: { onChoosePortal: () => void; onWatchDemo: () => void }) {
  const L = useLayout();
  const phoneW = L.desktop ? 250 : L.tablet ? 236 : Math.min(208, Math.round(L.width * 0.54));
  const stageW = L.desktop ? 500 : L.tablet ? 480 : Math.min(L.width - 2 * (L.shellMarginX + L.shellPad + L.panelPadX), 360);
  const phoneH = Math.round(phoneW * 2 + phoneW * 0.07);
  const ring = (size: number, a: number) => ({ position: 'absolute' as const, width: size, height: size, borderRadius: size / 2, left: '50%' as const, top: '50%' as const, marginLeft: -size / 2, marginTop: -size / 2, borderWidth: 1, borderColor: `rgba(200,245,66,${a})` });

  return (
    <Panel tone="dark" label="Introduction" decor={<Dots />}>
      <View style={{ flexDirection: L.desktop ? 'row' : 'column', alignItems: 'center', gap: L.desktop ? sp.x4 : sp.xxl }}>
        <View style={{ flex: L.desktop ? 1.05 : undefined, width: L.desktop ? undefined : '100%', gap: sp.xl, maxWidth: 620, alignItems: 'flex-start' }}>
          <View style={styles.eyebrow}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: pal.lime }} />
            <Label tone="dark" style={L.mobile ? { fontSize: 10.5, letterSpacing: 1 } : undefined}>Blockchain · Secure · Transparent</Label>
          </View>

          <Heading level={1} tone="dark">Your Important Documents, Secured for a Lifetime.</Heading>

          <Lead tone="dark" style={{ color: '#CFE6D6', maxWidth: 520 }}>
            Store your documents securely, verify them on the blockchain, and share them only with the people you choose.
          </Lead>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: sp.md }}>
            <LButton variant="lime" label="Choose Your Portal" iconRight="arrow-forward" onPress={onChoosePortal} />
            <LButton variant="ghostDark" label="Watch Demo" icon="play-circle-outline" onPress={onWatchDemo} />
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: sp.xl, rowGap: sp.sm, paddingTop: sp.xs }}>
            {TRUST.map((t) => (
              <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="checkmark-circle" size={18} color={pal.lime} />
                <Text style={{ fontFamily: font.sansSemi, fontSize: 14, color: pal.onDark }}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ flex: L.desktop ? 0.95 : undefined, width: L.desktop ? undefined : '100%', alignItems: 'center' }}>
          <View style={{ width: stageW, height: phoneH + 24, alignItems: 'center', justifyContent: 'center' }}>
            <View pointerEvents="none" style={[ring(stageW * 0.92, 0.1), { backgroundColor: 'rgba(200,245,66,0.05)' }]} />
            <View pointerEvents="none" style={ring(stageW * 0.66, 0.18)} />
            <PhoneFrame source={heroScreenshot.image} alt={heroScreenshot.alt} placeholder={heroScreenshot.placeholder} width={phoneW} />
            {L.tablet ? (
              <>
                <Float icon="shield-checkmark-outline" title="Blockchain verification" sub="Sepolia test network" style={{ top: '12%', left: 0 }} />
                <Float icon="lock-closed-outline" title="Secure storage" style={{ top: '45%', right: 0 }} />
                <Float icon="share-social-outline" title="Controlled sharing" style={{ bottom: '9%', left: '4%' }} />
              </>
            ) : null}
          </View>
        </View>
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 10, maxWidth: '100%', paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.pill, borderWidth: 1, borderColor: 'rgba(200,245,66,0.35)', backgroundColor: 'rgba(200,245,66,0.08)' },
  float: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: pal.white, paddingVertical: 10, paddingLeft: 10, paddingRight: 16, borderRadius: 16 },
  floatIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: pal.mint, alignItems: 'center', justifyContent: 'center' },
  floatTitle: { fontFamily: font.sansBold, fontSize: 13, color: pal.text },
  floatSub: { fontFamily: font.mono, fontSize: 10.5, color: pal.muted, marginTop: 1 },
});
