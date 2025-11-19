import { useEffect, useState, useRef } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonItem, IonLabel, IonInput, IonList, IonFooter, IonAvatar } from '@ionic/react';
import { Group, Message, Person, fetchMessages, sendMessage } from '../../services/groupChatService';
import './ChatModal.css';

interface Props {
  isOpen: boolean;
  group?: Group;
  onDismiss: () => void;
  currentUser: Person; // simplified current user
}

const ChatModal: React.FC<Props> = ({ isOpen, group, onDismiss, currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (group && isOpen) {
      fetchMessages(group.id!).then(setMessages);
    }
  }, [group, isOpen]);

  useEffect(() => {
    // scroll to bottom on new messages
    setTimeout(() => {
      if (contentRef.current) contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }, 50);
  }, [messages]);

  async function handleSend() {
    if (!group || !input.trim()) return;
    const msg = await sendMessage(group.id!, input.trim(), currentUser);
    setMessages(prev => [...prev, msg]);
    setInput('');
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss} className="chat-modal">
      <IonHeader>
        <IonToolbar>
          <IonTitle>{group?.naam}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="messages-wrapper" ref={contentRef}>
          <IonList lines="none">
            {messages.map(m => {
              const mine = m.auteur.email === currentUser.email;
              return (
                <div key={m.id} className={`message-bubble ${mine ? 'mine' : ''}`}>
                  <div className="msg-header">
                    <IonAvatar className="avatar-mini"><span>{m.auteur.voornaam?.charAt(0)}</span></IonAvatar>
                    <span className="author">{m.auteur.voornaam}</span>
                    <span className="time">{new Date(m.timestamp || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="msg-text">{m.tekst}</div>
                </div>
              );
            })}
          </IonList>
        </div>
      </IonContent>
      <IonFooter>
        <IonToolbar className="chat-input-bar">
          <IonItem className="input-item" lines="none">
            <IonLabel position="stacked" hidden>Message</IonLabel>
            <IonInput value={input} placeholder="Type a message..." onIonChange={e => setInput(e.detail.value!)} />
          </IonItem>
          <IonButtons slot="end">
            <IonButton color="success" onClick={handleSend}>Send</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default ChatModal;
