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
import {
  ControlsGrid,
  GreenhouseDetailCard,
  HumidityChart,
  TelemetryMetrics,
  samplePlants,
} from '@/components/greenhouse-ui';
import { VoiceCallModal } from '@/components/voice-call-modal';
import { AuthModal } from '@/components/auth-modal';
import { DeliveryTrackingModal } from '@/components/delivery-tracking-modal';
import { CropScannerModal } from '@/components/crop-scanner-modal';
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

const greenhousesList = [
  {
    id: 'gh1',
    name: 'The Greenhouse I',
    location: 'Akumadan, Ashanti',
    plants: 12,
    image: require('@/assets/images/market/vegetables.jpg'),
  },
  {
    id: 'gh2',
    name: 'Greenhouse Putuk',
    location: 'Goaso, Ahafo',
    plants: 32,
    image: require('@/assets/images/market/plantain.jpg'),
  },
];

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'smart' | 'plants'>('smart');
  const [selectedGreenhouse, setSelectedGreenhouse] = useState(greenhousesList[0]);

  // Modal States
  const [showCallModal, setShowCallModal] = useState(false);
  const [callRecipient, setCallRecipient] = useState({ name: 'Adom Organic Farms', location: 'Akumadan, Ashanti' });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState(products[0]);
  const [showScannerModal, setShowScannerModal] = useState(false);

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
            {/* Header Bar */}
            <View style={styles.topBar}>
              <BrandMark />
              <View style={styles.topActions}>
                <Pressable onPress={() => setShowAuthModal(true)} style={styles.locationPill}>
                  <MaterialCommunityIcons name="map-marker" size={16} color={Palette.emerald} />
                  <View>
                    <Text style={styles.locationLabel}>Delivering to</Text>
                    <Text style={styles.locationValue}>Accra, Ghana</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-down" size={17} color={Palette.muted} />
                </Pressable>
                <IconButton
                  icon="line-scan"
                  onPress={() => setShowScannerModal(true)}
                  accessibilityLabel="Scan Crop AI"
                />
                <IconButton
                  icon="bell-outline"
                  badge
                  onPress={() => setShowAuthModal(true)}
                  accessibilityLabel="Notifications"
                />
              </View>
            </View>

            {/* Screen 1 Onboarding / Hero Banner */}
            <View style={[styles.hero, isWide && styles.heroWide]}>
              <Image
                source={require('@/assets/images/market/vegetables.jpg')}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
              <View style={styles.heroOverlay} />
              <View style={[styles.heroContent, isWide && styles.heroContentWide]}>
                <View style={styles.badgePill}>
                  <MaterialCommunityIcons name="leaf" size={16} color={Palette.emerald} />
                </View>

                <Text style={styles.heroTitle}>Manage Your Greenhouse</Text>
                <Text style={styles.heroCopy}>
                  SupaFarm is designed to empower Ghanaian farmers & buyers with greenhouse IoT telemetry, fresh crop listings, and direct voice trading.
                </Text>

                <Pressable
                  onPress={() => setShowAuthModal(true)}
                  style={({ pressed }) => [styles.getStartedButton, pressed && styles.pressed]}>
                  <Text style={styles.getStartedText}>Get Started</Text>
                  <MaterialCommunityIcons name="arrow-right" size={18} color={Palette.white} />
                </Pressable>
              </View>
            </View>

            {/* Screen 2 "Hello, Farmers" Greetings & Greenhouse Selector */}
            <View style={styles.farmerGreetingSection}>
              <View style={styles.greetingHeader}>
                <View>
                  <Text style={styles.helloText}>Hello, Farmers</Text>
                  <Text style={styles.dateSubText}>Sunday, 01 July 2030</Text>
                </View>
                <Pressable onPress={() => setShowAuthModal(true)} style={styles.avatarIconBtn}>
                  <MaterialCommunityIcons name="account-circle-outline" size={24} color={Palette.forestDark} />
                </Pressable>
              </View>

              <SearchField
                value={query}
                onChangeText={setQuery}
                placeholder="Search produce, greenhouses, location..."
                onFilterPress={() => setShowScannerModal(true)}
              />

              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeadingTitle}>Your Greenhouses</Text>
                <View style={styles.placesTag}>
                  <Text style={styles.placesTagText}>12 Places</Text>
                </View>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.greenhouseRow}>
                {greenhousesList.map((gh) => (
                  <Pressable
                    key={gh.id}
                    onPress={() => setSelectedGreenhouse(gh)}
                    style={[
                      styles.greenhouseListItem,
                      selectedGreenhouse.id === gh.id && styles.greenhouseListItemSelected,
                    ]}>
                    <Image source={gh.image} style={styles.greenhouseListImg} contentFit="cover" />
                    <View style={styles.greenhouseListOverlay} />
                    <View style={styles.greenhouseListContent}>
                      <View style={styles.plantsBadge}>
                        <Text style={styles.plantsBadgeText}>{gh.plants} Plants</Text>
                      </View>
                      <Text style={styles.greenhouseListName}>{gh.name}</Text>
                      <Text style={styles.greenhouseListLoc}>{gh.location}</Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Screen 3 & 4 Greenhouse Telemetry & Plant Management */}
            <View style={styles.telemetrySection}>
              <GreenhouseDetailCard
                name={selectedGreenhouse.name}
                location={selectedGreenhouse.location}
                plantCount={selectedGreenhouse.plants}
                onOpenMap={() => setShowDeliveryModal(true)}
              />

              {/* Sub-Navigation Tabs: Smart Greenhouse | Plants */}
              <View style={styles.tabSwitcherRow}>
                <Pressable
                  onPress={() => setActiveTab('smart')}
                  style={[styles.tabChoice, activeTab === 'smart' && styles.tabChoiceActive]}>
                  <Text style={[styles.tabChoiceText, activeTab === 'smart' && styles.tabChoiceTextActive]}>
                    Smart Greenhouse
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setActiveTab('plants')}
                  style={[styles.tabChoice, activeTab === 'plants' && styles.tabChoiceActive]}>
                  <Text style={[styles.tabChoiceText, activeTab === 'plants' && styles.tabChoiceTextActive]}>
                    Plants
                  </Text>
                </Pressable>
              </View>

              {activeTab === 'smart' ? (
                <>
                  {/* Telemetry Control Cards (Lighting 12W, Temp 24°C, Watering 200ml, Ventilation 10m/s) */}
                  <ControlsGrid />

                  {/* Growth Metrics (Height 120cm, Watering 45%, Fertilizer Organic, Age 3 Month) */}
                  <TelemetryMetrics />

                  {/* Condition Information Card */}
                  <View style={styles.infoSummaryBox}>
                    <Text style={styles.infoSummaryTitle}>Information</Text>
                    <Text style={styles.infoSummaryCopy}>
                      The condition of the plants has started to improve compared to yesterday, now they are starting to bear fruit.
                    </Text>
                  </View>

                  {/* Humidity Trend Chart */}
                  <HumidityChart />
                </>
              ) : (
                /* Screen 4 Plants Stage & List */
                <View style={styles.plantsTabList}>
                  {samplePlants.map((plant) => (
                    <View
                      key={plant.id}
                      style={[
                        styles.plantCard,
                        plant.id === 'p3' && styles.plantCardActiveDark,
                      ]}>
                      <Image source={plant.image} style={styles.plantThumb} contentFit="cover" />
                      <View style={styles.plantInfo}>
                        <View
                          style={[
                            styles.stagePill,
                            plant.stage === 'Reproductive'
                              ? styles.stageOrange
                              : styles.stageTeal,
                          ]}>
                          <Text style={styles.stagePillText}>{plant.stage}</Text>
                        </View>
                        <Text
                          style={[
                            styles.plantTitle,
                            plant.id === 'p3' && styles.textWhite,
                          ]}>
                          {plant.name}
                        </Text>
                        <Text
                          style={[
                            styles.plantSub,
                            plant.id === 'p3' && styles.textMutedLight,
                          ]}>
                          {plant.count} • {plant.price}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleStartCall('Adom Organic Farms', 'Akumadan, Ashanti')}
                        style={styles.plantCallBtn}>
                        <MaterialCommunityIcons name="phone" size={18} color={Palette.white} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Marketplace Produce Section */}
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
                  <MaterialCommunityIcons name="magnify-close" size={28} color={Palette.muted} />
                  <Text style={styles.emptyTitle}>No produce found</Text>
                  <Text style={styles.emptyCopy}>Try another product, seller, or location.</Text>
                </View>
              )}
            </View>

            {/* Market Pulse Banner */}
            <View style={[styles.marketStrip, isWide && styles.marketStripWide]}>
              <View style={styles.marketIcon}>
                <MaterialCommunityIcons name="chart-line" size={26} color={Palette.white} />
              </View>
              <View style={styles.marketCopy}>
                <Text style={styles.marketEyebrow}>TODAY'S MARKET PULSE</Text>
                <Text style={styles.marketTitle}>Know wholesale prices before you trade</Text>
                <Text style={styles.marketText}>
                  Compare daily Ghanaian market prices across Kumasi, Accra, Techiman, and Tamale.
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
          console.log('Logged in user:', u);
        }}
      />

      <DeliveryTrackingModal
        visible={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        productName={selectedProductForOrder.name}
        farmerName={selectedProductForOrder.seller}
        farmerLocation={selectedProductForOrder.location}
        amount={selectedProductForOrder.price}
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
    minHeight: 280,
    overflow: 'hidden',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: Palette.forestDark,
    marginTop: 8,
  },
  heroWide: {
    minHeight: 320,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(9, 51, 34, 0.72)',
  },
  heroContent: {
    maxWidth: 520,
    padding: 24,
  },
  heroContentWide: {
    padding: 38,
  },
  badgePill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    color: Palette.white,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
  },
  heroCopy: {
    marginTop: 10,
    color: '#D1E5D8',
    fontSize: 14,
    lineHeight: 20,
  },
  getStartedButton: {
    alignSelf: 'flex-start',
    minHeight: 46,
    marginTop: 20,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 24,
    backgroundColor: Palette.emerald,
  },
  getStartedText: {
    color: Palette.white,
    fontSize: 14,
    fontWeight: '900',
  },
  farmerGreetingSection: {
    marginTop: 24,
    gap: 16,
  },
  greetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helloText: {
    color: Palette.forestDark,
    fontSize: 24,
    fontWeight: '900',
  },
  dateSubText: {
    color: Palette.muted,
    fontSize: 12,
    marginTop: 2,
  },
  avatarIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeadingTitle: {
    color: Palette.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  placesTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Palette.emeraldLight,
  },
  placesTagText: {
    color: Palette.pillTeal,
    fontSize: 11,
    fontWeight: '800',
  },
  greenhouseRow: {
    gap: 12,
    paddingRight: 10,
  },
  greenhouseListItem: {
    width: 220,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  greenhouseListItemSelected: {
    borderColor: Palette.emerald,
  },
  greenhouseListImg: {
    width: '100%',
    height: '100%',
  },
  greenhouseListOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  greenhouseListContent: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  plantsBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginBottom: 6,
  },
  plantsBadgeText: {
    color: Palette.white,
    fontSize: 9,
    fontWeight: '800',
  },
  greenhouseListName: {
    color: Palette.white,
    fontSize: 15,
    fontWeight: '900',
  },
  greenhouseListLoc: {
    color: '#D1D5DB',
    fontSize: 11,
    marginTop: 2,
  },
  telemetrySection: {
    marginTop: 24,
    gap: 16,
  },
  tabSwitcherRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Palette.line,
    marginTop: 8,
  },
  tabChoice: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabChoiceActive: {
    borderBottomColor: Palette.forestDark,
  },
  tabChoiceText: {
    color: Palette.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  tabChoiceTextActive: {
    color: Palette.forestDark,
    fontWeight: '900',
  },
  infoSummaryBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  infoSummaryTitle: {
    color: Palette.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  infoSummaryCopy: {
    marginTop: 6,
    color: Palette.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  plantsTabList: {
    gap: 12,
    marginTop: 14,
  },
  plantCard: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  plantCardActiveDark: {
    backgroundColor: Palette.forestCard,
    borderColor: Palette.forestDark,
  },
  plantThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  plantInfo: {
    flex: 1,
  },
  stagePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 4,
  },
  stageOrange: {
    backgroundColor: '#FFEDD5',
  },
  stageTeal: {
    backgroundColor: Palette.emeraldLight,
  },
  stagePillText: {
    color: Palette.forestDark,
    fontSize: 10,
    fontWeight: '800',
  },
  plantTitle: {
    color: Palette.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  plantSub: {
    color: Palette.muted,
    fontSize: 11,
    marginTop: 2,
  },
  textWhite: {
    color: Palette.white,
  },
  textMutedLight: {
    color: '#9CA3AF',
  },
  plantCallBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.emerald,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderRadius: 14,
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
    borderRadius: 16,
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
    borderRadius: 18,
    backgroundColor: Palette.forestDark,
  },
  marketStripWide: {
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
  },
  marketIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.emerald,
  },
  marketCopy: {
    flex: 1,
  },
  marketEyebrow: {
    color: Palette.emerald,
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
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Palette.emerald,
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
