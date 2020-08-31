import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as ThemeProvider } from 'exoflex';

import Router from './routes/Main';

export default function App() {
  return (
    <ThemeProvider>
      <StatusBar style={'auto'} />
      <Router />
    </ThemeProvider>
  );
}
