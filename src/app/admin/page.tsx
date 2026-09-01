'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import { AdminStats, Player, ScoreRecord } from '../../types/game';
import {
  Users,
  Gamepad2,
  Trophy,
  Activity,
  Download,
  FileText,
  Search,
  LogOut,
  Lock,
  Mail,
  ShieldCheck,
  RefreshCw,
  Clock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { exportToPDF } from '../../lib/pdfExport';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'scores'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [usersList, setUsersList] = useState<Player[]>([]);
  const [scoresList, setScoresList] = useState<ScoreRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Check saved token on mount
  useEffect(() => {
    const token = localStorage.getItem('eh_admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await api.adminLogin(loginEmail, loginPassword);
      if (res.success) {
        setIsAuthenticated(true);
      }
    } catch (err: unknown) {
      setLoginError((err as Error).message || 'Invalid credentials');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('eh_admin_token');
    setIsAuthenticated(false);
  };

  // Fetch Dashboard Stats
  const loadStats = useCallback(async () => {
    try {
      const res = await api.getAdminStats();
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  }, []);

  // Fetch Tab Data
  const loadTabData = useCallback(async () => {
    setLoadingData(true);
    try {
      if (activeTab === 'users') {
        const res = await api.getAdminUsers({ page, search: searchQuery, limit: 10 });
        if (res.users) {
          setUsersList(res.users.data || []);
          setTotalPages(res.users.last_page || 1);
        }
      } else {
        const res = await api.getAdminScores({ page, search: searchQuery, limit: 10 });
        if (res.scores) {
          setScoresList(res.scores.data || []);
          setTotalPages(res.scores.last_page || 1);
        }
      }
    } catch (err) {
      console.error('Failed to load table data:', err);
    } finally {
      setLoadingData(false);
    }
  }, [activeTab, page, searchQuery]);

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
      loadTabData();
    }
  }, [isAuthenticated, loadStats, loadTabData]);

  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Handle Export CSV
  const handleExport = (type: 'users' | 'scores') => {
    const url = api.getExportUrl(type);
    window.open(url, '_blank');
  };

  // Handle Export PDF
  const handleExportPDF = async (type: 'users' | 'scores') => {
    try {
      setIsExportingPDF(true);
      await exportToPDF(type, stats);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl p-2 mb-3 shadow-xl shadow-pink-500/20 flex items-center justify-center border border-white/60 dark:border-slate-700/80">
              <img
                src="/logo.png"
                alt="Elephant House"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-pink-400 to-amber-400 bg-clip-text text-transparent">
              Admin Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Elephant House AR Game Score & User Management
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="admin@elephanthouse.lk"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-slate-500 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-slate-500 text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-extrabold rounded-xl shadow-lg shadow-pink-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Sign In as Admin</span>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="mt-6 p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-center text-xs text-slate-400">
            <p className="font-semibold text-slate-300">Default Admin Credentials:</p>
            <p className="mt-1 font-mono text-[11px] text-pink-400">admin@elephanthouse.lk / admin123</p>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Game</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 p-1 shadow-md border border-slate-700/60 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Elephant House"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-black text-base md:text-lg bg-gradient-to-r from-pink-400 to-amber-300 bg-clip-text text-transparent">
              Elephant House Game Admin
            </h1>
            <p className="text-[11px] text-slate-400">Player Insights & Score Analytics</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Gamepad2 className="w-4 h-4 text-pink-400" />
            <span className="hidden sm:inline">Play Game</span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/70 border border-red-800/60 text-red-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
        
        {/* KPI Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Players</span>
              <Users className="w-4 h-4 text-pink-400" />
            </div>
            <div className="text-2xl md:text-3xl font-black text-white mt-2">
              {stats?.total_users ?? 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Unique mobile users</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Games</span>
              <Gamepad2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl md:text-3xl font-black text-white mt-2">
              {stats?.total_games ?? 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Sessions completed</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Today's Games</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl md:text-3xl font-black text-white mt-2">
              {stats?.today_games ?? 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Played in last 24h</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Top Score</span>
              <Trophy className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-2xl md:text-3xl font-black text-amber-400 mt-2">
              {stats?.highest_score ?? 0} <span className="text-xs text-slate-400 font-bold">pts</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Game record</p>
          </div>

          <div className="col-span-2 md:col-span-1 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Average Score</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl md:text-3xl font-black text-white mt-2">
              {stats?.average_score ?? 0} <span className="text-xs text-slate-400 font-bold">pts</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Per session average</p>
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-xl">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            
            {/* Tabs */}
            <div className="flex bg-slate-800/80 p-1 rounded-2xl w-full md:w-auto">
              <button
                onClick={() => { setActiveTab('users'); setPage(1); }}
                className={`flex-1 md:flex-initial px-5 py-2 text-xs md:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Registered Players
              </button>
              <button
                onClick={() => { setActiveTab('scores'); setPage(1); }}
                className={`flex-1 md:flex-initial px-5 py-2 text-xs md:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'scores'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Score Logs
              </button>
            </div>

            {/* Search & Export */}
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, mobile, email..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-slate-500 text-white"
                />
              </div>

              <button
                onClick={() => { loadStats(); loadTabData(); }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Refresh Table"
              >
                <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => handleExport(activeTab)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => handleExportPDF(activeTab)}
                disabled={isExportingPDF}
                className="px-3.5 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer flex-shrink-0 disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isExportingPDF ? 'Generating...' : 'Export PDF'}</span>
              </button>
            </div>
          </div>

          {/* Table View */}
          <div className="overflow-x-auto py-3">
            {loadingData ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-slate-400">Loading {activeTab} data...</p>
              </div>
            ) : activeTab === 'users' ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 rounded-l-xl">ID</th>
                    <th className="py-3 px-4">Player Name</th>
                    <th className="py-3 px-4">Mobile Number</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4 text-center">Highest Score</th>
                    <th className="py-3 px-4 text-center">Total Games</th>
                    <th className="py-3 px-4 rounded-r-xl">Registered At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {usersList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No players found matching your search.
                      </td>
                    </tr>
                  ) : (
                    usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-400">#{u.id}</td>
                        <td className="py-3.5 px-4 font-extrabold text-white">{u.name}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">{u.mobile}</td>
                        <td className="py-3.5 px-4 text-slate-400">{u.email || '—'}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-black">
                            {u.highest_score || 0} pts
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-300">
                          {u.total_games || 0}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          {u.created_at ? new Date(u.created_at).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 rounded-l-xl">Log ID</th>
                    <th className="py-3 px-4">Player</th>
                    <th className="py-3 px-4">Mobile</th>
                    <th className="py-3 px-4 text-center">Marks (Score)</th>
                    <th className="py-3 px-4 text-center">Popsicles Caught</th>
                    <th className="py-3 px-4 text-center">Duration</th>
                    <th className="py-3 px-4 rounded-r-xl">Played At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {scoresList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No score logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    scoresList.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-400">#{s.id}</td>
                        <td className="py-3.5 px-4 font-extrabold text-white">{s.user?.name || `User #${s.user_id}`}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">{s.user?.mobile || '—'}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black">
                            {s.score} marks
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-300">
                          {s.popsicles_caught} 🍦
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-400">
                          {s.duration_seconds}s
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          {s.created_at ? new Date(s.created_at).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
              <span>Page {page} of {totalPages}</span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
