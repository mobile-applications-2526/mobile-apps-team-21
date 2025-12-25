import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Restaurant } from '@/types';
import { Link } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/components/AuthContext';
import { UserService } from '@/services/userService';
import { RatingModal } from '@/components/modals/RatingModal';

interface Props {
  restaurant: Restaurant;
  onRecommend: () => void;
  onStatusChange?: () => void;
}

const RestaurantCard: React.FC<Props> = ({ restaurant, onRecommend, onStatusChange }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { token } = useAuth();
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [isVisited, setIsVisited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    loadStatus();
  }, [restaurant.id, token]);

  const loadStatus = async () => {
    if (!token) return;
    try {
      const status = await UserService.getRestaurantStatus(restaurant.id, token);
      setIsFavorite(status.isFavorite);
      setIsVisited(!!status.visitDate);
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

  const handleToggleVisited = async () => {
    if (!token || loading) return;
    
    // If already visited, just toggle it off (unmark)
    if (isVisited) {
      setLoading(true);
      try {
        const result = await UserService.toggleVisited(restaurant.id, token);
        setIsVisited(!!result.visitDate);
        onStatusChange?.();
      } catch (error) {
        console.error('Failed to toggle visited:', error);
      } finally {
        setLoading(false);
      }
    } else {
      // If not visited, first mark as visited then show rating modal
      setLoading(true);
      try {
        const result = await UserService.toggleVisited(restaurant.id, token);
        setIsVisited(!!result.visitDate);
        onStatusChange?.();
        // Show rating modal after marking as visited
        if (result.visitDate) {
          setShowRatingModal(true);
        }
      } catch (error) {
        console.error('Failed to toggle visited:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmitRating = async (rating: number) => {
    if (!token) return;
    try {
      await UserService.setRating(restaurant.id, rating, token);
      setShowRatingModal(false);
    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
  };

  const handleSkipRating = () => {
    setShowRatingModal(false);
  };

  return (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <View style={styles.headerRow}>
        <View style={styles.nameRow}>
          <Text style={[styles.title, isDark && styles.textDark]} numberOfLines={1}>{restaurant.name}</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={handleToggleFavorite} style={styles.iconButton} disabled={loading}>
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={26} 
                color={isFavorite ? "#ef5350" : (isDark ? '#ffffff' : '#1f2933')} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onRecommend} style={styles.iconButton}>
              <Entypo name="add-to-list" size={26} color={isDark ? '#ffffff' : '#1f2933'} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.text, isDark && styles.textDark]}>{restaurant.adress}</Text>
        <Text style={[styles.text, isDark && styles.textDark]}>{restaurant.description}</Text>
        <Text style={[styles.contact, isDark && styles.contactDark]}>Contact</Text>
        <Link href={`tel:${restaurant.phoneNumber}`} style={[styles.link, isDark && styles.linkDark]}>{restaurant.phoneNumber}</Link>
      </View>
      
      {/* Visited button at bottom right */}
      <TouchableOpacity 
        style={[
          styles.visitedButton, 
          isVisited ? styles.visitedButtonActive : (isDark ? styles.visitedButtonDark : styles.visitedButtonLight)
        ]} 
        onPress={handleToggleVisited}
        disabled={loading}
      >
        <Ionicons 
          name={isVisited ? "checkmark-circle" : "checkmark-circle-outline"} 
          size={16} 
          color={isVisited ? "#ffffff" : (isDark ? '#8894a0' : '#6a7282')} 
        />
        <Text style={[
          styles.visitedButtonText, 
          isVisited ? styles.visitedButtonTextActive : (isDark ? styles.visitedButtonTextDark : styles.visitedButtonTextLight)
        ]}>
          {isVisited ? 'Visited' : 'Mark visited'}
        </Text>
      </TouchableOpacity>

      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        restaurantName={restaurant.name}
        onSubmit={handleSubmitRating}
        onSkip={handleSkipRating}
        onClose={handleSkipRating}
      />
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
  visitedButtonLight: {
    backgroundColor: '#f0f0f0',
  },
  visitedButtonDark: {
    backgroundColor: '#2d3a47',
  },
  visitedButtonActive: {
    backgroundColor: '#4caf50',
  },
  visitedButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  visitedButtonTextLight: {
    color: '#6a7282',
  },
  visitedButtonTextDark: {
    color: '#8894a0',
  },
  visitedButtonTextActive: {
    color: '#ffffff',
  },
});

export default RestaurantCard;