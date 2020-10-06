import { useState, useEffect } from 'react';
import { useMutation } from 'react-query';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import type { IVestResult } from 'vest';

import baseValidate from '../validations/login';
import { DEV_API } from '../constants/api';
import { userState, tokenState } from '../atoms/user';
import type { User } from '../types/User';

type LoginParams = {
  identifier: string;
  password: string;
};

type LoggedInUser = {
  jwt: string;
  user: User;
};

type ErrorMessage = {
  id: string;
  message: string;
};

type ErrorMessages = Array<ErrorMessage>;

type LoggedInError = {
  statusCode: number;
  error: string;
  message: Array<{
    messages: ErrorMessages;
  }>;
};

export async function getAuth(
  params: LoginParams,
): Promise<LoggedInUser | LoggedInError> {
  let url = `${DEV_API}/auth/local`;
  let body = JSON.stringify(params);
  return fetch(url, {
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
    body,
  }).then((res) => res.json());
}

export function useAuth() {
  let [results, setResults] = useState<IVestResult | null>(null);
  let [mutate, { isLoading, data }] = useMutation(getAuth);
  let [isError, setIsError] = useState(false);
  let [error, setError] = useState('');
  let setUser = useSetRecoilState(userState);
  let token = useRecoilValue(tokenState);

  useEffect(() => {
    if (!isLoading && data && (data as LoggedInError)?.statusCode) {
      setIsError(true);
      setError((data as LoggedInError).message[0].messages[0].message);
      return;
    }
    setError('');
    setIsError(false);
    if (!isLoading && data && (data as LoggedInUser)?.jwt) {
      let { jwt } = data as LoggedInUser;
      setUser({ jwt });
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  let getValidationErrorMessages = (fieldName: 'username' | 'password') => {
    let errorMessages: Array<string> = [];
    if (results) {
      errorMessages = [
        ...results?.getErrors(fieldName),
        ...results?.getWarnings(fieldName),
      ];
    }

    return errorMessages.length ? errorMessages[0] : undefined;
  };

  let validate = (params: LoginParams): boolean => {
    let data = {
      username: params.identifier,
      password: params.password,
    };
    let res = baseValidate(data);
    setResults(res);
    return !res.errorCount;
  };

  let login = (params: LoginParams) => {
    let res = validate(params);
    res && mutate(params);
  };

  return {
    login,
    isError,
    isLoading,
    error,
    getValidationErrorMessages,
    isSignedin: !!token,
  };
}
