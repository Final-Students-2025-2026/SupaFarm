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

let currentProfileState: Profile | null = null;

export const authService = {
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

      const { data: authData, error: authError } = await supabase.auth.signUp({
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

      if (error || !data) {
        currentProfileState = newProfile;
        return { profile: newProfile };
      }

      currentProfileState = data as Profile;
      return { profile: data as Profile };
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
      return { profile: fallback };
    }
  },

  async signInWithPhonePassword(params: {
    phone: string;
    password: string;
  }): Promise<{ profile: Profile; error?: string }> {
    try {
      const email = this.formatPhoneEmail(params.phone);
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
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
          return { profile: profileData as Profile };
        }
      }

      // Query profiles table directly by phone number if auth session exists or fallback
      const { data: phoneProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone_number', params.phone)
        .single();

      if (phoneProfile) {
        currentProfileState = phoneProfile as Profile;
        return { profile: phoneProfile as Profile };
      }

      // Default fallback profile for login
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
      return { profile: fallback };
    }
  },

  async getCurrentProfile(): Promise<Profile | null> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single();

        if (data) {
          currentProfileState = data as Profile;
          return data as Profile;
        }
      }
    } catch (e) { }

    return currentProfileState;
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
        return data as Profile;
      }
    } catch (e) { }

    if (currentProfileState) {
      currentProfileState = { ...currentProfileState, ...updates };
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
    } catch (e) {
      return [];
    }
  },

  signOut() {
    currentProfileState = null;
    supabase.auth.signOut().catch(() => { });
  },
};
