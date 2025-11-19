import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../../components/explore-container/ExploreContainer';
import './revisit.css';

const Revisit: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Revisit</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Revisit</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="Revisit page" />
      </IonContent>
    </IonPage>
  );
};

export default Revisit;
