import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { View, Text } from '@/components/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/components/AuthContext';
import { UserService } from '@/services/userService';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen() {
  const router = useRouter();
  const { token, userEmail, userProfile, refreshUserProfile } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setFirstName(userProfile.firstname || '');
      setPhoneNumber(userProfile.phoneNumber || '');
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('Fout', 'Wachtwoorden komen niet overeen');
      return;
    }

    if (!token || !userEmail) {
      Alert.alert('Fout', 'Niet ingelogd');
      return;
    }

    setLoading(true);
    try {
      const updates: { name?: string; firstName?: string; phoneNumber?: string; password?: string } = {};
      
      if (name && name !== userProfile?.name) updates.name = name;
      if (firstName && firstName !== userProfile?.firstname) updates.firstName = firstName;
      if (phoneNumber !== userProfile?.phoneNumber) updates.phoneNumber = phoneNumber;
      if (newPassword) updates.password = newPassword;

      if (Object.keys(updates).length === 0) {
        Alert.alert('Info', 'Geen wijzigingen om op te slaan');
        setLoading(false);
        return;
      }

      const result = await UserService.updateProfile(userEmail, token, updates);
      await refreshUserProfile();
      
      Alert.alert('Succes', result.join('\n'), [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Fout', 'Kon profiel niet bijwerken');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#1f2933'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Profiel Bewerken</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.card, isDark && styles.cardDark]}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Voornaam</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Voornaam"
              placeholderTextColor={isDark ? '#8894a0' : '#9ca3af'}
            />

            <Text style={[styles.label, isDark && styles.labelDark]}>Achternaam</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={name}
              onChangeText={setName}
              placeholder="Achternaam"
              placeholderTextColor={isDark ? '#8894a0' : '#9ca3af'}
            />

            <Text style={[styles.label, isDark && styles.labelDark]}>Telefoonnummer</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Telefoonnummer"
              placeholderTextColor={isDark ? '#8894a0' : '#9ca3af'}
              keyboardType="phone-pad"
            />

            <Text style={[styles.label, isDark && styles.labelDark]}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled, isDark && styles.inputDark]}
              value={userEmail || ''}
              editable={false}
              placeholder="Email"
              placeholderTextColor={isDark ? '#8894a0' : '#9ca3af'}
            />
          </View>

          <View style={[styles.card, isDark && styles.cardDark]}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Wachtwoord Wijzigen</Text>
            <Text style={[styles.hint, isDark && styles.hintDark]}>
              Laat leeg om huidige wachtwoord te behouden
            </Text>

            <Text style={[styles.label, isDark && styles.labelDark]}>Nieuw Wachtwoord</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput, isDark && styles.inputDark]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nieuw wachtwoord"
                placeholderTextColor={isDark ? '#8894a0' : '#9ca3af'}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={isDark ? '#8894a0' : '#6a7282'} 
                />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, isDark && styles.labelDark]}>Bevestig Wachtwoord</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Bevestig wachtwoord"
              placeholderTextColor={isDark ? '#8894a0' : '#9ca3af'}
              secureTextEntry={!showPassword}
            />
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Opslaan</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  containerDark: { backgroundColor: '#12181f' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1f2933' },
  textDark: { color: '#ffffff' },
  placeholder: { width: 32 },
  scrollContent: { padding: 18 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardDark: { backgroundColor: '#1f2933' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2933',
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    color: '#6a7282',
    marginBottom: 12,
  },
  hintDark: { color: '#8894a0' },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },
  labelDark: { color: '#d1d5db' },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#1f2933',
  },
  inputDark: {
    backgroundColor: '#374151',
    color: '#ffffff',
  },
  inputDisabled: {
    opacity: 0.6,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 44,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  saveButton: {
    backgroundColor: '#4caf50',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
