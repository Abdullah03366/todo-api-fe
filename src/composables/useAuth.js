// ─────────────────────────────────────────────
//  useAuth composable
//  Manages authentication state and actions
// ─────────────────────────────────────────────
import { ref } from 'vue';
import { authApi, clearAuthToken } from '../api/index.js';

export function useAuth() {
  const currentUser  = ref(null);
  const authMode     = ref('login');   // 'login' | 'register'
  const authUsername = ref('');
  const authPassword = ref('');
  const authLoading  = ref(false);
  const authError    = ref('');

  async function authenticate() {
    if (!authUsername.value.trim() || !authPassword.value.trim()) return;

    authError.value   = '';
    authLoading.value = true;

    try {
      const fn = authMode.value === 'login' ? authApi.login : authApi.register;
      const auth = await fn({
        username: authUsername.value.trim(),
        password: authPassword.value,
      });
      if (!auth?.user) throw new Error('Authentication failed.');
      currentUser.value = auth.user;
      return true; // signal success to caller
    } catch (e) {
      authError.value = e.message;
      return false;
    } finally {
      authLoading.value = false;
    }
  }

  function logout() {
    clearAuthToken();
    currentUser.value  = null;
    authUsername.value = '';
    authPassword.value = '';
    authError.value    = '';
    authMode.value     = 'login';
  }

  return {
    currentUser,
    authMode,
    authUsername,
    authPassword,
    authLoading,
    authError,
    authenticate,
    logout,
  };
}
