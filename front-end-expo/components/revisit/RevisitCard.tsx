import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReceiptEuro } from 'lucide-react-native';
import { GroupVisitResponse } from '@/types';
import Colors from '@/constants/Colors';

interface Props {
  visit: GroupVisitResponse;
  onPress: () => void;
  onViewReceipt?: () => void;
}

const RevisitCard: React.FC<Props> = ({ visit, onPress, onViewReceipt }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const cardBackgroundColor = isDark ? '#1f2933' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1f2933';
  const secondaryTextColor = isDark ? '#8894a0' : '#6a7282';
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format price
  const formatPrice = (price: number | null) => {
    if (price === null) return null;
    return `€${price.toFixed(2)}`;
  };

  // Extract city from address
  const getCity = (address: string) => {
    if (!address) return '';
    const parts = address.split(',');
    if (parts.length >= 2) {
      // Usually format is "Street, City" or "Street Number, City"
      return parts[parts.length - 1].trim().split(' ').pop() || '';
    }
    return address;
  };

  // Render stars for rating
  const renderStars = (rating: number | null) => {
    if (rating === null) return null;
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={14} color="#FFD700" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={14} color="#FFD700" />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={14} color={isDark ? '#4a5568' : '#cbd5e0'} />
        );
      }
    }
    return (
      <View style={styles.starsContainer}>
        {stars}
        <Text style={[styles.ratingText, { color: secondaryTextColor }]}>
          {rating.toFixed(1)}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: cardBackgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header Row: Name + Receipt Button */}
      <View style={styles.headerRow}>
        <Text style={[styles.restaurantName, { color: textColor }]} numberOfLines={1}>
          {visit.restaurantName}
        </Text>
        {visit.hasReceipt && onViewReceipt && (
          <TouchableOpacity 
            style={[styles.receiptButton, { backgroundColor: tintColor }]}
            onPress={(e) => {
              e.stopPropagation?.();
              onViewReceipt();
            }}
          >
            <ReceiptEuro size={14} color="#ffffff" />
            <Text style={styles.receiptButtonText}>Receipt</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Rating */}
      {visit.userRating !== null ? (
        renderStars(visit.userRating)
      ) : (
        <View style={styles.noRatingContainer}>
          <Ionicons name="star-outline" size={14} color={tintColor} />
          <Text style={[styles.noRatingText, { color: tintColor }]}>Tap to rate</Text>
        </View>
      )}

      {/* Date */}
      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={14} color={secondaryTextColor} />
        <Text style={[styles.infoText, { color: secondaryTextColor }]}>
          {formatDate(visit.visitDate)}
        </Text>
      </View>

      {/* Location + Cuisine */}
      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={14} color={secondaryTextColor} />
        <Text style={[styles.infoText, { color: secondaryTextColor }]}>
          {getCity(visit.restaurantAddress)}
          {visit.cuisine ? ` • ${visit.cuisine}` : ''}
        </Text>
      </View>

      {/* Group Name */}
      <View style={styles.infoRow}>
        <Ionicons name="people-outline" size={14} color={secondaryTextColor} />
        <Text style={[styles.infoText, { color: secondaryTextColor }]}>
          {visit.groupName}
        </Text>
      </View>

      {/* Price and Payer */}
      {visit.totalPrice !== null && (
        <View style={styles.infoRow}>
          <Text style={[styles.priceSymbol, { color: secondaryTextColor }]}>$</Text>
          <Text style={[styles.infoText, { color: secondaryTextColor }]}>
            {formatPrice(visit.totalPrice)}
            {visit.paidByName ? ` • Paid by ${visit.paidByName}` : ''}
          </Text>
        </View>
      )}

      {/* Add price prompt if no price */}
      {visit.totalPrice === null && (
        <View style={styles.addInfoRow}>
          <Ionicons name="add-circle-outline" size={14} color={tintColor} />
          <Text style={[styles.addInfoText, { color: tintColor }]}>
            Tap to add price & details
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  receiptButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 6,
  },
  noRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  noRatingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
  },
  priceSymbol: {
    fontSize: 14,
    fontWeight: '600',
    width: 14,
    textAlign: 'center',
  },
  addInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  addInfoText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default RevisitCard;
