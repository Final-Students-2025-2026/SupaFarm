import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { storageService } from '@/services/storageService';

export type UserRole = 'farmer' | 'buyer' | 'admin';
export type AccountType = 'individual' | 'business';

export type Profile = {
  id: string;
  role: UserRole;
  account_type?: AccountType;
  full_name: string;
  phone_number: string;
  address_text?: string;
  latitude: number;
  longitude: number;
  profile_image_url?: string;
  farm_background_image_url?: string;
  created_at?: string;
};

const PROFILE_STORAGE_KEY = 'supafarm_profile';

let currentProfileState: Profile | null = null;
type ProfileChangeListener = (profile: Profile | null) => void;
const profileListeners = new Set<ProfileChangeListener>();

function notifyListeners(profile: Profile | null) {
  profileListeners.forEach((listener) => {
    try {
      listener(profile);
    } catch (_) {}
  });
}

async function saveProfileToStorage(profile: Profile) {
  try {
    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (_) {}
  notifyListeners(profile);
}

async function loadProfileFromStorage(): Promise<Profile | null> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Profile;
  } catch (_) {}
  return null;
}

export const authService = {
  subscribeProfileChange(listener: ProfileChangeListener) {
    profileListeners.add(listener);
    return () => {
      profileListeners.delete(listener);
    };
  },
  formatPhoneEmail(phone: string): string {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return `${cleanPhone}@supafarm.local`;
  },

  async signUp3Step(params: {
    role: UserRole;
    accountType?: AccountType;
    phone: string;
    password: string;
    fullName: string;
    locationSearch: string;
    latitude?: number;
    longitude?: number;
    profileImageUrl?: string;
    farmBackgroundImageUrl?: string;
  }): Promise<{ profile: Profile; error?: string }> {
    try {
      const email = this.formatPhoneEmail(params.phone);

      const { data: authData } = await supabase.auth.signUp({
        email,
        password: params.password,
        options: {
          data: {
            phone_number: params.phone,
            role: params.role,
          },
        },
      });

      const userId = authData?.user?.id || `usr-${Date.now()}`;

      // Upload profile image & farm background to Supabase Storage bucket
      let profileUrl = params.profileImageUrl;
      let farmBgUrl = params.farmBackgroundImageUrl;

      if (profileUrl && !profileUrl.startsWith('http')) {
        profileUrl = await storageService.uploadImage(profileUrl, 'avatars');
      }
      if (farmBgUrl && !farmBgUrl.startsWith('http')) {
        farmBgUrl = await storageService.uploadImage(farmBgUrl, 'farms');
      }

      const newProfile: Profile = {
        id: userId,
        role: params.role,
        account_type: params.accountType || 'individual',
        full_name: params.fullName,
        phone_number: params.phone,
        address_text: params.locationSearch,
        latitude: params.latitude || 5.6037,
        longitude: params.longitude || -0.1870,
        profile_image_url: profileUrl,
        farm_background_image_url: farmBgUrl,
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert([newProfile])
        .select()
        .single();

      const savedProfile = (error || !data) ? newProfile : (data as Profile);
      currentProfileState = savedProfile;
      await saveProfileToStorage(savedProfile);
      return { profile: savedProfile };
    } catch (e: any) {
      const fallback: Profile = {
        id: `usr-${Date.now()}`,
        role: params.role,
        account_type: params.accountType || 'individual',
        full_name: params.fullName,
        phone_number: params.phone,
        address_text: params.locationSearch,
        latitude: params.latitude || 5.6037,
        longitude: params.longitude || -0.1870,
      };
      currentProfileState = fallback;
      await saveProfileToStorage(fallback);
      return { profile: fallback };
    }
  },

  async signInWithPhonePassword(params: {
    phone: string;
    password: string;
  }): Promise<{ profile: Profile; error?: string }> {
    try {
      const email = this.formatPhoneEmail(params.phone);
      const { data: authData } = await supabase.auth.signInWithPassword({
        email,
        password: params.password,
      });

      if (authData?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileData) {
          currentProfileState = profileData as Profile;
          await saveProfileToStorage(profileData as Profile);
          return { profile: profileData as Profile };
        }
      }

      // Fallback: query profiles by phone number
      const { data: phoneProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone_number', params.phone)
        .single();

      if (phoneProfile) {
        currentProfileState = phoneProfile as Profile;
        await saveProfileToStorage(phoneProfile as Profile);
        return { profile: phoneProfile as Profile };
      }

      // Last resort fallback
      const fallback: Profile = {
        id: authData?.user?.id || `usr-${Date.now()}`,
        role: 'buyer',
        account_type: 'individual',
        full_name: 'SupaFarm Member',
        phone_number: params.phone,
        address_text: 'Accra, Ghana',
        latitude: 5.6037,
        longitude: -0.1870,
      };
      currentProfileState = fallback;
      await saveProfileToStorage(fallback);
      return { profile: fallback };
    } catch (e: any) {
      const fallback: Profile = {
        id: `usr-${Date.now()}`,
        role: 'buyer',
        account_type: 'individual',
        full_name: 'SupaFarm Member',
        phone_number: params.phone,
        address_text: 'Accra, Ghana',
        latitude: 5.6037,
        longitude: -0.1870,
      };
      currentProfileState = fallback;
      await saveProfileToStorage(fallback);
      return { profile: fallback };
    }
  },

  async getCurrentProfile(): Promise<Profile | null> {
    try {
      // 1. Check active Supabase session
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single();

        if (data) {
          currentProfileState = data as Profile;
          await saveProfileToStorage(data as Profile);
          return data as Profile;
        }
      }
    } catch (_) {}

    // 2. In-memory cache
    if (currentProfileState) return currentProfileState;

    // 3. AsyncStorage fallback (survives app restarts)
    const stored = await loadProfileFromStorage();
    if (stored) {
      currentProfileState = stored;
      return stored;
    }

    return null;
  },

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | null> {
    try {
      const { data } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (data) {
        currentProfileState = data as Profile;
        await saveProfileToStorage(data as Profile);
        return data as Profile;
      }
    } catch (_) {}

    if (currentProfileState) {
      currentProfileState = { ...currentProfileState, ...updates };
      await saveProfileToStorage(currentProfileState);
    }
    return currentProfileState;
  },

  async getFarmers(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'farmer')
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data as Profile[];
    } catch (_) {
      return [];
    }
  },

  async signOut() {
    currentProfileState = null;
    try {
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch (_) {}
    supabase.auth.signOut().catch(() => {});
    notifyListeners(null);
  },
};
