'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, CheckCircle2, Award, AlertCircle, Sparkles, Lock, FileText } from 'lucide-react';

export default function TermsPage() {
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
                Elephant House Wonder AR Experience • Ceylon Cold Stores PLC
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
                FAIR PLAY &amp; LEADERBOARD RULES
              </h2>
              <p className="text-xs sm:text-sm text-amber-300/80 leading-relaxed">
                The game is intended to be fun, fair, and competitive. Automated scripts, bots, modified clients, score manipulation, exploitation of vulnerabilities, or other methods of unfairly altering gameplay or leaderboard results are prohibited. Invalid or suspicious scores may be removed.
              </p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-pink-400" />
              <span>ACCEPTANCE OF TERMS</span>
            </h2>
            <p>
              By selecting &ldquo;I Understand &amp; Agree&rdquo; and accessing Elephant House Wonder AR, you agree to follow these Terms of Service and the Privacy Policy. If you do not agree, please do not continue to the game.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>GAMEPLAY &amp; ELIGIBILITY</span>
            </h2>
            <p>
              Players must use the game only for its intended entertainment purpose. Where a player is a minor, participation should be subject to appropriate parent or guardian supervision or consent where required.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Lock className="w-4 h-4 text-pink-400" />
              <span>INTELLECTUAL PROPERTY</span>
            </h2>
            <p>
              All trademarks, logos, brand names, artwork, characters, designs, game content, and other assets remain the property of their respective owners. Unauthorized reproduction, modification, distribution, extraction, or commercial use is prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>USER SAFETY</span>
            </h2>
            <p>
              Play in a safe and well-lit environment. Remain aware of people, objects, traffic, steps, and other hazards around you while interacting with the augmented-reality experience.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-pink-400" />
              <span>GAME AVAILABILITY</span>
            </h2>
            <p>
              The game may be temporarily unavailable due to maintenance, technical issues, updates, or other operational requirements. Features, gameplay mechanics, leaderboard rules, or availability may be updated when necessary.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>SCORE &amp; ACCESS MANAGEMENT</span>
            </h2>
            <p>
              Scores obtained through suspected cheating, manipulation, technical exploitation, or violations of these terms may be removed. Access to the game may also be restricted where necessary to protect fair play, security, or other users.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-pink-400" />
              <span>LIMITATION OF RESPONSIBILITY</span>
            </h2>
            <p>
              Players are responsible for using the game safely and appropriately. To the extent permitted by applicable law, the operator is not responsible for losses resulting from misuse of the game or failure to follow the safety instructions provided.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-pink-400" />
              <span>CHANGES TO THESE TERMS</span>
            </h2>
            <p>
              These Terms and the Privacy Policy may be updated when the game, its technology, or applicable requirements change. The latest version should be made available through the game.
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
