<!-- ─────────────────────────────────────────────
  views/TodosView.vue
  Presenter for the "Todos" page of a list.
  Delegates all logic to useTodos composable.
───────────────────────────────────────────── -->
<template>
  <main id="main-content" class="main-content" tabindex="-1">
    <!-- back button -->
    <button class="back-btn" @click="$emit('back')" :aria-label="locale === 'en' ? 'Back to all lists' : 'Terug naar alle lijsten'">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M9 2L4 7l5 5" stroke="currentColor"
              stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      {{ locale === 'en' ? 'All Lists' : 'Alle lijsten' }}
    </button>

    <!-- header -->
    <div class="page-header">
      <div>
        <div class="page-title">{{ activeList.title }}</div>
        <div class="page-sub" v-if="activeList.description">{{ activeList.description }}</div>
      </div>
      <button class="btn-add" @click="todos.openCreateForm()" v-if="!todos.showCreateTodo.value" :aria-label="locale === 'en' ? 'Create a new todo' : 'Maak een nieuwe todo'">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        {{ locale === 'en' ? 'Add Todo' : 'Todo toevoegen' }}
      </button>
    </div>

    <div class="progress-wrap" v-if="todos.totalTodos.value > 0">
      <div class="progress-head">
        <span>{{ todos.completedTodos.value }} / {{ todos.totalTodos.value }} {{ locale === 'en' ? 'completed' : 'voltooid' }}</span>
        <span>{{ todos.completionPercent.value }}%</span>
      </div>
      <div class="progress-track" :class="{ complete: todos.completionPercent.value === 100 }" role="progressbar" :aria-label="locale === 'en' ? 'Progress of completed todos' : 'Voortgang afgeronde todos'" :aria-valuenow="todos.completionPercent.value" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-fill" :style="{ width: `${todos.completionPercent.value}%` }"></div>
      </div>
    </div>

    <!-- sort bar -->
    <div class="sort-bar" v-if="todos.todos.value.length > 0">
      <span class="sort-label">{{ locale === 'en' ? 'Sort:' : 'Sorteer:' }}</span>
      <button
        class="sort-btn"
        :class="{ active: todos.sortBy.value === 'priority' }"
        @click="todos.togglePrioritySort()"
        :aria-label="locale === 'en' ? 'Sort by priority' : 'Sorteer op prioriteit'"
      >
        {{
          locale === 'en'
            ? (todos.sortBy.value !== 'priority' ? 'Priority' : (todos.sortDirection.value === 'asc' ? 'Priority ↑' : 'Priority ↓'))
            : (todos.sortBy.value !== 'priority' ? 'Prioriteit' : (todos.sortDirection.value === 'asc' ? 'Prioriteit ↑' : 'Prioriteit ↓'))
        }}
      </button>
      <button
        class="sort-btn"
        :class="{ active: todos.sortBy.value === 'due_date' }"
        @click="todos.toggleDueDateSort()"
        :aria-label="locale === 'en' ? 'Sort by due date' : 'Sorteer op einddatum'"
      >
        {{
          locale === 'en'
            ? (todos.sortBy.value !== 'due_date' ? 'Due Date' : (todos.sortDirection.value === 'asc' ? 'Due Date ↑' : 'Due Date ↓'))
            : (todos.sortBy.value !== 'due_date' ? 'Einddatum' : (todos.sortDirection.value === 'asc' ? 'Einddatum ↑' : 'Einddatum ↓'))
        }}
      </button>
    </div>

    <!-- create form -->
    <TodoCreateForm
      v-if="todos.showCreateTodo.value"
      :saving="todos.savingTodo.value"
      :locale="locale"
      @save="(data) => todos.saveNew(activeList.id, data)"
      @cancel="todos.cancelCreate()"
    />

    <!-- empty state -->
    <div v-if="todos.todos.value.length === 0 && !todos.showCreateTodo.value" class="empty-state">
      <div class="empty-icon">✅</div>
      <p>{{ locale === 'en' ? 'No todos yet — add your first one!' : 'Nog geen todos — voeg je eerste todo toe!' }}</p>
    </div>

    <!-- todo cards -->
    <TodoCard
      v-for="todo in todos.sortedTodos.value"
      :key="todo.id"
      :todo="todo"
      :locale="locale"
      @toggle-complete="todos.toggleCompleted(todo)"
      @edit="todos.startEdit(todo)"
      @delete="todos.removeTodo(todo, activeList.id)"
      @cancel-edit="todos.cancelEdit(todo)"
      @save-edit="todos.saveEdit(todo, activeList.id)"
    />
  </main>
</template>

<script>
import TodoCard       from '../components/todos/TodoCard.vue';
import TodoCreateForm from '../components/todos/TodoCreateForm.vue';

export default {
  name: 'TodosView',
  components: { TodoCard, TodoCreateForm },
  props: {
    activeList: { type: Object, required: true },
    todos:      { type: Object, required: true },  // useTodos() return value
    locale:     { type: String, default: 'en' },
  },
  emits: ['back'],
};
</script>

<style scoped>
.main-content {
  flex: 1;
  padding: 40px 32px;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  animation: fadeIn 0.3s ease both;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--muted);
  font-family: var(--font-body);
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0;
  margin-bottom: 24px;
  transition: color var(--trans);
}
.back-btn:hover { color: var(--text); }

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
}
.page-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.03em;
}
.page-sub {
  color: var(--muted);
  font-size: 0.875rem;
  margin-top: 4px;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: var(--accent-lo);
  border: 1px solid rgba(124, 106, 255, 0.3);
  border-radius: var(--radius-sm);
  color: var(--accent-hi);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--trans);
}
.btn-add:hover {
  background: rgba(124, 106, 255, 0.2);
  border-color: var(--accent);
}

/* sort bar */
.sort-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}
.sort-label { font-size: 0.8125rem; color: var(--muted); }
.sort-btn {
  padding: 5px 12px;
  border-radius: 100px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--muted);
  font-family: var(--font-body);
  font-size: 0.8rem;
  cursor: pointer;
  transition: var(--trans);
}
.sort-btn.active {
  border-color: var(--accent);
  color: var(--accent-hi);
  background: var(--accent-lo);
}
.sort-btn:hover:not(.active) { border-color: var(--border-hi); color: var(--text); }

.progress-wrap {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  margin-bottom: 16px;
}

.progress-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8125rem;
  color: var(--muted);
  margin-bottom: 8px;
}

.progress-track {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: #d8e8f7;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #4db6e2 0%, var(--accent) 100%);
  transition: width 0.25s ease;
}

.progress-track.complete {
  background: #dff7ea;
}

.progress-track.complete .progress-fill {
  background: linear-gradient(90deg, #32b66f 0%, #1f9a58 100%);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--muted);
}
.empty-icon { font-size: 2.5rem; margin-bottom: 12px; opacity: 0.4; }
.empty-state p { font-size: 0.875rem; }

@media (max-width: 600px) {
  .main-content { padding: 24px 16px; }
  .page-header  { flex-direction: column; align-items: flex-start; gap: 12px; }

  .back-btn {
    margin-bottom: 14px;
  }

  .progress-wrap {
    padding: 10px 12px;
  }

  .progress-head {
    font-size: 0.76rem;
  }

  .sort-bar {
    flex-wrap: wrap;
    gap: 8px;
  }

  .sort-btn {
    font-size: 0.76rem;
    padding: 5px 10px;
  }
}
</style>
