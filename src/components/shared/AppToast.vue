<!-- ─────────────────────────────────────────────
  components/shared/AppToast.vue
  Global toast notification overlay
───────────────────────────────────────────── -->
<template>
  <Transition name="toast-fade">
    <div v-if="toast.visible" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </Transition>
</template>

<script>
import { useToast } from '../../composables/useToast.js';

export default {
  name: 'AppToast',
  setup() {
    const { toast } = useToast();
    return { toast };
  },
};
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px 18px;
  font-size: 0.875rem;
  color: var(--text);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
  z-index: 9999;
  max-width: 320px;
}
.toast.success { border-color: rgba(62, 207, 142, 0.4); }
.toast.error   { border-color: rgba(239, 68, 68, 0.4);  }

.toast-fade-enter-active,
.toast-fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.toast-fade-enter-from,
.toast-fade-leave-to     { opacity: 0; transform: translateY(10px); }
</style>
