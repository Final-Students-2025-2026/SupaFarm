import { Image, type ImageSource } from 'expo-image';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ReactNode, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Palette } from '@/constants/theme';

export type Product = {
  id: string;
  name: string;
  seller: string;
  location: string;
  price: string;
  unit: string;
  rating: string;
  badge?: string;
  image: ImageSource;
};

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.brandRow}>
      <View style={[styles.logoMark, compact && styles.logoMarkCompact]}>
        <MaterialCommunityIcons name="sprout" size={compact ? 19 : 23} color={Palette.white} />
      </View>
      {!compact && (
        <Text style={styles.brandText}>
          Supa<Text style={styles.brandAccent}>Farm</Text>
        </Text>
      )}
    </View>
  );
}

export function IconButton({
  icon,
  badge,
  onPress,
  accessibilityLabel,
}: {
  icon: string;
  badge?: boolean;
  onPress?: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
      <MaterialCommunityIcons name={icon} size={22} color={Palette.ink} />
      {badge && <View style={styles.notificationDot} />}
    </Pressable>
  );
}

export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search fresh produce near you',
  onFilterPress,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
}) {
  return (
    <View style={styles.searchField}>
      <MaterialCommunityIcons name="magnify" size={22} color={Palette.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8A958D"
        style={styles.searchInput}
        returnKeyType="search"
      />
      <Pressable onPress={onFilterPress} accessibilityLabel="Filter search" style={styles.filterButton}>
        <MaterialCommunityIcons name="tune-variant" size={20} color={Palette.white} />
      </Pressable>
    </View>
  );
}

export function SectionHeading({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <Pressable onPress={onAction} style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function ProductCard({
  product,
  style,
  onCall,
  onOrder,
}: {
  product: Product;
  style?: StyleProp<ViewStyle>;
  onCall?: () => void;
  onOrder?: () => void;
}) {
  const [favorite, setFavorite] = useState(false);

  return (
    <View style={[styles.productCard, style]}>
      <View style={styles.productImageWrap}>
        <Image source={product.image} style={styles.productImage} contentFit="cover" />
        {product.badge && (
          <View style={styles.productBadge}>
            <Text style={styles.productBadgeText}>{product.badge}</Text>
          </View>
        )}
        <Pressable
          accessibilityLabel={favorite ? 'Remove from saved items' : 'Save item'}
          onPress={() => setFavorite((current) => !current)}
          style={({ pressed }) => [styles.favoriteButton, pressed && styles.pressed]}>
          <MaterialCommunityIcons
            name={favorite ? 'heart' : 'heart-outline'}
            size={19}
            color={favorite ? Palette.tomato : Palette.ink}
          />
        </Pressable>
      </View>
      <View style={styles.productBody}>
        <View style={styles.productTitleRow}>
          <Text numberOfLines={1} style={styles.productName}>
            {product.name}
          </Text>
          <View style={styles.rating}>
            <MaterialCommunityIcons name="star" size={13} color={Palette.sun} />
            <Text style={styles.ratingText}>{product.rating}</Text>
          </View>
        </View>
        <Text numberOfLines={1} style={styles.sellerName}>
          {product.seller}
        </Text>
        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker-outline" size={14} color={Palette.muted} />
          <Text numberOfLines={1} style={styles.locationText}>
            {product.location}
          </Text>
        </View>
        <View style={styles.priceRow}>
          <View style={styles.priceTextWrap}>
            <Text style={styles.productPrice}>{product.price}</Text>
            <Text style={styles.productUnit}> / {product.unit}</Text>
          </View>

          <View style={styles.cardActions}>
            {onCall && (
              <Pressable
                accessibilityLabel={`Call ${product.seller}`}
                onPress={onCall}
                style={styles.callButton}>
                <MaterialCommunityIcons name="phone" size={16} color={Palette.white} />
              </Pressable>
            )}
            <Pressable
              accessibilityLabel={`Order ${product.name}`}
              onPress={onOrder}
              style={styles.addButton}>
              <MaterialCommunityIcons name="plus" size={20} color={Palette.white} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.screenHeader}>
      <View style={styles.screenHeaderCopy}>
        <Text style={styles.screenTitle}>{title}</Text>
        {subtitle && <Text style={styles.screenSubtitle}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}

export function Chip({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && styles.pressed,
      ]}>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={16}
          color={active ? Palette.white : Palette.green}
        />
      )}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function InfoCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.infoCard, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Palette.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkCompact: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  brandText: {
    color: Palette.forest,
    fontSize: 21,
    fontWeight: '900',
  },
  brandAccent: {
    color: Palette.leaf,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Palette.tomato,
    borderWidth: 1.5,
    borderColor: Palette.white,
  },
  searchField: {
    minHeight: 54,
    paddingLeft: 16,
    paddingRight: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: Palette.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: Palette.ink,
    fontSize: 15,
    fontWeight: '500',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.green,
  },
  sectionHeading: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  sectionTitle: {
    color: Palette.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  sectionAction: {
    color: Palette.green,
    fontSize: 13,
    fontWeight: '800',
  },
  productCard: {
    width: 226,
    overflow: 'hidden',
    backgroundColor: Palette.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  productImageWrap: {
    height: 138,
    backgroundColor: Palette.mint,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: 'rgba(23,77,45,0.92)',
  },
  productBadgeText: {
    color: Palette.white,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  favoriteButton: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  productBody: {
    padding: 13,
  },
  productTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  productName: {
    flex: 1,
    color: Palette.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    color: Palette.ink,
    fontSize: 11,
    fontWeight: '700',
  },
  sellerName: {
    marginTop: 5,
    color: Palette.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  locationRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    flex: 1,
    color: Palette.muted,
    fontSize: 11,
  },
  priceRow: {
    minHeight: 35,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceTextWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  productPrice: {
    color: Palette.forest,
    fontSize: 16,
    fontWeight: '900',
  },
  productUnit: {
    color: Palette.muted,
    fontSize: 11,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  callButton: {
    width: 32,
    height: 32,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.emerald,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.forest,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  screenHeaderCopy: {
    flex: 1,
  },
  screenTitle: {
    color: Palette.ink,
    fontSize: 28,
    fontWeight: '900',
  },
  screenSubtitle: {
    marginTop: 4,
    color: Palette.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  chip: {
    minHeight: 38,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 19,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  chipActive: {
    backgroundColor: Palette.green,
    borderColor: Palette.green,
  },
  chipText: {
    color: Palette.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: Palette.white,
  },
  infoCard: {
    backgroundColor: Palette.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  pressed: {
    opacity: 0.65,
  },
});
