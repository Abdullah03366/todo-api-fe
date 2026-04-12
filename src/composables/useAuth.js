// ─────────────────────────────────────────────
//  useAuth composable
//  Manages authentication state and actions
// ─────────────────────────────────────────────
import { ref } from 'vue';
import { authApi } from '../api/index.js';

export function useAuth() {
  const currentUser  = ref(null);
  const authMode     = ref('login');   // 'login' | 'register'
  const authUsername = ref('');
  const authLoading  = ref(false);
  const authError    = ref('');

  async function authenticate() {
    if (!authUsername.value.trim()) return;

    authError.value   = '';
    authLoading.value = true;

    try {
      const fn = authMode.value === 'login' ? authApi.login : authApi.register;
      const user = await fn(authUsername.value.trim());
      if (!user) throw new Error('User not found. Please register first.');
      currentUser.value = user;
      return true; // signal success to caller
    } catch (e) {
      authError.value = e.message;
      return false;
    } finally {
      authLoading.value = false;
    }
  }

  function logout() {
    currentUser.value  = null;
    authUsername.value = '';
    authError.value    = '';
    authMode.value     = 'login';
  }

  return {
    currentUser,
    authMode,
    authUsername,
    authLoading,
    authError,
    authenticate,
    logout,
  };
}
