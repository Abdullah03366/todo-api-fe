<!-- ─────────────────────────────────────────────
  components/lists/ListCreateForm.vue
  Inline create-card for a new todo list
───────────────────────────────────────────── -->
<template>
  <div class="create-card">
    <div class="field-row">
      <div class="field-col">
        <label class="form-label">{{ locale === 'en' ? 'Title' : 'Titel' }}</label>
        <input
          class="form-input"
          v-model="draft.title"
          :placeholder="locale === 'en' ? 'List title…' : 'Lijsttitel…'"
          maxlength="100"
          ref="titleInput"
          :aria-label="locale === 'en' ? 'List title' : 'Lijst titel'"
          aria-describedby="list-create-title-counter"
        />
        <div id="list-create-title-counter" class="char-counter" aria-live="polite">{{ draft.title.length }}/100</div>
      </div>
      <div class="field-col">
        <label class="form-label">{{ locale === 'en' ? 'Description' : 'Beschrijving' }}</label>
        <textarea
          class="form-input"
          v-model="draft.description"
          :placeholder="locale === 'en' ? 'Optional description…' : 'Optionele beschrijving…'"
          maxlength="250"
          rows="2"
          :aria-label="locale === 'en' ? 'List description' : 'Lijst beschrijving'"
          aria-describedby="list-create-description-counter"
        ></textarea>
        <div id="list-create-description-counter" class="char-counter" aria-live="polite">{{ draft.description.length }}/250</div>
      </div>
    </div>

    <div class="create-actions">
      <button class="btn-ghost" @click="$emit('cancel')" :aria-label="locale === 'en' ? 'Cancel creating list' : 'Annuleer lijst aanmaken'">{{ locale === 'en' ? 'Cancel' : 'Annuleren' }}</button>
      <button
        class="btn-save"
        @click="$emit('save', { title: draft.title, description: draft.description })"
        :disabled="!draft.title.trim() || saving"
        :aria-label="locale === 'en' ? 'Save list' : 'Sla lijst op'"
      >
        <span v-if="saving"><span class="spinner"></span></span>
        <span v-else>{{ locale === 'en' ? 'Save List' : 'Lijst opslaan' }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { reactive, onMounted, ref } from 'vue';

export default {
  name: 'ListCreateForm',
  props: {
    saving: { type: Boolean, default: false },
    locale: { type: String, default: 'en' },
  },
  emits: ['save', 'cancel'],
  setup() {
    const draft      = reactive({ title: '', description: '' });
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

.field-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.field-col {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 160px;
}

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
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

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
</style>
