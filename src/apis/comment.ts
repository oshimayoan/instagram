import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { useRecoilState } from 'recoil';

import { commentListState, Comment } from '../atoms/comments';
import { DEV_API } from '../constants/api';

export let getAllComments = (postId: number) =>
  fetch(`${DEV_API}/comments?_limit=20&postId=${postId}`).then((res) =>
    res.json(),
  );

export function useCommentAction(postId: number) {
  let [commentList, setCommentList] = useRecoilState(commentListState);

  let addComment = (comment: string) => {
    let newComment = {
      id: new Date().getTime(),
      content: comment,
      postId,
      user: {
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
    let newCommentList = {
      ...commentList,
      [postId.toString()]: [...commentList[postId.toString()], newComment],
    };
    setCommentList(newCommentList);
  };

  return { addComment };
}

export function useComments(postId: number) {
  let { isLoading, data, error, isError } = useQuery<Array<Comment>>(
    'comments',
    () => getAllComments(postId),
  );
  let [commentList, setCommentList] = useRecoilState(commentListState);
  let { addComment } = useCommentAction(postId);

  useEffect(() => {
    if (!isLoading && data) {
      let newCommentList = {
        ...commentList,
        [postId.toString()]: data,
      };
      setCommentList(newCommentList);
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isLoading,
    isError,
    error,
    addComment,
    comments: commentList[postId.toString()] || [],
  };
}
