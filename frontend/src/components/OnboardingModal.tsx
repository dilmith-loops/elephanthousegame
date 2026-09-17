'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '../types/game';
import { api } from '../lib/api';
import { Trophy, AlertCircle, Sparkles } from 'lucide-react';

interface Props {
  onStartGame: (player: Player) => void;
  onOpenLeaderboard: () => void;
}

export default function OnboardingModal({ onStartGame, onOpenLeaderboard }: Props) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cachedPlayer, setCachedPlayer] = useState<Player | null>(null);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  // Load cached player
  useEffect(() => {
    try {
      const stored = localStorage.getItem('eh_player');
      if (stored) {
        const player = JSON.parse(stored);
        setCachedPlayer(player);
        if (player.name) setName(player.name);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();

    if (!cleanName) {
      setError('Please enter your player name');
      return;
    }

    setLoading(true);
    try {
      const res = await api.authPlayer({
        name: cleanName
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
    <div className="fixed inset-0 z-50 flex flex-col justify-between select-none overflow-hidden bg-[#fa4ba0]">
      {/* High-Resolution Brand Background Asset (Responsive Desktop & Mobile) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Mobile background (portrait) */}
        <img
          src={`${basePath}/onboarding_bg.png?v=6`}
          alt="Tropical Ice Cream Background"
          className="md:hidden absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />
        {/* Desktop background (wide landscape with flanking popsicles) */}
        <img
          src={`${basePath}/onboarding_bg_desktop.png?v=6`}
          alt="Tropical Ice Cream Background Desktop"
          className="hidden md:block absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />
      </div>

      {/* Mobile-Only Top Floating Navigation Bar (Safely anchored above poster) */}
      <div
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
        className="sm:hidden fixed inset-x-3.5 z-40 flex items-center justify-between pointer-events-none"
      >
        {cachedPlayer ? (
          <div className="pointer-events-auto flex items-center space-x-1.5 bg-white/95 backdrop-blur-md border border-pink-200/80 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 shadow-sm max-w-[55%] truncate">
            <Sparkles className="w-3.5 h-3.5 text-pink-500 fill-pink-500 flex-shrink-0" />
            <span className="truncate">
              Hi, <strong className="text-pink-950 font-black">{cachedPlayer.name}</strong>
            </span>
          </div>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={onOpenLeaderboard}
          className="pointer-events-auto bg-white/95 backdrop-blur-md text-amber-950 px-3.5 py-1.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.15)] text-xs font-black flex items-center space-x-1.5 border border-amber-300/80 active:scale-95 transition-all cursor-pointer"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Leaderboard</span>
        </button>
      </div>

      {/* 1. Global Desktop Header Bar */}
      <header className="hidden sm:flex items-center justify-between w-full max-w-6xl mx-auto px-6 py-3.5 z-30 flex-shrink-0">
        {/* Brand identity badge */}
        <div className="flex items-center space-x-3 bg-white/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-pink-200/80 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-white p-1 shadow-xs border border-pink-100 flex items-center justify-center">
            <img
              src={`${basePath}/logo.png`}
              alt="Elephant House"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-black tracking-tight text-slate-800">
                Elephant House <span className="text-pink-600">WONDER</span>
              </span>
              <span className="bg-pink-100 text-pink-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-pink-200">
                AR Game
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Catch delicious popsicles with your tongue!</p>
          </div>
        </div>

        {/* Right Action: Welcome Pill + Leaderboard Button */}
        <div className="flex items-center space-x-3">
          {cachedPlayer && (
            <div className="flex items-center space-x-2 bg-white/85 backdrop-blur-md border border-pink-200/80 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
              <span>
                Welcome back, <strong className="text-pink-950 font-black">{cachedPlayer.name}</strong>
              </span>
              {Boolean(cachedPlayer.highest_score) && (
                <span className="text-amber-700 font-black ml-1 bg-amber-100 px-2 py-0.5 rounded-full text-[11px] border border-amber-300/50">
                  ★ {cachedPlayer.highest_score}
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* 2. Main Center Hero Stage */}
      <main className="w-full flex-1 flex items-center justify-center relative z-20 px-2 sm:px-6 pt-[calc(env(safe-area-inset-top,0px)+52px)] pb-[calc(env(safe-area-inset-bottom,0px)+12px)] sm:py-2 overflow-hidden">
        <div className="relative w-full max-w-6xl flex items-center justify-center h-full max-h-[85vh]">
          

          {/* Center Phone Showcase Frame */}
          <div
            className="relative flex items-center justify-center flex-shrink-0 select-none"
            style={{
              width: 'min(92vw, calc(80vh * 576 / 1024))',
              aspectRatio: '576 / 1024',
              maxHeight: '80vh',
            }}
          >
            {/* Sleek Outer Glow Bezel & Rounded Card Frame */}
            <div className="relative w-full h-full rounded-[26px] sm:rounded-[34px] overflow-hidden shadow-[0_20px_60px_-15px_rgba(244,63,94,0.35),0_10px_25px_rgba(0,0,0,0.08)] ring-4 ring-white/95 bg-pink-100 flex flex-col justify-between">
              
              {/* Authentic High-Resolution Artwork Background */}
              <img
                src={`${basePath}/wonder_onboarding_art.png`}
                alt="Elephant House Wonder Onboarding"
                className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
              />

              {/* Validation Error Toast Alert */}
              {error && (
                <div className="absolute left-[14%] right-[14%] top-[50%] z-30 bg-rose-600 text-white px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold shadow-lg shadow-rose-950/30 flex items-center justify-center space-x-1.5 animate-bounce">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{error}</span>
                </div>
              )}

              {/* Interactive Form Controls Overlay (Pixel-matched with inner input pill and 3D play button) */}
              <form onSubmit={handleSubmit} className="absolute inset-0 z-20 pointer-events-none">
                {/* Player Name Input: Seamless transparent overlay over the artwork's 3D pill */}
                <div
                  className="absolute pointer-events-auto flex items-center justify-center"
                  style={{ left: '16.67%', top: '63.67%', width: '66.32%', height: '7.81%' }}
                >
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name..."
                    maxLength={30}
                    required
                    autoComplete="name"
                    className="w-full h-full bg-transparent text-[#701047] font-black text-sm sm:text-base md:text-lg rounded-full px-5 shadow-none border-0 outline-none focus:outline-none transition-all placeholder:text-pink-300 placeholder:font-bold text-center selection:bg-pink-300 selection:text-pink-950"
                  />
                </div>

                {/* PLAY NOW! Button Overlay */}
                <div
                  className="absolute pointer-events-auto"
                  style={{ left: '19.97%', top: '74.22%', width: '59.90%', height: '12.70%' }}
                >
                  <button
                    type="submit"
                    disabled={loading}
                    aria-label="Play Now"
                    className="w-full h-full rounded-full cursor-pointer transition-transform duration-150 hover:scale-[1.03] active:scale-[0.96] disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center select-none bg-transparent"
                  >
                    {loading && (
                      <div className="flex items-center space-x-2 bg-pink-950/85 backdrop-blur-md px-4 py-2 rounded-full text-white shadow-xl">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-black tracking-wider uppercase">STARTING...</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
