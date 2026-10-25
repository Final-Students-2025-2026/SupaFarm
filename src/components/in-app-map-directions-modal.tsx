import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { Palette } from '@/constants/theme';

function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs > 0) {
    return `${hrs} hr ${mins} mins`;
  }
  return `${mins} mins`;
}

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
  const mapRef = useRef<MapView>(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [distanceText, setDistanceText] = useState('365 km');
  const [durationText, setDurationText] = useState('5 hrs 20 mins');
  const [routeVia, setRouteVia] = useState('N6 / N1 Ghana Highway');

  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number }>({ lat: 5.6037, lng: -0.187 });
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number }>({ lat: 7.5828, lng: -1.9392 });
  const [polylinePoints, setPolylinePoints] = useState<{ latitude: number; longitude: number }[]>([]);

  useEffect(() => {
    if (!visible) return;

    let mounted = true;
    setLoading(true);

    const fetchDirections3Tier = async () => {
      try {
        const getCoords = async (locName: string) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                locName
              )}&format=json&limit=1&countrycodes=gh`,
              { headers: { 'User-Agent': 'SupaFarmApp/1.0' } }
            );
            const data = await res.json();
            if (data && data.length > 0) {
              return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            }
          } catch (e) { }
          return null;
        };

        const origC = (await getCoords(originLocation)) || { lat: 5.6037, lng: -0.187 };
        const destC = (await getCoords(destinationLocation)) || { lat: 7.5828, lng: -1.9392 };

        if (mounted) {
          setOriginCoords(origC);
          setDestCoords(destC);
        }

        let routePoints: { latitude: number; longitude: number }[] = [];
        let distance = '';
        let duration = '';
        let viaRouteName = 'Ghana National Highway';

        // Tier 1: OSRM (free, real road geometry)
        try {
          const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origC.lng},${origC.lat};${destC.lng},${destC.lat}?overview=full&geometries=geojson`;
          const osrmRes = await fetch(osrmUrl);
          const osrmData = await osrmRes.json();

          if (osrmData.routes && osrmData.routes.length > 0) {
            const osrmRoute = osrmData.routes[0];
            if (osrmRoute.geometry?.coordinates && Array.isArray(osrmRoute.geometry.coordinates)) {
              routePoints = osrmRoute.geometry.coordinates.map((pt: [number, number]) => ({
                latitude: pt[1],
                longitude: pt[0],
              }));
            }
            const distKm = osrmRoute.distance / 1000;
            const durMins = osrmRoute.duration / 60;
            distance = `${distKm.toFixed(1)} km`;
            duration = formatDuration(durMins);
            viaRouteName = osrmRoute.legs[0]?.summary || 'Ghana National Highway';
          }
        } catch (err) { }

        // Tier 2: Straight-line Haversine fallback
        if (routePoints.length === 0) {
          routePoints = [
            { latitude: origC.lat, longitude: origC.lng },
            { latitude: destC.lat, longitude: destC.lng },
          ];
          const straightKm = getHaversineDistance(origC.lat, origC.lng, destC.lat, destC.lng);
          const estDrivingKm = straightKm * 1.25;
          const estMins = (estDrivingKm / 35) * 60;
          distance = `~${estDrivingKm.toFixed(1)} km`;
          duration = `~${formatDuration(estMins)}`;
          viaRouteName = 'Direct Highway Route';
        }

        if (mounted) {
          setPolylinePoints(routePoints);
          setDistanceText(distance);
          setDurationText(duration);
          setRouteVia(viaRouteName);
          setLoading(false);

          // Fit the real native map to the route once we have it
          requestAnimationFrame(() => {
            const coordsToFit =
              routePoints.length > 1
                ? routePoints
                : [
                  { latitude: origC.lat, longitude: origC.lng },
                  { latitude: destC.lat, longitude: destC.lng },
                ];
            mapRef.current?.fitToCoordinates(coordsToFit, {
              edgePadding: { top: 90, right: 60, bottom: 220, left: 60 },
              animated: true,
            });
          });
        }
      } catch (err) {
        if (mounted) setLoading(false);
      }
    };

    fetchDirections3Tier();

    return () => {
      mounted = false;
    };
  }, [visible, originLocation, destinationLocation]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <MaterialCommunityIcons name="map-marker-path" size={24} color={Palette.emerald} />
              <View>
                <Text style={styles.headerTitle}>Full Route Navigation Map</Text>
                <Text style={styles.headerSub}>Farmer ↔ Client Live Route</Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={Palette.white} />
            </Pressable>
          </View>

          {/* Full Height Interactive Route Map Frame */}
          <View style={styles.fullMapFrame}>
            <MapView
              ref={mapRef}
              style={styles.map}
              // No customMapStyle here on purpose: leaving mapType at its default
              // "standard" gives the real Google Maps (Android) / Apple Maps (iOS)
              // rendering — white background, every road class, POI icons, transit
              // lines, building footprints, place labels — the actual detailed map,
              // not a stripped-down themed skin.
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              mapType="standard"
              showsCompass
              showsScale={Platform.OS === 'android'}
              showsBuildings
              initialRegion={{
                latitude: (originCoords.lat + destCoords.lat) / 2,
                longitude: (originCoords.lng + destCoords.lng) / 2,
                latitudeDelta: Math.abs(originCoords.lat - destCoords.lat) * 1.6 || 1,
                longitudeDelta: Math.abs(originCoords.lng - destCoords.lng) * 1.6 || 1,
              }}
              onMapReady={() => setMapReady(true)}
            >
              <Marker
                coordinate={{ latitude: originCoords.lat, longitude: originCoords.lng }}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.originPin}>
                  <MaterialCommunityIcons name="sprout" size={20} color={Palette.white} />
                </View>
              </Marker>

              <Marker
                coordinate={{ latitude: destCoords.lat, longitude: destCoords.lng }}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.destPin}>
                  <MaterialCommunityIcons name="account-location" size={22} color={Palette.white} />
                </View>
              </Marker>

              {polylinePoints.length > 1 && (
                <>
                  {/* Halo pass: makes the route readable against real road/label detail */}
                  <Polyline
                    coordinates={polylinePoints}
                    strokeColor="rgba(255,255,255,0.9)"
                    strokeWidth={11}
                    lineCap="round"
                    lineJoin="round"
                  />
                  <Polyline
                    coordinates={polylinePoints}
                    strokeColor={Palette.emerald}
                    strokeWidth={6}
                    lineCap="round"
                    lineJoin="round"
                  />
                </>
              )}
            </MapView>

            {/* Loading overlay while route data / map is still resolving */}
            {(loading || !mapReady) && (
              <View style={styles.loadingOverlay} pointerEvents="none">
                <ActivityIndicator size="large" color={Palette.emerald} />
                <Text style={styles.loadingText}>{loading ? 'Calculating route…' : 'Loading map…'}</Text>
              </View>
            )}

            {/* Floating Top Distance & Duration Pill */}
            <View style={styles.floatingHeaderPill}>
              <MaterialCommunityIcons name="navigation-variant" size={16} color={Palette.emerald} />
              <Text style={styles.floatingPillText}>
                {loading ? 'Calculating Route…' : `${distanceText} • ${durationText} (${routeVia})`}
              </Text>
            </View>

            {/* Bottom Floating App Theme Details Card */}
            <View style={styles.bottomFloatingCard}>
              <View style={styles.addressRow}>
                <View style={[styles.dot, { backgroundColor: Palette.emerald }]} />
                <View style={styles.addressCopy}>
                  <View style={styles.partyHeader}>
                    <Text style={styles.addrLabel}>FARMER / SELLER</Text>
                    <Text style={styles.gpsCoords}>
                      {originCoords.lat.toFixed(4)}° N, {Math.abs(originCoords.lng).toFixed(4)}° W
                    </Text>
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
                    <Text style={styles.addrLabel}>CLIENT / BUYER</Text>
                    <Text style={styles.gpsCoords}>
                      {destCoords.lat.toFixed(4)}° N, {Math.abs(destCoords.lng).toFixed(4)}° W
                    </Text>
                  </View>
                  <Text style={styles.addrTitle}>{destinationName}</Text>
                  <Text style={styles.addrSub}>{destinationLocation}</Text>
                </View>
              </View>

              <Pressable onPress={onClose} style={styles.doneBtn}>
                <Text style={styles.doneBtnText}>Close Map</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '92%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: Palette.forestDark,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.forestCard,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    color: Palette.white,
    fontSize: 17,
    fontWeight: '900',
  },
  headerSub: {
    color: Palette.emerald,
    fontSize: 11,
    marginTop: 1,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
  },

  fullMapFrame: {
    flex: 1,
    position: 'relative',
    backgroundColor: Palette.forestDark,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f4f6f5',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    zIndex: 20,
  },
  loadingText: {
    color: Palette.forestDark,
    fontSize: 13,
    fontWeight: '700',
  },

  originPin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.forest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: Palette.white,
  },
  destPin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.tomato,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: Palette.white,
  },

  floatingHeaderPill: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Palette.forestCard,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Palette.emerald,
    zIndex: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  floatingPillText: {
    color: Palette.white,
    fontSize: 13,
    fontWeight: '800',
  },

  bottomFloatingCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 20,
    backgroundColor: Palette.forestCard,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 12,
    zIndex: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
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
  addrLabel: {
    color: Palette.emerald,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  addrTitle: {
    color: Palette.white,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  addrSub: {
    color: Palette.paleMint,
    fontSize: 11,
    opacity: 0.8,
  },
  addrDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  doneBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: Palette.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  doneBtnText: {
    color: Palette.forestDark,
    fontSize: 15,
    fontWeight: '900',
  },
});