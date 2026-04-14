<!-- ─────────────────────────────────────────────
  components/auth/AuthForm.vue
  Login / Register card
───────────────────────────────────────────── -->
<template>
  <div class="auth-wrap" id="auth-main" tabindex="-1" role="main">
    <div class="auth-card">
      <div class="auth-logo">TASKMASTER</div>
      <div class="auth-tagline">{{ locale === 'en' ? 'Organise everything. Simply.' : 'Organiseer alles. Simpel.' }}</div>

      <!-- mode toggle -->
      <div class="tab-row" role="tablist" :aria-label="locale === 'en' ? 'Authentication mode' : 'Authenticatie modus'">
        <button
          id="auth-tab-login"
          class="tab-btn"
          role="tab"
          aria-controls="auth-panel"
          :aria-selected="modelValue.mode === 'login'"
          :tabindex="modelValue.mode === 'login' ? 0 : -1"
          :class="{ active: modelValue.mode === 'login' }"
          @click="emit('update:modelValue', { ...modelValue, mode: 'login', password: '' })"
          @keydown="handleModeTabKeydown"
        >{{ locale === 'en' ? 'Login' : 'Inloggen' }}</button>
        <button
          id="auth-tab-register"
          class="tab-btn"
          role="tab"
          aria-controls="auth-panel"
          :aria-selected="modelValue.mode === 'register'"
          :tabindex="modelValue.mode === 'register' ? 0 : -1"
          :class="{ active: modelValue.mode === 'register' }"
          @click="emit('update:modelValue', { ...modelValue, mode: 'register', password: '' })"
          @keydown="handleModeTabKeydown"
        >{{ locale === 'en' ? 'Register' : 'Registreren' }}</button>
      </div>

      <div id="auth-panel" role="tabpanel" :aria-labelledby="modelValue.mode === 'login' ? 'auth-tab-login' : 'auth-tab-register'">
        <!-- username field -->
        <div class="form-group">
          <label class="form-label">{{ locale === 'en' ? 'Username' : 'Gebruikersnaam' }}</label>
          <input
            class="form-input"
            :value="modelValue.username"
            @input="emit('update:modelValue', { ...modelValue, username: $event.target.value })"
            :placeholder="locale === 'en' ? 'e.g. jane_doe' : 'bijv. jane_doe'"
            autocomplete="username"
            maxlength="50"
            aria-describedby="username-counter"
            @keyup.enter="emit('submit')"
          />
          <div id="username-counter" class="char-counter" aria-live="polite">
            {{ modelValue.username.length }}/50
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">{{ locale === 'en' ? 'Password' : 'Wachtwoord' }}</label>
          <input
            class="form-input"
            type="password"
            :value="modelValue.password"
            @input="emit('update:modelValue', { ...modelValue, password: $event.target.value })"
            :placeholder="locale === 'en' ? 'Enter your password' : 'Voer je wachtwoord in'"
            autocomplete="current-password"
            @keyup.enter="emit('submit')"
          />
        </div>

        <button
          class="btn-primary"
          @click="emit('submit')"
          :disabled="loading || !modelValue.username.trim() || !modelValue.password.trim()"
        >
          <span v-if="loading"><span class="spinner"></span></span>
          <span v-else>{{ modelValue.mode === 'login' ? (locale === 'en' ? 'Login' : 'Inloggen') : (locale === 'en' ? 'Create Account' : 'Account aanmaken') }}</span>
        </button>

        <div class="error-msg" v-if="error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthForm',
  props: {
    modelValue: { type: Object, required: true },   // { mode, username }
    loading:    { type: Boolean, default: false },
    error:      { type: String,  default: '' },
    locale:     { type: String,  default: 'en' },
  },
  emits: ['update:modelValue', 'submit'],
  setup(props, { emit }) {
    function handleModeTabKeydown(event) {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'Home' && event.key !== 'End') {
        return;
      }

      event.preventDefault();
      if (event.key === 'Home' || event.key === 'ArrowLeft') {
        emit('update:modelValue', { ...props.modelValue, mode: 'login', password: '' });
        return;
      }

      emit('update:modelValue', { ...props.modelValue, mode: 'register', password: '' });
    }

    return { emit, handleModeTabKeydown };
  },
};
</script>

<style scoped>
.auth-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124, 106, 255, 0.2) 0%, transparent 70%),
    var(--bg);
}

.auth-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.auth-logo {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--accent-hi);
  margin-bottom: 6px;
}

.auth-tagline {
  color: var(--muted);
  font-size: 0.875rem;
  margin-bottom: 36px;
}

.tab-row {
  display: flex;
  background: var(--card);
  border-radius: var(--radius-sm);
  padding: 4px;
  margin-bottom: 28px;
  border: 1px solid var(--border);
}

.tab-btn {
  flex: 1;
  padding: 9px;
  border: none;
  background: transparent;
  color: var(--muted);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: var(--trans);
}
.tab-btn.active { background: var(--accent); color: #fff; }

.form-group { margin-bottom: 18px; }

.form-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 0.9375rem;
  outline: none;
  transition: border-color var(--trans), box-shadow var(--trans);
}
.form-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(124, 106, 255, 0.15);
}
.form-input::placeholder { color: var(--muted); }

.btn-primary {
  width: 100%;
  padding: 13px;
  background: var(--accent);
  border: none;
  border-radius: var(--radius-sm);
  color: #fff;
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--trans), transform var(--trans), box-shadow var(--trans);
}
.btn-primary:hover:not(:disabled) {
  background: var(--accent-hi);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(124, 106, 255, 0.35);
}
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.spinner {
  display: inline-block;
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  vertical-align: middle;
}

.error-msg {
  color: var(--high);
  font-size: 0.8125rem;
  margin-top: 12px;
  text-align: center;
}

.char-counter {
  margin-top: 6px;
  text-align: right;
  color: var(--muted);
  font-size: 0.75rem;
}

@media (max-width: 600px) {
  .auth-wrap {
    padding: 14px;
    align-items: flex-start;
  }

  .auth-card {
    margin-top: 14px;
    padding: 28px 20px;
    border-radius: 16px;
    box-shadow: 0 18px 36px rgba(0, 0, 0, 0.18);
  }

  .auth-logo {
    font-size: 1.6rem;
    letter-spacing: -0.015em;
  }

  .auth-tagline {
    margin-bottom: 22px;
  }
}
</style>
