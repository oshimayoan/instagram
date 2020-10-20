import { atom, selector } from 'recoil';

import type { User } from '../types/User';

import { Comment } from './comments';
import { profileState } from './user';

export type Image = {
  id: number;
  formats: {
    thumbnail: {
      url: string;
      width: number;
      height: number;
    };
    small: {
      url: string;
      width: number;
      height: number;
    };
    medium: {
      url: string;
      width: number;
      height: number;
    };
    large: {
      url: string;
      width: number;
      height: number;
    };
  };
};

export type HighligtedComment = {
  id: number;
  content: string;
  postId: number;
  user: {
    id: number;
    username: string;
  };
  createdAt: string;
};

export type Post = {
  id: number;
  description: string;
  user: User;
  images: Array<Image>;
  comments: Array<Comment>;
  highlightedComments: Array<HighligtedComment | Comment>;
  totalComments?: number;
  created_at: string;
};

export type Posts = Array<Post>;

export type PostListState = {
  key: 'posts';
  default: Posts;
};

export const postListState = atom<Posts>({
  key: 'posts',
  default: [],
});

export const userPostListState = selector({
  key: 'userPosts',
  get: ({ get }) => {
    let user = get(profileState) as User;
    let posts = get(postListState);

    return posts.filter((post) => post.user.id === user.id);
  },
});
