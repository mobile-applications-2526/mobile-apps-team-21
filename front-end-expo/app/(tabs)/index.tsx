import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Modal, TextInput, TouchableOpacity, Animated, Easing } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'; // <--- Import useRouter
import { useAuth } from '@/components/AuthContext';
import GroupCard from '@/components/group/GroupCard';
import { Group, fetchGroups, createGroup } from '@/services/groupChatService';

export default function GroupsScreen() {
  const router = useRouter();
  const { token, userEmail } = useAuth();
  const insets = useSafeAreaInsets();
  
  // Data state
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // UI state
  const [groupModalOpen, setGroupModalOpen] = useState(false);

  // Animation state (add group modal)
  const fadeAnim = useState(new Animated.Value(0))[0];
  const cardAnim = useState(new Animated.Value(40))[0];

  // Form add group state
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteEmails, setInviteEmails] = useState('');
  const [groupError, setGroupError] = useState('');

  const loadGroups = async () => {
    if (!userEmail) { setLoading(false); return; }
    try {
      const data = await fetchGroups(userEmail, token || undefined);
      setGroups(data);
    } catch (e) { console.warn(e); } finally { setLoading(false); }
  };
  useEffect(() => { loadGroups(); }, [token, userEmail]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  }, [token, userEmail]);

  // --- NEW OPEN CHAT LOGIC ---
  const openChat = (group: Group) => {
    // Navigate to the new Chat Screen, passing the group as a string
    router.push({
      pathname: '/chat',
      params: { groupData: JSON.stringify(group) }
    });
  };

  const submitCreateGroup = async () => {
    if (!newGroupName.trim() || !userEmail) { setGroupError('Naam en gebruiker vereist'); return; }
    try {
      setGroupError('');
      const emails = inviteEmails.split(',').map(e => e.trim()).filter(Boolean);
      await createGroup(newGroupName.trim(), emails, userEmail, token || undefined);
      setNewGroupName(''); setInviteEmails(''); setGroupModalOpen(false); loadGroups();
    } catch (e) { setGroupError('Aanmaken mislukt'); }
  };

  const renderGroup = ({ item }: { item: Group }) => <GroupCard group={item} onOpen={openChat} />;

  // Animation for "New Group" Modal (unchanged)
  useEffect(() => {
    if (groupModalOpen) {
      fadeAnim.setValue(0);
      cardAnim.setValue(40);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(cardAnim, { toValue: 0, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true })
      ]).start();
    }
  }, [groupModalOpen]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <TouchableOpacity style={styles.newButton} onPress={() => setGroupModalOpen(true)}>
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

      {/* KEEP THE NEW GROUP MODAL (It's fine as a modal) */}
      <Modal visible={groupModalOpen} transparent animationType="none">
        <Animated.View style={[styles.modalBackdrop, { opacity: fadeAnim, paddingTop: insets.top + 250 }]}> 
            <Animated.View style={[styles.modalCard, { transform: [{ translateY: cardAnim }] }]}> 
            <Text style={styles.modalTitle}>Nieuwe Groep</Text>
            <TextInput
              placeholder="Groepsnaam"
              value={newGroupName}
              onChangeText={setNewGroupName}
              style={styles.input}
            />
            <TextInput
              placeholder="Uitnodigingen (komma gescheiden emails)"
              value={inviteEmails}
              onChangeText={setInviteEmails}
              style={styles.input}
            />
            {groupError ? <Text style={styles.error}>{groupError}</Text> : null}
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setGroupModalOpen(false)} style={styles.cancelBtn}><Text style={styles.cancelText}>Annuleer</Text></TouchableOpacity>
              <TouchableOpacity onPress={submitCreateGroup} style={styles.saveBtn}><Text style={styles.saveText}>Opslaan</Text></TouchableOpacity>
            </View>
            </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

// ... Keep your Styles ...
const styles = StyleSheet.create({
  // Copy relevant styles for list and new group modal from your original file
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1f2933' },
  newButton: { backgroundColor: '#4caf50', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 },
  newButtonText: { color: '#fff', fontWeight: '600' },
  listPad: { padding: 18 },
  empty: { textAlign: 'center', marginTop: 40, color: '#6a7282' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', padding: 24, justifyContent: 'center' },
  modalCard: { backgroundColor: '#ffffff', borderRadius: 22, paddingHorizontal: 22, paddingTop: 26, paddingBottom: 30, marginHorizontal: 6, shadowColor:'#000', shadowOpacity:0.15, shadowRadius:18, shadowOffset:{width:0,height:8}, elevation:6 },
  modalTitle: { fontSize: 20, fontWeight: '600', color: '#1f2933', marginBottom: 12 },
  input: { backgroundColor: '#eef1f5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, color: '#1f2933', marginBottom: 12 },
  error: { color: '#d32f2f', marginBottom: 8 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 10, marginRight: 8 },
  cancelText: { color: '#6a7282', fontWeight: '500' },
  saveBtn: { backgroundColor: '#4caf50', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 16 },
  saveText: { color: '#fff', fontWeight: '600' },
});