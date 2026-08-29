import { Image } from 'expo-image';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/theme';

export type RouteStep = {
  instruction: string;
  distance: string;
  duration: string;
};

export function InAppMapDirectionsModal({
  visible,
  onClose,
  originLocation = 'Accra, Ghana',
  destinationLocation = 'Techiman Market, Bono East Region, Ghana',
  originName = 'Farmer Location',
  destinationName = 'Client / Buyer Location',
}: {
  visible: boolean;
  onClose: () => void;
  originLocation?: string;
  destinationLocation?: string;
  originName?: string;
  destinationName?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [distanceText, setDistanceText] = useState('365 km');
  const [durationText, setDurationText] = useState('5 hrs 20 mins');
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([]);
  const [routeVia, setRouteVia] = useState('N6 / N1 Highway');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [staticMapUrl, setStaticMapUrl] = useState<string | null>(null);

  // GPS Coordinates for visual map display
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number }>({ lat: 5.6037, lng: -0.1870 });
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number }>({ lat: 7.5828, lng: -1.9392 });

  useEffect(() => {
    if (!visible) return;

    let mounted = true;
    setLoading(true);

    const fetchGoogleDirections = async () => {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

      try {
        if (apiKey) {
          // Construct Google Maps Static Map Image with origin marker (green), destination marker (red), and polyline path
          const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=800x400&scale=2&maptype=${mapType}&markers=color:0x10b981|label:F|${encodeURIComponent(
            originLocation
          )}&markers=color:0xef4444|label:C|${encodeURIComponent(
            destinationLocation
          )}&path=color:0x10b981|weight:5|${encodeURIComponent(originLocation)}|${encodeURIComponent(
            destinationLocation
          )}&key=${apiKey}`;

          setStaticMapUrl(mapUrl);

          const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
            originLocation
          )}&destination=${encodeURIComponent(destinationLocation)}&key=${apiKey}`;

          const res = await fetch(directionsUrl);
          const data = await res.json();

          if (mounted && data.status === 'OK' && data.routes && data.routes.length > 0) {
            const leg = data.routes[0].legs[0];
            setDistanceText(leg.distance.text);
            setDurationText(leg.duration.text);
            setRouteVia(data.routes[0].summary || 'N6 / N1 Ghana Highway');

            if (leg.start_location) {
              setOriginCoords({ lat: leg.start_location.lat, lng: leg.start_location.lng });
            }
            if (leg.end_location) {
              setDestCoords({ lat: leg.end_location.lat, lng: leg.end_location.lng });
            }

            const steps: RouteStep[] = leg.steps.map((s: any) => ({
              instruction: s.html_instructions.replace(/<[^>]*>?/gm, ''),
              distance: s.distance.text,
              duration: s.duration.text,
            }));
            setRouteSteps(steps);
            setLoading(false);
            return;
          }
        }
      } catch (e) {}

      // Fallback route steps if offline or API key pending
      if (mounted) {
        setStaticMapUrl(null);
        setDistanceText('365 km');
        setDurationText('5 hrs 15 mins');
        setRouteVia('N6 Highway (Accra - Kumasi - Techiman)');
        setRouteSteps([
          {
            instruction: `Start at ${originName} (${originLocation}) heading north on N6 Highway`,
            distance: '65 km',
            duration: '1 hr 10 mins',
          },
          {
            instruction: 'Continue along N6 Highway bypass through Suhum & Nkawkaw',
            distance: '140 km',
            duration: '2 hrs 05 mins',
          },
          {
            instruction: 'Merge onto Kumasi Ring Road toward Offinso / N10',
            distance: '95 km',
            duration: '1 hr 20 mins',
          },
          {
            instruction: `Arrive at ${destinationName} (${destinationLocation})`,
            distance: '65 km',
            duration: '40 mins',
          },
        ]);
        setLoading(false);
      }
    };

    fetchGoogleDirections();

    return () => {
      mounted = false;
    };
  }, [visible, originLocation, destinationLocation, mapType]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <MaterialCommunityIcons name="google-maps" size={24} color={Palette.emerald} />
              <View>
                <Text style={styles.headerTitle}>Live Route & Map Directions</Text>
                <Text style={styles.headerSub}>Farmer ↔ Client Navigation</Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={Palette.ink} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Map Controls Header */}
            <View style={styles.mapTypeBar}>
              <Text style={styles.mapTypeLabel}>Map Layer:</Text>
              <Pressable
                onPress={() => setMapType('roadmap')}
                style={[styles.mapTypeBtn, mapType === 'roadmap' && styles.mapTypeBtnActive]}>
                <Text style={[styles.mapTypeBtnText, mapType === 'roadmap' && styles.mapTypeBtnTextActive]}>Roadmap</Text>
              </Pressable>
              <Pressable
                onPress={() => setMapType('satellite')}
                style={[styles.mapTypeBtn, mapType === 'satellite' && styles.mapTypeBtnActive]}>
                <Text style={[styles.mapTypeBtnText, mapType === 'satellite' && styles.mapTypeBtnTextActive]}>Satellite</Text>
              </Pressable>
              <Pressable
                onPress={() => setMapType('hybrid')}
                style={[styles.mapTypeBtn, mapType === 'hybrid' && styles.mapTypeBtnActive]}>
                <Text style={[styles.mapTypeBtnText, mapType === 'hybrid' && styles.mapTypeBtnTextActive]}>Hybrid</Text>
              </Pressable>
            </View>

            {/* Interactive In-App Route Map Frame */}
            <View style={styles.mapFrame}>
              {staticMapUrl ? (
                <Image source={{ uri: staticMapUrl }} style={styles.staticMapImage} contentFit="cover" />
              ) : (
                <>
                  {/* Interactive Styled Map Grid & Polylines */}
                  <View style={styles.mapGridLineH1} />
                  <View style={styles.mapGridLineH2} />
                  <View style={styles.mapGridLineV1} />
                  <View style={styles.mapGridLineV2} />

                  {/* Highway Route Polyline Graphic */}
                  <View style={styles.routePolyline} />
                  <View style={styles.routePolylineGlow} />

                  {/* Pin 1: Origin (Farmer) */}
                  <View style={styles.originPinWrap}>
                    <View style={styles.originPin}>
                      <MaterialCommunityIcons name="sprout" size={16} color={Palette.white} />
                    </View>
                    <View style={styles.pinBadgeGreen}>
                      <Text style={styles.pinBadgeText}>FARMER</Text>
                    </View>
                    <Text style={styles.pinLabelText} numberOfLines={1}>{originName}</Text>
                  </View>

                  {/* Animated Vehicle Courier */}
                  <View style={styles.courierPinWrap}>
                    <View style={styles.courierPin}>
                      <MaterialCommunityIcons name="motorbike" size={16} color={Palette.forestDark} />
                    </View>
                  </View>

                  {/* Pin 2: Destination (Client / Buyer) */}
                  <View style={styles.destPinWrap}>
                    <View style={styles.destPin}>
                      <MaterialCommunityIcons name="account-location" size={18} color={Palette.white} />
                    </View>
                    <View style={styles.pinBadgeRed}>
                      <Text style={styles.pinBadgeText}>CLIENT</Text>
                    </View>
                    <Text style={styles.pinLabelText} numberOfLines={1}>{destinationName}</Text>
                  </View>
                </>
              )}

              {/* Live Distance Pill */}
              <View style={styles.mapInfoPill}>
                <MaterialCommunityIcons name="navigation-variant" size={14} color={Palette.emerald} />
                <Text style={styles.mapInfoText}>
                  {distanceText} • {durationText} via {routeVia}
                </Text>
              </View>
            </View>

            {/* GPS Coordinates & Address Details Card */}
            <View style={styles.addressCard}>
              <View style={styles.addressRow}>
                <View style={[styles.dot, { backgroundColor: Palette.emerald }]} />
                <View style={styles.addressCopy}>
                  <View style={styles.partyHeader}>
                    <Text style={styles.addrLabel}>FARMER / SELLER LOCATION</Text>
                    <Text style={styles.gpsCoords}>{originCoords.lat.toFixed(4)}° N, {Math.abs(originCoords.lng).toFixed(4)}° W</Text>
                  </View>
                  <Text style={styles.addrTitle}>{originName}</Text>
                  <Text style={styles.addrSub}>{originLocation}</Text>
                </View>
              </View>

              <View style={styles.addrDivider} />

              <View style={styles.addressRow}>
                <View style={[styles.dot, { backgroundColor: Palette.tomato }]} />
                <View style={styles.addressCopy}>
                  <View style={styles.partyHeader}>
                    <Text style={styles.addrLabel}>CLIENT / BUYER LOCATION</Text>
                    <Text style={styles.gpsCoords}>{destCoords.lat.toFixed(4)}° N, {Math.abs(destCoords.lng).toFixed(4)}° W</Text>
                  </View>
                  <Text style={styles.addrTitle}>{destinationName}</Text>
                  <Text style={styles.addrSub}>{destinationLocation}</Text>
                </View>
              </View>
            </View>

            {/* Turn-by-Turn Driving Steps */}
            <View style={styles.stepsSection}>
              <View style={styles.stepsHeader}>
                <MaterialCommunityIcons name="format-list-checks" size={18} color={Palette.forest} />
                <Text style={styles.stepsTitle}>Turn-by-Turn Route Instructions</Text>
              </View>

              {loading ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="small" color={Palette.emerald} />
                  <Text style={styles.loadingText}>Loading route coordinates…</Text>
                </View>
              ) : (
                <View style={styles.stepsList}>
                  {routeSteps.map((step, idx) => (
                    <View key={idx} style={styles.stepItem}>
                      <View style={styles.stepNumWrap}>
                        <Text style={styles.stepNumText}>{idx + 1}</Text>
                      </View>
                      <View style={styles.stepCopy}>
                        <Text style={styles.stepInstruction}>{step.instruction}</Text>
                        <Text style={styles.stepMeta}>
                          {step.distance} • {step.duration}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Close / Done Button */}
            <Pressable onPress={onClose} style={styles.doneBtn}>
              <Text style={styles.doneBtnText}>Close Navigation</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '92%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: Palette.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Palette.line,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: Palette.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  headerSub: {
    color: Palette.muted,
    fontSize: 11,
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    padding: 20,
    gap: 14,
  },

  // Map Layer Controls
  mapTypeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapTypeLabel: {
    color: Palette.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  mapTypeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Palette.canvas,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  mapTypeBtnActive: {
    backgroundColor: Palette.forest,
    borderColor: Palette.forest,
  },
  mapTypeBtnText: {
    color: Palette.ink,
    fontSize: 11,
    fontWeight: '700',
  },
  mapTypeBtnTextActive: {
    color: Palette.white,
  },

  // Map Graphic Frame
  mapFrame: {
    height: 220,
    borderRadius: 16,
    backgroundColor: '#0F2C1D',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  staticMapImage: {
    ...StyleSheet.absoluteFillObject,
  },
  mapGridLineH1: {
    position: 'absolute',
    top: '30%',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  mapGridLineH2: {
    position: 'absolute',
    top: '70%',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  mapGridLineV1: {
    position: 'absolute',
    left: '30%',
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  mapGridLineV2: {
    position: 'absolute',
    left: '70%',
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  routePolyline: {
    position: 'absolute',
    left: '15%',
    width: '70%',
    height: 5,
    borderRadius: 3,
    backgroundColor: Palette.emerald,
    zIndex: 2,
  },
  routePolylineGlow: {
    position: 'absolute',
    left: '12%',
    width: '76%',
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    zIndex: 1,
  },

  originPinWrap: {
    position: 'absolute',
    left: 14,
    alignItems: 'center',
    zIndex: 3,
  },
  originPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.forest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Palette.white,
  },
  pinBadgeGreen: {
    marginTop: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: Palette.emerald,
  },
  pinBadgeRed: {
    marginTop: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: Palette.tomato,
  },
  pinBadgeText: {
    color: Palette.white,
    fontSize: 9,
    fontWeight: '900',
  },
  courierPinWrap: {
    position: 'absolute',
    left: '46%',
    alignItems: 'center',
    zIndex: 3,
  },
  courierPin: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.sun,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Palette.white,
  },
  destPinWrap: {
    position: 'absolute',
    right: 14,
    alignItems: 'center',
    zIndex: 3,
  },
  destPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.tomato,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Palette.white,
  },
  pinLabelText: {
    marginTop: 2,
    color: Palette.white,
    fontSize: 9,
    fontWeight: '800',
    maxWidth: 75,
    textAlign: 'center',
  },
  mapInfoPill: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 4,
  },
  partyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gpsCoords: {
    color: Palette.emerald,
    fontSize: 10,
    fontWeight: '800',
  },

  // Address Card
  addressCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: Palette.paleMint,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  addressCopy: {
    flex: 1,
  },
  addrLabel: {
    color: Palette.muted,
    fontSize: 9,
    fontWeight: '900',
  },
  addrTitle: {
    color: Palette.ink,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  addrSub: {
    color: Palette.muted,
    fontSize: 11,
  },
  addrDivider: {
    height: 1,
    backgroundColor: Palette.line,
    marginVertical: 10,
  },

  // Steps
  stepsSection: {
    gap: 10,
  },
  stepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepsTitle: {
    color: Palette.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  loadingBox: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: Palette.muted,
    fontSize: 12,
  },
  stepsList: {
    borderRadius: 14,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
    overflow: 'hidden',
  },
  stepItem: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Palette.line,
  },
  stepNumWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Palette.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    color: Palette.forest,
    fontSize: 11,
    fontWeight: '800',
  },
  stepCopy: {
    flex: 1,
  },
  stepInstruction: {
    color: Palette.ink,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  stepMeta: {
    color: Palette.muted,
    fontSize: 11,
    marginTop: 2,
  },
  doneBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: Palette.forest,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  doneBtnText: {
    color: Palette.white,
    fontSize: 14,
    fontWeight: '900',
  },
});
