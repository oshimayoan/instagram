import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { useRecoilState, useRecoilValue } from 'recoil';

import { postListState, Post } from '../atoms/posts';
import { commentListState } from '../atoms/comments';
import { combineData } from '../helpers/combineData';
import { sortByDate } from '../helpers/sort';
import { usePersistCache } from '../helpers/persistCache';
import { DEV_API } from '../constants/api';
import { hydrationState } from '../atoms/hydration';

import { useCommentAction } from './comment';

export let getAllPosts = async (userId?: number) => {
  let filters = '_limit=20&_sort=created_at:DESC';
  if (userId != null) {
    filters = `${filters}&user.id=${userId}`;
  }
  return fetch(`${DEV_API}/posts?${filters}`)
    .then((res) => res.json())
    .catch((e) => console.log(e.message));
};

export function usePosts(userId?: number) {
  let postsKey = userId != null ? ['posts', { userId }] : 'posts';
  let isHydrated = useRecoilValue(hydrationState);
  let { isLoading, isFetching, data, refetch, error, isError } = useQuery<
    Array<Post>
  >(postsKey, () => getAllPosts(userId), {
    enabled: isHydrated,
  });
  let [postList, setPostList] = useRecoilState(postListState);
  let commentList = useRecoilValue(commentListState);
  let { addComment } = useCommentAction();
  let { persist } = usePersistCache();

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
