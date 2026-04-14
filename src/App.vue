<!-- ─────────────────────────────────────────────
  App.vue  –  root component
  Wires together composables + views.
  Contains no business logic of its own.
───────────────────────────────────────────── -->
<template>
  <a class="skip-link" :href="currentView === 'auth' ? '#auth-main' : '#main-content'">
    {{ locale === 'en' ? 'Skip to main content' : 'Ga naar hoofdinhoud' }}
  </a>

  <!-- ── Auth ── -->
  <AuthForm
    v-if="currentView === 'auth'"
    v-model="authState"
    :locale="locale"
    :loading="auth.authLoading.value"
    :error="auth.authError.value"
    @submit="handleAuth"
  />

  <!-- ── App shell ── -->
  <div class="app-shell" v-else :data-mobile-pane="mobilePane">
    <AppTopbar
      :username="auth.currentUser.value?.username || ''"
      :locale="locale"
      @home="goToLists"
      @logout="handleLogout"
    />

    <div class="app-workspace">
      <div
        class="mobile-pane-switch"
        role="tablist"
        :aria-label="locale === 'en' ? 'Mobile view sections' : 'Mobiele weergave secties'"
      >
        <button
          class="mobile-pane-btn"
          role="tab"
          :aria-selected="mobilePane === 'lists'"
          :tabindex="mobilePane === 'lists' ? 0 : -1"
          :class="{ active: mobilePane === 'lists' }"
          @click="mobilePane = 'lists'"
          @keydown="handleMobilePaneKeydown"
        >
          {{ locale === 'en' ? 'Lists' : 'Lijsten' }}
        </button>
        <button
          class="mobile-pane-btn"
          role="tab"
          :aria-selected="mobilePane === 'todos'"
          :aria-disabled="!hasLists"
          :tabindex="mobilePane === 'todos' ? 0 : -1"
          :class="{ active: mobilePane === 'todos' }"
          :disabled="!hasLists"
          @click="mobilePane = 'todos'"
          @keydown="handleMobilePaneKeydown"
        >
          {{ locale === 'en' ? 'Todos' : 'Todos' }}
        </button>
      </div>

      <aside class="lists-panel" :aria-label="locale === 'en' ? 'Todo lists' : 'Todo lijsten'">
        <ListsView
          :lists="lists"
          :active-list-id="activeList?.id || null"
          :locale="locale"
          @open-list="openList"
        />
      </aside>

      <section class="todos-panel">
        <TodosView
          :active-list="activeList"
          :todos="todos"
          :list-count="lists.todoLists.value.length"
          :locale="locale"
        />
      </section>
    </div>
  </div>

  <div class="app-controls" role="group" :aria-label="locale === 'en' ? 'Application options' : 'Applicatie opties'">
    <button class="ctrl-btn" @click="toggleLocale">
      {{ locale === 'en' ? 'Language: English' : 'Taal: Nederlands' }}
    </button>
    <button class="ctrl-btn" @click="toggleTheme">
      {{ darkMode ? (locale === 'en' ? 'Theme: Dark' : 'Thema: Donker') : (locale === 'en' ? 'Theme: Light' : 'Thema: Licht') }}
    </button>
  </div>

  <!-- global toast -->
  <AppToast />
</template>

<script>
import { ref, computed, watch, watchEffect } from 'vue';
import { useAuth }         from './composables/useAuth.js';
import { useLists }        from './composables/useLists.js';
import { useTodos }        from './composables/useTodos.js';
import { useToast }        from './composables/useToast.js';

import AuthForm    from './components/auth/AuthForm.vue';
import AppTopbar   from './components/shared/AppTopbar.vue';
import AppToast    from './components/shared/AppToast.vue';
import ListsView   from './views/ListsView.vue';
import TodosView   from './views/TodosView.vue';

