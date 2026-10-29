import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { font, pal, radii, sp } from './tokens';
import { Heading, LButton, Label, Lead, Panel, focusRing, useLayout, type PState, type SectionKey } from './ui';

export const REPO_URL = 'https://github.com/Pranith-2007/smart-asset-vault';

// Taken directly from the existing About copy; no new claims.
const STACK = [
  { tag: 'APP', text: 'Mobile document manager' },
  { tag: 'AUTH', text: 'Supabase authentication' },
  { tag: 'API', text: 'Express API' },
  { tag: 'CHAIN', text: 'Smart contracts on the Sepolia test network' },
];

export function About({ onLayout }: { onLayout: (e: any) => void }) {
  const L = useLayout();
  return (
    <Panel tone="light" label="About" onLayout={onLayout}>
      <View style={{ flexDirection: L.desktop ? 'row' : 'column', gap: L.desktop ? sp.x4 : sp.xxl, alignItems: L.desktop ? 'center' : 'stretch' }}>
        <View style={{ flex: 1, gap: sp.lg }}>
          <Label>About</Label>
          <Heading level={2}>About Smart Asset Vault</Heading>
          <Lead>
            Smart Asset Vault is a hackathon project: a mobile document manager with Supabase authentication, an Express API, and smart contracts deployed on the Sepolia test network for document verification.
          </Lead>
        </View>
        <View style={{ flex: 1, borderRadius: radii.card, backgroundColor: pal.white, borderWidth: 1, borderColor: pal.line, overflow: 'hidden' }}>
          {STACK.map((s, i) => (
            <View key={s.tag} style={[styles.stackRow, i > 0 && { borderTopWidth: 1, borderTopColor: pal.line }]}>
              <Text style={styles.stackTag}>{s.tag}</Text>
              <Text style={styles.stackText}>{s.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </Panel>
  );
}

export function FinalCta({ onChoosePortal }: { onChoosePortal: () => void }) {
  const L = useLayout();
  const ring = (size: number) => ({ position: 'absolute' as const, right: -size / 3, top: -size / 3, width: size, height: size, borderRadius: size / 2, borderWidth: 1.5, borderColor: 'rgba(11,42,30,0.12)' });
  return (
    <Panel
      tone="lime"
      label="Get started"
      decor={<><View pointerEvents="none" style={ring(420)} /><View pointerEvents="none" style={ring(300)} /></>}
      style={{ borderColor: 'rgba(255,255,255,0.5)' }}
    >
      <View style={{ flexDirection: L.desktop ? 'row' : 'column', alignItems: L.desktop ? 'center' : 'flex-start', justifyContent: 'space-between', gap: sp.xxl }}>
        <View style={{ flex: 1, gap: sp.md, maxWidth: 640 }}>
          <Label tone="limeOn">Get started</Label>
          <Heading level={2}>Ready to secure your documents?</Heading>
          <Text style={[{ fontFamily: font.sansMedium, color: '#254632' }, L.t.lead]}>Choose your portal to get started.</Text>
        </View>
        <LButton variant="forest" label="Choose Your Portal" iconRight="arrow-forward" onPress={onChoosePortal} />
      </View>
    </Panel>
  );
}

function FooterLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={onPress}
      style={(s) => [{ minHeight: 36, justifyContent: 'center', borderRadius: 8 }, (s as PState).focused && focusRing(pal.lime)]}
    >
      {(s) => <Text style={{ fontFamily: font.sansSemi, fontSize: 14, color: (s as PState).hovered ? pal.lime : pal.onDark }}>{label}</Text>}
    </Pressable>
  );
}

export function Footer({ onSignIn, onChoosePortal, onNavigate, onLayout }: { onSignIn: () => void; onChoosePortal: () => void; onNavigate: (k: SectionKey) => void; onLayout: (e: any) => void }) {
  const L = useLayout();
  return (
    <Panel tone="dark" label="Contact and links" onLayout={onLayout} style={{ }}>
      <View style={{ gap: sp.xl }}>
        <View style={{ flexDirection: L.tablet ? 'row' : 'column', justifyContent: 'space-between', gap: sp.xl }}>
          <View style={{ gap: sp.md, maxWidth: 380 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: pal.lime, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="shield-checkmark" size={19} color={pal.forestInk} />
              </View>
              <Text style={{ fontFamily: font.monoBold, fontSize: 16, color: pal.onDark, letterSpacing: -0.3 }}>Smart Asset Vault</Text>
            </View>
            <Text style={{ fontFamily: font.sans, fontSize: 14, lineHeight: 22, color: pal.mutedOnDark }}>
              Store documents securely, verify them on the blockchain, and share them only with the people you choose.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: L.desktop ? sp.x4 : sp.xxl }}>
            <View style={{ gap: 2 }}>
              <Label tone="dark" style={{ marginBottom: sp.sm }}>Explore</Label>
              <FooterLink label="Features" onPress={() => onNavigate('features')} />
              <FooterLink label="How It Works" onPress={() => onNavigate('how')} />
              <FooterLink label="About" onPress={() => onNavigate('about')} />
            </View>
            <View style={{ gap: 2 }}>
              <Label tone="dark" style={{ marginBottom: sp.sm }}>Connect</Label>
              <FooterLink label="Sign In" onPress={onSignIn} />
              <FooterLink label="Choose Your Portal" onPress={onChoosePortal} />
              <FooterLink label="Contact us on GitHub" onPress={() => Linking.openURL(REPO_URL)} />
            </View>
          </View>
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: pal.lineOnDark, paddingTop: sp.lg }}>
          <Text style={{ fontFamily: font.mono, fontSize: 12, lineHeight: 18, color: pal.mutedOnDark }}>
            Hackathon project · Blockchain features run on the Sepolia test network.
          </Text>
        </View>
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  stackRow: { flexDirection: 'row', alignItems: 'center', gap: sp.lg, paddingVertical: 18, paddingHorizontal: sp.xl },
  stackTag: { width: 58, fontFamily: font.monoBold, fontSize: 12, letterSpacing: 1.4, color: pal.greenText },
  stackText: { flex: 1, fontFamily: font.sansSemi, fontSize: 16, lineHeight: 22, color: pal.text },
});
