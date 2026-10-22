
import { Tabs } from 'expo-router';
import { StyleSheet, type ColorValue } from 'react-native';
import { Icon, type IconName } from '@/components';
import { colors, fonts } from '@/theme';

const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color }: { color: ColorValue }) => (
    <Icon name={icon} size={22} color={String(color)} />
  ),
});

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.patina,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontFamily: fonts.sansMedium,
          fontSize: 12,
        },
        tabBarStyle: {
          backgroundColor: colors.folio,
          borderTopColor: colors.rule,
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
        },
        sceneStyle: { backgroundColor: colors.paper },
      }}
    >
      <Tabs.Screen name="home" options={tab('Home', 'home')} />
      <Tabs.Screen name="documents" options={tab('Documents', 'folder')} />
      <Tabs.Screen name="verify" options={tab('Verify', 'shield')} />
      <Tabs.Screen name="access" options={tab('Shares', 'share-2')} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="vault" options={{ href: null }} />
      <Tabs.Screen name="assets" options={{ href: null }} />
    </Tabs>
  );
}
