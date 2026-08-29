import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEffect, useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/theme';
import { callService } from '@/services/callService';

export function VoiceCallModal({
  visible,
  onClose,
  recipientName = 'Farmer / Seller',
  recipientRole = 'Verified User',
  recipientLocation = 'Ghana',
  phone = '',
}: {
  visible: boolean;
  onClose: () => void;
  recipientName?: string;
  recipientRole?: string;
  recipientLocation?: string;
  phone?: string;
}) {
  const [callState, setCallState] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  useEffect(() => {
    let activeCall: { channelName: string; endCall: () => void } | null = null;
    if (visible) {
      setCallState('connecting');
      setSeconds(0);

      // Start Realtime Call Signaling Broadcast
      activeCall = callService.startCall(phone, 'Buyer User');

      const connectTimeout = setTimeout(() => {
        setCallState('connected');
      }, 1800);

      return () => {
        clearTimeout(connectTimeout);
        if (activeCall) activeCall.endCall();
      };
    }
  }, [visible, phone]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (visible && callState === 'connected') {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [visible, callState]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallState('ended');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.statusPill}>
            <View
              style={[
                styles.statusDot,
                callState === 'connected' && styles.statusDotConnected,
              ]}
            />
            <Text style={styles.statusText}>
              {callState === 'connecting'
                ? 'Calling via SupaFarm Voice...'
                : callState === 'connected'
                ? `Connected • ${formatTime(seconds)}`
                : 'Call Ended'}
            </Text>
          </View>

          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account" size={48} color={Palette.white} />
            </View>
            <View style={styles.avatarPulse} />
          </View>

          <Text style={styles.name}>{recipientName}</Text>
          <View style={styles.roleRow}>
            <Text style={styles.role}>{recipientRole}</Text>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.location}>{recipientLocation}</Text>
          </View>
          <Text style={styles.phone}>{phone}</Text>

          <View style={styles.encryptNotice}>
            <MaterialCommunityIcons name="shield-check" size={14} color={Palette.emerald} />
            <Text style={styles.encryptText}>WebRTC Live Voice Stream • Direct Buyer/Farmer</Text>
          </View>

          <View style={styles.controlsRow}>
            <Pressable
              onPress={() => setIsMuted((prev) => !prev)}
              style={[styles.controlBtn, isMuted && styles.controlBtnActive]}>
              <MaterialCommunityIcons
                name={isMuted ? 'microphone-off' : 'microphone'}
                size={24}
                color={isMuted ? Palette.forestDark : Palette.white}
              />
              <Text style={styles.controlLabel}>{isMuted ? 'Muted' : 'Mute'}</Text>
            </Pressable>

            <Pressable onPress={handleEndCall} style={styles.endCallBtn}>
              <MaterialCommunityIcons name="phone-hangup" size={28} color={Palette.white} />
              <Text style={styles.endCallLabel}>End</Text>
            </Pressable>

            <Pressable
              onPress={() => setIsSpeaker((prev) => !prev)}
              style={[styles.controlBtn, isSpeaker && styles.controlBtnActive]}>
              <MaterialCommunityIcons
                name={isSpeaker ? 'volume-high' : 'volume-medium'}
                size={24}
                color={isSpeaker ? Palette.forestDark : Palette.white}
              />
              <Text style={styles.controlLabel}>{isSpeaker ? 'Speaker On' : 'Speaker'}</Text>
            </Pressable>
          </View>

          {/* Option to place native phone call */}
          {phone ? (
            <Pressable
              onPress={() => {
                Linking.openURL(`tel:${phone.replace(/[^0-9+]/g, '')}`);
              }}
              style={styles.nativeDialBtn}>
              <MaterialCommunityIcons name="phone-outgoing" size={16} color={Palette.white} />
              <Text style={styles.nativeDialBtnText}>Switch to Native Phone Call ({phone})</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 33, 21, 0.85)',
    justifyContent: 'flex-end',
  },
  card: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: Palette.forestCard,
    alignItems: 'center',
  },
  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.sun,
  },
  statusDotConnected: {
    backgroundColor: Palette.emerald,
  },
  statusText: {
    color: Palette.white,
    fontSize: 12,
    fontWeight: '700',
  },
  avatarWrap: {
    marginTop: 24,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Palette.forest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Palette.emerald,
    zIndex: 2,
  },
  avatarPulse: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  name: {
    color: Palette.white,
    fontSize: 22,
    fontWeight: '900',
  },
  roleRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  role: {
    color: Palette.emerald,
    fontSize: 13,
    fontWeight: '800',
  },
  bullet: {
    color: '#6B7280',
  },
  location: {
    color: '#D1D5DB',
    fontSize: 13,
  },
  phone: {
    marginTop: 4,
    color: '#9CA3AF',
    fontSize: 12,
  },
  encryptNotice: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  encryptText: {
    color: '#9CA3AF',
    fontSize: 11,
  },
  controlsRow: {
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  controlBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  controlBtnActive: {
    backgroundColor: Palette.emerald,
  },
  controlLabel: {
    position: 'absolute',
    bottom: -20,
    color: Palette.white,
    fontSize: 11,
    fontWeight: '700',
  },
  endCallBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Palette.tomato,
  },
  endCallLabel: {
    position: 'absolute',
    bottom: -20,
    color: Palette.white,
    fontSize: 11,
    fontWeight: '700',
  },
  nativeDialBtn: {
    marginTop: 36,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nativeDialBtnText: {
    color: Palette.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
