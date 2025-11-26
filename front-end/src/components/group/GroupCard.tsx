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
  const displayCount = memberCount ?? group.memberNames.length;
  const missedCount = group.missedMessages ?? 0;
  return (
    <IonCard className="group-card" onClick={() => onOpen(group)} button>
      <IonCardContent>
        <div className="group-card-header">
          <h2>{group.name}</h2>
          {missedCount > 0 && <IonBadge color="success">{missedCount}</IonBadge>}
        </div>
        <div className="group-card-meta">
          <div className="meta-line">{displayCount} members</div>
          {lastActivity && <div className="meta-line last">Last: {lastActivity}</div>}
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default GroupCard;
