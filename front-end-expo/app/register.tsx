import React, { useState } from 'react';
import { StyleSheet, View, Text, useColorScheme } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useAuth } from '@/components/AuthContext';
import { UserService } from '@/services/userService';
import { useRouter, Link } from 'expo-router';
import Colors from '@/constants/Colors';
import FormField from '@/components/FormField';
import LoadingButton from '@/components/LoadingButton';
import { validateRegister, mapRegisterError } from '@/utils/validation';

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

    const validationError = validateRegister({ firstName, name, email, phoneNumber, password });
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await UserService.register({ email: email.trim(), password, name, firstName, phoneNumber });
      // Reuse login to store token in context
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(mapRegisterError(err?.message));
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
          <View style={styles.row}>
            <View style={[styles.col, { marginRight: 8 }]}>
              <FormField
                label="Voornaam"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Voornaam"
              />
            </View>
            <View style={[styles.col, { marginLeft: 8 }]}>
              <FormField
                label="Naam"
                value={name}
                onChangeText={setName}
                placeholder="Naam"
              />
            </View>
          </View>

          <FormField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="jouw@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FormField
            label="Telefoonnummer"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="bv. 0470 12 34 56"
            keyboardType="phone-pad"
          />
          <FormField
            label="Wachtwoord"
            value={password}
            onChangeText={setPassword}
            placeholder="wachtwoord"
            secureTextEntry
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <LoadingButton title="Account aanmaken" loading={submitting} onPress={onSubmit} />

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
  // Removed duplicated field styles (now handled by FormField)
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
