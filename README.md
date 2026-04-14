# Taskmaster - Abdullah Sanli - YP Java

Taskmaster is a Vue 3 + Vite single-page todo app with authentication, todo list management, and per-list todo tracking.

Link to the app: https://victorious-plant-0ee56c803.7.azurestaticapps.net/

## Features

- Login and register flow
- Create, edit, and delete todo lists
- Create, edit, complete, and delete todos
- Progress tracking per list
- Sorting by priority and due date
- Language toggle (English and Dutch)
- Theme toggle (Light and Dark)
- Keyboard and screen reader support for key interactive areas

## Tech stack

- Vue 3
- Vite 5
- Composition API + composables for state and data access

## Project structure

```text
src/
    api/           # API client
    composables/   # App logic/state hooks
    components/    # Reusable UI components
    views/         # Page-level views
    styles/        # Global styles and design tokens
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
