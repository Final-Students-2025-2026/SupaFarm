import { Image } from 'expo-image';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip, InfoCard, ScreenHeader, SectionHeading } from '@/components/marketplace-ui';
import { CropScannerModal } from '@/components/crop-scanner-modal';
import { VoiceCallModal } from '@/components/voice-call-modal';
import { BottomTabInset, MaxContentWidth, Palette } from '@/constants/theme';
import { marketplaceService, type MarketPriceItem } from '@/services/marketplaceService';

const regions = ['Greater Accra', 'Ashanti', 'Eastern', 'Northern'];

export default function DiscoverScreen() {
  const [region, setRegion] = useState(regions[0]);
  const [marketPrices, setMarketPrices] = useState<MarketPriceItem[]>([]);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    marketplaceService.getMarketPrices(region).then((data) => {
      if (mounted) setMarketPrices(data);
    });
    return () => {
      mounted = false;
    };
  }, [region]);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <ScreenHeader
              title="Discover & Intelligence"
              subtitle="Wholesale prices, crop diagnostics, and farm intelligence"
            />

            {/* AI Crop Scanner CTA Banner */}
            <Pressable onPress={() => setShowScannerModal(true)} style={styles.scannerBanner}>
              <View style={styles.scannerIconWrap}>
                <MaterialCommunityIcons name="line-scan" size={28} color={Palette.emerald} />
              </View>
              <View style={styles.scannerCopy}>
                <Text style={styles.scannerTitle}>AI Crop Condition Diagnosis</Text>
                <Text style={styles.scannerSub}>
                  Scan leaf/fruit image to check health, yield maturity, and disease risk.
                </Text>
              </View>
              <MaterialCommunityIcons name="camera" size={22} color={Palette.white} />
            </Pressable>

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
                  <Text style={styles.cardTitle}>{region} Market Watch</Text>
                </View>
                <View style={styles.livePill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>Live Updates</Text>
                </View>
              </View>
              {marketPrices.map((item, index) => (
                <View
                  key={item.product}
                  style={[styles.priceItem, index === marketPrices.length - 1 && styles.lastItem]}>
                  <View style={styles.cropIcon}>
                    <MaterialCommunityIcons name="sprout" size={19} color={Palette.emerald} />
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
                <Text style={styles.fullReportText}>Open full market intelligence report</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color={Palette.forest} />
              </Pressable>
            </InfoCard>

            <View style={styles.section}>
              <SectionHeading title="Featured Farm" action="Meet growers" />
              <View style={styles.farmCard}>
                <Image
                  source={require('@/assets/images/market/vegetables.jpg')}
                  style={styles.farmImage}
                  contentFit="cover"
                />
                <View style={styles.farmBody}>
                  <View style={styles.verifiedRow}>
                    <Text style={styles.farmName}>Ghana Commercial Crop Farm</Text>
                    <MaterialCommunityIcons
                      name="check-decagram"
                      size={17}
                      color={Palette.emerald}
                    />
                  </View>
                  <Text style={styles.farmLocation}>Ashanti Region</Text>
                  <Text style={styles.farmDescription}>
                    Commercial greenhouse vegetable farm supplying fresh, traceable tomatoes & sweet peppers across Ghana.
                  </Text>
                  <View style={styles.farmStats}>
                    <View>
                      <Text style={styles.statValue}>4.9 ★</Text>
                      <Text style={styles.statLabel}>Seller Rating</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View>
                      <Text style={styles.statValue}>1,240</Text>
                      <Text style={styles.statLabel}>Orders Fulfilled</Text>
                    </View>
                    <Pressable onPress={() => setShowCallModal(true)} style={styles.viewFarmButton}>
                      <MaterialCommunityIcons name="phone" size={16} color={Palette.white} />
                      <Text style={styles.viewFarmText}>Call Farm</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <SectionHeading title="Agricultural Guides" action="See all" />
              <View style={styles.guides}>
                <Pressable style={styles.guideCard}>
                  <View style={[styles.guideIcon, { backgroundColor: Palette.emeraldLight }]}>
                    <MaterialCommunityIcons
                      name="weather-partly-cloudy"
                      size={24}
                      color={Palette.forestDark}
                    />
                  </View>
                  <View style={styles.guideCopy}>
                    <Text style={styles.guideTitle}>Post-Harvest Loss Prevention</Text>
                    <Text style={styles.guideText}>Grade, store, and transport crops to minimize Ghana farm losses.</Text>
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
                    <Text style={styles.guideTitle}>Greenhouse Climate Controls</Text>
                    <Text style={styles.guideText}>Optimizing ventilation, humidity, and drip irrigation cycles.</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={22} color={Palette.muted} />
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <CropScannerModal
        visible={showScannerModal}
        onClose={() => setShowScannerModal(false)}
      />

      <VoiceCallModal
        visible={showCallModal}
        onClose={() => setShowCallModal(false)}
        recipientName="Ghana Commercial Crop Farm"
        recipientLocation="Ashanti Region"
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
  },
  scannerBanner: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Palette.forestDark,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  scannerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerCopy: {
    flex: 1,
  },
  scannerTitle: {
    color: Palette.white,
    fontSize: 15,
    fontWeight: '900',
  },
  scannerSub: {
    color: '#D1D5DB',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  chipRow: {
    marginTop: 20,
    gap: 8,
  },
  priceCard: {
    marginTop: 20,
    padding: 18,
    borderRadius: 16,
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
    color: Palette.emerald,
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
    backgroundColor: Palette.emeraldLight,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.emerald,
  },
  liveText: {
    color: Palette.pillTeal,
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
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.emeraldLight,
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
    color: Palette.emerald,
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
    borderRadius: 10,
    backgroundColor: Palette.paleMint,
  },
  fullReportText: {
    color: Palette.forestDark,
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
    borderRadius: 16,
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
    color: Palette.emerald,
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
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    backgroundColor: Palette.forestDark,
  },
  viewFarmText: {
    color: Palette.white,
    fontSize: 12,
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  guideIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
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
