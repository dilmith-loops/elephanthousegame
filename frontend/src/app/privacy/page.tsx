'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Camera, Database, Lock, EyeOff, Sparkles } from 'lucide-react';

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
                Elephant House Wonder AR Tongue Catch Experience • Ceylon Cold Stores PLC
              </p>
            </div>
          </div>
        </div>

        {/* Highlight Card: Zero Camera Storage Guarantee */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-950/40 to-rose-950/20 border border-pink-500/30">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-pink-500 text-white flex-shrink-0 mt-0.5">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-pink-200 text-base mb-1">
                100% On-Device Facial Landmark Detection
              </h2>
              <p className="text-xs sm:text-sm text-pink-300/80 leading-relaxed">
                Your camera video stream is processed purely in real-time in your device&apos;s local browser memory using Google MediaPipe WASM. <strong>We DO NOT record, store, transmit, or share your camera images, videos, or facial biometric coordinates with any server.</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Database className="w-4 h-4 text-pink-400" />
              <span>1. Information We Collect</span>
            </h2>
            <ul className="space-y-1.5 list-disc pl-5">
              <li>
                <strong className="text-white">Player Display Name:</strong> The nickname you choose to enter when registering.
              </li>
              <li>
                <strong className="text-white">Gameplay Performance:</strong> High scores, popsicles caught, and game session length.
              </li>
              <li>
                <strong className="text-white">No Public Contact Details:</strong> Mobile numbers or emails are never publicly disclosed on the leaderboard or shared with unauthorized third parties.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <EyeOff className="w-4 h-4 text-pink-400" />
              <span>2. Camera Access & Usage</span>
            </h2>
            <p>
              Camera permission is strictly required solely to detect when the player opens their mouth or sticks out their tongue to catch virtual popsicles. The camera feed never leaves your local device. You can revoke camera permission at any time through your browser settings.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Lock className="w-4 h-4 text-pink-400" />
              <span>3. Data Security & Retention</span>
            </h2>
            <p>
              All communication with our servers is protected with modern TLS 1.3 encryption, HTTP Strict Transport Security (HSTS), and scoped CORS security. Local browser storage is utilized solely to remember your player profile locally for convenience.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-pink-400" />
              <span>4. Contact Information</span>
            </h2>
            <p>
              If you have any questions regarding privacy practices or data rights, please contact our security team at{' '}
              <a
                href="mailto:security@loopsintegrated.co"
                className="text-pink-400 font-bold underline"
              >
                security@loopsintegrated.co
              </a>
              .
            </p>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
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
