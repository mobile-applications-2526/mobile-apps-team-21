import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '@/components/AuthContext';
import { Group, Message, fetchMessages, sendMessage } from '@/services/groupChatService';

interface OptimisticMessage extends Message { optimistic?: boolean }

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token, userEmail } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Parse the group passed from the previous screen
  const chatGroup = useMemo(() => {
    try {
      return params.groupData ? JSON.parse(params.groupData as string) as Group : null;
    } catch (e) {
      return null;
    }
  }, [params.groupData]);

  const [messages, setMessages] = useState<OptimisticMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [messageSending, setMessageSending] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(true);

  // Memoized Messages for Inverted List
  const invertedMessages = useMemo(() => [...messages].reverse(), [messages]);

  // Fetch messages on mount
  useEffect(() => {
    if (chatGroup && userEmail) {
      loadMessages();
    }
  }, [chatGroup, userEmail]);

  const loadMessages = async () => {
    if (!chatGroup) return;
    try {
      const data = await fetchMessages(chatGroup, token || undefined);
      setMessages(data);
    } catch (e) { console.warn(e); } 
    finally { setMessagesLoading(false); }
  };

  const handleSendMessage = async () => {
    if (!chatGroup || !messageInput.trim() || !userEmail) return;
    const optimistic: OptimisticMessage = {
      id: 'optimistic-' + Date.now(),
      content: messageInput.trim(),
      timestamp: new Date().toISOString(),
      author: { email: userEmail },
      isEdited: false, optimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);
    const toSend = messageInput.trim();
    setMessageInput('');
    setMessageSending(true);
    try {
      await sendMessage(chatGroup, toSend, userEmail, token || undefined);
      await loadMessages();
    } catch (e) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
    } finally { setMessageSending(false); }
  };

  const formatTime = (iso: string) => { try { const d = new Date(iso); return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

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

  if (!chatGroup) return <ActivityIndicator style={{flex:1}} />;

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top', 'bottom']}>
      {/* Hide default header so we can use your custom one */}
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={[styles.chatHeaderWrap, isDark && styles.chatHeaderWrapDark]}>
          <View style={styles.chatHeader}>
            {/* Native Back Navigation */}
            <TouchableOpacity onPress={() => router.back()} style={styles.backTouch}>
              <MaterialIcons name="arrow-back" size={24} color={isDark ? '#fff' : '#1f2933'} />
            </TouchableOpacity>
            <View style={styles.chatHeaderText}>
              <Text style={[styles.chatTitle, isDark && styles.headerTitleDark]} numberOfLines={1}>{chatGroup.name}</Text>
              <Text style={[styles.memberCount, isDark && styles.memberCountDark]}>{chatGroup.memberNames.length} members</Text>
            </View>
          </View>
        </View>

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
            keyboardDismissMode="interactive" // Native interactive dismiss
            keyboardShouldPersistTaps="handled"
            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          />
        )}

        <View style={[styles.sendRow, isDark && styles.sendRowDark]}>
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
    </SafeAreaView>
  );
}

// Reuse your styles here
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  containerDark: { backgroundColor: '#12181f' },
  chatHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 10 },
  chatHeaderWrap: { backgroundColor: 'transparent', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  chatHeaderWrapDark: { borderBottomColor: 'rgba(255,255,255,0.1)' },
  backTouch: { padding: 8, marginRight: 8 },
  chatHeaderText: { flex: 1 },
  chatTitle: { fontSize: 18, fontWeight: '700', color: '#1f2933' },
  headerTitleDark: { color: '#ffffff' },
  memberCount: { fontSize: 12, color: '#6a7282' },
  memberCountDark: { color: '#c4c9d1' },
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
  sendRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: 'transparent', borderTopWidth:1, borderTopColor:'rgba(0,0,0,0.08)' },
  sendRowDark: { backgroundColor: 'transparent', borderTopColor:'rgba(255,255,255,0.12)' },
  chatInput: { flex: 1, marginBottom: 0, marginRight: 10 },
  input: { backgroundColor: '#eef1f5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, color: '#1f2933' },
  inputDark: { backgroundColor: '#25323d', color: '#ffffff' },
  sendBtn: { backgroundColor: '#4caf50', paddingHorizontal: 20, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
});