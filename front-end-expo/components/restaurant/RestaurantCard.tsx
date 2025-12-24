import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Alert } from 'react-native';
import { Restaurant } from '@/types';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { useAuth } from '@/components/AuthContext';
import { UserService } from '@/services/userService';

interface Props {
  restaurant: Restaurant;
  onRecommend: () => void;
}

const RestaurantCard: React.FC<Props> = ({ restaurant, onRecommend }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { token, refreshProfileStats } = useAuth();
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [isVisited, setIsVisited] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleFavorite = async () => {
    if (!token || loading) return;
    setLoading(true);
    try {
      const result = await UserService.toggleFavorite(restaurant.id, token);
      setIsFavorite(result.isFavorite);
      await refreshProfileStats();
    } catch (error) {
      Alert.alert('Fout', 'Kon favoriet status niet wijzigen');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkVisited = async () => {
    if (!token || loading || isVisited) return;
    setLoading(true);
    try {
      const result = await UserService.markAsVisited(restaurant.id, token);
      setIsVisited(result.hasVisited);
      await refreshProfileStats();
      Alert.alert('Succes', `${restaurant.name} is gemarkeerd als bezocht!`);
    } catch (error) {
      Alert.alert('Fout', 'Kon niet markeren als bezocht');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <View style={styles.headerRow}>
        <View style={styles.nameRow}>
          <Text style={[styles.title, isDark && styles.textDark]} numberOfLines={1}>{restaurant.name}</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={handleToggleFavorite} disabled={loading} style={styles.iconButton}>
              <Ionicons 
                name={isFavorite ? 'heart' : 'heart-outline'} 
                size={24} 
                color={isFavorite ? '#ef5350' : (isDark ? '#ffffff' : '#1f2933')} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onRecommend} style={styles.iconButton}>
              <Entypo name="add-to-list" size={24} color={isDark ? '#ffffff' : '#1f2933'} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.text, isDark && styles.textDark]}>{restaurant.adress}</Text>
        <Text style={[styles.description, isDark && styles.descriptionDark]}>{restaurant.description}</Text>
        
        <View style={styles.footer}>
          <View style={styles.contactSection}>
            <Text style={[styles.contact, isDark && styles.contactDark]}>Contact</Text>
            <Link href={`tel:${restaurant.phoneNumber}`} style={[styles.link, isDark && styles.linkDark]}>
              {restaurant.phoneNumber}
            </Link>
          </View>
          
          <TouchableOpacity 
            style={[styles.visitedButton, isVisited && styles.visitedButtonActive]}
            onPress={handleMarkVisited}
            disabled={loading || isVisited}
          >
            <Ionicons 
              name={isVisited ? 'checkmark-circle' : 'checkmark-circle-outline'} 
              size={16} 
              color={isVisited ? '#ffffff' : '#4caf50'} 
            />
            <Text style={[styles.visitedButtonText, isVisited && styles.visitedButtonTextActive]}>
              {isVisited ? 'Bezocht' : 'Markeer bezocht'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  nameRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  title: { flex: 1, fontSize: 18, fontWeight: '600', color: '#1f2933' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  iconButton: { padding: 4 },
  text: { color: '#1f2933' },
  textDark: { color: '#ffffff' },
  description: { color: '#6a7282', fontSize: 14 },
  descriptionDark: { color: '#9ca3af' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    marginTop: 4,
  },
  contactSection: {},
  contact: { color: '#1f2933', fontWeight: '500', fontSize: 14 },
  contactDark: { color: '#ffffff' },
  link: { color: '#1e00ffff', fontSize: 14 },
  linkDark: { color: '#8676ffff' },
  visitedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  visitedButtonActive: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  visitedButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4caf50',
  },
  visitedButtonTextActive: {
    color: '#ffffff',
  },
});

export default RestaurantCard;