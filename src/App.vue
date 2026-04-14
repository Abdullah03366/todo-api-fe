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
          id="mobile-tab-lists"
          class="mobile-pane-btn"
          role="tab"
          aria-controls="lists-panel"
          :aria-selected="mobilePane === 'lists'"
          :tabindex="mobilePane === 'lists' ? 0 : -1"
          :class="{ active: mobilePane === 'lists' }"
          @click="mobilePane = 'lists'"
          @keydown="handleMobilePaneKeydown"
        >
          {{ locale === 'en' ? 'Lists' : 'Lijsten' }}
        </button>
        <button
          id="mobile-tab-todos"
          class="mobile-pane-btn"
          role="tab"
          aria-controls="todos-panel"
          :aria-selected="mobilePane === 'todos'"
          :aria-disabled="!activeList"
          :tabindex="mobilePane === 'todos' ? 0 : -1"
          :class="{ active: mobilePane === 'todos' }"
          :disabled="!activeList"
          @click="mobilePane = 'todos'"
          @keydown="handleMobilePaneKeydown"
        >
          {{ locale === 'en' ? 'Todos' : 'Todos' }}
        </button>
      </div>

      <aside
        id="lists-panel"
        class="lists-panel"
        role="tabpanel"
        aria-labelledby="mobile-tab-lists"
        :aria-label="locale === 'en' ? 'Todo lists' : 'Todo lijsten'"
      >
        <ListsView
          :lists="lists"
          :active-list-id="activeList?.id || null"
          :locale="locale"
          @open-list="openList"
        />
      </aside>

      <section
        id="todos-panel"
        class="todos-panel"
        role="tabpanel"
        aria-labelledby="mobile-tab-todos"
      >
        <TodosView
          :active-list="activeList"
          :todos="todos"
          :list-count="lists.todoLists.value.length"
          :locale="locale"
        />
      </section>
    </div>

    <Transition name="controls-fade">
      <div
        class="app-controls"
        role="group"
        :aria-label="locale === 'en' ? 'Application options' : 'Applicatie opties'"
        v-show="!hideFloatingControls"
      >
        <button class="ctrl-btn" @click="toggleLocale">
          {{ locale === 'en' ? 'Language: English' : 'Taal: Nederlands' }}
        </button>
        <button class="ctrl-btn" @click="toggleTheme">
          {{ darkMode ? (locale === 'en' ? 'Theme: Dark' : 'Thema: Donker') : (locale === 'en' ? 'Theme: Light' : 'Thema: Licht') }}
        </button>
      </div>
    </Transition>
  </div>

  <!-- global toast -->
  <AppToast />
</template>

<script>
import { ref, computed, watch, watchEffect, onMounted, onBeforeUnmount } from 'vue';
import { useAuth }         from './composables/useAuth.js';
import { useLists }        from './composables/useLists.js';
import { useTodos }        from './composables/useTodos.js';
import { useToast }        from './composables/useToast.js';

import AuthForm    from './components/auth/AuthForm.vue';
import AppTopbar   from './components/shared/AppTopbar.vue';
import AppToast    from './components/shared/AppToast.vue';
import ListsView   from './views/ListsView.vue';
import TodosView   from './views/TodosView.vue';

const UI_PREFS_KEY = 'taskr.ui.prefs';
const UI_PREFS_TTL_MS = 60 * 60 * 1000;

