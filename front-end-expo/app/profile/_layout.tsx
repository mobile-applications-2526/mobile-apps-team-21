import { Stack, useRouter } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function ProfileLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  
  const headerStyle = {
    backgroundColor: isDark ? '#12181f' : '#f5f7fa',
  };
  
  const headerTintColor = isDark ? '#ffffff' : '#1f2933';
  const headerTitleStyle = {
    color: isDark ? '#ffffff' : '#1f2933',
    fontWeight: '700' as const,
    fontSize: 18,
  };

  const BackButton = () => (
    <TouchableOpacity onPress={() => router.back()} style={{ padding: 4, marginLeft: 8 }}>
      <MaterialIcons name="arrow-back" size={24} color={isDark ? '#ffffff' : '#1f2933'} />
    </TouchableOpacity>
  );

  return (
    <Stack
      screenOptions={{
        headerStyle,
        headerTintColor,
        headerTitleStyle,
        headerShadowVisible: true,
        headerLeft: () => <BackButton />,
        headerTitleAlign: 'center',
        headerBackVisible: false,
      }}
    >
      <Stack.Screen 
        name="edit-profile" 
        options={{ 
          title: 'Edit Profile',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="favorite-restaurants" 
        options={{ 
          title: 'Favorite Restaurants',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="visited-restaurants" 
        options={{ 
          title: 'Visited Restaurants',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="help-support" 
        options={{ 
          title: 'Help & Support',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="privacy" 
        options={{ 
          title: 'Privacy',
          headerShown: true,
        }} 
      />
    </Stack>
  );
}
