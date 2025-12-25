import { Group, SuggestedRestaurant } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from "../AuthContext";
import { useFocusEffect } from "expo-router";
import { fetchRecommendedRestaurants, removeSuggestion, unvoteSuggestion, voteSuggestion } from "@/services/groupChatService";
import Feedback from "../Feedback";
import Foundation from '@expo/vector-icons/Foundation';

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
    const [restaurants, setRestaurants] = useState<SuggestedRestaurant[]>([])
    const [refreshing, setRefreshing] = useState(false)

    const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        if (visible) {
            setLocalVisible(true);
            loadRestaurants();
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

const toFeedback = (res: unknown, successDefault: string) => {
    // Check if it's an Error object
    if (res instanceof Error) {
        // If error message contains "success", treat as success
        if (res.message.toLowerCase().includes('success') || res.message.toLowerCase().includes('successful')) {
            return { message: res.message, type: 'success' as const };
        }
        return { message: res.message, type: 'error' as const };
    }
    // Check if it's a string
    if (typeof res === 'string') {
        const lower = res.toLowerCase();
        if (lower.startsWith('error')) {
            return { message: res.replace(/^error:\s*/i, '').trim(), type: 'error' as const };
        }
        else return { message: res, type: 'success' as const };
    }
    return { message: successDefault, type: 'success' as const };
};

    const vote = async (s: SuggestedRestaurant) => {
        try {
            const res = await voteSuggestion(group.id, s.id, token || undefined);
            await loadRestaurants();
            setFeedback(toFeedback(res, 'Voted'));
        } catch (e) {
            console.warn('vote failed', e);
            setFeedback({ message: e instanceof Error ? e.message : 'Vote failed', type: 'error' });
        }
    };

    const unvote = async (s: SuggestedRestaurant) => {
        try {
            const res = await unvoteSuggestion(group.id, s.id, token || undefined);
            await loadRestaurants();
            setFeedback(toFeedback(res, 'Unvoted'));
        } catch (e) {
            console.warn('unvote failed', e);
            setFeedback({ message: e instanceof Error ? e.message : 'Unvote failed', type: 'error' });
        }
    };

    const remove = async (s: SuggestedRestaurant) => {
        try {
            const res = await removeSuggestion(group.id, s.id, token || undefined);
            await loadRestaurants();
            setFeedback(toFeedback(res, 'Suggestion removed.'));
        } catch (e) {
            console.warn('remove failed', e);
            setFeedback({ message: e instanceof Error ? e.message : 'Remove failed', type: 'error' });
        }
    };

    if (!localVisible) return null;

    return (
        <Modal transparent animationType="none" visible={true} onRequestClose={onRequestClose}>
            <Animated.View style={[styles.backdrop, dark && styles.backdropDark, { opacity: backdrop }]}>
                <Animated.View style={[styles.card, dark && styles.cardDark, { transform: [{ translateY: content }] }]}>
                    <Text style={[styles.title, dark && styles.titleDark]}>{'Recommended restaurants for ' + group.name}</Text>

                    {restaurants.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.empty, dark && styles.emptyDark]}>No restaurants have been recommended yet.</Text>
                        </View>
                    ) : (
                        <View style={styles.listWrap}>
                            {restaurants.map((s) => (
                                <View key={s.id} style={[styles.restaurantCard, dark && styles.restaurantCardDark]}>
                                    <View style={styles.restaurantContent}>
                                        <View style={styles.textContainer}>
                                            <Text style={[styles.restaurantName, dark && styles.restaurantNameDark]}>{s.restaurant.name}</Text>
                                            <Text style={[styles.restaurantMeta, dark && styles.restaurantMetaDark]}>{s.voters.length} vote(s)</Text>
                                        </View>
                                        <View style={styles.actions}>
                                            {s.recommenderEmail === userEmail && (
                                                <TouchableOpacity 
                                                    style={[styles.actionButton, styles.removeButton]}
                                                    onPress={async () => { setBusy(true); await remove(s); setBusy(false); }}
                                                >
                                                    <Foundation name="minus-circle" size={22} color="#ef4444" />
                                                </TouchableOpacity>
                                            )}
                                            {s.voters.includes(userEmail || '') ? (
                                                <TouchableOpacity 
                                                    style={[styles.actionButton, styles.unvoteButton]}
                                                    onPress={async () => { setBusy(true); await unvote(s); setBusy(false); }}
                                                >
                                                    <Foundation name="dislike" size={22} color="#ef4444" />
                                                </TouchableOpacity>
                                            ) : (
                                                <TouchableOpacity 
                                                    style={[styles.actionButton, styles.voteButton]}
                                                    onPress={async () => { setBusy(true); await vote(s); setBusy(false); }}
                                                >
                                                    <Foundation name="like" size={22} color="#4caf50" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    <TouchableOpacity style={[styles.cancelBtn, dark && styles.cancelBtnDark]} onPress={handleClose} disabled={busy}>
                        <Text style={styles.cancelText}>Close</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
            <Feedback
                visible={Boolean(feedback)}
                message={String(feedback?.message ?? "")}
                type={feedback?.type ?? "success"}
                onHide={() => setFeedback(null)}
                dark={dark}
            />
        </Modal>
    )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdropDark: { backgroundColor: 'rgba(0,0,0,0.7)' },
  card: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#f5f7fa',
    borderRadius: 16,
    padding: 20,
  },
  cardDark: { backgroundColor: '#12181f' },
  title: { 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 16,
    color: '#1f2933',
  },
  titleDark: { color: '#ffffff' },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  empty: { 
    color: '#6b7280',
    fontSize: 15,
  },
  emptyDark: { color: '#94a3b8' },
  listWrap: { 
    gap: 12,
    marginBottom: 8,
  },
  restaurantCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  restaurantCardDark: {
    backgroundColor: '#1f2933',
  },
  restaurantContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  restaurantName: { 
    fontSize: 17, 
    fontWeight: '600',
    color: '#1f2933',
    marginBottom: 4,
  },
  restaurantNameDark: { color: '#ffffff' },
  restaurantMeta: { 
    fontSize: 14, 
    color: '#6b7280',
  },
  restaurantMetaDark: { color: '#94a3b8' },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voteButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  unvoteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  removeButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  cancelBtn: { 
    marginTop: 16, 
    paddingVertical: 14, 
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
  },
  cancelBtnDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  cancelText: { 
    color: '#ef4444', 
    fontWeight: '700',
    fontSize: 16,
  },
});