import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { logout, userEmail } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profiel</Text>
      {userEmail && <Text style={styles.email}>{userEmail}</Text>}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Uitloggen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    marginBottom: 20,
    color: '#6a7282',
  },
  logoutBtn: {
    backgroundColor: '#ef5350',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
