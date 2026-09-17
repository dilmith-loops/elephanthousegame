'use client';

import { useEffect, useState } from 'react';

export default function SecurityShield() {
  const [isDevToolsDetected, setIsDevToolsDetected] = useState(false);

  useEffect(() => {
    // 1. Prevent Right-Click Context Menu (Inspect Element, View Source)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // 2. Prevent Keyboard Shortcuts for DevTools, Inspect, and Page Source
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 key (Chrome, Edge, Firefox, etc.)
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey; // (Option key on Mac)
      const key = (e.key || '').toUpperCase();

      // Ctrl + Shift + I (Inspect) or Cmd + Option + I (Mac Inspect)
      // Ctrl + Shift + J (Console) or Cmd + Option + J (Mac Console)
      // Ctrl + Shift + C (Inspect Element picker) or Cmd + Option + C
      // Ctrl + Shift + K (Firefox Web Console)
      // Ctrl + Shift + P (DevTools Command Palette)
      if (isCtrlOrCmd && isShift && (key === 'I' || key === 'J' || key === 'C' || key === 'K' || key === 'P')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Mac specific Option + Cmd + key
      if (e.metaKey && isAlt && (key === 'I' || key === 'J' || key === 'C' || key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + U / Cmd + U (View Page Source)
      if (isCtrlOrCmd && !isShift && key === 'U') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + S / Cmd + S (Save Page)
      if (isCtrlOrCmd && !isShift && key === 'S') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + P / Cmd + P (Print Page)
      if (isCtrlOrCmd && !isShift && key === 'P') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Firefox Style Editor (Shift + F7)
      if (isShift && (e.key === 'F7' || e.keyCode === 118)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 3. Prevent dragging assets / DOM elements
    const handleDragStart = (e: DragEvent) => {
      // Allow drag within file inputs if applicable, otherwise prevent
      const target = e.target as HTMLElement | null;
      if (target?.tagName === 'INPUT' && (target as HTMLInputElement).type === 'file') {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // 4. Security notice in console & clear history
    try {
      console.clear();
      console.log(
        '%c⛔ SECURITY NOTICE',
        'color: #f43f5e; font-size: 28px; font-weight: 900; -webkit-text-stroke: 1px black;'
      );
      console.log(
        '%cDeveloper tools, DOM inspection, and console tampering are restricted on this application for security and fair competition.',
        'color: #fb7185; font-size: 13px; font-weight: bold;'
      );
    } catch {
      // Ignore
    }

    // Attach listeners with capture phase to intercept prior to bubbling
    window.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('dragstart', handleDragStart, { capture: true });
    document.addEventListener('contextmenu', handleContextMenu, { capture: true });
    document.addEventListener('keydown', handleKeyDown, { capture: true });

    // 5. Active DevTools Detection & Anti-Debug Loop
    const isMobile =
      typeof navigator !== 'undefined' &&
      (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window && window.innerWidth < 768));

    const debugInterval = setInterval(() => {
      let isPaused = false;
      const start = performance.now();

      try {
        // Evaluates debugger statement.
        // When DevTools is closed, this completes instantaneously (< 0.01ms).
        // When DevTools is open, the JavaScript engine halts execution.
        const evaluateDebugger = new Function('debugger');
        evaluateDebugger();
      } catch {
        // Ignore
      }

      const elapsed = performance.now() - start;
      if (elapsed > 100) {
        isPaused = true;
      }

      // Check window outer vs inner dimension delta (only for desktop browsers where DevTools can be docked)
      let isDocked = false;
      if (!isMobile) {
        const widthDelta = window.outerWidth - window.innerWidth;
        const heightDelta = window.outerHeight - window.innerHeight;
        // Large deltas indicate docked DevTools panel
        if (widthDelta > 180 || heightDelta > 220) {
          isDocked = true;
        }
      }

      if (isPaused || isDocked) {
        setIsDevToolsDetected(true);
      } else {
        setIsDevToolsDetected(false);
      }
    }, 500);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('dragstart', handleDragStart, { capture: true });
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      clearInterval(debugInterval);
    };
  }, []);

  if (!isDevToolsDetected) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-0 z-[999999] bg-slate-950/98 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none"
    >
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4 text-rose-500 shadow-lg shadow-rose-950/50">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
        Inspection Restricted
      </h2>
      <p className="text-sm text-slate-400 max-w-md font-medium leading-relaxed mb-6">
        Developer Tools and Inspect Element cannot be used on Elephant House WONDER. Please close Developer Tools to continue playing.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer"
      >
        Reload Page
      </button>
    </div>
  );
}
