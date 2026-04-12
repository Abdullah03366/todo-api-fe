// ─────────────────────────────────────────────
//  useTodos composable
//  Manages todo-item CRUD, editing state
//  and priority sorting
// ─────────────────────────────────────────────
import { ref, reactive, computed } from 'vue';
import { todosApi } from '../api/index.js';

const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };

function decorateTodo(raw) {
  return { ...raw, _editing: false, _draft: null, _saving: false };
}

export function useTodos(showToast) {
  const todos           = ref([]);
  const showCreateTodo  = ref(false);
  const savingTodo      = ref(false);
  const sortBy          = ref(null); // null | 'priority' | 'due_date'
  const sortDirection   = ref('asc'); // 'asc' | 'desc'

  const newTodo = reactive({
    title:       '',
    description: '',
    dueAt:       '',
    priority:    'MEDIUM',
  });

  // ── Sorted view ─────────────────────────────
  function parseDueDate(value) {
    if (!value) return null;
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;

    const m = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return null;
    return Date.parse(`${m[3]}-${m[2]}-${m[1]}`);
  }

  const sortedTodos = computed(() => {
    if (!sortBy.value) return todos.value;

    return [...todos.value].sort((a, b) => {
      if (sortBy.value === 'priority') {
        const aPriority = PRIORITY_ORDER[a.priority] ?? 99;
        const bPriority = PRIORITY_ORDER[b.priority] ?? 99;
        const diff = aPriority - bPriority;
        return sortDirection.value === 'asc' ? diff : -diff;
      }

      const aTs = parseDueDate(a.dueAt);
      const bTs = parseDueDate(b.dueAt);
      const aHas = aTs !== null;
      const bHas = bTs !== null;

      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      if (!aHas && !bHas) return 0;

      const diff = aTs - bTs;
      return sortDirection.value === 'asc' ? diff : -diff;
    });
  });

  const prioritySortLabel = computed(() => {
    if (sortBy.value !== 'priority') return 'Priority';
    return sortDirection.value === 'asc' ? 'Priority ↑' : 'Priority ↓';
  });

  const dueDateSortLabel = computed(() => {
    if (sortBy.value !== 'due_date') return 'Due Date';
    return sortDirection.value === 'asc' ? 'Due Date ↑' : 'Due Date ↓';
  });

  const totalTodos = computed(() => todos.value.length);
  const completedTodos = computed(() => todos.value.filter((todo) => todo.completed).length);
  const completionPercent = computed(() => {
    if (!totalTodos.value) return 0;
    return Math.round((completedTodos.value / totalTodos.value) * 100);
  });

  function togglePrioritySort() {
    if (sortBy.value !== 'priority') {
      sortBy.value = 'priority';
      sortDirection.value = 'asc';
      return;
    }
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  }

  function toggleDueDateSort() {
    if (sortBy.value !== 'due_date') {
      sortBy.value = 'due_date';
      sortDirection.value = 'asc';
      return;
    }
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  }

  // ── Fetch ───────────────────────────────────
  async function loadTodos(listId) {
    const data = await todosApi.getAll(listId);
    todos.value = (data || []).map(decorateTodo);
  }

  function reset() {
    todos.value          = [];
    showCreateTodo.value = false;
    sortBy.value         = null;
    sortDirection.value  = 'asc';
  }

  // ── Create ──────────────────────────────────
  function openCreateForm() { showCreateTodo.value = true; }

  function cancelCreate() {
    showCreateTodo.value = false;
    newTodo.title        = '';
    newTodo.description  = '';
    newTodo.dueAt        = '';
    newTodo.priority     = 'MEDIUM';
  }

  async function saveNew(listId, formData) {
    const payload = {
      title: formData?.title ?? newTodo.title,
      description: formData?.description ?? newTodo.description,
      dueAt: formData?.dueAt ?? newTodo.dueAt,
      priority: formData?.priority ?? newTodo.priority,
    };
    if (!payload.title?.trim()) return;

    savingTodo.value = true;
    try {
      const existingDueDates = new Map(todos.value.map((t) => [t.id, t.dueAt || '']));

      const saved = await todosApi.create(listId, {
        title:       payload.title,
        description: payload.description,
        priority:    payload.priority,
        dueAt:       payload.dueAt || null,
      });

      // Backend returns the updated TodoListDTO for this endpoint.
      if (Array.isArray(saved?.todos)) {
        const mapped = saved.todos.map((raw) => {
          const todo = decorateTodo(raw);
          todo.dueAt = existingDueDates.get(todo.id) || todo.dueAt || '';
          return todo;
        });

        const newlyCreated = mapped.find((t) => !existingDueDates.has(t.id));
        if (newlyCreated) newlyCreated.dueAt = payload.dueAt || newlyCreated.dueAt || '';

        todos.value = mapped;
      } else {
        // Fallback if backend starts returning a TodoDTO in the future.
        todos.value.push(decorateTodo({ ...saved, dueAt: payload.dueAt || saved.dueAt || '' }));
      }

      cancelCreate();
      showToast('Todo added!');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      savingTodo.value = false;
    }
  }

  // ── Edit ────────────────────────────────────
  function startEdit(todo) {
    todo._draft = {
      title:       todo.title,
      description: todo.description,
      dueAt:       todo.dueAt || '',
      priority:    todo.priority,
    };
    todo._editing = true;
  }

  function cancelEdit(todo) {
    todo._editing = false;
    todo._draft   = null;
  }

  async function saveEdit(todo, listId) {
    if (!todo._draft.title.trim()) return;
    const draft = { ...todo._draft };
    todo._saving = true;
    try {
      const updated = await todosApi.update(todo.id, {
        title:       draft.title,
        description: draft.description,
        priority:    draft.priority,
        completed:   !!todo.completed,
        dueAt:       draft.dueAt || null,
      });
      Object.assign(todo, {
        ...updated,
        dueAt: draft.dueAt || updated.dueAt || '',
        _editing: false,
        _draft: null,
        _saving: false,
      });
      showToast('Todo updated!');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      todo._saving = false;
    }
  }

  async function toggleCompleted(todo) {
    const nextCompleted = !todo.completed;
    const previous = todo.completed;
    todo.completed = nextCompleted;

    try {
      const updated = await todosApi.update(todo.id, {
        title:       todo.title,
        description: todo.description,
        priority:    todo.priority,
        completed:   nextCompleted,
        dueAt:       todo.dueAt || null,
      });

      Object.assign(todo, {
        ...updated,
        dueAt: updated.dueAt || todo.dueAt || '',
      });
    } catch (e) {
      todo.completed = previous;
      showToast(e.message, 'error');
    }
  }

  // ── Delete ──────────────────────────────────
  async function removeTodo(todo, listId) {
    if (!confirm(`Delete "${todo.title}"?`)) return;
    try {
      await todosApi.remove(todo.id);
      todos.value = todos.value.filter((t) => t.id !== todo.id);
      showToast('Todo deleted.');
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  // ── Utility ─────────────────────────────────
  function formatDate(d) {
    if (!d) return '';
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '';
    return dt.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  return {
    todos,
    showCreateTodo,
    savingTodo,
    sortBy,
    sortDirection,
    prioritySortLabel,
    dueDateSortLabel,
    totalTodos,
    completedTodos,
    completionPercent,
    newTodo,
    sortedTodos,
    togglePrioritySort,
    toggleDueDateSort,
    loadTodos,
    reset,
    openCreateForm,
    cancelCreate,
    saveNew,
    startEdit,
    cancelEdit,
    saveEdit,
    toggleCompleted,
    removeTodo,
    formatDate,
  };
}
