<!-- ─────────────────────────────────────────────
  views/TodosView.vue
  Presenter for the "Todos" page of a list.
  Delegates all logic to useTodos composable.
───────────────────────────────────────────── -->
<template>
  <main id="main-content" class="main-content" tabindex="-1">
    <template v-if="activeList">
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

      <div v-if="todos.todos.value.length > 0" class="controls-panel" :aria-label="locale === 'en' ? 'Todo sorting and filtering options' : 'Todo sorteer en filter opties'">
        <div class="sort-bar" role="group" :aria-label="locale === 'en' ? 'Sort todos' : 'Sorteer todos'">
          <span class="sort-label">{{ locale === 'en' ? 'Sort:' : 'Sorteer:' }}</span>
          <button
            class="sort-btn"
            :class="{ active: todos.sortBy.value === 'status' }"
            @click="todos.toggleStatusSort()"
            :aria-pressed="todos.sortBy.value === 'status'"
            :aria-label="locale === 'en' ? 'Sort by status: open and completed' : 'Sorteer op status: open en voltooid'"
          >
            {{
              locale === 'en'
                ? (todos.sortBy.value !== 'status' ? 'Open/Completed' : (todos.sortDirection.value === 'asc' ? 'Open/Completed ↑' : 'Open/Completed ↓'))
                : (todos.sortBy.value !== 'status' ? 'Open/Voltooid' : (todos.sortDirection.value === 'asc' ? 'Open/Voltooid ↑' : 'Open/Voltooid ↓'))
            }}
          </button>
          <button
            class="sort-btn"
            :class="{ active: todos.sortBy.value === 'priority' }"
            @click="todos.togglePrioritySort()"
            :aria-pressed="todos.sortBy.value === 'priority'"
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
            :aria-pressed="todos.sortBy.value === 'due_date'"
            :aria-label="locale === 'en' ? 'Sort by due date' : 'Sorteer op einddatum'"
          >
            {{
              locale === 'en'
                ? (todos.sortBy.value !== 'due_date' ? 'Due Date' : (todos.sortDirection.value === 'asc' ? 'Due Date ↑' : 'Due Date ↓'))
                : (todos.sortBy.value !== 'due_date' ? 'Einddatum' : (todos.sortDirection.value === 'asc' ? 'Einddatum ↑' : 'Einddatum ↓'))
            }}
          </button>
        </div>

        <div class="filter-bar" role="group" :aria-label="locale === 'en' ? 'Filter by priority' : 'Filter op prioriteit'">
          <span class="filter-label">{{ locale === 'en' ? 'Filter priority:' : 'Filter prioriteit:' }}</span>
          <button
            v-for="option in priorityFilterOptions"
            :key="option.value"
            class="filter-btn"
            :class="{ active: todos.priorityFilter.value === option.value }"
            :aria-pressed="todos.priorityFilter.value === option.value"
            @click="todos.setPriorityFilter(option.value)"
          >
            {{ option.label }}
          </button>
          <span class="visible-count" aria-live="polite">{{ visibleCountLabel }}</span>
        </div>

        <p class="esc-hint">{{ locale === 'en' ? 'Tip: press Esc to close an open todo form.' : 'Tip: druk op Esc om een open todo-formulier te sluiten.' }}</p>
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

      <div v-else-if="todos.visibleTodos.value.length === 0 && !todos.showCreateTodo.value" class="empty-state">
        <div class="empty-icon">🔎</div>
        <p>{{ locale === 'en' ? 'No todos match the selected priority filter.' : 'Geen todos gevonden voor de geselecteerde prioriteitsfilter.' }}</p>
      </div>

      <!-- todo cards -->
      <TodoCard
        v-for="todo in todos.visibleTodos.value"
        :key="todo.id"
        :todo="todo"
        :locale="locale"
        @toggle-complete="todos.toggleCompleted(todo)"
        @edit="todos.startEdit(todo)"
        @delete="todos.removeTodo(todo, activeList.id)"
        @cancel-edit="todos.cancelEdit(todo)"
        @save-edit="todos.saveEdit(todo, activeList.id)"
      />
    </template>

    <section v-else class="empty-selection" :aria-label="locale === 'en' ? 'No list selected' : 'Geen lijst geselecteerd'">
      <template v-if="listCount === 0">
        <h2>{{ locale === 'en' ? 'Create a list first' : 'Maak eerst een lijst' }}</h2>
        <p>
          {{ locale === 'en' ? 'You need at least one todo list before you can add todos.' : 'Je hebt minimaal een to-do lijst nodig voordat je to-dos kunt toevoegen.' }}
        </p>
        <button class="btn-add disabled" disabled :aria-label="locale === 'en' ? 'Add todo disabled until a list exists' : 'Todo toevoegen uitgeschakeld tot er een lijst bestaat'">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          {{ locale === 'en' ? 'Add Todo' : 'Todo toevoegen' }}
        </button>
      </template>

      <template v-else>
        <h2>{{ locale === 'en' ? 'Choose a list to begin' : 'Kies een lijst om te starten' }}</h2>
        <p>
          {{ locale === 'en' ? 'Pick a list to view and manage todos here.' : 'Kies een lijst om hier todos te bekijken en te beheren.' }}
        </p>
      </template>
    </section>
  </main>
</template>

<script>
import { computed, onBeforeUnmount, onMounted } from 'vue';
import TodoCard       from '../components/todos/TodoCard.vue';
import TodoCreateForm from '../components/todos/TodoCreateForm.vue';

export default {
  name: 'TodosView',
  components: { TodoCard, TodoCreateForm },
  props: {
    activeList: { type: Object, default: null },
    todos:      { type: Object, required: true },  // useTodos() return value
    listCount:  { type: Number, default: 0 },
    locale:     { type: String, default: 'en' },
  },
  setup(props) {
    const priorityFilterOptions = computed(() => ([
      { value: 'ALL', label: props.locale === 'en' ? 'All' : 'Alles' },
      { value: 'HIGH', label: props.locale === 'en' ? 'High' : 'Hoog' },
      { value: 'MEDIUM', label: props.locale === 'en' ? 'Medium' : 'Middel' },
      { value: 'LOW', label: props.locale === 'en' ? 'Low' : 'Laag' },
    ]));

    const visibleCountLabel = computed(() => {
      const count = props.todos.visibleTodos.value.length;
      if (props.locale === 'en') return `${count} visible`;
      return `${count} zichtbaar`;
    });

    function handleGlobalEscape(event) {
      if (event.key !== 'Escape') return;

      if (props.todos.showCreateTodo.value) {
        props.todos.cancelCreate();
        return;
      }

      const editingTodo = props.todos.todos.value.find((todo) => todo._editing);
      if (editingTodo) {
        props.todos.cancelEdit(editingTodo);
      }
    }

    onMounted(() => window.addEventListener('keydown', handleGlobalEscape));
    onBeforeUnmount(() => window.removeEventListener('keydown', handleGlobalEscape));

    return {
      priorityFilterOptions,
      visibleCountLabel,
    };
  },
};
</script>

<style scoped src="../styles/views/todos-view.css"></style>
