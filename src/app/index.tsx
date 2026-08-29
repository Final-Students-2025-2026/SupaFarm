import { Image } from 'expo-image';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BrandMark,
  IconButton,
  ProductCard,
  SearchField,
  SectionHeading,
  type Product,
} from '@/components/marketplace-ui';
import { VoiceCallModal } from '@/components/voice-call-modal';
import { AuthModal } from '@/components/auth-modal';
import { DeliveryTrackingModal } from '@/components/delivery-tracking-modal';

import { CreateListingModal } from '@/components/create-listing-modal';
import { BottomTabInset, MaxContentWidth, Palette } from '@/constants/theme';
import { marketplaceService, type MarketPriceItem } from '@/services/marketplaceService';
import { authService, type Profile } from '@/services/authService';

const categories = [
  { name: 'Vegetables', icon: 'carrot', color: '#E5F5E8' },
  { name: 'Fruits', icon: 'food-apple-outline', color: '#FFF1D8' },
  { name: 'Grains', icon: 'barley', color: '#F3E9D4' },
  { name: 'Tubers', icon: 'sprout-outline', color: '#F8E5DC' },
  { name: 'Livestock', icon: 'cow', color: '#E8EEF2' },
  { name: 'Inputs', icon: 'watering-can-outline', color: '#E5F2F1' },
];

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // API Dynamic States
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPriceItem[]>([]);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  // Modals
  const [showCallModal, setShowCallModal] = useState(false);
  const [callRecipient, setCallRecipient] = useState({ name: 'Farmer / Seller', location: 'Ghana' });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<Product | null>(null);
  const [showCreateListingModal, setShowCreateListingModal] = useState(false);

  const { width } = useWindowDimensions();
  const isWide = width >= 820;

  useEffect(() => {
    let mounted = true;

    // 1. Fetch User Profile
    authService.getCurrentProfile().then((prof) => {
      if (mounted) {
        setUserProfile(prof);
        // If not logged in on first start, trigger Auth modal
        if (!prof) {
          setShowAuthModal(true);
        }
      }
    });

    // 2. Fetch Crop Listings
    marketplaceService.getCropListings().then((prods) => {
      if (mounted) setProductsList(prods);
    });

    // 3. Fetch Market Prices
    marketplaceService.getMarketPrices().then((prices) => {
      if (mounted) setMarketPrices(prices);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const refreshListings = () => {
    marketplaceService.getCropListings(selectedCategory, query).then(setProductsList);
  };

  useEffect(() => {
    refreshListings();
  }, [selectedCategory, query]);

  const visibleProducts = useMemo(() => {
    return productsList.filter((product) =>
      `${product.name} ${product.seller} ${product.location}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  }, [productsList, query]);

  const handleStartCall = (name: string, location: string) => {
    setCallRecipient({ name, location });
    setShowCallModal(true);
  };

  const handleStartOrder = (product: Product) => {
    setSelectedProductForOrder(product);
    setShowDeliveryModal(true);
  };

  const handleOpenCreateListing = () => {
    if (!userProfile) {
      setShowAuthModal(true);
    } else if (userProfile.role !== 'farmer') {
      Alert.alert(
        'Farmer Account Required',
        'Posting produce for sale is restricted to registered Farmers. Would you like to switch or register as a Farmer?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Register as Farmer', onPress: () => setShowAuthModal(true) },
        ]
      );
    } else {
      setShowCreateListingModal(true);
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            {/* Header Bar */}
            <View style={styles.topBar}>
              <BrandMark />
              <View style={styles.topActions}>
                <Pressable onPress={() => setShowAuthModal(true)} style={styles.locationPill}>
                  <MaterialCommunityIcons name="map-marker" size={16} color={Palette.emerald} />
                  <View>
                    <Text style={styles.locationLabel}>Location</Text>
                    <Text style={styles.locationValue}>
                      {userProfile?.address_text || 'Accra, Ghana'}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-down" size={17} color={Palette.muted} />
                </Pressable>
                <IconButton
                  icon="account-circle-outline"
                  onPress={() => setShowAuthModal(true)}
                  accessibilityLabel="User Auth"
                />
              </View>
            </View>

            {/* Hero Marketplace Banner */}
            <View style={[styles.hero, isWide && styles.heroWide]}>
              <Image
                source={require('@/assets/images/market/vegetables.jpg')}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
              <View style={styles.heroOverlay} />
              <View style={[styles.heroContent, isWide && styles.heroContentWide]}>
                <View style={styles.badgePill}>
                  <MaterialCommunityIcons name="sprout" size={18} color={Palette.emerald} />
                </View>

                <Text style={styles.heroTitle}>SupaFarm Ghana</Text>
                <Text style={styles.heroCopy}>
                  Direct produce trading between Ghanaian farmers & buyers. Wholesale crop listings, live market prices, and direct voice calls with no middlemen.
                </Text>

                <View style={styles.heroBtnRow}>
                  <Pressable
                    onPress={handleOpenCreateListing}
                    style={({ pressed }) => [styles.sellButton, pressed && styles.pressed]}>
                    <MaterialCommunityIcons name="plus" size={18} color={Palette.white} />
                    <Text style={styles.sellButtonText}>Post Crop for Sale</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => router.push('/market')}
                    style={({ pressed }) => [styles.buyButton, pressed && styles.pressed]}>
                    <Text style={styles.buyButtonText}>Buy Produce</Text>
                    <MaterialCommunityIcons name="arrow-right" size={18} color={Palette.forestDark} />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* User Greeting & Quick Stats */}
            <View style={styles.greetingSection}>
              <View style={styles.greetingHeader}>
                <View style={styles.greetingTextBlock}>
                  <Text style={styles.helloText} numberOfLines={1}>
                    Welcome, {userProfile?.full_name ? userProfile.full_name : 'Valued Trader'}!
                  </Text>
                  <Text style={styles.roleSubText} numberOfLines={1}>
                    {userProfile?.role === 'farmer' ? 'Verified Crop Farmer' : 'Produce Buyer'} • {userProfile?.address_text || 'Ghana'}
                  </Text>
                </View>

                {userProfile ? (
                  <Pressable
                    onPress={handleOpenCreateListing}
                    style={styles.postProduceHeaderBtn}>
                    <MaterialCommunityIcons name="store-plus" size={18} color={Palette.white} />
                    <Text style={styles.postProduceHeaderBtnText}>+ Sell</Text>
                  </Pressable>
                ) : (
                  <Pressable onPress={() => setShowAuthModal(true)} style={styles.loginPillBtn}>
                    <Text style={styles.loginPillText}>Sign In</Text>
                  </Pressable>
                )}
              </View>

              <SearchField
                value={query}
                onChangeText={setQuery}
                placeholder="Search tomatoes, maize, plantain, region, farmer..."
              />
            </View>

            {/* Produce Categories */}
            <View style={styles.section}>
              <SectionHeading
                title="Shop by Crop Category"
                action="Browse all"
                onAction={() => router.push('/market')}
              />
              <View style={styles.categoryGrid}>
                {categories.map((category) => (
                  <Pressable
                    key={category.name}
                    onPress={() => {
                      // Navigate to Market tab with this category pre-selected
                      router.push({
                        pathname: '/market',
                        params: { category: category.name },
                      });
                    }}
                    style={({ pressed }) => [
                      styles.categoryItem,
                      isWide && styles.categoryItemWide,
                      pressed && styles.pressed,
                    ]}>
                    <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                      <MaterialCommunityIcons
                        name={category.icon}
                        size={26}
                        color={Palette.forest}
                      />
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Crop Marketplace Feed */}
            <View style={styles.section}>
              <View style={styles.feedHeaderRow}>
                <View>
                  <Text style={styles.feedTitle}>
                    {query ? `Results for "${query}"` : 'Fresh Produce Listings'}
                  </Text>
                  <Text style={styles.feedSub}>
                    Direct farmer phone numbers • Voice trade enabled
                  </Text>
                </View>
                <Pressable
                  onPress={handleOpenCreateListing}
                  style={styles.inlineAddBtn}>
                  <MaterialCommunityIcons name="plus-circle-outline" size={18} color={Palette.emerald} />
                  <Text style={styles.inlineAddBtnText}>Add Crop</Text>
                </Pressable>
              </View>

              {visibleProducts.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.productRow}>
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onCall={() => handleStartCall(product.seller, product.location)}
                      onOrder={() => handleStartOrder(product)}
                    />
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="magnify-close" size={32} color={Palette.muted} />
                  <Text style={styles.emptyTitle}>No crop listings found</Text>
                  <Text style={styles.emptyCopy}>Be the first farmer to post crops for sale in this category!</Text>
                  <Pressable
                    onPress={handleOpenCreateListing}
                    style={styles.emptyCreateBtn}>
                    <Text style={styles.emptyCreateBtnText}>Post Crop Listing</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Wholesale Market Price Intelligence Strip */}
            <View style={styles.section}>
              <SectionHeading
                title="Ghanaian Market Price Intelligence"
                action="Explore markets"
                onAction={() => router.push('/market')}
              />
              <View style={styles.marketPriceGrid}>
                {marketPrices.map((mp, i) => (
                  <View key={i} style={styles.priceCard}>
                    <View style={styles.priceHeader}>
                      <Text style={styles.priceCrop}>{mp.product}</Text>
                      <View style={[styles.changePill, mp.up ? styles.bgGreen : styles.bgRed]}>
                        <Text style={styles.changeText}>{mp.change}</Text>
                      </View>
                    </View>
                    <Text style={styles.priceVal}>{mp.price}</Text>
                    <Text style={styles.priceMarket}>{mp.market}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Floating Sell Action Button */}
      <Pressable
        onPress={handleOpenCreateListing}
        style={styles.floatingSellBtn}>
        <MaterialCommunityIcons name="store-plus" size={24} color={Palette.white} />
        <Text style={styles.floatingSellText}>Sell Crop</Text>
      </Pressable>

      {/* Modals */}
      <VoiceCallModal
        visible={showCallModal}
        onClose={() => setShowCallModal(false)}
        recipientName={callRecipient.name}
        recipientLocation={callRecipient.location}
      />

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
          setUserProfile(newProf);
          authService.updateProfile(newProf.id, newProf);
        }}
      />

      <DeliveryTrackingModal
        visible={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        productName={selectedProductForOrder?.name}
        farmerName={selectedProductForOrder?.seller}
        farmerLocation={selectedProductForOrder?.location}
        amount={selectedProductForOrder?.price}
      />



      <CreateListingModal
        visible={showCreateListingModal}
        onClose={() => setShowCreateListingModal(false)}
        farmerName={userProfile?.full_name}
        farmerLocation={userProfile?.address_text}
        onSuccess={(newProduct) => {
          setProductsList((prev) => [newProduct, ...prev]);
        }}
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
    paddingBottom: BottomTabInset + 60,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  topBar: {
    minHeight: 74,
    paddingTop: Platform.OS === 'android' ? 10 : 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationPill: {
    paddingHorizontal: 11,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  locationLabel: {
    color: Palette.muted,
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  locationValue: {
    color: Palette.ink,
    fontSize: 11,
    fontWeight: '800',
  },
  hero: {
    minHeight: 250,
    overflow: 'hidden',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: Palette.forestDark,
    marginTop: 8,
  },
  heroWide: {
    minHeight: 280,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(9, 51, 34, 0.76)',
  },
  heroContent: {
    maxWidth: 540,
    padding: 22,
  },
  heroContentWide: {
    padding: 34,
  },
  badgePill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroTitle: {
    color: Palette.white,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
  },
  heroCopy: {
    marginTop: 8,
    color: '#D1E5D8',
    fontSize: 13,
    lineHeight: 19,
  },
  heroBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
  },
  sellButton: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: Palette.emerald,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sellButtonText: {
    color: Palette.white,
    fontSize: 13,
    fontWeight: '900',
  },
  buyButton: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: Palette.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buyButtonText: {
    color: Palette.forestDark,
    fontSize: 13,
    fontWeight: '900',
  },
  greetingSection: {
    marginTop: 22,
    gap: 14,
  },
  greetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  greetingTextBlock: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  helloText: {
    color: Palette.forestDark,
    fontSize: 20,
    fontWeight: '900',
  },
  roleSubText: {
    color: Palette.muted,
    fontSize: 11,
    marginTop: 2,
  },
  postProduceHeaderBtn: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 12,
    backgroundColor: Palette.forest,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postProduceHeaderBtnText: {
    color: Palette.white,
    fontSize: 12,
    fontWeight: '800',
  },
  loginPillBtn: {
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 12,
    backgroundColor: Palette.emeraldLight,
    borderWidth: 1,
    borderColor: Palette.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginPillText: {
    color: Palette.pillTeal,
    fontSize: 12,
    fontWeight: '800',
  },
  section: {
    marginTop: 24,
    gap: 14,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryItem: {
    minWidth: 98,
    flexGrow: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    backgroundColor: Palette.white,
    borderWidth: 1.5,
    borderColor: Palette.line,
  },
  categoryItemActive: {
    borderColor: Palette.emerald,
    backgroundColor: Palette.mint,
  },
  categoryItemWide: {
    flexGrow: 0,
    width: '15%',
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    color: Palette.ink,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  feedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feedTitle: {
    color: Palette.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  feedSub: {
    color: Palette.muted,
    fontSize: 11,
    marginTop: 2,
  },
  inlineAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: Palette.mint,
  },
  inlineAddBtnText: {
    color: Palette.forest,
    fontSize: 12,
    fontWeight: '800',
  },
  productRow: {
    gap: 12,
    paddingRight: 10,
  },
  emptyState: {
    padding: 30,
    borderRadius: 16,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    color: Palette.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyCopy: {
    color: Palette.muted,
    fontSize: 12,
    textAlign: 'center',
  },
  emptyCreateBtn: {
    marginTop: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Palette.emerald,
  },
  emptyCreateBtnText: {
    color: Palette.white,
    fontSize: 13,
    fontWeight: '800',
  },
  marketPriceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  priceCard: {
    flex: 1,
    minWidth: 150,
    padding: 14,
    borderRadius: 14,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceCrop: {
    color: Palette.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  changePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bgGreen: {
    backgroundColor: Palette.emeraldLight,
  },
  bgRed: {
    backgroundColor: '#FEE2E2',
  },
  changeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Palette.ink,
  },
  priceVal: {
    color: Palette.forestDark,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 6,
  },
  priceMarket: {
    color: Palette.muted,
    fontSize: 10,
    marginTop: 3,
  },
  floatingSellBtn: {
    position: 'absolute',
    bottom: BottomTabInset + 16,
    right: 20,
    height: 52,
    paddingHorizontal: 20,
    borderRadius: 26,
    backgroundColor: Palette.forest,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  floatingSellText: {
    color: Palette.white,
    fontSize: 14,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.7,
  },
});
