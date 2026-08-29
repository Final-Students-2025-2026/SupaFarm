import { supabase } from '@/lib/supabase';
import { type ImageSource } from 'expo-image';

export type Greenhouse = {
  id: string;
  farmer_id?: string;
  name: string;
  location: string;
  plants_count: number;
  wind_speed: string;
  humidity: string;
  plant_types_count: number;
  lighting_active: boolean;
  temp_celsius: number;
  watering_ml: number;
  ventilation_speed: number;
  height_cm: number;
  moisture_percent: number;
  fertilizer_type: string;
  age_months: number;
  image?: ImageSource;
};

export type TelemetryPoint = {
  day: string;
  val: number;
  peak?: boolean;
};

export type PlantRecord = {
  id: string;
  name: string;
  stage: 'Reproductive' | 'Maturation' | 'Vegetative' | 'Seedling';
  count: string;
  price: string;
  image: ImageSource;
};

export const greenhouseService = {
  async getGreenhouses(): Promise<Greenhouse[]> {
    try {
      const { data, error } = await supabase.from('greenhouses').select('*');
      if (data && data.length > 0 && !error) {
        return data.map((item) => ({
          ...item,
          image: require('@/assets/images/market/vegetables.jpg'),
        }));
      }
    } catch (e) {}

    return [];
  },

  async updateControlState(
    id: string,
    controls: Partial<Pick<Greenhouse, 'lighting_active' | 'temp_celsius' | 'watering_ml' | 'ventilation_speed'>>
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from('greenhouses').update(controls).eq('id', id);
      if (!error) return true;
    } catch (e) {}

    return true;
  },

  async getHumidityHistory(greenhouseId: string): Promise<TelemetryPoint[]> {
    try {
      const { data, error } = await supabase
        .from('greenhouse_telemetry')
        .select('day_label, humidity_val, is_peak')
        .eq('greenhouse_id', greenhouseId);

      if (data && data.length > 0 && !error) {
        return data.map((d) => ({
          day: d.day_label,
          val: d.humidity_val,
          peak: d.is_peak,
        }));
      }
    } catch (e) {}

    return [];
  },

  async getPlants(greenhouseId: string): Promise<PlantRecord[]> {
    try {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('greenhouse_id', greenhouseId);

      if (data && data.length > 0 && !error) {
        return data.map((p) => ({
          id: p.id,
          name: p.name,
          stage: p.stage,
          count: p.count,
          price: p.price,
          image: p.name.toLowerCase().includes('tomato')
            ? require('@/assets/images/market/tomatoes.jpg')
            : p.name.toLowerCase().includes('corn') || p.name.toLowerCase().includes('maize')
            ? require('@/assets/images/market/maize.jpg')
            : require('@/assets/images/market/plantain.jpg'),
        }));
      }
    } catch (e) {}

    return [];
  },

  async createGreenhouse(gh: Partial<Greenhouse>): Promise<boolean> {
    try {
      const { error } = await supabase.from('greenhouses').insert([gh]);
      if (!error) return true;
    } catch (e) {}
    return true;
  },
};
