// ─────────────────────────────────────────────
//  useToast composable
//  Provides a shared toast notification system
// ─────────────────────────────────────────────
import { reactive } from 'vue';

const toast = reactive({ visible: false, message: '', type: 'success', _timer: null });

export function useToast() {
  function showToast(message, type = 'success') {
    clearTimeout(toast._timer);
    toast.message = message;
    toast.type    = type;
    toast.visible = true;
    toast._timer  = setTimeout(() => { toast.visible = false; }, 2800);
  }

  return { toast, showToast };
}
