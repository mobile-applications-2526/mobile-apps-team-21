import {
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
  Modal,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { Text } from "@/components/Themed";
import React, { useCallback, useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuth } from "@/components/AuthContext";
import { fetchRestaurants } from "@/services/restaurantService";
import { Group, Restaurant } from "@/types";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import { fetchGroups, recommendRestaurantToGroup } from "@/services/groupChatService";
import Feedback from "@/components/Feedback";

export default function DiscoverScreen() {
  const router = useRouter();
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

  const backdropAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(40)).current; // translateY
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
    // mount modal immediately so Animated views are present
    setModalVisible(true);

    // run animations: backdrop fade in + content slide up
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(contentAnim, {
        toValue: 0,
        friction: 12,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = (onComplete?: () => void) => {
    // animate out then unmount
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 140,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 40,
        duration: 160,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setRestaurantToRecommend(null);
      if (onComplete) onComplete();
    });
  };

  // feedback state is rendered by the reusable <Feedback /> component

  const recommendRestaurant = async ({group}: {group: Group}) => {
    if (!restaurantToRecommend) return;
    const res = await recommendRestaurantToGroup(group, restaurantToRecommend, token || undefined);
    return res
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
              Geen restaurants gevonden.
            </Text>
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="none" onRequestClose={() => closeModal()}>
        <Animated.View
          style={[
            styles.modalBackdrop,
            isDark && styles.modalBackdropDark,
            { opacity: backdropAnim },
          ]}
        >
          <Animated.View
            style={[
              styles.modalContent,
              isDark && styles.modalContentDark,
              { transform: [{ translateY: contentAnim }] },
            ]}
          >
            <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Recommend to group</Text>

            {groups.length === 0 ? (
              <Text style={[styles.empty, isDark && styles.emptyDark]}>Je zit nog in geen groepen.</Text>
            ) : (
              <FlatList
                data={groups}
                keyExtractor={(g) => g.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={async () => {
                      if (restaurantToRecommend) {
                        const res = await recommendRestaurant({ group: item });
                        closeModal(() =>
                          setFeedback({
                            message: typeof res === "string" ? res : res?.toString() ?? "Aanbeveling verzonden.",
                            type: typeof res === "string" && res.toLowerCase().includes("error") ? "error" : "success",
                          })
                        );
                      }
                    }}
                    style={[styles.groupElem]}
                  >
                    <Text style={[styles.groupName, isDark && styles.groupNameDark]}>{item.name}</Text>
                    <Text style={[styles.groupMeta, isDark && styles.groupMetaDark]}>{item.memberNames?.length || 0} leden</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity style={styles.cancelButton} onPress={() => closeModal()}>
              <Text style={[styles.cancelButtonText, isDark && styles.cancelButtonTextDark]}>Annuleren</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
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

  /* Modal / recommend overlay */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  modalContentDark: {
    backgroundColor: "#0b1114",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  modalTitleDark: { color: "#eef2f7" },
  groupItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eceff1",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groupElem: {paddingVertical: 8},
  groupItemDark: { borderBottomColor: "#1f2937" },
  groupName: { fontSize: 16, color: "#111827"},
  groupNameDark: { color: "#e6eef6" },
  groupMeta: { fontSize: 12, color: "#6b7280" },
  groupMetaDark: { color: "#94a3b8" },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelButtonText: { color: "#ef4444", fontWeight: "700" },
  cancelButtonTextDark: { color: "#ff9b9b" },
  modalBackdropDark: { backgroundColor: "rgba(0,0,0,0.6)" },
  /* feedback toast */
  feedback: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 34,
    paddingVertical: 16,
    paddingHorizontal: 18,
    minHeight: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  feedbackText: { color: "#07203b", fontWeight: "700", fontSize: 16 },
  feedbackTextDark: { color: "#eaf6ff" },
  feedbackSuccess: { backgroundColor: "#d1fae5" },
  feedbackError: { backgroundColor: "#fee2e2" },
  feedbackSuccessDark: { backgroundColor: "#07351f" },
  feedbackErrorDark: { backgroundColor: "#3b0f0f" },
});
