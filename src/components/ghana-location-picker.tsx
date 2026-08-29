import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Palette } from '@/constants/theme';

export type GhanaLocation = {
  addressText: string;
  latitude: number;
  longitude: number;
  region?: string;
};

const GHANA_POPULAR_LOCATIONS: GhanaLocation[] = [
  { addressText: 'Techiman Produce Market, Bono East Region', latitude: 7.5828, longitude: -1.9392, region: 'Bono East' },
  { addressText: 'Kejetia Central Market, Kumasi, Ashanti Region', latitude: 6.6970, longitude: -1.6200, region: 'Ashanti' },
  { addressText: 'Makola Market, Accra, Greater Accra Region', latitude: 5.5458, longitude: -0.2072, region: 'Greater Accra' },
  { addressText: 'Agbogbloshie Food Market, Accra', latitude: 5.5517, longitude: -0.2223, region: 'Greater Accra' },
  { addressText: 'Tamale Central Crop Market, Northern Region', latitude: 9.4008, longitude: -0.8393, region: 'Northern' },
  { addressText: 'Sekondi-Takoradi Market Circle, Western Region', latitude: 4.9016, longitude: -1.7831, region: 'Western' },
  { addressText: 'Sunyani Main Market, Bono Region', latitude: 7.3349, longitude: -2.3268, region: 'Bono' },
  { addressText: 'Koforidua Central Market, Eastern Region', latitude: 6.0941, longitude: -0.2591, region: 'Eastern' },
  { addressText: 'Cape Coast Kotokuraba Market, Central Region', latitude: 5.1053, longitude: -1.2466, region: 'Central' },
  { addressText: 'Wa Central Market, Upper West Region', latitude: 10.0601, longitude: -2.5099, region: 'Upper West' },
  { addressText: 'Bolgatanga Commercial Market, Upper East Region', latitude: 10.7856, longitude: -0.8514, region: 'Upper East' },
  { addressText: 'Ho Central Market, Volta Region', latitude: 6.6101, longitude: 0.4785, region: 'Volta' },
  { addressText: 'Mankessim Crop Market, Central Region', latitude: 5.2691, longitude: -1.0232, region: 'Central' },
  { addressText: 'Dambai Yam Market, Oti Region', latitude: 8.0673, longitude: 0.1783, region: 'Oti' },
  { addressText: 'Madina Market, Accra, Greater Accra Region', latitude: 5.6698, longitude: -0.1654, region: 'Greater Accra' },
  { addressText: 'Ashaiman Market, Greater Accra Region', latitude: 5.6980, longitude: -0.0326, region: 'Greater Accra' },
  { addressText: 'Ejura Maize Market, Ashanti Region', latitude: 7.3756, longitude: -1.3645, region: 'Ashanti' },
  { addressText: 'Bawku Grain Market, Upper East Region', latitude: 11.0614, longitude: -0.2417, region: 'Upper East' },
  { addressText: 'Agona Swedru Market, Central Region', latitude: 5.5333, longitude: -0.7000, region: 'Central' },
  { addressText: 'Kasoa Market, Central Region', latitude: 5.5342, longitude: -0.4168, region: 'Central' },
];

