import { useEffect, useCallback } from 'react';
import { useQuery, useMutation } from 'react-query';
import { useRecoilState } from 'recoil';

import { commentListState, Comment } from '../atoms/comments';
import { combineData } from '../helpers/combineData';
import { sortByDate } from '../helpers/sort';
import { usePersistCache } from '../helpers/persistCache';
import { DEV_API } from '../constants/api';

export let getAllComments = (postId: number) =>
  fetch(`${DEV_API}/comments?_limit=20&postId=${postId}`).then((res) =>
    res.json(),
  );

type NewCommentData = Pick<Comment, 'content' | 'postId'> & {
  user: { id: number };
};

export let createComment = async (data: NewCommentData) => {
  let body = JSON.stringify(data);
  return fetch(`${DEV_API}/comments`, { method: 'POST', body }).then((res) =>
    res.json(),
  );
};

export function useCommentAction() {
  let [commentList, setCommentList] = useRecoilState(commentListState);
  let [mutate] = useMutation(createComment);

  let addComment = (postId: number, comment: string) => {
    let newComment = {
      id: new Date().getTime(),
      content: comment,
      postId,
      user: {
        id: 1,
        username: 'oshimayoan',
        photo: {
          formats: {
            thumbnail: {
              url: '/uploads/thumbnail_2019_11_18_0bf602eb36.jpg',
            },
          },
        },
      },
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
    });
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
