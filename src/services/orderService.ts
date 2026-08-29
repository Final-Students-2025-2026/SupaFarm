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
};

export const orderService = {
  async createOrder(payload: {
    listingId?: string;
    buyerId?: string;
    farmerId?: string;
    deliveryMode: DeliveryMode;
    amountGhc: number;
  }): Promise<{ order: OrderRecord; error?: string }> {
    try {
      const newOrder = {
        listing_id: payload.listingId,
        buyer_id: payload.buyerId,
        farmer_id: payload.farmerId,
        delivery_mode: payload.deliveryMode,
        payment_method: 'cash_on_delivery',
        status: 'pending',
        amount_ghc: payload.amountGhc,
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([newOrder])
        .select()
        .single();

      if (data && !error) {
        return { order: data as OrderRecord };
      }
    } catch (e) {}

    const fallback: OrderRecord = {
      id: `SF-GH-${Math.floor(10000 + Math.random() * 90000)}`,
      delivery_mode: payload.deliveryMode,
      payment_method: 'cash_on_delivery',
      status: 'pending',
      amount_ghc: payload.amountGhc,
      created_at: new Date().toISOString(),
    };
    return { order: fallback };
  },

  async getUserOrders(userId?: string): Promise<OrderRecord[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0 && !error) {
        return data as OrderRecord[];
      }
    } catch (e) {}

    return [];
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
