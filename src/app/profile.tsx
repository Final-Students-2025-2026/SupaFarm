import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/marketplace-ui';
import { AuthModal } from '@/components/auth-modal';
import { DeliveryTrackingModal } from '@/components/delivery-tracking-modal';
import { BottomTabInset, MaxContentWidth, Palette } from '@/constants/theme';

export default function ProfileScreen() {
  const [notifications, setNotifications] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'Kwame Asante',
    role: 'Verified Buyer',
    phone: '+233 24 892 1042',
    location: 'Agbogbloshie Market, Accra',
  });

  const menuItems = [
    {
      label: 'My Orders & Deliveries',
      caption: 'Track live 3-tier shipments and view receipt',
      icon: 'package-variant-closed',
      onPress: () => setShowDeliveryModal(true),
    },
    {
      label: 'Saved Farms & Produce',
      caption: 'Farms you follow and favorite crop listings',
      icon: 'heart-outline',
      onPress: () => {},
    },
    {
      label: 'Delivery & Farm Location',
      caption: userProfile.location,
      icon: 'map-marker-outline',
      onPress: () => setShowAuthModal(true),
    },
    {
      label: 'Payment Mode',
      caption: 'Cash on Delivery (COD)',
      icon: 'cash-multiple',
      onPress: () => {},
    },
  ];

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <ScreenHeader
              title="SupaFarm Account"
              subtitle="Manage your profile, role registration, and market orders"
              right={
                <Pressable onPress={() => setShowAuthModal(true)} style={styles.settingsButton}>
                  <MaterialCommunityIcons name="cog-outline" size={22} color={Palette.ink} />
                </Pressable>
              }
            />

            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {userProfile.name.split(' ').map((n) => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.identity}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{userProfile.name}</Text>
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={17}
                    color={Palette.emerald}
                  />
                </View>
                <Text style={styles.phone}>{userProfile.phone}</Text>
                <View style={styles.buyerPill}>
                  <Text style={styles.buyerPillText}>{userProfile.role}</Text>
                </View>
              </View>
              <Pressable onPress={() => setShowAuthModal(true)} style={styles.editButton}>
                <MaterialCommunityIcons name="pencil-outline" size={17} color={Palette.forestDark} />
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
                <Text style={styles.statValue}>4.9 ★</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>

            <View style={styles.menu}>
              {menuItems.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={item.onPress}
                  style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}>
                  <View style={styles.menuIcon}>
                    <MaterialCommunityIcons name={item.icon} size={21} color={Palette.emerald} />
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
                  <MaterialCommunityIcons name="bell-outline" size={21} color={Palette.emerald} />
                </View>
                <View style={styles.menuCopy}>
                  <Text style={styles.menuLabel}>Price Alerts</Text>
                  <Text style={styles.menuCaption}>Real-time updates on Ghanaian market trends</Text>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#C8D0CA', true: Palette.emeraldLight }}
                  thumbColor={notifications ? Palette.emerald : Palette.white}
                />
              </View>
            </View>

            {/* Switch Role Banner */}
            <Pressable onPress={() => setShowAuthModal(true)} style={styles.sellerBanner}>
              <View style={styles.sellerIcon}>
                <MaterialCommunityIcons name="tractor" size={27} color={Palette.white} />
              </View>
              <View style={styles.sellerCopy}>
                <Text style={styles.sellerTitle}>Switch Role / Register as Farmer</Text>
                <Text style={styles.sellerText}>
                  Set up your greenhouse telemetry, post fresh crops, and receive buyer calls.
                </Text>
              </View>
              <MaterialCommunityIcons name="arrow-right" size={21} color={Palette.white} />
            </Pressable>

            <Pressable onPress={() => setShowAuthModal(true)} style={styles.helpButton}>
              <MaterialCommunityIcons name="shield-account-outline" size={20} color={Palette.emerald} />
              <Text style={styles.helpText}>3-Step Sign-up & Account Security</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(u) => {
          setUserProfile({
            name: u.fullName,
            role: u.role === 'farmer' ? 'Verified Farmer' : `Buyer (${u.accountType || 'Individual'})`,
            phone: u.phone,
            location: u.location,
          });
        }}
      />

      <DeliveryTrackingModal
        visible={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
      />
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
    borderRadius: 12,
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
    borderRadius: 16,
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
    backgroundColor: Palette.forestDark,
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
    borderRadius: 6,
    backgroundColor: Palette.emeraldLight,
  },
  buyerPillText: {
    color: Palette.pillTeal,
    fontSize: 10,
    fontWeight: '800',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.paleMint,
  },
  statsRow: {
    minHeight: 84,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: Palette.mint,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: Palette.forestDark,
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
    backgroundColor: Palette.line,
  },
  menu: {
    overflow: 'hidden',
    borderRadius: 16,
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
    borderRadius: 10,
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
    borderRadius: 16,
    backgroundColor: Palette.forestDark,
  },
  sellerIcon: {
    width: 47,
    height: 47,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.emerald,
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
    borderRadius: 12,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  helpText: {
    color: Palette.forestDark,
    fontSize: 12,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.65,
  },
});
