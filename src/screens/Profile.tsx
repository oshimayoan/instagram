import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'react-native-expo-image-cache';
import { useRecoilValue } from 'recoil';
import { Text, Subtitle } from 'exoflex';

import { profileState } from '../atoms/user';
import { DEV_API } from '../constants/api';
import type { User } from '../types/User';

const PROFILE_IMAGE_SIZE = 104;

export default function Profile() {
  let user = useRecoilValue(profileState) as User;
  let photoUri = user?.photo?.formats?.thumbnail?.url ?? '';
  let fullName = `${user.firstName} ${user.lastName}`;
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.avatarWrapper}>
        <Image uri={`${DEV_API}${photoUri}`} style={styles.profileImage} />
        <View style={styles.totalPosts}>
          <Subtitle weight="bold">{user.totalPosts}</Subtitle>
          <Text>Posts</Text>
        </View>
      </View>
      <Text weight="bold" style={{ marginVertical: 8 }}>
        {fullName}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
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
    marginHorizontal: 12,
  },
});
