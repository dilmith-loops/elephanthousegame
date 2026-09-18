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
        <div className="flex items-center justify-between px-5 sm:px-7 pb-3.5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 select-none">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 p-0.5 shadow-md shadow-pink-500/25 flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h2
                id="terms-privacy-title"
                className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate"
              >
                Terms & Privacy Policy
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 flex-shrink-0 ml-3"
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
              {/* Highlight Card: 100% On-Device AR Face Tracking */}
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
                      Camera access is used to detect gameplay gestures, such as mouth-opening, required for the AR experience. Camera processing is performed in real time on your device. We do not record, store, upload, or share camera images, video, or facial geometry.
                    </p>
                  </div>
                </div>
              </div>

              {/* INFORMATION WE COLLECT */}
              <section className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5 text-pink-500" />
                  <span>Information We Collect</span>
                </h3>
                <ul className="space-y-2 list-disc pl-4 text-[12px] text-slate-600 dark:text-slate-400">
                  <li>
                    <strong className="text-slate-900 dark:text-slate-200">Player Nickname:</strong> The name you enter may be displayed with your score on the public game leaderboard.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-slate-200">Game Statistics:</strong> We may collect gameplay information such as scores, game duration, items caught, and session results.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-slate-200">Technical Information:</strong> Limited technical information may be processed where necessary to operate, secure, and improve the game.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-slate-200">No Contact Information Required:</strong> The game does not require you to provide a phone number, email address, or home address to play.
                  </li>
                </ul>
              </section>

              {/* CAMERA PERMISSIONS */}
              <section className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <Camera className="w-3.5 h-3.5 text-pink-500" />
                  <span>Camera Permissions</span>
                </h3>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  Camera access is required only for AR gameplay features. You can deny or revoke camera permission through your browser or device settings. Some game features may not function without camera access.
                </p>
              </section>

              {/* DATA SECURITY */}
              <section className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-pink-500" />
                  <span>Data Security</span>
                </h3>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  Reasonable technical and organizational measures are used to protect game data against unauthorized access, loss, alteration, or misuse. Internet communications are protected using secure HTTPS connections where supported.
                </p>
              </section>

              {/* LEADERBOARD PRIVACY */}
              <section className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <EyeOff className="w-3.5 h-3.5 text-pink-500" />
                  <span>Leaderboard Privacy</span>
                </h3>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  Your chosen nickname and game score may appear on the public leaderboard. Avoid using your full legal name, phone number, email address, or other sensitive information as your nickname.
                </p>
              </section>

              {/* CHILDREN & SAFE USE */}
              <section className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Children &amp; Safe Use</span>
                </h3>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  Children should use the experience with appropriate parent or guardian supervision. Players should remain aware of their physical surroundings while using camera-based AR features.
                </p>
              </section>

              {/* Last Updated */}
              <div className="pt-2 text-center">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  Last updated: September 2026
                </span>
              </div>
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
                      Fair Play &amp; Leaderboard Rules
                    </h3>
                    <p className="text-[12px] text-amber-900/80 dark:text-amber-300/80 leading-normal">
                      The game is intended to be fun, fair, and competitive. Automated scripts, bots, modified clients, score manipulation, exploitation of vulnerabilities, or other methods of unfairly altering gameplay or leaderboard results are prohibited. Invalid or suspicious scores may be removed.
                    </p>
                  </div>
                </div>
              </div>

              {/* ACCEPTANCE OF TERMS */}
              <section className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-500" />
                  <span>Acceptance of Terms</span>
                </h3>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  By selecting &ldquo;I Understand &amp; Agree&rdquo; and accessing Elephant House Wonder AR, you agree to follow these Terms of Service and the Privacy Policy. If you do not agree, please do not continue to the game.
                </p>
              </section>

              {/* GAMEPLAY & ELIGIBILITY */}
              <section className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  <span>Gameplay &amp; Eligibility</span>
                </h3>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  Players must use the game only for its intended entertainment purpose. Where a player is a minor, participation should be subject to appropriate parent or guardian supervision or consent where required.
                </p>
              </section>

              {/* INTELLECTUAL PROPERTY */}
              <section className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-pink-500" />
                  <span>Intellectual Property</span>
                </h3>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  All trademarks, logos, brand names, artwork, characters, designs, game content, and other assets remain the property of their respective owners. Unauthorized reproduction, modification, distribution, extraction, or commercial use is prohibited.
                </p>
              </section>

              {/* USER SAFETY */}
              <section className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>User Safety</span>
                </h3>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  Play in a safe and well-lit environment. Remain aware of people, objects, traffic, steps, and other hazards around you while interacting with the augmented-reality experience.
                </p>
              </section>

              {/* GAME AVAILABILITY */}
              <section className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-pink-500" />
                  <span>Game Availability</span>
                </h3>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  The game may be temporarily unavailable due to maintenance, technical issues, updates, or other operational requirements. Features, gameplay mechanics, leaderboard rules, or availability may be updated when necessary.
                </p>
              </section>

              {/* SCORE & ACCESS MANAGEMENT */}
              <section className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Score &amp; Access Management</span>
                </h3>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  Scores obtained through suspected cheating, manipulation, technical exploitation, or violations of these terms may be removed. Access to the game may also be restricted where necessary to protect fair play, security, or other users.
                </p>
              </section>

              {/* LIMITATION OF RESPONSIBILITY */}
              <section className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-pink-500" />
                  <span>Limitation of Responsibility</span>
                </h3>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  Players are responsible for using the game safely and appropriately. To the extent permitted by applicable law, the operator is not responsible for losses resulting from misuse of the game or failure to follow the safety instructions provided.
                </p>
              </section>

              {/* CHANGES TO THESE TERMS */}
              <section className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-pink-500" />
                  <span>Changes to These Terms</span>
                </h3>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  These Terms and the Privacy Policy may be updated when the game, its technology, or applicable requirements change. The latest version should be made available through the game.
                </p>
              </section>

              {/* Last Updated */}
              <div className="pt-2 text-center">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  Last updated: September 2026
                </span>
              </div>
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
