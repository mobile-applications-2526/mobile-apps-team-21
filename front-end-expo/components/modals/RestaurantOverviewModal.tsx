import { Group, Restaurant } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from "../AuthContext";
import { useFocusEffect } from "expo-router";
import { fetchRecommendedRestaurants } from "@/services/groupChatService";

type Props = {
    visible: boolean;
    group: Group;
    dark?: boolean;
    onRequestClose: () => void;
};

export default function RestaurantOverviewModal({
    visible,
    group,
    dark = false,
    onRequestClose,
}: Props) {
    const { token, userEmail } = useAuth();

    const backdrop = useRef(new Animated.Value(0)).current;
    const content = useRef(new Animated.Value(40)).current;
    const [localVisible, setLocalVisible] = useState(visible);
    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(true);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([])
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        if (visible) {
            setLocalVisible(true);
            Animated.parallel([
                Animated.timing(backdrop, {
                    toValue: 1,
                    duration: 180,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.spring(content, {
                    toValue: 0,
                    friction: 12,
                    tension: 80,
                    useNativeDriver: true,
                }),
            ]).start();
        } else if (localVisible) {
            // if parent hides, run hide animation then unmount
            Animated.parallel([
                Animated.timing(backdrop, {
                    toValue: 0,
                    duration: 140,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(content, {
                    toValue: 40,
                    duration: 160,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start(() => setLocalVisible(false));
        }
    }, [visible]);


    const handleClose = () => {
        // animate out then call onRequestClose
        Animated.parallel([
            Animated.timing(backdrop, {
                toValue: 0,
                duration: 140,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(content, {
                toValue: 40,
                duration: 160,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start(() => {
            setLocalVisible(false);
            if (onRequestClose) onRequestClose();
        });
    };

    const loadRestaurants = async () => {
        if (!userEmail) {
            setLoading(false);
            return;
        }
        try {
            const data = await fetchRecommendedRestaurants(group, token || undefined);
            setRestaurants(data);
        } catch (e) {
            console.warn(e)
        } finally {
            setLoading(false)
        }
    }

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadRestaurants();
        setRefreshing(false);
    }, [token, userEmail]);

    useFocusEffect(
        useCallback(() => {
            loadRestaurants();
        }, [token, userEmail])
    );

    if (!localVisible) return null;

    return (
        <Modal transparent animationType="none" visible={true} onRequestClose={onRequestClose}>
            <Animated.View style={[styles.backdrop, dark && styles.backdropDark, { opacity: backdrop }]}>
                <Animated.View style={[styles.card, dark && styles.cardDark, { transform: [{ translateY: content }] }]}>
                    <Text style={[styles.title, dark && styles.titleDark]}>{'Recommended restaurants for ' + group.name}</Text>

                    {restaurants.length === 0 ? (
                        <Text style={[styles.empty, dark && styles.emptyDark]}>No restaurants have been recommended yet.</Text>
                    ) : (
                        <View style={styles.listWrap}>
                            {restaurants.map((r) => (
                                <View key={r.id} style={styles.restaurantRow}>
                                    <Text style={[styles.restaurantName, dark && styles.restaurantNameDark]}>{r.name}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                <TouchableOpacity style={styles.cancel} onPress={handleClose} disabled={busy}>
                    <Text style={[styles.cancelText, dark && styles.cancelTextDark]}>Close</Text>
                </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdropDark: { backgroundColor: 'rgba(0,0,0,0.6)' },
  card: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  cardDark: { backgroundColor: '#0b1114' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  titleDark: { color: '#eef2f7' },
  empty: { color: '#6b7280' },
  emptyDark: { color: '#94a3b8' },
  listWrap: { marginBottom: 8 },
  restaurantRow: { paddingVertical: 12, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: '#eceff1', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  restaurantName: { fontSize: 16, color: '#111827' },
  restaurantNameDark: { color: '#e6eef6' },
  restaurantMeta: { fontSize: 12, color: '#6b7280' },
  restaurantMetaDark: { color: '#94a3b8' },
  cancel: { marginTop: 12, paddingVertical: 10, alignItems: 'center' },
  cancelText: { color: '#ef4444', fontWeight: '700' },
  cancelTextDark: { color: '#ff9b9b' },
});