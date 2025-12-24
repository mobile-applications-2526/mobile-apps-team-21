import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { View, Text } from '@/components/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'Hoe voeg ik een restaurant toe aan mijn favorieten?',
    answer: 'Ga naar het restaurant in de Discover tab en tik op het hartje om het toe te voegen aan je favorieten. Je kunt je favorieten bekijken in je profiel.',
  },
  {
    question: 'Hoe maak ik een nieuwe groep aan?',
    answer: 'Ga naar de Chats tab en tik op "+ Groep" rechtsboven. Voer een naam in en voeg leden toe via hun e-mailadres.',
  },
  {
    question: 'Kan ik een restaurant aanbevelen aan mijn groep?',
    answer: 'Ja! In de Discover tab kun je bij elk restaurant op het lijstje-icoon tikken om het aan te bevelen aan een van je groepen.',
  },
  {
    question: 'Hoe werken de notificaties?',
    answer: 'Je ontvangt notificaties wanneer er nieuwe berichten zijn in je groepen of wanneer een restaurant voldoende stemmen heeft gekregen. Je kunt notificaties beheren in je telefooninstellingen.',
  },
  {
    question: 'Hoe kan ik mijn profiel bewerken?',
    answer: 'Ga naar je Profiel tab en tik op "Profiel Bewerken". Hier kun je je naam, telefoonnummer en wachtwoord wijzigen.',
  },
  {
    question: 'Hoe verwijder ik mijn account?',
    answer: 'Om je account te verwijderen, neem contact met ons op via de supportknop onderaan deze pagina. We verwerken je verzoek binnen 30 dagen.',
  },
];

const FAQItemComponent: React.FC<{ item: FAQItem; isDark: boolean }> = ({ item, isDark }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity 
      style={[styles.faqItem, isDark && styles.faqItemDark]} 
      onPress={toggleExpand}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <Text style={[styles.faqQuestion, isDark && styles.textDark]} numberOfLines={expanded ? undefined : 2}>
          {item.question}
        </Text>
        <Ionicons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={isDark ? '#8894a0' : '#6a7282'} 
        />
      </View>
      {expanded && (
        <Text style={[styles.faqAnswer, isDark && styles.answerDark]}>
          {item.answer}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default function HelpSupportScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@eatup.be?subject=Support%20aanvraag%20Eat%20Up%20App');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+32123456789');
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#1f2933'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Quick Actions */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            Hulp nodig?
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            We staan klaar om je te helpen. Kies hieronder hoe je contact wilt opnemen.
          </Text>
          
          <View style={styles.contactOptions}>
            <TouchableOpacity 
              style={[styles.contactOption, isDark && styles.contactOptionDark]}
              onPress={handleEmailSupport}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: '#e3f2fd' }]}>
                <Ionicons name="mail" size={24} color="#2196f3" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactTitle, isDark && styles.textDark]}>E-mail</Text>
                <Text style={[styles.contactSubtitle, isDark && styles.subtitleDark]}>
                  support@eatup.be
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.contactOption, isDark && styles.contactOptionDark]}
              onPress={handleCallSupport}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: '#e8f5e9' }]}>
                <Ionicons name="call" size={24} color="#4caf50" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactTitle, isDark && styles.textDark]}>Bellen</Text>
                <Text style={[styles.contactSubtitle, isDark && styles.subtitleDark]}>
                  +32 123 456 789
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            Veelgestelde vragen
          </Text>
          {faqData.map((item, index) => (
            <FAQItemComponent key={index} item={item} isDark={isDark} />
          ))}
        </View>

        {/* App Info */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            Over de app
          </Text>
          <View style={styles.appInfoRow}>
            <Text style={[styles.appInfoLabel, isDark && styles.paragraphDark]}>Versie</Text>
            <Text style={[styles.appInfoValue, isDark && styles.textDark]}>1.0.0</Text>
          </View>
          <View style={styles.appInfoRow}>
            <Text style={[styles.appInfoLabel, isDark && styles.paragraphDark]}>Ontwikkeld door</Text>
            <Text style={[styles.appInfoValue, isDark && styles.textDark]}>Team 21 - UCLL</Text>
          </View>
        </View>

        {/* Social Links */}
        <View style={styles.socialSection}>
          <Text style={[styles.socialTitle, isDark && styles.paragraphDark]}>
            Volg ons
          </Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity style={[styles.socialButton, isDark && styles.socialButtonDark]}>
              <Ionicons name="logo-instagram" size={24} color={isDark ? '#fff' : '#1f2933'} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, isDark && styles.socialButtonDark]}>
              <Ionicons name="logo-facebook" size={24} color={isDark ? '#fff' : '#1f2933'} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, isDark && styles.socialButtonDark]}>
              <Ionicons name="logo-twitter" size={24} color={isDark ? '#fff' : '#1f2933'} />
            </TouchableOpacity>
          </View>
        </View>
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
    marginBottom: 16,
  },
  paragraphDark: { color: '#c4c9d1' },
  contactOptions: {
    gap: 12,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  contactOptionDark: {
    backgroundColor: '#374151',
  },
  contactIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2933',
  },
  contactSubtitle: {
    fontSize: 13,
    color: '#6a7282',
    marginTop: 2,
  },
  subtitleDark: { color: '#9ca3af' },
  faqItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  faqItemDark: {
    borderBottomColor: '#374151',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2933',
    marginRight: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6a7282',
    lineHeight: 20,
    marginTop: 8,
  },
  answerDark: { color: '#9ca3af' },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  appInfoLabel: {
    fontSize: 14,
    color: '#6a7282',
  },
  appInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2933',
  },
  socialSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  socialTitle: {
    fontSize: 14,
    color: '#6a7282',
    marginBottom: 12,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  socialButtonDark: {
    backgroundColor: '#1f2933',
  },
});
