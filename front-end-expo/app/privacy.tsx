import { StyleSheet, Switch } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useState } from 'react';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function PrivacyScreen() {
  const [shareData, setShareData] = useState(false);
  const colorScheme = useColorScheme();

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Privacy</Text>
        <View style={styles.row}>
          <Text style={styles.rowText}>Share usage data</Text>
          <Switch
            value={shareData}
            onValueChange={setShareData}
            trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].tint }}
            thumbColor={shareData ? '#fff' : '#f4f3f4'}
          />
        </View>
        <Text style={styles.description}>
          Help us improve EatUp by sharing anonymous usage data.
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Terms of Service</Text>
        <Text style={styles.text}>
          By using this app, you agree to our Terms of Service and Privacy Policy.
        </Text>
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
    opacity: 0.6,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
});
