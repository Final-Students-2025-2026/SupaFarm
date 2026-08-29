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

/** Decode a Google Maps encoded polyline string into lat/lng pairs. */
function decodeGooglePolyline(encoded: string): { latitude: number; longitude: number }[] {
  const pts: { latitude: number; longitude: number }[] = [];
  let idx = 0, lat = 0, lng = 0;
  while (idx < encoded.length) {
    let b: number, shift = 0, result = 0;
    do { b = encoded.charCodeAt(idx++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(idx++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    pts.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return pts;
}

// Dark "SupaFarm" map style for Google-provided maps (Android always, iOS only if
// you force PROVIDER_GOOGLE — see notes below). Apple Maps on iOS ignores this.
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: Palette.forestDark }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: Palette.forestDark }] },
  { elementType: 'labels.text.fill', stylers: [{ color: Palette.mintDark }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: 'rgba(255,255,255,0.15)' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: Palette.forest }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: Palette.emerald }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: Palette.white }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: Palette.forestCard }] },
];

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
  const [distanceText, setDistanceText] = useState('');
  const [durationText, setDurationText] = useState('');
  const [routeVia, setRouteVia] = useState('');

  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number }>({ lat: 5.6037, lng: -0.187 });
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number }>({ lat: 7.5828, lng: -1.9392 });
  const [polylinePoints, setPolylinePoints] = useState<{ latitude: number; longitude: number }[]>([]);

  // Reset on open
  useEffect(() => {
    if (!visible) {
      setMapReady(false);
      setPolylinePoints([]);
      setLoading(true);
      return;
    }

    let mounted = true;

    const fetchRoute = async () => {
      try {
        // ── Geocode both addresses via Nominatim ──────────────────────────────
        const getCoords = async (locName: string) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locName)}&format=json&limit=1&countrycodes=gh`,
              { headers: { 'User-Agent': 'SupaFarmApp/1.0' } }
            );
            const data = await res.json();
            if (data?.length > 0)
              return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
          } catch (_) { }
          return null;
        };

        const origC = (await getCoords(originLocation)) ?? { lat: 5.6037, lng: -0.187 };
        const destC = (await getCoords(destinationLocation)) ?? { lat: 7.5828, lng: -1.9392 };

        if (!mounted) return;
        setOriginCoords(origC);
        setDestCoords(destC);

        let routePoints: { latitude: number; longitude: number }[] = [];
        let distance = '';
        let duration = '';
        let viaRouteName = 'Ghana Highway';

        // ── Tier 1: Google Directions REST API (real road polyline) ───────────
        const googleKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
        if (googleKey) {
          try {
            const url =
              `https://maps.googleapis.com/maps/api/directions/json` +
              `?origin=${origC.lat},${origC.lng}` +
              `&destination=${destC.lat},${destC.lng}` +
              `&mode=driving&key=${googleKey}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.status === 'OK' && data.routes?.length > 0) {
              const route = data.routes[0];
              const leg = route.legs[0];
              distance = leg.distance.text;
              duration = leg.duration.text;
              viaRouteName = route.summary || 'Ghana Highway';
              // Decode the overview_polyline
              routePoints = decodeGooglePolyline(route.overview_polyline.points);
            }
          } catch (_) { }
        }

        // ── Tier 2: OSRM (free, real GeoJSON road geometry) ──────────────────
        if (routePoints.length === 0) {
          try {
            const url =
              `https://router.project-osrm.org/route/v1/driving/` +
              `${origC.lng},${origC.lat};${destC.lng},${destC.lat}` +
              `?overview=full&geometries=geojson`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.routes?.length > 0) {
              const r = data.routes[0];
              if (Array.isArray(r.geometry?.coordinates)) {
                routePoints = r.geometry.coordinates.map((pt: [number, number]) => ({
                  latitude: pt[1],
                  longitude: pt[0],
                }));
              }
              const distKm = r.distance / 1000;
              const durMins = r.duration / 60;
              distance = `${distKm.toFixed(1)} km`;
              duration = formatDuration(durMins);
              viaRouteName = r.legs[0]?.summary || 'Ghana Highway';
            }
          } catch (_) { }
        }

        // ── Tier 3: Straight-line fallback ───────────────────────────────────
        if (routePoints.length === 0) {
          routePoints = [
            { latitude: origC.lat, longitude: origC.lng },
            { latitude: destC.lat, longitude: destC.lng },
          ];
          const km = getHaversineDistance(origC.lat, origC.lng, destC.lat, destC.lng) * 1.25;
          distance = `~${km.toFixed(1)} km`;
          duration = `~${formatDuration((km / 35) * 60)}`;
          viaRouteName = 'Direct Route';
        }

        if (!mounted) return;
        setPolylinePoints(routePoints);
        setDistanceText(distance);
        setDurationText(duration);
        setRouteVia(viaRouteName);
        setLoading(false);
      } catch (_) {
        if (mounted) setLoading(false);
      }
    };

    fetchRoute();
    return () => { mounted = false; };
  }, [visible, originLocation, destinationLocation]);

  // Fit map ONLY after BOTH the map is rendered AND we have route points
  useEffect(() => {
    if (!mapReady || polylinePoints.length < 2) return;
    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(polylinePoints, {
        edgePadding: { top: 100, right: 60, bottom: 240, left: 60 },
        animated: true,
      });
    }, 400); // short delay lets MapView finish its initial render
    return () => clearTimeout(timer);
  }, [mapReady, polylinePoints]);

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
              // Google provider gives consistent styling + Polyline rendering on
              // Android by default. On iOS this requires a native Google Maps SDK
              // key configured in app.json — omit PROVIDER_GOOGLE on iOS to use
              // Apple Maps instead (customMapStyle will then be ignored there).
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              customMapStyle={Platform.OS === 'android' ? darkMapStyle : undefined}
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
                <Polyline
                  coordinates={polylinePoints}
                  strokeColor={Palette.emerald}
                  strokeWidth={6}
                  lineCap="round"
                  lineJoin="round"
                />
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
    backgroundColor: Palette.forestDark,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    zIndex: 20,
  },
  loadingText: {
    color: Palette.paleMint,
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