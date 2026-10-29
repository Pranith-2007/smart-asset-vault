import { useRef } from 'react';
import { Linking, ScrollView, View, type LayoutChangeEvent } from 'react-native';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { RobotoMono_400Regular, RobotoMono_500Medium, RobotoMono_600SemiBold, RobotoMono_700Bold } from '@expo-google-fonts/roboto-mono';
import { About, FinalCta, Footer } from './Closing';
import { Features } from './Features';
import { Hero } from './Hero';
import { HowItWorks } from './HowItWorks';
import { Nav } from './Nav';
import { Showcase } from './Showcase';
import { pal, web } from './tokens';
import { useLayout, useReducedMotion, type SectionKey } from './ui';

interface Props {
  onSignIn: () => void;
  onChoosePortal: () => void;
  demoUrl?: string;
}

/**
 * Landing page composition.
 * Structure: dark frame > emerald-to-lime gradient shell > large rounded panels.
 * The navbar is ordinary flow content, so it scrolls away with the page (not sticky, not fixed).
 */
export default function LandingPage({ onSignIn, onChoosePortal, demoUrl }: Props) {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold,
    RobotoMono_400Regular, RobotoMono_500Medium, RobotoMono_600SemiBold, RobotoMono_700Bold,
  });
  const L = useLayout();
  const reduce = useReducedMotion();
  const scroller = useRef<ScrollView>(null);
  const shellY = useRef(0);
  const ys = useRef<Partial<Record<SectionKey, number>>>({});

  // Panels report their y inside the shell; add the shell's own offset to get the scroll position.
  const mark = (k: SectionKey) => (e: LayoutChangeEvent) => { ys.current[k] = e.nativeEvent.layout.y; };
  const go = (k: SectionKey) =>
    scroller.current?.scrollTo({ y: k === 'home' ? 0 : Math.max(shellY.current + (ys.current[k] ?? 0) - 12, 0), animated: !reduce });
  const watchDemo = () => (demoUrl ? Linking.openURL(demoUrl) : go('showcase'));

  // Avoid a flash of fallback fonts and the layout jump that comes with it.
  if (!fontsLoaded && !fontError) return <View style={{ flex: 1, backgroundColor: pal.frame }} />;

  return (
    <ScrollView ref={scroller} style={{ flex: 1, backgroundColor: pal.frame }} contentContainerStyle={{ flexGrow: 1, backgroundColor: pal.frame }}>
      <View
        onLayout={(e) => { shellY.current = e.nativeEvent.layout.y; }}
        style={[
          {
            marginVertical: L.shellMarginY,
            padding: L.shellPad,
            gap: L.panelGap,
            borderRadius: L.panelRadius + L.shellPad,
            overflow: 'hidden',
            backgroundColor: '#12894A',
            borderWidth: 1,
            borderColor: 'rgba(200,245,66,0.28)',
            marginHorizontal: L.shellMarginX,
          },
          web({
            // Centre and cap the shell on very wide monitors; the frame colour shows either side.
            width: `calc(100% - ${L.shellMarginX * 2}px)`,
            maxWidth: 1480,
            alignSelf: 'center',
            backgroundImage:
              'radial-gradient(900px 600px at 92% 4%, rgba(200,245,66,0.55), transparent 60%), linear-gradient(155deg, #0B6B35 0%, #12894A 38%, #2FB158 66%, #0E6B38 100%)',
          }),
        ]}
      >
        <Nav onSignIn={onSignIn} onChoosePortal={onChoosePortal} onNavigate={go} />
        <Hero onChoosePortal={onChoosePortal} onWatchDemo={watchDemo} />
        <Features onLayout={mark('features')} />
        <Showcase onLayout={mark('showcase')} />
        <HowItWorks onLayout={mark('how')} />
        <About onLayout={mark('about')} />
        <FinalCta onChoosePortal={onChoosePortal} />
        <Footer onSignIn={onSignIn} onChoosePortal={onChoosePortal} onNavigate={go} onLayout={mark('contact')} />
      </View>
    </ScrollView>
  );
}
