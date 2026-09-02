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

  // Percentage of time remaining for circular SVG progress ring (0 to 100)
  const progressPercent = Math.max(0, Math.min(100, (safeTime / totalDuration) * 100));
  // Circle perimeter for r=42 is 2 * PI * 42 = 263.89
  const circumference = 263.89;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div
      className={`relative flex flex-col items-center select-none pointer-events-none transition-transform duration-300 ${
        isUrgent
          ? 'scale-105 animate-pulse'
          : isWarning
          ? 'scale-102'
          : ''
      } ${className}`}
    >
      {/* Sleek Modern Vector Stopwatch */}
      <div className="relative flex flex-col items-center">
        {/* Top Metallic Crown Knob & Loop Accent */}
        <div className="flex flex-col items-center -mb-1 z-10">
          <div
            className={`w-3.5 h-1.5 rounded-t-sm border border-b-0 shadow-sm ${
              isUrgent
                ? 'bg-gradient-to-r from-red-600 via-rose-400 to-red-600 border-red-300'
                : 'bg-gradient-to-r from-slate-400 via-white to-slate-400 border-slate-300'
            }`}
          />
        </div>

        {/* Circular Stopwatch Body */}
        <div
          className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[2.5px] sm:p-[3px] flex items-center justify-center transition-all duration-300 ${
            isUrgent
              ? 'bg-gradient-to-tr from-red-600 via-rose-500 to-pink-600 shadow-[0_0_25px_rgba(225,29,72,0.9)] ring-2 ring-white/80'
              : isWarning
              ? 'bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400 shadow-[0_0_20px_rgba(245,158,11,0.7)] ring-1 ring-amber-300/80'
              : 'bg-gradient-to-tr from-[#8d1468] via-[#b21f85] to-[#ff4785] shadow-[0_8px_25px_rgba(0,0,0,0.85)] ring-1 ring-white/25'
          }`}
        >
          {/* Inner Dark Dial with Glassmorphism */}
          <div className="relative w-full h-full rounded-full bg-[#101016]/95 backdrop-blur-xl flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
            {/* SVG Radial Countdown Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 p-1" viewBox="0 0 100 100">
              {/* Background Track Ring */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="4.5"
                className="text-white/10"
              />

              {/* Active Depleting Countdown Arc */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`transition-all duration-1000 ease-linear ${
                  isUrgent
                    ? 'text-rose-500'
                    : isWarning
                    ? 'text-amber-400'
                    : 'text-[#ff2a6d]'
                }`}
              />
            </svg>

            {/* Dial Tick Marks at 12, 3, 6, 9 Cardinal Points */}
            <div className="absolute inset-0 pointer-events-none p-1.5 flex items-center justify-center">
              <div className="absolute top-1.5 w-0.5 h-1.5 bg-white/40 rounded-full" />
              <div className="absolute bottom-1.5 w-0.5 h-1.5 bg-white/40 rounded-full" />
              <div className="absolute left-1.5 w-1.5 h-0.5 bg-white/40 rounded-full" />
              <div className="absolute right-1.5 w-1.5 h-0.5 bg-white/40 rounded-full" />
            </div>

            {/* Centered Large Bold Time Display: 00:53 */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <span
                className={`font-black font-mono tracking-tight leading-none text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] ${
                  isUrgent
                    ? 'text-[15px] sm:text-[18px] text-rose-200'
                    : isWarning
                    ? 'text-[14px] sm:text-[17px] text-amber-100'
                    : 'text-[13px] sm:text-[16px] text-white'
                }`}
              >
                {timeFormatted}
              </span>
            </div>

            {/* Subtle Glass Sheen */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none opacity-25"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 50%)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
