'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, CheckCircle2, Award, AlertCircle, Sparkles } from 'lucide-react';

export default function TermsPage() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

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
                Terms of Service
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Elephant House Wonder AR Tongue Catch Experience • Ceylon Cold Stores PLC
              </p>
            </div>
          </div>
        </div>

        {/* Highlight Card: Fair Play */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-orange-950/20 border border-amber-500/30">
          <div className="flex items-start space-x-3.5">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 flex-shrink-0 mt-0.5">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-amber-200 text-base mb-1">
                Fair Play & Leaderboard Conduct
              </h2>
              <p className="text-xs sm:text-sm text-amber-300/80 leading-relaxed">
                The game is designed for genuine, fun player interaction using AR facial detection. Automated scripts, modified clients, bot manipulation, or exploiting vulnerabilities are prohibited and will result in score disqualification.
              </p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-pink-400" />
              <span>1. Acceptance of Terms</span>
            </h2>
            <p>
              By accessing, browsing, or playing the Elephant House Wonder AR Game, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please refrain from using the game.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>2. Intellectual Property Rights</span>
            </h2>
            <p>
              All trademarks, brand names (&quot;Elephant House&quot;, &quot;Wonder&quot;), character designs, ice cream popsicle artwork, sound effects, audio tracks, and 3D visual assets are the exclusive intellectual property of Ceylon Cold Stores PLC. Any unauthorized reproduction, commercial exploitation, or scraping is strictly prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>3. Physical Safety & Surroundings</span>
            </h2>
            <p>
              Please interact with the augmented reality game in a well-lit, stationary, and safe physical environment. Always remain aware of your physical surroundings to prevent accidents while interacting with the AR camera.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-pink-400" />
              <span>4. Modifications & Availability</span>
            </h2>
            <p>
              Ceylon Cold Stores PLC reserves the right to modify gameplay mechanics, suspend the game for scheduled maintenance, or update leaderboard rules at any time without prior notice.
            </p>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/privacy"
            className="text-xs text-pink-400 hover:text-pink-300 font-semibold underline"
          >
            Read our Privacy Policy &rarr;
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
