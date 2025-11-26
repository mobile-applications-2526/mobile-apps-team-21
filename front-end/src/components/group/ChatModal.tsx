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
  const contentRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    if (group && isOpen) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [group, isOpen, loadMessages]);

  useEffect(() => {
    // scroll to bottom on new messages
    setTimeout(() => {
      if (contentRef.current) contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }, 50);
  }, [messages]);

  async function handleSend() {
    if (!group || !input.trim()) return;
    if (!currentUserEmail) {
      present({ message: 'Je bent niet aangemeld', duration: 2000, color: 'danger' });
      return;
    }

    try {
      setSending(true);
      await sendMessage(group, input.trim(), currentUserEmail);
      setInput('');
      await loadMessages();
      if (reloadMessages) {
        await reloadMessages();
      }
    } catch (error: any) {
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
      <IonContent className="chat-content" fullscreen>
        <div className="messages-wrapper" ref={contentRef}>
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
              const displayName = message.author.firstName || 'Onbekend';
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
