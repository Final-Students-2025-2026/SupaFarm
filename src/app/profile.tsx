import { Image } from 'expo-image';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthModal } from '@/components/auth-modal';
import { CreateListingModal } from '@/components/create-listing-modal';
import { BottomTabInset, MaxContentWidth, Palette } from '@/constants/theme';
import { authService, type Profile } from '@/services/authService';
import { orderService, type OrderRecord } from '@/services/orderService';

export default function ProfileScreen() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateListingModal, setShowCreateListingModal] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    authService.getCurrentProfile().then((data) => {
      if (mounted) {
        setProfile(data);
        setLoading(false);
      }
    });
    orderService.getUserOrders().then((data) => {
      if (mounted) setOrders(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          authService.signOut();
          setProfile(null);
          setOrders([]);
        },
      },
    ]);
  };

  const handleOpenCreateListing = () => {
    if (!profile) {
      setShowAuthModal(true);
    } else if (profile.role !== 'farmer') {
      Alert.alert(
        'Farmer Account Required',
        'Posting crop listings is restricted to registered Farmers. Would you like to register as a Farmer?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Register as Farmer', onPress: () => setShowAuthModal(true) },
        ]
      );
    } else {
      setShowCreateListingModal(true);
    }
  };

  // ── Not logged in ────────────────────────────────────────────────────────────
  if (!loading && !profile) {
    return (
      <View style={styles.screen}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.loginWall}>
            <View style={styles.loginIconWrap}>
              <MaterialCommunityIcons name="sprout" size={44} color={Palette.emerald} />
            </View>
            <Text style={styles.loginTitle}>Join SupaFarm</Text>
            <Text style={styles.loginSub}>
              Sign up or log in to access your profile, post produce, manage orders, and connect directly with Ghanaian farmers.
            </Text>
            <Pressable
              onPress={() => setShowAuthModal(true)}
              style={styles.loginBtn}>
              <MaterialCommunityIcons name="account-plus" size={20} color={Palette.white} />
              <Text style={styles.loginBtnText}>Sign Up / Log In</Text>
            </Pressable>

            <Text style={styles.loginNote}>
              Already have an account? Tap above to log in.
            </Text>
          </View>
        </SafeAreaView>

        <AuthModal
          visible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={(u) => {
            const newProf: Profile = {
              id: 'usr-new',
              role: u.role,
              account_type: u.accountType,
              full_name: u.fullName,
              phone_number: u.phone,
              address_text: u.location,
              latitude: 5.6037,
              longitude: -0.1870,
            };
            setProfile(newProf);
            authService.updateProfile(newProf.id, newProf);
          }}
        />
      </View>
    );
  }

  // ── Logged in ────────────────────────────────────────────────────────────────
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  const roleLabel =
    profile?.role === 'farmer'
      ? 'Verified Crop Farmer'
      : profile?.account_type === 'business'
      ? 'Business Buyer'
      : 'Individual Buyer';

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>

            {/* Farm Background Image (if farmer) */}
            {profile?.farm_background_image_url ? (
              <View style={styles.farmBanner}>
                <Image
                  source={{ uri: profile.farm_background_image_url }}
                  style={styles.farmBannerImage}
                  contentFit="cover"
                />
                <View style={styles.farmBannerOverlay} />
              </View>
            ) : null}

            {/* Profile Header */}
            <View style={styles.profileCard}>
              <View style={styles.avatarWrap}>
                {profile?.profile_image_url ? (
                  <Image
                    source={{ uri: profile.profile_image_url }}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                )}
              </View>
              <View style={styles.identity}>
                <Text style={styles.name}>{profile?.full_name}</Text>
                <Text style={styles.phone}>{profile?.phone_number}</Text>
                {profile?.address_text ? (
                  <Text style={styles.address}>
                    <MaterialCommunityIcons name="map-marker" size={11} color={Palette.emerald} />
                    {' '}{profile.address_text}
                  </Text>
                ) : null}
                <View style={styles.rolePill}>
                  <Text style={styles.rolePillText}>{roleLabel}</Text>
                </View>
              </View>
            </View>

            {/* Stats (only real data from DB) */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{orders.length}</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
            </View>

            {/* Farmer-only: Post Crop Listing Banner */}
            {profile?.role === 'farmer' && (
              <Pressable onPress={handleOpenCreateListing} style={styles.sellerBanner}>
                <View style={styles.sellerIcon}>
                  <MaterialCommunityIcons name="store-plus" size={27} color={Palette.white} />
                </View>
                <View style={styles.sellerCopy}>
                  <Text style={styles.sellerTitle}>Post New Crop Listing</Text>
                  <Text style={styles.sellerText}>
                    Publish your fresh harvest, set your price per bag/crate, and receive direct buyer calls.
                  </Text>
                </View>
                <MaterialCommunityIcons name="arrow-right" size={21} color={Palette.white} />
              </Pressable>
            )}

            {/* Orders Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Orders</Text>
            </View>
            {orders.length === 0 ? (
              <View style={styles.emptyCard}>
                <MaterialCommunityIcons name="package-variant-closed" size={28} color={Palette.muted} />
                <Text style={styles.emptyText}>No orders yet. Browse the market to place your first order!</Text>
              </View>
            ) : (
              <View style={styles.orderList}>
                {orders.map((order) => (
                  <View key={order.id} style={styles.orderRow}>
                    <View style={styles.orderIcon}>
                      <MaterialCommunityIcons name="package-variant" size={20} color={Palette.emerald} />
                    </View>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderTitle}>{order.id.slice(0, 8)}…</Text>
                      <Text style={styles.orderStatus}>
                        {String(order.status ?? 'pending').replace('_', ' ')}
                      </Text>
                    </View>
                    <Text style={styles.orderAmount}>
                      GH₵ {Number(order.amount_ghc ?? 0).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Sign Out */}
            <Pressable onPress={handleSignOut} style={styles.signOutBtn}>
              <MaterialCommunityIcons name="logout" size={18} color={Palette.tomato} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>

          </View>
        </ScrollView>
      </SafeAreaView>

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(u) => {
          const newProf: Profile = {
            id: 'usr-new',
            role: u.role,
            account_type: u.accountType,
            full_name: u.fullName,
            phone_number: u.phone,
            address_text: u.location,
            latitude: 5.6037,
            longitude: -0.1870,
          };
          setProfile(newProf);
          authService.updateProfile(newProf.id, newProf);
        }}
      />

      <CreateListingModal
        visible={showCreateListingModal}
        onClose={() => setShowCreateListingModal(false)}
        farmerName={profile?.full_name}
        farmerLocation={profile?.address_text}
        onSuccess={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.canvas },
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: BottomTabInset + 28 },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingTop: 14,
    gap: 16,
  },

  // ── Login wall ────────────────────────────────────────────────────────────
  loginWall: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  loginIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Palette.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  loginTitle: {
    color: Palette.forestDark,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  loginSub: {
    color: Palette.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  loginBtn: {
    marginTop: 8,
    height: 52,
    paddingHorizontal: 32,
    borderRadius: 26,
    backgroundColor: Palette.forest,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loginBtnText: {
    color: Palette.white,
    fontSize: 15,
    fontWeight: '900',
  },
  loginNote: {
    color: Palette.muted,
    fontSize: 12,
    textAlign: 'center',
  },

  // ── Profile ───────────────────────────────────────────────────────────────
  farmBanner: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Palette.forestDark,
  },
  farmBannerImage: {
    ...StyleSheet.absoluteFillObject,
  },
  farmBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9,51,34,0.45)',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 18,
    borderRadius: 16,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  avatarWrap: {},
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.forestDark,
  },
  avatarImage: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  avatarText: {
    color: Palette.white,
    fontSize: 20,
    fontWeight: '900',
  },
  identity: { flex: 1, gap: 3 },
  name: { color: Palette.ink, fontSize: 17, fontWeight: '900' },
  phone: { color: Palette.muted, fontSize: 12 },
  address: { color: Palette.muted, fontSize: 11 },
  rolePill: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Palette.emeraldLight,
  },
  rolePillText: { color: Palette.pillTeal, fontSize: 10, fontWeight: '800' },

  statsRow: {
    minHeight: 70,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: Palette.mint,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: Palette.forestDark, fontSize: 22, fontWeight: '900' },
  statLabel: { marginTop: 2, color: Palette.muted, fontSize: 10, fontWeight: '600' },

  sellerBanner: {
    minHeight: 88,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    backgroundColor: Palette.forestDark,
  },
  sellerIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.emerald,
  },
  sellerCopy: { flex: 1 },
  sellerTitle: { color: Palette.white, fontSize: 14, fontWeight: '900' },
  sellerText: { marginTop: 4, color: '#D5E7D9', fontSize: 10, lineHeight: 15 },

  sectionHeader: { marginTop: 4 },
  sectionTitle: { color: Palette.ink, fontSize: 16, fontWeight: '900' },

  emptyCard: {
    padding: 24,
    borderRadius: 14,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    color: Palette.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },

  orderList: {
    borderRadius: 14,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
    overflow: 'hidden',
  },
  orderRow: {
    minHeight: 64,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Palette.line,
  },
  orderIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Palette.paleMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderInfo: { flex: 1 },
  orderTitle: { color: Palette.ink, fontSize: 12, fontWeight: '800' },
  orderStatus: { marginTop: 2, color: Palette.muted, fontSize: 10, textTransform: 'capitalize' },
  orderAmount: { color: Palette.forestDark, fontSize: 13, fontWeight: '900' },

  signOutBtn: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginTop: 4,
    marginBottom: 8,
  },
  signOutText: { color: Palette.tomato, fontSize: 13, fontWeight: '800' },
});
