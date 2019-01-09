import React, { FunctionComponent, useEffect, useState } from 'react';
import gql from 'graphql-tag';
import authRoutes from '../routes/authRoutes';
import authStore from '../utils/authStore';
import authScope, {
  retrieveLocalAuth,
  saveLocalAuth,
} from '../utils/authScope';
import { runElectron } from '../utils/electron';
import { loadAsset } from '../utils/assets';
import intercom from '../utils/intercom';
import withToaster from '../components/toast/withToaster';
import toastStore from '../utils/toastStore';
import apolloPersistor from '../utils/apolloPersistor';

export const getUserQuery = apolloPersistor.instance({
  name: 'query',
  map: ({ ...args }) => ({
    ...args,
    query: gql`
      query GetUser {
        me {
          id
          hash
          name
          username
          email
          createdAt
          updatedAt
          isSubscribed
          preferences {
            shortcutOpen
          }
        }
      }
    `,
  }),
});

const Routes = authRoutes.render();

export interface IAppProps {
  addToast: (data: { type?: string; contents?: string }) => any;
}

const App: FunctionComponent<IAppProps> = ({ addToast }) => {
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  useEffect(() => {
    const unwatch = authScope.watch({
      data: data => {
        authStore.dispatch.patch(data);
        if (Object.keys(data).length) {
          getUserQuery.execute();
        }
        setAuthChecked(true);
      },
    });
    retrieveLocalAuth.execute();
    return () => unwatch();
  }, []);
  useEffect(() => {
    const unwatch = getUserQuery.watch({
      catch: () => saveLocalAuth.execute({ data: {} }),
      data: ({ me }) => {
        if (me) {
          intercom.update({
            user_id: me.id,
            user_hash: me.hash,
            name: me.name,
            username: me.username,
            email: me.email,
            created_at: me.createdAt,
            updated_at: me.updatedAt,
            is_subscribed: me.isSubscribed,
          });
          if (me.preferences) {
            runElectron(electron => {
              electron.ipcRenderer.send('updateShortcuts', {
                open: me.preferences.shortcutOpen,
              });
            });
          }
        }
      },
    });
    runElectron(electron => electron.ipcRenderer.send('ready'));
    return () => unwatch();
  }, []);
  useEffect(() => {
    intercom.start();
    return () => intercom.shutdown();
  });
  useEffect(() => {
    const unwatch = toastStore.watch({
      state: ({ type, contents }) => contents && addToast({ type, contents }),
    });
    return () => unwatch();
  });
  if (!authChecked) {
    return (
      <div className="app-loading-screen">
        <img src={loadAsset('logo/Dark.svg')} />
      </div>
    );
  }
  return <Routes />;
};

export default withToaster(App);
