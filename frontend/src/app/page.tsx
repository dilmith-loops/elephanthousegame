'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '../types/game';
import { api } from '../lib/api';
import OnboardingModal from '../components/OnboardingModal';
import GameCanvas from '../components/GameCanvas';
import LeaderboardModal from '../components/LeaderboardModal';
import SocialShareModal from '../components/SocialShareModal';
import { trackGAEvent } from '../lib/analytics';
import { RefreshCw, Clock } from 'lucide-react';

export default function HomePage() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTestShare, setShowTestShare] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>('');
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('testShare')) {
      setShowTestShare(true);
    }
  }, []);

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
    trackGAEvent('game_start', {
      user_id: player.id,
      player_name: player.name
    });
  };

  const handleChangePlayer = () => {
    setCurrentPlayer(null);
  };

  const handleEndGame = (finalScore: number, newHighScore?: number) => {
    setCurrentPlayer((prev) => {
      if (!prev) return null;
      const targetHigh = typeof newHighScore === 'number'
        ? Math.max(prev.highest_score || 0, newHighScore)
        : Math.max(prev.highest_score || 0, finalScore);
      return {
        ...prev,
        highest_score: targetHigh
      };
    });
  };

  // Auto-poll game status every 15s when maintenance is active
  useEffect(() => {
    if (!isMaintenance) return;
    const interval = setInterval(() => {
      checkStatus();
    }, 15000);
    return () => clearInterval(interval);
  }, [isMaintenance]);

  // Maintenance Screen
  if (isMaintenance) {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    return (
      <main className="min-h-screen bg-[#fa4ba0] text-slate-800 flex flex-col justify-between relative overflow-hidden select-none">
        
        {/* ======================================================== */}
        {/* MOBILE & TABLET PORTRAIT VIEW (< lg)                     */}
        {/* ======================================================== */}
        <div className="lg:hidden relative z-10 flex flex-col justify-between items-center w-full min-h-screen px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
          {/* Mobile Portrait Background Asset */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
            <img
              src={`${basePath}/onboarding_bg.png?v=7`}
              alt="Elephant House Wonder Background"
              className="w-full h-full object-cover select-none pointer-events-none"
            />
            {/* Soft overlay to ensure readability */}
            <div className="absolute inset-0 bg-pink-950/20 backdrop-blur-[1px] pointer-events-none" />
          </div>

          {/* Mobile Header Bar */}
          <header className="flex items-center justify-between w-full max-w-sm mx-auto flex-shrink-0 gap-2">
            <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-pink-200/80 shadow-md min-w-0">
              <div className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-lg bg-white p-0.5 border border-pink-100 flex items-center justify-center flex-shrink-0">
                <img
                  src={`${basePath}/logo.png`}
                  alt="Elephant House"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[11px] sm:text-xs font-black tracking-tight text-slate-800 truncate">
                Elephant House <span className="text-pink-600">WONDER</span>
              </span>
            </div>

            <div className="flex items-center space-x-1.5 bg-white/95 backdrop-blur-md border border-amber-300 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-black text-amber-900 shadow-sm flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Maintenance</span>
            </div>
          </header>

          {/* Center Card with Uncropped Maintenance Artwork */}
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm py-2 sm:py-4 my-auto">
            {/* Artwork Card: 3:2 ratio framing the entire cute illustration without cutoffs */}
            <div className="w-full rounded-2xl sm:rounded-[24px] overflow-hidden shadow-[0_16px_50px_rgba(244,63,94,0.35),0_6px_20px_rgba(0,0,0,0.12)] ring-4 ring-white/95 bg-white flex flex-col select-none">
              <div className="relative aspect-[3/2] w-full overflow-hidden bg-pink-50">
                <img
                  src={`${basePath}/maintenance_art_mobile.png?v=1`}
                  alt="We'll be back soon!"
                  className="w-full h-full object-cover select-none"
                />
              </div>
            </div>

            {/* Custom Admin Status Message Notice Card */}
            <div className="w-full mt-2.5 sm:mt-3.5 bg-white/95 backdrop-blur-md border border-pink-200/80 rounded-2xl p-3 sm:p-4 shadow-md text-center">
              <div className="flex items-center justify-center space-x-1.5 text-pink-600 text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Status Update</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-snug sm:leading-relaxed">
                {maintenanceMessage ||
                  'The Elephant House AR Game is currently undergoing scheduled maintenance. Please check back shortly!'}
              </p>
            </div>
          </div>

          {/* Mobile Bottom Controls */}
          <footer className="w-full max-w-sm flex flex-col items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={checkStatus}
              disabled={checkingStatus}
              className="w-full py-3 sm:py-3.5 px-6 bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white font-black rounded-full shadow-lg shadow-pink-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 text-xs sm:text-sm active:scale-95 border border-white/30"
            >
              <RefreshCw className={`w-4 h-4 ${checkingStatus ? 'animate-spin' : ''}`} />
              <span>{checkingStatus ? 'Checking Status...' : 'Check Status & Refresh'}</span>
            </button>
            <span className="text-[10px] text-white/90 drop-shadow-sm font-medium select-none">
              Checking automatically in the background
            </span>
          </footer>
        </div>

        {/* ======================================================== */}
        {/* DESKTOP WIDESCREEN VIEW (>= lg)                          */}
        {/* ======================================================== */}
        <div className="hidden lg:flex flex-col justify-between w-full min-h-screen relative z-10 select-none">
          {/* Full Immersive 16:9 Artwork Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
            <img
              src={`${basePath}/maintenance_art.png?v=1`}
              alt="Elephant House Maintenance"
              className="w-full h-full object-cover object-center"
            />
            {/* Subtle bottom gradient to ensure bottom controls are always readable */}
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/45 via-black/15 to-transparent pointer-events-none" />
          </div>

          {/* Desktop Header Bar */}
          <header className="flex items-center justify-between w-full max-w-6xl mx-auto px-6 py-4 flex-shrink-0">
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

            <div className="flex items-center space-x-1.5 bg-white/90 backdrop-blur-md border border-amber-300 px-3.5 py-1.5 rounded-full text-xs font-black text-amber-900 shadow-md">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Scheduled Maintenance Active</span>
            </div>
          </header>

          {/* Desktop Center Space with Optional Admin Message Notification */}
          <div className="flex-1 flex flex-col items-center justify-end pb-8 pointer-events-none px-4">
            {maintenanceMessage && (
              <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-pink-200/80 rounded-full px-6 py-2.5 shadow-xl text-slate-800 text-xs sm:text-sm font-black flex items-center space-x-2 max-w-md text-center animate-fade-in">
                <Clock className="w-4 h-4 text-pink-600 flex-shrink-0" />
                <span>{maintenanceMessage}</span>
              </div>
            )}
          </div>

          {/* Desktop Bottom Controls */}
          <footer className="w-full flex flex-col items-center justify-center px-4 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] pt-2 flex-shrink-0">
            <div className="flex flex-col items-center gap-2 max-w-sm w-full">
              <button
                onClick={checkStatus}
                disabled={checkingStatus}
                className="w-full py-3 px-6 bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white font-black rounded-full shadow-lg shadow-pink-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 text-xs sm:text-sm active:scale-95 border border-white/30"
              >
                <RefreshCw className={`w-4 h-4 ${checkingStatus ? 'animate-spin' : ''}`} />
                <span>{checkingStatus ? 'Checking Status...' : 'Check Status & Refresh'}</span>
              </button>
              <span className="text-[10px] text-white/90 drop-shadow-sm font-medium select-none">
                Checking automatically in the background
              </span>
            </div>
          </footer>
        </div>

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
          onEndGame={handleEndGame}
          onChangePlayer={handleChangePlayer}
        />
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}

      {/* Social Share Modal */}
      {showTestShare && (
        <SocialShareModal
          isOpen={true}
          onClose={() => setShowTestShare(false)}
          playerName="Dilmith Ranasinghe"
          score={401}
          catches={28}
          maxCombo={8}
          durationSeconds={45}
          rank={1}
        />
      )}
    </main>
  );
}
