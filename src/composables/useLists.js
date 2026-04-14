// ─────────────────────────────────────────────
//  useLists composable
//  Manages todo-list CRUD and editing state
// ─────────────────────────────────────────────
import { ref, reactive } from 'vue';
import { listsApi } from '../api/index.js';

// ── helpers ──────────────────────────────────
function decorateList(raw) {
  return {
    ...raw,
    todos: Array.isArray(raw?.todos) ? raw.todos : [],
    _editing: false,
    _draft: null,
    _saving: false,
  };
}

export function useLists(currentUser, showToast) {
  const todoLists      = ref([]);
  const showCreateList = ref(false);
  const savingList     = ref(false);
  const newList        = reactive({ title: '', description: '' });

  // ── Fetch ───────────────────────────────────
  async function loadLists() {
    if (!currentUser.value) {
      todoLists.value = [];
      return;
    }
    const data = await listsApi.getAll();
    const baseLists = data || [];
    const hydrated = await Promise.all(
      baseLists.map(async (list) => {
        try {
          return await listsApi.getById(list.id);
        } catch {
          return list;
        }
      }),
    );
    todoLists.value = hydrated.map(decorateList).reverse();
  }

  // ── Create ──────────────────────────────────
  function openCreateForm() { showCreateList.value = true; }

  function cancelCreate() {
    showCreateList.value = false;
    newList.title        = '';
    newList.description  = '';
  }

  async function saveNew(formData) {
    const payload = {
      title: formData?.title ?? newList.title,
      description: formData?.description ?? newList.description,
    };
    if (!payload.title?.trim()) return;

    savingList.value = true;
    try {
      const saved = await listsApi.create({
        title:       payload.title,
        description: payload.description,
      });
      todoLists.value.unshift(decorateList(saved));
      cancelCreate();
      showToast('List created!');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      savingList.value = false;
    }
  }

  // ── Edit ────────────────────────────────────
  function startEdit(list) {
    list._draft   = { title: list.title, description: list.description };
    list._editing = true;
  }

  function cancelEdit(list) {
    list._editing = false;
    list._draft   = null;
  }

  async function saveEdit(list) {
    if (!list._draft.title.trim()) return;
    list._saving = true;
    try {
      const updated = await listsApi.update(list.id, {
        title:       list._draft.title,
        description: list._draft.description,
      });
      list.title       = updated.title;
      list.description = updated.description;
      list._editing    = false;
      list._draft      = null;
      showToast('List updated!');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      list._saving = false;
    }
  }

  // ── Delete ──────────────────────────────────
  async function removeList(list) {
    if (!confirm(`Delete "${list.title}"? All todos inside will be lost.`)) return;
    try {
      await listsApi.remove(list.id);
      todoLists.value = todoLists.value.filter((l) => l.id !== list.id);
      showToast('List deleted.');
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  return {
    todoLists,
    showCreateList,
    savingList,
    newList,
    loadLists,
    openCreateForm,
    cancelCreate,
    saveNew,
    startEdit,
    cancelEdit,
    saveEdit,
    removeList,
  };
}
