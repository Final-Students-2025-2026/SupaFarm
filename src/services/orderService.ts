import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { type DeliveryMode } from '@/components/delivery-tracking-modal';

export type OrderRecord = {
  id: string;
  listing_id?: string;
  buyer_id?: string;
  farmer_id?: string;
  delivery_mode: DeliveryMode;
  payment_method: 'cash_on_delivery';
  status: 'pending' | 'confirmed' | 'in_delivery' | 'completed' | 'cancelled';
  amount_ghc: number;
  created_at: string;
  product_name?: string;
  farmer_name?: string;
  farmer_location?: string;
  buyer_location?: string;
  buyer_name?: string;
  buyer_phone?: string;
};

const LOCAL_ORDERS_KEY = 'supafarm_local_orders';

async function getLocalOrders(): Promise<OrderRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_ORDERS_KEY);
    if (raw) return JSON.parse(raw) as OrderRecord[];
  } catch (_) {}
  return [];
}

async function saveLocalOrder(order: OrderRecord): Promise<void> {
  try {
    const existing = await getLocalOrders();
    const filtered = existing.filter((o) => o.id !== order.id);
    const updated = [order, ...filtered];
    await AsyncStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
  } catch (_) {}
}

export const orderService = {
  async createOrder(payload: {
    listingId?: string;
    buyerId?: string;
    farmerId?: string;
    deliveryMode: DeliveryMode;
    amountGhc: number;
    productName?: string;
    farmerName?: string;
    farmerLocation?: string;
    buyerLocation?: string;
    buyerName?: string;
    buyerPhone?: string;
  }): Promise<{ order: OrderRecord; error?: string }> {
    const generatedId = `SF-GH-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: OrderRecord = {
      id: generatedId,
      listing_id: payload.listingId,
      buyer_id: payload.buyerId,
      farmer_id: payload.farmerId,
      delivery_mode: payload.deliveryMode,
      payment_method: 'cash_on_delivery',
      status: 'pending',
      amount_ghc: payload.amountGhc,
      created_at: new Date().toISOString(),
      product_name: payload.productName,
      farmer_name: payload.farmerName,
      farmer_location: payload.farmerLocation,
      buyer_location: payload.buyerLocation,
      buyer_name: payload.buyerName,
      buyer_phone: payload.buyerPhone,
    };

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          listing_id: payload.listingId,
          buyer_id: payload.buyerId,
          farmer_id: payload.farmerId,
          delivery_mode: payload.deliveryMode,
          payment_method: 'cash_on_delivery',
          status: 'pending',
          amount_ghc: payload.amountGhc,
        }])
        .select()
        .single();

      if (data && !error) {
        const savedOrder: OrderRecord = {
          ...newOrder,
          id: data.id || newOrder.id,
          created_at: data.created_at || newOrder.created_at,
        };
        await saveLocalOrder(savedOrder);
        return { order: savedOrder };
      }
    } catch (e) {}

    await saveLocalOrder(newOrder);
    return { order: newOrder };
  },

  async getUserOrders(userId?: string): Promise<OrderRecord[]> {
    let supabaseOrders: OrderRecord[] = [];
    try {
      let query = supabase.from('orders').select('*');
      if (userId) {
        query = query.or(`buyer_id.eq.${userId},farmer_id.eq.${userId}`);
      }
      const { data, error } = await query.order('created_at', { ascending: false });

      if (data && !error) {
        supabaseOrders = data as OrderRecord[];
      }
    } catch (e) {}

    const localOrders = await getLocalOrders();

    // Merge supabase & local orders, deduplicating by ID
    const mergedMap = new Map<string, OrderRecord>();
    for (const ord of [...supabaseOrders, ...localOrders]) {
      if (ord && ord.id && !mergedMap.has(ord.id)) {
        mergedMap.set(ord.id, ord);
      }
    }

    const mergedList = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return mergedList;
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderRecord['status']
  ): Promise<{ success: boolean; order?: OrderRecord; error?: string }> {
    try {
      // 1. Update local storage
      const local = await getLocalOrders();
      let updatedOrder: OrderRecord | undefined;
      const updatedLocal = local.map((o) => {
        if (o.id === orderId) {
          updatedOrder = { ...o, status };
          return updatedOrder;
        }
        return o;
      });
      await AsyncStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updatedLocal));

      // 2. Update Supabase
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (data && !error) {
        return { success: true, order: { ...(updatedOrder || (data as OrderRecord)), status } };
      }

      if (updatedOrder) {
        return { success: true, order: updatedOrder };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to update order status' };
    }
  },

  async deleteOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Delete from local storage
      const local = await getLocalOrders();
      const filtered = local.filter((o) => o.id !== orderId);
      await AsyncStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(filtered));

      // 2. Delete from Supabase
      await supabase.from('orders').delete().eq('id', orderId);

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to delete order' };
    }
  },

  subscribeToOrderUpdates(orderId: string, onUpdate: (status: string) => void) {
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          if (payload.new && payload.new.status) {
            onUpdate(payload.new.status);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
