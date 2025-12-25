import { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, View, Text, useColorScheme } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'expo-router';
import { UserService } from '@/services/userService';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import LoadingScreen from '@/components/LoadingScreen';

export default function EditProfileScreen() {
  const { userEmail, token } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const backgroundColor = isDark ? '#12181f' : '#f5f7fa';
  const cardBackgroundColor = isDark ? '#1f2933' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1f2933';

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
    
    // Password validation
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      if (newPassword.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return;
      }
    }
    
    setLoading(true);
    try {
      await UserService.updateProfile(userEmail, token, {
        name,
        firstName,
        phoneNumber,
        password: newPassword || undefined
      });
      
      Alert.alert('Success', 'Profile updated successfully');
      setNewPassword('');
      setConfirmPassword('');
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <LoadingScreen />;
  }

  return (
    <KeyboardAwareScrollView 
      style={[styles.container, { backgroundColor }]} 
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
      extraScrollHeight={80}
      enableAutomaticScroll={true}
    >
      <View style={[styles.formCard, { backgroundColor: cardBackgroundColor }]}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: textColor }]}>First Name</Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: Colors[colorScheme ?? 'light'].tabIconDefault}]}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First Name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: textColor }]}>Last Name</Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: Colors[colorScheme ?? 'light'].tabIconDefault}]}
            value={name}
            onChangeText={setName}
            placeholder="Last Name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: textColor }]}>Phone Number</Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: Colors[colorScheme ?? 'light'].tabIconDefault}]}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Phone Number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={[styles.formCard, { backgroundColor: cardBackgroundColor, marginTop: 16 }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Change Password</Text>
        <Text style={[styles.sectionDescription, { color: textColor, opacity: 0.6 }]}>
          Leave empty to keep your current password
        </Text>

        <View style={[styles.formGroup, { marginTop: 16 }]}>
          <Text style={[styles.label, { color: textColor }]}>New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, { color: textColor, borderColor: Colors[colorScheme ?? 'light'].tabIconDefault}]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New Password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              style={styles.eyeButton} 
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                size={22} 
                color={textColor} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: textColor }]}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, { color: textColor, borderColor: Colors[colorScheme ?? 'light'].tabIconDefault}]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity 
              style={styles.eyeButton} 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons 
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                size={22} 
                color={textColor} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.saveBtn, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]} 
        onPress={handleSave} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveBtnText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCard: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    borderWidth: 0,
  },
  eyeButton: {
    padding: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
  },
  saveBtn: {
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
