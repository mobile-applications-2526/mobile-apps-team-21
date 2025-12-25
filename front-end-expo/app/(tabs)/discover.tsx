import {
  StyleSheet,
  useColorScheme,
  FlatList,
  RefreshControl,
  View
} from "react-native";
import { Text } from "@/components/Themed";
import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect} from "expo-router";
import { useAuth } from "@/components/AuthContext";
import { fetchRestaurants } from "@/services/restaurantService";
import { Group, Restaurant } from "@/types";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import { fetchGroups, recommendRestaurantToGroup } from "@/services/groupChatService";
import Feedback from "@/components/Feedback";
import RecommendModal from "@/components/modals/RecommendModal";
import LoadingScreen from "@/components/LoadingScreen";

export default function DiscoverScreen() {
  const { token, userEmail } = useAuth();

  // Dark Mode Logic
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [groups, setGroups] = useState<Group[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Modal animation state: `modalVisible` controls Modal mount.
  const [modalVisible, setModalVisible] = useState(false);
  const [restaurantToRecommend, setRestaurantToRecommend] =
    useState<Restaurant | null>(null);

  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

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

  const loadGroups = async () => {
    if (!userEmail) {
      setLoading(false);
      return;
    }
    try {
      const data = await fetchGroups(userEmail, token || undefined);
      setGroups(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRestaurants();
      loadGroups();
    }, [token, userEmail])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRestaurants();
    setRefreshing(false);
  }, [token, userEmail]);

  const openModal = (restaurant: Restaurant) => {
    setRestaurantToRecommend(restaurant);
    loadGroups();
    setModalVisible(true);
  };

  // feedback state is rendered by the reusable <Feedback /> component

  const recommendRestaurant = async ({group}: {group: Group}) => {
    if (!restaurantToRecommend) return;
    const res = await recommendRestaurantToGroup(group, restaurantToRecommend, token || undefined);
    return res ? String(res) : undefined;
  };

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <RestaurantCard restaurant={item} onRecommend={() => openModal(item)} />
  );

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
        <LoadingScreen style={{ marginTop: 40 }} />
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
              Geen restaurants gevonden.
            </Text>
          }
        />
      )}

      <RecommendModal
        visible={modalVisible}
        groups={groups}
        dark={isDark}
        onSelect={async (group) => await recommendRestaurant({ group })}
        onRequestClose={() => setModalVisible(false)}
        onDone={(msg) =>
          setFeedback({ message: msg ?? 'Aanbeveling verzonden.', type: typeof msg === 'string' && msg.toLowerCase().includes('error') ? 'error' : 'success' })
        }
      />
      {/* In-app feedback toast */}
      <Feedback
        visible={Boolean(feedback)}
        message={feedback?.message ?? ""}
        type={feedback?.type ?? "success"}
        onHide={() => setFeedback(null)}
        dark={isDark}
      />
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
  listPad: { padding: 18 },
  empty: { textAlign: "center", marginTop: 40, color: "#6a7282" },
  emptyDark: { color: "#8894a0" },
});
