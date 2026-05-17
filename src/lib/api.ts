const API_BASE = '';

export const publicApi = {
  getAccess: async (code: string) => {
    const response = await fetch(`${API_BASE}/api/access/${code}`);
    if (!response.ok) {
      throw new Error('Access denied');
    }
    return response.json();
  },

  submitConfirmations: async (confirmations: any[]) => {
    const response = await fetch(`${API_BASE}/api/confirmations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmations }),
    });
    if (!response.ok) {
      throw new Error('Failed to submit confirmations');
    }
    return response.json();
  },
};

export const adminApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error('Login failed');
    }
    return response.json();
  },

  getSession: async (token: string) => {
    const response = await fetch(`${API_BASE}/api/admin/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error('Session invalid');
    }
    return response.json();
  },

  getFamilies: async (token: string) => {
    const response = await fetch(`${API_BASE}/api/admin/families`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch families');
    }
    return response.json();
  },

  createFamily: async (token: string, data: any) => {
    const response = await fetch(`${API_BASE}/api/admin/families`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create family');
    }
    return response.json();
  },

  updateFamily: async (token: string, id: number, data: any) => {
    const response = await fetch(`${API_BASE}/api/admin/families/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update family');
    }
    return response.json();
  },

  deleteFamily: async (token: string, id: number) => {
    const response = await fetch(`${API_BASE}/api/admin/families/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error('Failed to delete family');
    }
    return response.json();
  },
};
