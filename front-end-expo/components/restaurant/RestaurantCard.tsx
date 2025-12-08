import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { Restaurant } from '@/types';
import { Link } from 'expo-router';

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
        <Text style={[styles.text, isDark && styles.textDark]}>{restaurant.adress}</Text>
        <Text style={[styles.text, isDark && styles.textDark]}>{restaurant.description}</Text>
        <Text style={[styles.contact, isDark && styles.contactDark]}>Contact</Text>
        <Link href={`tel:${restaurant.phoneNumber}`} style={[styles.link, isDark && styles.linkDark]}>{restaurant.phoneNumber}</Link>
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
  headerRow: { flexDirection: 'column', alignItems: 'flex-start', rowGap: 8 },
  title: { flex: 1, fontSize: 18, fontWeight: '600', color: '#1f2933' },
  text: {color: '#1f2933' },
  textDark: { color: '#ffffff' },
  contact: {color: '#1f2933', fontWeight:'500', fontSize: 16 },
  contactDark: { color: '#ffffff' },
  link: {color: '#1e00ffff'},
  linkDark: {color: '#8676ffff'},
  badge: { backgroundColor: '#4caf50', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  meta: { marginTop: 6 },
  metaLine: { fontSize: 13, color: '#6a7282' },
  metaDark: { color: '#c4c9d1' },
  last: { marginTop: 2 },
});

export default RestaurantCard;