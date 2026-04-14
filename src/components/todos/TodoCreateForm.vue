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

<style scoped src="../../styles/components/todos/todo-create-form.css"></style>
