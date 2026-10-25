import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Palette } from '@/constants/theme';
import { authService, type UserRole, type AccountType } from '@/services/authService';
import { GhanaLocationPicker, type GhanaLocation } from '@/components/ghana-location-picker';
import * as ImagePicker from 'expo-image-picker';

export type { UserRole, AccountType };

export function AuthModal({
  visible,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: (user: {
    id: string;
    role: UserRole;
    accountType?: AccountType;
    phone: string;
    fullName: string;
    location: string;
    latitude?: number;
    longitude?: number;
    profileImageUrl?: string;
    farmBackgroundImageUrl?: string;
  }) => void;
}) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<UserRole>('farmer');
  const [accountType, setAccountType] = useState<AccountType>('individual');

  // Form Fields
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [addressText, setAddressText] = useState('');
  const [latitude, setLatitude] = useState<number>(5.6037);
  const [longitude, setLongitude] = useState<number>(-0.1870);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [farmBackgroundImageUrl, setFarmBackgroundImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelectLocation = (loc: GhanaLocation) => {
    setLocationSearch(loc.addressText);
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
  };

  const pickImage = async (type: 'profile' | 'farm') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        if (type === 'profile') {
          setProfileImageUrl(result.assets[0].uri);
        } else {
          setFarmBackgroundImageUrl(result.assets[0].uri);
        }
      }
    } catch (e) {}
  };

  const handleLogin = async () => {
    if (!phone || !password) return;
    setLoading(true);
    const { profile } = await authService.signInWithPhonePassword({ phone, password });
    setLoading(false);
    onSuccess({
      id: profile.id,
      role: profile.role,
      accountType: profile.account_type,
      phone: profile.phone_number,
      fullName: profile.full_name,
      location: profile.address_text || 'Ghana',
      latitude: profile.latitude,
      longitude: profile.longitude,
      profileImageUrl: profile.profile_image_url,
      farmBackgroundImageUrl: profile.farm_background_image_url,
    });
    onClose();
  };

  const handleNextStep1 = () => {
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (!phone || !password) return;
    setStep(3);
  };

  const handleCompleteSignUp = async () => {
    if (!fullName.trim()) {
      Alert.alert('Name Required', 'Please enter your full name before signing up.');
      return;
    }
    setLoading(true);
    const { profile } = await authService.signUp3Step({
      role,
      accountType,
      phone: phone || '',
      password: password || '123456',
      fullName: fullName.trim(),
      locationSearch: locationSearch || addressText || 'Ghana',
      latitude,
      longitude,
      profileImageUrl,
      farmBackgroundImageUrl,
    });
    setLoading(false);
    onSuccess({
      id: profile.id,
      role: profile.role,
      accountType: profile.account_type,
      phone: profile.phone_number,
      fullName: profile.full_name,
      location: profile.address_text || 'Ghana',
      latitude: profile.latitude,
      longitude: profile.longitude,
      profileImageUrl: profile.profile_image_url,
      farmBackgroundImageUrl: profile.farm_background_image_url,
    });
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}>
        <View style={styles.container}>
          {/* Top Bar with Mode Tabs */}
          <View style={styles.header}>
            <View style={styles.modeTabs}>
              <Pressable
                onPress={() => setAuthMode('login')}
                style={[styles.modeTab, authMode === 'login' && styles.modeTabActive]}>
                <Text style={[styles.modeTabText, authMode === 'login' && styles.modeTabTextActive]}>
                  Log In
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setAuthMode('signup')}
                style={[styles.modeTab, authMode === 'signup' && styles.modeTabActive]}>
                <Text style={[styles.modeTabText, authMode === 'signup' && styles.modeTabTextActive]}>
                  Sign Up
                </Text>
              </Pressable>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={Palette.ink} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollBody}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {authMode === 'login' ? (
              /* LOG IN MODE */
              <View style={styles.stepContainer}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Enter your phone number and password to log in to SupaFarm.</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>Ghana Phone Number</Text>
                  <View style={styles.inputWrap}>
                    <MaterialCommunityIcons name="phone" size={20} color={Palette.muted} />
                    <TextInput
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="+233 24 000 0000"
                      placeholderTextColor="#8A958D"
                      keyboardType="phone-pad"
                      style={styles.textInput}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>Password</Text>
                  <View style={styles.inputWrap}>
                    <MaterialCommunityIcons name="lock-outline" size={20} color={Palette.muted} />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      placeholderTextColor="#8A958D"
                      secureTextEntry
                      style={styles.textInput}
                    />
                  </View>
                </View>

                <Pressable
                  onPress={handleLogin}
                  style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                  disabled={loading}>
                  {loading
                    ? <ActivityIndicator color={Palette.white} size="small" />
                    : <MaterialCommunityIcons name="login" size={18} color={Palette.white} />}
                  <Text style={styles.primaryBtnText}>{loading ? 'Logging In…' : 'Log In'}</Text>
                </Pressable>

                <Pressable onPress={() => setAuthMode('signup')} style={styles.switchModeWrap}>
                  <Text style={styles.switchModeText}>
                    Don't have an account? <Text style={styles.switchModeBold}>Sign Up</Text>
                  </Text>
                </Pressable>
              </View>
            ) : (
              /* SIGN UP MODE */
              <>
                <View style={styles.stepIndicator}>
                  <Text style={styles.stepText}>Step {step} of 3</Text>
                </View>

                {step === 1 && (
                  <View style={styles.stepContainer}>
                <Text style={styles.title}>Join SupaFarm</Text>
                <Text style={styles.subtitle}>Select your primary account role in the Ghanaian crop market.</Text>

                <Text style={styles.fieldLabel}>I am signing up as:</Text>

                <Pressable
                  onPress={() => setRole('farmer')}
                  style={[styles.roleCard, role === 'farmer' && styles.roleCardActive]}>
                  <View style={[styles.roleIcon, role === 'farmer' && styles.roleIconActive]}>
                    <MaterialCommunityIcons name="tractor" size={26} color={role === 'farmer' ? Palette.white : Palette.forest} />
                  </View>
                  <View style={styles.roleInfo}>
                    <Text style={[styles.roleTitle, role === 'farmer' && styles.textForest]}>Farmer / Seller</Text>
                    <Text style={styles.roleDesc}>Post fresh crop listings, set prices, and receive direct buyer calls.</Text>
                  </View>
                  {role === 'farmer' && <MaterialCommunityIcons name="check-circle" size={22} color={Palette.emerald} />}
                </Pressable>

                <Pressable
                  onPress={() => setRole('buyer')}
                  style={[styles.roleCard, role === 'buyer' && styles.roleCardActive]}>
                  <View style={[styles.roleIcon, role === 'buyer' && styles.roleIconActive]}>
                    <MaterialCommunityIcons name="basket-outline" size={26} color={role === 'buyer' ? Palette.white : Palette.forest} />
                  </View>
                  <View style={styles.roleInfo}>
                    <Text style={[styles.roleTitle, role === 'buyer' && styles.textForest]}>Crop Buyer</Text>
                    <Text style={styles.roleDesc}>Browse verified farm listings, call farmers directly, arrange delivery.</Text>
                  </View>
                  {role === 'buyer' && <MaterialCommunityIcons name="check-circle" size={22} color={Palette.emerald} />}
                </Pressable>

                {role === 'buyer' && (
                  <View style={styles.accountTypeSection}>
                    <Text style={styles.fieldLabel}>Buyer Account Type:</Text>
                    <View style={styles.rowTypes}>
                      <Pressable
                        onPress={() => setAccountType('individual')}
                        style={[styles.typeChip, accountType === 'individual' && styles.typeChipActive]}>
                        <Text style={[styles.typeText, accountType === 'individual' && styles.typeTextActive]}>Individual</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setAccountType('business')}
                        style={[styles.typeChip, accountType === 'business' && styles.typeChipActive]}>
                        <Text style={[styles.typeText, accountType === 'business' && styles.typeTextActive]}>Business (Restaurant/Hotel)</Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                <Pressable onPress={handleNextStep1} style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>Continue to Auth</Text>
                  <MaterialCommunityIcons name="arrow-right" size={18} color={Palette.white} />
                </Pressable>
              </View>
            )}

            {step === 2 && (
              <View style={styles.stepContainer}>
                <Text style={styles.title}>Phone Authentication</Text>
                <Text style={styles.subtitle}>Enter your phone number and password to secure your SupaFarm profile.</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>Ghana Phone Number</Text>
                  <View style={styles.inputWrap}>
                    <MaterialCommunityIcons name="phone" size={20} color={Palette.muted} />
                    <TextInput
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="+233 24 000 0000"
                      placeholderTextColor="#8A958D"
                      keyboardType="phone-pad"
                      style={styles.textInput}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>Password</Text>
                  <View style={styles.inputWrap}>
                    <MaterialCommunityIcons name="lock-outline" size={20} color={Palette.muted} />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      placeholderTextColor="#8A958D"
                      secureTextEntry
                      style={styles.textInput}
                    />
                  </View>
                </View>

                <View style={styles.btnRow}>
                  <Pressable onPress={() => setStep(1)} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>Back</Text>
                  </Pressable>
                  <Pressable onPress={handleNextStep2} style={[styles.primaryBtn, { flex: 1 }]}>
                    <Text style={styles.primaryBtnText}>Create Account</Text>
                    <MaterialCommunityIcons name="arrow-right" size={18} color={Palette.white} />
                  </Pressable>
                </View>
              </View>
            )}

            {step === 3 && (
              <View style={styles.stepContainer}>
                <Text style={styles.title}>Complete Profile</Text>
                <Text style={styles.subtitle}>
                  {role === 'farmer' ? 'Add your farm location & profile details' : 'Set your delivery location & contact name'}
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>{role === 'farmer' ? 'Farm / Business Name' : 'Full Name'}</Text>
                  <View style={styles.inputWrap}>
                    <MaterialCommunityIcons name="account-circle-outline" size={20} color={Palette.muted} />
                    <TextInput
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder={role === 'farmer' ? 'Enter Farm / Business Name' : 'Enter Full Name'}
                      placeholderTextColor="#8A958D"
                      style={styles.textInput}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>Search Ghana Town / Market / Farm Location</Text>
                  <GhanaLocationPicker
                    value={locationSearch}
                    onSelectLocation={handleSelectLocation}
                    placeholder="Search town, market, or farm area in Ghana..."
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>Street / Address Details</Text>
                  <View style={styles.inputWrap}>
                    <MaterialCommunityIcons name="home-map-marker" size={20} color={Palette.muted} />
                    <TextInput
                      value={addressText}
                      onChangeText={setAddressText}
                      placeholder="Street name or landmark description..."
                      placeholderTextColor="#8A958D"
                      style={styles.textInput}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>Profile Picture (Photo or URL)</Text>
                  <View style={styles.imagePickerRow}>
                    <Pressable onPress={() => pickImage('profile')} style={styles.pickImageBtn}>
                      <MaterialCommunityIcons name="image-plus" size={20} color={Palette.forest} />
                      <Text style={styles.pickImageText}>Choose Photo</Text>
                    </Pressable>
                    <TextInput
                      value={profileImageUrl}
                      onChangeText={setProfileImageUrl}
                      placeholder="Or paste image URL (https://...)"
                      placeholderTextColor="#8A958D"
                      style={[styles.textInput, styles.urlInput]}
                    />
                  </View>
                </View>

                {role === 'farmer' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.fieldLabel}>Farm Background Photo</Text>
                    <Pressable onPress={() => pickImage('farm')} style={styles.imageUploadBox}>
                      <MaterialCommunityIcons name="camera-plus-outline" size={24} color={Palette.emerald} />
                      <Text style={styles.uploadTitle}>
                        {farmBackgroundImageUrl ? 'Photo Selected ✓' : 'Upload Farm Background Photo'}
                      </Text>
                      <Text style={styles.uploadSub}>
                        {farmBackgroundImageUrl
                          ? 'Tap to change farm background image'
                          : 'Show buyers your crops & greenhouse setup'}
                      </Text>
                    </Pressable>
                    <TextInput
                      value={farmBackgroundImageUrl}
                      onChangeText={setFarmBackgroundImageUrl}
                      placeholder="Or paste farm image URL (https://...)"
                      placeholderTextColor="#8A958D"
                      style={styles.textInput}
                    />
                  </View>
                )}

                <View style={styles.btnRow}>
                  <Pressable onPress={() => setStep(2)} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>Back</Text>
                  </Pressable>
                  <Pressable onPress={handleCompleteSignUp} style={[styles.primaryBtn, { flex: 1 }]}>
                    <Text style={styles.primaryBtnText}>{loading ? 'Creating Account…' : 'Finish & Start'}</Text>
                    <MaterialCommunityIcons name="check" size={18} color={Palette.white} />
                  </Pressable>
                </View>

                <Pressable onPress={() => setAuthMode('login')} style={styles.switchModeWrap}>
                  <Text style={styles.switchModeText}>
                    Already have an account? <Text style={styles.switchModeBold}>Log In</Text>
                  </Text>
                </Pressable>
              </View>
            )}
          </>
        )}
      </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Palette.line,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: Palette.canvas,
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  modeTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
  },
  modeTabActive: {
    backgroundColor: Palette.forest,
  },
  modeTabText: {
    color: Palette.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  modeTabTextActive: {
    color: Palette.white,
    fontWeight: '900',
  },
  stepIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Palette.mint,
    alignSelf: 'flex-start',
  },
  switchModeWrap: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  switchModeText: {
    color: Palette.muted,
    fontSize: 13,
  },
  switchModeBold: {
    color: Palette.emerald,
    fontWeight: '800',
  },
  stepText: {
    color: Palette.forest,
    fontSize: 12,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    padding: 20,
  },
  stepContainer: {
    gap: 16,
  },
  title: {
    color: Palette.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: Palette.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: -8,
  },
  fieldLabel: {
    color: Palette.ink,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  roleCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: Palette.paleMint,
    borderWidth: 1.5,
    borderColor: Palette.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  roleCardActive: {
    backgroundColor: Palette.mint,
    borderColor: Palette.emerald,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Palette.mintDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconActive: {
    backgroundColor: Palette.forest,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    color: Palette.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  textForest: {
    color: Palette.forest,
  },
  roleDesc: {
    color: Palette.muted,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  accountTypeSection: {
    gap: 8,
    marginTop: 4,
  },
  rowTypes: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: 10,
  },
  typeChip: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: Palette.canvas,
    borderWidth: 1.5,
    borderColor: Palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeChipActive: {
    backgroundColor: Palette.forest,
    borderColor: Palette.forest,
  },
  typeText: {
    color: Palette.ink,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  typeTextActive: {
    color: Palette.white,
  },
  inputGroup: {
    gap: 6,
  },
  imagePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickImageBtn: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Palette.paleMint,
    borderWidth: 1,
    borderColor: Palette.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pickImageText: {
    color: Palette.forest,
    fontSize: 12,
    fontWeight: '800',
  },
  urlInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Palette.canvas,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  inputWrap: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Palette.canvas,
    borderWidth: 1,
    borderColor: Palette.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textInput: {
    flex: 1,
    color: Palette.ink,
    fontSize: 14,
  },
  imageUploadBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Palette.emerald,
    backgroundColor: Palette.paleMint,
    alignItems: 'center',
    gap: 4,
  },
  uploadTitle: {
    color: Palette.forest,
    fontSize: 13,
    fontWeight: '800',
  },
  uploadSub: {
    color: Palette.muted,
    fontSize: 11,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  backBtn: {
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 12,
    backgroundColor: Palette.canvas,
    borderWidth: 1,
    borderColor: Palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: Palette.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  primaryBtn: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Palette.forest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  primaryBtnDisabled: {
    opacity: 0.65,
  },
  primaryBtnText: {
    color: Palette.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
