import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Animated } from 'react-native';
import {
  Text,
  ActivityIndicator,
  Subtitle,
  Avatar,
  Label,
  TextInput,
  Toast,
} from 'exoflex';
import { useRoute } from '@react-navigation/native';
import { format } from 'timeago.js';

import { useComments } from '../../apis/comment';
import { DEV_API } from '../../constants/api';
import { IS_ANDROID } from '../../constants/constant';

import { useCommentInput } from './useCommentInput';

export default function Comments() {
  let { params } = useRoute();
  let { isLoading, isError, error, comments, addComment } = useComments(
    params?.postId,
  );
  let {
    inputMargin,
    inputRadius,
    inputWrapperBottom,
    isKeyboardVisible,
    animateCommentInput,
    dismissKeyboard,
  } = useCommentInput();

  let [newComment, setNewComment] = useState('');

  useEffect(() => {
    isError &&
      Toast.showToast({
        message:
          (error as { message: string })?.message ?? 'Something went wrong',
        duration: 3000,
        mode: 'error',
      });
  }, [isError]); // eslint-disable-line react-hooks/exhaustive-deps

  let submitComment = () => {
    if (!newComment.trim()) {
      return;
    }
    addComment(newComment);
    dismissKeyboard();
    setNewComment('');
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, paddingVertical: 50 }}>
        <ActivityIndicator size="large" accessibilityStates={null} />
      </View>
    );
  }

  return (
    <>
      <FlatList
        keyExtractor={(_item, index) => index.toString()}
        data={comments}
        ListEmptyComponent={() => (
          <View style={styles.emptyWrapper}>
            <Subtitle>There is no comments</Subtitle>
          </View>
        )}
        contentContainerStyle={styles.container}
        style={{ flex: 1 }}
        renderItem={({ item }) => {
          let { user, content, created_at: createdAt } = item;
          return (
            <View style={styles.commentWrapper}>
              <Avatar.Image
                source={{
                  uri: `${DEV_API}${user.photo.formats.thumbnail.url}`,
                }}
                size={40}
              />
              <View style={styles.commentContent}>
                <View>
                  <Text>
                    <Text weight="medium" style={styles.commentUsername}>
                      {user.username}
                    </Text>
                    {` `}
                    {content}
                  </Text>
                </View>
                <View style={styles.commentTime}>
                  <Label weight="light" style={styles.time}>
                    {format(createdAt)}
                  </Label>
                </View>
              </View>
            </View>
          );
        }}
      />
      <Animated.View
        style={[
          styles.inputWrapper,
          isKeyboardVisible && styles.noShadow,
          { marginBottom: inputWrapperBottom.current },
        ]}
      >
        <Animated.View
          style={{
            borderWidth: 1,
            borderColor: '#e5e5e5',
            borderRadius: inputRadius.current,
            margin: inputMargin.current,
            overflow: 'hidden',
          }}
        >
          <TextInput
            autoFocus
            returnKeyType="send"
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={(text) => setNewComment(text)}
            onSubmitEditing={submitComment}
            containerStyle={{ borderWidth: 0 }}
            onFocus={() => {
              IS_ANDROID && animateCommentInput('open', 75);
            }}
            onBlur={() => {
              IS_ANDROID && animateCommentInput('close', 225);
            }}
          />
        </Animated.View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  emptyWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 50,
  },
  commentWrapper: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  commentContent: {
    paddingHorizontal: 8,
  },
  commentUsername: {
    color: '#000',
  },
  commentTime: {
    paddingVertical: 6,
  },
  time: {
    color: '#555',
  },
  inputWrapper: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0.77,
    shadowOpacity: 0.77,
    elevation: 3,
  },
  noShadow: {
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
});
