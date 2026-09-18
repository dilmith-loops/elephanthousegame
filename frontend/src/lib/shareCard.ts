/**
 * Elephant House AR Game - Social Score Card Generator
 * Supports Story (9:16 - 1080x1920) and Post (4:5 - 1080x1350)
 * Styled in Premium Light Theme with White, Wonder Pink (#b21f85), and Golden Accents
 */

export interface ScoreCardData {
  playerName: string;
  score: number;
  catches: number;
  maxCombo: number;
  durationSeconds: number;
  rank?: number;
  format?: 'story' | 'post';
}

export interface GeneratedCardResult {
  canvas: HTMLCanvasElement;
  blob: Blob;
  dataUrl: string;
  file: File;
  shareText: string;
  shareUrl: string;
}

export function copyCaptionToClipboard(text: string): boolean {
  if (typeof window === 'undefined') return false;

  let copied = false;

  // 1. Synchronous execution within immediate user gesture (vital for iOS WebKit)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.fontSize = '16px'; // Prevent auto-zoom on iOS
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '-9999px';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    document.body.appendChild(textArea);

    // Focus & select range for iOS Safari
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);

    copied = document.execCommand('copy');
    document.body.removeChild(textArea);
  } catch (err) {
    console.warn('execCommand copy fallback error:', err);
  }

  // 2. Also invoke navigator.clipboard asynchronously if supported
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      copied = true;
    }).catch(() => {});
  }

  return copied;
}

