import { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonIcon, IonList, IonRefresher, IonRefresherContent } from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import './chats.css';
import GroupCard from '../../components/group/GroupCard';
import ChatModal from '../../components/group/ChatModal';
import CreateGroupModal from '../../components/group/CreateGroupModal';
import { Group, Person, fetchGroups } from '../../services/groupChatService';

const CURRENT_USER: Person = { id: 'me', naam: 'Test', voornaam: 'Me', email: 'me@example.com' };

const Chats: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | undefined>();
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    const data = await fetchGroups();
    setGroups(data);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Eat Up</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="groups-header">
          <h3>Your groups</h3>
          <IonButton fill="outline" color="success" className="create-group-btn" onClick={() => setShowCreate(true)}>
            <IonIcon icon={addOutline} slot="start" />
            Create new group
          </IonButton>
        </div>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await load(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>
        <IonList lines="none">
          {groups.map(g => (
            <GroupCard key={g.id || g.naam} group={g} onOpen={setSelectedGroup} />
          ))}
        </IonList>
        <ChatModal isOpen={!!selectedGroup} group={selectedGroup} onDismiss={() => setSelectedGroup(undefined)} currentUser={CURRENT_USER} />
        <CreateGroupModal isOpen={showCreate} onDismiss={() => setShowCreate(false)} onCreated={(g) => { setGroups(prev => [g, ...prev]); setShowCreate(false); }} />
      </IonContent>
    </IonPage>
  );
};

export default Chats;
