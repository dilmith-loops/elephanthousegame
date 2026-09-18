'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield,
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
  Award,
  User,
  BarChart2
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'privacy' | 'terms';
}

export default function TermsPrivacySheet({
  isOpen,
  onClose,
  defaultTab = 'privacy'
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

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

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
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ease-out cursor-pointer"
        style={{ opacity: backdropOpacity }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet Container */}
      <div
        ref={sheetRef}
        className="relative z-10 w-full max-w-full sm:max-w-[480px] bg-[#fff9f5] rounded-t-[32px] sm:rounded-t-[36px] shadow-[0_-16px_50px_rgba(0,0,0,0.38)] border-t border-[#f7e3d8] flex flex-col max-h-[92vh] sm:max-h-[86vh] overflow-hidden"
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
          className="w-full pt-3 pb-1 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none relative z-20"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
        >
          <div className="w-14 h-1.5 bg-[#e2cbbe] rounded-full hover:bg-[#dac3b5] transition-colors" />
        </div>

        {/* Close Button (Top Right circular soft pink button) */}
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
          className="absolute top-3.5 right-4 sm:top-4 sm:right-6 w-8 h-8 rounded-full bg-[#fdeef2] hover:bg-[#fbdde6] text-[#f43f5e] flex items-center justify-center transition-all cursor-pointer active:scale-95 z-30 shadow-xs"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Header with Title & Mascot Illustration */}
        <div className="relative px-5 sm:px-7 pt-1 pb-0 flex items-end justify-between min-h-[90px] sm:min-h-[105px] select-none flex-shrink-0">
          {/* Decorative side sparkle */}
          <div className="absolute top-3 left-3 text-amber-400 text-xs select-none pointer-events-none opacity-80">
            ✦
          </div>

          {/* Left Title & Subtitle */}
          <div className="relative z-10 pb-1.5 max-w-[65%]">
            <h2
              id="terms-privacy-title"
              className="text-2xl sm:text-[26px] font-black tracking-tight text-[#3d1a16] leading-[1.08]"
            >
              Terms &amp;<br />Privacy Policy
            </h2>
            <p className="text-xs sm:text-[13px] font-semibold text-[#8e6157] mt-1 tracking-tight">
              Your trust keeps the fun going!
            </p>
          </div>

          {/* Mascot Illustration Peeking Over Tab Bar */}
          <div className="relative z-10 flex-shrink-0 -mb-1 mr-0.5">
            <img
              src={`${basePath}/terms_sheet_mascot.png`}
              alt="Elephant House Wonder Mascot"
              className="w-36 sm:w-44 h-auto object-contain pointer-events-none select-none drop-shadow-xs"
            />
          </div>
        </div>

        {/* Tab Switcher (Pill Container matching mockup) */}
        <div className="px-5 sm:px-7 pt-0 pb-2.5 flex-shrink-0 relative z-20">
          <div className="grid grid-cols-2 p-1 bg-[#efe5ed] rounded-full text-xs sm:text-[13px] font-bold border border-pink-100/60 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`py-2 px-3.5 rounded-full transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                activeTab === 'privacy'
                  ? 'bg-white text-[#e11d48] shadow-sm font-extrabold'
                  : 'text-[#786c75] hover:text-[#3d1a16]'
              }`}
            >
              <Shield className={`w-4 h-4 ${activeTab === 'privacy' ? 'text-[#e11d48]' : 'text-[#786c75]'}`} />
              <span>Privacy Policy</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('terms')}
              className={`py-2 px-3.5 rounded-full transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                activeTab === 'terms'
                  ? 'bg-white text-[#e11d48] shadow-sm font-extrabold'
                  : 'text-[#786c75] hover:text-[#3d1a16]'
              }`}
            >
              <FileText className={`w-4 h-4 ${activeTab === 'terms' ? 'text-[#e11d48]' : 'text-[#786c75]'}`} />
              <span>Terms of Service</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-5 sm:px-7 py-2 space-y-4 text-[#3d1a16] text-xs sm:text-[13px] leading-relaxed [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {activeTab === 'privacy' ? (
            <div className="space-y-4">
              {/* Highlight Card: 100% On-Device AR Face Tracking */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#fff0f4] border border-[#fed7e2]/80 shadow-xs relative flex items-start gap-3 overflow-hidden">
                {/* Camera icon badge */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#e11d48] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-pink-500/20 mt-0.5">
                  <Camera className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-1">
                  <h3 className="font-black text-[#831843] text-xs sm:text-sm mb-1 leading-snug">
                    100% On-Device AR Face Tracking
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#754f5c] leading-relaxed">
                    Camera feed is processed strictly in real-time on your device using Google MediaPipe.{' '}
                    <strong className="text-[#9d174d] font-black">
                      We NEVER record, store, transmit, or share your camera images or facial geometry.
                    </strong>
                  </p>
                </div>

                {/* Strawberry Popsicle Graphic */}
                <div className="flex-shrink-0 self-center">
                  <img
                    src={`${basePath}/terms_sheet_popsicle.png`}
                    alt="Popsicle"
                    className="w-12 sm:w-14 h-auto object-contain pointer-events-none select-none drop-shadow-xs"
                  />
                </div>
              </div>

              {/* Section 1: INFORMATION WE COLLECT */}
              <section className="space-y-2.5 pt-1">
                <div className="flex items-center space-x-1.5 text-[#8d7182] text-[11px] font-black uppercase tracking-wider">
                  <Database className="w-3.5 h-3.5 text-[#ec4899]" />
                  <span>Information We Collect</span>
                </div>

                <div className="space-y-2.5 pl-0.5">
                  {/* Row: Player Nickname */}
                  <div className="flex items-start space-x-3">
                    <div className="w-7 h-7 rounded-full bg-[#fdebf3] text-[#ec4899] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="block text-xs font-bold text-[#2e1017]">Player Nickname</strong>
                      <p className="text-[11px] sm:text-xs text-[#6b5864] leading-relaxed">
                        The name you enter to display on your high score and public leaderboard.
                      </p>
                    </div>
                  </div>

                  {/* Row: Game Statistics */}
                  <div className="flex items-start space-x-3">
                    <div className="w-7 h-7 rounded-full bg-[#fdebf3] text-[#ec4899] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <BarChart2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="block text-xs font-bold text-[#2e1017]">Game Statistics</strong>
                      <p className="text-[11px] sm:text-xs text-[#6b5864] leading-relaxed">
                        Scores achieved, popsicles caught, and duration of gameplay sessions.
                      </p>
                    </div>
                  </div>

                  {/* Row: No Contact Info Exposure */}
                  <div className="flex items-start space-x-3">
                    <div className="w-7 h-7 rounded-full bg-[#fdebf3] text-[#ec4899] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <EyeOff className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="block text-xs font-bold text-[#2e1017]">No Contact Info Exposure</strong>
                      <p className="text-[11px] sm:text-xs text-[#6b5864] leading-relaxed">
                        No personal contact numbers or private identifiers are displayed on the public leaderboard.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Divider */}
              <hr className="border-t border-[#f3e3ec] my-1" />

              {/* Section 2: CAMERA PERMISSIONS */}
              <section className="space-y-1.5 pt-0.5">
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-full bg-[#fdebf3] text-[#ec4899] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="block text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#8d7182] mb-0.5">
                      Camera Permissions
                    </strong>
                    <p className="text-[11px] sm:text-xs text-[#6b5864] leading-relaxed">
                      Camera permission is requested solely to detect mouth-opening gestures so you can catch falling virtual ice cream popsicles in augmented reality. You may revoke camera permissions at any time via your device settings.
                    </p>
                  </div>
                </div>
              </section>

              {/* Divider */}
              <hr className="border-t border-[#f3e3ec] my-1" />

              {/* Section 3: DATA SECURITY & ENCRYPTION */}
              <section className="space-y-1.5 pt-0.5">
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-full bg-[#fdebf3] text-[#ec4899] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="block text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#8d7182] mb-0.5">
                      Data Security &amp; Encryption
                    </strong>
                    <p className="text-[11px] sm:text-xs text-[#6b5864] leading-relaxed">
                      All communication between your device and our servers is secured using modern TLS 1.3/HTTPS encryption with HTTP Strict Transport Security (HSTS). We implement strict access controls and rate limiting to protect your information.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 4: CHILDREN & SAFE USE */}
              <section className="space-y-1.5 pt-0.5">
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-full bg-[#fef3c7] text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="block text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#8d7182] mb-0.5">
                      Children &amp; Safe Surroundings
                    </strong>
                    <p className="text-[11px] sm:text-xs text-[#6b5864] leading-relaxed">
                      Children should use the experience with parent or guardian supervision. Always remain aware of your physical surroundings while playing in AR.
                    </p>
                  </div>
                </div>
              </section>

              {/* Last Updated */}
              <div className="pt-1 pb-1 text-center">
                <span className="text-[10px] sm:text-[11px] text-[#9d808e] font-medium">
                  Last updated: September 2026 • Elephant House Wonder AR
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Highlight Card: Fair Play */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#fff7ed] border border-amber-200/80 shadow-xs relative flex items-start gap-3 overflow-hidden">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-500/20 mt-0.5">
                  <Award className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 pr-1">
                  <h3 className="font-black text-amber-950 text-xs sm:text-sm mb-1 leading-snug">
                    Fair Play &amp; Leaderboard Rules
                  </h3>
                  <p className="text-[11px] sm:text-xs text-amber-900/80 leading-relaxed">
                    The game is intended to be fun, sweet, and competitive for everyone.{' '}
                    <strong className="text-amber-950 font-black">
                      Automated scripts, bots, score manipulation, or tampering are strictly prohibited.
                    </strong>
                  </p>
                </div>
              </div>

              {/* Section: Acceptance of Terms */}
              <section className="space-y-1.5 pt-0.5">
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-full bg-[#fdebf3] text-[#ec4899] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="block text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#8d7182] mb-0.5">
                      Acceptance of Terms
                    </strong>
                    <p className="text-[11px] sm:text-xs text-[#6b5864] leading-relaxed">
                      By selecting &ldquo;I Understand &amp; Agree&rdquo; and playing Elephant House Wonder AR, you agree to these Terms of Service and the Privacy Policy.
                    </p>
                  </div>
                </div>
              </section>

              {/* Divider */}
              <hr className="border-t border-[#f3e3ec] my-1" />

              {/* Section: Intellectual Property */}
              <section className="space-y-1.5 pt-0.5">
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-full bg-[#fdebf3] text-[#ec4899] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="block text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#8d7182] mb-0.5">
                      Intellectual Property
                    </strong>
                    <p className="text-[11px] sm:text-xs text-[#6b5864] leading-relaxed">
                      All Elephant House trademarks, popsicle 3D models, branding, artwork, sound effects, and mascot designs are the intellectual property of Ceylon Cold Stores PLC.
                    </p>
                  </div>
                </div>
              </section>

              {/* Divider */}
              <hr className="border-t border-[#f3e3ec] my-1" />

              {/* Section: User Safety */}
              <section className="space-y-1.5 pt-0.5">
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-full bg-[#fef3c7] text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="block text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#8d7182] mb-0.5">
                      User Safety &amp; Environment
                    </strong>
                    <p className="text-[11px] sm:text-xs text-[#6b5864] leading-relaxed">
                      Please play in a safe, well-lit area. Be mindful of obstacles, stairs, and people around you while interacting with AR face gestures.
                    </p>
                  </div>
                </div>
              </section>

              {/* Divider */}
              <hr className="border-t border-[#f3e3ec] my-1" />

              {/* Section: Game Availability */}
              <section className="space-y-1.5 pt-0.5">
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-full bg-[#fdebf3] text-[#ec4899] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="block text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#8d7182] mb-0.5">
                      Game Availability &amp; Modifications
                    </strong>
                    <p className="text-[11px] sm:text-xs text-[#6b5864] leading-relaxed">
                      We strive to keep the game accessible at all times, though scheduled maintenance or feature upgrades may occur periodically.
                    </p>
                  </div>
                </div>
              </section>

              {/* Last Updated */}
              <div className="pt-1 pb-1 text-center">
                <span className="text-[10px] sm:text-[11px] text-[#9d808e] font-medium">
                  Last updated: September 2026 • Elephant House Wonder AR
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Pastel Clouds Background & Berry Action Button */}
        <div className="relative px-5 sm:px-7 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] sm:pb-6 flex flex-col items-center justify-center flex-shrink-0 overflow-hidden select-none">
          {/* Decorative Pink Clouds at Bottom Left and Right Corners */}
          <div className="absolute -bottom-2 -left-4 w-36 h-24 pointer-events-none opacity-85">
            <svg viewBox="0 0 160 110" fill="none" className="w-full h-full">
              <circle cx="25" cy="95" r="45" fill="#fbcfe8" fillOpacity="0.55" />
              <circle cx="75" cy="100" r="42" fill="#f472b6" fillOpacity="0.32" />
              <circle cx="35" cy="65" r="38" fill="#fbcfe8" fillOpacity="0.48" />
              <circle cx="-5" cy="45" r="35" fill="#fda4af" fillOpacity="0.4" />
            </svg>
          </div>
          <div className="absolute -bottom-2 -right-4 w-36 h-24 pointer-events-none opacity-85">
            <svg viewBox="0 0 160 110" fill="none" className="w-full h-full">
              <circle cx="135" cy="95" r="45" fill="#fbcfe8" fillOpacity="0.55" />
              <circle cx="85" cy="100" r="42" fill="#f472b6" fillOpacity="0.32" />
              <circle cx="125" cy="65" r="38" fill="#fbcfe8" fillOpacity="0.48" />
              <circle cx="165" cy="45" r="35" fill="#fda4af" fillOpacity="0.4" />
            </svg>
          </div>

          {/* Action Button matching mockup berry plum pill */}
          <button
            type="button"
            onClick={handleClose}
            className="relative z-10 w-full py-3.5 sm:py-4 px-6 bg-[#931b54] hover:bg-[#831843] active:bg-[#70133f] text-white font-black rounded-full shadow-[0_8px_25px_rgba(147,27,84,0.38)] active:scale-[0.98] transition-all cursor-pointer text-sm sm:text-base border border-white/25 flex items-center justify-center tracking-wide"
          >
            <span>I Understand &amp; Agree</span>
          </button>
        </div>

      </div>
    </div>
  );
}
