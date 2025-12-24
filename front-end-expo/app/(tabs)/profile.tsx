import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Switch,
  Alert,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/components/AuthContext';
import { useRouter, useFocusEffect, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { logout, userEmail, userProfile, profileStats, refreshProfileStats } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Refresh stats when screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshProfileStats();
    }, [refreshProfileStats])
  );

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    setLogoutModalVisible(false);
    logout();
    router.replace('/login');
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    // Open app settings so user can manage notifications
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const getInitials = () => {
    if (userProfile) {
      const firstInitial = userProfile.firstname?.charAt(0)?.toUpperCase() || '';
      const lastInitial = userProfile.name?.charAt(0)?.toUpperCase() || '';
      return `${firstInitial}${lastInitial}`;
    }
    return userEmail?.charAt(0)?.toUpperCase() || '?';
  };

  const getFullName = () => {
    if (userProfile) {
      return `${userProfile.firstname || ''} ${userProfile.name || ''}`.trim();
    }
    return 'Gebruiker';
  };

  // Calculate member since date (placeholder - could be from backend)
  const getMemberSince = () => {
    return 'Lid sinds december 2024';
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>Eat Up</Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, isDark && styles.cardDark]}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
          </View>
          <Text style={[styles.userName, isDark && styles.textDark]}>{getFullName()}</Text>
          <Text style={[styles.userEmail, isDark && styles.emailDark]}>{userEmail}</Text>
          <Text style={[styles.memberSince, isDark && styles.memberSinceDark]}>{getMemberSince()}</Text>
          
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => router.push('/profilePages/edit-profile' as Href)}
          >
            <Text style={styles.editProfileText}>Profiel Bewerken</Text>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Account</Text>
        <View style={[styles.sectionCard, isDark && styles.cardDark]}>
          <View style={[styles.menuItem, styles.menuItemBorder, isDark && styles.menuItemBorderDark]}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications-outline" size={22} color={isDark ? '#fff' : '#1f2933'} />
              <Text style={[styles.menuItemText, isDark && styles.textDark]}>Meldingen</Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={[styles.menuItemStatus, isDark && styles.menuItemStatusDark]}>
                {notificationsEnabled ? 'Aan' : 'Uit'}
              </Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={notificationsEnabled ? '#4caf50' : '#9ca3af'}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/profilePages/privacy' as Href)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="shield-outline" size={22} color={isDark ? '#fff' : '#1f2933'} />
              <Text style={[styles.menuItemText, isDark && styles.textDark]}>Privacy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
          </TouchableOpacity>
        </View>

        {/* Statistics Section */}
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Statistieken</Text>
        <View style={[styles.sectionCard, isDark && styles.cardDark]}>
          <TouchableOpacity 
            style={[styles.menuItem, styles.menuItemBorder, isDark && styles.menuItemBorderDark]}
            onPress={() => router.push('/profilePages/visited-restaurants' as Href)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="restaurant-outline" size={22} color={isDark ? '#fff' : '#1f2933'} />
              <Text style={[styles.menuItemText, isDark && styles.textDark]}>Bezochte restaurants</Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={[styles.menuItemCount, isDark && styles.textDark]}>
                {profileStats?.totalVisitedRestaurants ?? 0}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/profilePages/favorite-restaurants' as Href)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="heart-outline" size={22} color={isDark ? '#fff' : '#1f2933'} />
              <Text style={[styles.menuItemText, isDark && styles.textDark]}>Favoriete restaurants</Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={[styles.menuItemCount, isDark && styles.textDark]}>
                {profileStats?.totalFavoriteRestaurants ?? 0}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Help</Text>
        <View style={[styles.sectionCard, isDark && styles.cardDark]}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/profilePages/help-support' as Href)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={22} color={isDark ? '#fff' : '#1f2933'} />
              <Text style={[styles.menuItemText, isDark && styles.textDark]}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef5350" />
          <Text style={styles.logoutText}>Uitloggen</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, isDark && styles.textDark]}>Uitloggen</Text>
            <Text style={[styles.modalMessage, isDark && styles.modalMessageDark]}>
              Weet je zeker dat je wilt uitloggen?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton, isDark && styles.cancelButtonDark]}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, isDark && styles.cancelButtonTextDark]}>Annuleren</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmLogout}
              >
                <Text style={styles.confirmButtonText}>Uitloggen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  containerDark: { backgroundColor: '#12181f' },
  header: {
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1f2933' },
  headerTitleDark: { color: '#ffffff' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 18, paddingBottom: 40 },
  
  // Profile Card
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardDark: { backgroundColor: '#1f2933' },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#c8e6c9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#4caf50',
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1f2933',
    marginBottom: 4,
  },
  textDark: { color: '#ffffff' },
  userEmail: {
    fontSize: 14,
    color: '#6a7282',
    marginBottom: 4,
  },
  emailDark: { color: '#9ca3af' },
  memberSince: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 16,
  },
  memberSinceDark: { color: '#6b7280' },
  editProfileButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 25,
  },
  editProfileText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },

  // Section
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6a7282',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitleDark: { color: '#8894a0' },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  // Menu Items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemBorderDark: {
    borderBottomColor: '#374151',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1f2933',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuItemStatus: {
    fontSize: 14,
    color: '#6a7282',
  },
  menuItemStatusDark: { color: '#9ca3af' },
  menuItemCount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2933',
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ef5350',
    borderRadius: 25,
    marginTop: 8,
  },
  logoutText: {
    color: '#ef5350',
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  modalContentDark: { backgroundColor: '#1f2933' },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2933',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    color: '#6a7282',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalMessageDark: { color: '#9ca3af' },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonDark: { backgroundColor: '#374151' },
  cancelButtonText: {
    color: '#1f2933',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButtonTextDark: { color: '#ffffff' },
  confirmButton: {
    backgroundColor: '#ef5350',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
