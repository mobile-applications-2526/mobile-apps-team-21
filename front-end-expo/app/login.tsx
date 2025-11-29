import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err?.message || 'Inloggen mislukt');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Eat Up</Text>
      <Text style={styles.subtitle}>Ontdek restaurants samen met vrienden</Text>

      <View style={styles.card}>
        <Text style={styles.welcome}>Welkom terug!</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            keyboardType="email-address"
            placeholder="jouw@email.com"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Wachtwoord</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="wachtwoord"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={[styles.button, submitting && styles.buttonDisabled]} onPress={onSubmit} disabled={submitting}>
          <Text style={styles.buttonText}>Inloggen</Text>
        </TouchableOpacity>

        <Text style={styles.register}>
          Heb je nog geen account? <Text style={styles.registerLink}>Registreer hier</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
    color: '#1f2933',
    marginTop: 192,
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
  welcome: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#1f2933',
    fontWeight: '600',
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
});
