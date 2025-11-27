import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  useIonToast
} from '@ionic/react';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './login.css';

const Login: React.FC = () => {
  const { login } = useAuth();
  const history = useHistory();
  const [present] = useIonToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      history.replace('/chats');
    } catch (err: any) {
      setError(err?.message || 'Inloggen mislukt');
    } finally {
      setSubmitting(false);
    }
  };

  const showRegisterInfo = () =>
    present({ message: 'Registratiepagina nog niet beschikbaar', duration: 2000, color: 'medium' });

  return (
    <IonPage className="login-page">
      <IonHeader className="ion-no-border">
        <IonToolbar color="transparent">
          <IonTitle className="login-title">Eat Up</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div className="login-subtitle">Ontdek restaurants samen met vrienden</div>

        <form onSubmit={onSubmit} className="login-form">
          <IonCard className="login-card">
            <IonCardContent>
              <div className="login-welcome">Welkom terug!</div>

              <IonItem className="login-item" lines="none">
                <IonLabel position="stacked">E-mail</IonLabel>
                <IonInput
                  type="email"
                  inputmode="email"
                  placeholder="jouw@email.com"
                  value={email}
                  onIonInput={(e: any) => setEmail(e.detail?.value ?? '')}
                  required
                />
              </IonItem>

              <IonItem className="login-item" lines="none">
                <IonLabel position="stacked">Wachtwoord</IonLabel>
                <IonInput
                  type="password"
                  placeholder="wachtwoord"
                  value={password}
                  onIonInput={(e: any) => setPassword(e.detail?.value ?? '')}
                  required
                />
              </IonItem>

              {error && (
                <IonText color="danger" className="login-error">
                  {error}
                </IonText>
              )}

              <IonButton expand="block" type="submit" color="primary" disabled={submitting}>
                Inloggen
              </IonButton>

              <div className="login-register">
                Heb je nog geen account?{' '}
                <a onClick={showRegisterInfo}>Registreer hier</a>
              </div>
            </IonCardContent>
          </IonCard>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default Login;
