const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5174';
const TOKEN_KEY = 'admin_token';

const getToken = () => localStorage.getItem(TOKEN_KEY);

const request = async (path: string, options: RequestInit = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const message = await res.json().catch(() => ({}));
    throw new Error(message.error || 'Erro na requisição');
  }

  return res.json();
};

const authedRequest = async (path: string, options: RequestInit = {}) => {
  const token = getToken();
  return request(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
};

export const publicApi = {
  login: (email: string, password: string) =>
    request('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getAccess: (code: string) => request(`/api/access/${code}`),
  sendConfirmations: (confirmations: any[]) =>
    request('/api/confirmations', {
      method: 'POST',
      body: JSON.stringify({ confirmations }),
    }),
};

export const adminApi = {
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  getSession: async () => {
    try {
      return await authedRequest('/api/admin/session');
    } catch {
      return null;
    }
  },
  getFamilies: () => authedRequest('/api/admin/families'),
  createFamily: (payload: any) =>
    authedRequest('/api/admin/families', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateFamily: (id: number, payload: any) =>
    authedRequest(`/api/admin/families/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteFamily: (id: number) =>
    authedRequest(`/api/admin/families/${id}`, { method: 'DELETE' }),
};
