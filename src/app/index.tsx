import { Image } from 'expo-image';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
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
  BrandMark,
  IconButton,
  ProductCard,
  SearchField,
  SectionHeading,
  type Product,
} from '@/components/marketplace-ui';
import { BottomTabInset, MaxContentWidth, Palette } from '@/constants/theme';

const categories = [
  { name: 'Vegetables', icon: 'carrot', color: '#E5F5E8' },
  { name: 'Fruits', icon: 'food-apple-outline', color: '#FFF1D8' },
  { name: 'Grains', icon: 'barley', color: '#F3E9D4' },
  { name: 'Tubers', icon: 'sprout-outline', color: '#F8E5DC' },
  { name: 'Livestock', icon: 'cow', color: '#E8EEF2' },
  { name: 'Inputs', icon: 'watering-can-outline', color: '#E5F2F1' },
];

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

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const { width } = useWindowDimensions();
  const isWide = width >= 820;

  const visibleProducts = useMemo(
    () =>
      products.filter((product) =>
        `${product.name} ${product.seller} ${product.location}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <View style={styles.topBar}>
              <BrandMark />
              <View style={styles.topActions}>
                <View style={styles.locationPill}>
                  <MaterialCommunityIcons name="map-marker" size={16} color={Palette.green} />
                  <View>
                    <Text style={styles.locationLabel}>Delivering to</Text>
                    <Text style={styles.locationValue}>Accra, Ghana</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-down" size={17} color={Palette.muted} />
                </View>
                <IconButton icon="bell-outline" badge accessibilityLabel="Notifications" />
              </View>
            </View>

            <View style={[styles.hero, isWide && styles.heroWide]}>
              <Image
                source={require('@/assets/images/market/vegetables.jpg')}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
              <View style={styles.heroOverlay} />
              <View style={[styles.heroContent, isWide && styles.heroContentWide]}>
                <View style={styles.eyebrow}>
                  <MaterialCommunityIcons name="check-decagram" size={15} color={Palette.sun} />
                  <Text style={styles.eyebrowText}>Direct from verified Ghanaian farmers</Text>
                </View>
                <Text style={styles.heroTitle}>Fresh from the farm, closer to home.</Text>
                <Text style={styles.heroCopy}>
                  Shop quality produce at fair prices and support local growers.
                </Text>
                <Pressable
                  onPress={() => router.push('/market')}
                  style={({ pressed }) => [styles.heroButton, pressed && styles.pressed]}>
                  <Text style={styles.heroButtonText}>Browse the market</Text>
                  <MaterialCommunityIcons name="arrow-right" size={18} color={Palette.forest} />
                </Pressable>
              </View>
            </View>

            <SearchField value={query} onChangeText={setQuery} />

            <View style={styles.section}>
              <SectionHeading
                title="Shop by category"
                action="View all"
                onAction={() => router.push('/explore')}
              />
              <View style={styles.categoryGrid}>
                {categories.map((category) => (
                  <Pressable
                    key={category.name}
                    onPress={() => router.push('/market')}
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

            <View style={styles.section}>
              <SectionHeading
                title={query ? `Results (${visibleProducts.length})` : 'Fresh near you'}
                action="See market"
                onAction={() => router.push('/market')}
              />
              {visibleProducts.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.productRow}>
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="magnify-close" size={28} color={Palette.muted} />
                  <Text style={styles.emptyTitle}>No produce found</Text>
                  <Text style={styles.emptyCopy}>Try another product, seller, or location.</Text>
                </View>
              )}
            </View>

            <View style={[styles.marketStrip, isWide && styles.marketStripWide]}>
              <View style={styles.marketIcon}>
                <MaterialCommunityIcons name="chart-line" size={26} color={Palette.white} />
              </View>
              <View style={styles.marketCopy}>
                <Text style={styles.marketEyebrow}>TODAY'S MARKET PULSE</Text>
                <Text style={styles.marketTitle}>Know the price before you buy</Text>
                <Text style={styles.marketText}>
                  Compare daily wholesale prices across major Ghanaian markets.
                </Text>
              </View>
              <Pressable
                onPress={() => router.push('/market')}
                style={({ pressed }) => [styles.marketLink, pressed && styles.pressed]}>
                <Text style={styles.marketLinkText}>View prices</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color={Palette.white} />
              </Pressable>
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
  },
  topBar: {
    minHeight: 74,
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
    borderRadius: 8,
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
    minHeight: 286,
    overflow: 'hidden',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: Palette.forest,
  },
  heroWide: {
    minHeight: 330,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(9,48,26,0.60)',
  },
  heroContent: {
    maxWidth: 520,
    padding: 24,
  },
  heroContentWide: {
    padding: 42,
  },
  eyebrow: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  eyebrowText: {
    flexShrink: 1,
    color: Palette.white,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroTitle: {
    maxWidth: 480,
    marginTop: 16,
    color: Palette.white,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '900',
  },
  heroCopy: {
    maxWidth: 440,
    marginTop: 10,
    color: '#EAF4EC',
    fontSize: 15,
    lineHeight: 22,
  },
  heroButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    marginTop: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 6,
    backgroundColor: Palette.white,
  },
  heroButtonText: {
    color: Palette.forest,
    fontSize: 13,
    fontWeight: '900',
  },
  section: {
    marginTop: 28,
    gap: 15,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryItem: {
    minWidth: 102,
    flexGrow: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 9,
    backgroundColor: Palette.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  categoryItemWide: {
    flexBasis: 140,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    color: Palette.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  productRow: {
    gap: 12,
    paddingRight: 4,
  },
  emptyState: {
    minHeight: 170,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  emptyTitle: {
    marginTop: 8,
    color: Palette.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  emptyCopy: {
    marginTop: 4,
    color: Palette.muted,
    fontSize: 12,
  },
  marketStrip: {
    marginTop: 28,
    padding: 20,
    gap: 16,
    borderRadius: 8,
    backgroundColor: Palette.forest,
  },
  marketStripWide: {
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
  },
  marketIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.leaf,
  },
  marketCopy: {
    flex: 1,
  },
  marketEyebrow: {
    color: '#BFE2C7',
    fontSize: 9,
    fontWeight: '900',
  },
  marketTitle: {
    marginTop: 4,
    color: Palette.white,
    fontSize: 18,
    fontWeight: '900',
  },
  marketText: {
    marginTop: 5,
    color: '#D6E8DA',
    fontSize: 12,
    lineHeight: 18,
  },
  marketLink: {
    alignSelf: 'flex-start',
    minHeight: 40,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#76A986',
  },
  marketLinkText: {
    color: Palette.white,
    fontSize: 12,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.7,
  },
});
