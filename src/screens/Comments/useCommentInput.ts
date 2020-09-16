import { useRef, useState, useEffect } from 'react';
import {
  Animated,
  Keyboard,
  Platform,
  Easing,
  KeyboardEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IS_IOS } from '../../constants/constant';

export function useCommentInput() {
  let inputMargin = useRef<Animated.Value>(new Animated.Value(24));
  let inputRadius = useRef<Animated.Value>(new Animated.Value(48));
  let inputWrapperBottom = useRef<Animated.Value>(new Animated.Value(0));

  let insets = useSafeAreaInsets();
  let [keyboardHeight, setKeyboardHeight] = useState(insets.bottom);

  useEffect(() => {
    Keyboard.addListener('keyboardWillShow', keyboardWillShow);
    Keyboard.addListener('keyboardWillHide', keyboardWillHide);
    if (Platform.OS === 'android') {
      Keyboard.addListener('keyboardDidShow', keyboardWillShow);
      Keyboard.addListener('keyboardDidHide', keyboardWillHide);
    }
    return () => {
      Keyboard.removeListener('keyboardWillShow', keyboardWillShow);
      Keyboard.removeListener('keyboardWillHide', keyboardWillHide);
      if (Platform.OS === 'android') {
        Keyboard.removeListener('keyboardDidShow', keyboardWillShow);
        Keyboard.removeListener('keyboardDidHide', keyboardWillHide);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  let animateCommentInput = (action: 'open' | 'close', duration: number) => {
    Animated.parallel([
      Animated.timing(inputMargin.current, {
        toValue: action === 'open' ? 0 : 24,
        duration,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.quad),
      }),
      Animated.timing(inputRadius.current, {
        toValue: action === 'open' ? 0 : 48,
        duration,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.quad),
      }),
    ]).start();
  };

  let dismissKeyboard = () => Keyboard.dismiss();

  let keyboardWillShow = (e: KeyboardEvent) => {
    setKeyboardHeight(e.endCoordinates.height);

    if (IS_IOS) {
      let duration = e.duration + 100;
      animateCommentInput('open', duration);
      Animated.timing(inputWrapperBottom.current, {
        toValue: e.endCoordinates.height,
        duration,
        useNativeDriver: false,
        easing: Easing.out(Easing.quad),
      }).start();
    }
  };

  let keyboardWillHide = (e: KeyboardEvent) => {
    setKeyboardHeight(0);

    if (IS_IOS) {
      let duration = e.duration + 100;
      animateCommentInput('close', duration);
      Animated.timing(inputWrapperBottom.current, {
        toValue: 0,
        duration,
        useNativeDriver: false,
        easing: Easing.out(Easing.quad),
      }).start();
    }
  };

  return {
    inputMargin,
    inputRadius,
    inputWrapperBottom,
    isKeyboardVisible: keyboardHeight > insets.bottom,
    animateCommentInput,
    dismissKeyboard,
  };
}
