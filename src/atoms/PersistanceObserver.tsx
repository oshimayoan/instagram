// eslint-disable-next-line @typescript-eslint/camelcase
import { useRecoilTransactionObserver_UNSTABLE } from 'recoil';
import AsyncStorage from '@react-native-community/async-storage';

export default function PersistanceObserver() {
  useRecoilTransactionObserver_UNSTABLE(({ snapshot }) => {
    for (let modifiedAtom of snapshot.getNodes_UNSTABLE({ isModified: true })) {
      let atomLoadable = snapshot.getLoadable(modifiedAtom);
      if (atomLoadable.state === 'hasValue' && modifiedAtom.key === 'user') {
        AsyncStorage.setItem(
          modifiedAtom.key,
          JSON.stringify({ value: atomLoadable.contents }),
        );
      }
    }
  });
  return null;
}
