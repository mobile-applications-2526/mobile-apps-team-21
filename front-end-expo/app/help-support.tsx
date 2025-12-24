import { StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function HelpSupportScreen() {
  const colorScheme = useColorScheme();

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@eatup.com');
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.text}>
          Have questions or need help? Reach out to our support team.
        </Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]} 
          onPress={handleContactSupport}
        >
          <Text style={styles.buttonText}>Email Support</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FAQ</Text>
        <View style={styles.faqItem}>
          <Text style={styles.question}>How do I create a group?</Text>
          <Text style={styles.answer}>Go to the Discover tab and click on the "Create Group" button.</Text>
        </View>
        <View style={styles.faqItem}>
          <Text style={styles.question}>How do I change my password?</Text>
          <Text style={styles.answer}>Currently, you cannot change your password in the app. Please contact support.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  faqItem: {
    marginBottom: 15,
  },
  question: {
    fontWeight: '600',
    marginBottom: 5,
  },
  answer: {
    opacity: 0.8,
    lineHeight: 20,
  },
});
