import { DEV_API } from '../constants/api';

export let getAllPosts = () =>
  fetch(`${DEV_API}/posts?_sort=created_at:DESC`).then((res) => res.json());
