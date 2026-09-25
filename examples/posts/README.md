# Posts example

A small HTTP API with CRUD for posts, mirrored with Mirror.

| Method | Path | Flow |
| --- | --- | --- |
| `POST` | `/posts` | `create-post` |
| `GET` | `/posts?authorId=` | `list-posts` |
| `GET` | `/posts/:id` | `get-post` |
| `PATCH` | `/posts/:id` | `update-post` |
| `DELETE` | `/posts/:id` | `delete-post` |
| `GET` | `/health` | `health-check` |

- `code/`: the API (TypeScript, Express, in-memory store). Run it with `npm -C code run dev`. Test it with `npm -C code run test`.
- `.mirror/`: its mirror. Open `.mirror/visualize.html` in a browser.
