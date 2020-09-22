import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as ThemeProvider } from 'exoflex';
import { RecoilRoot, useSetRecoilState } from 'recoil';
import { ReactQueryCacheProvider, useQueryCache } from 'react-query';
import AsyncStorage from '@react-native-community/async-storage';

import Router from './routes/Main';
import { usePersistCache } from './helpers/persistCache';
import { hydrationState } from './atoms/hydration';

// AsyncStorage.clear();

export default function App() {
  return (
    <ThemeProvider>
      <RecoilRoot>
        <Hydrate>
          <StatusBar style={'auto'} />
          <Router />
        </Hydrate>
      </RecoilRoot>
    </ThemeProvider>
  );
}

function Hydrate({ children }: { children: React.ReactNode }) {
  let setHydrated = useSetRecoilState(hydrationState);
  let queryCache = useQueryCache();
  let { hydrate } = usePersistCache();

  useEffect(() => {
    (async () => {
      await hydrate(queryCache);
      setHydrated(true);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ReactQueryCacheProvider queryCache={queryCache}>
      {children}
    </ReactQueryCacheProvider>
  );
}
