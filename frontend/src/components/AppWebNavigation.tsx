
import { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { Icon, type IconName } from '@/components';
import { colors, fonts } from '@/theme';

const links: { label: string; path: string; icon: IconName }[] = [
  { label: 'Home', path: '/(app)/(tabs)/home', icon: 'home' },
  { label: 'Documents', path: '/(app)/(tabs)/documents', icon: 'folder' },
  { label: 'Verify', path: '/(app)/(tabs)/verify', icon: 'shield' },
  { label: 'Shares', path: '/(app)/(tabs)/access', icon: 'share-2' },
];

export function AppWebNavigation() {
  const [open, setOpen] = useState(false);
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const router = useRouter();

  

  const navigate = (path: string) => {
    setOpen(false);
    router.navigate(path as never);
  };

  return (
    <>
      <View style={styles.header}>
        <View style={styles.brand}>
          <Image
            source={require('../../assets/sav-logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
            accessibilityLabel="Smart Asset Vault logo"
          />
          <Text style={styles.brandText}>Smart Asset Vault</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open navigation menu"
          onPress={() => setOpen(true)}
          style={styles.menuButton}
        >
          <Icon name="menu" size={24} color={colors.ink} />
          <Text style={styles.menuText}>Menu</Text>
        </Pressable>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.overlay}>
          <Pressable
            accessibilityLabel="Close navigation menu"
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
          />

          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <View style={styles.brand}>
                <Image
                  source={require('../../assets/sav-logo.png')}
                  style={styles.brandLogo}
                  resizeMode="contain"
                  accessibilityLabel="Smart Asset Vault logo"
                />
                <Text style={styles.brandText}>Navigation</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close menu"
                onPress={() => setOpen(false)}
                style={styles.closeButton}
              >
                <Icon name="x" size={22} color={colors.ink} />
              </Pressable>
            </View>

            {links.map((link) => {
              const active = pathname.endsWith(
                link.path.split('/').pop() ?? '',
              );

              return (
                <Pressable
                  key={link.path}
                  accessibilityRole="button"
                  onPress={() => navigate(link.path)}
                  style={[styles.link, active && styles.activeLink]}
                >
                  <Icon
                    name={link.icon}
                    size={20}
                    color={active ? colors.patina : colors.ink}
                  />
                  <Text style={[styles.linkText, active && styles.activeText]}>
                    {link.label}
                  </Text>
                  <Icon name="chevron-right" size={18} color={colors.muted} />
                </Pressable>
              );
            })}

            <View style={styles.drawerFooter}>
              <Text style={styles.footerLabel}>SMART ASSET VAULT</Text>
              <Text style={styles.footerHint}>
                Your documents, organised.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 76,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.folio,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule,
    zIndex: 10,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandLogo: {
    width: 42,
    height: 42,
  },
  brandText: {
    fontFamily: fonts.sansMedium,
    fontSize: 17,
    color: colors.ink,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 12,
    backgroundColor: colors.paper,
  },
  menuText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(10, 25, 18, 0.35)',
  },
  drawer: {
    width: 320,
    maxWidth: '88%',
    height: '100%',
    backgroundColor: colors.folio,
    padding: 24,
    paddingTop: 32,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    ...({ boxShadow: '0 8px 40px rgba(0,0,0,0.15)' } as object),
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.paper,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 8,
  },
  activeLink: { backgroundColor: colors.patinaTint },
  linkText: {
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 15,
    color: colors.ink,
  },
  activeText: { color: colors.patina },
  drawerFooter: {
    marginTop: 'auto',
    paddingTop: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.rule,
  },
  footerLabel: {
    fontSize: 11,
    letterSpacing: 1.4,
    fontFamily: fonts.sansMedium,
    color: colors.muted,
  },
  footerHint: { marginTop: 8, fontSize: 13, color: colors.ink },
});
