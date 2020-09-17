import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { useRecoilState } from 'recoil';

import { postListState, Post } from '../atoms/posts';
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
  let { addComment } = useCommentAction();

  useEffect(() => {
    !isLoading && data && setPostList(data);
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isLoading,
    isError,
    error,
    posts: postList,
  };
}
