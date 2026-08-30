import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthModal } from '@/components/auth-modal';
import { CreateListingModal } from '@/components/create-listing-modal';
import { GhanaLocationPicker, type GhanaLocation } from '@/components/ghana-location-picker';
import { BottomTabInset, MaxContentWidth, Palette } from '@/constants/theme';
import { authService, type Profile } from '@/services/authService';
import { marketplaceService, type CropListingRecord } from '@/services/marketplaceService';
import { storageService } from '@/services/storageService';
import { orderService, type OrderRecord } from '@/services/orderService';
import { OrderDetailModal } from '@/components/order-detail-modal';

// ─────────────────────────────────────────────────────────────────────────────
// Edit Crop Modal (inline)
// ─────────────────────────────────────────────────────────────────────────────
function EditCropModal({
  crop,
  visible,
  onClose,
  onSaved,
}: {
  crop: CropListingRecord | null;
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(crop?.title ?? '');
  const [price, setPrice] = useState(String(crop?.price_ghc ?? ''));
  const [unit, setUnit] = useState(crop?.unit ?? '');
  const [description, setDescription] = useState(crop?.description ?? '');
  const [status, setStatus] = useState<'available' | 'sold_out'>(
    (crop?.status as 'available' | 'sold_out') ?? 'available'
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (crop) {
      setTitle(crop.title);
      setPrice(String(crop.price_ghc));
      setUnit(crop.unit);
      setDescription(crop.description ?? '');
      setStatus((crop.status as 'available' | 'sold_out') ?? 'available');
    }
  }, [crop]);

  const handleSave = async () => {
    if (!crop) return;
    setSaving(true);
    const res = await marketplaceService.updateCropListing(crop.id, {
      title: title.trim(),
      price_ghc: parseFloat(price) || crop.price_ghc,
      unit,
      description,
      status,
    });
    setSaving(false);
    if (!res.success) {
      Alert.alert('Update Failed', res.error || 'Failed to update listing.');
      return;
    }
    onSaved();
    onClose();
  };

  if (!visible || !crop) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={editStyles.overlay}>
        <View style={editStyles.container}>
          <View style={editStyles.header}>
            <Text style={editStyles.title}>Edit Crop Listing</Text>
            <Pressable onPress={onClose} style={editStyles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={Palette.ink} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={editStyles.body} keyboardShouldPersistTaps="handled">
            <Text style={editStyles.label}>Crop Title</Text>
            <TextInput value={title} onChangeText={setTitle} style={editStyles.input} placeholderTextColor="#8A958D" />

            <Text style={editStyles.label}>Price (GH₵)</Text>
            <TextInput value={price} onChangeText={setPrice} keyboardType="numeric" style={editStyles.input} placeholderTextColor="#8A958D" />

            <Text style={editStyles.label}>Unit</Text>
            <TextInput value={unit} onChangeText={setUnit} style={editStyles.input} placeholderTextColor="#8A958D" />

            <Text style={editStyles.label}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={[editStyles.input, { height: 74, textAlignVertical: 'top' }]}
              placeholderTextColor="#8A958D"
            />

            <Text style={editStyles.label}>Availability</Text>
            <View style={editStyles.statusRow}>
              {(['available', 'sold_out'] as const).map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setStatus(s)}
                  style={[editStyles.statusChip, status === s && editStyles.statusChipActive]}>
                  <Text style={[editStyles.statusChipText, status === s && editStyles.statusChipTextActive]}>
                    {s === 'available' ? '✓ Available' : '✗ Sold Out'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={handleSave}
              style={[editStyles.saveBtn, saving && { opacity: 0.65 }]}
              disabled={saving}>
              {saving
                ? <ActivityIndicator color={Palette.white} size="small" />
                : <MaterialCommunityIcons name="content-save" size={18} color={Palette.white} />}
              <Text style={editStyles.saveBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const editStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  container: { maxHeight: '85%', borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: Palette.white },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Palette.line },
  title: { color: Palette.ink, fontSize: 17, fontWeight: '900' },
  closeBtn: { padding: 6 },
  body: { padding: 20, gap: 10 },
  label: { color: Palette.ink, fontSize: 13, fontWeight: '800', marginBottom: 2 },
  input: { height: 48, paddingHorizontal: 14, borderRadius: 12, backgroundColor: Palette.canvas, borderWidth: 1, borderColor: Palette.line, color: Palette.ink, fontSize: 14 },
  statusRow: { flexDirection: 'row', gap: 10 },
  statusChip: { flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.canvas, borderWidth: 1.5, borderColor: Palette.line },
  statusChipActive: { backgroundColor: Palette.forest, borderColor: Palette.forest },
  statusChipText: { color: Palette.ink, fontSize: 13, fontWeight: '700' },
  statusChipTextActive: { color: Palette.white },
  saveBtn: { height: 52, borderRadius: 14, backgroundColor: Palette.emerald, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  saveBtnText: { color: Palette.white, fontSize: 15, fontWeight: '900' },
});

// ─────────────────────────────────────────────────────────────────────────────
// Edit Profile Modal (inline)
// ─────────────────────────────────────────────────────────────────────────────
function EditProfileModal({
  profile,
  visible,
  onClose,
  onSaved,
}: {
  profile: Profile | null;
  visible: boolean;
  onClose: () => void;
  onSaved: (updated: Profile) => void;
}) {
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [addressText, setAddressText] = useState(profile?.address_text ?? '');
  const [latitude, setLatitude] = useState(profile?.latitude ?? 5.6037);
  const [longitude, setLongitude] = useState(profile?.longitude ?? -0.1870);
  const [profileImageUri, setProfileImageUri] = useState(profile?.profile_image_url ?? '');
  const [farmBgUri, setFarmBgUri] = useState(profile?.farm_background_image_url ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setAddressText(profile.address_text ?? '');
      setLatitude(profile.latitude);
      setLongitude(profile.longitude);
      setProfileImageUri(profile.profile_image_url ?? '');
      setFarmBgUri(profile.farm_background_image_url ?? '');
    }
  }, [profile]);

  const pickImage = async (type: 'profile' | 'farm') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.7 });
      if (!result.canceled && result.assets[0]?.uri) {
        if (type === 'profile') setProfileImageUri(result.assets[0].uri);
        else setFarmBgUri(result.assets[0].uri);
      }
    } catch (_) {}
  };

  const handleSelectLocation = (loc: GhanaLocation) => {
    setAddressText(loc.addressText);
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
  };

  const handleSave = async () => {
    if (!profile) return;
    if (!fullName.trim()) { Alert.alert('Name Required', 'Please enter your full name.'); return; }
    setSaving(true);

    let profileUrl = profileImageUri;
    let farmBgUrl = farmBgUri;
    if (profileUrl && !profileUrl.startsWith('http')) {
      profileUrl = await storageService.uploadImage(profileUrl, 'avatars');
    }
    if (farmBgUrl && !farmBgUrl.startsWith('http')) {
      farmBgUrl = await storageService.uploadImage(farmBgUrl, 'farms');
    }

    const updated = await authService.updateProfile(profile.id, {
      full_name: fullName.trim(),
      address_text: addressText,
      latitude,
      longitude,
      profile_image_url: profileUrl,
      farm_background_image_url: farmBgUrl,
    });
    setSaving(false);
    if (updated) onSaved(updated);
    onClose();
  };

  if (!visible || !profile) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={epStyles.overlay}>
        <View style={epStyles.container}>
          <View style={epStyles.header}>
            <Text style={epStyles.title}>Update Profile</Text>
            <Pressable onPress={onClose} style={epStyles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={Palette.ink} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={epStyles.body} keyboardShouldPersistTaps="handled">
            <Text style={epStyles.label}>Full Name</Text>
            <TextInput value={fullName} onChangeText={setFullName} style={epStyles.input} placeholderTextColor="#8A958D" placeholder="Your full name" />

            <Text style={epStyles.label}>Location (Ghana)</Text>
            <GhanaLocationPicker
              value={addressText}
              onSelectLocation={handleSelectLocation}
              placeholder="Search your town or market area…"
            />

            <Text style={epStyles.label}>Profile Photo</Text>
            <Pressable onPress={() => pickImage('profile')} style={epStyles.photoBtn}>
              <MaterialCommunityIcons name="camera-account" size={20} color={Palette.emerald} />
              <Text style={epStyles.photoBtnText}>
                {profileImageUri ? '✓ Photo Selected — tap to change' : 'Upload Profile Photo'}
              </Text>
            </Pressable>

            {profile.role === 'farmer' && (
              <>
                <Text style={epStyles.label}>Farm Background Photo</Text>
                <Pressable onPress={() => pickImage('farm')} style={epStyles.photoBtn}>
                  <MaterialCommunityIcons name="image-area" size={20} color={Palette.emerald} />
                  <Text style={epStyles.photoBtnText}>
                    {farmBgUri ? '✓ Photo Selected — tap to change' : 'Upload Farm Background Photo'}
                  </Text>
                </Pressable>
              </>
            )}

            <Pressable
              onPress={handleSave}
              style={[epStyles.saveBtn, saving && { opacity: 0.65 }]}
              disabled={saving}>
              {saving
                ? <ActivityIndicator color={Palette.white} size="small" />
                : <MaterialCommunityIcons name="content-save" size={18} color={Palette.white} />}
              <Text style={epStyles.saveBtnText}>{saving ? 'Saving…' : 'Save Profile'}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const epStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  container: { maxHeight: '90%', borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: Palette.white },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Palette.line },
  title: { color: Palette.ink, fontSize: 17, fontWeight: '900' },
  closeBtn: { padding: 6 },
  body: { padding: 20, gap: 12 },
  label: { color: Palette.ink, fontSize: 13, fontWeight: '800' },
  input: { height: 48, paddingHorizontal: 14, borderRadius: 12, backgroundColor: Palette.canvas, borderWidth: 1, borderColor: Palette.line, color: Palette.ink, fontSize: 14 },
  photoBtn: { height: 48, paddingHorizontal: 14, borderRadius: 12, backgroundColor: Palette.paleMint, borderWidth: 1, borderColor: Palette.line, flexDirection: 'row', alignItems: 'center', gap: 8 },
  photoBtnText: { color: Palette.forest, fontSize: 13, fontWeight: '700', flex: 1 },
  saveBtn: { height: 52, borderRadius: 14, backgroundColor: Palette.forest, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  saveBtnText: { color: Palette.white, fontSize: 15, fontWeight: '900' },
});

