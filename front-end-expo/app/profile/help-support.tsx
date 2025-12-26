import { StyleSheet, TouchableOpacity, Linking, ScrollView, View, Text, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

export default function HelpSupportScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const backgroundColor = isDark ? '#12181f' : '#f5f7fa';
  const cardBackgroundColor = isDark ? '#1f2933' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1f2933';

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@eatup.com');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.section, { backgroundColor: cardBackgroundColor }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Contact Us</Text>
        <Text style={[styles.text, { color: textColor, opacity: 0.8 }]}>
          Have questions or need help? Reach out to our support team.
        </Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]} 
          onPress={handleContactSupport}
        >
          <Text style={styles.buttonText}>Email Support</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: cardBackgroundColor }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>FAQ</Text>
        <View style={styles.faqItem}>
          <Text style={[styles.question, { color: textColor }]}>How do I create a group?</Text>
          <Text style={[styles.answer, { color: textColor, opacity: 0.7 }]}>
            Go to the Chats tab and click on the "+" button to create a new group.
          </Text>
        </View>
        <View style={styles.faqItem}>
          <Text style={[styles.question, { color: textColor }]}>How do I change my password?</Text>
          <Text style={[styles.answer, { color: textColor, opacity: 0.7 }]}>
            Currently, you cannot change your password in the app. Please contact support.
          </Text>
        </View>
        <View style={styles.faqItem}>
          <Text style={[styles.question, { color: textColor }]}>How do I favorite a restaurant?</Text>
          <Text style={[styles.answer, { color: textColor, opacity: 0.7 }]}>
            On the Discover page, tap the heart icon on any restaurant card to add it to your favorites.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    marginBottom: 15,
    lineHeight: 22,
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
    fontSize: 15,
  },
  answer: {
    lineHeight: 20,
    fontSize: 14,
  },
});
