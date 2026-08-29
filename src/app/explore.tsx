import { Image } from 'expo-image';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VoiceCallModal } from '@/components/voice-call-modal';
import { BottomTabInset, MaxContentWidth, Palette } from '@/constants/theme';
import { authService, type Profile } from '@/services/authService';

const FARM_PLACEHOLDER = require('@/assets/images/market/vegetables.jpg');

export default function DiscoverScreen() {
  const [farmers, setFarmers] = useState<Profile[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callTarget, setCallTarget] = useState({ name: '', location: '' });

  useEffect(() => {
    let mounted = true;
    authService.getFarmers().then((data) => {
      if (mounted) {
        setFarmers(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const filtered = farmers.filter((f) =>
    `${f.full_name} ${f.address_text ?? ''}`.toLowerCase().includes(query.toLowerCase())
  );

  const handleCall = (farmer: Profile) => {
    setCallTarget({ name: farmer.full_name, location: farmer.address_text ?? 'Ghana' });
    setShowCallModal(true);
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>

            {/* Header */}
            <View style={styles.topBar}>
              <View>
                <Text style={styles.pageTitle}>Farm Directory</Text>
                <Text style={styles.pageSub}>Verified crop farmers across Ghana</Text>
              </View>
              <View style={styles.countPill}>
                <Text style={styles.countText}>{filtered.length} farmers</Text>
              </View>
            </View>

            {/* Search */}
            <View style={styles.searchWrap}>
              <MaterialCommunityIcons name="magnify" size={20} color={Palette.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search farmers by name or location..."
                placeholderTextColor="#8A958D"
                style={styles.searchInput}
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')}>
                  <MaterialCommunityIcons name="close-circle" size={18} color={Palette.muted} />
                </Pressable>
              )}
            </View>

            {/* Farmer Cards */}
            {loading ? (
              <View style={styles.emptyBox}>
                <MaterialCommunityIcons name="loading" size={32} color={Palette.muted} />
                <Text style={styles.emptyText}>Loading farmers from database…</Text>
              </View>
            ) : filtered.length === 0 ? (
              <View style={styles.emptyBox}>
                <MaterialCommunityIcons name="account-group-outline" size={40} color={Palette.muted} />
                <Text style={styles.emptyTitle}>No farmers found</Text>
                <Text style={styles.emptyText}>
                  {query.length > 0
                    ? `No farmers match "${query}". Try a different search.`
                    : 'No farmer profiles are in the database yet. Be the first to sign up as a Farmer!'}
                </Text>
              </View>
            ) : (
              <View style={styles.grid}>
                {filtered.map((farmer) => (
                  <View key={farmer.id} style={styles.card}>
                    {/* Farm background banner */}
                    <View style={styles.cardBanner}>
                      {farmer.farm_background_image_url ? (
                        <Image
                          source={{ uri: farmer.farm_background_image_url }}
                          style={styles.bannerImg}
                          contentFit="cover"
                        />
                      ) : (
                        <Image
                          source={FARM_PLACEHOLDER}
                          style={styles.bannerImg}
                          contentFit="cover"
                        />
                      )}
                      <View style={styles.bannerOverlay} />

                      {/* Profile picture */}
                      <View style={styles.avatarWrap}>
                        {farmer.profile_image_url ? (
                          <Image
                            source={{ uri: farmer.profile_image_url }}
                            style={styles.avatarImg}
                            contentFit="cover"
                          />
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarInitials}>
                              {farmer.full_name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Verified badge */}
                      <View style={styles.verifiedBadge}>
                        <MaterialCommunityIcons name="check-decagram" size={13} color={Palette.emerald} />
                        <Text style={styles.verifiedText}>Verified Farmer</Text>
                      </View>
                    </View>

                    {/* Card body */}
                    <View style={styles.cardBody}>
                      <View style={styles.farmerNameHeader}>
                        <MaterialCommunityIcons name="account-tie" size={18} color={Palette.forest} />
                        <Text style={styles.farmerName}>{farmer.full_name || 'Ghana Farmer'}</Text>
                      </View>
                      {farmer.address_text ? (
                        <View style={styles.locationRow}>
                          <MaterialCommunityIcons name="map-marker" size={13} color={Palette.emerald} />
                          <Text style={styles.locationText}>{farmer.address_text}</Text>
                        </View>
                      ) : null}

                      <Pressable
                        onPress={() => handleCall(farmer)}
                        style={styles.callBtn}>
                        <MaterialCommunityIcons name="phone" size={16} color={Palette.white} />
                        <Text style={styles.callBtnText}>Call Farmer</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <VoiceCallModal
        visible={showCallModal}
        onClose={() => setShowCallModal(false)}
        recipientName={callTarget.name}
        recipientLocation={callTarget.location}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.canvas },
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: BottomTabInset + 28 },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    gap: 16,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageTitle: {
    color: Palette.ink,
    fontSize: 24,
    fontWeight: '900',
  },
  pageSub: {
    color: Palette.muted,
    fontSize: 12,
    marginTop: 2,
  },
  countPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Palette.mint,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  countText: {
    color: Palette.forest,
    fontSize: 12,
    fontWeight: '800',
  },

  searchWrap: {
    height: 50,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: Palette.ink,
    fontSize: 14,
  },

  emptyBox: {
    padding: 36,
    borderRadius: 16,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  emptyTitle: {
    color: Palette.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyText: {
    color: Palette.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },

  grid: {
    gap: 16,
  },

  card: {
    borderRadius: 18,
    backgroundColor: Palette.white,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Palette.line,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },

  cardBanner: {
    height: 130,
    backgroundColor: Palette.forestDark,
    position: 'relative',
  },
  bannerImg: {
    ...StyleSheet.absoluteFillObject,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9,51,34,0.5)',
  },

  avatarWrap: {
    position: 'absolute',
    bottom: -26,
    left: 18,
  },
  avatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: Palette.white,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Palette.forestDark,
    borderWidth: 3,
    borderColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: Palette.white,
    fontSize: 16,
    fontWeight: '900',
  },

  verifiedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  verifiedText: {
    color: Palette.forest,
    fontSize: 10,
    fontWeight: '800',
  },

  cardBody: {
    paddingTop: 34,
    paddingHorizontal: 18,
    paddingBottom: 16,
    gap: 8,
  },
  farmerNameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  farmerName: {
    color: Palette.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: Palette.muted,
    fontSize: 12,
  },

  callBtn: {
    marginTop: 4,
    height: 44,
    borderRadius: 12,
    backgroundColor: Palette.emerald,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  callBtnText: {
    color: Palette.white,
    fontSize: 14,
    fontWeight: '900',
  },
});
