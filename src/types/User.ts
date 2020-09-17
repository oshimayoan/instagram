export type User = {
  username: string;
  photo: {
    formats: {
      thumbnail: {
        url: string;
      };
    };
  };
};
