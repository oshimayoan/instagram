import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Provider as ThemeProvider, ActivityIndicator } from 'exoflex';
import { RecoilRoot, useSetRecoilState } from 'recoil';
import { ReactQueryCacheProvider, useQueryCache } from 'react-query';
import AsyncStorage from '@react-native-community/async-storage';

import Router from './routes/Main';
import PersistanceObserver from './atoms/PersistanceObserver';
import { usePersistCache } from './helpers/persistCache';
import { hydrationState } from './atoms/hydration';
import { userState } from './atoms/user';

// AsyncStorage.clear();

export default function App() {
  return (
    <ThemeProvider>
      <RecoilRoot>
        <PersistanceObserver />
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
  let setUser = useSetRecoilState(userState);
  let [isInitialized, setInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      let user = await AsyncStorage.getItem('user');
      user && setUser(JSON.parse(user).value);
      await hydrate(queryCache);
      setHydrated(true);
      setInitialized(true);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isInitialized) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator accessibilityStates size="large" />
      </View>
    );
  }

  return (
    <ReactQueryCacheProvider queryCache={queryCache}>
      {children}
    </ReactQueryCacheProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
