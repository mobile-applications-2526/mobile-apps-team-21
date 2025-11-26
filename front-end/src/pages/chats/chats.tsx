import { useCallback, useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonIcon, IonList, IonRefresher, IonRefresherContent, useIonToast } from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import './chats.css';
import GroupCard from '../../components/group/GroupCard';
import ChatModal from '../../components/group/ChatModal';
import CreateGroupModal from '../../components/group/CreateGroupModal';
import { Group, GroupCreationResult, fetchGroups } from '../../services/GroupChatService';
import { useAuth } from '../../context/AuthContext';

const Chats: React.FC = () => {
  const { userEmail } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | undefined>();
  const [showCreate, setShowCreate] = useState(false);
  const [present] = useIonToast();

  const load = useCallback(async () => {
    if (!userEmail) return;
    try {
      const data = await fetchGroups(userEmail);
      setGroups(data);
    } catch (error: any) {
      present({ message: error?.message || 'Failed to load groups', duration: 2500, color: 'danger' });
    }
  }, [userEmail, present]);

  useEffect(() => {
    load();
  }, [load]);

  const handleGroupCreated = (result: GroupCreationResult) => {
    setGroups(prev => {
      const withoutDuplicate = prev.filter(group => group.id !== result.group.id);
      return [result.group, ...withoutDuplicate];
    });
    if (result.failedInvites.length) {
      present({
        message: `Groep aangemaakt, maar niet alle uitnodigingen zijn verstuurd: ${result.failedInvites.join(', ')}`,
        duration: 3500,
        color: 'warning'
      });
    } else {
      present({ message: 'Groep aangemaakt', duration: 2000, color: 'success' });
    }
  };

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
        <IonRefresher
          slot="fixed"
          onIonRefresh={async (e) => {
            await load();
            e.detail.complete();
          }}
        >
          <IonRefresherContent />
        </IonRefresher>
        <IonList lines="none">
          {groups.map(group => (
            <GroupCard
              key={group.id}
              group={group}
              memberCount={group.memberNames.length}
              onOpen={setSelectedGroup}
            />
          ))}
        </IonList>
        <ChatModal
          isOpen={!!selectedGroup}
          group={selectedGroup}
          onDismiss={() => setSelectedGroup(undefined)}
          currentUserEmail={userEmail ?? ''}
          reloadMessages={load}
        />
        <CreateGroupModal
          isOpen={showCreate}
          onDismiss={() => setShowCreate(false)}
          currentUserEmail={userEmail ?? ''}
          onCreated={(result) => {
            handleGroupCreated(result);
            setShowCreate(false);
          }}
        />
      </IonContent>
    </IonPage>
  );
};

export default Chats;
