'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '../types/game';
import { api } from '../lib/api';
import OnboardingModal from '../components/OnboardingModal';
import GameCanvas from '../components/GameCanvas';
import LeaderboardModal from '../components/LeaderboardModal';
import { RefreshCw } from 'lucide-react';

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
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    return (
      <main className="min-h-screen bg-[#fa4ba0] text-slate-800 flex flex-col justify-between relative overflow-hidden select-none">
        {/* Full Artwork Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <img
            src={`${basePath}/maintenance_art.png?v=1`}
            alt="Elephant House Maintenance"
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle bottom gradient to ensure bottom controls are always readable */}
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/45 via-black/15 to-transparent pointer-events-none" />
        </div>

        {/* Top Header Bar */}
        <header className="relative z-10 flex items-center justify-between w-full max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
          <div className="flex items-center space-x-2.5 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-pink-200/80 shadow-md">
            <div className="w-7 h-7 rounded-xl bg-white p-0.5 shadow-xs border border-pink-100 flex items-center justify-center">
              <img
                src={`${basePath}/logo.png`}
                alt="Elephant House"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xs font-black tracking-tight text-slate-800">
              Elephant House <span className="text-pink-600">WONDER</span>
            </span>
          </div>
        </header>

        {/* Center Space: Artwork's signboard speaks for itself */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pointer-events-none" />

        {/* Bottom Interactive Bar: Status & Refresh */}
        <footer className="relative z-10 w-full flex flex-col items-center justify-center px-4 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] pt-2 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-center gap-2.5 max-w-sm w-full">
            <button
              onClick={checkStatus}
              disabled={checkingStatus}
              className="w-full py-3 px-6 bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white font-black rounded-full shadow-lg shadow-pink-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 text-xs sm:text-sm active:scale-95 border border-white/30"
            >
              <RefreshCw className={`w-4 h-4 ${checkingStatus ? 'animate-spin' : ''}`} />
              <span>{checkingStatus ? 'Checking Status...' : 'Check Status & Refresh'}</span>
            </button>
          </div>
        </footer>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
      {/* If no active player, show onboarding registration/login modal */}
      {!currentPlayer ? (
        <OnboardingModal
          onStartGame={handleStartGame}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
        />
      ) : (
        <GameCanvas
          player={currentPlayer}
          onEndGame={() => {}}
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
