'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Sparkles, ArrowLeft, Gamepad2 } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center relative overflow-hidden p-4 select-none">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      {/* Floating Animated Emojis in Background */}
      <div className="absolute top-16 left-12 text-6xl opacity-20 animate-bounce pointer-events-none">
        🍦
      </div>
      <div className="absolute top-1/3 right-16 text-7xl opacity-20 animate-pulse pointer-events-none">
        🍧
      </div>
      <div className="absolute bottom-20 left-20 text-6xl opacity-25 animate-spin pointer-events-none">
        🍭
      </div>
      <div className="absolute bottom-28 right-24 text-7xl opacity-20 animate-bounce pointer-events-none">
        🍨
      </div>

      {/* Main 404 Card */}
      <div className="relative w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 md:p-10 shadow-2xl text-center z-10 animate-fade-in">
        {/* Brand Logo */}
        <div className="w-24 h-24 mx-auto mb-6 bg-white dark:bg-slate-800 rounded-3xl p-2 shadow-2xl shadow-pink-500/20 flex items-center justify-center border border-white/60 dark:border-slate-700/80 transform hover:scale-105 transition-transform">
          <img
            src="/logo.png"
            alt="Elephant House"
            className="w-full h-full object-contain"
          />
        </div>

        {/* 404 Header */}
        <div className="inline-block px-3.5 py-1 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-400 text-xs font-black tracking-wider uppercase mb-3">
          404 Error • Page Not Found
        </div>

        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-pink-500 via-rose-400 to-amber-400 bg-clip-text text-transparent mb-2">
          Oops! This Scoop Melted Away
        </h1>

        <p className="text-slate-400 text-xs md:text-sm max-w-sm mx-auto leading-relaxed mb-8">
          The page or route you are trying to visit doesn’t exist or has moved. Let’s get you back into the popsicle-catching action!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white font-extrabold rounded-2xl shadow-lg shadow-pink-500/30 flex items-center justify-center space-x-2 transition-all transform active:scale-95 text-sm"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Play Elephant House Game</span>
            <Sparkles className="w-4 h-4" />
          </Link>
        </div>

        {/* Brand Footer */}
        <p className="text-[11px] text-slate-500 mt-8 pt-6 border-t border-slate-800/80">
          Elephant House Ice Cream AR Tongue Catch Experience
        </p>
      </div>
    </main>
  );
}
