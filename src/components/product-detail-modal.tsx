import { useState } from 'react';
import { Image } from 'expo-image';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { type Product } from '@/components/marketplace-ui';
import { Palette } from '@/constants/theme';
import { InAppMapDirectionsModal } from '@/components/in-app-map-directions-modal';

export function ProductDetailModal({
  product,
  visible,
  onClose,
  onCall,
  onOrder,
}: {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  onCall?: (product: Product) => void;
  onOrder?: (product: Product) => void;
}) {
  const [showDirections, setShowDirections] = useState(false);

  if (!visible || !product) return null;

  const handleCallFarmer = () => {
    if (onCall) {
      onCall(product);
    } else {
      const defaultPhone = '+233240000000';
      Linking.openURL(`tel:${defaultPhone}`);
    }
  };

  const handleOrderProduce = () => {
    if (onOrder) {
      onOrder(product);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header Bar */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Crop Listing Details</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={Palette.ink} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Product Image Banner */}
            <View style={styles.imageWrap}>
              <Image source={product.image} style={styles.image} contentFit="cover" />
              {product.badge && (
                <View style={styles.badge}>
                  <MaterialCommunityIcons name="leaf" size={13} color={Palette.white} />
                  <Text style={styles.badgeText}>{product.badge}</Text>
                </View>
              )}
            </View>

            {/* Title & Rating Row */}
            <View style={styles.titleRow}>
              <Text style={styles.productName}>{product.name}</Text>
              <View style={styles.ratingBox}>
                <MaterialCommunityIcons name="star" size={16} color={Palette.sun} />
                <Text style={styles.ratingText}>{product.rating || '5.0'}</Text>
              </View>
            </View>

            {/* Price Box */}
            <View style={styles.priceCard}>
              <View>
                <Text style={styles.priceLabel}>WHOLESALE PRICE</Text>
                <Text style={styles.priceVal}>{product.price}</Text>
              </View>
              <View style={styles.unitPill}>
                <Text style={styles.unitText}>{product.unit}</Text>
              </View>
            </View>

            {/* Farmer / Seller Profile Card */}
            <View style={styles.sellerCard}>
              <View style={styles.sellerAvatar}>
                <MaterialCommunityIcons name="account-tie" size={24} color={Palette.forest} />
              </View>
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerLabel}>VERIFIED SELLER / FARMER</Text>
                <Text style={styles.sellerName}>{product.seller}</Text>
                <View style={styles.locationRow}>
                  <MaterialCommunityIcons name="map-marker" size={13} color={Palette.emerald} />
                  <Text style={styles.locationText}>{product.location}</Text>
                </View>
              </View>
              <Pressable
                onPress={() => setShowDirections(true)}
                style={styles.dirBtn}>
                <MaterialCommunityIcons name="navigation-variant" size={16} color={Palette.emerald} />
                <Text style={styles.dirBtnText}>Directions</Text>
              </Pressable>
            </View>

            {/* Produce Description */}
            <View style={styles.descSection}>
              <Text style={styles.descTitle}>Produce & Harvest Details</Text>
              <Text style={styles.descText}>
                Freshly harvested top-quality produce direct from local farms in {product.location}. Available for immediate wholesale bulk order, pickup, or delivery across Ghana.
              </Text>
            </View>

            {/* Action Buttons: Call & Order */}
            <View style={styles.actionsRow}>
              <Pressable onPress={handleCallFarmer} style={styles.callBtn}>
                <MaterialCommunityIcons name="phone" size={20} color={Palette.white} />
                <Text style={styles.callBtnText}>Call Farmer</Text>
              </Pressable>

              <Pressable onPress={handleOrderProduce} style={styles.orderBtn}>
                <MaterialCommunityIcons name="cart-outline" size={20} color={Palette.white} />
                <Text style={styles.orderBtnText}>Order Produce</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>

      <InAppMapDirectionsModal
        visible={showDirections}
        onClose={() => setShowDirections(false)}
        originLocation="My Location"
        originName="My Current Location"
        destinationLocation={product.location}
        destinationName={product.seller}
      />
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
  headerTitle: {
    color: Palette.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    padding: 20,
    gap: 16,
  },
  imageWrap: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Palette.canvas,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Palette.forest,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    color: Palette.white,
    fontSize: 11,
    fontWeight: '800',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  productName: {
    flex: 1,
    color: Palette.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Palette.mint,
  },
  ratingText: {
    color: Palette.forestDark,
    fontSize: 13,
    fontWeight: '800',
  },
  priceCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: Palette.paleMint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Palette.line,
  },
  priceLabel: {
    color: Palette.muted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  priceVal: {
    color: Palette.forestDark,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  unitPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  unitText: {
    color: Palette.forest,
    fontSize: 12,
    fontWeight: '800',
  },
  sellerCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerInfo: {
    flex: 1,
    gap: 2,
  },
  sellerLabel: {
    color: Palette.muted,
    fontSize: 9,
    fontWeight: '900',
  },
  sellerName: {
    color: Palette.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dirBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: Palette.mint,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dirBtnText: {
    color: Palette.forest,
    fontSize: 12,
    fontWeight: '800',
  },
  locationText: {
    color: Palette.muted,
    fontSize: 12,
  },
  descSection: {
    gap: 6,
  },
  descTitle: {
    color: Palette.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  descText: {
    color: Palette.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  callBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: Palette.forest,
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
  orderBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: Palette.emerald,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  orderBtnText: {
    color: Palette.white,
    fontSize: 14,
    fontWeight: '900',
  },
});
