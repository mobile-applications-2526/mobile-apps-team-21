import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/components/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <Redirect href="/(tabs)" /> : <Redirect href="/login" />;
}
