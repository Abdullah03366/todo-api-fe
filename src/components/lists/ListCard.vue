<!-- ─────────────────────────────────────────────
  components/lists/ListCard.vue
  Single todo-list row:
    • view mode  – click body to open, edit / delete buttons
    • edit mode  – inline title + description fields, save / cancel
───────────────────────────────────────────── -->
<template>
  <div class="list-card" :class="{ editing: list._editing, complete: totalTodos > 0 && progressPercent === 100 }">

    <!-- ── View mode ── -->
    <template v-if="!list._editing">
      <div class="list-card-top">
        <button class="list-card-body" @click="$emit('open', list)" :aria-label="locale === 'en' ? `Open list ${list.title}` : `Open lijst ${list.title}`">
          <div class="list-card-title">{{ list.title }}</div>
          <div class="list-card-desc" v-if="list.description">{{ list.description }}</div>
          <div class="list-progress" v-if="totalTodos > 0">
            <div class="list-progress-head">
              <span>{{ completedTodos }} / {{ totalTodos }} {{ locale === 'en' ? 'completed' : 'voltooid' }}</span>
              <span>{{ progressPercent }}%</span>
            </div>
            <div class="list-progress-track" :class="{ complete: progressPercent === 100 }">
              <div class="list-progress-fill" :style="{ width: `${progressPercent}%` }"></div>
            </div>
          </div>
          <div class="list-progress-empty" v-else>
            {{ locale === 'en' ? 'No todos yet' : 'Nog geen todos' }}
          </div>
        </button>

        <div class="list-card-actions">
          <button class="icon-btn" @click="$emit('edit', list)" :title="locale === 'en' ? 'Edit' : 'Bewerken'" :aria-label="locale === 'en' ? `Edit list ${list.title}` : `Bewerk lijst ${list.title}`">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M9 1.5l2.5 2.5-7 7H2v-2.5l7-7z"
                    stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="icon-btn danger" @click="$emit('delete', list)" :title="locale === 'en' ? 'Delete' : 'Verwijderen'" :aria-label="locale === 'en' ? `Delete list ${list.title}` : `Verwijder lijst ${list.title}`">
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
      <div class="edit-row">
        <div class="field-col">
          <label class="form-label">{{ locale === 'en' ? 'Title' : 'Titel' }}</label>
          <input class="form-input" v-model="list._draft.title" maxlength="100" :aria-label="locale === 'en' ? 'Edit list title' : 'Bewerk lijst titel'" :aria-describedby="`list-title-counter-${list.id}`" />
          <div :id="`list-title-counter-${list.id}`" class="char-counter" aria-live="polite">{{ list._draft.title.length }}/100</div>
        </div>
        <div class="field-col">
          <label class="form-label">{{ locale === 'en' ? 'Description' : 'Beschrijving' }}</label>
          <textarea class="form-input" v-model="list._draft.description"
                    maxlength="250" rows="2" :aria-label="locale === 'en' ? 'Edit list description' : 'Bewerk lijst beschrijving'" :aria-describedby="`list-description-counter-${list.id}`"></textarea>
          <div :id="`list-description-counter-${list.id}`" class="char-counter" aria-live="polite">{{ list._draft.description.length }}/250</div>
        </div>
      </div>

      <div class="edit-actions">
        <button class="btn-ghost" @click="$emit('cancel-edit', list)" :aria-label="locale === 'en' ? 'Cancel editing list' : 'Annuleer bewerken van lijst'">{{ locale === 'en' ? 'Cancel' : 'Annuleren' }}</button>
        <button
          class="btn-save"
          @click="$emit('save-edit', list)"
          :disabled="!list._draft.title.trim() || list._saving"
          :aria-label="locale === 'en' ? 'Save list changes' : 'Sla lijst wijzigingen op'"
        >
          <span v-if="list._saving"><span class="spinner"></span></span>
          <span v-else>{{ locale === 'en' ? 'Save' : 'Opslaan' }}</span>
        </button>
      </div>
    </template>

  </div>
</template>

<script>
export default {
  name: 'ListCard',
  props: {
    list: { type: Object, required: true },
    locale: { type: String, default: 'en' },
  },
  emits: ['open', 'edit', 'delete', 'cancel-edit', 'save-edit'],
  computed: {
    totalTodos() {
      return Array.isArray(this.list?.todos) ? this.list.todos.length : 0;
    },
    completedTodos() {
      if (!Array.isArray(this.list?.todos)) return 0;
      return this.list.todos.filter((todo) => todo.completed).length;
    },
    progressPercent() {
      if (!this.totalTodos) return 0;
      return Math.round((this.completedTodos / this.totalTodos) * 100);
    },
  },
};
</script>

<style scoped>
.list-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px 20px;
  transition: border-color var(--trans), box-shadow var(--trans);
  animation: fadeIn 0.25s ease both;
}
.list-card:hover   { border-color: var(--border-hi); }
.list-card.editing { border-color: var(--accent); }
.list-card.complete {
  border-color: rgba(62, 207, 142, 0.7);
  background: color-mix(in srgb, var(--card) 78%, #d9ffeb 22%);
}

.list-card.complete .list-card-title {
  color: #1f7d52;
}

.list-card.complete .list-card-desc,
.list-card.complete .list-progress-head {
  color: #2f7f5a;
}

/* view mode */
.list-card-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.list-card-body {
  flex: 1;
  cursor: pointer;
  background: transparent;
  border: none;
  text-align: left;
  color: inherit;
  padding: 0;
}
.list-card-title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
}
.list-card-desc {
  font-size: 0.8375rem;
  color: var(--muted);
  line-height: 1.5;
}

.list-progress {
  margin-top: 10px;
}

.list-progress-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--muted);
  margin-bottom: 6px;
}

.list-progress-track {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--border) 70%, #fff 30%);
  overflow: hidden;
}

.list-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #4db6e2 0%, var(--accent) 100%);
  transition: width 0.2s ease;
}

.list-progress-track.complete {
  background: #dff7ea;
}

.list-progress-track.complete .list-progress-fill {
  background: linear-gradient(90deg, #32b66f 0%, #1f9a58 100%);
}

.list-progress-empty {
  margin-top: 10px;
  font-size: 0.75rem;
  color: var(--muted);
}
.list-card-actions {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
}

/* icon buttons */
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: var(--trans);
}
.icon-btn:hover        { border-color: var(--border-hi); color: var(--text); }
.icon-btn.danger:hover { border-color: rgba(239,68,68,.5); color: var(--high); }

/* edit mode */
.edit-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-start;
}
.field-col { display: flex; flex-direction: column; flex: 1; min-width: 140px; }

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

.edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 12px;
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
  .list-card {
    padding: 14px;
  }

  .list-card-top {
    flex-direction: column;
    gap: 10px;
  }

  .list-card-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .list-progress-head {
    font-size: 0.72rem;
  }

  .char-counter {
    font-size: 0.72rem;
  }
}
</style>
