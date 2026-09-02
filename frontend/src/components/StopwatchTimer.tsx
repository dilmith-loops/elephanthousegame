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

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none pointer-events-none transition-all duration-300 ${
        isUrgent
          ? 'scale-110 drop-shadow-[0_0_22px_rgba(244,63,94,0.9)] animate-pulse'
          : isWarning
          ? 'scale-105 drop-shadow-[0_0_16px_rgba(245,158,11,0.7)]'
          : 'drop-shadow-[0_10px_25px_rgba(0,0,0,0.75)]'
      } ${className}`}
    >
      {/* Fluffy Wonder Cloud Container */}
      <div className="relative flex items-center justify-center">
        {/* Cloud SVG Graphic with Soft Pillowy Contours */}
        <svg
          viewBox="0 0 160 90"
          className="w-24 sm:w-28 h-auto flex-shrink-0"
          style={{
            filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.25))',
          }}
        >
          <defs>
            {/* Normal Wonder Cloud Gradient */}
            <linearGradient id="cloudGradientNormal" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#FFF4FA" />
              <stop offset="100%" stopColor="#FCE7F3" />
            </linearGradient>

            {/* Warning Sunset Cloud Gradient */}
            <linearGradient id="cloudGradientWarning" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="70%" stopColor="#FEF3C7" />
              <stop offset="100%" stopColor="#FDE68A" />
            </linearGradient>

            {/* Urgent Rosy Cloud Gradient */}
            <linearGradient id="cloudGradientUrgent" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF1F2" />
              <stop offset="60%" stopColor="#FFE4E6" />
              <stop offset="100%" stopColor="#FECDD3" />
            </linearGradient>

            {/* Soft Shadow Filter for Cloud Depth */}
            <filter id="cloudInnerShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.12)" />
            </filter>
          </defs>

          {/* Cloud Outline & Pillowy Body */}
          <path
            d="M 38 72 
               L 122 72 
               A 16 16 0 0 0 138 56 
               A 18 18 0 0 0 126 34 
               A 24 24 0 0 0 98 18 
               A 28 28 0 0 0 52 24 
               A 20 20 0 0 0 30 42 
               A 16 16 0 0 0 38 72 Z"
            fill={
              isUrgent
                ? 'url(#cloudGradientUrgent)'
                : isWarning
                ? 'url(#cloudGradientWarning)'
                : 'url(#cloudGradientNormal)'
            }
            stroke={
              isUrgent
                ? '#FB7185'
                : isWarning
                ? '#FBBF24'
                : '#F472B6'
            }
            strokeWidth="2.5"
            strokeLinejoin="round"
            filter="url(#cloudInnerShadow)"
          />

          {/* Soft Highlight Arc */}
          <path
            d="M 58 27 A 22 22 0 0 1 92 22"
            fill="none"
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        {/* Large Playful Bold Timer Digits Centered Inside Cloud Belly */}
        <div
          className="absolute flex items-center justify-center pointer-events-none"
          style={{
            top: '52%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <span
            className={`font-black font-mono tracking-tight leading-none text-center select-none ${
              isUrgent
                ? 'text-[#E11D48] text-base sm:text-lg'
                : isWarning
                ? 'text-[#B45309] text-sm sm:text-base'
                : 'text-[#B21F85] text-sm sm:text-base'
            }`}
            style={{
              letterSpacing: '-0.02em',
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.9)',
            }}
          >
            {timeFormatted}
          </span>
        </div>
      </div>
    </div>
  );
}
