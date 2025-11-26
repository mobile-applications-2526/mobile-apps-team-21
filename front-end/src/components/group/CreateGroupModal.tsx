import { useState } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonItem, IonLabel, IonInput, IonList, IonFooter, useIonToast } from '@ionic/react';
import { createGroup, GroupCreationResult } from '../../services/GroupChatService';

interface Props {
  isOpen: boolean;
  onDismiss: () => void;
  currentUserEmail: string;
  onCreated: (result: GroupCreationResult) => void;
}

const CreateGroupModal: React.FC<Props> = ({ isOpen, onDismiss, currentUserEmail, onCreated }) => {
  const [name, setName] = useState('');
  const [emails, setEmails] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [present] = useIonToast();

  async function handleCreate() {
    if (!name.trim()) return;
    if (!currentUserEmail) {
      present({ message: 'Je moet aangemeld zijn om een groep te maken', duration: 2500, color: 'danger' });
      return;
    }
    setBusy(true);
    const list = emails.split(/[,;\n]/).map(e => e.trim()).filter(Boolean);
    try {
      const result = await createGroup(name.trim(), list, currentUserEmail);
      onCreated(result);
      setName('');
      setEmails('');
    } catch (error: any) {
      present({ message: error?.message || 'Groep aanmaken mislukt', duration: 3000, color: 'danger' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Create new group</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel position="stacked">Group name</IonLabel>
            <IonInput value={name} placeholder="e.g. Foodie Friends" onIonChange={e => setName(e.detail.value!)} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Member emails (comma/enter separated)</IonLabel>
            <IonInput value={emails} placeholder="emma@example.com, tom@example.com" onIonChange={e => setEmails(e.detail.value!)} />
          </IonItem>
        </IonList>
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonButtons slot="end">
            <IonButton disabled={busy || !name.trim()} onClick={handleCreate} color="success">
              {busy ? 'Bezig...' : 'Create'}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default CreateGroupModal;
