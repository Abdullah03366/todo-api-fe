// ─────────────────────────────────────────────
//  API Service  –  change BASE_URL to match
//  your Spring Boot server address
// ─────────────────────────────────────────────
const BASE_URL = '';

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

async function req(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
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
    const fallbackMessage = getDefaultErrorMessage(res.status, method, path);
    throw new Error(backendMessage || fallbackMessage);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ── Auth ────────────────────────────────────
export const authApi = {
  register: (username) => req('POST', '/api/users', { username }),
  // Login endpoint in this backend currently has no usable input contract,
  // so we resolve login by username through the documented users endpoint.
  login: async (username) => {
    const users = await req('GET', '/api/users');
    return (users || []).find((u) => u.username === username) || null;
  },
};

// ── Lists ────────────────────────────────────
export const listsApi = {
  getAll: async (userId) => {
    const user = await req('GET', `/api/users/${userId}`);
    return user?.todoLists || [];
  },
  getById: (id) => req('GET', `/api/todolists/${id}`),
  create: (userId, data) => req('POST', '/api/todolists', { userId, ...data }),
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
