import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import {chatbubblesOutline, compassOutline, timeOutline, personOutline } from 'ionicons/icons';
import Chats from './pages/chats/Chats';
import Discover from './pages/discover/Discover';
import Revisit from './pages/revisit/Revisit';
import Profile from './pages/profile/Profile';
import Login from './pages/auth/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { IonSpinner } from '@ionic/react';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

// Darkmode
/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
/* import '@ionic/react/css/palettes/dark.system.css'; */

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

// Small loading placeholder during auth init
const Loading: React.FC = () => (
  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
    <IonSpinner name="crescent" />
  </div>
);

const Tabs: React.FC = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route exact path="/tabs/chats" component={Chats} />
      <Route exact path="/tabs/discover" component={Discover} />
      <Route path="/tabs/revisit" component={Revisit} />
      <Route path="/tabs/profile" component={Profile} />
    </IonRouterOutlet>
    <IonTabBar slot="bottom" className="tabs-bar">
      <IonTabButton tab="chats" href="/tabs/chats">
        <IonIcon aria-hidden="true" icon={chatbubblesOutline} />
        <IonLabel>Chats</IonLabel>
      </IonTabButton>
      <IonTabButton tab="discover" href="/tabs/discover">
        <IonIcon aria-hidden="true" icon={compassOutline} />
        <IonLabel>Discover</IonLabel>
      </IonTabButton>
      <IonTabButton tab="revisit" href="/tabs/revisit">
        <IonIcon aria-hidden="true" icon={timeOutline} />
        <IonLabel>Revisit</IonLabel>
      </IonTabButton>
      <IonTabButton tab="profile" href="/tabs/profile">
        <IonIcon aria-hidden="true" icon={personOutline} />
        <IonLabel>Profile</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

const RootRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loading />;
  return (
    <IonRouterOutlet>
      <Route
        exact
        path="/login"
        render={() => (isAuthenticated ? <Redirect to="/tabs/chats" /> : <Login />)}
      />
      <Route
        path="/tabs"
        render={() => (isAuthenticated ? <Tabs /> : <Redirect to="/login" />)}
      />
      <Route exact path="/" render={() => <Redirect to={isAuthenticated ? '/tabs/chats' : '/login'} />} />
    </IonRouterOutlet>
  );
};

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <IonReactRouter>
        <RootRoutes />
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
);

export default App;
