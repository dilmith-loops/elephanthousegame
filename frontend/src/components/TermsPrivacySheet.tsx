'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldCheck,
  Camera,
  Database,
  Lock,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  EyeOff,
  Sparkles,
  Award
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'privacy' | 'terms';
}

export default function TermsPrivacySheet({
  isOpen,
  onClose,
  defaultTab = 'terms'
}: Props) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(defaultTab);
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startYRef = useRef<number>(0);
  const currentDragRef = useRef<number>(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Sync activeTab with defaultTab when defaultTab changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Handle open / close lifecycle with smooth slide animations
  useEffect(() => {
    let animFrame: number;
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
      setDragOffset(0);
      currentDragRef.current = 0;
      // Allow browser DOM paint before triggering slide-up transition
      animFrame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else if (isRendered && !isClosing) {
      // Trigger slide-down closing animation
      setIsVisible(false);
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
        setDragOffset(0);
        currentDragRef.current = 0;
      }, 300);
      return () => {
        clearTimeout(timer);
        cancelAnimationFrame(animFrame);
      };
    }
    return () => cancelAnimationFrame(animFrame);
  }, [isOpen, isRendered, isClosing]);

  // Close handler with slide-down animation
  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsVisible(false);
    setIsClosing(true);
    setTimeout(() => {
      setIsRendered(false);
      setIsClosing(false);
      setDragOffset(0);
      currentDragRef.current = 0;
      onClose();
    }, 280);
  }, [isClosing, onClose]);

  // Lock body scroll while sheet is open
  useEffect(() => {
    if (!isRendered) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isRendered]);

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Drag-to-dismiss gesture handling (touch + pointer)
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startYRef.current = clientY;
    currentDragRef.current = 0;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - startYRef.current;

    // Only allow dragging downward (positive deltaY) with rubber-band resistance for upward
    if (deltaY > 0) {
      currentDragRef.current = deltaY;
      setDragOffset(deltaY);
    } else {
      // Gentle rubber-band effect if pulled upward
      const dampened = deltaY * 0.15;
      currentDragRef.current = dampened;
      setDragOffset(dampened);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // If dragged down more than 90px, dismiss sheet
    if (currentDragRef.current > 90) {
      handleClose();
    } else {
      // Snap back to open position
      setDragOffset(0);
      currentDragRef.current = 0;
    }
  };

  if (!isRendered) return null;

  // Compute backdrop opacity based on drag
  const backdropOpacity = isVisible && !isClosing
    ? Math.max(0, 1 - dragOffset / 350)
    : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-privacy-title"
      className="fixed inset-0 z-[60] flex flex-col justify-end items-center overflow-hidden select-none"
      style={{
        pointerEvents: isVisible && !isClosing ? 'auto' : 'none'
      }}
    >
      {/* Clickable Backdrop with fade transition */}
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm transition-opacity duration-300 ease-out cursor-pointer"
        style={{ opacity: backdropOpacity }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet Container */}
      <div
        ref={sheetRef}
        className="relative z-10 w-full max-w-full sm:max-w-2xl bg-white dark:bg-slate-900 rounded-t-[30px] sm:rounded-t-[36px] shadow-[0_-12px_45px_rgba(0,0,0,0.35)] border-t border-pink-200/80 dark:border-slate-800 flex flex-col max-h-[90vh] sm:max-h-[84vh] overflow-hidden"
        style={{
          transform: isVisible && !isClosing
            ? `translateY(${Math.max(0, dragOffset)}px)`
            : 'translateY(100%)',
          transition: isDragging ? 'none' : 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform'
        }}
      >
        {/* Swipe-Down Drag Zone & Handle */}
        <div
          className="w-full pt-3.5 pb-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
        >
          <div className="w-14 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full hover:bg-slate-400 transition-colors" />
        </div>

        {/* Header Bar */}
        <div
          className="flex items-center justify-between px-5 sm:px-7 pt-1 pb-3.5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 touch-none select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 p-0.5 shadow-md shadow-pink-500/25 flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
            <div>
              <h2
                id="terms-privacy-title"
                className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight"
              >
                Terms & Privacy Policy
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                Elephant House Wonder AR Experience • Ceylon Cold Stores PLC
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 sm:px-7 pt-3 pb-2 flex-shrink-0 bg-white dark:bg-slate-900">
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-xs font-black">
            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'privacy'
                  ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Privacy Policy</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('terms')}
              className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'terms'
                  ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Terms of Service</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body (Hidden custom scrollbars to prevent edge glitches on mobile) */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-5 sm:px-7 py-3 space-y-4 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {activeTab === 'privacy' ? (
            <div className="space-y-4">
              {/* Highlight Card: Zero Camera Storage Guarantee */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/20 border border-pink-200/80 dark:border-pink-900/50">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-pink-500 text-white flex-shrink-0 mt-0.5">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-pink-950 dark:text-pink-200 text-sm mb-1">
                      100% On-Device AR Face Tracking
                    </h3>
                    <p className="text-[12px] text-pink-900/80 dark:text-pink-300/80 leading-normal">
                      Camera feed is processed strictly in real-time in your device&apos;s browser using Google MediaPipe. <strong>We NEVER record, store, transmit, or share your camera images or facial geometry.</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 1: Data We Collect */}
              <section className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5 text-pink-500" />
                  <span>Information We Collect</span>
                </h3>
                <ul className="space-y-1.5 list-disc pl-4 text-[12px] text-slate-600 dark:text-slate-400">
                  <li>
                    <strong className="text-slate-900 dark:text-slate-200">Player Nickname:</strong> The name you enter to display on your high score and public leaderboard.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-slate-200">Game Statistics:</strong> Scores achieved, popsicles caught, and duration of gameplay sessions.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-slate-200">No Contact Info Exposure:</strong> No personal contact numbers or private identifiers are displayed on the public leaderboard.
                  </li>
                </ul>
              </section>

              {/* Section 2: Camera & Permissions */}
              <section className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-pink-500" />
                  <span>Camera Permissions</span>
                </h3>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  Camera permission is requested solely to detect mouth-opening gestures so you can catch falling virtual ice cream popsicles in augmented reality. You may revoke camera permissions at any time via your browser settings.
                </p>
              </section>

              {/* Section 3: Data Security & Storage */}
              <section className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-pink-500" />
                  <span>Data Security & Encryption</span>
                </h3>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  All communication between your device and our servers is secured using modern TLS 1.3/HTTPS encryption with HTTP Strict Transport Security (HSTS). We implement strict access controls and rate limiting to protect your information.
                </p>
              </section>

              {/* Section 4: Contact */}
              <section className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                <p>
                  Questions about privacy? Contact us at{' '}
                  <a
                    href="mailto:security@loopsintegrated.co"
                    className="text-pink-600 dark:text-pink-400 font-bold underline"
                  >
                    security@loopsintegrated.co
                  </a>
                  . Operated by Ceylon Cold Stores PLC (Elephant House).
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Highlight Card: Fair Play */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-900/50">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-amber-500 text-slate-950 flex-shrink-0 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-amber-950 dark:text-amber-200 text-sm mb-1">
                      Fair Play & Leaderboard Rules
                    </h3>
                    <p className="text-[12px] text-amber-900/80 dark:text-amber-300/80 leading-normal">
                      The game is meant to be fun and challenging. Automated scripts, modified clients, bot manipulation, or exploiting vulnerabilities are prohibited and will result in score disqualification.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 1: Acceptance */}
              <section className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-500" />
                  <span>Acceptance of Terms</span>
                </h3>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  By tapping &quot;PLAY NOW&quot; or accessing the Elephant House Wonder AR Experience, you agree to comply with and be bound by these terms. If you do not agree, please do not use the game.
                </p>
              </section>

              {/* Section 2: Intellectual Property */}
              <section className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  <span>Intellectual Property</span>
                </h3>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  All trademarks, logos (&quot;Elephant House&quot;, &quot;Wonder&quot;), ice cream artwork, audio effects, and 3D visual assets are the exclusive intellectual property of Ceylon Cold Stores PLC. Any unauthorized reproduction, extraction, or scraping is strictly prohibited.
                </p>
              </section>

              {/* Section 3: Safety & Environment */}
              <section className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>User Safety</span>
                </h3>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  Please play in a safe, well-lit environment. Ensure you are mindful of your physical surroundings at all times while interacting with the augmented reality game.
                </p>
              </section>

              {/* Section 4: Rights Reserved */}
              <section className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                <p>
                  Ceylon Cold Stores PLC reserves the right to modify gameplay mechanics, leaderboard standings, or suspend access for maintenance or fair-play violations at its discretion.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Footer Action Button (Enhanced with safe-area-inset for mobile) */}
        <div className="p-4 sm:p-5 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] sm:pb-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex flex-col items-center flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-3 sm:py-3.5 px-6 bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white font-black rounded-2xl shadow-lg shadow-pink-500/25 active:scale-98 transition-all cursor-pointer text-sm flex items-center justify-center space-x-2"
          >
            <span>I Understand & Agree</span>
          </button>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium select-none">
            © Ceylon Cold Stores PLC • Elephant House Wonder AR
          </span>
        </div>

      </div>
    </div>
  );
}
