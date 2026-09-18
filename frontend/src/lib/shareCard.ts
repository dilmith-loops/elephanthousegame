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
  // Helper to safely load an image with fallback
  const loadImage = async (relPath: string): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => {
        if (basePath && !relPath.startsWith(basePath)) {
          const fallback = new Image();
          fallback.crossOrigin = 'anonymous';
          fallback.onload = () => resolve(fallback);
          fallback.onerror = () => resolve(null);
          fallback.src = relPath;
        } else {
          resolve(null);
        }
      };
      img.src = `${basePath}${relPath.startsWith('/') ? '' : '/'}${relPath}`;
    });
  };

  // Preload decorative assets
  const [logoImg, pinkPopImg, greenPopImg] = await Promise.all([
    loadImage('wonder_logo.png'),
    loadImage('card_popsicle_pink.png'),
    loadImage('card_popsicle_green.png')
  ]);

  // 1. Draw Background (Soft Dreamy Candy Cloud Gradient)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#FFE8F0');
  bgGrad.addColorStop(0.25, '#FFF2F7');
  bgGrad.addColorStop(0.7, '#FFF8FA');
  bgGrad.addColorStop(1, '#FFEBF3');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Soft ambient pink radial glow
  const pinkGlow = ctx.createRadialGradient(width / 2, isStory ? 350 : 250, 60, width / 2, isStory ? 350 : 250, 650);
  pinkGlow.addColorStop(0, 'rgba(233, 30, 99, 0.12)');
  pinkGlow.addColorStop(1, 'rgba(233, 30, 99, 0)');
  ctx.fillStyle = pinkGlow;
  ctx.fillRect(0, 0, width, height);

  // Draw cute background clouds
  const drawCloud = (cx: number, cy: number, scale: number, alpha: number) => {
    ctx.save();
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(cx, cy, 70 * scale, 0, Math.PI * 2);
    ctx.arc(cx + 60 * scale, cy - 20 * scale, 85 * scale, 0, Math.PI * 2);
    ctx.arc(cx + 140 * scale, cy, 70 * scale, 0, Math.PI * 2);
    ctx.arc(cx + 70 * scale, cy + 30 * scale, 75 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  drawCloud(120, isStory ? 200 : 120, 1.2, 0.6);
  drawCloud(width - 240, isStory ? 260 : 160, 1.4, 0.55);
  drawCloud(80, height - (isStory ? 300 : 200), 1.3, 0.5);
  drawCloud(width - 220, height - (isStory ? 260 : 180), 1.2, 0.6);

  // Helper for drawing 5-point stars
  const drawStar = (cx: number, cy: number, spikes = 5, outerRadius = 18, innerRadius = 8, color = '#FFCA28') => {
    ctx.save();
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.shadowColor = 'rgba(255, 193, 7, 0.4)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.restore();
  };

  // 2. Top Elephant House + WONDER Logo
  const logoY = isStory ? 90 : 45;
  if (logoImg && logoImg.naturalWidth > 0) {
    const logoWidth = isStory ? 520 : 460;
    const logoHeight = (logoWidth / logoImg.naturalWidth) * logoImg.naturalHeight;
    ctx.drawImage(logoImg, (width - logoWidth) / 2, logoY, logoWidth, logoHeight);
  }

  // 3. Center Card Dimensions & Placement
  const cardX = 75;
  const cardW = width - 150;
  const cardY = isStory ? 260 : 155;
  const cardRadius = 42;

  // Layout calculations
  const bannerY = cardY + 50;
  const bannerH = isStory ? 68 : 60;
  const bannerW = isStory ? 440 : 400;

  const scoreTitleY = bannerY + bannerH + (isStory ? 92 : 82);
  const scoreNumY = scoreTitleY + (isStory ? 112 : 98);
  const marksY = scoreNumY + (isStory ? 54 : 46);

  const statsStartY = marksY + (isStory ? 55 : 45);
  const boxW = (cardW - 130) / 2;
  const boxH = isStory ? 138 : 116;
  const boxGap = isStory ? 20 : 16;

  const calloutY = statsStartY + 2 * boxH + boxGap + (isStory ? 25 : 20);
  const calloutH = isStory ? 130 : 112;

  const cardH = calloutY + calloutH + (isStory ? 45 : 35) - cardY;

  // Draw Card Shadow & White Cloud Background
  ctx.save();
  ctx.shadowColor = 'rgba(233, 30, 99, 0.15)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 14;

  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();

  // Subtle pink inner border
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#FCE4EC';
  ctx.stroke();
  ctx.restore();

  // 4. Yellow Ribbon Banner: "AR Catch"
  const bannerX = (width - bannerW) / 2;
  ctx.save();
  ctx.shadowColor = 'rgba(255, 179, 0, 0.35)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;

  // Banner rounded pill
  ctx.beginPath();
  ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 30);
  const bannerGrad = ctx.createLinearGradient(bannerX, bannerY, bannerX, bannerY + bannerH);
  bannerGrad.addColorStop(0, '#FFE082');
  bannerGrad.addColorStop(0.5, '#FFD54F');
  bannerGrad.addColorStop(1, '#FFC107');
  ctx.fillStyle = bannerGrad;
  ctx.fill();

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#FFA000';
  ctx.stroke();
  ctx.restore();

  // Banner decorative side stars
  drawStar(bannerX + 32, bannerY + bannerH / 2, 5, 18, 8, '#FFB300');
  drawStar(bannerX + bannerW - 32, bannerY + bannerH / 2, 5, 18, 8, '#FFB300');

  // Banner Text: "AR Catch"
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 32px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#3E1E08';
  ctx.fillText('AR Catch', width / 2, bannerY + bannerH / 2 + 1);
  ctx.restore();

  // 5. Flanking Popsicles (Pink on left, Green on right) with yellow sparkle stars
  if (pinkPopImg && pinkPopImg.naturalWidth > 0) {
    ctx.save();
    const popW = isStory ? 130 : 115;
    const popH = (popW / pinkPopImg.naturalWidth) * pinkPopImg.naturalHeight;
    const popX = cardX + (isStory ? 45 : 35);
    const popY = scoreTitleY - (isStory ? 35 : 25);
    ctx.translate(popX + popW / 2, popY + popH / 2);
    ctx.rotate((-12 * Math.PI) / 180);
    ctx.drawImage(pinkPopImg, -popW / 2, -popH / 2, popW, popH);
    ctx.restore();

    // Small yellow sparkle stars around pink popsicle
    drawStar(cardX + 40, scoreTitleY + 60, 5, 14, 6, '#FFCA28');
    drawStar(cardX + 160, scoreTitleY - 20, 5, 10, 4, '#FFD54F');
  }

  if (greenPopImg && greenPopImg.naturalWidth > 0) {
    ctx.save();
    const popW = isStory ? 130 : 115;
    const popH = (popW / greenPopImg.naturalWidth) * greenPopImg.naturalHeight;
    const popX = cardX + cardW - popW - (isStory ? 45 : 35);
    const popY = scoreTitleY - (isStory ? 20 : 15);
    ctx.translate(popX + popW / 2, popY + popH / 2);
    ctx.rotate((15 * Math.PI) / 180);
    ctx.drawImage(greenPopImg, -popW / 2, -popH / 2, popW, popH);
    ctx.restore();

    // Small yellow sparkle stars around green popsicle
    drawStar(cardX + cardW - 40, scoreTitleY + 70, 5, 14, 6, '#FFCA28');
    drawStar(cardX + cardW - 160, scoreTitleY - 15, 5, 10, 4, '#FFD54F');
  }

  // 6. Score Showcase: "My High Score", Score Number, "Marks"
  ctx.save();
  ctx.textAlign = 'center';

  // "My High Score"
  ctx.font = '900 36px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#3D1826';
  ctx.fillText('My High Score', width / 2, scoreTitleY);

  // Big Score Number in Vivid Magenta
  ctx.font = `900 ${isStory ? 136 : 118}px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif`;
  ctx.fillStyle = '#E91E63';
  ctx.shadowColor = 'rgba(233, 30, 99, 0.25)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 6;
  ctx.fillText(data.score.toLocaleString(), width / 2, scoreNumY);
  ctx.shadowBlur = 0;

  // "Marks"
  ctx.font = '900 28px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#6C2B49';
  ctx.fillText('Marks', width / 2, marksY);
  ctx.restore();

  // 7. 4 Stat Boxes (2x2 Grid)
  const statsList = [
    {
      labelTop: 'Popsicles',
      labelBottom: 'Caught',
      value: `${data.catches}`,
      icon: '🍧',
      iconBg: '#FCE4EC'
    },
    {
      labelTop: 'Max',
      labelBottom: 'Combo',
      value: `${data.maxCombo}x`,
      icon: '🔥',
      iconBg: '#FFF3E0'
    },
    {
      labelTop: 'Play',
      labelBottom: 'Time',
      value: `${data.durationSeconds}s`,
      icon: '🕒',
      iconBg: '#E1F5FE'
    },
    {
      labelTop: 'Global',
      labelBottom: 'Rank',
      value: data.rank ? `#${data.rank}` : '#12',
      icon: '🏆',
      iconBg: '#FFF8E1'
    }
  ];

  statsList.forEach((stat, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = cardX + 50 + col * (boxW + boxGap);
    const by = statsStartY + row * (boxH + boxGap);

    ctx.save();
    // Stat Box Background
    ctx.beginPath();
    ctx.roundRect(bx, by, boxW, boxH, 22);
    ctx.fillStyle = '#FFF8FA';
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FAD4E2';
    ctx.stroke();

    // Icon Circle
    const iconSize = isStory ? 56 : 48;
    const iconX = bx + 22;
    const iconY = by + (boxH - iconSize) / 2;

    ctx.beginPath();
    ctx.roundRect(iconX, iconY, iconSize, iconSize, 16);
    ctx.fillStyle = stat.iconBg;
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${isStory ? 28 : 24}px system-ui, apple-color-emoji, sans-serif`;
    ctx.fillText(stat.icon, iconX + iconSize / 2, iconY + iconSize / 2 + 1);

    // Labels and Value
    const textStartX = iconX + iconSize + 16;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Label
    ctx.font = '800 16px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#664352';
    ctx.fillText(`${stat.labelTop} ${stat.labelBottom}`, textStartX, by + (isStory ? 48 : 42));

    // Value
    ctx.font = '900 34px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#2A0A16';
    ctx.fillText(stat.value, textStartX, by + (isStory ? 94 : 84));

    ctx.restore();
  });

  // 8. Dashed Callout Card: "Can you beat my score? Play Elephant House AR Catch!"
  ctx.save();
  const calloutW = cardW - 100;
  const calloutX = cardX + 50;

  ctx.beginPath();
  ctx.roundRect(calloutX, calloutY, calloutW, calloutH, 22);
  ctx.fillStyle = '#FFF8FA';
  ctx.fill();

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#F48FB1';
  ctx.setLineDash([8, 6]);
  ctx.stroke();
  ctx.restore();

  // Callout Text
  ctx.save();
  ctx.textAlign = 'center';

  ctx.font = `900 ${isStory ? 28 : 25}px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif`;
  ctx.fillStyle = '#E91E63';
  ctx.fillText('Can you beat my score?', width / 2, calloutY + (isStory ? 52 : 46));

  ctx.font = `800 ${isStory ? 20 : 18}px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif`;
  ctx.fillStyle = '#880E4F';
  ctx.fillText('Play Elephant House AR Catch!', width / 2, calloutY + (isStory ? 94 : 82));
  ctx.restore();

  // 9. Bottom Page URL and Hashtags
  const bottomY = isStory ? height - 110 : height - 50;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '800 22px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('Play & Challenge Friends at: arcatch.ehwonderonline.com', width / 2, bottomY);

  if (isStory) {
    ctx.font = '700 20px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('#ElephantHouse #WonderIceCream #ARCatch', width / 2, bottomY + 45);
  }
  ctx.restore();

  // 10. Generate Blob & File
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 0.95));
  if (!blob) throw new Error('Could not create image blob');
  const dataUrl = canvas.toDataURL('image/png', 0.95);
  const file = new File([blob], `elephant-house-wonder-score-${data.score}.png`, {
    type: 'image/png',
    lastModified: Date.now()
  });

  const shareUrl = typeof window !== 'undefined' && window.location.origin
    ? (window.location.hostname.startsWith('arcatch.')
        ? 'https://arcatch.ehwonderonline.com'
        : `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH || '/arwonder'}`)
    : 'https://arcatch.ehwonderonline.com';

  const shareText = `🍦 I just scored ${data.score} marks catching popsicles on the Elephant House Wonder AR Catch Game! Can you beat my high score? 🏆\n\nPlay now: ${shareUrl}\n#ElephantHouse #WonderIceCream #ARCatch`;

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
