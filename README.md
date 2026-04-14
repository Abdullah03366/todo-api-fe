# Taskmaster - Abdullah Sanli - YP Java

Taskmaster is a Vue 3 + Vite single-page todo app with authentication, todo list management, and per-list todo tracking.

Link to the app: https://victorious-plant-0ee56c803.7.azurestaticapps.net/

## Features

- Authentication with login and register flows
- Inline loading/error feedback during authentication
- Create, edit, and delete todo lists
- Open a list to load and manage its todos in the workspace panel
- List cards show progress (completed vs total todos)
- Create, edit, complete/uncomplete, and delete todos
- Todo metadata support: description, priority, and due date
- Priority filtering (`ALL`, `HIGH`, `MEDIUM`, `LOW`)
- Sorting for todos by status, priority, and due date (ascending/descending toggle)
- Progress bar and completion percentage for the active list
- Due-date indicators per todo (due today, days left, overdue warning)
- Global toast notifications for success/error actions
- UI preferences stored in session storage with TTL (theme/language and todo sort/filter state)
- Locale toggle between English and Dutch
- Light/dark theme toggle
- Mobile pane switch (Lists/Todos) with keyboard navigation
- Keyboard-first flows, including `Esc` to close create/edit states
- Screen-reader support through ARIA labels, tab semantics, and live regions

## Tech stack

- Vue 3
- Vite 5
- Composition API + composables for state and data access

## Project structure

```text
.
|-- index.html
|-- package.json
|-- vite.config.js
`-- src/
    |-- App.vue
    |-- main.js
    |-- api/
    |   `-- index.js
    |-- composables/
    |   |-- useAuth.js
    |   |-- useLists.js
    |   |-- useToast.js
    |   `-- useTodos.js
    |-- components/
    |   |-- auth/
    |   |   `-- AuthForm.vue
    |   |-- lists/
    |   |   |-- ListCard.vue
    |   |   `-- ListCreateForm.vue
    |   |-- shared/
    |   |   |-- AppToast.vue
    |   |   `-- AppTopbar.vue
    |   `-- todos/
    |       |-- TodoCard.vue
    |       `-- TodoCreateForm.vue
    |-- styles/
    |   |-- base.css
    |   |-- components.css
    |   |-- variables.css
    |   |-- components/
    |   |   `-- todos/
    |   |       |-- todo-card.css
    |   |       `-- todo-create-form.css
    |   `-- views/
    |       |-- lists-view.css
    |       `-- todos-view.css
    `-- views/
        |-- ListsView.vue
        `-- TodosView.vue
```

## Environment configuration

The frontend reads the backend base URL from:

- `VITE_API_BASE_URL`

In production on Azure, set this value in app settings (already done in your setup).

If `VITE_API_BASE_URL` is empty, the app falls back to relative `/api` requests. This works with the Vite dev proxy.

### Local `.env` example

Create `.env.local` in the project root:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

Or leave it empty to use the local Vite proxy:

```bash
VITE_API_BASE_URL=
```

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Production build:

```bash
npm run build
```

4. Preview production build locally:

```bash
npm run preview
```

## Accessibility notes

- Skip link to main content is available.
- Mobile list/todo switch uses tab semantics with keyboard support.
- Auth mode switch uses tab semantics with proper ARIA relationships.
- Icon-only actions include descriptive `aria-label` text.
