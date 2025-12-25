import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, Text, useColorScheme, TouchableOpacity } from 'react-native';
import { useAuth } from '@/components/AuthContext';
import { UserService } from '@/services/userService';
import { UniqueVisitedRestaurant } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { RatingModal } from '@/components/modals/RatingModal';
import Colors from '@/constants/Colors';
import LoadingScreen from '@/components/LoadingScreen';

export default function VisitedRestaurantsScreen() {
  const { token } = useAuth();
  const [restaurants, setRestaurants] = useState<UniqueVisitedRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<UniqueVisitedRestaurant | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = isDark ? '#12181f' : '#f5f7fa';
  const cardBackgroundColor = isDark ? '#1f2933' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1f2933';

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    if (!token) return;
    try {
      // Fetch unique visited restaurants from group visits
      const data = await UserService.getUniqueVisitedRestaurants(token);
      setRestaurants(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardPress = (restaurant: UniqueVisitedRestaurant) => {
    setSelectedRestaurant(restaurant);
    setShowRatingModal(true);
  };

  const handleSubmitRating = async (rating: number) => {
    if (!token || !selectedRestaurant) return;
    try {
      await UserService.setRating(selectedRestaurant.restaurantId, rating, token);
      // Update the local state with new rating
      setRestaurants(prev => 
        prev.map(r => 
          r.restaurantId === selectedRestaurant.restaurantId 
            ? { ...r, rating } 
            : r
        )
      );
      setShowRatingModal(false);
      setSelectedRestaurant(null);
    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
  };

  const handleCloseModal = () => {
    setShowRatingModal(false);
    setSelectedRestaurant(null);
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderStars = (rating: number | null) => {
    if (rating === null) return null;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={i <= rating ? '#FFD700' : (isDark ? '#4a5568' : '#cbd5e0')}
        />
      );
    }
    return (
      <View style={styles.starsContainer}>
        {stars}
        <Text style={[styles.ratingText, { color: textColor, opacity: 0.6 }]}>
          ({rating.toFixed(0)}/5)
        </Text>
      </View>
    );
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <FlatList
        data={restaurants}
        keyExtractor={(item, index) => item.restaurantId || index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: cardBackgroundColor }]}
            onPress={() => handleCardPress(item)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.name, { color: textColor }]}>{item.restaurantName}</Text>
              {item.rating !== null && renderStars(item.rating)}
            </View>
            <Text style={[styles.address, { color: textColor, opacity: 0.7 }]}>{item.restaurantAddress}</Text>
            {item.visitDate && (
              <Text style={[styles.date, { color: textColor, opacity: 0.5 }]}>
                Last visited: {formatDate(item.visitDate)}
              </Text>
            )}
            {item.rating === null && (
              <View style={styles.tapToRateContainer}>
                <Ionicons name="star-outline" size={14} color={Colors[colorScheme ?? 'light'].tint} />
                <Text style={[styles.tapToRate, { color: Colors[colorScheme ?? 'light'].tint }]}>
                  Tap to rate
                </Text>
              </View>
            )}
            {item.rating !== null && (
              <Text style={[styles.tapToChange, { color: textColor, opacity: 0.4 }]}>
                Tap to change rating
              </Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: textColor }}>No visited restaurants yet.</Text>
            <Text style={{ color: textColor, opacity: 0.6, marginTop: 8, textAlign: 'center' }}>
              Visit restaurants with your groups to see them here!
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        restaurantName={selectedRestaurant?.restaurantName || ''}
        onSubmit={handleSubmitRating}
        onSkip={handleCloseModal}
        onClose={handleCloseModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  address: {
    fontSize: 14,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
  },
  tapToRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  tapToRate: {
    fontSize: 13,
    fontWeight: '500',
  },
  tapToChange: {
    fontSize: 11,
    marginTop: 6,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
});
