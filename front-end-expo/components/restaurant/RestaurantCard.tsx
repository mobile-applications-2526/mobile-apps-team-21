import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Restaurant } from '@/types';
import { Link, useRouter } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/components/AuthContext';
import { UserService } from '@/services/userService';

interface Props {
  restaurant: Restaurant;
  onRecommend: () => void;
  onStatusChange?: () => void;
  visitedRestaurantIds?: string[];
}

const RestaurantCard: React.FC<Props> = ({ restaurant, onRecommend, onStatusChange, visitedRestaurantIds }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { token } = useAuth();
  const router = useRouter();
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if restaurant is visited based on group visits
  const isVisited = visitedRestaurantIds?.includes(restaurant.id) ?? false;

  useEffect(() => {
    loadFavoriteStatus();
  }, [restaurant.id, token]);

  const loadFavoriteStatus = async () => {
    if (!token) return;
    try {
      const status = await UserService.getRestaurantStatus(restaurant.id, token);
      setIsFavorite(status.isFavorite);
    } catch (error) {
      console.error('Failed to load restaurant status:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!token || loading) return;
    setLoading(true);
    try {
      const result = await UserService.toggleFavorite(restaurant.id, token);
      setIsFavorite(result.isFavorite);
      onStatusChange?.();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVisitedPress = () => {
    if (isVisited) {
      // Navigate to revisit page when clicked
      router.push('/(tabs)/revisit');
    }
  };

  return (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <View style={styles.headerRow}>
        <View style={styles.nameRow}>
          <Text style={[styles.title, isDark && styles.textDark]} numberOfLines={1}>{restaurant.name}</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              onPress={handleToggleFavorite} 
              style={styles.iconButton} 
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? "Unlike restaurant" : "Like restaurant"}
              testID="favorite-button"
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={26} 
                color={isFavorite ? "#ef5350" : (isDark ? '#ffffff' : '#1f2933')} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={onRecommend} 
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel="Recommend to group"
              testID="recommend-button"
            >
              <Entypo name="add-to-list" size={26} color={isDark ? '#ffffff' : '#1f2933'} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.text, isDark && styles.textDark]}>{restaurant.adress}</Text>
        <Text style={[styles.text, isDark && styles.textDark]}>{restaurant.description}</Text>
        <Text style={[styles.contact, isDark && styles.contactDark]}>Contact</Text>
        <Link href={`tel:${restaurant.phoneNumber}`} style={[styles.link, isDark && styles.linkDark]}>{restaurant.phoneNumber}</Link>
      </View>
      
      {/* Visited badge - only shown when restaurant is visited, navigates to revisit page */}
      {isVisited && (
        <TouchableOpacity 
          style={[styles.visitedButton, styles.visitedButtonActive]} 
          onPress={handleVisitedPress}
        >
          <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
          <Text style={[styles.visitedButtonText, styles.visitedButtonTextActive]}>
            Visited
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    paddingBottom: 44,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    position: 'relative',
  },
  cardDark: {
    backgroundColor: '#1f2933',
  },
  headerRow: { flexDirection: 'column', alignItems: 'flex-start', rowGap: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  actionButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: { padding: 4 },
  title: { flex: 1, fontSize: 18, fontWeight: '600', color: '#1f2933' },
  text: {color: '#1f2933' },
  textDark: { color: '#ffffff' },
  contact: {color: '#1f2933', fontWeight:'500', fontSize: 16 },
  contactDark: { color: '#ffffff' },
  link: {color: '#1e00ffff'},
  linkDark: {color: '#8676ffff'},
  visitedButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  visitedButtonActive: {
    backgroundColor: '#4caf50',
  },
  visitedButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  visitedButtonTextActive: {
    color: '#ffffff',
  },
});

export default RestaurantCard;