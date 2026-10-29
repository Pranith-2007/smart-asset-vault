
import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { font, pal, radii, shadow, sp } from './tokens';
import { LButton, focusRing, transition, useLayout, useReducedMotion, type PState, type SectionKey } from './ui';

const LINKS: [string, SectionKey][] = [
  ['Home', 'home'],
  ['Features', 'features'],
  ['How It Works', 'how'],
  ['About', 'about'],
  ['Contact', 'contact'],
];

interface Props {
  onSignIn: () => void;
  onChoosePortal: () => void;
  onNavigate: (k: SectionKey) => void;
}

function NavLink({ label, onPress, bold }: { label: string; onPress: () => void; bold?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={onPress}
      style={(s) => {
        const st = s as PState;
        return [
          { paddingHorizontal: 14, minHeight: 40, justifyContent: 'center', borderRadius: radii.pill },
          transition(reduce),
          st.hovered && { backgroundColor: pal.mint },
          st.focused && focusRing(pal.emerald),
        ];
      }}
    >
      <Text style={{ fontFamily: bold ? font.sansBold : font.sansSemi, fontSize: 15, color: pal.text }}>{label}</Text>
    </Pressable>
  );
}

/** Normal-flow navigation. Not sticky and not fixed, so it scrolls away with the page. */
export function Nav({ onSignIn, onChoosePortal, onNavigate }: Props) {
  const L = useLayout();
  const [open, setOpen] = useState(false);
  const go = (k: SectionKey) => { setOpen(false); onNavigate(k); };
  const menuOpen = open && !L.desktop;
  const showSignIn = L.width >= 520;

  return (
    <View
      role="navigation"
      aria-label="Main navigation"
      style={[
        { backgroundColor: 'rgba(247,250,247,0.95)', borderRadius: menuOpen ? 28 : L.desktop ? radii.pill : 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', paddingHorizontal: L.desktop ? 14 : 12 },
        shadow.sm,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 64, gap: sp.md }}>
        <Pressable accessibilityRole="link" accessibilityLabel="Smart Asset Vault, go to top" onPress={() => go('home')} style={(s) => [{ flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12 }, (s as PState).focused && focusRing(pal.emerald)]}>
          <Image
            source={require('../../assets/sav-logo.png')}
            style={{ width: 42, height: 42 }}
            resizeMode="contain"
            accessibilityLabel="Smart Asset Vault logo"
          />
          <Text style={{ fontFamily: font.monoBold, fontSize: L.mobile ? 15 : 16, color: pal.forest, letterSpacing: -0.3 }}>Smart Asset Vault</Text>
        </Pressable>

        {L.desktop ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            {LINKS.map(([label, key]) => <NavLink key={key} label={label} onPress={() => go(key)} />)}
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: sp.sm }}>
          {showSignIn ? <NavLink label="Sign In" onPress={onSignIn} bold /> : null}
          {L.desktop ? (
            <LButton variant="forest" compact label="Choose Your Portal" iconRight="arrow-forward" onPress={onChoosePortal} />
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={open ? 'Close menu' : 'Open menu'}
              accessibilityState={{ expanded: open }}
              onPress={() => setOpen((v) => !v)}
              style={(s) => [{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: pal.mint }, (s as PState).focused && focusRing(pal.emerald)]}
            >
              <Ionicons name={open ? 'close' : 'menu'} size={22} color={pal.forest} />
            </Pressable>
          )}
        </View>
      </View>

      {menuOpen ? (
        <View style={{ paddingBottom: sp.lg, gap: sp.xs, borderTopWidth: 1, borderTopColor: pal.line, paddingTop: sp.md }}>
          {LINKS.map(([label, key]) => (
            <Pressable
              key={key}
              accessibilityRole="link"
              accessibilityLabel={label}
              onPress={() => go(key)}
              style={(s) => [{ minHeight: 48, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 14 }, (s as PState).hovered && { backgroundColor: pal.mint }, (s as PState).focused && focusRing(pal.emerald)]}
            >
              <Text style={{ fontFamily: font.sansSemi, fontSize: 16, color: pal.text }}>{label}</Text>
            </Pressable>
          ))}
          {!showSignIn ? (
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Sign In"
              onPress={() => { setOpen(false); onSignIn(); }}
              style={(s) => [{ minHeight: 48, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 14 }, (s as PState).hovered && { backgroundColor: pal.mint }, (s as PState).focused && focusRing(pal.emerald)]}
            >
              <Text style={{ fontFamily: font.sansBold, fontSize: 16, color: pal.text }}>Sign In</Text>
            </Pressable>
          ) : null}
          <View style={{ paddingTop: sp.md }}>
            <LButton variant="forest" label="Choose Your Portal" iconRight="arrow-forward" onPress={() => { setOpen(false); onChoosePortal(); }} />
          </View>
        </View>
      ) : null}
    </View>
  );
}