// ─────────────────────────────────────────────────────────────────────────────
// Main Profile Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateListingModal, setShowCreateListingModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState<CropListingRecord | null>(null);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<OrderRecord | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [myCrops, setMyCrops] = useState<CropListingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleOrderUpdated = (updated: OrderRecord) => {
    setSelectedDetailOrder(updated);
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  const handleOrderDeleted = (orderId: string) => {
    setSelectedDetailOrder(null);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const loadMyCrops = async (farmerId: string) => {
    const data = await marketplaceService.getMyListings(farmerId);
    setMyCrops(data);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      profile?.id ? loadMyCrops(profile.id) : Promise.resolve(),
      orderService.getUserOrders(profile?.id).then(setOrders),
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    let mounted = true;

    const handleProfileUpdate = (data: Profile | null) => {
      if (!mounted) return;
      setProfile(data);
      setLoading(false);
      if (data?.id && data.role === 'farmer') {
        marketplaceService.getMyListings(data.id).then((crops) => {
          if (mounted) setMyCrops(crops);
        });
      } else {
        setMyCrops([]);
      }
      orderService.getUserOrders(data?.id).then((ordRes) => {
        if (mounted) setOrders(ordRes);
      });
    };

    const unsubscribe = authService.subscribeProfileChange((data) => {
      handleProfileUpdate(data);
    });

    authService.getCurrentProfile().then((data) => {
      handleProfileUpdate(data);
    });

    return () => {
      mounted = false;
      unsubscribe();
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
          setMyCrops([]);
          orderService.getUserOrders().then(setOrders);
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
        'Posting crop listings is restricted to registered Farmers.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Register as Farmer', onPress: () => setShowAuthModal(true) },
        ]
      );
    } else {
      setShowCreateListingModal(true);
    }
  };

  const handleDeleteCrop = (crop: CropListingRecord) => {
    Alert.alert('Delete Listing', `Remove "${crop.title}" from the marketplace?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const res = await marketplaceService.deleteCropListing(crop.id);
          if (!res.success) {
            Alert.alert('Delete Failed', res.error || 'Failed to delete listing.');
            return;
          }
          if (profile?.id) loadMyCrops(profile.id);
        },
      },
    ]);
  };

  // ── Guest view ─────────────────────────────────────────────────────────────
  if (!loading && !profile) {
    return (
      <View style={styles.screen}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[Palette.emerald]}
                tintColor={Palette.emerald}
              />
            }>
            <View style={styles.container}>
              {/* Guest Profile Header */}
              <View style={styles.profileCard}>
                <View style={styles.avatarWrap}>
                  <View style={[styles.avatar, { backgroundColor: Palette.emerald }]}>
                    <MaterialCommunityIcons name="account-outline" size={32} color={Palette.white} />
                  </View>
                </View>
                <View style={styles.identity}>
                  <Text style={styles.name}>Guest Trader</Text>
                  <Text style={styles.phone}>Browsing without account</Text>
                  <View style={styles.rolePill}>
                    <Text style={styles.rolePillText}>Guest User</Text>
                  </View>
                </View>
              </View>

              {/* Login Banner */}
              <View style={styles.sellerBanner}>
                <View style={styles.sellerIcon}>
                  <MaterialCommunityIcons name="sprout" size={27} color={Palette.white} />
                </View>
                <View style={styles.sellerCopy}>
                  <Text style={styles.sellerTitle}>Join SupaFarm</Text>
                  <Text style={styles.sellerText}>
                    Sign up or log in to post produce, manage cloud orders, and connect directly with Ghanaian farmers.
                  </Text>
                </View>
                <Pressable onPress={() => setShowAuthModal(true)} style={styles.loginPillBtn}>
                  <Text style={styles.loginPillText}>Sign Up</Text>
                </Pressable>
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>My Crops</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{orders.length}</Text>
                  <Text style={styles.statLabel}>Orders</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>Active</Text>
                </View>
              </View>

              {/* My Orders */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Orders</Text>
                <Text style={styles.sectionCount}>{orders.length}</Text>
              </View>

              {orders.length === 0 ? (
                <View style={styles.emptyCard}>
                  <MaterialCommunityIcons name="package-variant-closed" size={28} color={Palette.muted} />
                  <Text style={styles.emptyText}>No orders placed yet. Browse the market to place your first produce order!</Text>
                </View>
              ) : (
                <View style={styles.orderList}>
                  {orders.map((order) => (
                    <Pressable
                      key={order.id}
                      onPress={() => setSelectedDetailOrder(order)}
                      style={({ pressed }) => [styles.orderRow, pressed && { backgroundColor: Palette.mint }]}>
                      <View style={styles.orderIcon}>
                        <MaterialCommunityIcons name="package-variant" size={20} color={Palette.emerald} />
                      </View>
                      <View style={styles.orderInfo}>
                        <Text style={styles.orderTitle} numberOfLines={1}>
                          {order.product_name || `Order #${order.id}`}
                        </Text>
                        <Text style={styles.orderStatus}>
                          {order.farmer_name ? `${order.farmer_name} • ` : ''}
                          {String(order.status ?? 'pending').replace('_', ' ')}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.orderAmount}>
                          GH₵ {Number(order.amount_ghc ?? 0).toFixed(2)}
                        </Text>
                        <Text style={{ fontSize: 10, color: Palette.muted, marginTop: 2, textTransform: 'capitalize' }}>
                          {order.delivery_mode ? order.delivery_mode.replace('_', ' ') : 'COD'}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>

        <AuthModal
          visible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={(u) => {
            const newProf: Profile = {
              id: u.id,
              role: u.role,
              account_type: u.accountType,
              full_name: u.fullName,
              phone_number: u.phone,
              address_text: u.location,
              latitude: u.latitude ?? 5.6037,
              longitude: u.longitude ?? -0.1870,
              profile_image_url: u.profileImageUrl,
              farm_background_image_url: u.farmBackgroundImageUrl,
            };
            setProfile(newProf);
            if (newProf.id && newProf.role === 'farmer') loadMyCrops(newProf.id);
            orderService.getUserOrders(newProf.id).then(setOrders);
          }}
        />

        <OrderDetailModal
          visible={!!selectedDetailOrder}
          order={selectedDetailOrder}
          onClose={() => setSelectedDetailOrder(null)}
          onOrderUpdated={handleOrderUpdated}
          onOrderDeleted={handleOrderDeleted}
        />
      </View>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={Palette.emerald} size="large" />
      </View>
    );
  }

  // ── Logged in ──────────────────────────────────────────────────────────────
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
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Palette.emerald]}
              tintColor={Palette.emerald}
            />
          }>
          <View style={styles.container}>

            {/* Farm Background */}
            {profile?.farm_background_image_url ? (
              <View style={styles.farmBanner}>
                <Image source={{ uri: profile.farm_background_image_url }} style={styles.farmBannerImage} contentFit="cover" />
                <View style={styles.farmBannerOverlay} />
              </View>
            ) : null}

            {/* Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarWrap}>
                {profile?.profile_image_url ? (
                  <Image source={{ uri: profile.profile_image_url }} style={styles.avatarImage} contentFit="cover" />
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
              {/* Edit Profile Button */}
              <Pressable onPress={() => setShowEditProfileModal(true)} style={styles.editProfileBtn}>
                <MaterialCommunityIcons name="pencil" size={16} color={Palette.forest} />
              </Pressable>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{myCrops.length}</Text>
                <Text style={styles.statLabel}>My Crops</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{orders.length}</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{myCrops.filter(c => c.status === 'available').length}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
            </View>

            {/* Farmer: Post New Listing */}
            {profile?.role === 'farmer' && (
              <Pressable onPress={handleOpenCreateListing} style={styles.sellerBanner}>
                <View style={styles.sellerIcon}>
                  <MaterialCommunityIcons name="store-plus" size={27} color={Palette.white} />
                </View>
                <View style={styles.sellerCopy}>
                  <Text style={styles.sellerTitle}>Post New Crop Listing</Text>
                  <Text style={styles.sellerText}>
                    Publish your fresh harvest, set your price, and receive direct buyer calls.
                  </Text>
                </View>
                <MaterialCommunityIcons name="arrow-right" size={21} color={Palette.white} />
              </Pressable>
            )}

            {/* My Posted Crops */}
            {profile?.role === 'farmer' && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>My Posted Crops</Text>
                  <Text style={styles.sectionCount}>{myCrops.length}</Text>
                  <Pressable
                    onPress={handleRefresh}
                    style={styles.refreshBtn}>
                    <MaterialCommunityIcons name="refresh" size={16} color={Palette.forest} />
                  </Pressable>
                </View>
                {myCrops.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <MaterialCommunityIcons name="sprout-outline" size={28} color={Palette.muted} />
                    <Text style={styles.emptyText}>No crop listings yet. Post your first harvest!</Text>
                  </View>
                ) : (
                  <View style={styles.cropList}>
                    {myCrops.map((crop) => (
                      <View key={crop.id} style={styles.cropRow}>
                        <View style={styles.cropIcon}>
                          <MaterialCommunityIcons name="barley" size={20} color={Palette.forest} />
                        </View>
                        <View style={styles.cropInfo}>
                          <Text style={styles.cropTitle} numberOfLines={1}>{crop.title}</Text>
                          <Text style={styles.cropMeta}>GH₵ {crop.price_ghc} • {crop.unit}</Text>
                        </View>
                        <View style={[styles.statusBadge, crop.status === 'available' ? styles.badgeGreen : styles.badgeRed]}>
                          <Text style={[styles.statusBadgeText, crop.status === 'available' ? styles.statusGreenText : styles.statusRedText]}>
                            {crop.status === 'available' ? 'Active' : 'Sold'}
                          </Text>
                        </View>
                        <Pressable onPress={() => setEditingCrop(crop)} style={styles.actionBtn}>
                          <MaterialCommunityIcons name="pencil-outline" size={17} color={Palette.forest} />
                        </Pressable>
                        <Pressable onPress={() => handleDeleteCrop(crop)} style={styles.actionBtnRed}>
                          <MaterialCommunityIcons name="trash-can-outline" size={17} color={Palette.tomato} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}

            {/* My Orders */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Orders</Text>
              <Text style={styles.sectionCount}>{orders.length}</Text>
            </View>
            {orders.length === 0 ? (
              <View style={styles.emptyCard}>
                <MaterialCommunityIcons name="package-variant-closed" size={28} color={Palette.muted} />
                <Text style={styles.emptyText}>No orders yet. Browse the market to place your first order!</Text>
              </View>
            ) : (
              <View style={styles.orderList}>
                {orders.map((order) => (
                  <Pressable
                    key={order.id}
                    onPress={() => setSelectedDetailOrder(order)}
                    style={({ pressed }) => [styles.orderRow, pressed && { backgroundColor: Palette.mint }]}>
                    <View style={styles.orderIcon}>
                      <MaterialCommunityIcons name="package-variant" size={20} color={Palette.emerald} />
                    </View>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderTitle} numberOfLines={1}>
                        {order.product_name || `Order #${order.id}`}
                      </Text>
                      <Text style={styles.orderStatus}>
                        {order.farmer_name ? `${order.farmer_name} • ` : ''}
                        {String(order.status ?? 'pending').replace('_', ' ')}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.orderAmount}>
                        GH₵ {Number(order.amount_ghc ?? 0).toFixed(2)}
                      </Text>
                      <Text style={{ fontSize: 10, color: Palette.muted, marginTop: 2, textTransform: 'capitalize' }}>
                        {order.delivery_mode ? order.delivery_mode.replace('_', ' ') : 'COD'}
                      </Text>
                    </View>
                  </Pressable>
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

      {/* Auth Modal */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(u) => {
          const newProf: Profile = {
            id: u.id,
            role: u.role,
            account_type: u.accountType,
            full_name: u.fullName,
            phone_number: u.phone,
            address_text: u.location,
            latitude: u.latitude ?? 5.6037,
            longitude: u.longitude ?? -0.1870,
            profile_image_url: u.profileImageUrl,
            farm_background_image_url: u.farmBackgroundImageUrl,
          };
          setProfile(newProf);
          if (newProf.id && newProf.role === 'farmer') loadMyCrops(newProf.id);
        }}
      />

      {/* Create Listing Modal */}
      <CreateListingModal
        visible={showCreateListingModal}
        onClose={() => setShowCreateListingModal(false)}
        farmerId={profile?.id}
        farmerName={profile?.full_name}
        farmerLocation={profile?.address_text}
        onSuccess={() => {
          if (profile?.id) loadMyCrops(profile.id);
        }}
      />

      {/* Edit Crop Modal */}
      <EditCropModal
        crop={editingCrop}
        visible={!!editingCrop}
        onClose={() => setEditingCrop(null)}
        onSaved={() => {
          if (profile?.id) loadMyCrops(profile.id);
        }}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        profile={profile}
        visible={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        onSaved={(updated) => setProfile(updated)}
      />

      {/* Order Detail Modal */}
      <OrderDetailModal
        visible={!!selectedDetailOrder}
        order={selectedDetailOrder}
        onClose={() => setSelectedDetailOrder(null)}
        onOrderUpdated={handleOrderUpdated}
        onOrderDeleted={handleOrderDeleted}
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

  // Login wall
  loginWall: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  loginIconWrap: { width: 90, height: 90, borderRadius: 45, backgroundColor: Palette.mint, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  loginTitle: { color: Palette.forestDark, fontSize: 26, fontWeight: '900', textAlign: 'center' },
  loginSub: { color: Palette.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  loginBtn: { marginTop: 8, height: 52, paddingHorizontal: 32, borderRadius: 26, backgroundColor: Palette.forest, flexDirection: 'row', alignItems: 'center', gap: 10 },
  loginBtnText: { color: Palette.white, fontSize: 15, fontWeight: '900' },
  loginPillBtn: { paddingHorizontal: 14, height: 38, borderRadius: 12, backgroundColor: Palette.emeraldLight, borderWidth: 1, borderColor: Palette.emerald, alignItems: 'center', justifyContent: 'center' },
  loginPillText: { color: Palette.pillTeal, fontSize: 12, fontWeight: '800' },

  // Profile
  farmBanner: { height: 140, borderRadius: 16, overflow: 'hidden', backgroundColor: Palette.forestDark },
  farmBannerImage: { ...StyleSheet.absoluteFillObject },
  farmBannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(9,51,34,0.45)' },

  profileCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 18, borderRadius: 16, backgroundColor: Palette.white, borderWidth: 1, borderColor: Palette.line },
  avatarWrap: {},
  avatar: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.forestDark },
  avatarImage: { width: 62, height: 62, borderRadius: 31 },
  avatarText: { color: Palette.white, fontSize: 20, fontWeight: '900' },
  identity: { flex: 1, gap: 3 },
  name: { color: Palette.ink, fontSize: 17, fontWeight: '900' },
  phone: { color: Palette.muted, fontSize: 12 },
  address: { color: Palette.muted, fontSize: 11 },
  rolePill: { alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: Palette.emeraldLight },
  rolePillText: { color: Palette.pillTeal, fontSize: 10, fontWeight: '800' },
  editProfileBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.mint, borderWidth: 1, borderColor: Palette.line },

  // Stats
  statsRow: { minHeight: 70, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', borderRadius: 16, backgroundColor: Palette.mint, borderWidth: 1, borderColor: Palette.line },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: Palette.forestDark, fontSize: 22, fontWeight: '900' },
  statLabel: { marginTop: 2, color: Palette.muted, fontSize: 10, fontWeight: '600' },
  statDivider: { width: 1, height: 36, backgroundColor: Palette.line },

  // Post banner
  sellerBanner: { minHeight: 88, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, backgroundColor: Palette.forestDark },
  sellerIcon: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.emerald },
  sellerCopy: { flex: 1 },
  sellerTitle: { color: Palette.white, fontSize: 14, fontWeight: '900' },
  sellerText: { marginTop: 4, color: '#D5E7D9', fontSize: 10, lineHeight: 15 },

  // Section headers
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  sectionTitle: { flex: 1, color: Palette.ink, fontSize: 16, fontWeight: '900' },
  sectionCount: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: Palette.mint, color: Palette.forest, fontSize: 12, fontWeight: '800' },
  refreshBtn: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.mint },

  // Crop list
  cropList: { borderRadius: 14, backgroundColor: Palette.white, borderWidth: 1, borderColor: Palette.line, overflow: 'hidden' },
  cropRow: { minHeight: 60, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: Palette.line },
  cropIcon: { width: 36, height: 36, borderRadius: 9, backgroundColor: Palette.paleMint, alignItems: 'center', justifyContent: 'center' },
  cropInfo: { flex: 1 },
  cropTitle: { color: Palette.ink, fontSize: 13, fontWeight: '800' },
  cropMeta: { color: Palette.muted, fontSize: 11, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeGreen: { backgroundColor: Palette.emeraldLight },
  badgeRed: { backgroundColor: '#FEE2E2' },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  statusGreenText: { color: Palette.pillTeal },
  statusRedText: { color: Palette.tomato },
  actionBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.mint },
  actionBtnRed: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2' },

  // Empty
  emptyCard: { padding: 24, borderRadius: 14, backgroundColor: Palette.white, borderWidth: 1, borderColor: Palette.line, alignItems: 'center', gap: 8 },
  emptyText: { color: Palette.muted, fontSize: 13, textAlign: 'center', lineHeight: 18 },

  // Orders
  orderList: { borderRadius: 14, backgroundColor: Palette.white, borderWidth: 1, borderColor: Palette.line, overflow: 'hidden' },
  orderRow: { minHeight: 64, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: Palette.line },
  orderIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: Palette.paleMint, alignItems: 'center', justifyContent: 'center' },
  orderInfo: { flex: 1 },
  orderTitle: { color: Palette.ink, fontSize: 12, fontWeight: '800' },
  orderStatus: { marginTop: 2, color: Palette.muted, fontSize: 10, textTransform: 'capitalize' },
  orderAmount: { color: Palette.forestDark, fontSize: 13, fontWeight: '900' },

  // Sign out
  signOutBtn: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, backgroundColor: Palette.white, borderWidth: 1, borderColor: '#FEE2E2', marginTop: 4, marginBottom: 8 },
  signOutText: { color: Palette.tomato, fontSize: 13, fontWeight: '800' },
});
