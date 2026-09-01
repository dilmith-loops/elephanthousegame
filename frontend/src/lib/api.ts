import { Player, ScoreSubmission, ScoreRecord, AdminStats, AdminLogRecord, AdminUser, PopsicleAsset } from '../types/game';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Localhost on desktop
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://127.0.0.1:8008/api';
    }
    // Local LAN / Wi-Fi IP from mobile devices (e.g., 192.168.x.x)
    if (/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname)) {
      return `http://${hostname}:8008/api`;
    }
    // Production domain on Hostinger (e.g., https://ai.loopsintegrated.co/ElephantHouseGame/api)
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/ElephantHouseGame';
    return `${window.location.origin}${basePath}/api`;
  }
  return 'http://127.0.0.1:8008/api';
}

export const api = {
  // Public: Send heartbeat ping for active player session
  async sendPlayerPing(userId: number): Promise<void> {
    try {
      await fetch(`${getApiBaseUrl()}/player/ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
    } catch {
      // quiet ping fail
    }
  },

  // Player: Authenticate or Register
  async authenticatePlayer(data: {
    name: string;
    mobile?: string;
    email?: string;
  }): Promise<{ success: boolean; isNewUser: boolean; message: string; player: Player }> {
    const res = await fetch(`${getApiBaseUrl()}/player/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || 'Player authentication failed.');
    }
    return result;
  },

  async authPlayer(data: { name: string; mobile?: string; email?: string }) {
    return this.authenticatePlayer(data);
  },

  // Game: Submit Score
  async submitScore(data: {
    user_id: number;
    score: number;
    popsicles_caught: number;
    duration_seconds: number;
  }): Promise<{ success: boolean; message: string; score: ScoreRecord; rank: number; personal_best: number }> {
    const res = await fetch(`${getApiBaseUrl()}/game/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || 'Failed to submit game score.');
    }
    return result;
  },

  // Leaderboard: Fetch Top High Scores
  async getLeaderboard(limit = 10): Promise<{
    success: boolean;
    leaderboard: Array<{ id: number; name: string; mobile: string; highest_score: number; total_games: number }>;
  }> {
    const res = await fetch(`${getApiBaseUrl()}/leaderboard?limit=${limit}`, {
      headers: { Accept: 'application/json' }
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || 'Failed to fetch leaderboard.');
    }
    return result;
  },

  // Admin: Login
  async adminLogin(email: string, password: string): Promise<{
    success: boolean;
    token: string;
    admin: { id: number; name: string; email: string };
  }> {
    const res = await fetch(`${getApiBaseUrl()}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Admin login failed');
    if (data.token) {
      localStorage.setItem('eh_admin_token', data.token);
    }
    return data;
  },

  // Admin: Get Analytics Stats
  async getAdminStats(): Promise<{ success: boolean; stats: AdminStats }> {
    const token = localStorage.getItem('eh_admin_token');
    const res = await fetch(`${getApiBaseUrl()}/admin/stats`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch admin stats');
    return data;
  },

  // Admin: Get Active Users (with IP addresses)
  async getActiveUsers(params: { page?: number; search?: string; limit?: number } = {}) {
    const token = localStorage.getItem('eh_admin_token');
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.search) query.set('search', params.search);
    if (params.limit) query.set('limit', params.limit.toString());

    const res = await fetch(`${getApiBaseUrl()}/admin/active-users?${query.toString()}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch active users');
    return data;
  },

  // Admin: Update Password
  async updateAdminPassword(payload: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<{ success: boolean; message: string }> {
    const token = localStorage.getItem('eh_admin_token');
    const res = await fetch(`${getApiBaseUrl()}/admin/password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update password');
    return data;
  },

  // Admin: List all admin accounts
  async getAdminUsersList(): Promise<{
    success: boolean;
    current_admin_id: number;
    admins: Array<{ id: number; name: string; email: string; created_at?: string }>;
  }> {
    const token = localStorage.getItem('eh_admin_token');
    const res = await fetch(`${getApiBaseUrl()}/admin/admins`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch admin accounts');
    return data;
  },

  // Admin: Create new admin account
  async createAdminUser(payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ success: boolean; message: string; admin: { id: number; name: string; email: string } }> {
    const token = localStorage.getItem('eh_admin_token');
    const res = await fetch(`${getApiBaseUrl()}/admin/admins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create admin user');
    return data;
  },

  // Admin: Delete an admin account
  async deleteAdminUser(id: number): Promise<{ success: boolean; message: string }> {
    const token = localStorage.getItem('eh_admin_token');
    const res = await fetch(`${getApiBaseUrl()}/admin/admins/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete admin user');
    return data;
  },

  // Admin: Update an admin account
  async updateAdminUser(id: number, payload: {
    name: string;
    email: string;
    password?: string;
  }): Promise<{ success: boolean; message: string; admin: AdminUser }> {
    const token = localStorage.getItem('eh_admin_token');
    const res = await fetch(`${getApiBaseUrl()}/admin/admins/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update admin user');
    return data;
  },

  // Admin: Update Registered Player
  async updatePlayerUser(id: number, payload: {
    name: string;
    mobile: string;
    email?: string | null;
  }): Promise<{ success: boolean; message: string; user: Player }> {
    const token = localStorage.getItem('eh_admin_token');
    const res = await fetch(`${getApiBaseUrl()}/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update player');
    return data;
  },

  // Admin: Delete Registered Player
  async deletePlayerUser(id: number): Promise<{ success: boolean; message: string }> {
    const token = localStorage.getItem('eh_admin_token');
    const res = await fetch(`${getApiBaseUrl()}/admin/users/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete player');
    return data;
  },

  // Admin: Delete Score Record
  async deleteScoreRecord(id: number): Promise<{ success: boolean; message: string }> {
    const token = localStorage.getItem('eh_admin_token');
    const res = await fetch(`${getApiBaseUrl()}/admin/scores/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete score record');
    return data;
  },

  // Admin: Get Activity Logs
  async getAdminLogs(params: { page?: number; limit?: number } = {}): Promise<{
    success: boolean;
    logs: { data: AdminLogRecord[]; current_page: number; last_page: number; total: number };
  }> {
    const token = localStorage.getItem('eh_admin_token');
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());

    const res = await fetch(`${getApiBaseUrl()}/admin/logs?${query.toString()}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch admin logs');
    return data;
  },

  // Admin: Get Users List
  async getAdminUsers(params: { page?: number; search?: string; limit?: number } = {}) {
    const token = localStorage.getItem('eh_admin_token');
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.search) query.set('search', params.search);
    if (params.limit) query.set('limit', params.limit.toString());

    const res = await fetch(`${getApiBaseUrl()}/admin/users?${query.toString()}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch users');
    return data;
  },

  // Admin: Get Score Records
  async getAdminScores(params: { page?: number; search?: string; limit?: number } = {}) {
    const token = localStorage.getItem('eh_admin_token');
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.search) query.set('search', params.search);
    if (params.limit) query.set('limit', params.limit.toString());

    const res = await fetch(`${getApiBaseUrl()}/admin/scores?${query.toString()}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch scores');
    return data;
  },

  // Public: Get Game Status / Maintenance Check
  async getGameStatus(): Promise<{ success: boolean; maintenance_mode: boolean; maintenance_message?: string }> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/game/status`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' }
      });
      return await res.json();
    } catch {
      return { success: true, maintenance_mode: false };
    }
  },

  // Admin: Toggle Maintenance Mode
  async toggleMaintenance(enabled: boolean, message?: string): Promise<{ success: boolean; message: string; maintenance_mode: boolean; maintenance_message?: string }> {
    const token = localStorage.getItem('eh_admin_token');
    const res = await fetch(`${getApiBaseUrl()}/admin/maintenance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ enabled, message })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update maintenance mode');
    return data;
  },

  // Admin: Export CSV
  getExportUrl(type: 'users' | 'scores' = 'users') {
    const token = localStorage.getItem('eh_admin_token');
    return `${getApiBaseUrl()}/admin/export?type=${type}&token=${token}`;
  },

  // Public: Get Active Popsicles for Game
  async getPopsicles(): Promise<{ success: boolean; popsicles: PopsicleAsset[] }> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/popsicles`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' }
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to load dynamic popsicles, using fallback', e);
      return { success: false, popsicles: [] };
    }
  },

  // Admin: Get All Popsicles with Stats
  async getAdminPopsicles(): Promise<{ success: boolean; popsicles: PopsicleAsset[]; stats: any }> {
    const token = localStorage.getItem('eh_admin_token');
    const res = await fetch(`${getApiBaseUrl()}/admin/popsicles`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch popsicles');
    return data;
  },

  // Admin: Create Popsicle
  async createPopsicle(formData: FormData): Promise<{ success: boolean; message: string; popsicle: PopsicleAsset }> {
    const token = localStorage.getItem('eh_admin_token');
    const res = await fetch(`${getApiBaseUrl()}/admin/popsicles`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create popsicle');
    return data;
  },

  // Admin: Update Popsicle
  async updatePopsicle(id: number, formData: FormData): Promise<{ success: boolean; message: string; popsicle: PopsicleAsset }> {
    const token = localStorage.getItem('eh_admin_token');
    const res = await fetch(`${getApiBaseUrl()}/admin/popsicles/${id}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update popsicle');
    return data;
  },

  // Admin: Toggle Popsicle Active Status
  async togglePopsicle(id: number): Promise<{ success: boolean; message: string; popsicle: PopsicleAsset }> {
    const token = localStorage.getItem('eh_admin_token');
    const res = await fetch(`${getApiBaseUrl()}/admin/popsicles/${id}/toggle`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to toggle popsicle status');
    return data;
  },

  // Admin: Delete Popsicle
  async deletePopsicle(id: number): Promise<{ success: boolean; message: string }> {
    const token = localStorage.getItem('eh_admin_token');
    const res = await fetch(`${getApiBaseUrl()}/admin/popsicles/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete popsicle');
    return data;
  }
};
