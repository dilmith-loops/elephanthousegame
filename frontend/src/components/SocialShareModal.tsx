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
      const hasNativeShare = typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [cardResult.file] });

      if (hasNativeShare) {
        showToast('💬 Select WhatsApp to share your score card photo & message!', 'success', 5000);
        const shared = await shareViaNative(cardResult.file, {
          text: cardResult.shareText,
          title: 'Elephant House AR Catch'
        });
        if (shared) return;
      }

      // Fallback for desktop or non-file-sharing browsers:
      // Download the score card image so user has the photo, copy caption, then open WhatsApp
      downloadScoreCard(cardResult.blob, score, format);
      showToast('📸 Score card downloaded & caption copied! Select photo in WhatsApp.', 'success', 6000);
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(cardResult.shareText)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
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
      copyCaptionToClipboard(cardResult.shareText);
      const hasNativeShare = typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [cardResult.file] });

      if (hasNativeShare) {
        await shareViaNative(cardResult.file, {
          text: cardResult.shareText,
          title: 'Elephant House AR Catch'
        });
      } else {
        downloadScoreCard(cardResult.blob, score, format);
        showToast('📸 Score card downloaded & caption copied!', 'success');
      }
    } catch (err) {
      console.error('System share error:', err);
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-[max(10px,env(safe-area-inset-top))] bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Background click dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share Score to Socials"
        className="relative z-10 w-full max-w-[420px] bg-gradient-to-b from-[#FFF5F8] via-[#FFFFFF] to-[#FFF5F8] rounded-[30px] sm:rounded-[36px] border-2 border-pink-100 shadow-2xl flex flex-col max-h-[calc(100dvh-20px)] sm:max-h-[88dvh] overflow-hidden select-none animate-in zoom-in-95 duration-200"
      >
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="absolute top-3 inset-x-3 z-50 flex items-center justify-center pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
            <div
              className={`px-3.5 py-2 rounded-2xl shadow-xl text-xs font-bold flex items-center space-x-2 border pointer-events-auto backdrop-blur-md ${
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
        <div className="relative pt-4 sm:pt-5 px-4 sm:px-5 pb-2 flex-shrink-0 overflow-hidden">
          {/* Close Button - Crisp white round pill with hot-pink X matching reference */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3.5 right-3.5 z-30 w-8 h-8 rounded-full bg-white hover:bg-pink-50 text-[#E91E63] border border-pink-100 shadow-md flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Top Mascot Chibi Artwork - Seamlessly blended in top right */}
          <div className="absolute right-0 top-0 bottom-0 w-36 sm:w-44 pointer-events-none select-none overflow-hidden flex items-start justify-end z-10">
            <img
              src={`${basePath}/share_mascot_chibi.png`}
              alt="Chibi Mascot"
              className="h-full w-auto object-contain object-right-top drop-shadow-sm opacity-95"
            />
          </div>

          {/* Header Title & Subtitle */}
          <div className="relative z-10 max-w-[210px] sm:max-w-[250px]">
            <div className="flex items-center space-x-1 mb-0.5">
              <span className="text-amber-400 text-xs">✨</span>
              <span className="text-amber-300 text-[10px]">⭐</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#481628] leading-[1.08] tracking-tight">
              Share Your
            </h2>
            <h2 className="text-xl sm:text-2xl font-black text-[#E91E63] leading-[1.08] tracking-tight">
              High Score!
            </h2>
            <p className="text-[11px] sm:text-xs font-bold text-[#8C6D7D] mt-1 leading-snug">
              Show off your sweet skills!
            </p>
          </div>
        </div>

        {/* Format Selector (Story vs Post) */}
        <div className="mx-3.5 sm:mx-5 mt-1 mb-1 p-1 bg-[#FDF0F5] rounded-full border border-pink-200/60 flex items-center shadow-inner flex-shrink-0">
          <button
            type="button"
            onClick={() => setFormat('story')}
            className={`flex-1 py-1.5 px-2 rounded-full text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              format === 'story'
                ? 'bg-white text-[#E91E63] shadow-sm border border-pink-200/80'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Smartphone className={`w-3.5 h-3.5 flex-shrink-0 ${format === 'story' ? 'text-[#E91E63]' : 'text-slate-400'}`} />
            <div className="flex flex-col text-left leading-tight">
              <span className="font-extrabold text-[10px] sm:text-xs">Story (9:16)</span>
              <span className={`text-[8px] sm:text-[9px] font-semibold ${format === 'story' ? 'text-pink-400' : 'text-slate-400'}`}>
                IG & FB Stories
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFormat('post')}
            className={`flex-1 py-1.5 px-2 rounded-full text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              format === 'post'
                ? 'bg-white text-[#E91E63] shadow-sm border border-pink-200/80'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ImageIcon className={`w-3.5 h-3.5 flex-shrink-0 ${format === 'post' ? 'text-[#E91E63]' : 'text-slate-400'}`} />
            <div className="flex flex-col text-left leading-tight">
              <span className="font-extrabold text-[10px] sm:text-xs">Feed Post (4:5)</span>
              <span className={`text-[8px] sm:text-[9px] font-semibold ${format === 'post' ? 'text-pink-400' : 'text-slate-400'}`}>
                Instagram & Facebook
              </span>
            </div>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-3.5 sm:px-5 py-1.5 space-y-2.5 scrollbar-thin scrollbar-thumb-pink-200 scrollbar-track-transparent">
          {/* Interactive Card Preview */}
          <div className="rounded-[22px] sm:rounded-[26px] bg-gradient-to-b from-[#FCE4EC]/65 via-[#F8BBD0]/30 to-[#FCE4EC]/65 p-2 sm:p-2.5 flex items-center justify-center relative overflow-hidden shadow-inner border border-pink-100/90 min-h-[160px] max-h-[210px] sm:max-h-[250px]">
            {generating ? (
              <div className="py-10 flex flex-col items-center justify-center space-y-2">
                <div className="w-7 h-7 border-3 border-[#E91E63] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-pink-700 font-bold">Rendering score card...</p>
              </div>
            ) : cardResult ? (
              <div className="relative group max-h-[155px] sm:max-h-[235px] rounded-xl overflow-hidden shadow-md border border-white/90 flex items-center justify-center bg-white">
                <img
                  src={cardResult.dataUrl}
                  alt="Score Card Preview"
                  className="max-h-[155px] sm:max-h-[235px] w-auto max-w-full object-contain block select-none pointer-events-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const win = window.open();
                    if (win) {
                      win.document.write(`<img src="${cardResult.dataUrl}" style="max-width:100%;height:auto;display:block;margin:auto;" />`);
                    }
                  }}
                  className="absolute bottom-1.5 right-1.5 bg-white/90 hover:bg-white text-[#4A1525] text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm border border-pink-200 shadow-sm flex items-center space-x-1 transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <ExternalLink className="w-2.5 h-2.5 text-[#E91E63]" />
                  <span>Full Size</span>
                </button>
              </div>
            ) : null}
          </div>

          {/* Platform Share Action Buttons - 2x2 Grid matching reference! */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-[#8E838B] uppercase tracking-wider block">
              Share to Platform
            </span>

            <div className="grid grid-cols-2 gap-2">
              {/* 1. Instagram Button */}
              <button
                type="button"
                onClick={handleInstagramShare}
                disabled={!cardResult || activeAction !== null}
                className="py-2 px-2.5 rounded-2xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-95 text-white shadow-sm flex items-center justify-between transition-transform active:scale-95 cursor-pointer disabled:opacity-50 text-left overflow-hidden"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-6 h-6 rounded-md border-2 border-white flex items-center justify-center relative flex-shrink-0">
                    <div className="w-2 h-2 rounded-full border-1.5 border-white"></div>
                    <div className="absolute top-0.5 right-0.5 w-0.5 h-0.5 bg-white rounded-full"></div>
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="leading-tight font-extrabold text-[11px] text-white truncate">Instagram</span>
                    <span className="text-[9px] font-medium opacity-90 text-pink-100 truncate">Photo & Story</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/90 stroke-[2.5] flex-shrink-0 ml-0.5" />
              </button>

              {/* 2. Facebook Button */}
              <button
                type="button"
                onClick={handleFacebookShare}
                disabled={!cardResult || activeAction !== null}
                className="py-2 px-2.5 rounded-2xl bg-gradient-to-r from-[#1877f2] to-[#0d6efd] hover:opacity-95 text-white shadow-sm flex items-center justify-between transition-transform active:scale-95 cursor-pointer disabled:opacity-50 text-left overflow-hidden"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <span className="text-[#1877f2] font-black text-xs leading-none">f</span>
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="leading-tight font-extrabold text-[11px] text-white truncate">Facebook</span>
                    <span className="text-[9px] font-medium opacity-90 text-blue-100 truncate">Photo & Story</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/90 stroke-[2.5] flex-shrink-0 ml-0.5" />
              </button>

              {/* 3. WhatsApp Button */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                disabled={!cardResult || activeAction !== null}
                className="py-2 px-2.5 rounded-2xl bg-gradient-to-r from-[#25d366] to-[#1ebe5d] hover:opacity-95 text-white shadow-sm flex items-center justify-between transition-transform active:scale-95 cursor-pointer disabled:opacity-50 text-left overflow-hidden"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <MessageCircle className="w-5 h-5 text-white flex-shrink-0" />
                  <div className="flex flex-col text-left min-w-0">
                    <span className="leading-tight font-extrabold text-[11px] text-white truncate">WhatsApp</span>
                    <span className="text-[9px] font-medium opacity-90 text-emerald-100 truncate">Challenge</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/90 stroke-[2.5] flex-shrink-0 ml-0.5" />
              </button>

              {/* 4. Save Score Card to Photos */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={!cardResult}
                className="py-2 px-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-sm flex items-center justify-between transition-transform active:scale-95 cursor-pointer disabled:opacity-50 text-left overflow-hidden"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="leading-tight font-extrabold text-[11px] text-slate-800 truncate">Save Image</span>
                    <span className="text-[9px] font-medium text-slate-500 truncate">to Photos</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2.5] flex-shrink-0 ml-0.5" />
              </button>
            </div>

            {/* 5. System More Options */}
            <button
              type="button"
              onClick={handleSystemShare}
              disabled={!cardResult || activeAction !== null}
              className="w-full py-1.5 px-3 rounded-xl bg-pink-50/80 hover:bg-pink-100/70 text-pink-700 font-bold text-[10px] sm:text-[11px] border border-pink-200/60 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer active:scale-98"
            >
              <Share2 className="w-3 h-3" />
              <span>More Options (Telegram, AirDrop, Messages)</span>
            </button>
          </div>
        </div>

        {/* Modal Footer - Pinned to bottom, always visible, safe-area aware */}
        <div className="p-3 sm:p-3.5 border-t border-[#F0DFE6] bg-gradient-to-b from-[#FFFDFE] to-[#FFF5F8] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0">
            <img
              src={`${basePath}/share_bottom_icon.png`}
              alt="App Icon"
              className="w-8 h-8 rounded-xl shadow-sm border border-pink-100 object-cover flex-shrink-0"
            />
            <div className="flex flex-col text-left min-w-0">
              <span className="font-extrabold text-xs text-[#481628] leading-tight truncate">
                Elephant House AR Catch
              </span>
              <span className="text-[10px] text-[#8C6D7D] font-medium leading-tight truncate">
                Play & challenge your friends!
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#E91E63] hover:bg-[#D81B60] text-white font-extrabold text-xs shadow-md shadow-pink-500/25 active:scale-95 transition-transform cursor-pointer flex-shrink-0 ml-2"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
