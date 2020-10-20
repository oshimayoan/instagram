import { useEffect } from 'react';
import { useQuery, useMutation, useQueryCache } from 'react-query';
import { useRecoilState, useRecoilValue } from 'recoil';

import { commentListState, Comment } from '../atoms/comments';
import { combineData } from '../helpers/combineData';
import { sortByDate } from '../helpers/sort';
import { usePersistCache } from '../helpers/persistCache';
import { API_URL } from '../constants/api';
import { Posts } from '../atoms/posts';
import { userState } from '../atoms/user';

export let getAllComments = (postId: number) =>
  fetch(`${API_URL}/comments?_limit=20&postId=${postId}`).then((res) =>
    res.json(),
  );

type NewCommentData = Pick<Comment, 'content' | 'postId'> & {
  user: { id: number };
  post: { id: number };
};

export let createComment = async (data: NewCommentData) => {
  let body = JSON.stringify(data);
  return fetch(`${API_URL}/comments`, { method: 'POST', body }).then((res) =>
    res.json(),
  );
};

export function useCommentAction() {
  let [commentList, setCommentList] = useRecoilState(commentListState);
  let [mutate] = useMutation(createComment);
  let { persist } = usePersistCache();
  let queryCache = useQueryCache();
  let user = useRecoilValue(userState);

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
      postId,
      content: comment,
      user: { id: 1 },
      post: { id: postId },
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
  let { isLoading, data, error, isError } = useQuery<Array<Comment>>(
    ['comments', { postId }],
    () => getAllComments(postId),
  );
  let [commentList, setCommentList] = useRecoilState(commentListState);
  let { addComment: addCommentBase } = useCommentAction();
  let { persist } = usePersistCache();

  useEffect(() => {
    if (!isLoading && data) {
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
