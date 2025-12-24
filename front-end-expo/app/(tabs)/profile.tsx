import { useState, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/components/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { UserService } from '@/services/userService';
import { RawUser } from '@/types';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { logout, userEmail, token } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [user, setUser] = useState<RawUser | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showNotImplementedModal, setShowNotImplementedModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [userEmail, token])
  );

  const loadUserData = async () => {
    if (!userEmail || !token) return;
    try {
      const userData = await UserService.getSelf(userEmail, token);
      setUser(userData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive", 
          onPress: () => {
            logout();
            router.replace('/login');
          }
        }
      ]
    );
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    setShowNotImplementedModal(true);
  };

  const cardBackgroundColor = colorScheme === 'dark' ? '#1c1c1e' : '#ffffff';
  const screenBackgroundColor = colorScheme === 'dark' ? '#000000' : '#f9fafb';
  const textColor = Colors[colorScheme ?? 'light'].text;
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const borderColor = Colors[colorScheme ?? 'light'].tabIconDefault;

  return (
    <ScrollView style={[styles.scrollView, { backgroundColor: screenBackgroundColor }]} contentContainerStyle={styles.scrollContent}>
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: cardBackgroundColor }]}>
        <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
                {user?.firstName ? user.firstName[0].toUpperCase() : ''}{user?.name ? user.name[0].toUpperCase() : ''}
            </Text>
        </View>
        <Text style={[styles.name, { color: textColor }]}>{user?.firstName} {user?.name}</Text>
        <Text style={styles.email}>{userEmail}</Text>
        <Text style={styles.memberSince}>Member since September 2025</Text>
        
        <TouchableOpacity 
            style={[styles.editProfileBtn, { backgroundColor: tintColor }]}
            onPress={() => router.push('../edit-profile')}
        >
            <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Account Section */}
      <Text style={styles.sectionHeader}>Account</Text>
      <View style={[styles.sectionContainer, { backgroundColor: cardBackgroundColor, borderColor: borderColor }]}>
        <View style={styles.row}>
            <View style={styles.rowLeft}>
                <Ionicons name="notifications-outline" size={24} color={textColor} />
                <Text style={[styles.rowLabel, { color: textColor }]}>Notifications</Text>
            </View>
            <View style={styles.rowRight}>
                <Text style={styles.statusText}>{notificationsEnabled ? 'On' : 'Off'}</Text>
                <TouchableOpacity onPress={toggleNotifications}>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
            </View>
        </View>
        <View style={[styles.separator, { backgroundColor: borderColor }]} />
        <TouchableOpacity style={styles.row} onPress={() => router.push('../privacy')}>
            <View style={styles.rowLeft}>
                <Ionicons name="shield-checkmark-outline" size={24} color={textColor} />
                <Text style={[styles.rowLabel, { color: textColor }]}>Privacy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Statistics Section */}
      <Text style={styles.sectionHeader}>Statistics</Text>
      <View style={[styles.sectionContainer, { backgroundColor: cardBackgroundColor, borderColor: borderColor }]}>
        <TouchableOpacity style={styles.row} onPress={() => router.push('../visited-restaurants')}>
            <View style={styles.rowLeft}>
                <Ionicons name="restaurant-outline" size={24} color={textColor} />
                <Text style={[styles.rowLabel, { color: textColor }]}>Total restaurants visited</Text>
            </View>
            <View style={styles.rowRight}>
                <Text style={styles.countText}>{user?.visitedRestaurantsCount || 0}</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
        </TouchableOpacity>
        <View style={[styles.separator, { backgroundColor: borderColor }]} />
        <TouchableOpacity style={styles.row} onPress={() => router.push('../favorite-restaurants')}>
            <View style={styles.rowLeft}>
                <Ionicons name="heart-outline" size={24} color={textColor} />
                <Text style={[styles.rowLabel, { color: textColor }]}>Favourite restaurants</Text>
            </View>
            <View style={styles.rowRight}>
                <Text style={styles.countText}>{user?.favoriteRestaurantsCount || 0}</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
        </TouchableOpacity>
      </View>

      {/* Help Section */}
      <Text style={styles.sectionHeader}>Help</Text>
      <View style={[styles.sectionContainer, { backgroundColor: cardBackgroundColor, borderColor: borderColor }]}>
        <TouchableOpacity style={styles.row} onPress={() => router.push('../help-support')}>
            <View style={styles.rowLeft}>
                <Ionicons name="help-circle-outline" size={24} color={textColor} />
                <Text style={[styles.rowLabel, { color: textColor }]}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: cardBackgroundColor }]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef5350" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {/* Not Implemented Modal */}
      <Modal
        transparent={true}
        visible={showNotImplementedModal}
        animationType="fade"
        onRequestClose={() => setShowNotImplementedModal(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: cardBackgroundColor }]}>
                <Text style={[styles.modalTitle, { color: textColor }]}>Not Implemented Yet</Text>
                <Text style={[styles.modalText, { color: textColor }]}>This feature is coming soon!</Text>
                <TouchableOpacity 
                    style={[styles.modalButton, { backgroundColor: tintColor }]}
                    onPress={() => setShowNotImplementedModal(false)}
                >
                    <Text style={styles.modalButtonText}>OK</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#a5d6a7', // Light green
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
  },
  editProfileBtn: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  editProfileText: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionContainer: {
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: '#666',
    marginRight: 8,
  },
  countText: {
    color: '#666',
    marginRight: 8,
    fontSize: 16,
  },
  separator: {
    height: 1,
    marginLeft: 52, // Align with text
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef5350',
  },
  logoutText: {
    color: '#ef5350',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
