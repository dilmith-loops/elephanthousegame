'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Share2,
  Sparkles,
  ExternalLink,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import {
  ScoreCardData,
  GeneratedCardResult,
  generateScoreCard,
  copyCaptionToClipboard,
  downloadScoreCard,
  shareViaNative
} from '../lib/shareCard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  score: number;
  catches: number;
  maxCombo: number;
  durationSeconds: number;
  rank?: number;
}

export default function SocialShareModal({
  isOpen,
  onClose,
  playerName,
  score,
  catches,
  maxCombo,
  durationSeconds,
  rank
}: Props) {
  const [format, setFormat] = useState<'story' | 'post'>('story');
  const [generating, setGenerating] = useState<boolean>(true);
  const [cardResult, setCardResult] = useState<GeneratedCardResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' = 'success', duration = 4000) => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((cur) => (cur?.text === text ? null : cur));
    }, duration);
  }, []);

  // Generate card whenever format or score changes
  const loadCard = useCallback(async () => {
    setGenerating(true);
    try {
      const data: ScoreCardData = {
        playerName,
        score,
        catches,
        maxCombo,
        durationSeconds,
        rank,
        format
      };
      const result = await generateScoreCard(data);
      setCardResult(result);
    } catch (err) {
      console.error('Failed to generate score card:', err);
      showToast('Could not render score card image', 'info');
    } finally {
      setGenerating(false);
    }
  }, [playerName, score, catches, maxCombo, durationSeconds, rank, format, showToast]);

  useEffect(() => {
    if (isOpen) {
      loadCard();
    }
  }, [isOpen, loadCard]);

  if (!isOpen) return null;

  // Handle 1-tap Copy Caption
  const handleCopyCaption = async () => {
    if (!cardResult) return;
    const ok = await copyCaptionToClipboard(cardResult.shareText);
    if (ok) {
      setCopied(true);
      showToast('📋 Caption copied to clipboard! Paste it into your post or story.');
      setTimeout(() => setCopied(false), 3000);
    } else {
      showToast('Could not copy to clipboard automatically', 'info');
    }
  };

  // 1. Instagram & Instagram Story Sharing
  const handleInstagramShare = async () => {
    if (!cardResult) return;
    setActiveAction('instagram');
    try {
      // Step 1: Always copy caption so user has it ready
      await copyCaptionToClipboard(cardResult.shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);

      // Step 2: On mobile, Web Share with the image file passes it directly into iOS/Android share sheet
      const hasNativeShare = typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [cardResult.file] });

      if (hasNativeShare) {
        showToast('📸 Caption copied! Select Instagram > Your Story or Feed, then tap Paste!', 'success', 5000);
        await shareViaNative(cardResult.file, cardResult.shareText, 'My Elephant House AR Score');
      } else {
        // Desktop or unsupported browser fallback: download image and prompt
        downloadScoreCard(cardResult.blob, score, format);
        showToast('📸 Card downloaded & caption copied! Upload to Instagram and paste caption.', 'success', 6000);
        setTimeout(() => {
          window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
        }, 1200);
      }
    } catch (err) {
      console.error('Instagram share error:', err);
    } finally {
      setActiveAction(null);
    }
  };

  // 2. Facebook & Facebook Story Sharing
  const handleFacebookShare = async () => {
    if (!cardResult) return;
    setActiveAction('facebook');
    try {
      // Step 1: Copy caption
      await copyCaptionToClipboard(cardResult.shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);

      const hasNativeShare = typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [cardResult.file] });

      if (hasNativeShare) {
        showToast('📸 Caption copied! Select Facebook > Add to Story or Post, then tap Paste!', 'success', 5000);
        await shareViaNative(cardResult.file, cardResult.shareText, 'My Elephant House AR Score');
      } else {
        // Open Facebook Web Sharer dialog
        showToast('📸 Caption copied! Paste into your Facebook post or story.', 'success', 5000);
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cardResult.shareUrl)}&quote=${encodeURIComponent(cardResult.shareText)}`;
        window.open(fbUrl, '_blank', 'width=626,height=436,noopener,noreferrer');
      }
    } catch (err) {
      console.error('Facebook share error:', err);
    } finally {
      setActiveAction(null);
    }
  };

  // 3. WhatsApp Sharing
  const handleWhatsAppShare = async () => {
    if (!cardResult) return;
    setActiveAction('whatsapp');
    try {
      await copyCaptionToClipboard(cardResult.shareText);
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(cardResult.shareText)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      showToast('💬 Opening WhatsApp with your high score challenge!');
    } catch (err) {
      console.error('WhatsApp share error:', err);
    } finally {
      setActiveAction(null);
    }
  };

  // 4. Download Card Image
  const handleDownload = () => {
    if (!cardResult) return;
    downloadScoreCard(cardResult.blob, score, format);
    copyCaptionToClipboard(cardResult.shareText);
    showToast('⬇️ High-resolution score card saved to your downloads!');
  };

  // 5. System More Options
  const handleSystemShare = async () => {
    if (!cardResult) return;
    setActiveAction('system');
    try {
      await copyCaptionToClipboard(cardResult.shareText);
      await shareViaNative(cardResult.file, cardResult.shareText, 'My Elephant House AR Game Score');
    } catch (err) {
      console.error('System share error:', err);
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Background click dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share Score to Socials"
        className="relative z-10 w-full max-w-lg bg-slate-900/95 rounded-[32px] sm:rounded-[36px] border border-pink-500/30 text-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden select-none animate-in zoom-in-95 duration-200"
      >
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 inset-x-4 z-40 flex items-center justify-center pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
            <div
              className={`px-4 py-2.5 rounded-2xl shadow-xl text-xs sm:text-sm font-bold flex items-center space-x-2 border pointer-events-auto backdrop-blur-md ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50 shadow-emerald-900/40'
                  : 'bg-amber-950/90 text-amber-200 border-amber-500/50 shadow-amber-900/40'
              }`}
            >
              {toastMessage.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-4 sm:p-5 pb-3 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-pink-950/40 via-purple-950/20 to-transparent">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#b21f85] to-[#f43f5e] p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black bg-gradient-to-r from-white via-pink-100 to-amber-200 bg-clip-text text-transparent leading-tight">
                Share High Score
              </h2>
              <p className="text-[11px] sm:text-xs text-pink-300/80 font-bold">
                {playerName} • {score.toLocaleString()} Marks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 pr-3.5 scrollbar-thin scrollbar-thumb-pink-500/30 scrollbar-track-transparent">
          {/* Format Selector (Story vs Post) */}
          <div className="flex items-center justify-center space-x-2 bg-slate-800/80 p-1.5 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setFormat('story')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                format === 'story'
                  ? 'bg-gradient-to-r from-[#b21f85] to-[#e11d48] text-white shadow-md shadow-pink-600/30 scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>📱</span>
              <span>Story (9:16)</span>
              <span className="text-[10px] opacity-75 hidden sm:inline">• IG & FB Stories</span>
            </button>

            <button
              type="button"
              onClick={() => setFormat('post')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                format === 'post'
                  ? 'bg-gradient-to-r from-[#b21f85] to-[#e11d48] text-white shadow-md shadow-pink-600/30 scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🖼️</span>
              <span>Feed Post (4:5)</span>
              <span className="text-[10px] opacity-75 hidden sm:inline">• Grid Post</span>
            </button>
          </div>

          {/* Interactive Card Preview */}
          <div className="relative rounded-2xl bg-black/40 border border-white/10 p-2 sm:p-3 flex flex-col items-center justify-center overflow-hidden">
            {generating ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2">
                <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400 font-bold">Rendering branded score card...</p>
              </div>
            ) : cardResult ? (
              <div className="relative group max-h-[210px] sm:max-h-[260px] rounded-2xl overflow-hidden shadow-2xl border-2 border-pink-400/40 flex items-center justify-center bg-slate-950">
                <img
                  src={cardResult.dataUrl}
                  alt="Score Card Preview"
                  className="max-h-[210px] sm:max-h-[260px] w-auto max-w-full object-contain block select-none pointer-events-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const win = window.open();
                    if (win) {
                      win.document.write(`<img src="${cardResult.dataUrl}" style="max-width:100%;height:auto;display:block;margin:auto;" />`);
                    }
                  }}
                  className="absolute bottom-2 right-2 bg-black/70 hover:bg-black/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm border border-white/20 flex items-center space-x-1 transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Full Size</span>
                </button>
              </div>
            ) : null}
          </div>

          {/* Auto-Copied Caption Section */}
          <div className="bg-slate-800/80 rounded-2xl p-3 sm:p-3.5 border border-pink-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-pink-300 uppercase tracking-wider flex items-center space-x-1">
                <span>📝</span>
                <span>Post & Story Caption</span>
              </span>
              <button
                type="button"
                onClick={handleCopyCaption}
                className={`py-1 px-3 rounded-lg text-xs font-black transition-all flex items-center space-x-1 cursor-pointer ${
                  copied
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'bg-pink-600 hover:bg-pink-500 text-white shadow-sm'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Caption'}</span>
              </button>
            </div>

            <p className="text-xs sm:text-[13px] text-slate-200 bg-slate-900/80 p-2.5 rounded-xl border border-white/5 font-medium leading-relaxed select-text">
              {cardResult?.shareText || `🍦 I just scored ${score} marks on Elephant House AR Game! Can you beat my high score? 🏆`}
            </p>

            <div className="text-[10.5px] sm:text-[11px] text-amber-200/90 bg-amber-950/30 border border-amber-500/30 p-2 rounded-xl flex items-start space-x-1.5">
              <span className="text-amber-400 mt-0.5">💡</span>
              <span>
                <strong>Instagram & Facebook Policy:</strong> Mobile apps block web browsers from auto-typing captions. We copy your caption automatically when you tap below — just <strong>Paste</strong> it when your Story or Post composer opens!
              </span>
            </div>
          </div>

          {/* Platform Share Action Buttons Grid */}
          <div className="space-y-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
              Share To Platform
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* 1. Instagram Button (Stories & Feed) */}
              <button
                type="button"
                onClick={handleInstagramShare}
                disabled={!cardResult || activeAction !== null}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-rose-900/30 flex items-center justify-center space-x-2 transition-transform active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {activeAction === 'instagram' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-base">📸</span>
                )}
                <span>Instagram (Story & Post)</span>
              </button>

              {/* 2. Facebook Button (Stories & Feed) */}
              <button
                type="button"
                onClick={handleFacebookShare}
                disabled={!cardResult || activeAction !== null}
                className="py-3 px-4 rounded-2xl bg-[#1877f2] hover:bg-[#166fe5] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-900/30 flex items-center justify-center space-x-2 transition-transform active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {activeAction === 'facebook' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-base">👥</span>
                )}
                <span>Facebook (Story & Post)</span>
              </button>

              {/* 3. WhatsApp Button */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                disabled={!cardResult || activeAction !== null}
                className="py-3 px-4 rounded-2xl bg-[#25d366] hover:bg-[#20bd5a] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-900/30 flex items-center justify-center space-x-2 transition-transform active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Challenge</span>
              </button>

              {/* 4. Save Score Card to Photos */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={!cardResult}
                className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs sm:text-sm border border-white/10 shadow-sm flex items-center justify-center space-x-2 transition-transform active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-pink-400" />
                <span>Save Image to Photos</span>
              </button>
            </div>

            {/* 5. System More Options */}
            <button
              type="button"
              onClick={handleSystemShare}
              disabled={!cardResult || activeAction !== null}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-white/10 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>More Options (Telegram, AirDrop, Messages)</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">
            Elephant House AR Tongue Catch
          </span>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
