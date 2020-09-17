import { atom } from 'recoil';

import { User } from '../types/User';

import { Comment } from './comments';

export type Image = {
  id: number;
  formats: {
    large: {
      url: string;
      width: number;
      height: number;
    };
  };
};

export type Post = {
  id: number;
  description: string;
  user: User;
  images: Array<Image>;
  comments: Array<Comment>;
  created_at: string;
};

export type PostList = Array<Post>;

export type PostListState = {
  key: 'posts';
  default: PostList;
};

export const postListState = atom<PostList>({
  key: 'posts',
  default: [],
});
