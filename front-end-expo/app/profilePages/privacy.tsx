import React from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Linking,
} from 'react-native';
import { View, Text } from '@/components/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface PrivacyItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  isDark: boolean;
}

const PrivacyItem: React.FC<PrivacyItemProps> = ({ icon, title, description, isDark }) => (
  <View style={[styles.item, isDark && styles.itemDark]}>
    <View style={[styles.iconContainer, isDark && styles.iconContainerDark]}>
      <Ionicons name={icon} size={22} color="#4caf50" />
    </View>
    <View style={styles.itemContent}>
      <Text style={[styles.itemTitle, isDark && styles.textDark]}>{title}</Text>
      <Text style={[styles.itemDescription, isDark && styles.descriptionDark]}>
        {description}
      </Text>
    </View>
  </View>
);

export default function PrivacyScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#1f2933'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Privacy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            Hoe wij je gegevens beschermen
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            Bij Eat Up nemen we je privacy serieus. Hieronder vind je informatie over hoe we omgaan met je persoonlijke gegevens.
          </Text>
        </View>

        <View style={[styles.card, isDark && styles.cardDark]}>
          <PrivacyItem
            icon="lock-closed"
            title="Beveiligde gegevens"
            description="Al je persoonlijke gegevens worden versleuteld opgeslagen en veilig verzonden via HTTPS."
            isDark={isDark}
          />
          <PrivacyItem
            icon="eye-off"
            title="Geen verkoop van gegevens"
            description="We verkopen je gegevens nooit aan derden. Je informatie wordt alleen gebruikt om de app te verbeteren."
            isDark={isDark}
          />
          <PrivacyItem
            icon="location"
            title="Locatiegegevens"
            description="We gebruiken je locatie alleen om restaurants bij jou in de buurt te tonen, en alleen met jouw toestemming."
            isDark={isDark}
          />
          <PrivacyItem
            icon="people"
            title="Groepschats"
            description="Berichten in groepschats zijn alleen zichtbaar voor groepsleden. We bewaren geen chatgeschiedenis langer dan nodig."
            isDark={isDark}
          />
          <PrivacyItem
            icon="trash"
            title="Recht op verwijdering"
            description="Je kunt op elk moment vragen om je account en alle bijbehorende gegevens te verwijderen."
            isDark={isDark}
          />
        </View>

        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            Je rechten
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            Conform de AVG (GDPR) heb je het recht om:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, isDark && styles.paragraphDark]}>
              • Je gegevens in te zien
            </Text>
            <Text style={[styles.bulletItem, isDark && styles.paragraphDark]}>
              • Je gegevens te laten corrigeren
            </Text>
            <Text style={[styles.bulletItem, isDark && styles.paragraphDark]}>
              • Je gegevens te laten verwijderen
            </Text>
            <Text style={[styles.bulletItem, isDark && styles.paragraphDark]}>
              • Je gegevens over te dragen
            </Text>
            <Text style={[styles.bulletItem, isDark && styles.paragraphDark]}>
              • Bezwaar te maken tegen verwerking
            </Text>
          </View>
        </View>

        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            Contact
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            Heb je vragen over je privacy of wil je gebruik maken van je rechten? Neem contact met ons op:
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => Linking.openURL('mailto:privacy@eatup.be')}
          >
            <Ionicons name="mail" size={18} color="#4caf50" />
            <Text style={styles.contactText}>privacy@eatup.be</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.lastUpdated, isDark && styles.lastUpdatedDark]}>
          Laatst bijgewerkt: December 2024
        </Text>
      </ScrollView>
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
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2933',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: '#6a7282',
    lineHeight: 20,
  },
  paragraphDark: { color: '#c4c9d1' },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemDark: {
    borderBottomColor: '#374151',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerDark: {
    backgroundColor: '#1b3a24',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2933',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    color: '#6a7282',
    lineHeight: 18,
  },
  descriptionDark: { color: '#8894a0' },
  bulletList: {
    marginTop: 8,
  },
  bulletItem: {
    fontSize: 14,
    color: '#6a7282',
    lineHeight: 24,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  contactText: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '500',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  lastUpdatedDark: { color: '#6b7280' },
});
