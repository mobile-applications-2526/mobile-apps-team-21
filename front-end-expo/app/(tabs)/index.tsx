import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router'; 
import { useAuth } from '@/components/AuthContext';
import GroupCard from '@/components/group/GroupCard';
import { Group, fetchGroups } from '@/services/groupChatService';
import LoadingScreen from '@/components/LoadingScreen';

export default function GroupsScreen() {
  const router = useRouter();
  const { token, userEmail } = useAuth();
  
  // Dark Mode Logic
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Data state
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const loadGroups = async () => {
    if (!userEmail) { setLoading(false); return; }
    try {
      const data = await fetchGroups(userEmail, token || undefined);
      setGroups(data);
    } catch (e) { 
      console.warn(e); 
    } finally { 
      setLoading(false); 
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [token, userEmail])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  }, [token, userEmail]);

  const openChat = (group: Group) => {
    router.push({
      pathname: '/chatsPage/chat', // Ensure this path matches your file structure (e.g., /chat or /chatsPage/chat)
      params: { groupData: JSON.stringify(group) }
    });
  };

  const handleAddGroup = () => {
    router.push('/chatsPage/add-group'); // Ensure this path matches your file structure
  };

  const renderGroup = ({ item }: { item: Group }) => <GroupCard group={item} onOpen={openChat} />;

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>Chats</Text>
        <TouchableOpacity style={styles.newButton} onPress={handleAddGroup}>
          <Text style={styles.newButtonText}>+ Group</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? <LoadingScreen style={{ marginTop: 40 }} /> : (
        <FlatList
          data={groups}
          keyExtractor={g => g.id}
          renderItem={renderGroup}
          contentContainerStyle={styles.listPad}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={[styles.empty, isDark && styles.emptyDark]}>No groups found.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  containerDark: { backgroundColor: '#12181f' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1f2933' },
  headerTitleDark: { color: '#ffffff' },
  newButton: { backgroundColor: '#4caf50', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 },
  newButtonText: { color: '#fff', fontWeight: '600' },
  listPad: { padding: 18 },
  empty: { textAlign: 'center', marginTop: 40, color: '#6a7282' },
  emptyDark: { color: '#8894a0' },
});