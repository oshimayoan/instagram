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
  highlightedComments: Array<HighligtedComment>;
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
