import { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'expo-router';
import { UserService } from '@/services/userService';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function EditProfileScreen() {
  const { userEmail, token } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (!userEmail || !token) return;
    try {
      const user = await UserService.getSelf(userEmail, token);
      setName(user.name || '');
      setFirstName(user.firstName || '');
      setPhoneNumber(user.phoneNumber || '');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userEmail || !token) return;
    setLoading(true);
    try {
      // The backend expects a RegisterRequest object, but we only send fields we want to update
      // We need to check how modifySelf is implemented. It takes RegisterRequest.
      // We can send empty strings for fields we don't want to update if the backend handles it,
      // or send current values.
      // Based on backend code: checks if not null and not empty.
      
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users?email=${encodeURIComponent(userEmail)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          firstName,
          phoneNumber,
          email: userEmail, // Required by RegisterRequest but not used for lookup in modifySelf (it uses param)
          password: '' // Don't update password
        })
      });
      
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={[styles.input, { color: Colors[colorScheme ?? 'light'].text, borderColor: Colors[colorScheme ?? 'light'].tabIconDefault }]}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First Name"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={[styles.input, { color: Colors[colorScheme ?? 'light'].text, borderColor: Colors[colorScheme ?? 'light'].tabIconDefault }]}
          value={name}
          onChangeText={setName}
          placeholder="Last Name"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={[styles.input, { color: Colors[colorScheme ?? 'light'].text, borderColor: Colors[colorScheme ?? 'light'].tabIconDefault }]}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Phone Number"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveBtnText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: '#4caf50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
