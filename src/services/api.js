const BASE_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('ds_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const api = {
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      return data;
    },
    register: async (details) => {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      return data;
    },
    me: async () => {
      const res = await fetch(`${BASE_URL}/auth/me`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Session invalid');
      return res.json();
    },
    logout: async () => {
      return fetch(`${BASE_URL}/auth/logout`, { method: 'POST', headers: getHeaders() });
    }
  },

  shop: {
    getOverview: async () => {
      const res = await fetch(`${BASE_URL}/shop/overview`, { headers: getHeaders() });
      return res.json();
    },
    getSales: async () => {
      const res = await fetch(`${BASE_URL}/shop/sales`, { headers: getHeaders() });
      return res.json();
    },
    getInventory: async () => {
      const res = await fetch(`${BASE_URL}/shop/inventory`, { headers: getHeaders() });
      return res.json();
    },
    getCustomers: async () => {
      const res = await fetch(`${BASE_URL}/shop/customers`, { headers: getHeaders() });
      return res.json();
    },
    getSuppliers: async () => {
      const res = await fetch(`${BASE_URL}/shop/suppliers`, { headers: getHeaders() });
      return res.json();
    },
    getSettings: async () => {
      const res = await fetch(`${BASE_URL}/shop/settings`, { headers: getHeaders() });
      return res.json();
    },
    updateSettings: async (settingsData) => {
      const res = await fetch(`${BASE_URL}/shop/settings`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(settingsData)
      });
      return res.json();
    }
  },

  agent: {
    run: async (instruction) => {
      const res = await fetch(`${BASE_URL}/agent/run`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ instruction })
      });
      return res.json();
    },
    approveChallenge: async (challengeId, approved) => {
      const res = await fetch(`${BASE_URL}/agent/approve-challenge`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ challengeId, approved })
      });
      return res.json();
    },
    getHistory: async () => {
      const res = await fetch(`${BASE_URL}/agent/history`, { headers: getHeaders() });
      return res.json();
    },
    getPendingChallenges: async () => {
      const res = await fetch(`${BASE_URL}/agent/pending-challenges`, { headers: getHeaders() });
      return res.json();
    }
  },

  attack: {
    getScenarios: async () => {
      const res = await fetch(`${BASE_URL}/attack/scenarios`, { headers: getHeaders() });
      return res.json();
    },
    run: async (attackId) => {
      const res = await fetch(`${BASE_URL}/attack/run`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ attackId })
      });
      return res.json();
    },
    runAll: async () => {
      const res = await fetch(`${BASE_URL}/attack/run-all`, {
        method: 'POST',
        headers: getHeaders()
      });
      return res.json();
    },
    reset: async () => {
      const res = await fetch(`${BASE_URL}/attack/reset`, {
        method: 'POST',
        headers: getHeaders()
      });
      return res.json();
    }
  },

  findings: {
    getFindings: async (filters = {}) => {
      const params = new URLSearchParams(filters).toString();
      const res = await fetch(`${BASE_URL}/findings?${params}`, { headers: getHeaders() });
      return res.json();
    },
    getReport: async () => {
      const res = await fetch(`${BASE_URL}/findings/report`, { headers: getHeaders() });
      return res.json();
    }
  },

  audit: {
    getLogs: async (filters = {}) => {
      const params = new URLSearchParams(filters).toString();
      const res = await fetch(`${BASE_URL}/audit-logs?${params}`, { headers: getHeaders() });
      return res.json();
    }
  }
};
