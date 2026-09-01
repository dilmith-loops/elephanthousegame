'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '../types/game';
import { api } from '../lib/api';
import { Sparkles, Phone, User, Mail, Play, Trophy, IceCream, AlertCircle, ArrowRight } from 'lucide-react';

interface Props {
  onStartGame: (player: Player) => void;
  onOpenLeaderboard: () => void;
}

export default function OnboardingModal({ onStartGame, onOpenLeaderboard }: Props) {
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cachedPlayer, setCachedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('eh_player');
      if (stored) {
        const player = JSON.parse(stored);
        setCachedPlayer(player);
        setName(player.name || '');
        setMobile(player.mobile || '');
        setEmail(player.email || '');
        setMode('existing');
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const cleanMobile = mobile.trim().replace(/[\s-]/g, '');
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!cleanMobile || cleanMobile.length < 8) {
      setError('Please enter a valid mobile number');
      return;
    }
    if (mode === 'new') {
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await api.authPlayer({
        name: name.trim(),
        mobile: cleanMobile,
        email: mode === 'new' ? email.trim() : (email.trim() || undefined)
      });

      if (res.player) {
        onStartGame(res.player);
      } else {
        setError(res.message || 'Could not sign in');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      <div className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 dark:border-slate-800/80 p-6 md:p-8 text-slate-800 dark:text-slate-100 transform transition-all duration-300">
        
        {/* Top Elephant House Branding Badge */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3">
            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl p-2 shadow-xl shadow-pink-500/20 flex items-center justify-center border border-white/60 dark:border-slate-700/80 transform hover:scale-105 transition-transform">
              <img
                src="/logo.png"
                alt="Elephant House"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
              AR FUN
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 bg-clip-text text-transparent tracking-tight">
            ELEPHANT HOUSE
          </h1>
          <p className="text-xs uppercase tracking-widest font-extrabold text-pink-600 dark:text-pink-400 mt-0.5">
            Tongue Catch Ice Cream Game
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs">
            Open camera & catch falling popsicles with your mouth & tongue to score! 🍦👅
          </p>
        </div>

        {/* Quick Profile Pill if cached */}
        {cachedPlayer && (
          <div className="mb-4 bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800/50 rounded-2xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 truncate">
              <div className="w-7 h-7 rounded-full bg-pink-500 text-white font-bold flex items-center justify-center text-xs">
                {cachedPlayer.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">Welcome, {cachedPlayer.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">High Score: <span className="font-bold text-pink-600 dark:text-pink-400">{cachedPlayer.highest_score || 0} pts</span></p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onStartGame(cachedPlayer)}
              className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1 shadow-sm transition-all active:scale-95"
            >
              <span>Instant Play</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800/70 p-1 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => { setMode('new'); setError(null); }}
            className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-xl transition-all duration-200 ${
              mode === 'new'
                ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            New Player
          </button>
          <button
            type="button"
            onClick={() => { setMode('existing'); setError(null); }}
            className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-xl transition-all duration-200 ${
              mode === 'existing'
                ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Existing Player
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Player Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Kasun Perera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="e.g. 0771234567"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {mode === 'new' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="e.g. kasun@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 mt-2 bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white font-extrabold rounded-2xl shadow-lg shadow-pink-500/30 flex items-center justify-center space-x-2 transition-all transform active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed text-sm md:text-base cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>{mode === 'new' ? 'Register & Play Game' : 'Sign In & Play Game'}</span>
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-bold hover:underline"
          >
            <Trophy className="w-4 h-4" />
            <span>Leaderboard</span>
          </button>

          <a
            href="/admin"
            className="hover:text-pink-600 dark:hover:text-pink-400 font-medium transition-colors"
          >
            Admin Portal →
          </a>
        </div>
      </div>
    </div>
  );
}
