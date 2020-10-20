import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useQuery, useMutation } from 'react-query';
import { useRecoilState, useRecoilValue } from 'recoil';
import * as Sentry from 'sentry-expo';
import type { ImageInfo } from 'expo-image-picker/build/ImagePicker.types';

import { postListState, Post } from '../atoms/posts';
import { commentListState } from '../atoms/comments';
import { combineData } from '../helpers/combineData';
import { sortByDate } from '../helpers/sort';
import { usePersistCache } from '../helpers/persistCache';
import { API_URL } from '../constants/api';
import { hydrationState } from '../atoms/hydration';

import { useCommentAction } from './comment';
import { useAuth } from './auth';
import { userState, tokenState, profileState } from '../atoms/user';
import { User } from '../types/User';

type GetAllPostsError = {
  error: string;
  message: string;
  statusCode: number;
};

export let getAllPosts = async (
  token: string,
  userId?: number,
): Promise<Array<Post> | GetAllPostsError> => {
  let authorization = `Bearer ${token}`;
  let filters = '_limit=20&_sort=created_at:DESC';
  if (userId != null) {
    filters = `${filters}&user.id=${userId}`;
  }
  return fetch(`${API_URL}/posts?${filters}`, {
    headers: {
      'content-type': 'application/json',
      authorization,
    },
  })
    .then((res) => res.json())
    .catch((e) => console.log(e.message));
};

type NewPost = Pick<Post, 'description'> & {
  images: Array<ImageInfo>;
};

type CreatePostParams = {
  token: string;
  post: NewPost & {
    user: { id: number };
  };
};

export let createPost = async (params: CreatePostParams) => {
  let { token, post } = params;
  let { images, ...otherData } = post;
  let [image] = images;
  let authorization = `Bearer ${token}`;
  let data = JSON.stringify(otherData);
  let body = new FormData();
  body.append('data', data);
  body.append('files.images', ({
    uri: image.uri,
    name: new Date().getTime().toString(),
    type: image.type as string,
  } as unknown) as Blob);

  return fetch(`${API_URL}/posts`, {
    method: 'POST',
    body,
    headers: {
      'content-type': 'multipart/form-data',
      authorization,
    },
  }).then((res) => res.json());
};

export function usePostAction() {
  let [postList, setPostList] = useRecoilState(postListState);
  let [mutate] = useMutation(createPost);
  let token = useRecoilValue(tokenState);
  let user = useRecoilValue(profileState) as User;
  let { persist } = usePersistCache();

  let addPost = (post: NewPost) => {
    let tempId = new Date().getTime();
    let images = post.images.map((image, id) => {
      let { uri: url, width, height } = image;

      return {
        id,
        formats: {
          thumbnail: { url, width, height },
          large: { url, width, height },
        },
      };
    });
    let newPost: Post = {
      ...post,
      id: tempId,
      images,
      user,
      highlightedComments: [],
      comments: [],
      created_at: new Date().toISOString(),
    };
    let newPostList = [newPost, ...postList];
    setPostList(newPostList);

    mutate({
      token,
      post: {
        ...post,
        user: { id: user.id },
      },
    })
      .then((newPostServer: Post) => {
        let index = newPostList.findIndex((post) => post.id === tempId);
        let newPostCombined = {
          ...newPost,
          ...newPostServer,
        };
        let mutatedPostList: Array<Post> = [
          ...newPostList.slice(0, index),
          newPostCombined,
          ...newPostList.slice(index + 1),
        ];
        setPostList(mutatedPostList);
        persist(['posts']);
      })
      .catch((e) => {
        Sentry.Native.captureException(e);
        Alert.alert('Something unexpected happen', e.message);
      });
  };

  return { addPost };
}

export function usePosts(userId?: number) {
  let postsKey = userId != null ? ['posts', { userId }] : 'posts';
  let isHydrated = useRecoilValue(hydrationState);
  let token = useRecoilValue(tokenState);
  let { isLoading, isFetching, data, refetch, error, isError } = useQuery(
    postsKey,
    () => getAllPosts(token, userId),
    {
      enabled: isHydrated,
    },
  );
  let [postList, setPostList] = useRecoilState(postListState);
  let commentList = useRecoilValue(commentListState);
  let { addComment } = useCommentAction();
  let { persist } = usePersistCache();
  let { logout } = useAuth();

  let posts = postList.map((post) => {
    let relatedComments = commentList[post.id.toString()] ?? [];
    let totalComments =
      relatedComments.length > post.comments.length
        ? relatedComments.length
        : post.comments.length;
    return {
      ...post,
      highlightedComments: relatedComments.slice(-2),
      totalComments,
    };
  });

  useEffect(() => {
    if ((!isLoading || !isFetching) && data) {
      if ('error' in data) {
        switch (data.statusCode) {
          case 401:
          case 403: {
            logout();
            break;
          }
          default:
            Alert.alert(data.error, data.message);
            break;
        }
        return;
      }
      persist(['posts']);
      setPostList(data);
    }
  }, [isLoading, isFetching]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isLoading,
    isFetching,
    isError,
    refetch,
    error,
    addComment,
    posts,
  };
}
