import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useQuery, useMutation, useQueryCache } from 'react-query';
import { useRecoilState, useRecoilValue } from 'recoil';
import * as Sentry from 'sentry-expo';

import { commentListState, Comment } from '../atoms/comments';
import { combineData } from '../helpers/combineData';
import { sortByDate } from '../helpers/sort';
import { usePersistCache } from '../helpers/persistCache';
import { API_URL } from '../constants/api';
import { userState, tokenState } from '../atoms/user';
import type { User } from '../types/User';

import { useAuth } from './auth';

type GetAllCommentsError = {
  error: string;
  message: string;
  statusCode: number;
};

export let getAllComments = (
  token: string,
  postId: number,
): Promise<Array<Comment> | GetAllCommentsError> =>
  fetch(`${API_URL}/comments?_limit=20&postId=${postId}`, {
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json());

type NewCommentData = Pick<Comment, 'content' | 'postId'> & {
  user: { id: number };
  post: { id: number };
};

type CreateCommentParams = {
  token: string;
  comment: NewCommentData;
};

export let createComment = async (params: CreateCommentParams) => {
  let { token, comment: data } = params;
  let body = JSON.stringify(data);
  return fetch(`${API_URL}/comments`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body,
  })
    .then((res) => res.json())
    .catch((e) => {
      Sentry.Native.captureException(e);
      Alert.alert('Something unexpected happen', e.message);
    });
};

export function useCommentAction() {
  let [commentList, setCommentList] = useRecoilState(commentListState);
  let [mutate] = useMutation(createComment);
  let { persist } = usePersistCache();
  let queryCache = useQueryCache();
  let user = useRecoilValue(userState) as User;
  let token = useRecoilValue(tokenState);

  let addComment = (postId: number, comment: string) => {
    let tempId = new Date().getTime();
    let newComment = {
      id: tempId,
      content: comment,
      postId,
      user,
      created_at: new Date().toISOString(),
    };
    let oldComments = commentList[postId.toString()] ?? [];
    let newCommentList = {
      ...commentList,
      [postId.toString()]: [...oldComments, newComment],
    };
    setCommentList(newCommentList);
    mutate({
      token,
      comment: {
        postId,
        content: comment,
        user: { id: user.id },
        post: { id: postId },
      },
    })
      .then((newComment) => {
        let comments = newCommentList[postId.toString()];
        let index = comments.findIndex((comment) => comment.id === tempId);
        let newComments = [
          ...comments.slice(0, index),
          newComment,
          ...comments.slice(index + 1),
        ];
        let mutatedCommentList = {
          ...newCommentList,
          [postId.toString()]: newComments,
        };
        setCommentList(mutatedCommentList);
        persist(['comments', { postId }]);

        // let cachedPosts = queryCache.getQueryData(['posts']) as Posts;
        // let postIndex = cachedPosts.findIndex((post) => post.id === postId);
        // let updatedPost = {
        // ...cachedPosts[postIndex],
        // highlightedComments: newComments,
        // };
        // let newCachedPosts = [
        // ...cachedPosts.slice(0, postIndex),
        // updatedPost,
        // ...cachedPosts.slice(postIndex + 1),
        // ];
        // queryCache.setQueryData(['posts'], newCachedPosts);
        // persist(['posts']);
      })
      .catch((e) => console.log('Something unexpected happen:', e));
  };

  return { addComment };
}

export function useComments(postId: number) {
  let token = useRecoilValue(tokenState);
  let { isLoading, data, error, isError } = useQuery(
    ['comments', { postId }],
    () => getAllComments(token, postId),
  );
  let [commentList, setCommentList] = useRecoilState(commentListState);
  let { addComment: addCommentBase } = useCommentAction();
  let { persist } = usePersistCache();
  let { logout } = useAuth();

  useEffect(() => {
    if (!isLoading && data) {
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
      let key = postId.toString();
      let initialData = commentList[key] || [];
      let newComments = sortByDate(combineData(data, initialData), 'asc');
      let newCommentList = {
        ...commentList,
        [key]: newComments,
      };
      persist(['comments', { postId }]);
      setCommentList(newCommentList);
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  let addComment = (comment: string) => addCommentBase(postId, comment);

  return {
    isLoading,
    isError,
    error,
    addComment,
    comments: commentList[postId.toString()] || [],
  };
}
