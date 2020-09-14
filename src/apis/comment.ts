import { useQuery } from 'react-query';

import { DEV_API } from '../constants/api';

export let getAllComments = (postId: string) =>
  fetch(`${DEV_API}/comments?_limit=20&postId=${postId}`).then((res) =>
    res.json(),
  );

export function useComments(postId: string) {
  let { isLoading, data } = useQuery('comments', () => getAllComments(postId));

  return { isLoading, comments: data };
}
