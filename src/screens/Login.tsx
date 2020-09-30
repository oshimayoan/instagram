import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { TextInput, Button } from 'exoflex';
import type { IVestResult } from 'vest';

import baseValidate from '../validations/login';
import Instagram from '../assets/instagram.png';

export default function Login() {
  let [username, setUsername] = useState('');
  let [password, setPassword] = useState('');
  let { getErrorMessages, validate } = useLoginValidation();

  let submit = () => {
    let data = {
      username,
      password,
    };
    validate(data);
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
          errorMessage={getErrorMessages('username')}
          onChangeText={setUsername}
          containerStyle={styles.input}
        />
        <TextInput
          secureTextEntry
          autoCapitalize="none"
          returnKeyType="send"
          placeholder="Password"
          value={password}
          errorMessage={getErrorMessages('password')}
          onChangeText={setPassword}
          containerStyle={styles.input}
        />
        <Button accessibilityStates onPress={submit}>
          Sign in
        </Button>
      </View>
    </View>
  );
}

function useLoginValidation() {
  let [results, setResults] = useState<IVestResult | null>(null);

  let getErrorMessages = (fieldName: 'username' | 'password') => {
    let errorMessages: Array<string> = [];
    if (results) {
      errorMessages = [
        ...results?.getErrors(fieldName),
        ...results?.getWarnings(fieldName),
      ];
    }

    return errorMessages.length ? errorMessages[0] : undefined;
  };

  let validate = (data: Record<string, string>) => {
    let res = baseValidate(data);
    setResults(res);
  };

  return { validate, getErrorMessages };
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
