import React, { useState, useEffect, useRef, ComponentProps } from 'react';
import {
  View,
  FlatList,
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
  Platform,
  Image as RNImage,
} from 'react-native';
import { Text, TextInput, Label, Title } from 'exoflex';
import { format } from 'timeago.js';
import { useNavigation } from '@react-navigation/native';
import { Image as CachedImage } from 'react-native-expo-image-cache';

import { useFadingAnimation } from '../helpers/useFadingAnimation';
import { usePosts } from '../apis/post';
import { Post } from '../atoms/posts';

const COMMENT_INPUT_POSITION = 568.5;

export default function Feed() {
  let flatList = useRef<FlatList | null>(null);
  let currentOffset = useRef(0);
  let commentTextOffset = useRef(0);
  let { posts, addComment, refetch } = usePosts();
  let { navigate } = useNavigation();

  let [isTypingComment, setTypingComment] = useState(false);
  let [keyboardHeight, setKeyboardHeight] = useState(0);
  let [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  let [newComment, setNewComment] = useState('');
  let [isRefreshing, setRefreshing] = useState(false);

  let [animatedVisibility, animatedValue] = useFadingAnimation(
    isTypingComment,
    { duration: 150 },
  );

  let marginWhenKeyboardVisible = Platform.select({
    ios: keyboardHeight - 32,
    default: 0,
  });

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', keyboardDidShow);
    Keyboard.addListener('keyboardDidHide', closeCommentInput);
    return () => {
      Keyboard.removeListener('keyboardDidShow', keyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', closeCommentInput);
    };
  }, []);

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

  let submitComment = () => {
    if (selectedPostId && newComment.trim()) {
      addComment(selectedPostId, newComment);
    }
    closeCommentInput();
  };

  let closeCommentInput = () => {
    setKeyboardHeight(0);
    setTypingComment(false);
    setSelectedPostId(null);
    setNewComment('');
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

  let refresh = () => {
    setRefreshing(true);
    refetch()
      .then(() => setRefreshing(false))
      .catch(() => setRefreshing(false));
  };

  return (
    <View style={styles.root}>
      <FlatList<Post>
        ref={flatList}
        keyExtractor={(_item, index) => index.toString()}
        data={posts}
        onScrollEndDrag={updateCurrentOffset}
        onMomentumScrollEnd={updateCurrentOffset}
        refreshing={isRefreshing}
        onRefresh={refresh}
        style={{
          marginBottom: keyboardHeight > 0 ? marginWhenKeyboardVisible : 0,
        }}
        ListEmptyComponent={
          <View style={styles.emptyTextWrapper}>
            <Title style={{ color: 'grey' }}>There is no post yet</Title>
          </View>
        }
        renderItem={({ item }) => {
          let {
            id,
            user,
            images,
            description,
            comments,
            highlightedComments,
            created_at: createdAt,
            totalComments = comments.length,
          } = item;
          return (
            <View style={{ marginBottom: 32 }}>
              <View style={styles.itemHeader}>
                <Image
                  uri={user.photo.formats.thumbnail.url}
                  style={styles.itemProfileImage}
                />
                <Text weight="medium" style={{ color: '#000' }}>
                  {user.username}
                </Text>
              </View>
              <Image
                tint="light"
                preview={{
                  uri: images[0]?.formats?.thumbnail?.url ?? '',
                }}
                uri={
                  images[0]?.formats?.large?.url ??
                  images[0]?.formats?.medium?.url ??
                  images[0]?.formats?.small?.url ??
                  ''
                }
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
              {totalComments > 0 && (
                <>
                  <TouchableOpacity
                    onPress={() => navigate('Comments', { postId: id })}
                    style={{ marginHorizontal: 12, marginTop: 12 }}
                  >
                    <Text weight="light" style={{ color: '#555' }}>
                      View all {totalComments} comments
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
                  uri={user.photo.formats.thumbnail.url}
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
              marginBottom: Platform.select({
                ios: keyboardHeight,
                default: 0,
              }),
              opacity: animatedValue,
            }}
          >
            <TextInput
              autoFocus
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={(text) => setNewComment(text)}
              onSubmitEditing={submitComment}
            />
          </Animated.View>
        </Modal>
      )}
    </View>
  );
}

function Image(props: ComponentProps<typeof CachedImage>) {
  let { uri, preview, tint, ...otherProps } = props;
  let isLocal = uri.indexOf('http') !== 0 && uri.indexOf('https') !== 0;

  if (isLocal) {
    return <RNImage source={{ uri }} {...otherProps} />;
  }

  return <CachedImage {...props} />;
}

Image.defaultProps = {
  onError: () => {},
};

const styles = StyleSheet.create({
  root: {
    // paddingTop: Constants.statusBarHeight,
  },
  emptyTextWrapper: {
    paddingVertical: 64,
    alignItems: 'center',
    justifyContent: 'center',
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
