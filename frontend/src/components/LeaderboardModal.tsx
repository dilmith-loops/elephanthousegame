'use client';

import React, { useEffect, useState } from 'react';
import { Player } from '../types/game';
import { api } from '../lib/api';
import { Trophy, X, Medal, Award, Flame, RotateCcw } from 'lucide-react';
import CartoonAvatar from './CartoonAvatar';

interface Props {
  onClose: () => void;
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-amber-400/40 text-slate-800 dark:text-white flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-500 animate-bounce" />
              </div>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 bg-clip-text text-transparent">
                Hall of Fame
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Elephant House AR Tongue Catch Leaders
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchLeaders}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Leaderboard Table / List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2.5 pr-1">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-400 font-medium">Loading champions...</p>
            </div>
          ) : leaders.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Award className="w-12 h-12 mx-auto mb-2 opacity-40 text-amber-500" />
              <p className="text-sm font-bold">No scores recorded yet!</p>
              <p className="text-xs mt-1">Be the first to play and top the leaderboard!</p>
            </div>
          ) : (
            leaders.map((player, idx) => {
              const rank = idx + 1;
              let rankBadge = (
                <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black text-xs flex items-center justify-center">
                  #{rank}
                </span>
              );

              let itemBg = 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/60';

              if (rank === 1) {
                rankBadge = (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-300 to-amber-500 text-slate-900 font-black text-sm flex items-center justify-center shadow-md shadow-amber-500/30">
                    🥇
                  </div>
                );
                itemBg = 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-400/50 shadow-sm';
              } else if (rank === 2) {
                rankBadge = (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-400 text-slate-900 font-black text-sm flex items-center justify-center shadow-md">
                    🥈
                  </div>
                );
                itemBg = 'bg-slate-50 dark:bg-slate-800/80 border-slate-300/50 dark:border-slate-600/50';
              } else if (rank === 3) {
                rankBadge = (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-700 text-white font-black text-sm flex items-center justify-center shadow-md">
                    🥉
                  </div>
                );
                itemBg = 'bg-slate-50 dark:bg-slate-800/80 border-amber-700/30';
              }

              return (
                <div
                  key={player.id || idx}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${itemBg}`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    {rankBadge}
                    <CartoonAvatar name={player.name} size="sm" className="w-8 h-8 flex-shrink-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700" />
                    <div className="truncate">
                      <p className="font-extrabold text-sm text-slate-800 dark:text-white truncate">
                        {player.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {player.total_games ? `${player.total_games} games played` : 'Active player'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center space-x-1 justify-end font-black text-base text-pink-600 dark:text-pink-400">
                      <span>{player.highest_score || 0}</span>
                      <span className="text-xs uppercase font-bold text-slate-400">pts</span>
                    </div>
                    {rank <= 3 && (
                      <span className="inline-flex items-center text-[10px] text-amber-500 font-bold">
                        <Flame className="w-3 h-3 fill-amber-500 mr-0.5" />
                        Top Tier
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold rounded-xl text-sm shadow-md transition-all active:scale-98 cursor-pointer"
          >
            Close & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
