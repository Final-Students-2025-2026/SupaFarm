import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Palette } from '@/constants/theme';
import { marketplaceService } from '@/services/marketplaceService';
import { type Product } from '@/components/marketplace-ui';

const categories = ['Vegetables', 'Fruits', 'Grains', 'Tubers', 'Livestock'];

export function CreateListingModal({
  visible,
  onClose,
  onSuccess,
  farmerName,
  farmerLocation,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: (newProduct: Product) => void;
  farmerName?: string;
  farmerLocation?: string;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('per 50kg bag');
  const [location, setLocation] = useState(farmerLocation || 'Techiman, Bono East');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('Fresh Harvest');

  const handleSubmit = async () => {
    if (!title || !price) return;

    const numPrice = parseFloat(price) || 120;
    const newProduct: Product = {
      id: `crop-${Date.now()}`,
      name: title,
      seller: farmerName || 'Kwame Asante (Farmer)',
      location: location || 'Ghana',
      price: `GH₵ ${numPrice}`,
      unit: unit || 'per bag',
      rating: '5.0',
      badge: badge || 'Fresh',
      image: title.toLowerCase().includes('tomato')
        ? require('@/assets/images/market/tomatoes.jpg')
        : title.toLowerCase().includes('maize') || title.toLowerCase().includes('corn')
        ? require('@/assets/images/market/maize.jpg')
        : title.toLowerCase().includes('plantain')
        ? require('@/assets/images/market/plantain.jpg')
        : require('@/assets/images/market/avocado.jpg'),
    };

    await marketplaceService.createCropListing({
      farmerId: 'usr-current',
      title,
      cropType: category,
      unit,
      priceGhc: numPrice,
      description,
    });

    onSuccess(newProduct);
    onClose();
    // Reset form
    setTitle('');
    setPrice('');
    setDescription('');
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <MaterialCommunityIcons name="store-plus-outline" size={22} color={Palette.emerald} />
              <Text style={styles.headerTitle}>Post Produce for Sale</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={Palette.ink} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Crop Title / Produce Name *</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Fresh Red Tomatoes, Yellow Maize, Green Plantain"
                placeholderTextColor="#8A958D"
                style={styles.input}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.chipRow}>
                {categories.map((cat) => (
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
                <Text style={styles.label}>Unit Quantity</Text>
                <TextInput
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="e.g. per 50kg bag, per crate"
                  placeholderTextColor="#8A958D"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Farm / Market Location</Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. Techiman Market, Bono East Region"
                placeholderTextColor="#8A958D"
                style={styles.input}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Produce Quality Badge</Text>
              <View style={styles.chipRow}>
                {['Fresh Harvest', 'Organic Verified', 'Wholesale Bulk', 'Premium Grade'].map((b) => (
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
                placeholder="Harvested yesterday. Available for immediate pickup or delivery across Ghana."
                placeholderTextColor="#8A958D"
                multiline
                numberOfLines={3}
                style={[styles.input, { height: 74, textAlignVertical: 'top' }]}
              />
            </View>

            <Pressable onPress={handleSubmit} style={styles.submitBtn}>
              <MaterialCommunityIcons name="check" size={20} color={Palette.white} />
              <Text style={styles.submitBtnText}>Publish Crop Listing</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '90%',
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
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: Palette.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    padding: 20,
    gap: 16,
  },
  formGroup: {
    gap: 6,
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    color: Palette.ink,
    fontSize: 13,
    fontWeight: '800',
  },
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Palette.canvas,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  chipActive: {
    backgroundColor: Palette.forest,
    borderColor: Palette.forest,
  },
  chipText: {
    color: Palette.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: Palette.white,
  },
  submitBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: Palette.emerald,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  submitBtnText: {
    color: Palette.white,
    fontSize: 15,
    fontWeight: '900',
  },
});
