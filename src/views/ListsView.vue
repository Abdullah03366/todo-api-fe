<!-- ─────────────────────────────────────────────
  views/ListsView.vue
  Presenter for the "My Lists" page.
  Delegates all logic to useLists composable;
  only handles layout and event forwarding.
───────────────────────────────────────────── -->
<template>
  <main id="lists-content" class="main-content" tabindex="-1">
    <!-- header -->
    <div class="page-header">
      <div>
        <div class="page-title">{{ locale === 'en' ? 'My Lists' : 'Mijn lijsten' }}</div>
        <div class="page-sub">{{ lists.todoLists.value.length }} {{ locale === 'en' ? `list${lists.todoLists.value.length !== 1 ? 's' : ''}` : `lijst${lists.todoLists.value.length !== 1 ? 'en' : ''}` }}</div>
      </div>
      <button class="btn-add" @click="lists.openCreateForm()" v-if="!lists.showCreateList.value" :aria-label="locale === 'en' ? 'Create a new list' : 'Maak een nieuwe lijst'">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        {{ locale === 'en' ? 'New List' : 'Nieuwe lijst' }}
      </button>
    </div>

    <!-- create form -->
    <ListCreateForm
      v-if="lists.showCreateList.value"
      :saving="lists.savingList.value"
      :locale="locale"
      @save="(data) => lists.saveNew(data)"
      @cancel="lists.cancelCreate()"
    />

    <p class="list-hint" v-if="lists.todoLists.value.length > 0">
      {{ locale === 'en' ? 'Select a list to view and edit its todos on the right.' : 'Selecteer een lijst om rechts de todos te bekijken en te bewerken.' }}
    </p>

    <!-- list of cards -->
    <div class="lists-grid">
      <div v-if="lists.todoLists.value.length === 0 && !lists.showCreateList.value" class="empty-state">
        <div class="empty-icon">📋</div>
        <p>{{ locale === 'en' ? 'No lists yet — create your first one!' : 'Nog geen lijsten — maak je eerste lijst aan!' }}</p>
      </div>

      <ListCard
        v-for="list in lists.todoLists.value"
        :key="list.id"
        :list="list"
        :active="activeListId === list.id"
        :locale="locale"
        @open="$emit('open-list', list)"
        @edit="lists.startEdit(list)"
        @delete="lists.removeList(list)"
        @cancel-edit="lists.cancelEdit(list)"
        @save-edit="lists.saveEdit(list)"
      />
    </div>
  </main>
</template>

<script>
import ListCard       from '../components/lists/ListCard.vue';
import ListCreateForm from '../components/lists/ListCreateForm.vue';

export default {
  name: 'ListsView',
  components: { ListCard, ListCreateForm },
  props: {
    lists: { type: Object, required: true },  // useLists() return value
    activeListId: { type: [String, Number], default: null },
    locale: { type: String, default: 'en' },
  },
  emits: ['open-list'],
};
</script>

<style scoped>
.main-content {
  padding: 24px 18px 120px;
  width: 100%;
  min-height: 0;
  max-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  animation: fadeIn 0.3s ease both;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 18px;
}

.page-title {
  font-family: var(--font-display);
  font-size: 1.45rem;
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

.lists-grid { display: grid; gap: 10px; }

.list-hint {
  margin: 0 0 14px;
  font-size: 0.8125rem;
  color: var(--muted);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--muted);
}
.empty-icon { font-size: 2.5rem; margin-bottom: 12px; opacity: 0.4; }
.empty-state p { font-size: 0.875rem; }

@media (max-width: 600px) {
  .main-content  { padding: 18px 12px 24px; }
  .page-header   { flex-direction: column; align-items: flex-start; gap: 12px; }
}
</style>
