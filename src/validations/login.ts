import vest, { test } from 'vest';
import enforce from 'vest/enforceExtended';

export type Data = {
  username?: string;
  password?: string;
};

export default vest.create(
  'login',
  (data: Data = {}, currentField: keyof Data) => {
    vest.only(currentField);

    test('username', 'Username or email is required', () => {
      enforce(data.username).isNotEmpty();
    });

    test('username', 'Email is not valid', () => {
      let isMaybeEmail = data.username?.includes('@');
      isMaybeEmail && enforce(data.username).isEmail();
    });

    test('password', 'Password is required', () => {
      enforce(data.password).isNotEmpty();
    });
  },
);