export function downloadScoreCard(blob: Blob, score: number, format: 'story' | 'post' = 'story'): void {
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `elephant-house-wonder-${format}-score-${score}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 2500);
}

export async function shareViaNative(
  file: File,
  textOrOptions?: string | { text?: string; title?: string; filesOnly?: boolean },
  title = 'My Elephant House AR Game Score'
): Promise<boolean> {
  const options = typeof textOrOptions === 'object' && textOrOptions !== null
    ? textOrOptions
    : { text: typeof textOrOptions === 'string' ? textOrOptions : undefined, title, filesOnly: false };

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        if (options.filesOnly) {
          // CRITICAL: Passing strictly ONLY `files: [file]` ensures iOS & Android treat this as a Photo/Story media share.
          // If `text` or a URL is passed alongside the file, the Facebook and Instagram app extensions
          // discard the image file and switch to a URL-preview link share mode.
          await navigator.share({
            files: [file]
          });
          return true;
        } else {
          await navigator.share({
            title: options.title || 'My Elephant House AR Game Score',
            text: options.text,
            files: [file]
          });
          return true;
        }
      } else if (options.text) {
        await navigator.share({
          title: options.title || 'My Elephant House AR Game Score',
          text: options.text
        });
        return true;
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        return false; // User dismissed share sheet
      }
      console.warn('Native share failed:', err);
    }
  }
  return false;
}

export async function generateScoreCard(data: ScoreCardData): Promise<GeneratedCardResult> {
  const isStory = data.format !== 'post';
  const width = 1080;
  const height = isStory ? 1920 : 1350;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize canvas context');

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  // 1. Draw Background (Wonder Gameplay Background)
  try {
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    await new Promise<void>((resolve) => {
      bgImg.onload = () => resolve();
      bgImg.onerror = () => resolve();
      bgImg.src = `${basePath}/wonder_background.jpg`;
    });

    if (bgImg.complete && bgImg.naturalWidth > 0) {
      ctx.drawImage(bgImg, 0, 0, width, height);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#fff5f9');
      grad.addColorStop(0.5, '#ffffff');
      grad.addColorStop(1, '#fce7f3');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
  } catch {
    ctx.fillStyle = '#fff5f9';
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Light Theme Frosted Wash & Ambient Pink Radial Glows
  const lightWash = ctx.createLinearGradient(0, 0, 0, height);
  lightWash.addColorStop(0, 'rgba(255, 255, 255, 0.82)');
  lightWash.addColorStop(0.5, 'rgba(255, 248, 252, 0.90)');
  lightWash.addColorStop(1, 'rgba(255, 240, 248, 0.95)');
  ctx.fillStyle = lightWash;
  ctx.fillRect(0, 0, width, height);

  const pinkGlow = ctx.createRadialGradient(width / 2, isStory ? 220 : 120, 50, width / 2, isStory ? 220 : 120, 600);
  pinkGlow.addColorStop(0, 'rgba(178, 31, 133, 0.16)');
  pinkGlow.addColorStop(1, 'rgba(178, 31, 133, 0)');
  ctx.fillStyle = pinkGlow;
  ctx.fillRect(0, 0, width, height);

  // 3. Top Elephant House WONDER Logo
  const logoY = isStory ? 100 : 50;
  try {
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    await new Promise<void>((resolve) => {
      logoImg.onload = () => resolve();
      logoImg.onerror = () => resolve();
      logoImg.src = `${basePath}/wonder_logo.png`;
    });

    if (logoImg.complete && logoImg.naturalWidth > 0) {
      const logoWidth = isStory ? 480 : 440;
      const logoHeight = (logoWidth / logoImg.naturalWidth) * logoImg.naturalHeight;
      ctx.drawImage(logoImg, (width - logoWidth) / 2, logoY, logoWidth, logoHeight);
    }
  } catch {
    // ignore
  }

  // 4. Center Showcase Card Setup
  const cardX = 80;
  const cardW = width - 160;
  const cardY = isStory ? 270 : 160;
  const radius = 46;

  // Geometry calculations to guarantee zero overlaps across any format
  const startY = cardY + (isStory ? 480 : 420);
  const boxW = (cardW - 140) / 2;
  const boxH = isStory ? 150 : 120;
  const gap = isStory ? 20 : 16;

  const calloutY = startY + 2 * boxH + gap + (isStory ? 28 : 22);
  const calloutH = isStory ? 134 : 112;

  const brandY = calloutY + calloutH + (isStory ? 46 : 36);
  const cardH = brandY + (isStory ? 52 : 40) - cardY;

  // Draw Card Background
  ctx.save();
  ctx.shadowColor = 'rgba(178, 31, 133, 0.22)';
  ctx.shadowBlur = 48;
  ctx.shadowOffsetY = 18;

  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();

  // Card Border in #b21f85 gradient
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  ctx.lineWidth = 4;
  const borderGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  borderGrad.addColorStop(0, '#b21f85');
  borderGrad.addColorStop(0.5, '#e11d48');
  borderGrad.addColorStop(1, '#f59e0b');
  ctx.strokeStyle = borderGrad;
  ctx.stroke();
  ctx.restore();

  // 5. Card Header - Badge & Title
  ctx.textAlign = 'center';
  ctx.font = '900 28px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#b21f85';
  ctx.fillText('🏆 OFFICIAL AR GAME SCORE CARD', width / 2, cardY + (isStory ? 65 : 55));

  // Player Name in Bold Deep Charcoal
  ctx.font = '900 48px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(data.playerName.toUpperCase(), width / 2, cardY + (isStory ? 132 : 112));

  // Subtitle
  ctx.font = '700 22px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Tongue Catch Ice Cream Session', width / 2, cardY + (isStory ? 172 : 148));

  // Divider Line
  const divGrad = ctx.createLinearGradient(cardX + 60, 0, cardX + cardW - 60, 0);
  divGrad.addColorStop(0, 'rgba(178, 31, 133, 0.05)');
  divGrad.addColorStop(0.5, 'rgba(178, 31, 133, 0.3)');
  divGrad.addColorStop(1, 'rgba(178, 31, 133, 0.05)');
  ctx.beginPath();
  ctx.moveTo(cardX + 60, cardY + (isStory ? 208 : 178));
  ctx.lineTo(cardX + cardW - 60, cardY + (isStory ? 208 : 178));
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 2;
  ctx.stroke();

  // 6. Score Showcase
  ctx.font = '900 24px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#b21f85';
  ctx.fillText('MARKS EARNED', width / 2, cardY + (isStory ? 262 : 228));

  ctx.font = `900 ${isStory ? 138 : 116}px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif`;
  const scoreGrad = ctx.createLinearGradient(0, cardY + 280, 0, cardY + (isStory ? 430 : 360));
  scoreGrad.addColorStop(0, '#b21f85');
  scoreGrad.addColorStop(0.6, '#e11d48');
  scoreGrad.addColorStop(1, '#ff6a00');
  ctx.fillStyle = scoreGrad;
  ctx.fillText(data.score.toLocaleString(), width / 2, cardY + (isStory ? 400 : 345));

  // 7. Stats Grid (4 Light Boxes with Accents)
  const stats = [
    { label: 'POPSICLES CAUGHT', value: `${data.catches} 🍦` },
    { label: 'MAX COMBO', value: `${data.maxCombo}x 🔥` },
    { label: 'SESSION TIME', value: `${data.durationSeconds}s ⏱️` },
    { label: 'GLOBAL RANK', value: data.rank ? `#${data.rank} 🥇` : 'Top Tier ⭐' }
  ];

  stats.forEach((stat, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = cardX + 50 + col * (boxW + gap);
    const by = startY + row * (boxH + gap);

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(bx, by, boxW, boxH, 22);
    ctx.fillStyle = '#fdf2f8';
    ctx.fill();

    ctx.strokeStyle = 'rgba(178, 31, 133, 0.28)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '800 18px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#b21f85';
    ctx.fillText(stat.label, bx + boxW / 2, by + (isStory ? 52 : 44));

    ctx.font = '900 38px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(stat.value, bx + boxW / 2, by + (isStory ? 108 : 94));
    ctx.restore();
  });

  // 8. Challenge Callout Box inside Card
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX + 50, calloutY, cardW - 100, calloutH, 22);
  const calloutGrad = ctx.createLinearGradient(cardX + 50, 0, cardX + 50 + cardW - 100, 0);
  calloutGrad.addColorStop(0, '#fff1f2');
  calloutGrad.addColorStop(0.5, '#fef2f2');
  calloutGrad.addColorStop(1, '#fff7ed');
  ctx.fillStyle = calloutGrad;
  ctx.fill();

  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.stroke();
  ctx.restore();

  ctx.font = `900 ${isStory ? 26 : 24}px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif`;
  ctx.fillStyle = '#be123c';
  ctx.fillText('🔥 CAN YOU BEAT MY HIGH SCORE?', width / 2, calloutY + (isStory ? 52 : 44));

  ctx.font = `700 ${isStory ? 20 : 18}px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif`;
  ctx.fillStyle = '#881337';
  ctx.fillText('Play Elephant House AR Tongue Catch Challenge!', width / 2, calloutY + (isStory ? 94 : 80));

  // Bottom Card Brand Callout (completely below the callout box)
  ctx.font = `800 ${isStory ? 22 : 19}px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif`;
  ctx.fillStyle = '#b21f85';
  ctx.fillText('🍦 ELEPHANT HOUSE ICE CREAM • WONDER EXPERIENCE', width / 2, brandY);

  // 9. Bottom Page URL and Hashtags
  const bottomY = isStory ? height - 120 : height - 55;
  ctx.font = '800 22px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Play & Challenge Friends at: ai.loopsintegrated.co', width / 2, bottomY);

  if (isStory) {
    ctx.font = '700 20px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('#ElephantHouse #WonderIceCream #ARTongueCatch', width / 2, bottomY + 45);
  }

  // 10. Generate Blob & File
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 0.95));
  if (!blob) throw new Error('Could not create image blob');
  const dataUrl = canvas.toDataURL('image/png', 0.95);
  const file = new File([blob], `elephant-house-wonder-score-${data.score}.png`, {
    type: 'image/png',
    lastModified: Date.now()
  });

  const shareUrl = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin + (process.env.NEXT_PUBLIC_BASE_PATH || '')
    : 'https://ai.loopsintegrated.co';

  const shareText = `🍦 I just scored ${data.score} marks catching popsicles on the Elephant House Wonder AR Catch Game! Can you beat my high score? 🏆\n\nPlay now: ${shareUrl}\n#ElephantHouse #WonderIceCream #ARTongueCatch`;

  return {
    canvas,
    blob,
    dataUrl,
    file,
    shareText,
    shareUrl
  };
}

export async function generateAndShareScoreCard(data: ScoreCardData): Promise<{ success: boolean; mode: 'shared' | 'downloaded'; error?: string }> {
  try {
    const card = await generateScoreCard(data);
    copyCaptionToClipboard(card.shareText);

    const shared = await shareViaNative(card.file, card.shareText);
    if (shared) {
      return { success: true, mode: 'shared' };
    }

    // Fallback: Automatic download
    downloadScoreCard(card.blob, data.score, data.format || 'story');
    return { success: true, mode: 'downloaded' };
  } catch (err: unknown) {
    console.error('Score Card Share Error:', err);
    return { success: false, mode: 'downloaded', error: err instanceof Error ? err.message : 'Share failed' };
  }
}
