import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useMemo, useState } from 'react';
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
import { BottomTabInset, MaxContentWidth, Palette } from '@/constants/theme';

const products: Product[] = [
  {
    id: 'tomato',
    name: 'Fresh Tomatoes',
    seller: 'Adom Organic Farms',
    location: 'Akumadan, Ashanti',
    price: 'GH₵ 95',
    unit: 'crate',
    rating: '4.9',
    badge: 'Fresh today',
    image: require('@/assets/images/market/tomatoes.jpg'),
  },
  {
    id: 'plantain',
    name: 'Apem Plantain',
    seller: 'Boafo Farms',
    location: 'Goaso, Ahafo',
    price: 'GH₵ 180',
    unit: 'bunch',
    rating: '4.8',
    image: require('@/assets/images/market/plantain.jpg'),
  },
  {
    id: 'maize',
    name: 'Dry Yellow Maize',
    seller: 'North Star Growers',
    location: 'Tamale, Northern',
    price: 'GH₵ 420',
    unit: 'bag',
    rating: '4.7',
    badge: 'Best value',
    image: require('@/assets/images/market/maize.jpg'),
  },
  {
    id: 'avocado',
    name: 'Local Avocado',
    seller: 'Aburi Green Harvest',
    location: 'Aburi, Eastern',
    price: 'GH₵ 35',
    unit: 'basket',
    rating: '4.9',
    image: require('@/assets/images/market/avocado.jpg'),
  },
];

const filters = ['All', 'Vegetables', 'Fruits', 'Grains', 'Tubers'];

export default function MarketScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [sortLowFirst, setSortLowFirst] = useState(false);
  const { width } = useWindowDimensions();
  const columns = width >= 1000 ? 4 : width >= 700 ? 3 : 2;
  const cardWidth = `${100 / columns - 2}%` as `${number}%`;

  const visibleProducts = useMemo(() => {
    const result = products.filter((product) =>
      `${product.name} ${product.seller} ${product.location}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
    return sortLowFirst ? [...result].sort((a, b) => a.price.localeCompare(b.price)) : result;
  }, [query, sortLowFirst]);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <ScreenHeader
              title="Marketplace"
              subtitle="Verified produce from growers across Ghana"
              right={
                <Pressable style={styles.basketButton}>
                  <MaterialCommunityIcons name="basket-outline" size={22} color={Palette.forest} />
                  <View style={styles.basketCount}>
                    <Text style={styles.basketCountText}>2</Text>
                  </View>
                </Pressable>
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
                <Text style={styles.resultsTitle}>{visibleProducts.length} fresh listings</Text>
                <Text style={styles.resultsCopy}>Prices shown in Ghana cedis</Text>
              </View>
              <Pressable
                onPress={() => setSortLowFirst((current) => !current)}
                style={({ pressed }) => [styles.sortButton, pressed && styles.pressed]}>
                <MaterialCommunityIcons name="sort" size={18} color={Palette.green} />
                <Text style={styles.sortText}>{sortLowFirst ? 'Price: low first' : 'Sort'}</Text>
              </Pressable>
            </View>

            <View style={styles.productGrid}>
              {visibleProducts.map((product) => (
                <View key={product.id} style={[styles.productCell, { width: cardWidth }]}>
                  <ProductCard product={product} style={styles.gridProductCard} />
                </View>
              ))}
            </View>

            <View style={styles.assurance}>
              <MaterialCommunityIcons name="shield-check" size={28} color={Palette.green} />
              <View style={styles.assuranceCopy}>
                <Text style={styles.assuranceTitle}>Trade with confidence</Text>
                <Text style={styles.assuranceText}>
                  Verified sellers, transparent pricing, and protected payments.
                </Text>
              </View>
            </View>
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
  basketButton: {
    width: 46,
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.mint,
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
    borderRadius: 6,
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
    borderRadius: 8,
    backgroundColor: Palette.mint,
  },
  assuranceCopy: {
    flex: 1,
  },
  assuranceTitle: {
    color: Palette.forest,
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
