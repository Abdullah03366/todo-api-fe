<!-- ─────────────────────────────────────────────
  components/todos/TodoCard.vue
  Single todo row:
    • view mode  – badge, due-date, edit / delete
    • edit mode  – title, description, due-date,
                   priority select, save / cancel
───────────────────────────────────────────── -->
<template>
  <div class="todo-card" :class="{ editing: todo._editing, completed: todo.completed }">

    <!-- ── View mode ── -->
    <template v-if="!todo._editing">
      <div class="todo-row">
        <label class="check-wrap">
          <input
            type="checkbox"
            class="todo-check"
            :checked="todo.completed"
            @change="$emit('toggle-complete', todo)"
            :aria-label="locale === 'en' ? `Mark todo ${todo.title} as completed` : `Markeer todo ${todo.title} als voltooid`"
          />
          <span class="check-ui" aria-hidden="true"></span>
        </label>

        <div class="todo-body">
          <div class="todo-title" :class="{ 'is-done': todo.completed }">{{ todo.title }}</div>
          <div class="todo-desc" :class="{ 'is-done': todo.completed }" v-if="todo.description">{{ todo.description }}</div>
          <div class="todo-meta">
            <span class="badge" :class="'badge-' + todo.priority">{{ todo.priority }}</span>
            <span class="due-chip" v-if="todo.dueAt">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <rect x="1" y="2" width="9" height="8" rx="1.5"
                      stroke="currentColor" stroke-width="1.2"/>
                <path d="M3.5 1v2M7.5 1v2M1 5h9"
                      stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
              {{ formatDate(todo.dueAt) }}
            </span>
            <span class="due-days" :class="getDueDaysClass(todo.dueAt)" v-if="todo.dueAt">{{ getDueDaysLabel(todo.dueAt) }}</span>
          </div>

          <div class="due-warning" v-if="todo.dueAt && isOverdue(todo.dueAt)">
            {{ locale === 'en' ? 'Past due.' : 'Vervaldatum is voorbij.' }}
          </div>
        </div>

        <div class="todo-actions">
          <button class="icon-btn" @click="$emit('edit', todo)" :title="locale === 'en' ? 'Edit' : 'Bewerken'" :aria-label="locale === 'en' ? `Edit todo ${todo.title}` : `Bewerk todo ${todo.title}`">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M9 1.5l2.5 2.5-7 7H2v-2.5l7-7z"
                    stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="icon-btn danger" @click="$emit('delete', todo)" :title="locale === 'en' ? 'Delete' : 'Verwijderen'" :aria-label="locale === 'en' ? `Delete todo ${todo.title}` : `Verwijder todo ${todo.title}`">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 3h8M5 3V2h2v1M4.5 3v6M7.5 3v6M3 3l.5 7h5l.5-7"
                    stroke="currentColor" stroke-width="1.4"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </template>

    <!-- ── Edit mode ── -->
    <template v-else>
      <div class="edit-grid">
        <div class="field-col span2">
          <label class="form-label">{{ locale === 'en' ? 'Title' : 'Titel' }}</label>
          <input class="form-input" v-model="todo._draft.title" maxlength="100" :aria-label="locale === 'en' ? 'Edit todo title' : 'Bewerk todo titel'" :aria-describedby="`todo-title-counter-${todo.id}`" />
          <div :id="`todo-title-counter-${todo.id}`" class="char-counter" aria-live="polite">{{ todo._draft.title.length }}/100</div>
        </div>
        <div class="field-col span2">
          <label class="form-label">{{ locale === 'en' ? 'Description' : 'Beschrijving' }}</label>
          <textarea class="form-input" v-model="todo._draft.description"
                    maxlength="250" rows="2" :aria-label="locale === 'en' ? 'Edit todo description' : 'Bewerk todo beschrijving'" :aria-describedby="`todo-description-counter-${todo.id}`"></textarea>
          <div :id="`todo-description-counter-${todo.id}`" class="char-counter" aria-live="polite">{{ todo._draft.description.length }}/250</div>
        </div>
        <div class="field-col">
          <label class="form-label">{{ locale === 'en' ? 'Due Date' : 'Einddatum' }}</label>
          <input
            type="date"
            class="form-input date-input"
            v-model="todo._draft.dueAt"
            lang="nl-NL"
            @click="$event.target.showPicker?.()"
            :aria-label="locale === 'en' ? 'Edit due date' : 'Bewerk einddatum'"
          />
        </div>
        <div class="field-col">
          <label class="form-label">{{ locale === 'en' ? 'Priority' : 'Prioriteit' }}</label>
          <select class="select-input" v-model="todo._draft.priority" :aria-label="locale === 'en' ? 'Edit priority' : 'Bewerk prioriteit'">
            <option value="LOW">{{ locale === 'en' ? 'Low' : 'Laag' }}</option>
            <option value="MEDIUM">{{ locale === 'en' ? 'Medium' : 'Middel' }}</option>
            <option value="HIGH">{{ locale === 'en' ? 'High' : 'Hoog' }}</option>
          </select>
        </div>
      </div>

      <div class="edit-actions">
        <button class="btn-ghost" @click="$emit('cancel-edit', todo)" :aria-label="locale === 'en' ? 'Cancel editing todo' : 'Annuleer bewerken van todo'">{{ locale === 'en' ? 'Cancel' : 'Annuleren' }}</button>
        <button
          class="btn-save"
          @click="$emit('save-edit', todo)"
          :disabled="!todo._draft.title.trim() || todo._saving"
          :aria-label="locale === 'en' ? 'Save todo changes' : 'Sla todo wijzigingen op'"
        >
          <span v-if="todo._saving"><span class="spinner"></span></span>
          <span v-else>{{ locale === 'en' ? 'Save' : 'Opslaan' }}</span>
        </button>
      </div>
    </template>

  </div>
</template>

<script>
export default {
  name: 'TodoCard',
  props: {
    todo: { type: Object, required: true },
    locale: { type: String, default: 'en' },
  },
  emits: ['edit', 'delete', 'cancel-edit', 'save-edit', 'toggle-complete'],
  setup(props) {
    const DAY_MS = 24 * 60 * 60 * 1000;

    function toDayStart(value) {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return null;
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function getDayDiff(value) {
      const due = toDayStart(value);
      if (!due) return null;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return Math.round((due.getTime() - today.getTime()) / DAY_MS);
    }

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

    function isOverdue(d) {
      const diff = getDayDiff(d);
      return diff !== null && diff < 0;
    }

    function getDueDaysLabel(d) {
      const diff = getDayDiff(d);
      if (diff === null) return '';
      if (diff === 0) return props.locale === 'en' ? 'Due today' : 'Vervalt vandaag';
      if (diff > 0) {
        return props.locale === 'en'
          ? `${diff} day${diff === 1 ? '' : 's'} left`
          : `Nog ${diff} dag${diff === 1 ? '' : 'en'}`;
      }
      const late = Math.abs(diff);
      return props.locale === 'en'
        ? `${late} day${late === 1 ? '' : 's'} overdue`
        : `${late} dag${late === 1 ? '' : 'en'} te laat`;
    }

    function getDueDaysClass(d) {
      const diff = getDayDiff(d);
      if (diff === null) return '';
      if (diff < 0) return 'is-overdue';
      if (diff <= 2) return 'is-soon';
      return 'is-safe';
    }

    return { formatDate, isOverdue, getDueDaysLabel, getDueDaysClass };
  },
};
</script>

<style scoped src="../../styles/components/todos/todo-card.css"></style>
