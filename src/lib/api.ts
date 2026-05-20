const API_BASE = '';
const ADMIN_TOKEN_KEY = 'admin_token';

const getStoredToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

const authHeaders = (extra: Record<string, string> = {}) => {
  const token = getStoredToken();
  if (!token) return extra;
  return {
    ...extra,
    Authorization: `Bearer ${token}`,
  };
};

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
};

export const adminApi = {
  setToken: (token: string) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  },

  clearToken: () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  },

  getSession: async () => {
    const response = await fetch(`${API_BASE}/api/admin/session`, {
      headers: authHeaders(),
    });
    if (!response.ok) {
      throw new Error('Session invalid');
    }
    return response.json();
  },

  getFamilies: async () => {
    const response = await fetch(`${API_BASE}/api/admin/families`, {
      headers: authHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch families');
    }
    return response.json();
  },

  createFamily: async (data: any) => {
    const response = await fetch(`${API_BASE}/api/admin/families`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create family');
    }
    return response.json();
  },

  updateFamily: async (id: number, data: any) => {
    const response = await fetch(`${API_BASE}/api/admin/families/${id}`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update family');
    }
    return response.json();
  },

  deleteFamily: async (id: number) => {
    const response = await fetch(`${API_BASE}/api/admin/families/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete family');
    }
    return response.json();
  },

  getGalleryPhotos: async () => {
    const response = await fetch(`${API_BASE}/api/admin/gallery-photos`, {
      headers: authHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch gallery photos');
    }
    return response.json();
  },

  uploadGalleryPhoto: async (files: File[], title?: string, onProgress?: (uploaded: number, total: number) => void) => {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('No files provided');
    }

    const uploaded = [];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const formData = new FormData();
      formData.append('photo', file);
      if (title?.trim()) {
        const suffix = files.length > 1 ? ` ${String(index + 1).padStart(2, '0')}` : '';
        formData.append('title', `${title.trim()}${suffix}`);
      }

      const response = await fetch(`${API_BASE}/api/admin/gallery-photos`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Failed to upload photo ${file.name}`);
      }
      uploaded.push(await response.json());
      onProgress?.(index + 1, files.length);
    }

    return uploaded;
  },

  deleteGalleryPhoto: async (id: number) => {
    const response = await fetch(`${API_BASE}/api/admin/gallery-photos/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete gallery photo');
    }
    return response.json();
  },
};
