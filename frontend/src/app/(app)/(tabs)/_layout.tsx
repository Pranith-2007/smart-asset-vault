import { Tabs } from 'expo-router';
import { StyleSheet, type ColorValue } from 'react-native';
import { Icon, type IconName } from '@/components';
import { colors, fonts } from '@/theme';

const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color }: { color: ColorValue }) => <Icon name={icon} size={22} color={String(color)} />,
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.patina,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.sansMedium, fontSize: 12 },
        tabBarStyle: { backgroundColor: colors.folio, borderTopColor: colors.rule, borderTopWidth: StyleSheet.hairlineWidth, elevation: 0 },
        sceneStyle: { backgroundColor: colors.paper },
      }}
    >
      <Tabs.Screen name="index" options={tab('Overview', 'shield')} />
      <Tabs.Screen name="assets" options={tab('Assets', 'layers')} />
      <Tabs.Screen name="vault" options={tab('Vault', 'archive')} />
      <Tabs.Screen name="access" options={tab('Access', 'key')} />
      <Tabs.Screen name="profile" options={tab('Profile', 'user')} />
    </Tabs>
  );
}
