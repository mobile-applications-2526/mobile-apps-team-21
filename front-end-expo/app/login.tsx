import React, { useState } from 'react';
import { StyleSheet, View, Text, useColorScheme } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useAuth } from '@/components/AuthContext';
import { Link, useRouter } from 'expo-router';
import FormField from '@/components/FormField';
import LoadingButton from '@/components/LoadingButton';
import { validateLogin, mapLoginError } from '@/utils/validation';
import Colors from '@/constants/Colors';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);

    const validationError = validateLogin(email, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(mapLoginError(err?.message));
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
        <Text style={[styles.title, { color: theme.text }]}>Eat Up</Text>
        <Text style={[styles.subtitle, { color: theme.tabIconDefault }]}>Ontdek restaurants samen met vrienden</Text>

        <View style={[styles.card, colorScheme === 'dark' ? styles.cardDark : null]}>
        <Text style={[styles.welcome, colorScheme === 'dark' ? styles.textDark : null]}>Welkom terug!</Text>

        <FormField
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="jouw@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <FormField
          label="Wachtwoord"
          value={password}
          onChangeText={setPassword}
          placeholder="wachtwoord"
          secureTextEntry
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <LoadingButton title="Inloggen" loading={submitting} onPress={onSubmit} />

        <Text style={[styles.register, colorScheme === 'dark' ? styles.textDark : null]}>
          Heb je nog geen account?{' '}
          <Link href={"/register" as any} asChild>
            <Text style={styles.registerLink}>Registreer hier</Text>
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
  welcome: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#1f2933',
    fontWeight: '600',
  },
  // Removed per-field styles (now in FormField component)
  error: {
    color: '#ef5350',
    marginVertical: 8,
  },
  // Button styles moved to LoadingButton component
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
