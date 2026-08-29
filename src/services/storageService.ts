import { supabase } from '@/lib/supabase';

function readUriAsArrayBuffer(fileUri: string): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (xhr.response) {
        resolve(xhr.response);
      } else {
        reject(new Error('Empty response ArrayBuffer'));
      }
    };
    xhr.onerror = function () {
      reject(new Error('Failed to read file URI as ArrayBuffer'));
    };
    xhr.responseType = 'arraybuffer';
    xhr.open('GET', fileUri, true);
    xhr.send(null);
  });
}

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

      // Read file URI as ArrayBuffer (avoids 0-byte Blob issue in React Native)
      const arrayBuffer = await readUriAsArrayBuffer(fileUri);

      const fileExt = fileUri.split('.').pop()?.split('?')[0] || 'jpg';
      const cleanExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, '');
      const mimeType = cleanExt === 'png' ? 'image/png' : cleanExt === 'webp' ? 'image/webp' : 'image/jpeg';
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2)}.${cleanExt || 'jpg'}`;

      const { data, error } = await supabase.storage
        .from('supafarm-images')
        .upload(fileName, arrayBuffer, {
          contentType: mimeType,
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
