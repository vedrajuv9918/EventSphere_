export const API = {
  get: (url) =>
    fetch(url).then((r) => r.json()),

  authGet: (url) =>
    fetch(url, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    }).then((r) => r.json()),

  post: (url, body) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  authPost: (url, body) =>
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
};
