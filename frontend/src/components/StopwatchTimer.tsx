'use client';

import React from 'react';

interface Props {
  timeLeft: number;
  totalDuration?: number;
  className?: string;
}

export default function StopwatchTimer({ timeLeft, totalDuration = 60, className = '' }: Props) {
  const safeTime = Math.max(0, timeLeft);
  const minutes = Math.floor(safeTime / 60);
  const seconds = safeTime % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isUrgent = timeLeft <= 5;
  const isWarning = timeLeft <= 15 && !isUrgent;

  // Percentage for the bottom micro-progress bar (0% to 100%)
  const progressPercent = Math.max(0, Math.min(100, (safeTime / totalDuration) * 100));

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none pointer-events-none transition-all duration-300 ${
        isUrgent
          ? 'scale-105 animate-pulse'
          : isWarning
          ? 'scale-102'
          : ''
      } ${className}`}
    >
      {/* Sleek Floating Glass Capsule Pill */}
      <div
        className={`relative flex items-center space-x-2 sm:space-x-2.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full backdrop-blur-2xl border transition-all duration-300 ${
          isUrgent
            ? 'bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 border-white text-white shadow-[0_0_25px_rgba(225,29,72,0.9)] ring-2 ring-white/70'
            : isWarning
            ? 'bg-gradient-to-r from-amber-600/95 via-orange-600/95 to-amber-500/95 border-amber-300 text-white shadow-[0_0_18px_rgba(245,158,11,0.65)] ring-1 ring-amber-300/50'
            : 'bg-[#181922]/90 border border-white/20 text-white shadow-[0_8px_25px_rgba(0,0,0,0.85)] ring-1 ring-white/10'
        }`}
      >
        {/* Sleek Minimalist Stopwatch Icon */}
        <div className="relative flex items-center justify-center flex-shrink-0">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors duration-200 ${
              isUrgent ? 'text-white' : isWarning ? 'text-amber-200' : 'text-[#ff2a6d]'
            }`}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Stopwatch Top Knob */}
            <line x1="12" y1="2" x2="12" y2="5" />
            <line x1="9" y1="2" x2="15" y2="2" />
            {/* Stopwatch Side Pusher */}
            <line x1="19" y1="5" x2="17" y2="7" />
            {/* Stopwatch Body Circle */}
            <circle cx="12" cy="14" r="8" />
            {/* Stopwatch Hand (ticks) */}
            <line
              x1="12"
              y1="14"
              x2="15"
              y2="11"
              strokeWidth="2.2"
              className={isUrgent ? 'animate-spin origin-[12px_14px]' : ''}
            />
          </svg>
        </div>

        {/* Large Crisp Digital Digits: 00:53 */}
        <div className="flex items-baseline space-x-0.5">
          <span
            className={`font-black font-mono tracking-tight leading-none ${
              isUrgent
                ? 'text-sm sm:text-base text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]'
                : isWarning
                ? 'text-xs sm:text-sm text-amber-100'
                : 'text-xs sm:text-sm text-white drop-shadow-sm'
            }`}
            style={{
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {timeFormatted}
          </span>
        </div>

        {/* Bottom Micro Glowing Progress Track inside capsule */}
        <div className="absolute bottom-0 inset-x-3 h-[2px] rounded-full overflow-hidden bg-white/10 pointer-events-none">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${
              isUrgent
                ? 'bg-white shadow-[0_0_6px_#fff]'
                : isWarning
                ? 'bg-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.8)]'
                : 'bg-gradient-to-r from-[#ff2a6d] to-[#ffaa00] shadow-[0_0_6px_rgba(255,42,109,0.8)]'
            }`}
            style={{
              width: `${progressPercent}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
