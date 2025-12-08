import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { Restaurant } from '@/types';

interface Props {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<Props> = ({ restaurant }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity style={[styles.card, isDark && styles.cardDark]} onPress={() => null} activeOpacity={0.7}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, isDark && styles.textDark]} numberOfLines={1}>{restaurant.name}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1f2933',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  title: { flex: 1, fontSize: 18, fontWeight: '600', color: '#1f2933' },
  textDark: { color: '#ffffff' },
  badge: { backgroundColor: '#4caf50', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  meta: { marginTop: 6 },
  metaLine: { fontSize: 13, color: '#6a7282' },
  metaDark: { color: '#c4c9d1' },
  last: { marginTop: 2 },
});

export default RestaurantCard;