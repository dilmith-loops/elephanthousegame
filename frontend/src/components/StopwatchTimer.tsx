'use client';

import React from 'react';

interface Props {
  timeLeft: number;
  totalDuration?: number;
  className?: string;
}

// 7-segment definitions for a single digit within local (0 0 16 26) box
const SEGMENTS: Record<string, string> = {
  a: 'M 2.5 1.5 L 13.5 1.5 L 12 3.8 L 4 3.8 Z', // top
  b: 'M 14.5 2.5 L 14.5 12 L 12 10.5 L 12 4 Z', // top right
  c: 'M 14.5 14 L 14.5 23.5 L 12 22 L 12 15.5 Z', // bottom right
  d: 'M 2.5 24.5 L 13.5 24.5 L 12 22.2 L 4 22.2 Z', // bottom
  e: 'M 1.5 14 L 4 15.5 L 4 22 L 1.5 23.5 Z', // bottom left
  f: 'M 1.5 2.5 L 4 4 Z L 4 10.5 L 1.5 12 Z', // top left
  g: 'M 2.5 13 L 4.5 11.2 L 11.5 11.2 L 13.5 13 L 11.5 14.8 L 4.5 14.8 Z', // middle
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

function DigitGroup({ x, digit, color, inactiveColor }: { x: number; digit: string; color: string; inactiveColor: string }) {
  const activeSegments = DIGIT_MAP[digit] || [];

  return (
    <g transform={`translate(${x}, 1)`}>
      {Object.entries(SEGMENTS).map(([segKey, pathD]) => {
        const isActive = activeSegments.includes(segKey);
        return (
          <path
            key={segKey}
            d={pathD}
            fill={isActive ? color : inactiveColor}
          />
        );
      })}
    </g>
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

  const activeColor = isUrgent ? '#dc2626' : isWarning ? '#d97706' : '#111116';
  const inactiveColor = 'rgba(0, 0, 0, 0.035)';

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none pointer-events-none transition-all duration-300 ${
        isUrgent
          ? 'scale-105 drop-shadow-[0_0_18px_rgba(235,30,120,0.95)] animate-pulse'
          : isWarning
          ? 'scale-102 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]'
          : 'drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)]'
      } ${className}`}
      style={{
        width: '82px',
        maxWidth: '92px',
      }}
    >
      {/* 3D Realistic Stopwatch Base Image */}
      <img
        src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/stopwatch_frame.png`}
        alt="Stopwatch Timer"
        className="w-full h-auto object-contain select-none pointer-events-none"
        draggable={false}
      />

      {/* Proportional Unified SVG 7-Segment Display precisely inside the White Dial */}
      <div
        className="absolute flex items-center justify-center pointer-events-none"
        style={{
          top: '59.8%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '46%',
          aspectRatio: '84 / 28',
        }}
      >
        <svg viewBox="0 0 84 28" className="w-full h-full">
          {/* Side dashes matching stopwatch dial design */}
          <line x1="2" y1="14" x2="6" y2="14" stroke={activeColor} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <line x1="78" y1="14" x2="82" y2="14" stroke={activeColor} strokeWidth="2" strokeLinecap="round" opacity="0.6" />

          {/* Minute Digits (x: 10, x: 27) */}
          <DigitGroup x={10} digit={mStr[0]} color={activeColor} inactiveColor={inactiveColor} />
          <DigitGroup x={27} digit={mStr[1]} color={activeColor} inactiveColor={inactiveColor} />

          {/* Colon Dots (x: 45) */}
          <circle cx="45" cy="10" r="1.4" fill={activeColor} />
          <circle cx="45" cy="18" r="1.4" fill={activeColor} />

          {/* Second Digits (x: 49, x: 66) */}
          <DigitGroup x={49} digit={sStr[0]} color={activeColor} inactiveColor={inactiveColor} />
          <DigitGroup x={66} digit={sStr[1]} color={activeColor} inactiveColor={inactiveColor} />
        </svg>
      </div>
    </div>
  );
}
