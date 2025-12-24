import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import { View, Text } from '@/components/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/components/AuthContext';
import { UserService } from '@/services/userService';
import { RestaurantRelation } from '@/types';
import { Ionicons } from '@expo/vector-icons';

export default function VisitedRestaurantsScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [restaurants, setRestaurants] = useState<RestaurantRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRestaurants = useCallback(async () => {
    if (!token) return;
    try {
      const data = await UserService.getVisitedRestaurants(token);
      setRestaurants(data);
    } catch (error) {
      console.error('Failed to load visited restaurants:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadRestaurants();
    }, [loadRestaurants])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRestaurants();
    setRefreshing(false);
  }, [loadRestaurants]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Onbekend';
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-BE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderRestaurant = ({ item }: { item: RestaurantRelation }) => (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.restaurantName, isDark && styles.textDark]} numberOfLines={1}>
          {item.restaurantName}
        </Text>
        {item.isFavorite && (
          <Ionicons name="heart" size={20} color="#ef5350" />
        )}
      </View>
      <Text style={[styles.address, isDark && styles.addressDark]} numberOfLines={2}>
        {item.restaurantAddress}
      </Text>
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={16} color={isDark ? '#8894a0' : '#6a7282'} />
          <Text style={[styles.metaText, isDark && styles.metaTextDark]}>
            {formatDate(item.visitedDate)}
          </Text>
        </View>
        {item.rating && (
          <View style={styles.metaItem}>
            <Ionicons name="star" size={16} color="#ffc107" />
            <Text style={[styles.metaText, isDark && styles.metaTextDark]}>
              {item.rating.toFixed(1)}
            </Text>
          </View>
        )}
      </View>
      {item.restaurantDescription && (
        <Text style={[styles.description, isDark && styles.descriptionDark]} numberOfLines={2}>
          {item.restaurantDescription}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#1f2933'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Bezochte Restaurants</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#4caf50" />
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          renderItem={renderRestaurant}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={48} color={isDark ? '#8894a0' : '#6a7282'} />
              <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
                Je hebt nog geen restaurants bezocht.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  containerDark: { backgroundColor: '#12181f' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1f2933' },
  textDark: { color: '#ffffff' },
  placeholder: { width: 32 },
  loader: { marginTop: 40 },
  listContent: { padding: 18 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardDark: { backgroundColor: '#1f2933' },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  restaurantName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2933',
    marginRight: 8,
  },
  address: {
    fontSize: 14,
    color: '#6a7282',
    marginBottom: 8,
  },
  addressDark: { color: '#c4c9d1' },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#6a7282',
  },
  metaTextDark: { color: '#8894a0' },
  description: {
    fontSize: 13,
    color: '#6a7282',
    fontStyle: 'italic',
  },
  descriptionDark: { color: '#8894a0' },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6a7282',
    textAlign: 'center',
  },
  emptyTextDark: { color: '#8894a0' },
});
