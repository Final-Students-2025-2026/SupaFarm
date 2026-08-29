import { useLocalSearchParams } from 'expo-router';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Chip,
  ProductCard,
  ScreenHeader,
  SearchField,
  type Product,
} from '@/components/marketplace-ui';
import { DeliveryTrackingModal } from '@/components/delivery-tracking-modal';
import { ProductDetailModal } from '@/components/product-detail-modal';
import { AuthModal } from '@/components/auth-modal';
import { CreateListingModal } from '@/components/create-listing-modal';
import { BottomTabInset, MaxContentWidth, Palette } from '@/constants/theme';
import { marketplaceService } from '@/services/marketplaceService';
import { authService, type Profile } from '@/services/authService';

const filters = ['All', 'Vegetables', 'Fruits', 'Grains', 'Tubers'];

export default function MarketScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const [activeFilter, setActiveFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [sortLowFirst, setSortLowFirst] = useState(false);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  // Modal States
  const [showCallModal, setShowCallModal] = useState(false);
  const [callRecipient, setCallRecipient] = useState({ name: 'Farmer / Seller', location: 'Ghana' });
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<Product | null>(null);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateListingModal, setShowCreateListingModal] = useState(false);

  const { width } = useWindowDimensions();
  const columns = width >= 1000 ? 4 : width >= 700 ? 3 : 2;
  const cardWidth = `${100 / columns - 2}%` as `${number}%`;

  useEffect(() => {
    if (params.category && filters.includes(params.category)) {
      setActiveFilter(params.category);
    }
  }, [params.category]);

  const [refreshing, setRefreshing] = useState(false);

  const refreshListings = async () => {
    setRefreshing(true);
    const data = await marketplaceService.getCropListings(activeFilter, query);
    setProductsList(data);
    setRefreshing(false);
  };

  useEffect(() => {
    let mounted = true;
    authService.getCurrentProfile().then((prof) => {
      if (mounted) setUserProfile(prof);
    });
    refreshListings();
    return () => {
      mounted = false;
    };
  }, [activeFilter, query]);

  const visibleProducts = useMemo(() => {
    return sortLowFirst
      ? [...productsList].sort((a, b) => a.price.localeCompare(b.price))
      : productsList;
  }, [productsList, sortLowFirst]);

  const handleStartCall = (name: string, location: string) => {
    const defaultPhone = '+233240000000';
    Linking.openURL(`tel:${defaultPhone}`).catch(() => {
      Alert.alert('Call Farmer', `Calling ${name} at ${location}`);
    });
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
        'Posting crop listings for sale is restricted to registered Farmers. Would you like to switch or register as a Farmer?',
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
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshListings}
              colors={[Palette.emerald]}
              tintColor={Palette.emerald}
            />
          }>
          <View style={styles.container}>
            <ScreenHeader
              title="SupaFarm Market"
              subtitle="Verified fresh produce direct from growers across Ghana"
              right={
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <Pressable
                    onPress={handleOpenCreateListing}
                    style={styles.postButton}>
                    <MaterialCommunityIcons name="plus" size={18} color={Palette.white} />
                    <Text style={styles.postButtonText}>Sell Crop</Text>
                  </Pressable>
                  <Pressable onPress={() => setShowDeliveryModal(true)} style={styles.basketButton}>
                    <MaterialCommunityIcons name="truck-delivery-outline" size={20} color={Palette.forest} />
                    <View style={styles.basketCount}>
                      <Text style={styles.basketCountText}>1</Text>
                    </View>
                  </Pressable>
                </View>
              }
            />

            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder="Search products, farms, or regions"
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}>
              {filters.map((filter) => (
                <Chip
                  key={filter}
                  label={filter}
                  active={activeFilter === filter}
                  onPress={() => setActiveFilter(filter)}
                />
              ))}
            </ScrollView>

            <View style={styles.resultsBar}>
              <View>
                <Text style={styles.resultsTitle}>{visibleProducts.length} listings in database</Text>
                <Text style={styles.resultsCopy}>Direct farmer contacts • Voice call ready</Text>
              </View>
              <Pressable
                onPress={() => setSortLowFirst((current) => !current)}
                style={({ pressed }) => [styles.sortButton, pressed && styles.pressed]}>
                <MaterialCommunityIcons name="sort" size={18} color={Palette.emerald} />
                <Text style={styles.sortText}>{sortLowFirst ? 'Price: low first' : 'Sort'}</Text>
              </Pressable>
            </View>

            {visibleProducts.length > 0 ? (
              <View style={styles.productGrid}>
                {visibleProducts.map((product) => (
                  <View key={product.id} style={[styles.productCell, { width: cardWidth }]}>
                    <ProductCard
                      product={product}
                      style={styles.gridProductCard}
                      onPress={() => setSelectedDetailProduct(product)}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyBox}>
                <MaterialCommunityIcons name="store-off-outline" size={32} color={Palette.muted} />
                <Text style={styles.emptyTitle}>No crop listings found in database</Text>
                <Text style={styles.emptyCopy}>There are currently no produce listings for this filter. Tap '+ Sell Crop' to post a listing!</Text>
                <Pressable
                  onPress={handleOpenCreateListing}
                  style={styles.emptyBtn}>
                  <Text style={styles.emptyBtnText}>Post Crop Listing</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.assurance}>
              <MaterialCommunityIcons name="shield-check" size={28} color={Palette.emerald} />
              <View style={styles.assuranceCopy}>
                <Text style={styles.assuranceTitle}>Direct Voice & 3-Tier Delivery</Text>
                <Text style={styles.assuranceText}>
                  No middlemen. Speak directly to farmers, choose your delivery tier, and pay cash on delivery.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Modals */}
      <ProductDetailModal
        visible={!!selectedDetailProduct}
        product={selectedDetailProduct}
        onClose={() => setSelectedDetailProduct(null)}
        onCall={(prod) => {
          setSelectedDetailProduct(null);
          handleStartCall(prod.seller, prod.location);
        }}
        onOrder={(prod) => {
          setSelectedDetailProduct(null);
          handleStartOrder(prod);
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

      <CreateListingModal
        visible={showCreateListingModal}
        onClose={() => setShowCreateListingModal(false)}
        farmerId={userProfile?.id}
        farmerName={userProfile?.full_name}
        farmerLocation={userProfile?.address_text}
        onSuccess={() => {
          refreshListings();
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
    paddingBottom: BottomTabInset + 28,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingTop: 14,
    gap: 20,
  },
  postButton: {
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    backgroundColor: Palette.emerald,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postButtonText: {
    color: Palette.white,
    fontSize: 12,
    fontWeight: '800',
  },
  basketButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.mint,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  basketCount: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 3,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.tomato,
    borderWidth: 1.5,
    borderColor: Palette.canvas,
  },
  basketCountText: {
    color: Palette.white,
    fontSize: 9,
    fontWeight: '900',
  },
  filterRow: {
    gap: 8,
  },
  resultsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  resultsTitle: {
    color: Palette.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  resultsCopy: {
    marginTop: 3,
    color: Palette.muted,
    fontSize: 11,
  },
  sortButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  sortText: {
    color: Palette.ink,
    fontSize: 11,
    fontWeight: '700',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCell: {
    minWidth: 164,
    flexGrow: 1,
  },
  gridProductCard: {
    width: '100%',
  },
  emptyBox: {
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
  emptyBtn: {
    marginTop: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Palette.emerald,
  },
  emptyBtnText: {
    color: Palette.white,
    fontSize: 13,
    fontWeight: '800',
  },
  assurance: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    backgroundColor: Palette.mint,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  assuranceCopy: {
    flex: 1,
  },
  assuranceTitle: {
    color: Palette.forestDark,
    fontSize: 14,
    fontWeight: '900',
  },
  assuranceText: {
    marginTop: 3,
    color: Palette.muted,
    fontSize: 11,
    lineHeight: 17,
  },
  pressed: {
    opacity: 0.7,
  },
});
