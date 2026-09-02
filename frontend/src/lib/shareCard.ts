/**
 * Elephant House AR Game - Social Score Card Generator
 * Generates a high-res branded 1080x1350 social share image styled in a Premium LIGHT THEME with White & #b21f85 (Wonder Pink)
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

    // 1. Draw Background (Wonder / Gameplay Background with Light Daylight Wash)
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

    // 2. Light Theme Frosted Wash & Subtle Ambient Glow
    const lightWash = ctx.createLinearGradient(0, 0, 0, height);
    lightWash.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    lightWash.addColorStop(0.5, 'rgba(255, 248, 252, 0.92)');
    lightWash.addColorStop(1, 'rgba(255, 240, 248, 0.96)');
    ctx.fillStyle = lightWash;
    ctx.fillRect(0, 0, width, height);

    // Subtle ambient pink radial glows
    const pinkGlow = ctx.createRadialGradient(width / 2, 120, 50, width / 2, 120, 500);
    pinkGlow.addColorStop(0, 'rgba(178, 31, 133, 0.12)');
    pinkGlow.addColorStop(1, 'rgba(178, 31, 133, 0)');
    ctx.fillStyle = pinkGlow;
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
        ctx.drawImage(logoImg, (width - logoWidth) / 2, 60, logoWidth, logoHeight);
      }
    } catch {
      // ignore
    }

    // 4. Center Showcase Card (Pure White with #b21f85 border and soft shadow)
    const cardX = 80;
    const cardY = 240;
    const cardW = width - 160;
    const cardH = 890;
    const radius = 44;

    ctx.save();
    // Soft drop shadow
    ctx.shadowColor = 'rgba(178, 31, 133, 0.2)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 16;

    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, radius);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    // Card Border in #b21f85
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, radius);
    ctx.lineWidth = 3.5;
    const borderGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    borderGrad.addColorStop(0, '#b21f85');
    borderGrad.addColorStop(0.5, '#e11d48');
    borderGrad.addColorStop(1, '#b21f85');
    ctx.strokeStyle = borderGrad;
    ctx.stroke();
    ctx.restore();

    // 5. Card Header - Badge & Title
    ctx.textAlign = 'center';
    ctx.font = '900 28px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#b21f85';
    ctx.fillText('🏆 OFFICIAL AR GAME SCORE CARD', width / 2, cardY + 68);

    // Player Name in Bold Deep Charcoal
    ctx.font = '900 48px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(data.playerName.toUpperCase(), width / 2, cardY + 138);

    // Subtitle
    ctx.font = '700 22px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Tongue Catch Ice Cream Session', width / 2, cardY + 180);

    // Divider Line in #b21f85 soft pink
    const divGrad = ctx.createLinearGradient(cardX + 60, 0, cardX + cardW - 60, 0);
    divGrad.addColorStop(0, 'rgba(178, 31, 133, 0.05)');
    divGrad.addColorStop(0.5, 'rgba(178, 31, 133, 0.25)');
    divGrad.addColorStop(1, 'rgba(178, 31, 133, 0.05)');
    ctx.beginPath();
    ctx.moveTo(cardX + 60, cardY + 215);
    ctx.lineTo(cardX + cardW - 60, cardY + 215);
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 6. Score Showcase (#b21f85 Vibrant Gradient)
    ctx.font = '900 22px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#b21f85';
    ctx.fillText('MARKS EARNED', width / 2, cardY + 270);

    ctx.font = '900 135px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    const scoreGrad = ctx.createLinearGradient(0, cardY + 290, 0, cardY + 440);
    scoreGrad.addColorStop(0, '#b21f85');
    scoreGrad.addColorStop(0.65, '#e11d48');
    scoreGrad.addColorStop(1, '#ff6a00');
    ctx.fillStyle = scoreGrad;
    ctx.fillText(data.score.toLocaleString(), width / 2, cardY + 405);

    // 7. Stats Grid (4 Light Boxes with #b21f85 Accents)
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
      ctx.fillStyle = '#fdf2f8'; // soft light pink background
      ctx.fill();

      // Box border in #b21f85
      ctx.strokeStyle = 'rgba(178, 31, 133, 0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = '800 17px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#b21f85';
      ctx.fillText(stat.label, bx + boxW / 2, by + 45);

      ctx.font = '900 36px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(stat.value, bx + boxW / 2, by + 95);
      ctx.restore();
    });

    // 8. Bottom Brand Callout
    ctx.font = '800 22px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#b21f85';
    ctx.fillText('🍦 ELEPHANT HOUSE ICE CREAM • WONDER EXPERIENCE', width / 2, cardY + cardH - 45);

    ctx.font = '800 20px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Play & Challenge Friends at: ai.loopsintegrated.co', width / 2, height - 50);

    // 9. Convert Canvas to Blob & File
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 0.95));
    if (!blob) throw new Error('Could not create image blob');

    const file = new File([blob], `elephant-house-wonder-score-${data.score}.png`, { type: 'image/png' });

    // 10. Native Web Share API
    const shareUrl = typeof window !== 'undefined' && window.location.origin ? window.location.origin + (process.env.NEXT_PUBLIC_BASE_PATH || '') : 'https://ai.loopsintegrated.co';
    const shareText = `🍦 I just scored ${data.score} marks on the Elephant House Wonder AR Catch Game! Can you beat my high score? Play now: ${shareUrl} #ElephantHouse #WonderIceCream`;

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
