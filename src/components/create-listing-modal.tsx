import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Palette } from '@/constants/theme';
import { marketplaceService, type CropListingRecord } from '@/services/marketplaceService';
import { GhanaLocationPicker, type GhanaLocation } from '@/components/ghana-location-picker';
import * as ImagePicker from 'expo-image-picker';

const CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Tubers', 'Livestock'];
const BADGES = ['Fresh Harvest', 'Organic Verified', 'Wholesale Bulk', 'Premium Grade'];

export function CreateListingModal({
  visible,
  onClose,
  onSuccess,
  farmerId,
  farmerName,
  farmerLocation,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: (newRecord: CropListingRecord) => void;
  farmerId?: string;
  farmerName?: string;
  farmerLocation?: string;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('per 50kg bag');
  const [location, setLocation] = useState(farmerLocation || '');
  const [latitude, setLatitude] = useState<number>(5.6037);
  const [longitude, setLongitude] = useState<number>(-0.1870);
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('Fresh Harvest');
  const [cropImageUri, setCropImageUri] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelectLocation = (loc: GhanaLocation) => {
    setLocation(loc.addressText);
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
  };

  const pickCropPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setCropImageUri(result.assets[0].uri);
      }
    } catch (e) {}
  };

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setDescription('');
    setCropImageUri('');
    setLocation(farmerLocation || '');
    setCategory('Vegetables');
    setBadge('Fresh Harvest');
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Info', 'Please enter a crop title.');
      return;
    }
    if (!price || isNaN(parseFloat(price))) {
      Alert.alert('Missing Info', 'Please enter a valid price in GH₵.');
      return;
    }
    if (!farmerId) {
      Alert.alert('Not Logged In', 'Please sign in as a farmer to post listings.');
      return;
    }

    setLoading(true);
    const record = await marketplaceService.createCropListing({
      farmerId,
      title: title.trim(),
      cropType: category,
      unit,
      priceGhc: parseFloat(price),
      description,
      badge,
      imageUri: cropImageUri || undefined,
      latitude,
      longitude,
    });
    setLoading(false);

    if (!record) {
      Alert.alert('Error', 'Failed to post crop listing. Please try again.');
      return;
    }

    onSuccess(record);
    resetForm();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <MaterialCommunityIcons name="store-plus-outline" size={22} color={Palette.emerald} />
              <Text style={styles.headerTitle}>Post Produce for Sale</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} disabled={loading}>
              <MaterialCommunityIcons name="close" size={22} color={Palette.ink} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollBody}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Crop Title / Produce Name *</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Fresh Red Tomatoes, Yellow Maize"
                placeholderTextColor="#8A958D"
                style={styles.input}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.chipRow}>
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[styles.chip, category === cat && styles.chipActive]}>
                    <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.rowTwo}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Price in GH₵ *</Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder="e.g. 150"
                  placeholderTextColor="#8A958D"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Unit</Text>
                <TextInput
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="e.g. per 50kg bag"
                  placeholderTextColor="#8A958D"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Farm / Market Location (Ghana)</Text>
              <GhanaLocationPicker
                value={location}
                onSelectLocation={handleSelectLocation}
                placeholder="Search town, market, or farm area in Ghana..."
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Crop Photo (Optional)</Text>
              <Pressable onPress={pickCropPhoto} style={styles.photoBtn}>
                <MaterialCommunityIcons name="camera-plus" size={20} color={Palette.emerald} />
                <Text style={styles.photoBtnText}>
                  {cropImageUri ? '✓ Photo Selected — tap to change' : 'Upload Crop Photo'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Produce Quality Badge</Text>
              <View style={styles.chipRow}>
                {BADGES.map((b) => (
                  <Pressable
                    key={b}
                    onPress={() => setBadge(b)}
                    style={[styles.chip, badge === b && styles.chipActive]}>
                    <Text style={[styles.chipText, badge === b && styles.chipTextActive]}>{b}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description & Harvest Details</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Harvested yesterday. Available for immediate pickup or delivery."
                placeholderTextColor="#8A958D"
                multiline
                numberOfLines={3}
                style={[styles.input, { height: 74, textAlignVertical: 'top' }]}
              />
            </View>

            <Pressable
              onPress={handleSubmit}
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={Palette.white} size="small" />
              ) : (
                <MaterialCommunityIcons name="check" size={20} color={Palette.white} />
              )}
              <Text style={styles.submitBtnText}>
                {loading ? 'Publishing…' : 'Publish Crop Listing'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
  titleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: Palette.ink, fontSize: 18, fontWeight: '900' },
  closeBtn: { padding: 6 },
  scrollBody: { padding: 20, gap: 16 },
  formGroup: { gap: 6 },
  rowTwo: { flexDirection: 'row', gap: 12 },
  label: { color: Palette.ink, fontSize: 13, fontWeight: '800' },
  input: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Palette.canvas,
    borderWidth: 1,
    borderColor: Palette.line,
    color: Palette.ink,
    fontSize: 14,
  },
  photoBtn: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Palette.paleMint,
    borderWidth: 1,
    borderColor: Palette.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  photoBtnText: { color: Palette.forest, fontSize: 13, fontWeight: '700', flex: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Palette.canvas,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  chipActive: { backgroundColor: Palette.forest, borderColor: Palette.forest },
  chipText: { color: Palette.ink, fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: Palette.white },
  submitBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Palette.emerald,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.65 },
  submitBtnText: { color: Palette.white, fontSize: 15, fontWeight: '900' },
});
