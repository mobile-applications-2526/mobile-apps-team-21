import {
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { Text, View } from "@/components/Themed";
import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuth } from "@/components/AuthContext";
import { fetchRestaurants } from "@/services/restaurantService";
import { Restaurant } from "@/types";
import RestaurantCard from "@/components/restaurant/RestaurantCard";

export default function DiscoverScreen() {
  const router = useRouter();
  const { token, userEmail } = useAuth();

  // Dark Mode Logic
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRestaurants = async () => {
    if (!userEmail) {
      setLoading(false);
      return;
    }
    try {
      const data = await fetchRestaurants(userEmail, token || undefined);
      setRestaurants(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRestaurants();
    }, [token, userEmail])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRestaurants();
    setRefreshing(false);
  }, [token, userEmail]);

  const renderRestaurant = ({ item }: {item: Restaurant}) => <RestaurantCard restaurant={item}/>;

  return (
    <SafeAreaView
      style={[styles.container, isDark && styles.containerDark]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
          Restaurants
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(r) => r.id}
          renderItem={renderRestaurant}
          contentContainerStyle={styles.listPad}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={[styles.empty, isDark && styles.emptyDark]}>
              Geen groepen gevonden.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  containerDark: { backgroundColor: "#12181f" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#1f2933" },
  headerTitleDark: { color: "#ffffff" },
  newButton: {
    backgroundColor: "#4caf50",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  newButtonText: { color: "#fff", fontWeight: "600" },
  listPad: { padding: 18 },
  empty: { textAlign: "center", marginTop: 40, color: "#6a7282" },
  emptyDark: { color: "#8894a0" },
});
