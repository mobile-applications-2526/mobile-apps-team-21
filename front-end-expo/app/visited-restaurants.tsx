import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/components/AuthContext';
import { UserService } from '@/services/userService';
import { RestRelResponse } from '@/types';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function VisitedRestaurantsScreen() {
  const { userEmail, token } = useAuth();
  const [restaurants, setRestaurants] = useState<RestRelResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    if (!userEmail || !token) return;
    try {
      const data = await UserService.getVisitedRestaurants(userEmail, token);
      setRestaurants(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={restaurants}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, { borderColor: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
            <Text style={styles.name}>{item.restaurantName}</Text>
            <Text style={styles.address}>{item.restaurantAddress}</Text>
            <Text style={styles.date}>Visited on: {item.visitDate}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No visited restaurants yet.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
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
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
});
