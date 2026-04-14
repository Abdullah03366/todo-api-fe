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
import { onBeforeUnmount, onMounted } from 'vue';
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
  setup(props) {
    function handleGlobalEscape(event) {
      if (event.key !== 'Escape') return;

      if (props.lists.showCreateList.value) {
        props.lists.cancelCreate();
        return;
      }

      const editingList = props.lists.todoLists.value.find((list) => list._editing);
      if (editingList) {
        props.lists.cancelEdit(editingList);
      }
    }

    onMounted(() => window.addEventListener('keydown', handleGlobalEscape));
    onBeforeUnmount(() => window.removeEventListener('keydown', handleGlobalEscape));
  },
};
</script>

<style scoped src="../styles/views/lists-view.css"></style>
