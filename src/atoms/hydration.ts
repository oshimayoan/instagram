import { atom } from 'recoil';

export const hydrationState = atom({
  key: 'hydration',
  default: false,
});
