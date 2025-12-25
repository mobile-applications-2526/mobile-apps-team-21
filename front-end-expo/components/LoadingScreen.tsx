import { View, ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

interface LoadingScreenProps {
  /** Override the default full-screen behavior */
  style?: object;
}

/**
 * A reusable full-screen loading component with the app's green tint color.
 * Use this for page-level loading states.
 */
export default function LoadingScreen({ style }: LoadingScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? '#12181f' : '#f5f7fa';
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <ActivityIndicator size="large" color={tintColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
