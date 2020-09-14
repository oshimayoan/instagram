import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, Subtitle, Avatar, Label } from 'exoflex';
import { useRoute } from '@react-navigation/native';
import { useRecoilValue } from 'recoil';
import { format } from 'timeago.js';

import { useComments } from '../apis/comment';
import { postsState } from '../atoms/posts';
import { DEV_API } from '../constants/api';

export default function Comments() {
  let { params } = useRoute();
  let { isLoading, comments } = useComments(params?.postId);

  if (isLoading) {
    return (
      <View style={{ flex: 1, paddingVertical: 50 }}>
        <ActivityIndicator size="large" accessibilityStates={null} />
      </View>
    );
  }

  return (
    <FlatList
      keyExtractor={(_item, index) => index.toString()}
      data={comments}
      ListEmptyComponent={() => (
        <View style={styles.emptyWrapper}>
          <Subtitle>There is no comments</Subtitle>
        </View>
      )}
      contentContainerStyle={styles.container}
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
});
