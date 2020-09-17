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
import { Text, TextInput, Label, ActivityIndicator } from 'exoflex';
import { format } from 'timeago.js';
import { useNavigation } from '@react-navigation/native';

import { useFadingAnimation } from '../helpers/useFadingAnimation';
import { usePosts } from '../apis/post';
import { Post } from '../atoms/posts';
import { DEV_API } from '../constants/api';

const COMMENT_INPUT_POSITION = 568.5;

export default function Feed() {
  let flatList = useRef<FlatList | null>(null);
  let currentOffset = useRef(0);
  let commentTextOffset = useRef(0);
  let { isLoading, posts } = usePosts();
  let { navigate } = useNavigation();

  let [isTypingComment, setTypingComment] = useState(false);
  let [keyboardHeight, setKeyboardHeight] = useState(0);
  let [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  let [newComment, setNewComment] = useState('');

  let [animatedVisibility, animatedValue] = useFadingAnimation(
    isTypingComment,
    { duration: 150 },
  );

  let marginWhenKeyboardVisible = keyboardHeight - 32;

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', keyboardDidShow);
    Keyboard.addListener('keyboardDidHide', closeCommentInput);
    return () => {
      Keyboard.removeListener('keyboardDidShow', keyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', closeCommentInput);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (keyboardHeight > 0) {
      let newOffset = currentOffset.current + commentTextOffset.current;
      setTimeout(() => {
        flatList.current?.scrollToOffset({
          offset: newOffset,
        });
      }, 100);
    }
  }, [keyboardHeight]);

  let keyboardDidShow = (e: KeyboardEvent) =>
    setKeyboardHeight(e.endCoordinates.height);

  let storeNewComment = (postId: number, comment: string) => {
    // let index = posts.findIndex((post) => post.id === postId);
    // let addedComment = {
    // id: new Date().getTime(),
    // content: comment,
    // isNew: true,
    // };
    // let newPost = {
    // ...posts[index],
    // comments: [...posts[index].comments, addedComment],
    // };
    // let newPosts = [
    // ...posts.slice(0, index),
    // newPost,
    // ...posts.slice(index + 1),
    // ];
    // setPosts(newPosts);
  };

  let closeCommentInput = () => {
    setKeyboardHeight(0);
    setTypingComment(false);
    if (selectedPostId) {
      storeNewComment(selectedPostId, newComment);
      setSelectedPostId(null);
      setNewComment('');
    }
  };

  let openCommentInput = (e: GestureResponderEvent, postId: number) => {
    let offset = e.nativeEvent.pageY - COMMENT_INPUT_POSITION;
    commentTextOffset.current = offset;
    setTypingComment(true);
    setSelectedPostId(postId);
  };

  let updateCurrentOffset = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    currentOffset.current = e.nativeEvent.contentOffset.y;
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, paddingVertical: 50 }}>
        <ActivityIndicator size="large" accessibilityStates={null} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList<Post>
        ref={flatList}
        keyExtractor={(_item, index) => index.toString()}
        data={posts}
        onScrollEndDrag={updateCurrentOffset}
        onMomentumScrollEnd={updateCurrentOffset}
        style={{
          marginBottom: keyboardHeight > 0 ? marginWhenKeyboardVisible : 0,
        }}
        renderItem={({ item }) => {
          let {
            id,
            user,
            images,
            description,
            comments,
            highlightedComments,
            created_at: createdAt,
          } = item;
          return (
            <View style={{ marginBottom: 32 }}>
              <View style={styles.itemHeader}>
                <Image
                  source={{
                    uri: `${DEV_API}${user.photo.formats.thumbnail.url}`,
                  }}
                  style={styles.itemProfileImage}
                />
                <Text weight="medium" style={{ color: '#000' }}>
                  {user.username}
                </Text>
              </View>
              <Image
                source={{ uri: `${DEV_API}${images[0].formats.large.url}` }}
                style={styles.itemImage}
              />
              <View style={{ marginHorizontal: 12, marginTop: 12 }}>
                <Text>
                  <Text weight="medium" style={{ color: '#000' }}>
                    {user.username}
                  </Text>
                  {` ${description}`}
                </Text>
              </View>
              {comments.length > 0 && (
                <>
                  <TouchableOpacity
                    onPress={() => navigate('Comments', { postId: id })}
                    style={{ marginHorizontal: 12, marginTop: 12 }}
                  >
                    <Text weight="light" style={{ color: '#555' }}>
                      View all 3 comments
                    </Text>
                  </TouchableOpacity>
                  {highlightedComments.length > 0 && (
                    <View
                      style={{
                        marginHorizontal: 12,
                        marginTop: 12,
                      }}
                    >
                      {highlightedComments.map((comment) => (
                        <Text key={comment.id}>
                          <Text weight="medium" style={{ color: '#000' }}>
                            {comment.user.username}
                          </Text>{' '}
                          {comment.content}
                        </Text>
                      ))}
                    </View>
                  )}
                </>
              )}
              <TouchableOpacity
                onPress={(e) => openCommentInput(e, id)}
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
                <Text weight="light" style={{ color: '#555' }}>
                  Add a comment...
                </Text>
              </TouchableOpacity>
              <Label
                weight="light"
                style={{ marginHorizontal: 12, color: '#555' }}
              >
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
            <TextInput
              autoFocus
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={(text) => setNewComment(text)}
              onSubmitEditing={closeCommentInput}
            />
          </Animated.View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    // paddingTop: Constants.statusBarHeight,
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
