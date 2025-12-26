import { Stack } from 'expo-router';

export default function ChatsPageLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="chat" />
      <Stack.Screen name="add-group" />
      <Stack.Screen name="group-members" />
    </Stack>
  );
}
