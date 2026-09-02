'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '../types/game';
import { api } from '../lib/api';
import { Sparkles, User, Phone, Play, Trophy, AlertCircle, ArrowRight } from 'lucide-react';
import CartoonAvatar from './CartoonAvatar';

interface Props {
  onStartGame: (player: Player) => void;
  onOpenLeaderboard: () => void;
}

export default function OnboardingModal({ onStartGame, onOpenLeaderboard }: Props) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cachedPlayer, setCachedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('eh_player');
      if (stored) {
        const player = JSON.parse(stored);
        setCachedPlayer(player);
        if (player.name) setName(player.name);
        if (player.mobile) setMobile(player.mobile);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanMobile = mobile.trim().replace(/[\s-]/g, '');

    if (!cleanName) {
      setError('Please enter your full name');
      return;
    }
    if (!cleanMobile || cleanMobile.length < 8) {
      setError('Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await api.authPlayer({
        name: cleanName,
        mobile: cleanMobile
      });

      if (res.player) {
        localStorage.setItem('eh_player', JSON.stringify(res.player));
        onStartGame(res.player);
      } else {
        setError(res.message || 'Could not start game');
      }
    } catch (err: unknown) {
      console.warn('API Auth fallback, starting local player profile:', err);
      const instantPlayer: Player = {
        id: cachedPlayer?.id || Math.floor(Math.random() * 1000000) + 1,
        name: cleanName,
        mobile: cleanMobile,
        highest_score: cachedPlayer?.highest_score || 0,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('eh_player', JSON.stringify(instantPlayer));
      onStartGame(instantPlayer);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto select-none">
      {/* Wonder Gates Full Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-100 transition-transform duration-1000"
        style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_BASE_PATH || ''}/wonder_background.jpg)` }}
      />
      {/* Subtle cinematic gradient vignette & ambient light overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-slate-950/70 backdrop-blur-[1.5px]" />

      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/25 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      <div className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-white/50 dark:border-slate-700/80 p-6 md:p-8 text-slate-800 dark:text-slate-100 transform transition-all duration-300">
        
        {/* Top Elephant House WONDER Branding Logo */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-full max-w-[260px] sm:max-w-[290px] h-18 sm:h-22 flex items-center justify-center mb-2 transform hover:scale-105 transition-transform duration-300">
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/wonder_logo.png`}
              alt="Elephant House Wonder"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>

          <p className="text-xs uppercase tracking-widest font-extrabold text-pink-600 dark:text-pink-400 mt-0.5">
            Tongue Catch Ice Cream Game
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs">
            Open camera & catch falling popsicles with your mouth & tongue to score! 🍦👅
          </p>
        </div>

        {/* Quick Resume Profile Pill if cached */}
        {cachedPlayer && (
          <div className="mb-4 bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800/50 rounded-2xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5 truncate">
              <CartoonAvatar name={cachedPlayer.name} size="sm" className="w-9 h-9 flex-shrink-0 shadow-md ring-2 ring-pink-500/40" />
              <div className="truncate">
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  <span className="md:hidden">Welcome back!</span>
                  <span className="hidden md:inline">Welcome back, {cachedPlayer.name}</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {(cachedPlayer.highest_score || 0) > 0 ? (
                    <>
                      High Score: <span className="font-bold text-pink-600 dark:text-pink-400">{cachedPlayer.highest_score} pts</span>
                    </>
                  ) : (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Ready to set your first high score! 🎯</span>
                  )}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onStartGame(cachedPlayer)}
              className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1 shadow-sm transition-all active:scale-95 flex-shrink-0 cursor-pointer"
            >
              <span>Play Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Name & Mobile Player Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-pink-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Kasun Perera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-pink-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="e.g. 0771234567"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                maxLength={20}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>

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
                <span>Start Game</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-bold hover:underline py-1 px-3 rounded-xl hover:bg-amber-500/10 transition-colors cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span>Hall of Fame Leaderboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
