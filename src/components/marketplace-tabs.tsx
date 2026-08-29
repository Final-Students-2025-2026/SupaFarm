import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  type TabListProps,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Palette } from '@/constants/theme';

type TabButtonProps = TabTriggerSlotProps & {
  icon: string;
  label: string;
};

function TabButton({ icon, label, isFocused, ...props }: TabButtonProps) {
  return (
    <Pressable
      {...props}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={isFocused ? Palette.white : Palette.muted}
        />
      </View>
      <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function AppTabList(props: TabListProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      {...props}
      style={[
        styles.tabBarOuter,
        {
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'web' ? 12 : 8),
        },
      ]}>
      <View style={styles.tabBar}>{props.children}</View>
    </View>
  );
}

export default function MarketplaceTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <AppTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton icon="home-variant" label="Home" />
          </TabTrigger>
          <TabTrigger name="market" href="/market" asChild>
            <TabButton icon="storefront-outline" label="Market" />
          </TabTrigger>
          <TabTrigger name="discover" href="/explore" asChild>
            <TabButton icon="compass-outline" label="Discover" />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton icon="account-outline" label="Profile" />
          </TabTrigger>
        </AppTabList>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  slot: {
    height: '100%',
  },
  tabBarOuter: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Palette.line,
  },
  tabBar: {
    width: '100%',
    maxWidth: MaxContentWidth,
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    minWidth: 66,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconWrap: {
    width: 38,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: Palette.emerald,
  },
  tabLabel: {
    color: Palette.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: Palette.forestDark,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.65,
  },
});
