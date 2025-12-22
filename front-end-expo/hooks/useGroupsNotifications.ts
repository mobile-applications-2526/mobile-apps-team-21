import { useEffect, useRef } from 'react';
import { Client, StompSubscription } from '@stomp/stompjs';
import { getWebSocketUrl } from '@/utils/apiConfig';
import { Group } from '@/services/groupChatService';
import * as TextEncoding from 'text-encoding';

// Polyfill for React Native
if (typeof global.TextEncoder === 'undefined') {
  (global as any).TextEncoder = TextEncoding.TextEncoder;
  (global as any).TextDecoder = TextEncoding.TextDecoder;
}

export const useGroupsNotifications = (
  groups: Group[],
  token: string | null,
  userId: string | null,
  onMessageReceived: (groupId: string) => void
) => {
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<string, StompSubscription>>(new Map());
  const groupsRef = useRef<Group[]>(groups);
  const userIdRef = useRef<string | null>(userId);

  // Keep refs up to date
  useEffect(() => {
    groupsRef.current = groups;
  }, [groups]);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    if (!token) return;

    const wsUrl = getWebSocketUrl();
    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
    });

    client.onConnect = () => {
      // Subscribe to all current groups
      groupsRef.current.forEach(group => {
        if (!subscriptionsRef.current.has(group.id)) {
            const sub = client.subscribe(`/topic/groups/${group.name}`, (message) => {
                if (message.body) {
                    try {
                        const msgData = JSON.parse(message.body);
                        console.log('WS Message:', msgData);
                        console.log('Current User ID:', userIdRef.current);
                        console.log('Author ID:', msgData.authorId);
                        // Check if the message is from the current user
                        if (userIdRef.current && msgData.authorId === userIdRef.current) {
                            return; // Ignore own messages
                        }
                        onMessageReceived(group.id);
                    } catch (e) {
                        console.warn('Failed to parse notification message', e);
                    }
                }
            });
            subscriptionsRef.current.set(group.id, sub);
        }
      });
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      subscriptionsRef.current.clear();
    };
  }, [token]); // Only run on token change

  // Effect to handle groups list changes (e.g. new group added)
  useEffect(() => {
      const client = clientRef.current;
      if (!client || !client.connected) return;

      groups.forEach(group => {
          if (!subscriptionsRef.current.has(group.id)) {
              const sub = client.subscribe(`/topic/groups/${group.name}`, (message) => {
                  if (message.body) {
                      try {
                        const msgData = JSON.parse(message.body);
                        console.log('WS Message:', msgData);
                        console.log('Current User ID:', userIdRef.current);
                        console.log('Author ID:', msgData.authorId);
                        if (userIdRef.current && msgData.authorId === userIdRef.current) {
                            return;
                        }
                        onMessageReceived(group.id);
                      } catch (e) {
                          console.warn('Failed to parse notification message', e);
                      }
                  }
              });
              subscriptionsRef.current.set(group.id, sub);
          }
      });
      
      // We don't unsubscribe here to avoid complexity if groups are just reordered or updated
      // If a group is removed, we might want to unsubscribe, but for now let's keep it simple.
  }, [groups, onMessageReceived]);
};
