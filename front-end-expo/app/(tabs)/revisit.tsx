import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function RevisitScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Revisit</Text>
      <Text>Replace with your Revisit UI</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
