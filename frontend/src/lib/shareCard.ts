/**
 * Elephant House AR Game - Social Score Card Generator
 * Generates a high-res branded 1080x1350 social share image styled with White & #b21f85 (Wonder Pink)
 */

interface ScoreCardData {
  playerName: string;
  score: number;
  catches: number;
  maxCombo: number;
  durationSeconds: number;
  rank?: number;
}

export async function generateAndShareScoreCard(data: ScoreCardData): Promise<{ success: boolean; mode: 'shared' | 'downloaded'; error?: string }> {
  try {
    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not initialize canvas context');

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

    // 1. Draw Background Image or Fallback Gradient
    try {
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        bgImg.onload = () => resolve();
        bgImg.onerror = () => resolve();
        bgImg.src = `${basePath}/gameplay_background.jpg`;
      });

      if (bgImg.complete && bgImg.naturalWidth > 0) {
        ctx.drawImage(bgImg, 0, 0, width, height);
      } else {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#0f0a14');
        grad.addColorStop(0.5, '#1e0a1c');
        grad.addColorStop(1, '#080308');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
    } catch {
      ctx.fillStyle = '#080308';
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Cinematic Vignette with #b21f85 ambient mood
    const vignette = ctx.createRadialGradient(width / 2, height / 2, 150, width / 2, height / 2, 750);
    vignette.addColorStop(0, 'rgba(10, 5, 15, 0.45)');
    vignette.addColorStop(0.7, 'rgba(12, 4, 14, 0.85)');
    vignette.addColorStop(1, 'rgba(5, 2, 6, 0.96)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // 3. Top Elephant House WONDER Logo
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        logoImg.onload = () => resolve();
        logoImg.onerror = () => resolve();
        logoImg.src = `${basePath}/wonder_logo.png`;
      });

      if (logoImg.complete && logoImg.naturalWidth > 0) {
        const logoWidth = 460;
        const logoHeight = (logoWidth / logoImg.naturalWidth) * logoImg.naturalHeight;
        ctx.drawImage(logoImg, (width - logoWidth) / 2, 65, logoWidth, logoHeight);
      }
    } catch {
      // ignore
    }

    // 4. Center Showcase Card (#b21f85 & White Branding)
    const cardX = 80;
    const cardY = 245;
    const cardW = width - 160;
    const cardH = 885;
    const radius = 44;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, radius);
    ctx.fillStyle = 'rgba(14, 8, 18, 0.86)';
    ctx.fill();

    // Border using #b21f85 and White
    ctx.lineWidth = 3.5;
    const borderGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    borderGrad.addColorStop(0, '#b21f85');
    borderGrad.addColorStop(0.5, '#ffffff');
    borderGrad.addColorStop(1, '#b21f85');
    ctx.strokeStyle = borderGrad;
    ctx.stroke();
    ctx.restore();

    // 5. Card Header - Badge & Title
    ctx.textAlign = 'center';
    ctx.font = '900 28px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#b21f85';
    ctx.fillText('🍦 OFFICIAL AR GAME SCORE CARD', width / 2, cardY + 68);

    // Player Name in Crisp White
    ctx.font = '900 48px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(data.playerName.toUpperCase(), width / 2, cardY + 138);

    ctx.font = '700 22px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillText('Tongue Catch Ice Cream Session', width / 2, cardY + 180);

    // Divider Line with #b21f85 accents
    const divGrad = ctx.createLinearGradient(cardX + 60, 0, cardX + cardW - 60, 0);
    divGrad.addColorStop(0, 'rgba(178, 31, 133, 0.1)');
    divGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    divGrad.addColorStop(1, 'rgba(178, 31, 133, 0.1)');
    ctx.beginPath();
    ctx.moveTo(cardX + 60, cardY + 215);
    ctx.lineTo(cardX + cardW - 60, cardY + 215);
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 6. Score Showcase (#b21f85 and White)
    ctx.font = '900 22px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#b21f85';
    ctx.fillText('MARKS EARNED', width / 2, cardY + 270);

    ctx.font = '900 135px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    const scoreGrad = ctx.createLinearGradient(0, cardY + 290, 0, cardY + 440);
    scoreGrad.addColorStop(0, '#ffffff');
    scoreGrad.addColorStop(0.65, '#ffffff');
    scoreGrad.addColorStop(1, '#b21f85');
    ctx.fillStyle = scoreGrad;
    ctx.fillText(data.score.toLocaleString(), width / 2, cardY + 405);

    // 7. Stats Grid (4 Boxes with #b21f85 & White Accents)
    const stats = [
      { label: 'POPSICLES CAUGHT', value: `${data.catches} 🍦` },
      { label: 'MAX COMBO', value: `${data.maxCombo}x 🔥` },
      { label: 'SESSION TIME', value: `${data.durationSeconds}s ⏱️` },
      { label: 'GLOBAL RANK', value: data.rank ? `#${data.rank} 🥇` : 'Top Tier ⭐' }
    ];

    const boxW = (cardW - 140) / 2;
    const boxH = 130;
    const startX = cardX + 50;
    const startY = cardY + 465;
    const gap = 20;

    stats.forEach((stat, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const bx = startX + col * (boxW + gap);
      const by = startY + row * (boxH + gap);

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(bx, by, boxW, boxH, 20);
      ctx.fillStyle = 'rgba(25, 12, 30, 0.8)';
      ctx.fill();

      // Box border in #b21f85 / White
      ctx.strokeStyle = 'rgba(178, 31, 133, 0.45)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = '800 17px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#b21f85';
      ctx.fillText(stat.label, bx + boxW / 2, by + 45);

      ctx.font = '900 36px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(stat.value, bx + boxW / 2, by + 95);
      ctx.restore();
    });

    // 8. Bottom Brand Callout (#b21f85 & White)
    ctx.font = '800 22px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#b21f85';
    ctx.fillText('🍦 ELEPHANT HOUSE ICE CREAM • WONDER EXPERIENCE', width / 2, cardY + cardH - 45);

    ctx.font = '800 20px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Play & Challenge Friends at: ai.loopsintegrated.co', width / 2, height - 50);

    // 9. Convert Canvas to Blob & File
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 0.95));
    if (!blob) throw new Error('Could not create image blob');

    const file = new File([blob], `elephant-house-wonder-score-${data.score}.png`, { type: 'image/png' });

    // 10. Native Web Share API
    const shareText = `🍦 I just scored ${data.score} marks on the Elephant House Wonder AR Catch Game! Can you beat my high score? Play now! #ElephantHouse #WonderIceCream`;

    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'My Elephant House AR Game Score',
        text: shareText,
        files: [file]
      });
      return { success: true, mode: 'shared' };
    }

    // Fallback: Automatic File Download
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `elephant-house-wonder-score-${data.score}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 2000);

    return { success: true, mode: 'downloaded' };
  } catch (err: unknown) {
    console.error('Score Card Share Error:', err);
    return { success: false, mode: 'downloaded', error: err instanceof Error ? err.message : 'Share failed' };
  }
}
