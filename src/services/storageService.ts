import { supabase } from '@/lib/supabase';

export const storageService = {
  /**
   * Uploads an image file URI (from expo-image-picker) to Supabase Storage bucket 'supafarm-images'
   * and returns the public HTTP URL for DB persistence.
   */
  async uploadImage(
    fileUri: string,
    folder: 'avatars' | 'farms' | 'crops' = 'crops'
  ): Promise<string> {
    try {
      if (!fileUri || fileUri.startsWith('http://') || fileUri.startsWith('https://')) {
        return fileUri;
      }

      // Read file blob / arrayBuffer
      const response = await fetch(fileUri);
      const blob = await response.blob();

      const fileExt = fileUri.split('.').pop() || 'jpg';
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('supafarm-images')
        .upload(fileName, blob, {
          contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
          upsert: true,
        });

      if (error || !data?.path) {
        return fileUri;
      }

      // Retrieve public URL from Supabase CDN
      const { data: publicUrlData } = supabase.storage
        .from('supafarm-images')
        .getPublicUrl(data.path);

      return publicUrlData?.publicUrl || fileUri;
    } catch (e) {
      return fileUri;
    }
  },
};
