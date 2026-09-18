'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Check,
  Download,
  Share2,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  Smartphone,
  Image as ImageIcon,
  ChevronRight
} from 'lucide-react';
import {
  ScoreCardData,
  GeneratedCardResult,
  generateScoreCard,
  copyCaptionToClipboard,
  downloadScoreCard,
  shareViaNative
} from '../lib/shareCard';
import { trackGAEvent } from '../lib/analytics';

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
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

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

  // 1. Instagram & Instagram Story Sharing
  const handleInstagramShare = async () => {
    if (!cardResult) return;
    setActiveAction('instagram');
    trackGAEvent('share', { method: 'instagram', content_type: format, score: score });
    try {
      copyCaptionToClipboard(cardResult.shareText);
      const hasNativeShare = typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [cardResult.file] });

      if (hasNativeShare) {
        showToast('📋 Caption copied! Select Instagram > Post/Story, then tap PASTE!', 'success', 6000);
        await shareViaNative(cardResult.file, { filesOnly: true });
      } else {
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
    trackGAEvent('share', { method: 'facebook', content_type: format, score: score });
    try {
      copyCaptionToClipboard(cardResult.shareText);
      const hasNativeShare = typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [cardResult.file] });

      if (hasNativeShare) {
        showToast('📋 Caption copied! In Facebook, tap "Say something about this photo..." and tap PASTE!', 'success', 6000);
        await shareViaNative(cardResult.file, { filesOnly: true });
      } else {
        downloadScoreCard(cardResult.blob, score, format);
        showToast('📸 Score card downloaded & caption copied! Open Facebook to post.', 'success', 6000);
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cardResult.shareUrl)}`;
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
    trackGAEvent('share', { method: 'whatsapp', content_type: format, score: score });
    try {
      copyCaptionToClipboard(cardResult.shareText);
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
    trackGAEvent('download_score_card', { content_type: format, score: score });
    downloadScoreCard(cardResult.blob, score, format);
    copyCaptionToClipboard(cardResult.shareText);
    showToast('⬇️ High-resolution score card saved to your photos!');
  };

  // 5. System More Options
  const handleSystemShare = async () => {
    if (!cardResult) return;
    setActiveAction('system');
    trackGAEvent('share', { method: 'native_options', content_type: format, score: score });
    try {
      await copyCaptionToClipboard(cardResult.shareText);
      await shareViaNative(cardResult.file, { filesOnly: true });
    } catch (err) {
      console.error('System share error:', err);
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Background click dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share Score to Socials"
        className="relative z-10 w-full max-w-[460px] bg-gradient-to-b from-[#FFF5F8] via-[#FFFFFF] to-[#FFF5F8] rounded-[36px] border-2 border-pink-100 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden select-none animate-in zoom-in-95 duration-200"
      >
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 inset-x-4 z-50 flex items-center justify-center pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
            <div
              className={`px-4 py-2.5 rounded-2xl shadow-xl text-xs sm:text-sm font-bold flex items-center space-x-2 border pointer-events-auto backdrop-blur-md ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-emerald-900/10'
                  : 'bg-amber-50 text-amber-800 border-amber-300 shadow-amber-900/10'
              }`}
            >
              {toastMessage.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="relative pt-6 px-5 sm:px-6 pb-2">
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white shadow-md border border-pink-100 text-[#E91E63] hover:text-[#C2185B] hover:scale-105 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
          </button>

          {/* Top Mascot Chibi Artwork */}
          <div className="absolute right-3 bottom-0 w-36 sm:w-44 pointer-events-none select-none">
            <img
              src={`${basePath}/share_mascot_chibi.png`}
              alt="Chibi Mascot"
              className="w-full h-auto object-contain block drop-shadow-sm"
            />
          </div>

          {/* Header Title & Subtitle */}
          <div className="relative z-10 max-w-[240px] sm:max-w-[270px]">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="text-amber-400 text-sm">✨</span>
              <span className="text-amber-300 text-xs">⭐</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#481628] leading-[1.08] tracking-tight">
              Share Your
            </h2>
            <h2 className="text-2xl sm:text-3xl font-black text-[#E91E63] leading-[1.08] tracking-tight">
              High Score!
            </h2>
            <p className="text-xs sm:text-sm font-bold text-[#8C6D7D] mt-1.5 leading-snug">
              Show off your sweet skills!
            </p>
          </div>
        </div>

        {/* Format Selector (Story vs Post) */}
        <div className="mx-4 sm:mx-6 mt-2 mb-1 p-1 bg-[#FDF0F5] rounded-full border border-pink-200/60 flex items-center shadow-inner">
          <button
            type="button"
            onClick={() => setFormat('story')}
            className={`flex-1 py-1.5 sm:py-2 px-3 rounded-full text-xs font-black transition-all flex items-center justify-center space-x-1.5 sm:space-x-2 cursor-pointer ${
              format === 'story'
                ? 'bg-white text-[#E91E63] shadow-sm border border-pink-200/80'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Smartphone className={`w-4 h-4 flex-shrink-0 ${format === 'story' ? 'text-[#E91E63]' : 'text-slate-400'}`} />
            <div className="flex flex-col text-left leading-tight">
              <span className="font-extrabold text-[11px] sm:text-xs">Story (9:16)</span>
              <span className={`text-[9px] sm:text-[10px] font-semibold ${format === 'story' ? 'text-pink-400' : 'text-slate-400'}`}>
                IG & FB Stories
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFormat('post')}
            className={`flex-1 py-1.5 sm:py-2 px-3 rounded-full text-xs font-black transition-all flex items-center justify-center space-x-1.5 sm:space-x-2 cursor-pointer ${
              format === 'post'
                ? 'bg-white text-[#E91E63] shadow-sm border border-pink-200/80'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ImageIcon className={`w-4 h-4 flex-shrink-0 ${format === 'post' ? 'text-[#E91E63]' : 'text-slate-400'}`} />
            <div className="flex flex-col text-left leading-tight">
              <span className="font-extrabold text-[11px] sm:text-xs">Feed Post (4:5)</span>
              <span className={`text-[9px] sm:text-[10px] font-semibold ${format === 'post' ? 'text-pink-400' : 'text-slate-400'}`}>
                Instagram & Facebook
              </span>
            </div>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-2 space-y-3.5 scrollbar-thin scrollbar-thumb-pink-200 scrollbar-track-transparent">
          {/* Interactive Card Preview */}
          <div className="rounded-[28px] bg-gradient-to-b from-[#FCE4EC]/70 via-[#F8BBD0]/35 to-[#FCE4EC]/70 p-3 sm:p-4 flex items-center justify-center relative overflow-hidden shadow-inner border border-pink-100/90">
            {generating ? (
              <div className="py-14 flex flex-col items-center justify-center space-y-2">
                <div className="w-8 h-8 border-3 border-[#E91E63] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-pink-700 font-bold">Rendering branded score card...</p>
              </div>
            ) : cardResult ? (
              <div className="relative group max-h-[220px] sm:max-h-[270px] rounded-2xl overflow-hidden shadow-xl border-2 border-white/90 flex items-center justify-center bg-white">
                <img
                  src={cardResult.dataUrl}
                  alt="Score Card Preview"
                  className="max-h-[220px] sm:max-h-[270px] w-auto max-w-full object-contain block select-none pointer-events-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const win = window.open();
                    if (win) {
                      win.document.write(`<img src="${cardResult.dataUrl}" style="max-width:100%;height:auto;display:block;margin:auto;" />`);
                    }
                  }}
                  className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-[#4A1525] text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm border border-pink-200 shadow-sm flex items-center space-x-1 transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3 text-[#E91E63]" />
                  <span>Full Size</span>
                </button>
              </div>
            ) : null}
          </div>

          {/* Platform Share Action Buttons Grid */}
          <div className="space-y-2">
            <span className="text-xs font-black text-[#8E838B] uppercase tracking-wider block">
              Share to Platform
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {/* 1. Instagram Button */}
              <button
                type="button"
                onClick={handleInstagramShare}
                disabled={!cardResult || activeAction !== null}
                className="py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-pink-500/15 flex items-center justify-between transition-transform active:scale-98 cursor-pointer disabled:opacity-50 text-left"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg border-2 border-white flex items-center justify-center relative flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-white"></div>
                    <div className="absolute top-0.5 right-0.5 w-0.5 h-0.5 bg-white rounded-full"></div>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="leading-tight font-extrabold">Instagram</span>
                    <span className="text-[10px] font-medium opacity-90 text-pink-100">Photo & Story</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/90 stroke-[2.5]" />
              </button>

              {/* 2. Facebook Button */}
              <button
                type="button"
                onClick={handleFacebookShare}
                disabled={!cardResult || activeAction !== null}
                className="py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-[#1877f2] to-[#0d6efd] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/15 flex items-center justify-between transition-transform active:scale-98 cursor-pointer disabled:opacity-50 text-left"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <span className="text-[#1877f2] font-black text-base leading-none">f</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="leading-tight font-extrabold">Facebook</span>
                    <span className="text-[10px] font-medium opacity-90 text-blue-100">Photo & Story</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/90 stroke-[2.5]" />
              </button>

              {/* 3. WhatsApp Button */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                disabled={!cardResult || activeAction !== null}
                className="py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-[#25d366] to-[#1ebe5d] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-500/15 flex items-center justify-between transition-transform active:scale-98 cursor-pointer disabled:opacity-50 text-left"
              >
                <div className="flex items-center space-x-2.5">
                  <MessageCircle className="w-6 h-6 text-white flex-shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="leading-tight font-extrabold">WhatsApp</span>
                    <span className="text-[10px] font-medium opacity-90 text-emerald-100">Challenge</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/90 stroke-[2.5]" />
              </button>

              {/* 4. Save Score Card to Photos */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={!cardResult}
                className="py-2.5 px-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-sm flex items-center justify-between transition-transform active:scale-98 cursor-pointer disabled:opacity-50 text-left"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                    <Download className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="leading-tight font-extrabold text-slate-800">Save Image</span>
                    <span className="text-[10px] font-medium text-slate-500">to Photos</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 stroke-[2.5]" />
              </button>
            </div>

            {/* 5. System More Options */}
            <button
              type="button"
              onClick={handleSystemShare}
              disabled={!cardResult || activeAction !== null}
              className="w-full py-2 px-4 rounded-xl bg-pink-50/80 hover:bg-pink-100/70 text-pink-700 font-bold text-xs border border-pink-200/60 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>More Options (Telegram, AirDrop, Messages)</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-[#F0DFE6] bg-gradient-to-b from-[#FFFDFE] to-[#FFF5F8] flex items-center justify-between mt-auto">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <img
              src={`${basePath}/share_bottom_icon.png`}
              alt="App Icon"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl shadow-sm border border-pink-100 object-cover"
            />
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-xs sm:text-sm text-[#481628] leading-tight">
                Elephant House AR Catch
              </span>
              <span className="text-[11px] sm:text-xs text-[#8C6D7D] font-medium leading-tight">
                Play & challenge your friends!
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 sm:px-7 py-2.5 rounded-full bg-[#E91E63] hover:bg-[#D81B60] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-pink-500/25 active:scale-95 transition-transform cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
