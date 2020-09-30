import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { TextInput, Button } from 'exoflex';

import Instagram from '../assets/instagram.png';

export default function Login() {
  return (
    <View style={styles.root}>
      <View style={{ alignItems: 'center' }}>
        <Image source={Instagram} style={styles.logo} />
      </View>
      <View style={styles.form}>
        <TextInput
          placeholder="Username or email"
          containerStyle={styles.input}
        />
        <TextInput placeholder="Password" containerStyle={styles.input} />
        <Button accessibilityStates>Sign in</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingVertical: 120,
  },
  logo: {
    width: 300,
    height: 120,
    resizeMode: 'contain',
  },
  form: {
    marginHorizontal: 48,
    marginVertical: 24,
  },
  input: {
    marginBottom: 12,
  },
});
