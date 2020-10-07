export type User = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  confirmed: boolean;
  blocked: boolean;
  photo: {
    width: number;
    height: number;
    formats: {
      thumbnail: {
        url: string;
        width: number;
        height: number;
      };
    };
  };
  totalPosts: number;
};
