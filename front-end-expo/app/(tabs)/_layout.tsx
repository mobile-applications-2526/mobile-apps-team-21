import React from 'react';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: {
          // kleur van tab bar
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          //lijn boven de tab bar
          borderTopColor: 'rgba(0,0,0,0.05)',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chats',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubbles-outline" color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="compass-outline" color={color} size={24}/>
          ),
        }}
      />
      <Tabs.Screen
        name="revisit"
        options={{
          title: 'Revisit',
          tabBarIcon: ({ color }) => (
            <Ionicons name="time-outline" color={color} size={24}/>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" color={color} size={24}/>
          ),
        }}
      />
    </Tabs>
  );
}
