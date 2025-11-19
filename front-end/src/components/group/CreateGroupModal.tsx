import { useState } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonItem, IonLabel, IonInput, IonList, IonFooter } from '@ionic/react';
import { createGroup, Group } from '../../services/groupChatService';

interface Props {
  isOpen: boolean;
  onDismiss: () => void;
  onCreated: (group: Group) => void;
}

const CreateGroupModal: React.FC<Props> = ({ isOpen, onDismiss, onCreated }) => {
  const [name, setName] = useState('');
  const [emails, setEmails] = useState<string>('');
  const [busy, setBusy] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setBusy(true);
    const list = emails.split(/[,;\n]/).map(e => e.trim()).filter(Boolean);
    const g = await createGroup(name.trim(), list);
    setBusy(false);
    onCreated(g);
    setName('');
    setEmails('');
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
            <IonButton disabled={busy || !name.trim()} onClick={handleCreate} color="success">Create</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default CreateGroupModal;
