import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as ThemeProvider } from 'exoflex';
import { RecoilRoot } from 'recoil';

import Router from './routes/Main';

export default function App() {
  return (
    <ThemeProvider>
      <RecoilRoot>
        <StatusBar style={'auto'} />
        <Router />
      </RecoilRoot>
    </ThemeProvider>
  );
}
