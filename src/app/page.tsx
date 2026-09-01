'use client';

import React, { useState } from 'react';
import { Player } from '../types/game';
import OnboardingModal from '../components/OnboardingModal';
import GameCanvas from '../components/GameCanvas';
import LeaderboardModal from '../components/LeaderboardModal';

export default function HomePage() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handleStartGame = (player: Player) => {
    setCurrentPlayer(player);
  };

  const handleChangePlayer = () => {
    setCurrentPlayer(null);
  };

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
