import { StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function RevisitScreen() {
  return (
    <ScrollView style={{ backgroundColor: '#f9fafb' }} contentContainerStyle={styles.scrollContent} bounces={true}>
      <View style={styles.container}>
      <Text style={styles.title}>Revisit</Text>
      <Text>Replace with your Revisit UI</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
