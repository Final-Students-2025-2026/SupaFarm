import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
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
import { VoiceCallModal } from '@/components/voice-call-modal';
import { DeliveryTrackingModal } from '@/components/delivery-tracking-modal';
import { CropScannerModal } from '@/components/crop-scanner-modal';
import { BottomTabInset, MaxContentWidth, Palette } from '@/constants/theme';
import { marketplaceService } from '@/services/marketplaceService';

const filters = ['All', 'Vegetables', 'Fruits', 'Grains', 'Tubers'];

export default function MarketScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [sortLowFirst, setSortLowFirst] = useState(false);
  const [productsList, setProductsList] = useState<Product[]>([]);

  // Modal States
  const [showCallModal, setShowCallModal] = useState(false);
  const [callRecipient, setCallRecipient] = useState({ name: 'Farmer / Seller', location: 'Ghana' });
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<Product | null>(null);
  const [showScannerModal, setShowScannerModal] = useState(false);

  const { width } = useWindowDimensions();
  const columns = width >= 1000 ? 4 : width >= 700 ? 3 : 2;
  const cardWidth = `${100 / columns - 2}%` as `${number}%`;

  useEffect(() => {
    let mounted = true;
    marketplaceService.getCropListings(activeFilter, query).then((data) => {
      if (mounted) setProductsList(data);
    });
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
    setCallRecipient({ name, location });
    setShowCallModal(true);
  };

  const handleStartOrder = (product: Product) => {
    setSelectedProductForOrder(product);
    setShowDeliveryModal(true);
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <ScreenHeader
              title="SupaFarm Market"
              subtitle="Verified fresh produce direct from growers across Ghana"
              right={
                <Pressable onPress={() => setShowDeliveryModal(true)} style={styles.basketButton}>
                  <MaterialCommunityIcons name="truck-delivery-outline" size={22} color={Palette.forest} />
                  <View style={styles.basketCount}>
                    <Text style={styles.basketCountText}>1</Text>
                  </View>
                </Pressable>
              }
            />

            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder="Search products, farms, or regions"
              onFilterPress={() => setShowScannerModal(true)}
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
                <Text style={styles.resultsTitle}>{visibleProducts.length} fresh listings</Text>
                <Text style={styles.resultsCopy}>Direct farmer contacts • Voice call ready</Text>
              </View>
              <Pressable
                onPress={() => setSortLowFirst((current) => !current)}
                style={({ pressed }) => [styles.sortButton, pressed && styles.pressed]}>
                <MaterialCommunityIcons name="sort" size={18} color={Palette.emerald} />
                <Text style={styles.sortText}>{sortLowFirst ? 'Price: low first' : 'Sort'}</Text>
              </Pressable>
            </View>

            <View style={styles.productGrid}>
              {visibleProducts.map((product) => (
                <View key={product.id} style={[styles.productCell, { width: cardWidth }]}>
                  <ProductCard
                    product={product}
                    style={styles.gridProductCard}
                    onCall={() => handleStartCall(product.seller, product.location)}
                    onOrder={() => handleStartOrder(product)}
                  />
                </View>
              ))}
            </View>

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
      <VoiceCallModal
        visible={showCallModal}
        onClose={() => setShowCallModal(false)}
        recipientName={callRecipient.name}
        recipientLocation={callRecipient.location}
      />

      <DeliveryTrackingModal
        visible={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        productName={selectedProductForOrder?.name}
        farmerName={selectedProductForOrder?.seller}
        farmerLocation={selectedProductForOrder?.location}
        amount={selectedProductForOrder?.price}
      />

      <CropScannerModal
        visible={showScannerModal}
        onClose={() => setShowScannerModal(false)}
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