export default {
  name: 'App',
  components: { AuthForm, AppTopbar, AppToast, ListsView, TodosView },

  setup() {
    // ── Shared state ──────────────────────────
    const currentView = ref('auth');       // 'auth' | 'app'
    const activeList  = ref(null);
    const mobilePane  = ref('lists');      // 'lists' | 'todos'
    const locale      = ref('en');
    const darkMode    = ref(false);

    // ── Composables ───────────────────────────
    const { showToast }    = useToast();
    const auth             = useAuth();
    const lists            = useLists(auth.currentUser, showToast);
    const todos            = useTodos(showToast);
    const hasLists         = computed(() => lists.todoLists.value.length > 0);

    // Two-way bound object for AuthForm v-model
    const authState = computed({
      get: () => ({ mode: auth.authMode.value, username: auth.authUsername.value, password: auth.authPassword.value }),
      set: (val) => {
        auth.authMode.value     = val.mode;
        auth.authUsername.value = val.username;
        auth.authPassword.value = val.password;
      },
    });

    // ── Auth handlers ─────────────────────────
    async function handleAuth() {
      const ok = await auth.authenticate();
      if (ok) {
        await lists.loadLists();
        currentView.value = 'app';
      }
    }

    function handleLogout() {
      auth.logout();
      activeList.value = null;
      todos.reset();
      currentView.value = 'auth';
    }

    // ── Navigation ────────────────────────────
    async function openList(list) {
      activeList.value  = list;
      todos.reset();
      await todos.loadTodos(list.id);
      mobilePane.value = 'todos';
    }

    async function goToLists() {
      if (auth.currentUser.value?.id) {
        await lists.loadLists();
      }
      activeList.value  = null;
      todos.reset();
      mobilePane.value = 'lists';
    }

    function toggleLocale() {
      locale.value = locale.value === 'en' ? 'nl' : 'en';
    }

    function toggleTheme() {
      darkMode.value = !darkMode.value;
    }

    function handleMobilePaneKeydown(event) {
      if (!hasLists.value) {
        mobilePane.value = 'lists';
        return;
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        mobilePane.value = mobilePane.value === 'lists' ? 'todos' : 'lists';
        return;
      }
      if (event.key === 'Home') {
        mobilePane.value = 'lists';
        return;
      }
      if (event.key === 'End') {
        mobilePane.value = 'todos';
      }
    }

    watchEffect(() => {
      document.documentElement.setAttribute('data-theme', darkMode.value ? 'dark' : 'light');
    });

    watch(
      () => todos.todos.value,
      (nextTodos) => {
        if (!activeList.value) return;
        activeList.value.todos = nextTodos.map((todo) => ({
          id: todo.id,
          title: todo.title,
          description: todo.description,
          completed: !!todo.completed,
          priority: todo.priority,
          dueAt: todo.dueAt,
        }));
      },
      { deep: true },
    );

    watch(
      () => lists.todoLists.value.map((list) => list.id),
      (listIds) => {
        if (!listIds.length) {
          activeList.value = null;
          todos.reset();
          mobilePane.value = 'lists';
          return;
        }

        if (activeList.value && !listIds.includes(activeList.value.id)) {
          activeList.value = null;
          todos.reset();
          mobilePane.value = 'lists';
        }
      },
    );

    return {
      currentView,
      activeList,
      mobilePane,
      authState,
      auth,
      lists,
      todos,
      hasLists,
      locale,
      darkMode,
      handleAuth,
      handleLogout,
      openList,
      goToLists,
      toggleLocale,
      toggleTheme,
      handleMobilePaneKeydown,
    };
  },
};
</script>

<style>
/* App-shell layout — not scoped so child views can fill it */
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-workspace {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
}

.mobile-pane-switch {
  display: none;
}

.lists-panel {
  min-height: 0;
  border-right: 1px solid var(--border);
  background: color-mix(in srgb, var(--card) 90%, #ffffff 10%);
  overflow-y: auto;
}

.todos-panel {
  min-height: 0;
  overflow-y: auto;
}

.app-controls {
  position: fixed;
  left: 14px;
  bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1200;
}

.ctrl-btn {
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--text);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 0.78rem;
  font-family: var(--font-body);
  cursor: pointer;
  box-shadow: 0 10px 26px rgba(10, 30, 60, 0.12);
}

.ctrl-btn:hover {
  border-color: var(--accent);
  color: var(--accent-hi);
}

.skip-link {
  position: fixed;
  top: -44px;
  left: 12px;
  z-index: 1500;
  background: var(--accent-hi);
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  text-decoration: none;
  transition: top 0.2s ease;
}

.skip-link:focus {
  top: 12px;
}

@media (max-width: 600px) {
  .app-workspace {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto minmax(0, 1fr);
  }

  .mobile-pane-switch {
    display: flex;
    gap: 8px;
    padding: 10px 12px;
    position: sticky;
    top: 56px;
    z-index: 90;
    background: color-mix(in srgb, var(--bg) 88%, #ffffff 12%);
    border-bottom: 1px solid var(--border);
  }

  .mobile-pane-btn {
    flex: 1;
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 9px 10px;
    background: var(--card);
    color: var(--muted);
    font-family: var(--font-body);
    font-size: 0.83rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--trans);
  }

  .mobile-pane-btn.active {
    border-color: var(--accent);
    background: var(--accent-lo);
    color: var(--accent-hi);
  }

  .mobile-pane-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .mobile-pane-btn:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--accent) 35%, transparent 65%);
    outline-offset: 2px;
  }

  .lists-panel {
    border-right: none;
    border-bottom: none;
    max-height: none;
  }

  .app-shell[data-mobile-pane='lists'] .todos-panel {
    display: none;
  }

  .app-shell[data-mobile-pane='todos'] .lists-panel {
    display: none;
  }

  .app-controls {
    left: 10px;
    right: 10px;
    bottom: calc(10px + env(safe-area-inset-bottom));
    flex-direction: row;
  }

  .ctrl-btn {
    flex: 1;
    min-width: 0;
    text-align: center;
    font-size: 0.74rem;
    padding: 8px 8px;
  }
}
</style>
