import { IonCard, IonCardContent, IonBadge } from '@ionic/react';
import { Group } from '../../services/GroupChatService';
import './GroupCard.css';

interface Props {
  group: Group;
  memberCount?: number;
  lastActivity?: string; // e.g. last restaurant or last message summary
  onOpen: (group: Group) => void;
}

const GroupCard: React.FC<Props> = ({ group, memberCount, lastActivity, onOpen }) => {
  return (
    <IonCard className="group-card" onClick={() => onOpen(group)} button>
      <IonCardContent>
        <div className="group-card-header">
          <h2>{group.naam}</h2>
          <IonBadge color="success">{memberCount ?? group.leden?.length ?? 0}</IonBadge>
        </div>
        <div className="group-card-meta">
          <div className="meta-line">{memberCount ?? group.leden?.length ?? 0} members</div>
          {lastActivity && <div className="meta-line last">Last: {lastActivity}</div>}
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default GroupCard;
