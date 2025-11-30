import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, useColorScheme, Animated, Easing } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '@/components/AuthContext';
import GroupCard from '@/components/group/GroupCard';
import { Group, Message, fetchGroups, fetchMessages, sendMessage, createGroup } from '@/services/groupChatService';

interface OptimisticMessage extends Message { optimistic?: boolean }

export default function ChatsScreen() {
  const { token, userEmail } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  
  // Data State
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // UI State
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [chatGroup, setChatGroup] = useState<Group | null>(null);
  
  // Animation State
  const fadeAnim = useState(new Animated.Value(0))[0];
  const cardAnim = useState(new Animated.Value(40))[0];

  // Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteEmails, setInviteEmails] = useState('');
  const [groupError, setGroupError] = useState('');
  const [messages, setMessages] = useState<OptimisticMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [messageSending, setMessageSending] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Memoized Messages
  const invertedMessages = React.useMemo(() => [...messages].reverse(), [messages]);

  const loadGroups = async () => {
    if (!userEmail) { setLoading(false); return; }
    try {
      const data = await fetchGroups(userEmail, token || undefined);
      setGroups(data);
    } catch (e) {
      console.warn('Failed to load groups', e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadGroups(); }, [token, userEmail]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  }, [token, userEmail]);

  const openChat = async (group: Group) => {
    setChatGroup(group);
    setMessages([]);
    setMessagesLoading(true);
    try {
      const data = await fetchMessages(group, token || undefined);
      setMessages(data);
    } catch (e) { console.warn('Failed to load messages', e); }
    finally { setMessagesLoading(false); }
  };

  const refreshMessages = async (group: Group) => {
    try {
      const data = await fetchMessages(group, token || undefined);
      setMessages(data);
    } catch (e) { console.warn('Refresh messages failed', e); }
  };

  const handleSendMessage = async () => {
    if (!chatGroup || !messageInput.trim() || !userEmail) return;
    const optimistic: OptimisticMessage = {
      id: 'optimistic-' + Date.now(),
      content: messageInput.trim(),
      timestamp: new Date().toISOString(),
      author: { email: userEmail },
      isEdited: false,
      optimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);
    const toSend = messageInput.trim();
    setMessageInput('');
    setMessageSending(true);
    try {
      await sendMessage(chatGroup, toSend, userEmail, token || undefined);
      await refreshMessages(chatGroup);
    } catch (e) {
      console.warn('Send failed', e);
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
    } finally { setMessageSending(false); }
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

  const formatTime = (iso: string) => {
    try { const d = new Date(iso); return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
  };

  const renderMessage = ({ item }: { item: OptimisticMessage }) => {
    const isMine = item.author.email === userEmail;
    const authorLabel = isMine ? 'You' : (item.author.firstName || item.author.name || (item.author.email ? item.author.email.split('@')[0] : 'User'));
    return (
      <View style={[styles.messageBubble, isMine ? styles.mine : styles.theirs]}>
        <View style={styles.messageMetaRow}>
          <Text style={[styles.metaAuthor, isMine ? styles.metaAuthorMine : styles.metaAuthorTheirs]} numberOfLines={1}>{authorLabel}</Text>
          <Text style={[styles.metaTime, isMine ? styles.metaTimeMine : styles.metaTimeTheirs]}>{formatTime(item.timestamp)}</Text>
        </View>
        <Text style={[styles.messageText, !isMine && styles.messageTextTheirs]}>{item.content}</Text>
        {item.optimistic && <Text style={styles.optimistic}>...</Text>}
      </View>
    );
  };

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
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>Chats</Text>
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
          ListEmptyComponent={<Text style={[styles.empty, isDark && styles.emptyDark]}>Geen groepen gevonden.</Text>}
        />
      )}

      <Modal visible={groupModalOpen} transparent animationType="none">
        <Animated.View style={[styles.modalBackdrop, { opacity: fadeAnim, paddingTop: insets.top + 250 }]}> 
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex:1 }}> 
            <Animated.View style={[styles.modalCard, isDark && styles.modalCardDark, { transform: [{ translateY: cardAnim }] }]}> 
            <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Nieuwe Groep</Text>
            <TextInput
              placeholder="Groepsnaam"
              placeholderTextColor={isDark ? '#8894a0' : '#99a1ab'}
              value={newGroupName}
              onChangeText={setNewGroupName}
              style={[styles.input, isDark && styles.inputDark]}
            />
            <TextInput
              placeholder="Uitnodigingen (komma gescheiden emails)"
              placeholderTextColor={isDark ? '#8894a0' : '#99a1ab'}
              value={inviteEmails}
              onChangeText={setInviteEmails}
              style={[styles.input, isDark && styles.inputDark]}
            />
            {groupError ? <Text style={styles.error}>{groupError}</Text> : null}
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setGroupModalOpen(false)} style={styles.cancelBtn}><Text style={styles.cancelText}>Annuleer</Text></TouchableOpacity>
              <TouchableOpacity onPress={submitCreateGroup} style={styles.saveBtn}><Text style={styles.saveText}>Opslaan</Text></TouchableOpacity>
            </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>

      <Modal visible={!!chatGroup} animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={[styles.chatContainer, isDark ? styles.containerDark : styles.container]}
        >
          
          <View style={[
            styles.chatHeaderWrap, 
            isDark && styles.chatHeaderWrapDark,
            { paddingTop: insets.top + 10 } 
          ]}>
            <View style={styles.chatHeader}>
              <TouchableOpacity onPress={() => setChatGroup(null)} style={styles.backTouch}>
                <MaterialIcons name="arrow-back" size={24} color={isDark ? '#fff' : '#1f2933'} />
              </TouchableOpacity>
              <View style={styles.chatHeaderText}>
                <Text style={[styles.chatTitle, isDark && styles.headerTitleDark]} numberOfLines={1}>{chatGroup?.name}</Text>
                {chatGroup && <Text style={[styles.memberCount, isDark && styles.memberCountDark]}>{chatGroup.memberNames.length} members</Text>}
              </View>
            </View>
          </View>

          {/* Messages List */}
          {messagesLoading ? (
            <ActivityIndicator style={{ marginTop: 30, flex: 1 }} />
          ) : (
            <FlatList
              inverted
              data={invertedMessages}
              keyExtractor={m => m.id}
              renderItem={renderMessage}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 16 }} 
              style={{ flex: 1 }}
              
              // NEW: This enables the swipe-to-dismiss functionality
              // keyboardDismissMode="interactive" 
              keyboardDismissMode="interactive"
            />
          )}

          <View style={[
            styles.sendRow, 
            isDark && styles.sendRowDark,
            { paddingBottom: Platform.OS === 'ios' ? insets.bottom : 10 } 
          ]}>
            <TextInput
              placeholder="Bericht"
              placeholderTextColor={isDark ? '#8894a0' : '#99a1ab'}
              value={messageInput}
              onChangeText={setMessageInput}
              style={[styles.input, styles.chatInput, isDark && styles.inputDark]}
            />
            <TouchableOpacity 
              disabled={messageSending || !messageInput.trim()} 
              onPress={handleSendMessage} 
              style={[styles.sendBtn, (messageSending || !messageInput.trim()) && styles.sendBtnDisabled]}
            >
              {messageSending ? <ActivityIndicator color="#fff" /> : <MaterialCommunityIcons name="send" size={24} color={isDark ? '#fff' : '#000'} />}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', padding: 24, justifyContent: 'center' },
  modalCard: { backgroundColor: '#ffffff', borderRadius: 22, paddingHorizontal: 22, paddingTop: 26, paddingBottom: 30, marginHorizontal: 6, shadowColor:'#000', shadowOpacity:0.15, shadowRadius:18, shadowOffset:{width:0,height:8}, elevation:6 },
  modalCardDark: { backgroundColor: '#1f2933' },
  modalTitle: { fontSize: 20, fontWeight: '600', color: '#1f2933', marginBottom: 12 },
  modalTitleDark: { color: '#fff' },
  input: { backgroundColor: '#eef1f5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, color: '#1f2933', marginBottom: 12 },
  inputDark: { backgroundColor: '#25323d', color: '#ffffff' },
  error: { color: '#d32f2f', marginBottom: 8 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 10, marginRight: 8 },
  cancelText: { color: '#6a7282', fontWeight: '500' },
  saveBtn: { backgroundColor: '#4caf50', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 16 },
  saveText: { color: '#fff', fontWeight: '600' },
  chatContainer: { flex: 1 },
  chatHeader: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 12, paddingTop: 4, paddingBottom: 4 },
  chatHeaderWrap: { backgroundColor: 'transparent' },
  chatHeaderWrapDark: { backgroundColor: 'transparent' },
  backTouch: { padding: 4, marginRight: 4 },
  chatHeaderText: { flex: 1 },
  chatTitle: { fontSize: 20, fontWeight: '700', color: '#1f2933' },
  memberCount: { marginTop: 2, fontSize: 12, color: '#6a7282' },
  memberCountDark: { color: '#c4c9d1' },
  messagesPad: { padding: 16, paddingBottom: 16 },
  messageBubble: { marginBottom: 12, maxWidth: '80%', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 18 },
  mine: { backgroundColor: '#4caf50', alignSelf: 'flex-end' },
  theirs: { backgroundColor: '#d1d9e2', alignSelf: 'flex-start' },
  messageMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  metaAuthor: { fontSize: 11, fontWeight: '600' },
  metaAuthorMine: { color: '#fff' },
  metaAuthorTheirs: { color: '#1f2933' },
  metaTime: { fontSize: 11, fontWeight: '500' },
  metaTimeMine: { color: 'rgba(255,255,255,0.85)' },
  metaTimeTheirs: { color: '#4a5568' },
  messageText: { color: '#fff', fontSize: 14, lineHeight: 18 },
  messageTextTheirs: { color: '#1f2933' },
  optimistic: { color: '#fff', fontSize: 10, marginTop: 2 },
  sendRow: { left: 0, right: 0, flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: 'transparent', borderTopWidth:1, borderTopColor:'rgba(0,0,0,0.08)' },
  sendRowDark: { backgroundColor: 'transparent', borderTopColor:'rgba(255,255,255,0.12)' },
  chatInput: { flex: 1, marginBottom: 0, marginRight: 10 },
  sendBtn: { backgroundColor: '#4caf50', paddingHorizontal: 20, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
  sendText: { color: '#fff', fontWeight: '600' },
});