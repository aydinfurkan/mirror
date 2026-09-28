# Posts example

A posts app with CRUD, mirrored with Mirror. Two projects: an HTTP API and a web app.

## `api` (`code/`)

TypeScript, Express, in-memory store.

| Method | Path | Flow |
| --- | --- | --- |
| `POST` | `/posts` | `create-post` |
| `GET` | `/posts?authorId=` | `list-posts` |
| `GET` | `/posts/:id` | `get-post` |
| `PATCH` | `/posts/:id` | `update-post` |
| `DELETE` | `/posts/:id` | `delete-post` |
| `GET` | `/health` | `health-check` |

## `web` (`web/`)

React, React Router, Vite. It calls the API through `/api`, which the dev server sends to port 3000.

| Route | Page |
| --- | --- |
| `/` | `posts-list` |
| `/posts/:id` | `post-detail` |
| `/posts/new` | `new-post` |
| `/posts/:id/edit` | `edit-post` |

## Run

```sh
npm -C code install && npm -C code run dev   # API on :3000
npm -C web install && npm -C web run dev     # web app on :5173
```

Test each project with `npm -C code run test` and `npm -C web run test`.

Open `.mirror/visualize.html` in a browser to see both projects in the graph.
