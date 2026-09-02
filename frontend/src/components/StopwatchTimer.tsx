'use client';

import React from 'react';

interface Props {
  timeLeft: number;
  totalDuration?: number;
  className?: string;
}

export default function StopwatchTimer({ timeLeft, totalDuration = 60, className = '' }: Props) {
  // Format as mm:ss (e.g. 00:53)
  const minutes = Math.floor(Math.max(0, timeLeft) / 60);
  const seconds = Math.max(0, timeLeft) % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isUrgent = timeLeft <= 5;
  const isWarning = timeLeft <= 15 && !isUrgent;

  // 12 Dial Tick Marks around the circumference (every 30 degrees)
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = i * 30; // 0, 30, 60...
    const isCardinal = i % 3 === 0; // 12, 3, 6, 9 o'clock
    return {
      angle,
      isCardinal,
      length: isCardinal ? 4.5 : 2.5,
      strokeWidth: isCardinal ? 1.4 : 0.8,
      color: isCardinal ? '#ff2a4b' : '#ff5975'
    };
  });

  return (
    <div className={`relative flex flex-col items-center select-none pointer-events-none ${className}`}>
      {/* Top Metallic Ring Loop & Crown Mechanism */}
      <div className="relative flex flex-col items-center -mb-2 z-10">
        {/* Top Circular Metal Ring */}
        <div
          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-[2.5px] sm:border-[3px] bg-transparent shadow-[0_2px_8px_rgba(0,0,0,0.8)] ${
            isUrgent
              ? 'border-red-500 shadow-red-600/60 animate-pulse'
              : 'border-[#d31838] shadow-[#d31838]/40'
          }`}
          style={{
            background: 'radial-gradient(circle, transparent 60%, rgba(211,24,56,0.3) 100%)',
          }}
        />

        {/* Crown Ribbed Knob */}
        <div
          className="w-3.5 h-1.5 -mt-0.5 rounded-[1px] bg-gradient-to-r from-[#800015] via-[#ff3b5c] to-[#800015] border-x border-[#ff6b85] shadow-sm"
        />
      </div>

      {/* Top-Right Angled Pusher Button */}
      <div
        className="absolute top-2.5 right-1 sm:top-3 sm:right-2 z-10 transform rotate-[35deg] origin-bottom-left"
      >
        <div className="w-2.5 h-2 rounded-[1px] bg-gradient-to-r from-[#800015] via-[#ff4767] to-[#800015] border-t border-[#ff859c] shadow-md" />
      </div>

      {/* Main Stopwatch Dial Body */}
      <div
        className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[3px] sm:p-[3.5px] flex items-center justify-center transition-all duration-300 shadow-[0_12px_30px_rgba(0,0,0,0.9)] ${
          isUrgent
            ? 'scale-110 shadow-[0_0_30px_rgba(255,23,68,0.95)] animate-pulse ring-2 ring-red-400'
            : isWarning
            ? 'scale-105 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
            : ''
        }`}
        style={{
          background: isUrgent
            ? 'radial-gradient(circle, #ff1744 0%, #d50000 60%, #5f0000 100%)'
            : 'radial-gradient(circle, #ff2a4b 0%, #b80c29 55%, #590412 100%)',
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.85)',
        }}
      >
        {/* Shiny Outer Chrome Reflection Ring */}
        <div className="absolute inset-[1px] rounded-full border border-white/35 pointer-events-none" />

        {/* Inner Black Dial Face */}
        <div
          className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden bg-[#0d0d12] shadow-inner"
          style={{
            background: 'radial-gradient(circle, #1a1a24 0%, #0c0c11 75%, #050508 100%)',
          }}
        >
          {/* Subtle Ambient Dial Texture & Vignette */}
          <div className="absolute inset-0 bg-radial from-transparent to-black/70 pointer-events-none" />

          {/* SVG Radial Dial Ticks */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
            {ticks.map((tick, idx) => (
              <line
                key={idx}
                x1="50"
                y1="7"
                x2="50"
                y2={7 + tick.length}
                stroke={tick.color}
                strokeWidth={tick.strokeWidth}
                strokeLinecap="round"
                transform={`rotate(${tick.angle} 50 50)`}
                opacity={0.9}
              />
            ))}
          </svg>

          {/* Large Bold White Stopwatch Digits: 00:53 */}
          <div className="relative z-10 flex items-center justify-center tracking-tight">
            <span
              className="font-black text-[21px] sm:text-[26px] text-white leading-none font-sans drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]"
              style={{
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                letterSpacing: '-0.03em',
              }}
            >
              {timeFormatted}
            </span>
          </div>

          {/* Dial Glass Reflection Sheen */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none opacity-20"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
