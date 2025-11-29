import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Text, useColorScheme } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useAuth } from '@/components/AuthContext';
import { UserService } from '@/services/userService';
import { useRouter, Link } from 'expo-router';
import Colors from '@/constants/Colors';

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [firstName, setFirstName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await UserService.register({ email: email.trim(), password, name, firstName, phoneNumber });
      // Reuse login to store token in context
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err?.message || 'Registreren mislukt');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.background }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
      extraScrollHeight={80}
      enableAutomaticScroll={true}
    >
      <View style={[styles.page, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>Registreren</Text>
        <Text style={[styles.subtitle, { color: theme.tabIconDefault }]}>Maak je Eat Up account aan</Text>

        <View style={[styles.card, colorScheme === 'dark' ? styles.cardDark : null]}>
          <View style={[styles.row, colorScheme === 'dark' ? styles.cardDark : null]}>
            <View style={[styles.col, { marginRight: 8 }, colorScheme === 'dark' ? styles.cardDark : null]}>
              <Text style={[styles.label, colorScheme === 'dark' ? styles.textDark : null]}>Voornaam</Text>
              <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Voornaam" placeholderTextColor={colorScheme === 'dark' ? '#999' : '#999'} />
            </View>
            <View style={[styles.col, { marginLeft: 8 }, colorScheme === 'dark' ? styles.cardDark : null]}>
              <Text style={[styles.label, colorScheme === 'dark' ? styles.textDark : null]}>Naam</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Naam" placeholderTextColor={colorScheme === 'dark' ? '#999' : '#999'} />
            </View>
          </View>

          <View style={[styles.inputGroup, colorScheme === 'dark' ? styles.cardDark : null]}>
            <Text style={[styles.label, colorScheme === 'dark' ? styles.textDark : null]}>E-mail</Text>
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              placeholder="jouw@email.com"
              placeholderTextColor={colorScheme === 'dark' ? '#999' : '#999'}
            />
          </View>

          <View style={[styles.inputGroup, colorScheme === 'dark' ? styles.cardDark : null]}>
            <Text style={[styles.label, colorScheme === 'dark' ? styles.textDark : null]}>Telefoonnummer</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="bv. 0470 12 34 56"
              placeholderTextColor={colorScheme === 'dark' ? '#999' : '#999'}
            />
          </View>

          <View style={[styles.inputGroup, colorScheme === 'dark' ? styles.cardDark : null]}>
            <Text style={[styles.label, colorScheme === 'dark' ? styles.textDark : null]}>Wachtwoord</Text>
            <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} placeholder="wachtwoord" placeholderTextColor={colorScheme === 'dark' ? '#999' : '#999'} />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity style={[styles.button, submitting && styles.buttonDisabled]} onPress={onSubmit} disabled={submitting}>
            <Text style={styles.buttonText}>Account aanmaken</Text>
          </TouchableOpacity>

          <Text style={[styles.register, colorScheme === 'dark' ? styles.textDark : null]}>
            Heb je al een account?{' '}
            <Link href={"/login" as any} asChild>
              <Text style={styles.registerLink}>Inloggen</Text>
            </Link>
          </Text>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#f9fafb',
  },
  page: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
    color: '#1f2933',
    marginTop: 60,
    fontSize: 28,
  },
  subtitle: {
    textAlign: 'center',
    color: '#6a7282',
    marginTop: 8,
  },
  card: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
  },
  col: {
    flex: 1,
  },
  inputGroup: {
    marginVertical: 10,
  },
  label: {
    marginBottom: 6,
    color: '#1f2933',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  error: {
    color: '#ef5350',
    marginVertical: 8,
  },
  button: {
    backgroundColor: '#4caf50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  register: {
    textAlign: 'center',
    marginTop: 12,
    color: '#6a7282',
  },
  registerLink: {
    color: '#4caf50',
  },
  cardDark: {
    backgroundColor: '#1f2933',
  },
  textDark: {
    color: '#ffffff',
  },
  inputDark: {
    backgroundColor: '#2d3748',
    color: '#ffffff',
  },
});
