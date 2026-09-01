'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '../types/game';
import { api } from '../lib/api';
import OnboardingModal from '../components/OnboardingModal';
import GameCanvas from '../components/GameCanvas';
import LeaderboardModal from '../components/LeaderboardModal';
import { Wrench, RefreshCw, Sparkles, Clock, AlertTriangle } from 'lucide-react';

export default function HomePage() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>('');
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check Game Status / Maintenance Mode on Mount
  const checkStatus = async () => {
    setCheckingStatus(true);
    try {
      const res = await api.getGameStatus();
      setIsMaintenance(Boolean(res.maintenance_mode));
      if (res.maintenance_message) {
        setMaintenanceMessage(res.maintenance_message);
      }
    } catch (err) {
      console.warn('Status check fallback:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleStartGame = (player: Player) => {
    setCurrentPlayer(player);
  };

  const handleChangePlayer = () => {
    setCurrentPlayer(null);
  };

  // Maintenance Screen
  if (isMaintenance) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center relative overflow-hidden p-4 select-none">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

        {/* Floating Decorative Emojis */}
        <div className="absolute top-16 left-12 text-6xl opacity-15 animate-bounce pointer-events-none">
          🍦
        </div>
        <div className="absolute top-1/3 right-16 text-7xl opacity-15 animate-pulse pointer-events-none">
          🍧
        </div>
        <div className="absolute bottom-20 left-20 text-6xl opacity-20 animate-spin pointer-events-none">
          🍭
        </div>

        {/* Maintenance Box */}
        <div className="relative w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl border border-rose-500/30 rounded-3xl p-8 md:p-10 shadow-2xl text-center z-10">
          {/* Brand Logo Badge */}
          <div className="w-24 h-24 mx-auto mb-6 bg-white dark:bg-slate-800 rounded-3xl p-2 shadow-2xl shadow-rose-500/20 flex items-center justify-center border border-white/60 dark:border-slate-700/80 transform hover:scale-105 transition-transform">
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/logo.png`}
              alt="Elephant House"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-black tracking-wider uppercase mb-3">
            <Wrench className="w-3.5 h-3.5" />
            <span>Scheduled Maintenance</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-rose-500 via-pink-400 to-amber-400 bg-clip-text text-transparent mb-3">
            Game Temporarily Unavailable
          </h1>

          <p className="text-slate-300 text-xs md:text-sm max-w-md mx-auto leading-relaxed mb-6">
            {maintenanceMessage ||
              'The Elephant House AR Game is currently undergoing scheduled maintenance and experience upgrades. Please check back in a few moments!'}
          </p>

          <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 text-xs text-slate-400 mb-6 flex items-center justify-center space-x-2">
            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Maintenance is actively underway by the Elephant House team.</span>
          </div>

          <button
            onClick={checkStatus}
            disabled={checkingStatus}
            className="w-full py-3.5 bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white font-extrabold rounded-2xl shadow-lg shadow-pink-500/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${checkingStatus ? 'animate-spin' : ''}`} />
            <span>{checkingStatus ? 'Checking Status...' : 'Check Status & Refresh'}</span>
          </button>

          <p className="text-[11px] text-slate-500 mt-6 pt-4 border-t border-slate-800/80">
            Elephant House Ice Cream AR Experience
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
      {/* If no active player, show onboarding registration/login modal */}
      {!currentPlayer ? (
        <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-4 bg-radial from-pink-900/30 via-slate-950 to-slate-950">
          {/* Animated Popsicle floating background decorations */}
          <div className="absolute top-12 left-10 text-5xl opacity-20 animate-bounce pointer-events-none">
            🍦
          </div>
          <div className="absolute top-1/3 right-12 text-6xl opacity-20 animate-pulse pointer-events-none">
            🍧
          </div>
          <div className="absolute bottom-16 left-16 text-5xl opacity-25 animate-spin pointer-events-none">
            🍭
          </div>
          <div className="absolute bottom-24 right-20 text-6xl opacity-20 animate-bounce pointer-events-none">
            🍨
          </div>

          <OnboardingModal
            onStartGame={handleStartGame}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
          />
        </div>
      ) : (
        <GameCanvas
          player={currentPlayer}
          isPaused={showLeaderboard}
          onEndGame={() => {}}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onChangePlayer={handleChangePlayer}
        />
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}
    </main>
  );
}
