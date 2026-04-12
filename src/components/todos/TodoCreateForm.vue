<!-- ─────────────────────────────────────────────
  components/todos/TodoCreateForm.vue
  Inline create-card for a new todo item
───────────────────────────────────────────── -->
<template>
  <div class="create-card">
    <div class="edit-grid">
      <div class="field-col span2">
        <label class="form-label">{{ locale === 'en' ? 'Title' : 'Titel' }}</label>
        <input
          class="form-input"
          v-model="draft.title"
          :placeholder="locale === 'en' ? 'What needs to be done?' : 'Wat moet er gebeuren?'"
          maxlength="100"
          ref="titleInput"
          :aria-label="locale === 'en' ? 'Todo title' : 'Todo titel'"
          aria-describedby="todo-create-title-counter"
        />
        <div id="todo-create-title-counter" class="char-counter" aria-live="polite">{{ draft.title.length }}/100</div>
      </div>
      <div class="field-col span2">
        <label class="form-label">{{ locale === 'en' ? 'Description' : 'Beschrijving' }}</label>
        <textarea
          class="form-input"
          v-model="draft.description"
          :placeholder="locale === 'en' ? 'Details…' : 'Details…'"
          maxlength="250"
          rows="2"
          :aria-label="locale === 'en' ? 'Todo description' : 'Todo beschrijving'"
          aria-describedby="todo-create-description-counter"
        ></textarea>
        <div id="todo-create-description-counter" class="char-counter" aria-live="polite">{{ draft.description.length }}/250</div>
      </div>
      <div class="field-col">
        <label class="form-label">{{ locale === 'en' ? 'Due Date' : 'Einddatum' }}</label>
        <input
          type="date"
          class="form-input date-input"
          v-model="draft.dueAt"
          lang="nl-NL"
          @click="$event.target.showPicker?.()"
          :aria-label="locale === 'en' ? 'Choose a due date' : 'Kies een einddatum'"
        />
      </div>
      <div class="field-col">
        <label class="form-label">{{ locale === 'en' ? 'Priority' : 'Prioriteit' }}</label>
        <select class="select-input" v-model="draft.priority" :aria-label="locale === 'en' ? 'Choose priority' : 'Kies prioriteit'">
          <option value="LOW">{{ locale === 'en' ? 'Low' : 'Laag' }}</option>
          <option value="MEDIUM">{{ locale === 'en' ? 'Medium' : 'Middel' }}</option>
          <option value="HIGH">{{ locale === 'en' ? 'High' : 'Hoog' }}</option>
        </select>
      </div>
    </div>

    <div class="create-actions">
      <button class="btn-ghost" @click="$emit('cancel')" :aria-label="locale === 'en' ? 'Cancel creating todo' : 'Annuleer todo aanmaken'">{{ locale === 'en' ? 'Cancel' : 'Annuleren' }}</button>
      <button
        class="btn-save"
        @click="$emit('save', { ...draft })"
        :disabled="!draft.title.trim() || saving"
        :aria-label="locale === 'en' ? 'Save todo' : 'Sla todo op'"
      >
        <span v-if="saving"><span class="spinner"></span></span>
        <span v-else>{{ locale === 'en' ? 'Save Todo' : 'Todo opslaan' }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { reactive, onMounted, ref } from 'vue';

export default {
  name: 'TodoCreateForm',
  props: {
    saving: { type: Boolean, default: false },
    locale: { type: String, default: 'en' },
  },
  emits: ['save', 'cancel'],
  setup() {
    const draft = reactive({
      title:       '',
      description: '',
      dueAt:       '',
      priority:    'MEDIUM',
    });
    const titleInput = ref(null);
    onMounted(() => titleInput.value?.focus());
    return { draft, titleInput };
  },
};
</script>

<style scoped>
.create-card {
  background: var(--surface);
  border: 1px dashed var(--accent);
  border-radius: var(--radius);
  padding: 20px 24px;
  margin-bottom: 16px;
  animation: slideDown 0.2s ease both;
}

.edit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}
.field-col { display: flex; flex-direction: column; }
.span2     { grid-column: 1 / -1; }

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
.form-input::placeholder { color: var(--muted); }
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

.create-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  justify-content: flex-end;
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

.spinner {
  display: inline-block;
  width: 13px; height: 13px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  vertical-align: middle;
}

.char-counter {
  margin-top: 6px;
  text-align: right;
  color: var(--muted);
  font-size: 0.74rem;
}

@media (max-width: 600px) {
  .edit-grid { grid-template-columns: 1fr; }
  .span2     { grid-column: 1; }
}
</style>
