import { atom } from 'recoil';

type User = {
  username: string;
  photo: {
    formats: {
      thumbnail: {
        url: string;
      };
    };
  };
};

export type Comment = {
  id: number;
  content: string;
  postId: number;
  created_at: string;
  user: User;
};

export type CommentList = {
  [postId: string]: Array<Comment>;
};

export type CommentListState = {
  key: 'commentList';
  default: CommentList;
};

export const commentListState = atom<CommentList>({
  key: 'commentList',
  default: {},
});
