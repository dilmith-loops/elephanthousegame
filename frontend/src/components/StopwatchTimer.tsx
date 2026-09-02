'use client';

import React from 'react';

interface Props {
  timeLeft: number;
  totalDuration?: number;
  className?: string;
}

// Crisp 7-Segment SVG Segment Paths (viewBox: 0 0 20 36)
const SEGMENTS: Record<string, string> = {
  a: 'M 3.5 2.5 L 16.5 2.5 L 14.5 5.5 L 5.5 5.5 Z', // top
  b: 'M 17.5 3.5 L 17.5 16.5 L 14.5 14.5 L 14.5 5.5 Z', // top right
  c: 'M 17.5 19.5 L 17.5 32.5 L 14.5 30.5 L 14.5 21.5 Z', // bottom right
  d: 'M 3.5 33.5 L 16.5 33.5 L 14.5 30.5 L 5.5 30.5 Z', // bottom
  e: 'M 2.5 19.5 L 5.5 21.5 L 5.5 30.5 L 2.5 32.5 Z', // bottom left
  f: 'M 2.5 3.5 L 5.5 5.5 L 5.5 14.5 L 2.5 16.5 Z', // top left
  g: 'M 3.5 18 L 5.8 15.8 L 14.2 15.8 L 16.5 18 L 14.2 20.2 L 5.8 20.2 Z', // middle
};

const DIGIT_MAP: Record<string, string[]> = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'd', 'e', 'g'],
  '3': ['a', 'b', 'c', 'd', 'g'],
  '4': ['b', 'c', 'f', 'g'],
  '5': ['a', 'c', 'd', 'f', 'g'],
  '6': ['a', 'c', 'd', 'e', 'f', 'g'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
};

function SevenSegmentDigit({ digit, activeColor, inactiveColor }: { digit: string; activeColor: string; inactiveColor: string }) {
  const activeSegments = DIGIT_MAP[digit] || [];

  return (
    <svg viewBox="0 0 20 36" className="w-3.5 h-6 sm:w-4 sm:h-7 flex-shrink-0">
      {Object.entries(SEGMENTS).map(([segKey, pathD]) => {
        const isActive = activeSegments.includes(segKey);
        return (
          <path
            key={segKey}
            d={pathD}
            fill={isActive ? activeColor : inactiveColor}
            className="transition-colors duration-150"
          />
        );
      })}
    </svg>
  );
}

export default function StopwatchTimer({ timeLeft, className = '' }: Props) {
  const safeTime = Math.max(0, timeLeft);
  const minutes = Math.floor(safeTime / 60);
  const seconds = safeTime % 60;

  const mStr = minutes.toString().padStart(2, '0');
  const sStr = seconds.toString().padStart(2, '0');

  const isUrgent = timeLeft <= 5;
  const isWarning = timeLeft <= 15 && !isUrgent;

  const activeColor = isUrgent ? '#dc2626' : isWarning ? '#d97706' : '#141419';
  const inactiveColor = 'rgba(0, 0, 0, 0.04)';

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none pointer-events-none transition-all duration-300 ${
        isUrgent
          ? 'scale-110 drop-shadow-[0_0_20px_rgba(235,30,120,0.95)] animate-pulse'
          : isWarning
          ? 'scale-105 drop-shadow-[0_0_14px_rgba(245,158,11,0.6)]'
          : 'drop-shadow-[0_10px_22px_rgba(0,0,0,0.85)]'
      } ${className}`}
      style={{
        width: '84px',
      }}
    >
      {/* 3D Realistic Stopwatch Base Image with Pristine Clean Dial */}
      <img
        src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/stopwatch_frame.png`}
        alt="Stopwatch Timer"
        className="w-full h-auto object-contain select-none pointer-events-none"
        draggable={false}
      />

      {/* 7-Segment Digital LCD Display Centered on Dial */}
      <div
        className="absolute flex items-center justify-center pointer-events-none space-x-[2px] sm:space-x-[3px]"
        style={{
          top: '59.8%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '64%',
        }}
      >
        {/* Minute Digits */}
        <SevenSegmentDigit digit={mStr[0]} activeColor={activeColor} inactiveColor={inactiveColor} />
        <SevenSegmentDigit digit={mStr[1]} activeColor={activeColor} inactiveColor={inactiveColor} />

        {/* Blinking Colon Dots */}
        <div className="flex flex-col justify-center items-center space-y-1 sm:space-y-1.5 px-[1px]">
          <div
            className="w-1 h-1 sm:w-1.2 sm:h-1.2 rounded-[0.5px] transition-colors duration-150"
            style={{ backgroundColor: activeColor }}
          />
          <div
            className="w-1 h-1 sm:w-1.2 sm:h-1.2 rounded-[0.5px] transition-colors duration-150"
            style={{ backgroundColor: activeColor }}
          />
        </div>

        {/* Second Digits */}
        <SevenSegmentDigit digit={sStr[0]} activeColor={activeColor} inactiveColor={inactiveColor} />
        <SevenSegmentDigit digit={sStr[1]} activeColor={activeColor} inactiveColor={inactiveColor} />
      </div>
    </div>
  );
}