function getSessionStorageSafe() {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function readUiPrefs() {
  const storage = getSessionStorageSafe();
  if (!storage) return null;

  try {
    const raw = storage.getItem(UI_PREFS_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const expiresAt = Number(parsed?.expiresAt);
    if (!expiresAt || Date.now() > expiresAt) {
      storage.removeItem(UI_PREFS_KEY);
      return null;
    }

    const locale = ['en', 'nl'].includes(parsed?.value?.locale) ? parsed.value.locale : 'en';
    const darkMode = typeof parsed?.value?.darkMode === 'boolean' ? parsed.value.darkMode : false;

    return { locale, darkMode };
  } catch {
    return null;
  }
}

function writeUiPrefs(value) {
  const storage = getSessionStorageSafe();
  if (!storage) return;

  try {
    storage.setItem(UI_PREFS_KEY, JSON.stringify({
      value,
      expiresAt: Date.now() + UI_PREFS_TTL_MS,
    }));
  } catch {
    // Ignore write errors (private mode/quota/security settings).
  }
}

function isEditableField(element) {
  if (!element || typeof element.tagName !== 'string') return false;
  const tag = element.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || element.isContentEditable;
}

export default {
  name: 'App',
  components: { AuthForm, AppTopbar, AppToast, ListsView, TodosView },

  setup() {
    const storedUiPrefs = readUiPrefs();

    // ── Shared state ──────────────────────────
    const currentView = ref('auth');       // 'auth' | 'app'
    const activeList  = ref(null);
    const mobilePane  = ref('lists');      // 'lists' | 'todos'
    const locale      = ref(storedUiPrefs?.locale ?? 'en');
    const darkMode    = ref(storedUiPrefs?.darkMode ?? false);
    const keyboardVisible = ref(false);

    const hideFloatingControls = computed(() => keyboardVisible.value);

    // ── Composables ───────────────────────────
    const { showToast }    = useToast();
    const auth             = useAuth();
    const lists            = useLists(auth.currentUser, showToast);
    const todos            = useTodos(showToast);

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
      const isNavKey = event.key === 'ArrowRight' || event.key === 'ArrowLeft' || event.key === 'Home' || event.key === 'End';
      if (!isNavKey) return;

      event.preventDefault();

      if (!activeList.value) {
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

    function updateKeyboardVisibilityFromViewport() {
      if (window.innerWidth > 600) {
        keyboardVisible.value = false;
        return;
      }

      if (!window.visualViewport) return;
      const viewportLoss = window.innerHeight - window.visualViewport.height;
      keyboardVisible.value = viewportLoss > 140;
    }

    function handleFocusIn(event) {
      if (window.innerWidth > 600) return;
      if (isEditableField(event.target)) {
        keyboardVisible.value = true;
      }
    }

    function handleFocusOut() {
      if (window.innerWidth > 600) {
        keyboardVisible.value = false;
        return;
      }

      window.setTimeout(() => {
        const active = document.activeElement;
        if (!isEditableField(active)) {
          keyboardVisible.value = false;
        }
      }, 0);
    }

    watchEffect(() => {
      document.documentElement.setAttribute('data-theme', darkMode.value ? 'dark' : 'light');
    });

    watch([locale, darkMode], ([nextLocale, nextDarkMode]) => {
      writeUiPrefs({ locale: nextLocale, darkMode: nextDarkMode });
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

    onMounted(() => {
      window.addEventListener('focusin', handleFocusIn);
      window.addEventListener('focusout', handleFocusOut);
      window.addEventListener('resize', updateKeyboardVisibilityFromViewport);
      window.visualViewport?.addEventListener('resize', updateKeyboardVisibilityFromViewport);
      updateKeyboardVisibilityFromViewport();
    });

    onBeforeUnmount(() => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
      window.removeEventListener('resize', updateKeyboardVisibilityFromViewport);
      window.visualViewport?.removeEventListener('resize', updateKeyboardVisibilityFromViewport);
    });

    return {
      currentView,
      activeList,
      mobilePane,
      authState,
      auth,
      lists,
      todos,
      locale,
      darkMode,
      hideFloatingControls,
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
  --app-bar-pad-x: 32px;
  --app-bar-pad-x-mobile: 12px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

.app-workspace {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(340px, 420px) minmax(0, 1fr);
  overflow: hidden;
}

.mobile-pane-switch {
  display: none;
}

.lists-panel {
  min-height: 0;
  border-right: 1px solid var(--border);
  background: color-mix(in srgb, var(--card) 90%, #ffffff 10%);
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}

.todos-panel {
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}

.app-controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 var(--app-bar-pad-x);
  border-top: 1px solid var(--border);
  background: rgba(248, 252, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  min-height: 60px;
  flex-shrink: 0;
  width: 100%;
}

.ctrl-btn {
  border: 1px solid var(--border);
  background: transparent;
  color: var(--accent-hi);
  border-radius: var(--radius-sm);
  padding: 7px 14px;
  font-size: 0.8125rem;
  font-family: var(--font-body);
  cursor: pointer;
  transition: var(--trans);
}

.ctrl-btn:hover {
  border-color: var(--accent);
  color: var(--text);
  background: var(--accent-lo);
}

[data-theme='dark'] .app-controls {
  background: rgba(16, 27, 42, 0.92);
}

.controls-fade-enter-active,
.controls-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.controls-fade-enter-from,
.controls-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
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
    grid-template-rows: auto minmax(0, 1fr);
  }

  .mobile-pane-switch {
    display: flex;
    gap: 8px;
    padding: 10px 12px;
    position: relative;
    background: color-mix(in srgb, var(--bg) 88%, #ffffff 12%);
    border-bottom: 1px solid var(--border);
  }

  .lists-panel,
  .todos-panel {
    grid-row: 2;
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
    justify-content: space-between;
    min-height: 56px;
    padding: 0 var(--app-bar-pad-x-mobile) calc(6px + env(safe-area-inset-bottom));
    flex-direction: row;
  }

  .ctrl-btn {
    flex: 1;
    min-width: 0;
    text-align: center;
    font-size: 0.75rem;
    padding: 6px 10px;
  }
}
</style>
