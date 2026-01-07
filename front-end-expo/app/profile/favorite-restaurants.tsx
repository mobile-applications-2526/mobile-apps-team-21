import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, View, Text, useColorScheme, TouchableOpacity, Alert, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { useAuth } from '@/components/AuthContext';
import { UserService } from '@/services/userService';
import { fetchGroups, recommendRestaurantToGroup } from '@/services/groupChatService';
import { RestRelResponse, Group, Restaurant } from '@/types';
import RecommendModal from '@/components/modals/RecommendModal';
import Feedback from '@/components/Feedback';
import Colors from '@/constants/Colors';
import LoadingScreen from '@/components/LoadingScreen';

export default function FavoriteRestaurantsScreen() {
  const { userEmail, token } = useAuth();
  const [restaurants, setRestaurants] = useState<RestRelResponse[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestRelResponse | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = isDark ? '#12181f' : '#f5f7fa';
  const cardBackgroundColor = isDark ? '#1f2933' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1f2933';

  const loadData = async () => {
    if (!userEmail || !token) return;
    try {
      const [restaurantData, groupData] = await Promise.all([
        UserService.getFavoriteRestaurants(userEmail, token),
        fetchGroups(userEmail, token)
      ]);
      setRestaurants(restaurantData);
      setGroups(groupData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [userEmail, token])
  );

  const handleUnfavorite = async (restaurantId: string) => {
    if (!token) return;
    
    const performUnfavorite = async () => {
      try {
        await UserService.toggleFavorite(restaurantId, token);
        // Remove from local state for instant UI update
        setRestaurants(prev => prev.filter(r => r.restaurantId !== restaurantId));
        setFeedback({ message: 'Removed from favorites', type: 'success' });
      } catch (error) {
        console.error(error);
        setFeedback({ message: 'Failed to remove from favorites', type: 'error' });
      }
    };

    // Use window.confirm for web platform since Alert.alert doesn't work on web
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to remove this restaurant from your favorites?');
      if (confirmed) {
        await performUnfavorite();
      }
    } else {
      Alert.alert(
        'Remove from favorites',
        'Are you sure you want to remove this restaurant from your favorites?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: performUnfavorite
          }
        ]
      );
    }
  };

  const handleRecommend = (restaurant: RestRelResponse) => {
    setSelectedRestaurant(restaurant);
    setModalVisible(true);
  };

  const handleSelectGroup = async (group: Group): Promise<string | undefined> => {
    if (!selectedRestaurant || !token) return;
    
    // Convert RestRelResponse to Restaurant format for the recommendation
    const restaurantForRecommend: Restaurant = {
      id: selectedRestaurant.restaurantId,
      name: selectedRestaurant.restaurantName,
      adress: selectedRestaurant.restaurantAddress,
      // RestRelResponse does not have phoneNumber or description, using empty strings
      phoneNumber: '',
      description: ''
    };
    
    const result = await recommendRestaurantToGroup(group, restaurantForRecommend, token);
    return result;
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.restaurantId}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: cardBackgroundColor }]} testID="favorite-restaurant-card">
            <View style={styles.cardContent}>
              <View style={styles.textContainer}>
                <Text style={[styles.name, { color: textColor }]}>{item.restaurantName}</Text>
                <Text style={[styles.address, { color: textColor, opacity: 0.7 }]}>{item.restaurantAddress}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleRecommend(item)}
                  testID="recommend-restaurant-button"
                  accessibilityRole="button"
                >
                  <Entypo name="forward" size={22} color={Colors[colorScheme ?? 'light'].tint} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleUnfavorite(item.restaurantId)}
                  testID="unfavorite-restaurant-button"
                  accessibilityRole="button"
                >
                  <Ionicons name="heart" size={22} color="#e53935" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={48} color={textColor} style={{ opacity: 0.5, marginBottom: 12 }} />
            <Text style={{ color: textColor }}>No favorite restaurants yet.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      <RecommendModal
        visible={modalVisible}
        groups={groups}
        dark={isDark}
        title="Recommend to group"
        onSelect={handleSelectGroup}
        onRequestClose={() => setModalVisible(false)}
        onDone={(message) => {
          setFeedback({ 
            message, 
            type: message.toLowerCase().includes('fail') || message.toLowerCase().includes('error') ? 'error' : 'success' 
          });
        }}
      />

      {feedback && (
        <Feedback
          visible={!!feedback}
          message={feedback.message}
          type={feedback.type}
          onHide={() => setFeedback(null)}
        />
      )}
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
    flexGrow: 1,
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
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  emptyContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
