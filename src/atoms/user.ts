import { atom, selector } from 'recoil';

import type { User } from '../types/User';

type UserState = Partial<User> & {
  jwt: string;
};

export const userState = atom<UserState>({
  key: 'user',
  default: { jwt: '' },
});

export const tokenState = selector({
  key: 'tokenState',
  get: ({ get }) => {
    let user = get(userState);
    return user.jwt;
  },
});

export const usernameState = selector({
  key: 'usernameState',
  get: ({ get }) => {
    let user = get(userState);
    return user.username;
  },
});

export const profileState = selector({
  key: 'profileState',
  get: ({ get }) => {
    let { jwt, ...user } = get(userState);
    return user;
  },
});
