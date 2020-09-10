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
import { Text, TextInput, Label } from 'exoflex';
import Constants from 'expo-constants';
import { format } from 'timeago.js';

import { useFadingAnimation } from '../helpers/useFadingAnimation';
import { getAllPosts } from '../apis/post';
import { DEV_API } from '../constants/api';

const COMMENT_INPUT_POSITION = 568.5;

export default function Feed() {
  let flatList = useRef<FlatList | null>(null);
  let currentOffset = useRef(0);
  let { data: posts } = useQuery('posts', getAllPosts);
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
        data={posts || []}
        onScrollEndDrag={updateCurrentOffset}
        onMomentumScrollEnd={updateCurrentOffset}
        renderItem={({ item: post }) => {
          let { user, images, description, created_at: createdAt } = post;
          return (
            <View style={{ marginBottom: 32 }}>
              <View style={styles.itemHeader}>
                <Image
                  source={{
                    uri: `${DEV_API}${user.photo.formats.thumbnail.url}`,
                  }}
                  style={styles.itemProfileImage}
                />
                <Text>{user.username}</Text>
              </View>
              <Image
                source={{ uri: `${DEV_API}${images[0].formats.large.url}` }}
                style={styles.itemImage}
              />
              <TouchableOpacity
                onPress={() => {}}
                style={{ marginHorizontal: 12, marginTop: 12 }}
              >
                <Text>View all x comments</Text>
              </TouchableOpacity>
              <View
                style={{
                  marginHorizontal: 12,
                  marginTop: 12,
                }}
              >
                <Text>
                  <Text weight="bold">oliviachg</Text> Hey, awesome bike!
                </Text>
              </View>
              <TouchableOpacity
                onPress={openCommentInput}
                style={{
                  paddingVertical: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Image
                  source={{
                    uri: `${DEV_API}${user.photo.formats.thumbnail.url}`,
                  }}
                  style={styles.itemProfileImage}
                />
                <Text>Add a comment...</Text>
              </TouchableOpacity>
              <Label style={{ marginHorizontal: 12, color: '#555' }}>
                {format(createdAt)}
              </Label>
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
    width: 28,
    height: 28,
    borderRadius: 18,
    marginHorizontal: 12,
  },
  itemImage: {
    flex: 1,
    height: 450,
  },
});
