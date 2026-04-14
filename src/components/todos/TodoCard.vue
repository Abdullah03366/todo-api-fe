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

<style scoped>
.todo-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 20px;
  margin-bottom: 10px;
  transition: border-color var(--trans);
  animation: fadeIn 0.2s ease both;
}
.todo-card:hover   { border-color: var(--border-hi); }
.todo-card.editing { border-color: var(--accent); }

/* view */
.todo-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.check-wrap {
  display: inline-flex;
  align-items: center;
  margin-top: 3px;
  position: relative;
}

.todo-check {
  position: absolute;
  opacity: 0;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.check-ui {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1px solid var(--border-hi);
  background: var(--surface);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: var(--trans);
}

.todo-check:checked + .check-ui {
  background: var(--accent);
  border-color: var(--accent);
}

.todo-check:checked + .check-ui::after {
  content: '';
  width: 10px;
  height: 6px;
  border-left: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: rotate(-45deg) translateY(-1px);
}

.todo-check:focus-visible + .check-ui {
  outline: 3px solid rgba(0, 112, 173, 0.35);
  outline-offset: 2px;
}

.todo-body  { flex: 1; min-width: 0; }
.todo-title {
  font-weight: 500;
  font-size: 0.9375rem;
  margin-bottom: 4px;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.todo-desc  {
  font-size: 0.825rem;
  color: var(--muted);
  line-height: 1.5;
  margin-bottom: 8px;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.todo-title.is-done,
.todo-desc.is-done {
  text-decoration: line-through;
  color: var(--muted);
  opacity: 0.85;
}

.todo-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 0.7125rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.badge-LOW    { background: rgba(62,207,142,.12); color: var(--low);  border: 1px solid rgba(62,207,142,.25); }
.badge-MEDIUM { background: rgba(245,158,11,.12); color: var(--med);  border: 1px solid rgba(245,158,11,.25); }
.badge-HIGH   { background: rgba(239,68,68,.12);  color: var(--high); border: 1px solid rgba(239,68,68,.25); }

.due-chip {
  font-size: 0.775rem;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

.due-days {
  font-size: 0.74rem;
  color: var(--accent-hi);
}

.due-days.is-safe {
  color: #2a8a5a;
}

.due-days.is-soon {
  color: #b97808;
}

.due-days.is-overdue {
  color: var(--high);
}

.due-warning {
  margin-top: 8px;
  font-size: 0.75rem;
  color: var(--high);
  font-weight: 600;
}

.todo-actions {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
}

/* icon buttons */
.icon-btn {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: var(--trans);
}
.icon-btn:hover        { border-color: var(--border-hi); color: var(--text); }
.icon-btn.danger:hover { border-color: rgba(239,68,68,.5); color: var(--high); }

/* edit */
.edit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}
.field-col       { display: flex; flex-direction: column; }
.span2           { grid-column: 1 / -1; }

.form-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}
.form-input {
  padding: 9px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 0.875rem;
  outline: none;
  transition: border-color var(--trans), box-shadow var(--trans);
  resize: vertical;
}
.form-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(124,106,255,.15);
}
.date-input { resize: none; }

.select-input {
  padding: 9px 30px 9px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 0.875rem;
  outline: none;
  cursor: pointer;
  transition: border-color var(--trans);
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%238888a0' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}
.select-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(124,106,255,.15);
}
.select-input option { background: var(--card); }

.edit-actions {
  display: flex; gap: 8px; justify-content: flex-end;
}

.btn-ghost {
  padding: 7px 14px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--muted);
  font-family: var(--font-body);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: var(--trans);
}
.btn-ghost:hover { border-color: var(--border-hi); color: var(--text); }

.btn-save {
  padding: 9px 20px;
  background: var(--accent);
  border: none;
  border-radius: var(--radius-sm);
  color: #fff;
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--trans);
}
.btn-save:hover:not(:disabled) { background: var(--accent-hi); }
.btn-save:disabled              { opacity: 0.5; cursor: not-allowed; }

.char-counter {
  margin-top: 6px;
  text-align: right;
  color: var(--muted);
  font-size: 0.74rem;
}

.spinner {
  display: inline-block;
  width: 13px; height: 13px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  vertical-align: middle;
}

@media (max-width: 600px) {
  .todo-card {
    padding: 14px;
  }

  .todo-row {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: start;
    gap: 10px;
  }

  .todo-actions {
    grid-column: 2;
    justify-content: flex-end;
  }

  .todo-title {
    font-size: 0.9rem;
  }

  .todo-desc {
    font-size: 0.8rem;
  }

  .char-counter {
    font-size: 0.72rem;
  }

  .edit-grid { grid-template-columns: 1fr; }
  .span2     { grid-column: 1; }
}
</style>
