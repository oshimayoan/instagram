import React from 'react';
import { StatusBar } from 'expo-status-bar';

import Router from './routes/Main';

export default function App() {
  return (
    <>
      <StatusBar style={'auto'} />
      <Router />
    </>
  );
}