export function GhanaLocationPicker({
  value,
  onSelectLocation,
  placeholder = 'Search town, market, or farm area in Ghana...',
}: {
  value: string;
  onSelectLocation: (location: GhanaLocation) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState<GhanaLocation[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    let active = true;

    // Filter local popular Ghanaian markets first
    const localMatches = GHANA_POPULAR_LOCATIONS.filter((item) =>
      item.addressText.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(localMatches);
    setShowDropdown(true);

    // Perform live Google Maps API search (or Nominatim fallback) restricted to Ghana
    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        const googleApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (googleApiKey) {
          // 1. Google Maps Geocoding / Places API query restricted to Ghana (country:GH)
          const googleRes = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              query
            )}&components=country:GH&key=${googleApiKey}`
          );
          const googleData = await googleRes.json();

          if (active && googleData.status === 'OK' && Array.isArray(googleData.results)) {
            const googleMatches: GhanaLocation[] = googleData.results.map((item: any) => ({
              addressText: item.formatted_address,
              latitude: item.geometry.location.lat,
              longitude: item.geometry.location.lng,
              region: 'Ghana',
            }));

            const combined = [...localMatches];
            for (const gLoc of googleMatches) {
              if (!combined.some((c) => Math.abs(c.latitude - gLoc.latitude) < 0.001)) {
                combined.push(gLoc);
              }
            }
            setSuggestions(combined);
            return;
          }
        }

        // 2. Fallback to OpenStreetMap Nominatim restricted to Ghana
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&countrycodes=gh&limit=5`,
          {
            headers: {
              'User-Agent': 'SupaFarmGhanaApp/1.0',
            },
          }
        );
        const data = await res.json();
        if (active && Array.isArray(data) && data.length > 0) {
          const apiMatches: GhanaLocation[] = data.map((item: any) => ({
            addressText: `${item.display_name.split(',').slice(0, 3).join(',')}, Ghana`,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            region: 'Ghana',
          }));

          const combined = [...localMatches];
          for (const apiLoc of apiMatches) {
            if (!combined.some((c) => Math.abs(c.latitude - apiLoc.latitude) < 0.001)) {
              combined.push(apiLoc);
            }
          }
          setSuggestions(combined);
        }
      } catch (e) {
      } finally {
        if (active) setLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [query]);

  const handleSelect = (loc: GhanaLocation) => {
    setQuery(loc.addressText);
    setShowDropdown(false);
    onSelectLocation(loc);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrap}>
        <MaterialCommunityIcons name="map-marker-radius" size={20} color={Palette.emerald} />
        <TextInput
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setShowDropdown(true);
          }}
          placeholder={placeholder}
          placeholderTextColor="#8A958D"
          style={styles.textInput}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
        />
        {loading ? (
          <ActivityIndicator size="small" color={Palette.emerald} />
        ) : query.length > 0 ? (
          <Pressable onPress={() => { setQuery(''); setSuggestions([]); setShowDropdown(false); }}>
            <MaterialCommunityIcons name="close-circle" size={18} color={Palette.muted} />
          </Pressable>
        ) : null}
      </View>

      {/* Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <View style={styles.dropdown}>
          <View style={styles.dropdownHeader}>
            <MaterialCommunityIcons name="google-maps" size={14} color={Palette.emerald} />
            <Text style={styles.dropdownHeaderText}>Ghana Location Suggestions ({suggestions.length})</Text>
          </View>

          {suggestions.slice(0, 6).map((loc, i) => (
            <Pressable
              key={i}
              onPress={() => handleSelect(loc)}
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
              <View style={styles.itemIcon}>
                <MaterialCommunityIcons name="map-marker" size={18} color={Palette.forest} />
              </View>
              <View style={styles.itemCopy}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {loc.addressText}
                </Text>
                <Text style={styles.itemCoords}>
                  GPS: {loc.latitude.toFixed(4)}° N, {loc.longitude.toFixed(4)}° W
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color={Palette.muted} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 100,
  },
  inputWrap: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Palette.canvas,
    borderWidth: 1,
    borderColor: Palette.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textInput: {
    flex: 1,
    color: Palette.ink,
    fontSize: 14,
  },
  dropdown: {
    marginTop: 6,
    borderRadius: 14,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  dropdownHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Palette.mint,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: Palette.line,
  },
  dropdownHeaderText: {
    color: Palette.forest,
    fontSize: 11,
    fontWeight: '800',
  },
  item: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Palette.line,
  },
  itemPressed: {
    backgroundColor: Palette.paleMint,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Palette.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCopy: {
    flex: 1,
  },
  itemTitle: {
    color: Palette.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  itemCoords: {
    marginTop: 2,
    color: Palette.emerald,
    fontSize: 10,
    fontWeight: '700',
  },
});
