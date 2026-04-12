<!-- ─────────────────────────────────────────────
  components/shared/AppTopbar.vue
  Sticky navigation bar shown after login
───────────────────────────────────────────── -->
<template>
  <nav class="topbar">
    <button class="topbar-logo" @click="$emit('home')" :aria-label="locale === 'en' ? 'Go to lists overview' : 'Ga naar overzicht'">TASKMASTER</button>
    <div class="topbar-right">
      <span class="topbar-user">{{ locale === 'en' ? 'Hi' : 'Hoi' }}, <span>{{ username }}</span></span>
      <button class="btn-ghost" @click="$emit('logout')" :aria-label="locale === 'en' ? 'Log out' : 'Uitloggen'">{{ locale === 'en' ? 'Logout' : 'Uitloggen' }}</button>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'AppTopbar',
  props: {
    username: { type: String, required: true },
    locale: { type: String, default: 'en' },
  },
  emits: ['home', 'logout'],
};
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 60px;
  background: rgba(248, 252, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.topbar-logo {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.25rem;
  color: var(--accent-hi);
  letter-spacing: -0.02em;
  cursor: pointer;
  border: none;
  background: transparent;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.topbar-user {
  font-size: 0.875rem;
  color: var(--text);
}
.topbar-user span { color: var(--accent-hi); font-weight: 700; }

.btn-ghost {
  padding: 7px 14px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--accent-hi);
  font-family: var(--font-body);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: var(--trans);
}
.btn-ghost:hover { border-color: var(--accent); color: var(--text); background: var(--accent-lo); }

[data-theme='dark'] .topbar {
  background: rgba(16, 27, 42, 0.92);
}

@media (max-width: 600px) {
  .topbar {
    padding: 0 12px;
    height: 56px;
  }

  .topbar-logo {
    font-size: 1rem;
    letter-spacing: -0.01em;
  }

  .topbar-right {
    gap: 8px;
    min-width: 0;
  }

  .topbar-user {
    font-size: 0.78rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
  }

  .btn-ghost {
    padding: 6px 10px;
    font-size: 0.75rem;
  }
}
</style>
