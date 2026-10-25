import { Image } from 'expo-image';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/theme';

export function CropScannerModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
    }, 1800);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <Text style={styles.topTitle}>AI Crop Condition Scanner</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={24} color={Palette.white} />
          </Pressable>
        </View>

        <View style={styles.viewport}>
          <Image
            source={require('@/assets/images/market/tomatoes.jpg')}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <View style={styles.viewportOverlay} />

          {/* Frame Reticle */}
          <View style={styles.reticleFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {scanning && <View style={styles.scanLine} />}
          </View>
        </View>

        {/* Diagnostic Results Card */}
        <View style={styles.bottomCard}>
          {!scanned ? (
            <View style={styles.preScanInfo}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="line-scan" size={24} color={Palette.emerald} />
              </View>
              <Text style={styles.preTitle}>Position Crop in Target Frame</Text>
              <Text style={styles.preSub}>
                Detects early leaf blight, nutrient deficiency, and estimates harvest yield maturity.
              </Text>
              <Pressable onPress={handleScan} style={styles.scanBtn}>
                <MaterialCommunityIcons name="camera" size={20} color={Palette.white} />
                <Text style={styles.scanBtnText}>Analyze Crop Condition</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <View style={styles.statusPill}>
                  <MaterialCommunityIcons name="check-decagram" size={16} color={Palette.emerald} />
                  <Text style={styles.statusText}>98% Healthy • Fruit Stage</Text>
                </View>
                <Text style={styles.cropTitle}>Scanned Crop Diagnostics</Text>
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricVal}>Reproductive</Text>
                  <Text style={styles.metricLabel}>Growth Stage</Text>
                </View>
                <View style={styles.vDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricVal}>Optimal</Text>
                  <Text style={styles.metricLabel}>Moisture Level</Text>
                </View>
                <View style={styles.vDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricVal}>0% Blight</Text>
                  <Text style={styles.metricLabel}>Disease Risk</Text>
                </View>
              </View>

              <Text style={styles.summaryText}>
                The condition of the plants has started to improve compared to yesterday, now they are starting to bear fruit.
              </Text>

              <View style={styles.actionRow}>
                <Pressable onPress={() => setScanned(false)} style={styles.rescanBtn}>
                  <Text style={styles.rescanText}>Scan Another</Text>
                </Pressable>
                <Pressable onPress={onClose} style={styles.saveBtn}>
                  <Text style={styles.saveText}>Save Diagnostic</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000',
  },
  topBar: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  topTitle: {
    color: Palette.white,
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  viewport: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewportOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  reticleFrame: {
    width: 260,
    height: 260,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: Palette.white,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  scanLine: {
    width: '90%',
    height: 2,
    backgroundColor: Palette.emerald,
    shadowColor: Palette.emerald,
    shadowRadius: 10,
    shadowOpacity: 1,
  },
  bottomCard: {
    padding: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: Palette.forestCard,
  },
  preScanInfo: {
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preTitle: {
    color: Palette.white,
    fontSize: 18,
    fontWeight: '800',
  },
  preSub: {
    color: '#D1D5DB',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  scanBtn: {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: Palette.emerald,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  scanBtnText: {
    color: Palette.white,
    fontSize: 14,
    fontWeight: '800',
  },
  resultContainer: {
    gap: 14,
  },
  resultHeader: {
    alignItems: 'flex-start',
    gap: 6,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    color: Palette.emerald,
    fontSize: 12,
    fontWeight: '800',
  },
  cropTitle: {
    color: Palette.white,
    fontSize: 20,
    fontWeight: '900',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    color: Palette.white,
    fontSize: 13,
    fontWeight: '800',
  },
  metricLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 2,
  },
  vDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  summaryText: {
    color: '#D1D5DB',
    fontSize: 12,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  rescanBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rescanText: {
    color: Palette.white,
    fontSize: 13,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: Palette.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: Palette.white,
    fontSize: 13,
    fontWeight: '800',
  },
});
