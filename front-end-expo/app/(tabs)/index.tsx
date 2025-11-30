import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router'; 
import { useAuth } from '@/components/AuthContext';
import GroupCard from '@/components/group/GroupCard';
import { Group, fetchGroups } from '@/services/groupChatService';

export default function GroupsScreen() {
  const router = useRouter();
  const { token, userEmail } = useAuth();
  
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

  // useFocusEffect automatically reloads data when you navigate back to this screen
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
      pathname: '/chatsPage/chat',
      params: { groupData: JSON.stringify(group) }
    });
  };

  // New logic: Simple navigation to the add-group page
  const handleAddGroup = () => {
    router.push('/chatsPage/add-group'); 
  };

  const renderGroup = ({ item }: { item: Group }) => <GroupCard group={item} onOpen={openChat} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <TouchableOpacity style={styles.newButton} onPress={handleAddGroup}>
          <Text style={styles.newButtonText}>+ Groep</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? <ActivityIndicator style={{ marginTop: 40 }} /> : (
        <FlatList
          data={groups}
          keyExtractor={g => g.id}
          renderItem={renderGroup}
          contentContainerStyle={styles.listPad}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>Geen groepen gevonden.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1f2933' },
  newButton: { backgroundColor: '#4caf50', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 },
  newButtonText: { color: '#fff', fontWeight: '600' },
  listPad: { padding: 18 },
  empty: { textAlign: 'center', marginTop: 40, color: '#6a7282' },
});