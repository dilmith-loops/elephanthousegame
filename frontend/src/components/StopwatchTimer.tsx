'use client';

import React from 'react';

interface Props {
  timeLeft: number;
  totalDuration?: number;
  className?: string;
}

export default function StopwatchTimer({ timeLeft, className = '' }: Props) {
  // Format as mm:ss (e.g. 00:53)
  const minutes = Math.floor(Math.max(0, timeLeft) / 60);
  const seconds = Math.max(0, timeLeft) % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isUrgent = timeLeft <= 5;
  const isWarning = timeLeft <= 15 && !isUrgent;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none pointer-events-none transition-all duration-300 ${
        isUrgent
          ? 'scale-110 drop-shadow-[0_0_18px_rgba(235,30,120,0.9)] animate-pulse'
          : isWarning
          ? 'scale-105 drop-shadow-[0_0_14px_rgba(245,158,11,0.6)]'
          : 'drop-shadow-[0_8px_18px_rgba(0,0,0,0.85)]'
      } ${className}`}
      style={{
        width: '78px',
        maxWidth: '86px',
      }}
    >
      {/* 3D Realistic Stopwatch Base Image */}
      <img
        src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/stopwatch_frame.png`}
        alt="Stopwatch Timer"
        className="w-full h-auto object-contain select-none pointer-events-none"
        draggable={false}
      />

      {/* Live Digital Countdown Digits centered on the dial face */}
      <div
        className="absolute flex items-center justify-center pointer-events-none"
        style={{
          top: '59.5%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '68%',
        }}
      >
        <span
          className={`font-black font-mono tracking-[-0.04em] text-center leading-none select-none ${
            isUrgent ? 'text-[#e60050]' : 'text-[#1a1a20]'
          }`}
          style={{
            fontSize: '15px',
            fontVariantNumeric: 'tabular-nums',
            textShadow: '0 0.5px 1px rgba(0,0,0,0.2)',
          }}
        >
          {timeFormatted}
        </span>
      </div>
    </div>
  );
}
