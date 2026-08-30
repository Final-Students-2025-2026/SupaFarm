import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/theme';
import { orderService, type OrderRecord } from '@/services/orderService';
import { InAppMapDirectionsModal } from '@/components/in-app-map-directions-modal';

export function OrderDetailModal({
  order,
  visible,
  onClose,
  onOrderUpdated,
  onOrderDeleted,
  viewerRole = 'buyer',
}: {
  order: OrderRecord | null;
  visible: boolean;
  onClose: () => void;
  onOrderUpdated?: (updated: OrderRecord) => void;
  onOrderDeleted?: (orderId: string) => void;
  /** The role of the person currently viewing this order. Farmers can change status;
   *  each viewer sees the OTHER party's contact info, not their own. */
  viewerRole?: 'farmer' | 'buyer' | 'admin';
}) {
  const [showDirections, setShowDirections] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!visible || !order) return null;

  const handleCallFarmer = () => {
    const defaultPhone = '+233240000000';
    Linking.openURL(`tel:${defaultPhone}`).catch(() => {
      Alert.alert('Call Farmer', `Calling ${order.farmer_name || 'Farmer'} at ${order.farmer_location || 'Farm'}`);
    });
  };

  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  const deliveryModeLabel =
    order.delivery_mode === 'self_pickup'
      ? 'Self Pick-up (Farm Site)'
      : order.delivery_mode === 'seller_delivery'
      ? 'Seller-Arranged Transport'
      : 'Platform-Managed (SupaFarm GPS)';

  const handleUpdateStatus = async (newStatus: OrderRecord['status']) => {
    if (updatingStatus || newStatus === order.status) return;
    setUpdatingStatus(true);
    const res = await orderService.updateOrderStatus(order.id, newStatus);
    setUpdatingStatus(false);
    if (res.success && res.order && onOrderUpdated) {
      onOrderUpdated(res.order);
    }
  };

  const handleDeleteOrder = () => {
    Alert.alert(
      'Delete Order Record',
      `Are you sure you want to delete order #${order.id}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            await orderService.deleteOrder(order.id);
            setDeleting(false);
            if (onOrderDeleted) onOrderDeleted(order.id);
            onClose();
          },
        },
      ]
    );
  };

  const statuses: Array<{ key: OrderRecord['status']; label: string }> = [
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'in_delivery', label: 'In Delivery' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const handleCallBuyer = () => {
    const rawPhone = order.buyer_phone ? order.buyer_phone.replace(/[^0-9+]/g, '') : '+233240000000';
    Linking.openURL(`tel:${rawPhone}`).catch(() => {
      Alert.alert('Call Buyer', `Calling ${order.buyer_name || 'Buyer'} at ${order.buyer_phone || '+233 24 000 0000'}`);
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons name="package-variant-closed" size={22} color={Palette.emerald} />
              <Text style={styles.headerTitle}>Order #{order.id}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={Palette.ink} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Status Banner */}
            <View style={styles.statusCard}>
              <View style={styles.statusBadge}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={Palette.forestDark} />
                <Text style={styles.statusText}>
                  STATUS: {String(order.status ?? 'pending').toUpperCase().replace('_', ' ')}
                </Text>
              </View>
              <Text style={styles.orderDate}>{formattedDate}</Text>
            </View>

            {/* Status Selector */}
            <View style={styles.sectionCard}>
              <View style={styles.statusHeaderRow}>
                <Text style={styles.sectionHeader}>UPDATE ORDER STATUS</Text>
                {updatingStatus && <ActivityIndicator size="small" color={Palette.emerald} />}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusRow}>
                {statuses.map((s) => {
                  const isActive = order.status === s.key;
                  return (
                    <Pressable
                      key={s.key}
                      onPress={() => handleUpdateStatus(s.key)}
                      style={[styles.statusChip, isActive && styles.statusChipActive]}>
                      <Text style={[styles.statusChipText, isActive && styles.statusChipTextActive]}>
                        {isActive ? `✓ ${s.label}` : s.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Produce Summary */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>PRODUCE & PAYMENT</Text>

              <View style={styles.itemRow}>
                <View style={styles.itemIcon}>
                  <MaterialCommunityIcons name="sprout" size={24} color={Palette.emerald} />
                </View>
                <View style={styles.itemMeta}>
                  <Text style={styles.itemName}>{order.product_name || 'Fresh Agricultural Produce'}</Text>
                  <Text style={styles.itemSub}>Payment Method: Cash on Delivery (COD)</Text>
                </View>
                <Text style={styles.itemPrice}>
                  GH₵ {Number(order.amount_ghc || 0).toFixed(2)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailGrid}>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Delivery Mode</Text>
                  <Text style={styles.detailVal}>{deliveryModeLabel}</Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Payment Status</Text>
                  <Text style={styles.detailVal}>Pay on Receipt (COD)</Text>
                </View>
              </View>
            </View>

            {/* Seller & Farm Details */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>SELLER / FARM DETAILS</Text>
              <View style={styles.personRow}>
                <View style={styles.personAvatar}>
                  <MaterialCommunityIcons name="account-tie" size={22} color={Palette.forest} />
                </View>
                <View style={styles.personCopy}>
                  <Text style={styles.personName}>{order.farmer_name || 'Verified SupaFarm Grower'}</Text>
                  <Text style={styles.personSub}>
                    <MaterialCommunityIcons name="map-marker" size={12} color={Palette.emerald} />
                    {' '}{order.farmer_location || 'Farm Site, Ghana'}
                  </Text>
                </View>
                <Pressable onPress={handleCallFarmer} style={styles.actionBtn}>
                  <MaterialCommunityIcons name="phone" size={16} color={Palette.white} />
                  <Text style={styles.actionBtnText}>Call</Text>
                </Pressable>
              </View>
            </View>

            {/* Buyer & Delivery Address */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>DELIVERY DESTINATION (BUYER)</Text>
              <View style={styles.personRow}>
                <View style={[styles.personAvatar, { backgroundColor: Palette.paleMint }]}>
                  <MaterialCommunityIcons name="account-box" size={22} color={Palette.emerald} />
                </View>
                <View style={styles.personCopy}>
                  <Text style={styles.personName}>
                    {order.buyer_name || (order.buyer_id ? 'Registered Account Buyer' : 'Guest Buyer')}
                  </Text>
                  {order.buyer_phone ? (
                    <Text style={styles.personPhone}>
                      <MaterialCommunityIcons name="phone-outline" size={11} color={Palette.forest} />
                      {' '}{order.buyer_phone}
                    </Text>
                  ) : null}
                  <Text style={styles.personSub}>
                    <MaterialCommunityIcons name="map-marker" size={12} color={Palette.tomato} />
                    {' '}{order.buyer_location || 'Accra, Ghana'}
                  </Text>
                </View>
                <View style={{ gap: 6 }}>
                  <Pressable onPress={handleCallBuyer} style={styles.actionBtn}>
                    <MaterialCommunityIcons name="phone" size={14} color={Palette.white} />
                    <Text style={styles.actionBtnText}>Call Buyer</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setShowDirections(true)}
                    style={styles.dirBtn}>
                    <MaterialCommunityIcons name="navigation-variant" size={14} color={Palette.forest} />
                    <Text style={styles.dirBtnText}>Directions</Text>
                  </Pressable>
                </View>
              </View>
            </View>

          {/* Timeline */}
          <View style={styles.timelineCard}>
            <Text style={styles.sectionHeader}>DELIVERY TIMELINE</Text>
            <View style={styles.timelineItem}>
              <MaterialCommunityIcons name="check-circle" size={18} color={Palette.emerald} />
              <View style={styles.timelineTextWrap}>
                <Text style={styles.timelineTitle}>Order Placed Successfully</Text>
                <Text style={styles.timelineTime}>{formattedDate}</Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <MaterialCommunityIcons name="clock-outline" size={18} color={Palette.sun} />
              <View style={styles.timelineTextWrap}>
                <Text style={styles.timelineTitle}>Current Status: {String(order.status ?? 'pending').replace('_', ' ')}</Text>
                <Text style={styles.timelineTime}>Cash on delivery upon arrival</Text>
              </View>
            </View>
          </View>

          {/* Actions: Delete & Close */}
          <View style={styles.footerActionRow}>
            <Pressable
              onPress={handleDeleteOrder}
              disabled={deleting}
              style={[styles.deleteBtn, deleting && { opacity: 0.6 }]}>
              {deleting ? (
                <ActivityIndicator size="small" color={Palette.tomato} />
              ) : (
                <>
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color={Palette.tomato} />
                  <Text style={styles.deleteBtnText}>Delete Order</Text>
                </>
              )}
            </Pressable>

            <Pressable onPress={onClose} style={styles.doneBtn}>
              <Text style={styles.doneBtnText}>Close</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>

    <InAppMapDirectionsModal
      visible={showDirections}
      onClose={() => setShowDirections(false)}
      originLocation={order.farmer_location || 'Farm Location'}
      originName={order.farmer_name || 'Farmer'}
      destinationLocation={order.buyer_location || 'Delivery Address'}
      destinationName="Buyer Address"
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
    gap: 14,
  },
  statusCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: Palette.emeraldLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    color: Palette.forestDark,
    fontSize: 12,
    fontWeight: '900',
  },
  orderDate: {
    color: Palette.pillTeal,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
    gap: 10,
  },
  sectionHeader: {
    color: Palette.muted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Palette.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemMeta: {
    flex: 1,
  },
  itemName: {
    color: Palette.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  itemSub: {
    color: Palette.muted,
    fontSize: 11,
    marginTop: 2,
  },
  itemPrice: {
    color: Palette.forestDark,
    fontSize: 16,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: Palette.line,
    marginVertical: 4,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    color: Palette.muted,
    fontSize: 10,
  },
  detailVal: {
    color: Palette.ink,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  personAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personCopy: {
    flex: 1,
  },
  personName: {
    color: Palette.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  personSub: {
    color: Palette.muted,
    fontSize: 11,
    marginTop: 2,
  },
  personPhone: {
    color: Palette.forest,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: Palette.emerald,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    color: Palette.white,
    fontSize: 12,
    fontWeight: '800',
  },
  dirBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: Palette.mint,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dirBtnText: {
    color: Palette.forest,
    fontSize: 12,
    fontWeight: '800',
  },
  timelineCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: Palette.canvas,
    borderWidth: 1,
    borderColor: Palette.line,
    gap: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  timelineTextWrap: {
    flex: 1,
  },
  timelineTitle: {
    color: Palette.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  timelineTime: {
    color: Palette.muted,
    fontSize: 10,
    marginTop: 1,
  },
  doneBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: Palette.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: Palette.white,
    fontSize: 14,
    fontWeight: '800',
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusRow: {
    gap: 8,
    paddingVertical: 4,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Palette.canvas,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  statusChipActive: {
    backgroundColor: Palette.forest,
    borderColor: Palette.forest,
  },
  statusChipText: {
    color: Palette.ink,
    fontSize: 11,
    fontWeight: '700',
  },
  statusChipTextActive: {
    color: Palette.white,
  },
  footerActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  deleteBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  deleteBtnText: {
    color: Palette.tomato,
    fontSize: 13,
    fontWeight: '800',
  },
});
