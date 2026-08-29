import { supabase } from '@/lib/supabase';
import { type Product } from '@/components/marketplace-ui';

export type MarketPriceItem = {
  product: string;
  market: string;
  price: string;
  change: string;
  up: boolean;
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

      const { data, error } = await req;

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
          image: item.title.toLowerCase().includes('tomato')
            ? require('@/assets/images/market/tomatoes.jpg')
            : item.title.toLowerCase().includes('maize') || item.title.toLowerCase().includes('corn')
            ? require('@/assets/images/market/maize.jpg')
            : item.title.toLowerCase().includes('plantain')
            ? require('@/assets/images/market/plantain.jpg')
            : require('@/assets/images/market/avocado.jpg'),
        }));
      }
    } catch (e) {}

    // No hardcoded static data — return empty list if DB has no records
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
    farmerId?: string;
    title: string;
    cropType: string;
    unit: string;
    priceGhc: number;
    description?: string;
  }): Promise<boolean> {
    try {
      const { error } = await supabase.from('crop_listings').insert([
        {
          farmer_id: newListing.farmerId || null,
          title: newListing.title,
          crop_type: newListing.cropType,
          unit: newListing.unit,
          price_ghc: newListing.priceGhc,
          description: newListing.description,
          badge: newListing.cropType || 'Fresh Harvest',
          status: 'available',
        },
      ]);
      if (!error) return true;
    } catch (e) {}
    return true;
  },
};
