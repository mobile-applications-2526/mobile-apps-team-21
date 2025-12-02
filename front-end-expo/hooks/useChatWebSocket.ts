import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Group, Message, fetchMessages } from '@/services/groupChatService';
import { getWebSocketUrl } from '@/utils/apiConfig';
import { Client } from '@stomp/stompjs';
import * as TextEncoding from 'text-encoding';

// Polyfill for React Native
if (typeof global.TextEncoder === 'undefined') {
  (global as any).TextEncoder = TextEncoding.TextEncoder;
  (global as any).TextDecoder = TextEncoding.TextDecoder;
}

export interface OptimisticMessage extends Message { 
  optimistic?: boolean 
}

interface WSMessageResponse {
  id: string;
  content: string;
  timestamp: string;
  authorId?: string;
  senderId?: string;
  groupId: string;
}

export const useChatWebSocket = (chatGroup: Group | null, token: string | null, userEmail: string | null) => {
  const [messages, setMessages] = useState<OptimisticMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const stompClient = useRef<Client | null>(null);

  // Load initial history via HTTP
  const loadMessages = useCallback(async () => {
    if (!chatGroup) return;
    try {
      const data = await fetchMessages(chatGroup, token || undefined);
      setMessages(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, [chatGroup, token]);

  // Initial load
  useEffect(() => {
    if (chatGroup && userEmail) {
      loadMessages();
    }
  }, [chatGroup, userEmail, loadMessages]);

  // WebSocket Connection Logic
  useEffect(() => {
    if (!chatGroup || !token) return;

    const wsUrl = getWebSocketUrl();
    console.log('[useChatWebSocket] Initializing connection to:', wsUrl);

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      onStompError: (frame) => {
        console.warn('[useChatWebSocket] Broker error:', frame.headers['message']);
      },
    });

    client.onConnect = () => {
      console.log('[useChatWebSocket] Connected!');

      // Subscribe to group messages
      client.subscribe(`/topic/groups/${chatGroup.name}`, (message) => {
        if (message.body) {
          const receivedMsg: WSMessageResponse = JSON.parse(message.body);
          handleIncomingWSMessage(receivedMsg);
        }
      });

      // Send JOIN signal (clear notifications)
      client.publish({
        destination: `/app/groups/${chatGroup.name}/join`,
        body: JSON.stringify({}),
      });
    };

    client.activate();
    stompClient.current = client;

    return () => {
      if (client) client.deactivate();
    };
  }, [chatGroup, token]);

  // Handle incoming messages
  const handleIncomingWSMessage = (wsMsg: WSMessageResponse) => {
    let needsReload = false;
    const incomingAuthorId = wsMsg.authorId || wsMsg.senderId;

    setMessages((prev) => {
      // Match with optimistic message
      const optimisticMatch = prev.find((m) => m.optimistic && m.content === wsMsg.content);
      let resolvedAuthor = optimisticMatch?.author;

      // Try to resolve author from history
      if (!resolvedAuthor && incomingAuthorId) {
        const existing = prev.find(
          (m) =>
            (m.author as any).id === incomingAuthorId ||
            (m.author as any).email === incomingAuthorId
        );
        resolvedAuthor = existing?.author;
      }

      // Fallback & Trigger Reload
      if (!resolvedAuthor) {
        resolvedAuthor = { email: 'unknown@user.com', firstName: 'Unknown', name: 'User' };
        needsReload = true;
      }

      const newMessage: OptimisticMessage = {
        id: wsMsg.id,
        content: wsMsg.content,
        timestamp: wsMsg.timestamp,
        author: resolvedAuthor,
        isEdited: false,
        optimistic: false,
      };

      if (optimisticMatch) {
        return prev.map((m) => (m.id === optimisticMatch.id ? newMessage : m));
      }
      return [...prev, newMessage];
    });

    if (needsReload) {
      setTimeout(() => loadMessages(), 500);
    }
  };

  // Send Message Function
  const sendMessage = useCallback(async (content: string) => {
    if (!chatGroup || !userEmail || !stompClient.current) return;

    const optimisticId = 'optimistic-' + Date.now();
    const optimisticMsg: OptimisticMessage = {
      id: optimisticId,
      content,
      timestamp: new Date().toISOString(),
      author: { email: userEmail },
      isEdited: false,
      optimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const payload = {
        content,
        senderEmail: userEmail,
        groupId: chatGroup.id,
      };
      
      stompClient.current.publish({
        destination: `/app/groups/${chatGroup.name}/send`,
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn('WS Send failed', e);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
    }
  }, [chatGroup, userEmail]);

  return {
    messages,
    loading,
    sendMessage,
    refreshMessages: loadMessages
  };
};