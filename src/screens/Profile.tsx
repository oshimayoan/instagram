import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'react-native-expo-image-cache';
import { useRecoilValue } from 'recoil';
import { Text, Subtitle } from 'exoflex';

import { profileState } from '../atoms/user';
import { usePosts } from '../apis/post';
import { DEV_API } from '../constants/api';
import type { User } from '../types/User';

const PROFILE_IMAGE_SIZE = 104;
const DEVICE_WIDTH = Dimensions.get('window').width;
const POST_COLUMNS = 3;
const POST_IMAGE_HEIGHT =
  DEVICE_WIDTH / POST_COLUMNS - StyleSheet.hairlineWidth * 2;

export default function Profile() {
  let user = useRecoilValue(profileState) as User;
  let avatarUri = user?.photo?.formats?.thumbnail?.url ?? '';
  let fullName = `${user.firstName} ${user.lastName}`;
  let { posts } = usePosts(user.id);

  return (
    <FlatList
      numColumns={POST_COLUMNS}
      keyExtractor={({ id }) => id.toString()}
      data={posts}
      renderItem={({ item }) => {
        let uri = item.images[0].formats.thumbnail.url;

        return (
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => {}}
            style={styles.post}
          >
            <Image
              uri={uri}
              preview={{ uri }}
              tint="light"
              style={styles.postImage}
            />
          </TouchableOpacity>
        );
      }}
      ListHeaderComponent={
        <ProfileHeader
          avatarUri={avatarUri}
          fullName={fullName}
          totalPosts={user.totalPosts}
        />
      }
      contentContainerStyle={styles.container}
      ListHeaderComponentStyle={styles.headerWrapper}
    />
  );
}

type ProfileHeaderProps = {
  avatarUri: string;
  fullName: string;
  totalPosts: number;
};

function ProfileHeader(props: ProfileHeaderProps) {
  let { avatarUri, fullName, totalPosts } = props;
  return (
    <>
      <View style={styles.avatarWrapper}>
        <Image
          uri={avatarUri}
          preview={{ uri: avatarUri }}
          tint="light"
          style={styles.profileImage}
        />
        <View style={styles.totalPosts}>
          <Subtitle weight="bold">{totalPosts}</Subtitle>
          <Text>Posts</Text>
        </View>
      </View>
      <View style={{ marginVertical: 8 }}>
        <Text weight="bold">{fullName}</Text>
        <Text>Nice to meet you!</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  headerWrapper: {
    paddingHorizontal: 16,
    marginBottom: 36,
  },
  avatarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: -16,
  },
  totalPosts: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  profileImage: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: PROFILE_IMAGE_SIZE / 2,
    marginHorizontal: 16,
  },
  post: {
    flex: 1,
    padding: StyleSheet.hairlineWidth,
  },
  postImage: {
    width: POST_IMAGE_HEIGHT,
    height: POST_IMAGE_HEIGHT,
  },
});
