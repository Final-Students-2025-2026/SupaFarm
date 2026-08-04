import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/marketplace-ui';
import { BottomTabInset, MaxContentWidth, Palette } from '@/constants/theme';

const menuItems = [
  { label: 'My orders', caption: 'Track and review your purchases', icon: 'package-variant-closed' },
  { label: 'Saved produce', caption: 'Products and farms you follow', icon: 'heart-outline' },
  { label: 'Delivery addresses', caption: 'Home, shop, and market locations', icon: 'map-marker-outline' },
  { label: 'Payment methods', caption: 'Mobile money and saved cards', icon: 'wallet-outline' },
];

export default function ProfileScreen() {
  const [notifications, setNotifications] = useState(true);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <ScreenHeader
              title="My account"
              subtitle="Manage your market activity and preferences"
              right={
                <Pressable style={styles.settingsButton}>
                  <MaterialCommunityIcons name="cog-outline" size={22} color={Palette.ink} />
                </Pressable>
              }
            />

            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>KA</Text>
              </View>
              <View style={styles.identity}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>Kwame Asante</Text>
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={17}
                    color={Palette.green}
                  />
                </View>
                <Text style={styles.phone}>+233 24 000 0000</Text>
                <View style={styles.buyerPill}>
                  <Text style={styles.buyerPillText}>Verified buyer</Text>
                </View>
              </View>
              <Pressable style={styles.editButton}>
                <MaterialCommunityIcons name="pencil-outline" size={17} color={Palette.green} />
              </Pressable>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>6</Text>
                <Text style={styles.statLabel}>Saved</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>4.8</Text>
                <Text style={styles.statLabel}>Buyer rating</Text>
              </View>
            </View>

            <View style={styles.menu}>
              {menuItems.map((item) => (
                <Pressable
                  key={item.label}
                  style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}>
                  <View style={styles.menuIcon}>
                    <MaterialCommunityIcons name={item.icon} size={21} color={Palette.green} />
                  </View>
                  <View style={styles.menuCopy}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Text style={styles.menuCaption}>{item.caption}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={22} color={Palette.muted} />
                </Pressable>
              ))}
              <View style={styles.menuItem}>
                <View style={styles.menuIcon}>
                  <MaterialCommunityIcons name="bell-outline" size={21} color={Palette.green} />
                </View>
                <View style={styles.menuCopy}>
                  <Text style={styles.menuLabel}>Price alerts</Text>
                  <Text style={styles.menuCaption}>Updates on products you watch</Text>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#C8D0CA', true: '#7BC18D' }}
                  thumbColor={notifications ? Palette.green : Palette.white}
                />
              </View>
            </View>

            <View style={styles.sellerBanner}>
              <View style={styles.sellerIcon}>
                <MaterialCommunityIcons name="tractor" size={27} color={Palette.white} />
              </View>
              <View style={styles.sellerCopy}>
                <Text style={styles.sellerTitle}>Grow and sell with us</Text>
                <Text style={styles.sellerText}>
                  Reach buyers across Ghana with your farm profile.
                </Text>
              </View>
              <MaterialCommunityIcons name="arrow-right" size={21} color={Palette.white} />
            </View>

            <Pressable style={styles.helpButton}>
              <MaterialCommunityIcons name="lifebuoy" size={20} color={Palette.green} />
              <Text style={styles.helpText}>Help and support</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.canvas,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: BottomTabInset + 28,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingTop: 22,
    gap: 20,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  profileCard: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 8,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.forest,
  },
  avatarText: {
    color: Palette.white,
    fontSize: 19,
    fontWeight: '900',
  },
  identity: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  name: {
    color: Palette.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  phone: {
    marginTop: 3,
    color: Palette.muted,
    fontSize: 11,
  },
  buyerPill: {
    alignSelf: 'flex-start',
    marginTop: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: Palette.mint,
  },
  buyerPillText: {
    color: Palette.green,
    fontSize: 9,
    fontWeight: '800',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.paleMint,
  },
  statsRow: {
    minHeight: 84,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Palette.mint,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: Palette.forest,
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    marginTop: 3,
    color: Palette.muted,
    fontSize: 10,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: '#C8DECE',
  },
  menu: {
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  menuItem: {
    minHeight: 72,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Palette.line,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.paleMint,
  },
  menuCopy: {
    flex: 1,
  },
  menuLabel: {
    color: Palette.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  menuCaption: {
    marginTop: 3,
    color: Palette.muted,
    fontSize: 10,
  },
  sellerBanner: {
    minHeight: 94,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderRadius: 8,
    backgroundColor: Palette.forest,
  },
  sellerIcon: {
    width: 47,
    height: 47,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.leaf,
  },
  sellerCopy: {
    flex: 1,
  },
  sellerTitle: {
    color: Palette.white,
    fontSize: 14,
    fontWeight: '900',
  },
  sellerText: {
    marginTop: 4,
    color: '#D5E7D9',
    fontSize: 10,
    lineHeight: 15,
  },
  helpButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  helpText: {
    color: Palette.green,
    fontSize: 12,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.65,
  },
});
