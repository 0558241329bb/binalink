// Use VITE_API_BASE_URL for mobile/production, fallback to /api for web development
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  let token = localStorage.getItem('accessToken');
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    ...options.headers,
  };

  let res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  // If unauthorized, try to refresh token
  if (res.status === 403 || res.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const { accessToken, refreshToken: newRefreshToken } = await refreshRes.json();
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Retry original request
        headers['Authorization'] = `Bearer ${accessToken}`;
        res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
      } else {
        // Refresh failed, logout
        localStorage.clear();
        window.location.href = '/login';
      }
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || 'Request failed');
  }
  
  return res.json();
}

export const api = {
  get: (endpoint: string) => fetchWithAuth(endpoint),
  post: (endpoint: string, data: any) => fetchWithAuth(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  patch: (endpoint: string, data: any) => fetchWithAuth(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (endpoint: string) => fetchWithAuth(endpoint, {
    method: 'DELETE',
  }),
};
