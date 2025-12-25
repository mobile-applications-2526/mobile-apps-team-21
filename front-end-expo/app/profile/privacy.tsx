import { StyleSheet, Switch, ScrollView, View, Text, useColorScheme } from 'react-native';
import { useState } from 'react';
import Colors from '@/constants/Colors';

export default function PrivacyScreen() {
  const [shareData, setShareData] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = isDark ? '#12181f' : '#f5f7fa';
  const cardBackgroundColor = isDark ? '#1f2933' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1f2933';

  return (
    <ScrollView style={[styles.container, { backgroundColor }]} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.section, { backgroundColor: cardBackgroundColor }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Data Privacy</Text>
        <View style={styles.row}>
          <Text style={[styles.rowText, { color: textColor }]}>Share usage data</Text>
          <Switch
            value={shareData}
            onValueChange={setShareData}
            trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].tint }}
            thumbColor={shareData ? '#fff' : '#f4f3f4'}
          />
        </View>
        <Text style={[styles.description, { color: textColor, opacity: 0.6 }]}>
          Help us improve EatUp by sharing anonymous usage data.
        </Text>
      </View>
      
      <View style={[styles.section, { backgroundColor: cardBackgroundColor }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Terms of Service</Text>
        <Text style={[styles.text, { color: textColor, opacity: 0.8 }]}>
          By using this app, you agree to our Terms of Service and Privacy Policy.
        </Text>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rowText: {
    fontSize: 16,
  },
  description: {
    fontSize: 14,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
});
