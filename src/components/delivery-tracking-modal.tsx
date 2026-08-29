import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/theme';

export type DeliveryMode = 'self_pickup' | 'seller_delivery' | 'platform_delivery';

export function DeliveryTrackingModal({
  visible,
  onClose,
  productName = 'Fresh Produce',
  farmerName = 'Ghana Farmer',
  farmerLocation = 'Farm Location',
  buyerLocation = 'Registered Address',
  amount = 'GH₵ 0',
}: {
  visible: boolean;
  onClose: () => void;
  productName?: string;
  farmerName?: string;
  farmerLocation?: string;
  buyerLocation?: string;
  amount?: string;
}) {
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('platform_delivery');
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const handleConfirmOrder = () => {
    setOrderConfirmed(true);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons name="truck-delivery-outline" size={24} color={Palette.emerald} />
              <Text style={styles.headerTitle}>Order & Delivery</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={Palette.ink} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Map Directions Box */}
            <View style={styles.mapSimContainer}>
              <View style={styles.mapGraphic}>
                <View style={styles.routeLine} />
                <View style={styles.farmerPin}>
                  <MaterialCommunityIcons name="home-variant" size={16} color={Palette.white} />
                </View>
                <View style={styles.deliveryRiderPin}>
                  <MaterialCommunityIcons name="motorbike" size={16} color={Palette.forestDark} />
                </View>
                <View style={styles.buyerPin}>
                  <MaterialCommunityIcons name="map-marker" size={18} color={Palette.tomato} />
                </View>
              </View>
              <View style={styles.mapOverlayPill}>
                <MaterialCommunityIcons name="navigation-variant" size={14} color={Palette.emerald} />
                <Text style={styles.mapDistanceText}>Distance: 24 km • Route via N6 Highway</Text>
              </View>
            </View>

            {/* Farm & Buyer Points */}
            <View style={styles.locationCard}>
              <View style={styles.locationRow}>
                <View style={[styles.dot, { backgroundColor: Palette.emerald }]} />
                <View style={styles.locationTextWrap}>
                  <Text style={styles.locLabel}>FARM LOCATION (SELLER)</Text>
                  <Text style={styles.locName}>{farmerName}</Text>
                  <Text style={styles.locSub}>{farmerLocation}</Text>
                </View>
              </View>

              <View style={styles.locationDivider} />

              <View style={styles.locationRow}>
                <View style={[styles.dot, { backgroundColor: Palette.tomato }]} />
                <View style={styles.locationTextWrap}>
                  <Text style={styles.locLabel}>DELIVERY ADDRESS (BUYER)</Text>
                  <Text style={styles.locName}>My Registered Location</Text>
                  <Text style={styles.locSub}>{buyerLocation}</Text>
                </View>
              </View>
            </View>

            {!orderConfirmed ? (
              <>
                <Text style={styles.sectionTitle}>Select Delivery Mode (3-Tier)</Text>
                <View style={styles.modesContainer}>
                  {/* Mode 1: Self Pick-up */}
                  <Pressable
                    onPress={() => setDeliveryMode('self_pickup')}
                    style={[styles.modeOption, deliveryMode === 'self_pickup' && styles.modeOptionActive]}>
                    <View style={styles.modeIcon}>
                      <MaterialCommunityIcons name="walk" size={22} color={deliveryMode === 'self_pickup' ? Palette.white : Palette.forest} />
                    </View>
                    <View style={styles.modeCopy}>
                      <Text style={[styles.modeTitle, deliveryMode === 'self_pickup' && styles.textWhite]}>1. Self Pick-up</Text>
                      <Text style={[styles.modeDesc, deliveryMode === 'self_pickup' && styles.textLight]}>Buyer collects produce directly at farm site.</Text>
                    </View>
                    <Text style={[styles.modeFee, deliveryMode === 'self_pickup' && styles.textWhite]}>Free</Text>
                  </Pressable>

                  {/* Mode 2: Seller-Arranged */}
                  <Pressable
                    onPress={() => setDeliveryMode('seller_delivery')}
                    style={[styles.modeOption, deliveryMode === 'seller_delivery' && styles.modeOptionActive]}>
                    <View style={styles.modeIcon}>
                      <MaterialCommunityIcons name="tractor" size={22} color={deliveryMode === 'seller_delivery' ? Palette.white : Palette.forest} />
                    </View>
                    <View style={styles.modeCopy}>
                      <Text style={[styles.modeTitle, deliveryMode === 'seller_delivery' && styles.textWhite]}>2. Seller-Arranged</Text>
                      <Text style={[styles.modeDesc, deliveryMode === 'seller_delivery' && styles.textLight]}>Farmer coordinates transport directly to you.</Text>
                    </View>
                    <Text style={[styles.modeFee, deliveryMode === 'seller_delivery' && styles.textWhite]}>GH₵ 25</Text>
                  </Pressable>

                  {/* Mode 3: Platform-Managed */}
                  <Pressable
                    onPress={() => setDeliveryMode('platform_delivery')}
                    style={[styles.modeOption, deliveryMode === 'platform_delivery' && styles.modeOptionActive]}>
                    <View style={styles.modeIcon}>
                      <MaterialCommunityIcons name="shield-truck" size={22} color={deliveryMode === 'platform_delivery' ? Palette.white : Palette.forest} />
                    </View>
                    <View style={styles.modeCopy}>
                      <Text style={[styles.modeTitle, deliveryMode === 'platform_delivery' && styles.textWhite]}>3. Platform-Managed</Text>
                      <Text style={[styles.modeDesc, deliveryMode === 'platform_delivery' && styles.textLight]}>SupaFarm third-party courier with live GPS tracking.</Text>
                    </View>
                    <Text style={[styles.modeFee, deliveryMode === 'platform_delivery' && styles.textWhite]}>GH₵ 35</Text>
                  </Pressable>
                </View>

                {/* Payment Notice */}
                <View style={styles.paymentNotice}>
                  <MaterialCommunityIcons name="cash-multiple" size={22} color={Palette.forest} />
                  <View style={styles.paymentCopy}>
                    <Text style={styles.paymentTitle}>Payment Method: Cash on Delivery (COD)</Text>
                    <Text style={styles.paymentDesc}>Pay directly upon receipt. No pre-payment or online gateway required.</Text>
                  </View>
                </View>

                <View style={styles.summaryRow}>
                  <View>
                    <Text style={styles.summaryLabel}>Total Payable on Delivery:</Text>
                    <Text style={styles.summaryPrice}>{amount}</Text>
                  </View>

                  <Pressable onPress={handleConfirmOrder} style={styles.confirmBtn}>
                    <Text style={styles.confirmBtnText}>Confirm Order</Text>
                    <MaterialCommunityIcons name="arrow-right" size={18} color={Palette.white} />
                  </Pressable>
                </View>
              </>
            ) : (
              /* Order Status Live Tracking Timeline */
              <View style={styles.trackingContainer}>
                <View style={styles.successBadge}>
                  <MaterialCommunityIcons name="check-circle" size={32} color={Palette.emerald} />
                  <Text style={styles.successTitle}>Order Placed Successfully!</Text>
                  <Text style={styles.successSub}>Tracking ID: #SF-GH-89021</Text>
                </View>

                <Text style={styles.timelineHeader}>Live Delivery Timeline</Text>

                <View style={styles.timeline}>
                  <View style={styles.timelineStep}>
                    <View style={[styles.timelineNode, styles.nodeActive]}>
                      <MaterialCommunityIcons name="check" size={14} color={Palette.white} />
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>Order Received by Farmer</Text>
                      <Text style={styles.timelineTime}>12:20 PM • Confirmed by {farmerName}</Text>
                    </View>
                  </View>

                  <View style={styles.timelineLine} />

                  <View style={styles.timelineStep}>
                    <View style={[styles.timelineNode, styles.nodeActive]}>
                      <MaterialCommunityIcons name="package-variant" size={14} color={Palette.white} />
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>Produce Packed & Inspected</Text>
                      <Text style={styles.timelineTime}>12:25 PM • Grade A Tomatoes</Text>
                    </View>
                  </View>

                  <View style={styles.timelineLine} />

                  <View style={styles.timelineStep}>
                    <View style={[styles.timelineNode, styles.nodePending]}>
                      <MaterialCommunityIcons name="bike" size={14} color={Palette.white} />
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>Dispatched for Delivery</Text>
                      <Text style={styles.timelineTime}>Estimated Arrival: 45 mins</Text>
                    </View>
                  </View>
                </View>

                <Pressable onPress={onClose} style={styles.doneBtn}>
                  <Text style={styles.doneBtnText}>Back to Marketplace</Text>
                </Pressable>
              </View>
            )}
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
  titleRow: {
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
  body: {
    padding: 20,
    gap: 16,
  },
  mapSimContainer: {
    height: 140,
    borderRadius: 16,
    backgroundColor: '#0F2C1D',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapGraphic: {
    width: '80%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeLine: {
    position: 'absolute',
    width: '100%',
    height: 4,
    backgroundColor: Palette.emerald,
    borderRadius: 2,
  },
  farmerPin: {
    position: 'absolute',
    left: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.forest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Palette.white,
  },
  deliveryRiderPin: {
    position: 'absolute',
    left: '45%',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Palette.sun,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Palette.white,
  },
  buyerPin: {
    position: 'absolute',
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Palette.tomato,
  },
  mapOverlayPill: {
    position: 'absolute',
    bottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapDistanceText: {
    color: Palette.forestDark,
    fontSize: 11,
    fontWeight: '800',
  },
  locationCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: Palette.paleMint,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  locationRow: {
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
  locationTextWrap: {
    flex: 1,
  },
  locLabel: {
    color: Palette.muted,
    fontSize: 9,
    fontWeight: '900',
  },
  locName: {
    color: Palette.ink,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  locSub: {
    color: Palette.muted,
    fontSize: 11,
  },
  locationDivider: {
    height: 1,
    backgroundColor: Palette.line,
    marginVertical: 10,
  },
  sectionTitle: {
    color: Palette.ink,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  modesContainer: {
    gap: 10,
  },
  modeOption: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: Palette.canvas,
    borderWidth: 1.5,
    borderColor: Palette.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modeOptionActive: {
    backgroundColor: Palette.forestCard,
    borderColor: Palette.forestDark,
  },
  modeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Palette.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeCopy: {
    flex: 1,
  },
  modeTitle: {
    color: Palette.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  modeDesc: {
    color: Palette.muted,
    fontSize: 11,
    marginTop: 2,
  },
  modeFee: {
    color: Palette.forest,
    fontSize: 14,
    fontWeight: '900',
  },
  textWhite: {
    color: Palette.white,
  },
  textLight: {
    color: '#D1D5DB',
  },
  paymentNotice: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: Palette.mint,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentCopy: {
    flex: 1,
  },
  paymentTitle: {
    color: Palette.forest,
    fontSize: 13,
    fontWeight: '800',
  },
  paymentDesc: {
    color: Palette.muted,
    fontSize: 11,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  summaryLabel: {
    color: Palette.muted,
    fontSize: 11,
  },
  summaryPrice: {
    color: Palette.forest,
    fontSize: 22,
    fontWeight: '900',
  },
  confirmBtn: {
    height: 48,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: Palette.forest,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confirmBtnText: {
    color: Palette.white,
    fontSize: 14,
    fontWeight: '800',
  },
  trackingContainer: {
    gap: 16,
  },
  successBadge: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: Palette.emeraldLight,
    alignItems: 'center',
    gap: 6,
  },
  successTitle: {
    color: Palette.forestDark,
    fontSize: 16,
    fontWeight: '900',
  },
  successSub: {
    color: Palette.pillTeal,
    fontSize: 12,
    fontWeight: '700',
  },
  timelineHeader: {
    color: Palette.ink,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 6,
  },
  timeline: {
    gap: 6,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timelineNode: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeActive: {
    backgroundColor: Palette.emerald,
  },
  nodePending: {
    backgroundColor: Palette.sun,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    color: Palette.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  timelineTime: {
    color: Palette.muted,
    fontSize: 11,
  },
  timelineLine: {
    width: 2,
    height: 16,
    backgroundColor: Palette.line,
    marginLeft: 13,
  },
  doneBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: Palette.forest,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  doneBtnText: {
    color: Palette.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
