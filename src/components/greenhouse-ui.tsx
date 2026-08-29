import { Image, type ImageSource } from 'expo-image';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { Palette } from '@/constants/theme';

export type PlantItem = {
  id: string;
  name: string;
  stage: 'Reproductive' | 'Maturation' | 'Vegetative' | 'Seedling';
  count: string;
  price: string;
  image: ImageSource;
};

export const samplePlants: PlantItem[] = [
  {
    id: 'p1',
    name: 'Tomato Plant',
    stage: 'Reproductive',
    count: '120 plant',
    price: 'GH₵ 95 / crate',
    image: require('@/assets/images/market/tomatoes.jpg'),
  },
  {
    id: 'p2',
    name: 'Corn Plant',
    stage: 'Reproductive',
    count: '120 plant',
    price: 'GH₵ 420 / bag',
    image: require('@/assets/images/market/maize.jpg'),
  },
  {
    id: 'p3',
    name: 'Peanut Plant',
    stage: 'Maturation',
    count: '120 plant',
    price: 'GH₵ 150 / bag',
    image: require('@/assets/images/market/plantain.jpg'),
  },
];

export function HumidityChart() {
  const [selectedPoint, setSelectedPoint] = useState(3); // 03 Jul peak 45%
  const points = [
    { day: '29, Jun', val: 25 },
    { day: '30, Jun', val: 32 },
    { day: '01, Jul', val: 28 },
    { day: '02, Jul', val: 45, peak: true },
    { day: '03, Jul', val: 38 },
    { day: '04, Jul', val: 41 },
    { day: '05, Jul', val: 30 },
  ];

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Humidity Level</Text>
        <View style={styles.timeDropdown}>
          <Text style={styles.timeDropdownText}>Last Week</Text>
          <MaterialCommunityIcons name="chevron-down" size={16} color={Palette.white} />
        </View>
      </View>

      <View style={styles.chartBody}>
        {/* Peak indicator popup */}
        <View style={[styles.peakBadge, { left: `${(selectedPoint / (points.length - 1)) * 75 + 10}%` }]}>
          <Text style={styles.peakBadgeText}>{points[selectedPoint].val}%</Text>
          <View style={styles.peakBadgeArrow} />
        </View>

        {/* Visual Wave Line */}
        <View style={styles.waveContainer}>
          <View style={styles.waveBackgroundFill} />
          <View style={styles.waveLineTrack}>
            {points.map((p, idx) => (
              <Pressable
                key={p.day}
                onPress={() => setSelectedPoint(idx)}
                style={styles.wavePointTouch}>
                <View
                  style={[
                    styles.waveDot,
                    selectedPoint === idx && styles.waveDotActive,
                  ]}
                />
              </Pressable>
            ))}
          </View>
        </View>

        {/* X Axis Dates */}
        <View style={styles.xAxis}>
          {points.map((p, idx) => (
            <Text
              key={p.day}
              style={[
                styles.xLabel,
                selectedPoint === idx && styles.xLabelActive,
              ]}>
              {p.day}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

export function TelemetryMetrics() {
  return (
    <View style={styles.metricsGrid}>
      <View style={styles.metricCard}>
        <View style={styles.metricIconWrap}>
          <MaterialCommunityIcons name="weather-windy" size={18} color={Palette.emerald} />
        </View>
        <View style={styles.metricContent}>
          <Text style={styles.metricLabel}>Height</Text>
          <Text style={styles.metricValue}>120 cm</Text>
        </View>
      </View>

      <View style={styles.metricCard}>
        <View style={styles.metricIconWrap}>
          <MaterialCommunityIcons name="water-outline" size={18} color={Palette.emerald} />
        </View>
        <View style={styles.metricContent}>
          <Text style={styles.metricLabel}>Watering</Text>
          <Text style={styles.metricValue}>45 %</Text>
        </View>
      </View>

      <View style={styles.metricCard}>
        <View style={styles.metricIconWrap}>
          <MaterialCommunityIcons name="sprout-outline" size={18} color={Palette.emerald} />
        </View>
        <View style={styles.metricContent}>
          <Text style={styles.metricLabel}>Fertilizer</Text>
          <Text style={styles.metricValue}>Organic</Text>
        </View>
      </View>

      <View style={styles.metricCard}>
        <View style={styles.metricIconWrap}>
          <MaterialCommunityIcons name="calendar-clock-outline" size={18} color={Palette.emerald} />
        </View>
        <View style={styles.metricContent}>
          <Text style={styles.metricLabel}>Age</Text>
          <Text style={styles.metricValue}>3 Month</Text>
        </View>
      </View>
    </View>
  );
}

export function GreenhouseDetailCard({
  name = 'The Greenhouse I',
  location = 'Akumadan, Ashanti',
  plantCount = 12,
  onOpenMap,
}: {
  name?: string;
  location?: string;
  plantCount?: number;
  onOpenMap?: () => void;
}) {
  return (
    <View style={styles.greenhouseCard}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.countTag}>
          <Text style={styles.countTagText}>{plantCount} Plants</Text>
        </View>

        <Pressable onPress={onOpenMap} style={styles.miniMapPill}>
          <MaterialCommunityIcons name="map-marker" size={14} color={Palette.emerald} />
          <Text style={styles.miniMapText}>Map view</Text>
        </Pressable>
      </View>

      <Text style={styles.greenhouseTitle}>{name}</Text>
      <View style={styles.locationSubRow}>
        <MaterialCommunityIcons name="map-marker-outline" size={15} color={Palette.muted} />
        <Text style={styles.greenhouseLocation}>{location}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="weather-windy" size={18} color={Palette.emerald} />
          <View>
            <Text style={styles.statItemLabel}>Wind</Text>
            <Text style={styles.statItemVal}>5 m/s</Text>
          </View>
        </View>
        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <MaterialCommunityIcons name="water-outline" size={18} color={Palette.emerald} />
          <View>
            <Text style={styles.statItemLabel}>Humidity</Text>
            <Text style={styles.statItemVal}>20 %</Text>
          </View>
        </View>
        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <MaterialCommunityIcons name="flower-outline" size={18} color={Palette.emerald} />
          <View>
            <Text style={styles.statItemLabel}>Plant</Text>
            <Text style={styles.statItemVal}>4 Type</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export function ControlsGrid() {
  const [lighting, setLighting] = useState(true);
  const [temperature, setTemperature] = useState(false);
  const [watering, setWatering] = useState(false);
  const [ventilation, setVentilation] = useState(false);

  return (
    <View style={styles.controlsGrid}>
      {/* Lighting card - Active dark theme when ON */}
      <View style={[styles.controlCard, lighting && styles.controlCardActive]}>
        <View style={styles.controlTop}>
          <View
            style={[
              styles.controlIconWrap,
              lighting && styles.controlIconWrapActive,
            ]}>
            <MaterialCommunityIcons
              name="lightbulb-outline"
              size={22}
              color={lighting ? Palette.sun : Palette.muted}
            />
          </View>
          <Switch
            value={lighting}
            onValueChange={setLighting}
            trackColor={{ false: '#D1D5DB', true: Palette.emerald }}
            thumbColor={Palette.white}
          />
        </View>
        <Text style={[styles.controlTitle, lighting && styles.textWhite]}>Lighting</Text>
        <Text style={[styles.controlSub, lighting && styles.textMutedDark]}>12 Watt</Text>
      </View>

      {/* Temperature card */}
      <View style={[styles.controlCard, temperature && styles.controlCardActive]}>
        <View style={styles.controlTop}>
          <View
            style={[
              styles.controlIconWrap,
              temperature && styles.controlIconWrapActive,
            ]}>
            <MaterialCommunityIcons
              name="thermometer"
              size={22}
              color={temperature ? Palette.emerald : Palette.muted}
            />
          </View>
          <Switch
            value={temperature}
            onValueChange={setTemperature}
            trackColor={{ false: '#D1D5DB', true: Palette.emerald }}
            thumbColor={Palette.white}
          />
        </View>
        <Text style={[styles.controlTitle, temperature && styles.textWhite]}>Temperature</Text>
        <Text style={[styles.controlSub, temperature && styles.textMutedDark]}>24 °Celsius</Text>
      </View>

      {/* Watering card */}
      <View style={[styles.controlCard, watering && styles.controlCardActive]}>
        <View style={styles.controlTop}>
          <View
            style={[
              styles.controlIconWrap,
              watering && styles.controlIconWrapActive,
            ]}>
            <MaterialCommunityIcons
              name="water-pump"
              size={22}
              color={watering ? Palette.emerald : Palette.muted}
            />
          </View>
          <Switch
            value={watering}
            onValueChange={setWatering}
            trackColor={{ false: '#D1D5DB', true: Palette.emerald }}
            thumbColor={Palette.white}
          />
        </View>
        <Text style={[styles.controlTitle, watering && styles.textWhite]}>Watering</Text>
        <Text style={[styles.controlSub, watering && styles.textMutedDark]}>200 ml</Text>
      </View>

      {/* Ventilation card */}
      <View style={[styles.controlCard, ventilation && styles.controlCardActive]}>
        <View style={styles.controlTop}>
          <View
            style={[
              styles.controlIconWrap,
              ventilation && styles.controlIconWrapActive,
            ]}>
            <MaterialCommunityIcons
              name="fan"
              size={22}
              color={ventilation ? Palette.emerald : Palette.muted}
            />
          </View>
          <Switch
            value={ventilation}
            onValueChange={setVentilation}
            trackColor={{ false: '#D1D5DB', true: Palette.emerald }}
            thumbColor={Palette.white}
          />
        </View>
        <Text style={[styles.controlTitle, ventilation && styles.textWhite]}>Ventilation</Text>
        <Text style={[styles.controlSub, ventilation && styles.textMutedDark]}>10 m/s</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  greenhouseCard: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: Palette.emeraldLight,
  },
  countTagText: {
    color: Palette.pillTeal,
    fontSize: 12,
    fontWeight: '800',
  },
  miniMapPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Palette.paleMint,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  miniMapText: {
    color: Palette.forest,
    fontSize: 11,
    fontWeight: '700',
  },
  greenhouseTitle: {
    marginTop: 14,
    color: Palette.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  locationSubRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greenhouseLocation: {
    color: Palette.muted,
    fontSize: 12,
  },
  statsRow: {
    marginTop: 18,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Palette.line,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statItemLabel: {
    color: Palette.muted,
    fontSize: 10,
  },
  statItemVal: {
    color: Palette.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Palette.line,
  },
  controlsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  controlCard: {
    width: '48%',
    flexGrow: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  controlCardActive: {
    backgroundColor: Palette.forestCard,
    borderColor: Palette.forestDark,
  },
  controlTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.paleMint,
  },
  controlIconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  controlTitle: {
    marginTop: 16,
    color: Palette.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  controlSub: {
    marginTop: 3,
    color: Palette.muted,
    fontSize: 11,
  },
  textWhite: {
    color: Palette.white,
  },
  textMutedDark: {
    color: '#9CA3AF',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  metricCard: {
    width: '48%',
    flexGrow: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.emeraldLight,
  },
  metricContent: {
    flex: 1,
  },
  metricLabel: {
    color: Palette.muted,
    fontSize: 10,
  },
  metricValue: {
    marginTop: 1,
    color: Palette.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  chartContainer: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartTitle: {
    color: Palette.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  timeDropdown: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    backgroundColor: Palette.forestCard,
  },
  timeDropdownText: {
    color: Palette.white,
    fontSize: 11,
    fontWeight: '700',
  },
  chartBody: {
    marginTop: 24,
    height: 140,
    justifyContent: 'flex-end',
  },
  peakBadge: {
    position: 'absolute',
    top: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Palette.emerald,
    alignItems: 'center',
    zIndex: 10,
  },
  peakBadgeText: {
    color: Palette.white,
    fontSize: 11,
    fontWeight: '900',
  },
  peakBadgeArrow: {
    position: 'absolute',
    bottom: -4,
    width: 8,
    height: 8,
    transform: [{ rotate: '45deg' }],
    backgroundColor: Palette.emerald,
  },
  waveContainer: {
    height: 70,
    justifyContent: 'center',
  },
  waveBackgroundFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
    backgroundColor: Palette.emeraldLight,
    opacity: 0.5,
    borderRadius: 10,
  },
  waveLineTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  wavePointTouch: {
    padding: 8,
  },
  waveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.emerald,
  },
  waveDotActive: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Palette.emerald,
    borderWidth: 3,
    borderColor: Palette.white,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingHorizontal: 4,
  },
  xLabel: {
    color: Palette.muted,
    fontSize: 10,
    fontWeight: '600',
  },
  xLabelActive: {
    color: Palette.forest,
    fontWeight: '800',
  },
});
