import { Image } from 'expo-image';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip, InfoCard, ScreenHeader, SectionHeading } from '@/components/marketplace-ui';
import { BottomTabInset, MaxContentWidth, Palette } from '@/constants/theme';

const regions = ['Greater Accra', 'Ashanti', 'Eastern', 'Northern'];

const marketPrices = [
  { product: 'Tomatoes', market: 'Agbogbloshie', price: 'GH₵ 820', change: '+2.4%', up: true },
  { product: 'Maize', market: 'Techiman', price: 'GH₵ 405', change: '-1.8%', up: false },
  { product: 'Plantain', market: 'Kumasi Central', price: 'GH₵ 170', change: '+0.9%', up: true },
];

export default function DiscoverScreen() {
  const [region, setRegion] = useState(regions[0]);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <ScreenHeader
              title="Discover"
              subtitle="Market intelligence, trusted farms, and growing knowledge"
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}>
              {regions.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  active={region === item}
                  onPress={() => setRegion(item)}
                  icon="map-marker-outline"
                />
              ))}
            </ScrollView>

            <InfoCard style={styles.priceCard}>
              <View style={styles.priceHeader}>
                <View>
                  <Text style={styles.kicker}>DAILY WHOLESALE PRICES</Text>
                  <Text style={styles.cardTitle}>{region} market watch</Text>
                </View>
                <View style={styles.livePill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>Live</Text>
                </View>
              </View>
              {marketPrices.map((item, index) => (
                <View
                  key={item.product}
                  style={[styles.priceItem, index === marketPrices.length - 1 && styles.lastItem]}>
                  <View style={styles.cropIcon}>
                    <MaterialCommunityIcons name="sprout" size={19} color={Palette.green} />
                  </View>
                  <View style={styles.priceName}>
                    <Text style={styles.cropName}>{item.product}</Text>
                    <Text style={styles.marketName}>{item.market}</Text>
                  </View>
                  <View style={styles.priceValue}>
                    <Text style={styles.cropPrice}>{item.price}</Text>
                    <Text style={[styles.change, !item.up && styles.changeDown]}>
                      {item.up ? '▲' : '▼'} {item.change}
                    </Text>
                  </View>
                </View>
              ))}
              <Pressable style={styles.fullReportButton}>
                <Text style={styles.fullReportText}>Open full market report</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color={Palette.green} />
              </Pressable>
            </InfoCard>

            <View style={styles.section}>
              <SectionHeading title="Featured farm" action="Meet growers" />
              <View style={styles.farmCard}>
                <Image
                  source={require('@/assets/images/market/vegetables.jpg')}
                  style={styles.farmImage}
                  contentFit="cover"
                />
                <View style={styles.farmBody}>
                  <View style={styles.verifiedRow}>
                    <Text style={styles.farmName}>Adom Organic Farms</Text>
                    <MaterialCommunityIcons
                      name="check-decagram"
                      size={17}
                      color={Palette.green}
                    />
                  </View>
                  <Text style={styles.farmLocation}>Akumadan, Ashanti Region</Text>
                  <Text style={styles.farmDescription}>
                    Family-run vegetable farm supplying fresh, traceable produce since 2016.
                  </Text>
                  <View style={styles.farmStats}>
                    <View>
                      <Text style={styles.statValue}>4.9</Text>
                      <Text style={styles.statLabel}>Seller rating</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View>
                      <Text style={styles.statValue}>1.2k</Text>
                      <Text style={styles.statLabel}>Orders fulfilled</Text>
                    </View>
                    <Pressable style={styles.viewFarmButton}>
                      <Text style={styles.viewFarmText}>View farm</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <SectionHeading title="Grow better" action="See all guides" />
              <View style={styles.guides}>
                <Pressable style={styles.guideCard}>
                  <View style={[styles.guideIcon, { backgroundColor: '#E8F5EB' }]}>
                    <MaterialCommunityIcons
                      name="weather-partly-cloudy"
                      size={24}
                      color={Palette.green}
                    />
                  </View>
                  <View style={styles.guideCopy}>
                    <Text style={styles.guideTitle}>Plan around the rains</Text>
                    <Text style={styles.guideText}>A practical planting guide for the next cycle.</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={22} color={Palette.muted} />
                </Pressable>
                <Pressable style={styles.guideCard}>
                  <View style={[styles.guideIcon, { backgroundColor: '#FFF1D8' }]}>
                    <MaterialCommunityIcons
                      name="store-check-outline"
                      size={24}
                      color={Palette.earth}
                    />
                  </View>
                  <View style={styles.guideCopy}>
                    <Text style={styles.guideTitle}>Prepare produce for market</Text>
                    <Text style={styles.guideText}>Reduce losses with better grading and packing.</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={22} color={Palette.muted} />
                </Pressable>
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
  },
  chipRow: {
    marginTop: 20,
    gap: 8,
  },
  priceCard: {
    marginTop: 20,
    padding: 18,
  },
  priceHeader: {
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Palette.line,
  },
  kicker: {
    color: Palette.green,
    fontSize: 9,
    fontWeight: '900',
  },
  cardTitle: {
    marginTop: 3,
    color: Palette.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  livePill: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 12,
    backgroundColor: Palette.mint,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.green,
  },
  liveText: {
    color: Palette.green,
    fontSize: 10,
    fontWeight: '800',
  },
  priceItem: {
    minHeight: 67,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderBottomWidth: 1,
    borderBottomColor: Palette.line,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  cropIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.mint,
  },
  priceName: {
    flex: 1,
  },
  cropName: {
    color: Palette.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  marketName: {
    marginTop: 2,
    color: Palette.muted,
    fontSize: 10,
  },
  priceValue: {
    alignItems: 'flex-end',
  },
  cropPrice: {
    color: Palette.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  change: {
    marginTop: 2,
    color: Palette.green,
    fontSize: 9,
    fontWeight: '800',
  },
  changeDown: {
    color: Palette.tomato,
  },
  fullReportButton: {
    minHeight: 43,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 6,
    backgroundColor: Palette.paleMint,
  },
  fullReportText: {
    color: Palette.green,
    fontSize: 12,
    fontWeight: '900',
  },
  section: {
    marginTop: 28,
    gap: 14,
  },
  farmCard: {
    overflow: 'hidden',
    backgroundColor: Palette.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  farmImage: {
    width: '100%',
    height: 180,
  },
  farmBody: {
    padding: 17,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  farmName: {
    color: Palette.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  farmLocation: {
    marginTop: 4,
    color: Palette.green,
    fontSize: 11,
    fontWeight: '700',
  },
  farmDescription: {
    marginTop: 10,
    color: Palette.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  farmStats: {
    minHeight: 58,
    marginTop: 14,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: Palette.line,
  },
  statValue: {
    color: Palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  statLabel: {
    marginTop: 2,
    color: Palette.muted,
    fontSize: 9,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Palette.line,
  },
  viewFarmButton: {
    minHeight: 38,
    marginLeft: 'auto',
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: Palette.green,
  },
  viewFarmText: {
    color: Palette.white,
    fontSize: 11,
    fontWeight: '900',
  },
  guides: {
    gap: 10,
  },
  guideCard: {
    minHeight: 82,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Palette.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  guideIcon: {
    width: 46,
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideCopy: {
    flex: 1,
  },
  guideTitle: {
    color: Palette.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  guideText: {
    marginTop: 4,
    color: Palette.muted,
    fontSize: 10,
    lineHeight: 15,
  },
});
