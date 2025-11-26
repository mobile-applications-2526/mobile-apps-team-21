import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../../components/explore-container/ExploreContainer';
import './profile.css';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from 'react-router-dom';

const Profile: React.FC = () => {
  const { logout } = useAuth();
  const history = useHistory();

  const handleLogout = () => {
    logout();
    history.replace('/login');
  };
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Profile</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="Profile page" />
        <div style={{ padding: '16px' }}>
          <IonButton expand="block" color="medium" onClick={handleLogout}>Log uit</IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Profile;