'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '../types/game';
import { api } from '../lib/api';
import { Trophy, AlertCircle, Sparkles, Camera, Smile, Flame, ChevronRight, Gamepad2 } from 'lucide-react';

interface Props {
  onStartGame: (player: Player) => void;
  onOpenLeaderboard: () => void;
}

export default function OnboardingModal({ onStartGame, onOpenLeaderboard }: Props) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cachedPlayer, setCachedPlayer] = useState<Player | null>(null);
  const [topLeaders, setTopLeaders] = useState<Player[]>([]);

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  // Load cached player and top leaders
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

    // Fetch top 3 leaders for the desktop side spotlight
    api.getLeaderboard(3)
      .then((res) => {
        if (res.leaderboard && res.leaderboard.length > 0) {
          setTopLeaders(res.leaderboard.slice(0, 3));
        }
      })
      .catch(() => {
        // quiet fallback
      });
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
    <div className="fixed inset-0 z-50 flex flex-col justify-between select-none overflow-hidden bg-[radial-gradient(ellipse_at_50%_45%,_#fff0f4_0%,_#ffe9ef_30%,_#fff3db_65%,_#ffedb8_100%)]">
      {/* Radiant Sunburst Background Rays */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          background: 'repeating-conic-gradient(from 0deg at 50% 45%, rgba(255, 182, 193, 0.4) 0deg 12deg, transparent 12deg 24deg)'
        }}
      />

      {/* Ambient glowing color orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/6 w-[480px] h-[480px] bg-pink-300/25 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/6 w-[480px] h-[480px] bg-amber-300/25 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* Ambient Floating Decorative Treats on Desktop */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none overflow-hidden z-10">
        <div className="absolute top-24 left-16 text-3xl animate-float opacity-75">🍦</div>
        <div className="absolute bottom-32 left-28 text-2xl animate-float-reverse opacity-60">✨</div>
        <div className="absolute top-28 right-20 text-3xl animate-float-slow opacity-80">🍊</div>
        <div className="absolute bottom-28 right-24 text-4xl animate-float opacity-70">🐼</div>
      </div>

      {/* 1. Global Desktop Header Bar */}
      <header className="hidden sm:flex items-center justify-between w-full max-w-6xl mx-auto px-6 py-3.5 z-30 flex-shrink-0">
        {/* Brand identity badge */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md p-1.5 shadow-sm border border-pink-200/80 flex items-center justify-center">
            <img
              src={`${basePath}/logo.png`}
              alt="Elephant House"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-black tracking-tight text-slate-800">
                Elephant House <span className="text-pink-600">WONDER</span>
              </span>
              <span className="bg-pink-100 text-pink-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-pink-200">
                AR Game
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Catch delicious popsicles with your tongue!</p>
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

          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 active:scale-95 text-slate-950 px-4 py-2 rounded-full shadow-[0_4px_12px_rgba(245,158,11,0.25)] text-xs font-black flex items-center space-x-2 transition-all hover:scale-105 cursor-pointer border border-amber-300/60"
          >
            <Trophy className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>Leaderboard</span>
          </button>
        </div>
      </header>

      {/* 2. Main Center Hero Stage */}
      <main className="w-full flex-1 flex items-center justify-center relative z-20 px-2 sm:px-6 py-1 sm:py-2 overflow-hidden">
        <div className="w-full max-w-6xl flex items-center justify-center lg:justify-between gap-6 xl:gap-10 h-full max-h-[85vh]">
          
          {/* Left Flank: How To Play Guide (Visible on large desktop) */}
          <div className="hidden lg:flex w-72 xl:w-80 flex-col gap-4 justify-center z-30">
            {/* Guide Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-pink-200/80 rounded-3xl p-5 shadow-[0_15px_35px_rgba(244,63,94,0.08)]">
              <div className="flex items-center space-x-2 text-pink-600 font-black text-xs uppercase tracking-wider mb-3">
                <Gamepad2 className="w-4 h-4" />
                <span>How To Play</span>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Face the Camera</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">Allow camera access and keep your face visible in frame.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Smile className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Stick Your Tongue Out</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">Open mouth & stick tongue out to activate the puppy tongue filter!</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Touch & Catch Treats</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">Physical contact between your tongue & the popsicle scores marks!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pro Tip Card */}
            <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-pink-500/15 backdrop-blur-md border border-amber-300/60 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center space-x-2 text-amber-900 font-extrabold text-xs mb-1">
                <Flame className="w-4 h-4 text-amber-600 fill-amber-500 animate-pulse" />
                <span>Combo Multiplier!</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Catch popsicles consecutively without missing to rack up 2x, 3x, and 4x score multipliers!
              </p>
            </div>
          </div>

          {/* Center Phone Showcase Frame */}
          <div
            className="relative flex items-center justify-center flex-shrink-0 select-none"
            style={{
              width: 'min(94vw, calc(84vh * 576 / 1024))',
              aspectRatio: '576 / 1024',
              maxHeight: '84vh',
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

              {/* Mobile-Only Top-Right Leaderboard Pill */}
              <div className="sm:hidden absolute top-3 right-3 z-30 pointer-events-auto">
                <button
                  type="button"
                  onClick={onOpenLeaderboard}
                  className="bg-white/90 backdrop-blur-md text-amber-900 px-3 py-1.5 rounded-full shadow-md text-xs font-black flex items-center space-x-1.5 border border-amber-300/80 active:scale-95 transition-all cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Leaderboard</span>
                </button>
              </div>

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

          {/* Right Flank: Live Leaderboard Spotlight (Visible on large desktop) */}
          <div className="hidden lg:flex w-72 xl:w-80 flex-col gap-4 justify-center z-30">
            {/* Top Champions Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-amber-200/80 rounded-3xl p-5 shadow-[0_15px_35px_rgba(245,158,11,0.08)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-amber-700 font-black text-xs uppercase tracking-wider">
                  <Trophy className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Hall of Fame</span>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  Top Scores
                </span>
              </div>

              {/* Leaders List */}
              <div className="space-y-2.5 mb-4">
                {topLeaders.length > 0 ? (
                  topLeaders.map((leader, idx) => {
                    const medalColors = [
                      'from-amber-400 to-amber-500 text-slate-950',
                      'from-slate-300 to-slate-400 text-slate-900',
                      'from-amber-700 to-amber-800 text-white'
                    ];
                    return (
                      <div
                        key={leader.id || idx}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/90 border border-slate-100/80"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${medalColors[idx] || 'from-slate-200 to-slate-300 text-slate-700'} text-[11px] font-black flex items-center justify-center shadow-xs flex-shrink-0`}>
                            {idx + 1}
                          </div>
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {leader.name}
                          </span>
                        </div>
                        <span className="text-xs font-black text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-lg ml-2 flex-shrink-0">
                          {leader.highest_score} pts
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400 font-medium">
                    Be the first to set a high score today!
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onOpenLeaderboard}
                className="w-full py-2 bg-gradient-to-r from-amber-50 to-pink-50 hover:from-amber-100 hover:to-pink-100 border border-amber-200/80 rounded-2xl text-xs font-black text-amber-900 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <span>View Full Leaderboard</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer spacer / subtle brand copyright */}
      <footer className="w-full text-center py-2 text-[10px] text-slate-400 font-medium z-20 flex-shrink-0">
        © Elephant House Ceylon Cold Stores PLC • Wonder AR Experience
      </footer>
    </div>
  );
}
