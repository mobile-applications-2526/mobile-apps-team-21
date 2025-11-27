import { useCallback, useEffect, useState, useRef } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonInput, IonFooter, useIonToast, IonSpinner, IonIcon } from '@ionic/react';
import { sendOutline, chevronBackOutline } from 'ionicons/icons';
import { Group, Message, fetchMessages, sendMessage } from '../../services/GroupChatService';
import './ChatModal.css';

interface Props {
  isOpen: boolean;
  group?: Group;
  onDismiss: () => void;
  currentUserEmail: string;
  reloadMessages?: () => Promise<void>;
}

const ChatModal: React.FC<Props> = ({ isOpen, group, onDismiss, currentUserEmail, reloadMessages }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const contentRef = useRef<HTMLIonContentElement>(null);
  const [present] = useIonToast();

  const loadMessages = useCallback(async () => {
    if (!group) return;
    setLoading(true);
    try {
      const data = await fetchMessages(group);
      setMessages(data);
    } catch (error: any) {
      present({ message: error?.message || 'Berichten laden mislukt', duration: 2500, color: 'danger' });
    } finally {
      setLoading(false);
    }
  }, [group, present]);

  // Fetch messages without toggling the loading state. Useful after sending
  // a message to avoid a visual flicker of the loading spinner.
  const refreshSilently = useCallback(async (): Promise<Message[] | null> => {
    if (!group) return null;
    try {
      const data = await fetchMessages(group);
      return data;
    } catch (error: any) {
      // Fail silently here to avoid disrupting the user flow
      console.error('Failed to refresh messages silently:', error);
      return null;
    }
  }, [group]);

  useEffect(() => {
    if (group && isOpen) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [group, isOpen, loadMessages]);

  useEffect(() => {
    if (isOpen) {
      contentRef.current?.scrollToBottom(300);
    }
  }, [messages, isOpen]);

  async function handleSend() {
    if (!group || !input.trim()) return;
    if (!currentUserEmail) {
      present({ message: 'Je bent niet aangemeld', duration: 2000, color: 'danger' });
      return;
    }

    try {
      setSending(true);
      const text = input.trim();
      setInput('');

      // Optimistic UI update: show the message immediately
      const optimistic: Message = {
        id: `temp-${Date.now()}`,
        content: text,
        timestamp: new Date().toISOString(),
        author: {
          email: currentUserEmail,
          firstName: 'You'
        },
        isEdited: false
      };
      setMessages((prev) => [...prev, optimistic]);

      // Send to backend
      await sendMessage(group, text, currentUserEmail);

      // Replace with server truth, but without flicker. We preserve the
      // optimistic timestamp to avoid visible time jumps.
      const serverData = await refreshSilently();
      if (serverData) {
        // Try to find the server-created message (match by author and content, prefer the latest)
        const serverIndex = [...serverData]
          .reverse()
          .findIndex((m) =>
            m.author.email?.toLowerCase() === currentUserEmail.toLowerCase() && m.content === text
          );
        if (serverIndex !== -1) {
          const realIndex = serverData.length - 1 - serverIndex;
          const serverMsg = serverData[realIndex];
          const merged = serverData.map((m, idx) => (idx === realIndex ? { ...m, timestamp: optimistic.timestamp } : m));
          setMessages(merged);
        } else {
          setMessages(serverData);
        }
      }
      if (reloadMessages) await reloadMessages();
    } catch (error: any) {
      // Revert optimistic message if we added one
      setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-')));
      present({ message: error?.message || 'Bericht versturen mislukt', duration: 2500, color: 'danger' });
    } finally {
      setSending(false);
    }
  }

  const memberLabel = group ? `${group.memberNames.length} members` : '';

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss} className="chat-modal">
      <IonHeader>
        <IonToolbar className="chat-toolbar">
          <IonButtons slot="start">
            <IonButton onClick={onDismiss} fill="clear" className="chat-back-button">
              <IonIcon icon={chevronBackOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonTitle className="chat-title-container">
            <div className="chat-title-block">
              <span className="chat-title-text">{group?.name}</span>
              {memberLabel && <span className="chat-subtitle">{memberLabel}</span>}
            </div>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="chat-content" fullscreen ref={contentRef}>
        <div className="messages-wrapper">
          {loading ? (
            <div className="messages-loading">
              <IonSpinner name="dots" />
            </div>
          ) : messages.length === 0 ? (
            <div className="no-messages">Nog geen berichten</div>
          ) : (
            messages.map((message) => {
              const mine =
                !!currentUserEmail &&
                message.author.email?.toLowerCase() === currentUserEmail.toLowerCase();
              const displayName = mine ? 'You' : (message.author.firstName || 'Onbekend');
              const formattedTime = formatTime(message.timestamp);

              return (
                <div key={message.id} className={`message-row ${mine ? 'mine' : 'theirs'}`}>
                  <div className={`message-bubble ${mine ? 'mine' : 'theirs'}`}>
                    <div className="message-header">
                      <span className="message-author">{displayName}</span>
                      {formattedTime && <span className="message-time">{formattedTime}</span>}
                    </div>
                    <div className="message-body">{message.content}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </IonContent>
      <IonFooter className="chat-footer">
        <IonToolbar className="chat-input-bar">
          <div className="chat-compose">
            <IonInput
              value={input}
              placeholder="Type a message..."
              onIonChange={(e) => setInput(e.detail.value ?? '')}
              className="chat-text-input"
              clearInput
            />
            <IonButton
              className="send-btn"
              color="success"
              disabled={sending || !input.trim()}
              onClick={handleSend}
            >
              {sending ? <IonSpinner name="dots" /> : <IonIcon icon={sendOutline} />}
            </IonButton>
          </div>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

function formatTime(timestamp?: string): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}

export default ChatModal;
