'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Camera, Database, Lock, EyeOff, Sparkles, AlertCircle } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-slate-900/90 backdrop-blur-xl border border-pink-500/20 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs font-bold text-pink-400 hover:text-pink-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Game</span>
          </Link>
          <div className="flex items-center space-x-2 bg-pink-950/60 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-semibold text-pink-300">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Elephant House WONDER</span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Elephant House Wonder AR Experience • Ceylon Cold Stores PLC
              </p>
            </div>
          </div>
        </div>

        {/* Highlight Card: 100% On-Device AR Face Tracking */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-950/40 to-rose-950/20 border border-pink-500/30">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-pink-500 text-white flex-shrink-0 mt-0.5">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-pink-200 text-base mb-1">
                100% On-Device AR Face Tracking
              </h2>
              <p className="text-xs sm:text-sm text-pink-300/80 leading-relaxed">
                Camera access is used to detect gameplay gestures, such as mouth-opening, required for the AR experience. Camera processing is performed in real time on your device. We do not record, store, upload, or share camera images, video, or facial geometry.
              </p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Database className="w-4 h-4 text-pink-400" />
              <span>INFORMATION WE COLLECT</span>
            </h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                <strong className="text-white">Player Nickname:</strong> The name you enter may be displayed with your score on the public game leaderboard.
              </li>
              <li>
                <strong className="text-white">Game Statistics:</strong> We may collect gameplay information such as scores, game duration, items caught, and session results.
              </li>
              <li>
                <strong className="text-white">Technical Information:</strong> Limited technical information may be processed where necessary to operate, secure, and improve the game.
              </li>
              <li>
                <strong className="text-white">No Contact Information Required:</strong> The game does not require you to provide a phone number, email address, or home address to play.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Camera className="w-4 h-4 text-pink-400" />
              <span>CAMERA PERMISSIONS</span>
            </h2>
            <p>
              Camera access is required only for AR gameplay features. You can deny or revoke camera permission through your browser or device settings. Some game features may not function without camera access.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Lock className="w-4 h-4 text-pink-400" />
              <span>DATA SECURITY</span>
            </h2>
            <p>
              Reasonable technical and organizational measures are used to protect game data against unauthorized access, loss, alteration, or misuse. Internet communications are protected using secure HTTPS connections where supported.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <EyeOff className="w-4 h-4 text-pink-400" />
              <span>LEADERBOARD PRIVACY</span>
            </h2>
            <p>
              Your chosen nickname and game score may appear on the public leaderboard. Avoid using your full legal name, phone number, email address, or other sensitive information as your nickname.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-pink-400" />
              <span>CHILDREN &amp; SAFE USE</span>
            </h2>
            <p>
              Children should use the experience with appropriate parent or guardian supervision. Players should remain aware of their physical surroundings while using camera-based AR features.
            </p>
          </section>
        </div>

        {/* Last Updated */}
        <div className="pt-2 text-center border-t border-slate-800">
          <span className="text-xs text-slate-500 font-medium">
            Last updated: September 2026
          </span>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/terms"
            className="text-xs text-pink-400 hover:text-pink-300 font-semibold underline"
          >
            Read our Terms of Service &rarr;
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto py-3 px-8 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-bold rounded-2xl shadow-lg shadow-pink-600/30 text-center transition-all cursor-pointer"
          >
            Start Playing
          </Link>
        </div>

      </div>
    </main>
  );
}
