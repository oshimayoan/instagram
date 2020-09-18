import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { useRecoilState, useRecoilValue } from 'recoil';

import { postListState, Post } from '../atoms/posts';
import { commentListState } from '../atoms/comments';
import { combineData } from '../helpers/combineData';
import { sortByDate } from '../helpers/sort';
import { DEV_API } from '../constants/api';

import { useCommentAction } from './comment';

export let getAllPosts = () =>
  fetch(`${DEV_API}/posts?_limit=20&_sort=created_at:DESC`).then((res) =>
    res.json(),
  );

export function usePosts() {
  let { isLoading, data, error, isError } = useQuery<Array<Post>>(
    'posts',
    getAllPosts,
  );
  let [postList, setPostList] = useRecoilState(postListState);
  let commentList = useRecoilValue(commentListState);
  let { addComment } = useCommentAction();

  let posts = postList.map((post) => {
    let relatedComments = commentList[post.id.toString()] ?? [];
    let highlightedComments = combineData(
      relatedComments,
      post.highlightedComments,
    );
    let sortedHighlightedComments = sortByDate(highlightedComments, 'asc');
    let totalComments =
      highlightedComments.length > post.comments.length
        ? highlightedComments.length
        : post.comments.length;
    return {
      ...post,
      highlightedComments: sortedHighlightedComments.slice(-2),
      totalComments,
    };
  });

  useEffect(() => {
    !isLoading && data && setPostList(data);
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isLoading,
    isError,
    error,
    addComment,
    posts,
  };
}
