'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import { AdminStats, Player, ScoreRecord, AdminLogRecord, AdminUser } from '../../types/game';
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
  ChevronRight,
  Eye,
  EyeOff,
  Power,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  X,
  Radio,
  History,
  KeyRound,
  LayoutDashboard,
  Menu,
  Globe,
  Smartphone,
  Check,
  UserCheck,
  Settings,
  Sliders,
  UserPlus,
  Trash2,
  Shield,
  UserCog,
  Pencil,
  Phone
} from 'lucide-react';
import Link from 'next/link';
import { exportToPDF } from '../../lib/pdfExport';

type SidebarTab = 'overview' | 'active_users' | 'users' | 'scores' | 'logs' | 'settings' | 'security';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Layout & Navigation State
  const [activeTab, setActiveTab] = useState<SidebarTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dashboard Data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<Player[]>([]);
  const [activeUsersList, setActiveUsersList] = useState<Player[]>([]);
  const [scoresList, setScoresList] = useState<ScoreRecord[]>([]);
  const [logsList, setLogsList] = useState<AdminLogRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Maintenance Dialog States
  const [isTogglingMaintenance, setIsTogglingMaintenance] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceMsgInput, setMaintenanceMsgInput] = useState('');

  // Logout Confirmation Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Password Change States
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Admin Accounts Management States
  const [adminAccounts, setAdminAccounts] = useState<AdminUser[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState<number | null>(null);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminConfirmPass, setNewAdminConfirmPass] = useState('');
  const [showNewAdminPass, setShowNewAdminPass] = useState(false);
  const [showNewAdminConfirmPass, setShowNewAdminConfirmPass] = useState(false);
  const [createAdminMsg, setCreateAdminMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [deletingAdminId, setDeletingAdminId] = useState<number | null>(null);

  // Admin Edit Modal States
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [editAdminName, setEditAdminName] = useState('');
  const [editAdminEmail, setEditAdminEmail] = useState('');
  const [editAdminPassword, setEditAdminPassword] = useState('');
  const [showEditAdminPass, setShowEditAdminPass] = useState(false);
  const [isUpdatingAdmin, setIsUpdatingAdmin] = useState(false);
  const [adminEditMsg, setAdminEditMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Player Edit & Delete States
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editPlayerName, setEditPlayerName] = useState('');
  const [editPlayerMobile, setEditPlayerMobile] = useState('');
  const [editPlayerEmail, setEditPlayerEmail] = useState('');
  const [isUpdatingPlayer, setIsUpdatingPlayer] = useState(false);
  const [playerEditMsg, setPlayerEditMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deletingPlayerId, setDeletingPlayerId] = useState<number | null>(null);

  // Score Delete State
  const [deletingScoreId, setDeletingScoreId] = useState<number | null>(null);

  // Custom Delete Confirmation Modal States
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [scoreToDelete, setScoreToDelete] = useState<ScoreRecord | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);
  const [deleteDialogError, setDeleteDialogError] = useState<string | null>(null);
  const [isDeletingTarget, setIsDeletingTarget] = useState(false);

  // Export PDF Loading State
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Check stored auth token on mount
  useEffect(() => {
    const token = localStorage.getItem('eh_admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Handle Admin Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      await api.adminLogin(loginEmail, loginPassword);
      setIsAuthenticated(true);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout Trigger
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  // Confirm Logout
  const confirmLogout = () => {
    localStorage.removeItem('eh_admin_token');
    setIsAuthenticated(false);
    setShowLogoutModal(false);
    setLoginEmail('');
    setLoginPassword('');
  };

  // Load KPI Stats
  const loadStats = useCallback(async () => {
    try {
      const res = await api.getAdminStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  // Load Active Tab Data
  const loadTabData = useCallback(async () => {
    setLoadingData(true);
    try {
      if (activeTab === 'overview') {
        await loadStats();
      } else if (activeTab === 'active_users') {
        const res = await api.getActiveUsers({ page, search: searchQuery, limit: 15 });
        if (res.success) {
          setActiveUsersList(res.active_users.data || []);
          setTotalPages(res.active_users.last_page || 1);
          setTotalRecords(res.active_users.total || 0);
        }
      } else if (activeTab === 'users') {
        const res = await api.getAdminUsers({ page, search: searchQuery, limit: 15 });
        if (res.success) {
          setUsersList(res.users.data || []);
          setTotalPages(res.users.last_page || 1);
          setTotalRecords(res.users.total || 0);
        }
      } else if (activeTab === 'scores') {
        const res = await api.getAdminScores({ page, search: searchQuery, limit: 15 });
        if (res.success) {
          setScoresList(res.scores.data || []);
          setTotalPages(res.scores.last_page || 1);
          setTotalRecords(res.scores.total || 0);
        }
      } else if (activeTab === 'logs') {
        const res = await api.getAdminLogs({ page, limit: 20 });
        if (res.success) {
          setLogsList(res.logs.data || []);
          setTotalPages(res.logs.last_page || 1);
          setTotalRecords(res.logs.total || 0);
        }
      } else if (activeTab === 'security') {
        await loadAdminAccounts();
      }
    } catch (err) {
      console.error('Failed to load tab data:', err);
    } finally {
      setLoadingData(false);
    }
  }, [activeTab, page, searchQuery, loadStats]);

  // Load Admin Accounts
  const loadAdminAccounts = useCallback(async () => {
    setLoadingAdmins(true);
    try {
      const res = await api.getAdminUsersList();
      if (res.success) {
        setAdminAccounts(res.admins || []);
        if (res.current_admin_id) {
          setCurrentAdminId(res.current_admin_id);
        }
      }
    } catch (err) {
      console.error('Failed to load admin accounts:', err);
    } finally {
      setLoadingAdmins(false);
    }
  }, []);

  // Handle Create New Admin User
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateAdminMsg(null);

    if (newAdminPassword.length < 6) {
      setCreateAdminMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (newAdminPassword !== newAdminConfirmPass) {
      setCreateAdminMsg({ type: 'error', text: 'Password confirmation does not match.' });
      return;
    }

    try {
      setIsCreatingAdmin(true);
      const res = await api.createAdminUser({
        name: newAdminName.trim(),
        email: newAdminEmail.trim(),
        password: newAdminPassword,
        password_confirmation: newAdminConfirmPass
      });
      setCreateAdminMsg({ type: 'success', text: res.message });
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminConfirmPass('');
      await loadAdminAccounts();
      setTimeout(() => {
        setShowAddAdminModal(false);
        setCreateAdminMsg(null);
      }, 1200);
    } catch (err: any) {
      setCreateAdminMsg({ type: 'error', text: err.message || 'Failed to create admin user.' });
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  // Handle Trigger Delete Admin User
  const handleDeleteAdmin = (adminUser: AdminUser) => {
    setDeleteDialogError(null);
    setAdminToDelete(adminUser);
  };

  // Confirm Delete Admin User
  const confirmDeleteAdmin = async () => {
    if (!adminToDelete) return;
    try {
      setIsDeletingTarget(true);
      setDeleteDialogError(null);
      await api.deleteAdminUser(adminToDelete.id);
      await loadAdminAccounts();
      setAdminToDelete(null);
    } catch (err: any) {
      setDeleteDialogError(err.message || 'Failed to delete admin account.');
    } finally {
      setIsDeletingTarget(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
      loadTabData();
    }
  }, [isAuthenticated, activeTab, loadStats, loadTabData]);

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

  // Open Maintenance Dialog
  const openMaintenanceDialog = () => {
    setMaintenanceMsgInput(
      stats?.maintenance_message ||
        'The Elephant House AR Game is currently undergoing scheduled maintenance. Please check back shortly!'
    );
    setShowMaintenanceModal(true);
  };

  // Confirm Maintenance Mode Toggle
  const confirmToggleMaintenance = async () => {
    const currentStatus = stats?.maintenance_mode ?? false;
    const newStatus = !currentStatus;

    try {
      setIsTogglingMaintenance(true);
      const res = await api.toggleMaintenance(newStatus, maintenanceMsgInput);
      setStats((prev) =>
        prev
          ? {
              ...prev,
              maintenance_mode: res.maintenance_mode,
              maintenance_message: res.maintenance_message
            }
          : prev
      );
      setShowMaintenanceModal(false);
    } catch (err) {
      console.error('Failed to toggle maintenance mode:', err);
      alert('Failed to update maintenance mode. Please try again.');
    } finally {
      setIsTogglingMaintenance(false);
    }
  };

  // Handle Change Password Form
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPasswordInput.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordMsg({ type: 'error', text: 'New password confirmation does not match.' });
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const res = await api.updateAdminPassword({
        current_password: currentPasswordInput,
        new_password: newPasswordInput,
        new_password_confirmation: confirmPasswordInput
      });
      setPasswordMsg({ type: 'success', text: res.message || 'Password updated successfully!' });
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Open Edit Player Modal
  const handleOpenEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setEditPlayerName(player.name);
    setEditPlayerMobile(player.mobile);
    setEditPlayerEmail(player.email || '');
    setPlayerEditMsg(null);
  };

  // Handle Save Player Edit
  const handleUpdatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;
    setPlayerEditMsg(null);

    try {
      setIsUpdatingPlayer(true);
      const res = await api.updatePlayerUser(editingPlayer.id, {
        name: editPlayerName.trim(),
        mobile: editPlayerMobile.trim(),
        email: editPlayerEmail.trim() || null
      });
      setPlayerEditMsg({ type: 'success', text: res.message || 'Player updated successfully!' });
      loadTabData();
      loadStats();
      setTimeout(() => {
        setEditingPlayer(null);
        setPlayerEditMsg(null);
      }, 1200);
    } catch (err: any) {
      setPlayerEditMsg({ type: 'error', text: err.message || 'Failed to update player.' });
    } finally {
      setIsUpdatingPlayer(false);
    }
  };

  // Handle Trigger Delete Player
  const handleDeletePlayer = (player: Player) => {
    setDeleteDialogError(null);
    setPlayerToDelete(player);
  };

  // Confirm Delete Player
  const confirmDeletePlayer = async () => {
    if (!playerToDelete) return;
    try {
      setIsDeletingTarget(true);
      setDeleteDialogError(null);
      await api.deletePlayerUser(playerToDelete.id);
      loadTabData();
      loadStats();
      setPlayerToDelete(null);
    } catch (err: any) {
      setDeleteDialogError(err.message || 'Failed to delete player.');
    } finally {
      setIsDeletingTarget(false);
    }
  };

  // Open Edit Admin Modal
  const handleOpenEditAdmin = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setEditAdminName(admin.name);
    setEditAdminEmail(admin.email);
    setEditAdminPassword('');
    setShowEditAdminPass(false);
    setAdminEditMsg(null);
  };

  // Handle Save Admin Edit
  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setAdminEditMsg(null);

    if (editAdminPassword && editAdminPassword.length < 6) {
      setAdminEditMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    try {
      setIsUpdatingAdmin(true);
      const res = await api.updateAdminUser(editingAdmin.id, {
        name: editAdminName.trim(),
        email: editAdminEmail.trim(),
        password: editAdminPassword.trim() || undefined
      });
      setAdminEditMsg({ type: 'success', text: res.message || 'Admin updated successfully!' });
      loadAdminAccounts();
      setTimeout(() => {
        setEditingAdmin(null);
        setAdminEditMsg(null);
      }, 1200);
    } catch (err: any) {
      setAdminEditMsg({ type: 'error', text: err.message || 'Failed to update admin.' });
    } finally {
      setIsUpdatingAdmin(false);
    }
  };

  // Handle Trigger Delete Score Record
  const handleDeleteScore = (score: ScoreRecord) => {
    setDeleteDialogError(null);
    setScoreToDelete(score);
  };

  // Confirm Delete Score Record
  const confirmDeleteScore = async () => {
    if (!scoreToDelete) return;
    try {
      setIsDeletingTarget(true);
      setDeleteDialogError(null);
      await api.deleteScoreRecord(scoreToDelete.id);
      loadTabData();
      loadStats();
      setScoreToDelete(null);
    } catch (err: any) {
      setDeleteDialogError(err.message || 'Failed to delete score record.');
    } finally {
      setIsDeletingTarget(false);
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
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/logo.png`}
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
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-slate-500 text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer focus:outline-none"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-pink-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400 hover:text-slate-200" />
                  )}
                </button>
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

          <div className="mt-6 text-center">
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2.5">
          <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/logo.png`} alt="Elephant House" className="w-8 h-8 object-contain" />
          <span className="font-extrabold text-sm text-pink-400">EH Admin</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Responsive Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-40 w-64 bg-slate-900/95 md:bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 flex flex-col justify-between p-4 transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center space-x-3 px-2 py-3 mb-4 border-b border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-md border border-slate-700/60 flex items-center justify-center flex-shrink-0">
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/logo.png`}
                alt="Elephant House"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-black text-sm bg-gradient-to-r from-pink-400 to-amber-300 bg-clip-text text-transparent">
                Elephant House
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold">AR Game Control Center</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => { setActiveTab('overview'); setPage(1); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/20'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => { setActiveTab('active_users'); setPage(1); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'active_users'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/20'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Live Active Users</span>
              </div>
              {(stats?.active_users_count ?? 0) > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                  {stats?.active_users_count}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('users'); setPage(1); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/20'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Registered Players</span>
            </button>

            <button
              onClick={() => { setActiveTab('scores'); setPage(1); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'scores'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/20'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Game Score Logs</span>
            </button>

            <button
              onClick={() => { setActiveTab('logs'); setPage(1); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/20'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Admin Activity Logs</span>
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setPage(1); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/20'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>System Settings</span>
            </button>

            <button
              onClick={() => { setActiveTab('security'); setPage(1); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/20'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Security & Password</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <Link
            href="/"
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
          >
            <Gamepad2 className="w-4 h-4 text-pink-400" />
            <span>Switch to Game</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 md:p-8 w-full space-y-6 min-w-0">
        
        {/* Top Breadcrumb & Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white capitalize">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'active_users' && 'Live Active Users & IP Monitoring'}
              {activeTab === 'users' && 'Registered Players Directory'}
              {activeTab === 'scores' && 'Game Session Score Logs'}
              {activeTab === 'logs' && 'Admin Audit & Action Logs'}
              {activeTab === 'settings' && 'System & Maintenance Settings'}
              {activeTab === 'security' && 'Admin Profile & Security'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Elephant House AR Tongue Catch Ice Cream Campaign
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => { loadStats(); loadTabData(); }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
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
                  <span className="text-xs font-bold uppercase tracking-wider">Live Online</span>
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                </div>
                <div className="text-2xl md:text-3xl font-black text-emerald-400 mt-2">
                  {stats?.active_users_count ?? 0}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Active in last 15 min</p>
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
                  <span className="text-xs font-bold uppercase tracking-wider">Top Score</span>
                  <Trophy className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl md:text-3xl font-black text-amber-400 mt-2">
                  {stats?.highest_score ?? 0} <span className="text-xs font-normal text-amber-300">pts</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Game record marks</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Average Score</span>
                  <Clock className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl md:text-3xl font-black text-white mt-2">
                  {stats?.average_score ?? 0} <span className="text-xs font-normal text-slate-400">pts</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Per session average</p>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center space-x-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span>Real-time Active Users & IP Addresses</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Monitor active connections, players' IP addresses, device user agents, and recent engagement.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('active_users')}
                  className="mt-4 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>View Active Users Table</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center space-x-2">
                    <KeyRound className="w-4 h-4 text-pink-400" />
                    <span>Admin Security & Password</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Change administrative access password and review audit logs of recent modifications.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('security')}
                  className="mt-4 px-4 py-2 bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>Manage Password</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. ACTIVE USERS TAB (WITH IP ADDRESSES) */}
        {activeTab === 'active_users' && (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 md:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by name, mobile, IP..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <span className="text-xs text-slate-400">
                Total Users: <strong className="text-white">{totalRecords}</strong>
              </span>
            </div>

            <div className="overflow-x-auto py-2">
              {loadingData ? (
                <div className="py-16 text-center">
                  <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-slate-400">Loading active users...</p>
                </div>
              ) : activeUsersList.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  No active users found matching your search.
                </div>
              ) : (
                <table className="w-full text-left text-xs min-w-[750px]">
                  <thead className="bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4 rounded-l-xl whitespace-nowrap">Status</th>
                      <th className="py-3 px-4 whitespace-nowrap">Player Name</th>
                      <th className="py-3 px-4 whitespace-nowrap">Mobile</th>
                      <th className="py-3 px-4 whitespace-nowrap">Client IP Address</th>
                      <th className="py-3 px-4 text-center whitespace-nowrap">High Score</th>
                      <th className="py-3 px-4 text-center whitespace-nowrap">Games</th>
                      <th className="py-3 px-4 whitespace-nowrap">Last Active Time</th>
                      <th className="py-3 px-4 text-right rounded-r-xl whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {activeUsersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'online'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                              : u.status === 'idle'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'online' ? 'bg-emerald-400' : u.status === 'idle' ? 'bg-amber-400' : 'bg-slate-500'
                            }`} />
                            <span className="capitalize">{u.status || 'Offline'}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-white whitespace-nowrap">{u.name}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">{u.mobile}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono text-xs px-2 py-1 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                            {u.last_ip_address || '127.0.0.1'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-pink-400 whitespace-nowrap">
                          {u.highest_score || 0} pts
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-300 whitespace-nowrap">{u.total_games || 0}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {u.last_active_at ? new Date(u.last_active_at).toLocaleString() : 'Just now'}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleOpenEditPlayer(u)}
                              className="p-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 border border-blue-800/40 hover:border-blue-600 transition-colors cursor-pointer"
                              title="Edit Player"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePlayer(u)}
                              disabled={deletingPlayerId === u.id}
                              className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 hover:border-red-600 transition-colors disabled:opacity-40 cursor-pointer"
                              title="Delete Player"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
        )}

        {/* 3. REGISTERED PLAYERS TAB */}
        {activeTab === 'users' && (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 md:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search player name, mobile, email..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={() => handleExport('users')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => handleExportPDF('users')}
                  disabled={isExportingPDF}
                  className="px-3.5 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isExportingPDF ? 'Generating...' : 'Export PDF'}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto py-2">
              {loadingData ? (
                <div className="py-16 text-center">
                  <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-slate-400">Loading players...</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs min-w-[750px]">
                  <thead className="bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4 rounded-l-xl whitespace-nowrap">ID</th>
                      <th className="py-3 px-4 whitespace-nowrap">Player Name</th>
                      <th className="py-3 px-4 whitespace-nowrap">Mobile Number</th>
                      <th className="py-3 px-4 whitespace-nowrap">Email Address</th>
                      <th className="py-3 px-4 text-center whitespace-nowrap">Highest Score</th>
                      <th className="py-3 px-4 text-center whitespace-nowrap">Total Games</th>
                      <th className="py-3 px-4 whitespace-nowrap">Registered At</th>
                      <th className="py-3 px-4 text-right rounded-r-xl whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">#{u.id}</td>
                        <td className="py-3.5 px-4 font-extrabold text-white whitespace-nowrap">{u.name}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">{u.mobile}</td>
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">{u.email || '—'}</td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-black">
                            {u.highest_score || 0} pts
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-300 whitespace-nowrap">{u.total_games || 0}</td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleOpenEditPlayer(u)}
                              className="p-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 border border-blue-800/40 hover:border-blue-600 transition-colors cursor-pointer"
                              title="Edit Player"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePlayer(u)}
                              disabled={deletingPlayerId === u.id}
                              className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 hover:border-red-600 transition-colors disabled:opacity-40 cursor-pointer"
                              title="Delete Player"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
        )}

        {/* 4. GAME SCORE LOGS TAB */}
        {activeTab === 'scores' && (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 md:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search score records..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={() => handleExport('scores')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => handleExportPDF('scores')}
                  disabled={isExportingPDF}
                  className="px-3.5 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isExportingPDF ? 'Generating...' : 'Export PDF'}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto py-2">
              {loadingData ? (
                <div className="py-16 text-center">
                  <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-slate-400">Loading scores...</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs min-w-[800px]">
                  <thead className="bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4 rounded-l-xl whitespace-nowrap">Log ID</th>
                      <th className="py-3 px-4 whitespace-nowrap">Player</th>
                      <th className="py-3 px-4 whitespace-nowrap">Mobile</th>
                      <th className="py-3 px-4 whitespace-nowrap">Player IP</th>
                      <th className="py-3 px-4 text-center whitespace-nowrap">Marks (Score)</th>
                      <th className="py-3 px-4 text-center whitespace-nowrap">Caught</th>
                      <th className="py-3 px-4 text-center whitespace-nowrap">Duration</th>
                      <th className="py-3 px-4 whitespace-nowrap">Played At</th>
                      <th className="py-3 px-4 text-right rounded-r-xl whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {scoresList.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">#{s.id}</td>
                        <td className="py-3.5 px-4 font-extrabold text-white whitespace-nowrap">{s.user?.name || `User #${s.user_id}`}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">{s.user?.mobile || '—'}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">{s.user?.last_ip_address || '127.0.0.1'}</td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black">
                            {s.score} marks
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-300 whitespace-nowrap">
                          {s.popsicles_caught} 🍦
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-400 whitespace-nowrap">
                          {s.duration_seconds}s
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {s.created_at ? new Date(s.created_at).toLocaleString() : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteScore(s)}
                            disabled={deletingScoreId === s.id}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 hover:border-red-600 transition-colors disabled:opacity-40 cursor-pointer inline-flex items-center justify-center"
                            title="Delete Score Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
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
        )}

        {/* 5. ADMIN AUDIT LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 md:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Showing all administrative actions, logins, and maintenance events.
              </span>
              <button
                onClick={loadTabData}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300"
              >
                Refresh Logs
              </button>
            </div>

            <div className="overflow-x-auto py-2">
              {loadingData ? (
                <div className="py-16 text-center">
                  <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-slate-400">Loading audit logs...</p>
                </div>
              ) : logsList.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  No activity logs recorded yet.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4 rounded-l-xl">Log ID</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Admin Email</th>
                      <th className="py-3 px-4">IP Address</th>
                      <th className="py-3 px-4 rounded-r-xl">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {logsList.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-400">#{log.id}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-pink-400 font-bold uppercase text-[10px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-200">{log.description || '—'}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{log.admin_email || 'System'}</td>
                        <td className="py-3.5 px-4 font-mono text-cyan-400">{log.ip_address || '127.0.0.1'}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                          {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
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
        )}

        {/* 6. SETTINGS TAB (SYSTEM & MAINTENANCE CONTROLS) */}
        {activeTab === 'settings' && (
          <div className="w-full space-y-6">
            {/* System Maintenance Mode Card */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div className="flex items-center space-x-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${
                    stats?.maintenance_mode
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {stats?.maintenance_mode ? (
                      <Wrench className="w-6 h-6" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-black text-white">System Maintenance Mode</h3>
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                        stats?.maintenance_mode
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {stats?.maintenance_mode ? 'Locked / Maintenance Active' : 'Live & Operational'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {stats?.maintenance_mode
                        ? 'The game is currently locked. All visiting players will see the maintenance screen.'
                        : 'The AR Tongue Catch game is live for all players.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={openMaintenanceDialog}
                  disabled={isTogglingMaintenance}
                  className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center space-x-2 shadow-lg transition-all cursor-pointer disabled:opacity-50 flex-shrink-0 ${
                    stats?.maintenance_mode
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>
                    {isTogglingMaintenance
                      ? 'Updating...'
                      : stats?.maintenance_mode
                      ? 'Disable Maintenance (Go Live)'
                      : 'Enable Maintenance Mode'}
                  </span>
                </button>
              </div>

              {/* Maintenance Notice Message Info */}
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/60 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-300 font-bold">
                  <span>Current Player Notice Message:</span>
                  <button
                    onClick={openMaintenanceDialog}
                    className="text-pink-400 hover:text-pink-300 underline font-semibold text-[11px] cursor-pointer"
                  >
                    Edit Message & Toggle
                  </button>
                </div>
                <p className="font-mono text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800 leading-relaxed text-[11px]">
                  {stats?.maintenance_message ||
                    'The Elephant House AR Game is currently undergoing scheduled maintenance. Please check back shortly!'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 7. SECURITY & ADMIN USERS TAB */}
        {activeTab === 'security' && (
          <div className="w-full space-y-6">
            {/* Admin Accounts Management Card */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                    <UserCog className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-black text-white">Administrator Accounts</h3>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-extrabold border border-slate-700">
                        {adminAccounts.length} Admins
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Authorized users with full administrative access to the Elephant House control center.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setNewAdminName('');
                    setNewAdminEmail('');
                    setNewAdminPassword('');
                    setNewAdminConfirmPass('');
                    setCreateAdminMsg(null);
                    setShowAddAdminModal(true);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-pink-600/20 transition-all cursor-pointer flex-shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add New Admin</span>
                </button>
              </div>

              {/* Admins Table */}
              <div className="overflow-x-auto">
                {loadingAdmins ? (
                  <div className="py-10 text-center">
                    <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-xs text-slate-400">Loading admin users...</p>
                  </div>
                ) : adminAccounts.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400">
                    No admin accounts found.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs min-w-[650px]">
                    <thead className="bg-slate-800/60 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-700/60">
                      <tr>
                        <th className="py-3 px-4 rounded-l-xl whitespace-nowrap">Admin Profile</th>
                        <th className="py-3 px-4 whitespace-nowrap">Email Address</th>
                        <th className="py-3 px-4 whitespace-nowrap">Role / Access</th>
                        <th className="py-3 px-4 whitespace-nowrap">Created Date</th>
                        <th className="py-3 px-4 text-right rounded-r-xl whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {adminAccounts.map((admin) => {
                        const isSelf = admin.id === currentAdminId;
                        return (
                          <tr key={admin.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/40 text-pink-400 font-black flex items-center justify-center text-xs flex-shrink-0">
                                  {admin.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-extrabold text-white text-xs whitespace-nowrap">{admin.name}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-300 text-xs">
                              <div className="flex items-center space-x-2">
                                <span>{admin.email}</span>
                                {isSelf && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold text-[10px] tracking-wide whitespace-nowrap">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                                    YOU (CURRENT)
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 text-[10px] font-bold whitespace-nowrap">
                                <Shield className="w-3 h-3 text-pink-400" />
                                <span>Administrator</span>
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 font-mono text-xs whitespace-nowrap">
                              {admin.created_at ? new Date(admin.created_at).toLocaleDateString('en-GB') : 'System Default'}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => handleOpenEditAdmin(admin)}
                                  className="p-1.5 rounded-lg bg-blue-950/30 hover:bg-blue-900/50 text-blue-300 border border-blue-800/30 hover:border-blue-600 transition-all cursor-pointer inline-flex items-center justify-center"
                                  title="Edit Admin Account"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                {isSelf ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-800/80 text-slate-400 text-[10px] font-semibold border border-slate-700/50 whitespace-nowrap">
                                    Active Session
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleDeleteAdmin(admin)}
                                    disabled={deletingAdminId === admin.id || adminAccounts.length <= 1}
                                    className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/50 text-red-300 border border-red-800/30 hover:border-red-600 transition-all disabled:opacity-40 cursor-pointer inline-flex items-center justify-center"
                                    title="Delete Admin Account"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
              <div>
                <h3 className="text-base font-black text-white flex items-center space-x-2">
                  <KeyRound className="w-5 h-5 text-pink-500" />
                  <span>Change Your Login Password</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ensure your administrative credentials are secure. Updating your password will take effect immediately.
                </p>
              </div>

              {passwordMsg && (
                <div className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center space-x-2 ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-800 text-rose-300'
                }`}>
                  {passwordMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        placeholder="Enter current password"
                        value={currentPasswordInput}
                        onChange={(e) => setCurrentPasswordInput(e.target.value)}
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                      >
                        {showCurrentPass ? <EyeOff className="w-4 h-4 text-pink-400" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      New Password (min 6 characters)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        placeholder="Enter new strong password"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4 text-pink-400" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        placeholder="Re-type new password"
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                        title={showConfirmPass ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPass ? <EyeOff className="w-4 h-4 text-pink-400" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white font-extrabold rounded-xl shadow-lg shadow-pink-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 text-xs md:text-sm"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isUpdatingPassword ? 'Updating Password...' : 'Save New Password'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Add New Administrator */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 text-white shadow-2xl">
            <button
              onClick={() => setShowAddAdminModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Create Admin Account</h3>
                <p className="text-xs text-slate-400">Grant administrative access</p>
              </div>
            </div>

            {createAdminMsg && (
              <div className={`mb-4 p-3 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${
                createAdminMsg.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-800 text-rose-300'
              }`}>
                {createAdminMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{createAdminMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Silva"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. john@elephanthouse.lk"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Password (min 6 chars)
                </label>
                <div className="relative">
                  <input
                    type={showNewAdminPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewAdminPass(!showNewAdminPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                  >
                    {showNewAdminPass ? <EyeOff className="w-4 h-4 text-pink-400" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showNewAdminConfirmPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newAdminConfirmPass}
                    onChange={(e) => setNewAdminConfirmPass(e.target.value)}
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewAdminConfirmPass(!showNewAdminConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                  >
                    {showNewAdminConfirmPass ? <EyeOff className="w-4 h-4 text-pink-400" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAdmin}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-pink-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  {isCreatingAdmin ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Create Admin</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Player */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 text-white shadow-2xl">
            <button
              onClick={() => { setEditingPlayer(null); setPlayerEditMsg(null); }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Pencil className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Edit Player Profile</h3>
                <p className="text-xs text-slate-400">Player ID #{editingPlayer.id}</p>
              </div>
            </div>

            {playerEditMsg && (
              <div className={`mb-4 p-3 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${
                playerEditMsg.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-800 text-rose-300'
              }`}>
                {playerEditMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{playerEditMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePlayer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Player Name
                </label>
                <input
                  type="text"
                  value={editPlayerName}
                  onChange={(e) => setEditPlayerName(e.target.value)}
                  required
                  placeholder="Player Full Name"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={editPlayerMobile}
                    onChange={(e) => setEditPlayerMobile(e.target.value)}
                    required
                    placeholder="07XXXXXXXX"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={editPlayerEmail}
                    onChange={(e) => setEditPlayerEmail(e.target.value)}
                    placeholder="player@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setEditingPlayer(null); setPlayerEditMsg(null); }}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPlayer}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  {isUpdatingPlayer ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Administrator */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 text-white shadow-2xl">
            <button
              onClick={() => { setEditingAdmin(null); setAdminEditMsg(null); }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Pencil className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Edit Administrator</h3>
                <p className="text-xs text-slate-400">Update account details</p>
              </div>
            </div>

            {adminEditMsg && (
              <div className={`mb-4 p-3 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${
                adminEditMsg.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-800 text-rose-300'
              }`}>
                {adminEditMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{adminEditMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editAdminName}
                  onChange={(e) => setEditAdminName(e.target.value)}
                  required
                  placeholder="Admin Name"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  value={editAdminEmail}
                  onChange={(e) => setEditAdminEmail(e.target.value)}
                  required
                  placeholder="admin@elephanthouse.lk"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  New Password (leave blank to keep unchanged)
                </label>
                <div className="relative">
                  <input
                    type={showEditAdminPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={editAdminPassword}
                    onChange={(e) => setEditAdminPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditAdminPass(!showEditAdminPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                  >
                    {showEditAdminPass ? <EyeOff className="w-4 h-4 text-blue-400" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setEditingAdmin(null); setAdminEditMsg(null); }}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingAdmin}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  {isUpdatingAdmin ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Maintenance Mode Confirmation Dialog */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 text-white shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setShowMaintenanceModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon Header */}
            <div className="flex flex-col items-center text-center mb-5">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 border ${
                  stats?.maintenance_mode
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
                }`}
              >
                {stats?.maintenance_mode ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : (
                  <AlertTriangle className="w-8 h-8" />
                )}
              </div>

              <h2 className="text-xl font-black text-white">
                {stats?.maintenance_mode
                  ? 'Disable Maintenance Mode?'
                  : 'Enable Maintenance Mode?'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                {stats?.maintenance_mode
                  ? 'The Elephant House AR Game will be brought back LIVE for all players immediately.'
                  : 'Activating maintenance will immediately LOCK the game for all players and display the maintenance notice.'}
              </p>
            </div>

            {/* Optional Custom Message input when enabling */}
            {!stats?.maintenance_mode && (
              <div className="mb-5">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Public Notice Message for Players:
                </label>
                <textarea
                  rows={3}
                  value={maintenanceMsgInput}
                  onChange={(e) => setMaintenanceMsgInput(e.target.value)}
                  placeholder="Enter message for players..."
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none placeholder:text-slate-500"
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowMaintenanceModal(false)}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmToggleMaintenance}
                disabled={isTogglingMaintenance}
                className={`py-3 px-4 rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50 ${
                  stats?.maintenance_mode
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>
                  {isTogglingMaintenance
                    ? 'Processing...'
                    : stats?.maintenance_mode
                    ? 'Bring Live'
                    : 'Lock Game'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Logout Confirmation Dialog */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 text-white shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon Header */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-3.5 shadow-lg shadow-rose-500/10">
                <LogOut className="w-7 h-7 ml-0.5" />
              </div>

              <h2 className="text-xl font-black text-white">
                Sign Out of Portal?
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-xs">
                Are you sure you want to end your administrative session? You will need your credentials to log in again.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmLogout}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Player Confirmation Dialog */}
      {playerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 text-white shadow-2xl">
            <button
              onClick={() => { setPlayerToDelete(null); setDeleteDialogError(null); }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-3.5 shadow-lg shadow-rose-500/10">
                <Trash2 className="w-8 h-8" />
              </div>

              <h2 className="text-xl font-black text-white">
                Delete Player Account?
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Are you sure you want to permanently delete player{' '}
                <strong className="text-white">"{playerToDelete.name}"</strong>{' '}
                <span className="font-mono text-slate-400">({playerToDelete.mobile})</span>?
              </p>
            </div>

            <div className="p-3.5 bg-rose-950/40 rounded-2xl border border-rose-800/50 text-rose-300 text-xs flex items-start space-x-2.5 mb-5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed text-[11px]">
                This action is irreversible. All high score records, played game logs, and leaderboard rankings associated with this player will be wiped immediately.
              </span>
            </div>

            {deleteDialogError && (
              <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{deleteDialogError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setPlayerToDelete(null); setDeleteDialogError(null); }}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeletePlayer}
                disabled={isDeletingTarget}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                {isDeletingTarget ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Player</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Score Log Confirmation Dialog */}
      {scoreToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 text-white shadow-2xl">
            <button
              onClick={() => { setScoreToDelete(null); setDeleteDialogError(null); }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-3.5 shadow-lg shadow-amber-500/10">
                <Trash2 className="w-8 h-8" />
              </div>

              <h2 className="text-xl font-black text-white">
                Delete Score Record #{scoreToDelete.id}?
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Delete the game log of <strong className="text-amber-300">{scoreToDelete.score} marks</strong> achieved by{' '}
                <strong className="text-white">{scoreToDelete.user?.name || `User #${scoreToDelete.user_id}`}</strong>?
              </p>
            </div>

            <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60 text-slate-300 text-xs flex items-start space-x-2.5 mb-5">
              <Gamepad2 className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed text-[11px]">
                The player's leaderboard high score will automatically recalculate to their next best score.
              </span>
            </div>

            {deleteDialogError && (
              <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{deleteDialogError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setScoreToDelete(null); setDeleteDialogError(null); }}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteScore}
                disabled={isDeletingTarget}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                {isDeletingTarget ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Record</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Admin Confirmation Dialog */}
      {adminToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 text-white shadow-2xl">
            <button
              onClick={() => { setAdminToDelete(null); setDeleteDialogError(null); }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-3.5 shadow-lg shadow-rose-500/10">
                <Trash2 className="w-8 h-8" />
              </div>

              <h2 className="text-xl font-black text-white">
                Remove Administrator?
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Are you sure you want to remove administrator{' '}
                <strong className="text-white">"{adminToDelete.name}"</strong>{' '}
                <span className="font-mono text-slate-400">({adminToDelete.email})</span>?
              </p>
            </div>

            <div className="p-3.5 bg-rose-950/40 rounded-2xl border border-rose-800/50 text-rose-300 text-xs flex items-start space-x-2.5 mb-5">
              <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed text-[11px]">
                This administrator will immediately lose access to the Elephant House Control Center.
              </span>
            </div>

            {deleteDialogError && (
              <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{deleteDialogError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setAdminToDelete(null); setDeleteDialogError(null); }}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteAdmin}
                disabled={isDeletingTarget}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                {isDeletingTarget ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Remove Admin</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
