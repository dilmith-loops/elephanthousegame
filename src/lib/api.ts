import { Player, ScoreRecord, AdminStats } from '../types/game';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface AuthResponse {
  success: boolean;
  message?: string;
  isNewUser?: boolean;
  player?: Player;
  token?: string;
}

export interface ScoreResponse {
  success: boolean;
  message?: string;
  score?: ScoreRecord;
  personal_best?: number;
  rank?: number;
}

export const api = {
  // Player Auth (Check or Register)
  async authPlayer(params: { name: string; mobile: string; email?: string }): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/player/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(params)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Save player profile locally
      if (data.player) {
        localStorage.setItem('eh_player', JSON.stringify(data.player));
      }

      return data;
    } catch (err: unknown) {
      console.error('Player auth error:', err);
      // Fallback local persistence if offline / backend connecting
      const existing = localStorage.getItem('eh_player');
      let fallbackPlayer: Player;
      if (existing) {
        fallbackPlayer = JSON.parse(existing);
        fallbackPlayer.name = params.name;
        fallbackPlayer.mobile = params.mobile;
        if (params.email) fallbackPlayer.email = params.email;
      } else {
        fallbackPlayer = {
          id: Date.now(),
          name: params.name,
          mobile: params.mobile,
          email: params.email || null,
          highest_score: 0,
          total_games: 0
        };
      }
      localStorage.setItem('eh_player', JSON.stringify(fallbackPlayer));
      return {
        success: true,
        player: fallbackPlayer,
        message: (err as Error).message || 'Connected in local mode'
      };
    }
  },

  // Submit Game Score
  async submitScore(data: {
    user_id: number;
    score: number;
    popsicles_caught: number;
    duration_seconds: number;
  }): Promise<ScoreResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/game/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(data)
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || 'Failed to submit score');
      }

      // Update local storage high score if applicable
      const stored = localStorage.getItem('eh_player');
      if (stored) {
        const player: Player = JSON.parse(stored);
        player.highest_score = Math.max(player.highest_score || 0, data.score);
        player.total_games = (player.total_games || 0) + 1;
        localStorage.setItem('eh_player', JSON.stringify(player));
      }

      return resData;
    } catch (err: unknown) {
      console.error('Submit score error:', err);
      // Update local score
      const stored = localStorage.getItem('eh_player');
      let personalBest = data.score;
      if (stored) {
        const player: Player = JSON.parse(stored);
        personalBest = Math.max(player.highest_score || 0, data.score);
        player.highest_score = personalBest;
        player.total_games = (player.total_games || 0) + 1;
        localStorage.setItem('eh_player', JSON.stringify(player));
      }

      return {
        success: true,
        personal_best: personalBest,
        score: {
          id: Date.now(),
          user_id: data.user_id,
          score: data.score,
          popsicles_caught: data.popsicles_caught,
          duration_seconds: data.duration_seconds,
          created_at: new Date().toISOString()
        }
      };
    }
  },

  // Get Leaderboard
  async getLeaderboard(limit = 10): Promise<{ success: boolean; leaderboard: Player[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/leaderboard?limit=${limit}`, {
        headers: { Accept: 'application/json' }
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Leaderboard error:', err);
      return { success: true, leaderboard: [] };
    }
  },

  // Admin: Login
  async adminLogin(email: string, password: string): Promise<{ success: boolean; token?: string; message?: string }> {
    const res = await fetch(`${API_BASE_URL}/admin/login`, {
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
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch admin stats');
    return data;
  },

  // Admin: Get Users List
  async getAdminUsers(params: { page?: number; search?: string; limit?: number } = {}) {
    const token = localStorage.getItem('eh_admin_token');
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.search) query.set('search', params.search);
    if (params.limit) query.set('limit', params.limit.toString());

    const res = await fetch(`${API_BASE_URL}/admin/users?${query.toString()}`, {
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

    const res = await fetch(`${API_BASE_URL}/admin/scores?${query.toString()}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch scores');
    return data;
  },

  // Admin: Export CSV
  getExportUrl(type: 'users' | 'scores' = 'users') {
    const token = localStorage.getItem('eh_admin_token');
    return `${API_BASE_URL}/admin/export?type=${type}&token=${token}`;
  }
};
