export let getAllFeeds = () =>
  fetch('https://randomuser.me/api/?nat=gb&results=100').then((res) =>
    res.json(),
  );
