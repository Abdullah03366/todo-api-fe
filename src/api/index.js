// ─────────────────────────────────────────────
//  API Service  –  change BASE_URL to match
//  your Spring Boot server address
// ─────────────────────────────────────────────
const BASE_URL = '';
let authToken = '';

export function setAuthToken(token) {
  authToken = token || '';
}

export function clearAuthToken() {
  authToken = '';
}

function getDefaultErrorMessage(status, method, path) {
  const operation = `${method} ${path}`;

  if (status === 400) return `Bad request for ${operation}. Please check your input.`;
  if (status === 401) return `Unauthorized for ${operation}. Please log in again.`;
  if (status === 403) return `Forbidden for ${operation}. You do not have permission.`;
  if (status === 404) return `Not found for ${operation}.`;
  if (status === 409) return `Conflict for ${operation}.`;
  if (status >= 500) return `Server error for ${operation}. Please try again later.`;

  return `HTTP ${status} on ${operation}.`;
}

function extractBackendErrorMessage(payload) {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;

  if (Array.isArray(payload.errors) && payload.errors.length) {
    return payload.errors.filter(Boolean).join(', ');
  }

  return payload.message || payload.error || '';
}

function isDuplicateUsernameError(message, status, path) {
  if (path !== '/api/auth/register') return false;
  if (status === 409) return true;
  return /username|duplicate|already exists|unique/i.test(message || '');
}

async function req(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (authToken) {
    opts.headers.Authorization = `Bearer ${authToken}`;
  }
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(BASE_URL + path, opts);

  if (!res.ok) {
    let payload = null;
    let rawText = '';

    try {
      rawText = await res.text();
      payload = rawText ? JSON.parse(rawText) : null;
    } catch {
      payload = rawText || null;
    }

    const backendMessage = extractBackendErrorMessage(payload);
    if (isDuplicateUsernameError(backendMessage, res.status, path)) {
      throw new Error('Username already exists. Please choose another one.');
    }
    const fallbackMessage = getDefaultErrorMessage(res.status, method, path);
    throw new Error(backendMessage || fallbackMessage);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ── Auth ────────────────────────────────────
export const authApi = {
  register: async ({ username, password }) => {
    const auth = await req('POST', '/api/auth/register', { username, password });
    setAuthToken(auth?.token);
    return auth;
  },
  login: async ({ username, password }) => {
    const auth = await req('POST', '/api/auth/login', { username, password });
    setAuthToken(auth?.token);
    return auth;
  },
};

// ── Lists ────────────────────────────────────
export const listsApi = {
  getAll: () => req('GET', '/api/todolists'),
  getById: (id) => req('GET', `/api/todolists/${id}`),
  create: (data) => req('POST', '/api/todolists', data),
  update: (id, data) => req('PATCH', `/api/todolists/${id}`, data),
  remove: (id) => req('DELETE', `/api/todolists/${id}`),
};

// ── Todos ────────────────────────────────────
export const todosApi = {
  getAll: async (listId) => {
    const list = await req('GET', `/api/todolists/${listId}`);
    return list?.todos || [];
  },
  create: (listId, data) => req('POST', `/api/todolists/${listId}/todos`, data),
  update: (id, data) => req('PATCH', `/api/todos/${id}`, data),
  remove: (id) => req('DELETE', `/api/todos/${id}`),
};
