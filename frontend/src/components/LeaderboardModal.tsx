'use client';

import React, { useEffect, useState } from 'react';
import { Player } from '../types/game';
import { api } from '../lib/api';
import { RotateCcw } from 'lucide-react';
import CartoonAvatar from './CartoonAvatar';

interface Props {
  onClose: () => void;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function LeaderboardModal({ onClose }: Props) {
  const [leaders, setLeaders] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaders = async () => {
    setLoading(true);
    try {
      const res = await api.getLeaderboard(15);
      if (res.leaderboard) {
        setLeaders(res.leaderboard);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaders();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      {/* Background click dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Leaderboard Card */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Hall of Fame Leaderboard"
        className="relative z-10 w-full max-w-[420px] bg-[#fff9f5] rounded-[34px] sm:rounded-[38px] shadow-2xl border-4 border-white/95 text-slate-800 flex flex-col max-h-[92vh] overflow-hidden select-none animate-in zoom-in-95 duration-200"
      >
        
        {/* Top Header Section (Illustrated Banner matching reference mockup) */}
        <div className="relative w-full overflow-hidden flex-shrink-0">
          <img
            src={`${basePath}/leaderboard_header.png`}
            alt="Hall of Fame - Elephant House AR Tongue Catch Leaders"
            className="w-full h-auto object-cover select-none pointer-events-none block"
          />

          {/* Interactive Close Target (positioned directly over the header image close button) */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 w-11 h-11 sm:w-12 sm:h-12 rounded-full cursor-pointer z-30 hover:bg-rose-500/10 active:scale-90 transition-all flex items-center justify-center"
          >
            <span className="sr-only">Close</span>
          </button>

          {/* Subtle Refresh Button at Top Left */}
          <button
            onClick={fetchLeaders}
            title="Refresh Leaderboard"
            className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 p-2 rounded-full bg-white/80 hover:bg-white text-[#8e6157] shadow-sm transition-all active:scale-90 cursor-pointer z-30 backdrop-blur-xs border border-[#f0e0d6]"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Inner Leaders List Container */}
        <div className="mx-3.5 sm:mx-4 flex-1 overflow-y-auto rounded-[28px] bg-white/95 border border-[#f7e8df] p-2.5 sm:p-3 space-y-2.5 shadow-inner min-h-[300px] max-h-[56vh]">
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-3 border-[#d8145e] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-[#8e6157] font-extrabold tracking-wide">Loading Hall of Fame...</p>
            </div>
          ) : leaders.length === 0 ? (
            <div className="py-20 text-center text-[#8e6157]">
              <div className="w-14 h-14 mx-auto mb-2 opacity-60 flex items-center justify-center">
                <img src={`${basePath}/leaderboard_trophy.png`} alt="Trophy" className="w-full h-full object-contain" />
              </div>
              <p className="text-sm font-black text-[#3d1a16]">No scores recorded yet!</p>
              <p className="text-xs mt-1 text-[#8e6157] font-medium">Be the first to play and top the leaderboard!</p>
            </div>
          ) : (
            leaders.map((player, idx) => {
              const rank = idx + 1;

              // Rank 1: Golden Highlight Card
              if (rank === 1) {
                return (
                  <div
                    key={player.id || idx}
                    className="relative flex items-center justify-between p-2 sm:p-2.5 sm:px-3 rounded-[22px] bg-[#fff6d6] border-2 border-[#ffd778] shadow-sm transition-all"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-2.5 flex-1 min-w-0 mr-1.5">
                      {/* Rank 1 Badge */}
                      <div className="w-8 sm:w-9 flex-shrink-0 flex items-center justify-center">
                        <img
                          src={`${basePath}/leaderboard_badge1.png`}
                          alt="Rank 1"
                          className="w-8 sm:w-9 h-auto object-contain drop-shadow-xs"
                        />
                      </div>

                      {/* Avatar */}
                      <CartoonAvatar
                        name={player.name}
                        size="md"
                        className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 shadow-xs ring-2 ring-amber-300/90"
                      />

                      {/* Player Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[13px] sm:text-[15px] text-[#3d1a16] truncate leading-tight">
                          {player.name}
                        </p>
                        <p className="text-[10.5px] sm:text-xs font-semibold text-[#8e6157] mt-0.5">
                          {player.total_games ? `${player.total_games} games played` : '1 games played'}
                        </p>
                      </div>
                    </div>

                    {/* Score & Tier Tag */}
                    <div className="text-right flex-shrink-0 pl-1">
                      <p className="font-black text-xl sm:text-2xl text-[#d8145e] tracking-tight leading-none">
                        {player.highest_score || 0}
                      </p>
                      <span className="inline-flex items-center text-[10.5px] font-black text-[#ea580c] mt-0.5">
                        <span className="mr-0.5">🔥</span> Top Tier
                      </span>
                    </div>
                  </div>
                );
              }

              // Rank 2: Silver Crown Card
              if (rank === 2) {
                return (
                  <div
                    key={player.id || idx}
                    className="flex items-center justify-between p-2 sm:p-2.5 sm:px-3 rounded-[22px] bg-[#fdfcfb] border border-[#f0e6df] shadow-xs transition-all"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-2.5 flex-1 min-w-0 mr-1.5">
                      {/* Rank 2 Badge */}
                      <div className="w-8 sm:w-9 flex-shrink-0 flex items-center justify-center">
                        <img
                          src={`${basePath}/leaderboard_badge2.png`}
                          alt="Rank 2"
                          className="w-8 sm:w-9 h-auto object-contain drop-shadow-xs"
                        />
                      </div>

                      {/* Avatar */}
                      <CartoonAvatar
                        name={player.name}
                        size="md"
                        className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 shadow-xs ring-1 ring-[#e2d5cd]"
                      />

                      {/* Player Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[13px] sm:text-[15px] text-[#3d1a16] truncate leading-tight">
                          {player.name}
                        </p>
                        <p className="text-[10.5px] sm:text-xs font-semibold text-[#8e6157] mt-0.5">
                          {player.total_games ? `${player.total_games} games played` : '1 games played'}
                        </p>
                      </div>
                    </div>

                    {/* Score & Tier Tag */}
                    <div className="text-right flex-shrink-0 pl-1">
                      <p className="font-black text-xl sm:text-2xl text-[#d8145e] tracking-tight leading-none">
                        {player.highest_score || 0}
                      </p>
                      <span className="inline-flex items-center text-[10.5px] font-black text-[#ea580c] mt-0.5">
                        <span className="mr-0.5">🔥</span> Top Tier
                      </span>
                    </div>
                  </div>
                );
              }

              // Rank 3: Bronze Crown Card
              if (rank === 3) {
                return (
                  <div
                    key={player.id || idx}
                    className="flex items-center justify-between p-2 sm:p-2.5 sm:px-3 rounded-[22px] bg-[#fdfcfb] border border-[#f0e6df] shadow-xs transition-all"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-2.5 flex-1 min-w-0 mr-1.5">
                      {/* Rank 3 Badge */}
                      <div className="w-8 sm:w-9 flex-shrink-0 flex items-center justify-center">
                        <img
                          src={`${basePath}/leaderboard_badge3.png`}
                          alt="Rank 3"
                          className="w-8 sm:w-9 h-auto object-contain drop-shadow-xs"
                        />
                      </div>

                      {/* Avatar */}
                      <CartoonAvatar
                        name={player.name}
                        size="md"
                        className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 shadow-xs ring-1 ring-[#e2d5cd]"
                      />

                      {/* Player Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[13px] sm:text-[15px] text-[#3d1a16] truncate leading-tight">
                          {player.name}
                        </p>
                        <p className="text-[10.5px] sm:text-xs font-semibold text-[#8e6157] mt-0.5">
                          {player.total_games ? `${player.total_games} games played` : '1 games played'}
                        </p>
                      </div>
                    </div>

                    {/* Score & Tier Tag */}
                    <div className="text-right flex-shrink-0 pl-1">
                      <p className="font-black text-xl sm:text-2xl text-[#d8145e] tracking-tight leading-none">
                        {player.highest_score || 0}
                      </p>
                      <span className="inline-flex items-center text-[10.5px] font-black text-[#ea580c] mt-0.5">
                        <span className="mr-0.5">🔥</span> Top Tier
                      </span>
                    </div>
                  </div>
                );
              }

              // Rank 4+: Soft rounded pill badge
              return (
                <div
                  key={player.id || idx}
                  className="flex items-center justify-between p-2 sm:p-2.5 sm:px-3 rounded-[22px] bg-[#fdfcfb] border border-[#f5ede7] shadow-xs transition-all"
                >
                  <div className="flex items-center space-x-2 sm:space-x-2.5 flex-1 min-w-0 mr-1.5">
                    {/* Rank Pill */}
                    <div className="w-8 sm:w-9 flex-shrink-0 flex items-center justify-center">
                      <div className="w-8 h-7.5 sm:w-8.5 sm:h-8 rounded-xl bg-[#f0f3f8] text-[#718096] font-black text-xs sm:text-sm flex items-center justify-center">
                        #{rank}
                      </div>
                    </div>

                    {/* Avatar */}
                    <CartoonAvatar
                      name={player.name}
                      size="md"
                      className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 shadow-xs ring-1 ring-[#f0e6df]"
                    />

                    {/* Player Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[13px] sm:text-[15px] text-[#3d1a16] truncate leading-tight">
                        {player.name}
                      </p>
                      <p className="text-[10.5px] sm:text-xs font-semibold text-[#8e6157] mt-0.5">
                        {player.total_games ? `${player.total_games} games played` : '1 games played'}
                      </p>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right flex-shrink-0 pl-1">
                    <p className="font-black text-xl sm:text-2xl text-[#d8145e] tracking-tight leading-none">
                      {player.highest_score || 0}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Footer Section */}
        <div className="relative pt-3 pb-3 px-5 sm:px-6 flex flex-col items-center justify-center overflow-hidden flex-shrink-0">
          {/* Bottom-left pastel clouds & star */}
          <div className="absolute left-0 bottom-0 pointer-events-none select-none z-0">
            <svg width="75" height="65" viewBox="0 0 75 65" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="58" r="36" fill="#FFF3D4" opacity="0.9" />
              <circle cx="38" cy="66" r="28" fill="#FFE5CC" opacity="0.75" />
              <path
                d="M23 18L24.8 23.5L30.5 24.2L26.1 28.1L27.3 33.7L23 30.8L18.7 33.7L19.9 28.1L15.5 24.2L21.2 23.5L23 18Z"
                fill="#FFD23F"
                stroke="#F6B819"
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Bottom-right pastel clouds & star */}
          <div className="absolute right-0 bottom-0 pointer-events-none select-none z-0">
            <svg width="75" height="65" viewBox="0 0 75 65" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="66" cy="58" r="36" fill="#FFE0EB" opacity="0.9" />
              <circle cx="40" cy="66" r="28" fill="#FFF3D4" opacity="0.75" />
              <path
                d="M50 20L51.5 24.5L56 25.1L52.5 28.3L53.5 32.8L50 30.5L46.5 32.8L47.5 28.3L44 25.1L48.5 24.5L50 20Z"
                fill="#FFD23F"
                stroke="#F6B819"
                strokeWidth="1"
                strokeLinejoin="round"
              />
              <path
                d="M60 38L61 40.8L64 41.2L61.7 43.3L62.3 46.2L60 44.7L57.7 46.2L58.3 43.3L56 41.2L59 40.8L60 38Z"
                fill="#FFD23F"
                opacity="0.9"
              />
            </svg>
          </div>

          {/* Glossy Jelly Berry Button (matching reference mockup) */}
          <button
            onClick={onClose}
            className="relative z-10 w-full py-3.5 sm:py-4 px-6 rounded-full text-white font-black text-base sm:text-lg tracking-wide shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_8px_22px_rgba(216,20,94,0.4)] bg-gradient-to-b from-[#f42576] via-[#d8145e] to-[#b50a49] active:scale-98 transition-transform cursor-pointer border border-[#ff69a5]/40"
          >
            {/* Top specular highlight sheen */}
            <span className="absolute top-1 left-8 right-8 h-2.5 bg-gradient-to-b from-white/45 to-transparent rounded-full pointer-events-none" />
            Close & Continue
          </button>

          {/* Bottom Home Indicator Bar */}
          <div className="w-16 h-1 bg-slate-400/25 rounded-full mt-2.5 z-10" />
        </div>
      </div>
    </div>
  );
}
