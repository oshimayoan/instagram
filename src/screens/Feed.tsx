import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Keyboard,
  Modal,
  TouchableWithoutFeedback,
  KeyboardEvent,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  GestureResponderEvent,
  StyleSheet,
} from 'react-native';
import { useQuery } from 'react-query';
import { Text, TextInput } from 'exoflex';
import Constants from 'expo-constants';

import { useFadingAnimation } from '../helpers/useFadingAnimation';
import { getAllFeeds } from '../apis/feed';

const COMMENT_INPUT_POSITION = 568.5;

export default function Feed() {
  let flatList = useRef<FlatList | null>(null);
  let currentOffset = useRef(0);
  let { isLoading, error, data } = useQuery('feeds', getAllFeeds);
  let [isTypingComment, setTypingComment] = useState(false);
  let [keyboardHeight, setKeyboardHeight] = useState(0);

  let [animatedVisibility, animatedValue] = useFadingAnimation(
    isTypingComment,
    { duration: 150 },
  );

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', keyboardDidShow);
    Keyboard.addListener('keyboardDidHide', closeCommentInput);
    return () => {
      Keyboard.removeListener('keyboardDidShow', keyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', closeCommentInput);
    };
  }, []);

  let keyboardDidShow = (e: KeyboardEvent) =>
    setKeyboardHeight(e.endCoordinates.height);

  let closeCommentInput = () => setTypingComment(false);

  let openCommentInput = (e: GestureResponderEvent) => {
    let offset = e.nativeEvent.pageY - COMMENT_INPUT_POSITION;
    let newOffset = currentOffset.current + offset;
    flatList &&
      flatList.current?.scrollToOffset({
        offset: newOffset,
      });
    setTypingComment(true);
  };

  let updateCurrentOffset = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    currentOffset.current = e.nativeEvent.contentOffset.y;
  };

  return (
    <View style={styles.root}>
      <FlatList
        ref={flatList}
        keyExtractor={(_item, index) => index.toString()}
        data={data?.results || []}
        onScrollEndDrag={updateCurrentOffset}
        onMomentumScrollEnd={updateCurrentOffset}
        renderItem={({ item }) => {
          return (
            <View style={{ marginBottom: 24 }}>
              <View style={styles.itemHeader}>
                <Image
                  source={{ uri: item.picture.thumbnail }}
                  style={styles.itemProfileImage}
                />
                <Text>{item.name.first}</Text>
              </View>
              <Image
                source={{ uri: item.picture.large }}
                style={styles.itemImage}
              />
              <TouchableOpacity
                onPress={openCommentInput}
                style={{ padding: 16 }}
              >
                <Text>Add a comment...</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
      {isTypingComment && (
        <Modal visible={isTypingComment} transparent animationType="slide">
          <TouchableWithoutFeedback onPress={closeCommentInput}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
          <Animated.View
            style={{
              marginBottom: keyboardHeight,
              opacity: animatedValue,
            }}
          >
            <TextInput autoFocus placeholder="Add a comment..." />
          </Animated.View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: Constants.statusBarHeight,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemProfileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 16,
  },
  itemImage: {
    flex: 1,
    height: 450,
  },
});
