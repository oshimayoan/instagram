import React, { useState } from 'react';
import { View, Image, StyleSheet, Keyboard } from 'react-native';
import { TextInput, Button, Toast } from 'exoflex';

import { useAuth } from '../apis/auth';
import Instagram from '../assets/instagram.png';

export default function Login() {
  let [username, setUsername] = useState('');
  let [password, setPassword] = useState('');
  let {
    login,
    isError,
    isLoading,
    error,
    getValidationErrorMessages,
  } = useAuth();

  let errorMessage = error ?? 'Something went wrong';

  let submit = () => {
    Keyboard.dismiss();
    let data = {
      identifier: username,
      password,
    };
    login(data);
  };

  return (
    <View style={styles.root}>
      <View style={{ alignItems: 'center' }}>
        <Image source={Instagram} style={styles.logo} />
      </View>
      <View style={styles.form}>
        <TextInput
          autoCapitalize="none"
          returnKeyType="next"
          keyboardType="email-address"
          placeholder="Username or email"
          value={username}
          errorMessage={getValidationErrorMessages('username')}
          onChangeText={setUsername}
          containerStyle={styles.input}
        />
        <TextInput
          secureTextEntry
          autoCapitalize="none"
          returnKeyType="send"
          placeholder="Password"
          value={password}
          errorMessage={getValidationErrorMessages('password')}
          onChangeText={setPassword}
          containerStyle={styles.input}
        />
        <Button
          accessibilityStates
          disabled={isLoading}
          onPress={submit}
          loading={isLoading}
        >
          Sign in
        </Button>
      </View>
      <Toast visible={isError} mode="error">
        {errorMessage}
      </Toast>
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
