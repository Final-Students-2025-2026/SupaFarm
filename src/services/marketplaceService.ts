import { supabase } from '@/lib/supabase';
import { storageService } from '@/services/storageService';
import { type Product } from '@/components/marketplace-ui';

export type MarketPriceItem = {
  product: string;
  market: string;
  price: string;
  change: string;
  up: boolean;
};

export type CropListingRecord = {
  id: string;
  farmer_id: string;
  title: string;
  crop_type: string;
  unit: string;
  price_ghc: number;
  description?: string;
  badge?: string;
  images?: string[];
  latitude?: number;
  longitude?: number;
  status: 'available' | 'sold_out' | 'inactive';
  created_at?: string;
};

export const marketplaceService = {
  async getCropListings(category?: string, query?: string): Promise<Product[]> {
    try {
      let req = supabase.from('crop_listings').select('*, profiles(full_name, address_text)');
      if (category && category !== 'All') {
        req = req.eq('crop_type', category);
      }
      if (query) {
        req = req.ilike('title', `%${query}%`);
      }

      const { data, error } = await req.eq('status', 'available').order('created_at', { ascending: false });

      if (data && data.length > 0 && !error) {
        return data.map((item) => ({
          id: item.id,
          name: item.title,
          seller: item.profiles?.full_name || 'Ghanaian Farmer',
          location: item.profiles?.address_text || 'Ghana',
          price: `GH₵ ${item.price_ghc}`,
          unit: item.unit || 'per bag',
          rating: '5.0',
          badge: item.badge || item.crop_type || 'Fresh Harvest',
          image: item.images?.[0]
            ? { uri: item.images[0] }
            : item.title.toLowerCase().includes('tomato')
            ? require('@/assets/images/market/tomatoes.jpg')
            : item.title.toLowerCase().includes('maize') || item.title.toLowerCase().includes('corn')
            ? require('@/assets/images/market/maize.jpg')
            : item.title.toLowerCase().includes('plantain')
            ? require('@/assets/images/market/plantain.jpg')
            : require('@/assets/images/market/avocado.jpg'),
        }));
      }
    } catch (e) {}

    return [];
  },

  async getMyListings(farmerId: string): Promise<CropListingRecord[]> {
    try {
      const { data, error } = await supabase
        .from('crop_listings')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });

      if (!error && data) return data as CropListingRecord[];
    } catch (_) {}
    return [];
  },

  async getMarketPrices(region?: string): Promise<MarketPriceItem[]> {
    try {
      let req = supabase.from('market_intelligence').select('*');
      if (region) {
        req = req.eq('region', region);
      }

      const { data, error } = await req;
      if (data && data.length > 0 && !error) {
        return data.map((d) => ({
          product: d.crop_name,
          market: d.market_location,
          price: `GH₵ ${d.price_ghc}`,
          change: d.price_change,
          up: d.is_up,
        }));
      }
    } catch (e) {}

    return [];
  },

  async createCropListing(newListing: {
    farmerId: string;
    title: string;
    cropType: string;
    unit: string;
    priceGhc: number;
    description?: string;
    badge?: string;
    imageUri?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<CropListingRecord | null> {
    try {
      // Upload crop image to Supabase Storage if a local URI was provided
      let images: string[] = [];
      if (newListing.imageUri) {
        const uploadedUrl = await storageService.uploadImage(newListing.imageUri, 'crops');
        if (uploadedUrl) images = [uploadedUrl];
      }

      const { data, error } = await supabase
        .from('crop_listings')
        .insert([{
          farmer_id: newListing.farmerId,
          title: newListing.title,
          crop_type: newListing.cropType,
          unit: newListing.unit,
          price_ghc: newListing.priceGhc,
          description: newListing.description,
          badge: newListing.badge || newListing.cropType || 'Fresh Harvest',
          images,
          latitude: newListing.latitude || 5.6037,
          longitude: newListing.longitude || -0.1870,
          status: 'available',
        }])
        .select()
        .single();

      if (!error && data) return data as CropListingRecord;
    } catch (_) {}
    return null;
  },

  async updateCropListing(
    id: string,
    updates: Partial<Pick<CropListingRecord, 'title' | 'price_ghc' | 'unit' | 'description' | 'badge' | 'status'>>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('crop_listings')
        .update(updates)
        .eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Update failed' };
    }
  },

  async deleteCropListing(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('crop_listings')
        .delete()
        .eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Delete failed' };
    }
  },
};
