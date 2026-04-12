# Taskr — Vue 3 Frontend

A single-page todo application built with **Vue 3 + Vite**, structured
following the **MVP (Model–View–Presenter)** pattern.

---

## Project structure

```
taskr/
├── index.html                   # Root HTML entry point
├── vite.config.js               # Vite + dev-proxy config
├── package.json
└── src/
    ├── main.js                  # App bootstrap, global CSS imports
    │
    ├── api/
    │   └── index.js             # All backend HTTP calls (authApi, listsApi, todosApi)
    │
    ├── styles/
    │   ├── variables.css        # CSS design tokens (colors, radii, fonts…)
    │   ├── base.css             # Reset, body, scrollbar, keyframe animations
    │   └── components.css       # Shared UI primitives (buttons, inputs, badges…)
    │
    ├── composables/             # ── MODEL layer ──
    │   ├── useToast.js          # Global toast notification state
    │   ├── useAuth.js           # Login / register state + actions
    │   ├── useLists.js          # Todo-list CRUD + editing state
    │   └── useTodos.js          # Todo-item CRUD, editing state, sort logic
    │
    ├── components/              # ── PRESENTER layer ──
    │   ├── auth/
    │   │   └── AuthForm.vue     # Login / register card (dumb, emits 'submit')
    │   ├── lists/
    │   │   ├── ListCard.vue     # Single list row — view & inline edit modes
    │   │   └── ListCreateForm.vue  # Inline create form for a new list
    │   ├── todos/
    │   │   ├── TodoCard.vue     # Single todo row — view & inline edit modes
    │   │   └── TodoCreateForm.vue  # Inline create form for a new todo
    │   └── shared/
    │       ├── AppTopbar.vue    # Sticky nav bar
    │       └── AppToast.vue     # Global toast overlay
    │
    ├── views/                   # ── VIEW layer ──
    │   ├── ListsView.vue        # "My Lists" page — wires ListCard + ListCreateForm
    │   └── TodosView.vue        # "Todos" page — wires TodoCard + TodoCreateForm
    │
    └── App.vue                  # Root — owns navigation state, passes composables down
```

---

## MVP layer responsibilities

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Model** | `src/api/` + `src/composables/` | All data fetching, state management, and business logic. Composables are the single source of truth. |
| **View** | `src/views/` | Page-level layout. Receives composable instances as props, owns no local state. |
| **Presenter** | `src/components/` | Dumb UI components. Accept props, emit events. Know nothing about the API or composables. |

---

## Getting started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure the API base URL
Open `src/api/index.js` and set `BASE_URL` to your Spring Boot server:
```js
const BASE_URL = 'http://localhost:8080';
```
In development the Vite dev-server already proxies `/api` → `http://localhost:8080`
(see `vite.config.js`), so you can also leave `BASE_URL` as an empty string `''`
and rely on the proxy.

### 3. Start the dev server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

### 4. Build for production
```bash
npm run build   # output goes to dist/
```

---

## Expected Spring Boot API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/users/register` | Register `{ username }` |
| POST | `/api/users/login` | Login `{ username }` |
| GET | `/api/users/:username/lists` | Get all lists for user |
| POST | `/api/users/:username/lists` | Create list `{ title, description }` |
| PUT | `/api/users/:username/lists/:id` | Update list |
| DELETE | `/api/users/:username/lists/:id` | Delete list |
| GET | `/api/lists/:listId/todos` | Get all todos for list |
| POST | `/api/lists/:listId/todos` | Create todo `{ title, description, due_date, priority }` |
| PUT | `/api/lists/:listId/todos/:id` | Update todo |
| DELETE | `/api/lists/:listId/todos/:id` | Delete todo |

`priority` is one of: `LOW` · `MEDIUM` · `HIGH`
