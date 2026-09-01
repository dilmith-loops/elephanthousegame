import { PopsicleType } from '../types/game';

export interface FlavorConfig {
  type: PopsicleType;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  points: number;
}

export const FLAVORS: Record<PopsicleType, FlavorConfig> = {
  chocobar: {
    type: 'chocobar',
    name: 'Choco Crunch',
    primaryColor: '#3E2723',
    secondaryColor: '#FFF8E1',
    points: 1
  },
  berry_rocket: {
    type: 'berry_rocket',
    name: 'Berry Rocket',
    primaryColor: '#E91E63',
    secondaryColor: '#00E5FF',
    points: 1
  },
  mango_pop: {
    type: 'mango_pop',
    name: 'Mango Blast',
    primaryColor: '#FF9800',
    secondaryColor: '#FFEB3B',
    points: 1
  },
  twister: {
    type: 'twister',
    name: 'Rainbow Twister',
    primaryColor: '#4CAF50',
    secondaryColor: '#E91E63',
    points: 1
  },
  wonder_cone: {
    type: 'wonder_cone',
    name: 'Wonder Cone',
    primaryColor: '#F06292',
    secondaryColor: '#D7CCC8',
    points: 2
  },
  golden_star: {
    type: 'golden_star',
    name: 'Golden Elephant House Star',
    primaryColor: '#FFD700',
    secondaryColor: '#FFF',
    points: 3
  }
};

export function drawPopsicle(
  ctx: CanvasRenderingContext2D,
  type: PopsicleType,
  x: number,
  y: number,
  size: number = 60,
  rotation: number = 0,
  opacity: number = 1
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = opacity;

  // Scale relative to base size 60
  const scale = size / 60;
  ctx.scale(scale, scale);

  switch (type) {
    case 'chocobar':
      drawChocobar(ctx);
      break;
    case 'berry_rocket':
      drawBerryRocket(ctx);
      break;
    case 'mango_pop':
      drawMangoPop(ctx);
      break;
    case 'twister':
      drawTwister(ctx);
      break;
    case 'wonder_cone':
      drawWonderCone(ctx);
      break;
    case 'golden_star':
      drawGoldenStar(ctx);
      break;
    default:
      drawChocobar(ctx);
  }

  ctx.restore();
}

function drawWoodenStick(ctx: CanvasRenderingContext2D, stickY: number = 20, stickHeight: number = 32) {
  ctx.fillStyle = '#D7CCC8';
  ctx.strokeStyle = '#BCAAA4';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.roundRect(-5, stickY, 10, stickHeight, [0, 0, 5, 5]);
  ctx.fill();
  ctx.stroke();

  // Stick grain line
  ctx.strokeStyle = '#A1887F';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, stickY + 5);
  ctx.lineTo(0, stickY + stickHeight - 6);
  ctx.stroke();
}

function drawChocobar(ctx: CanvasRenderingContext2D) {
  drawWoodenStick(ctx, 16, 26);

  // Outer chocolate coating
  const grad = ctx.createLinearGradient(-18, -35, 18, 20);
  grad.addColorStop(0, '#5D4037');
  grad.addColorStop(0.5, '#3E2723');
  grad.addColorStop(1, '#271206');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(-16, -35, 32, 52, [16, 16, 6, 6]);
  ctx.fill();

  // Chocolate highlight shine
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.beginPath();
  ctx.roundRect(-12, -30, 6, 40, 3);
  ctx.fill();

  // Chocolate bite mark / crunch bits
  ctx.fillStyle = '#FFE082';
  ctx.beginPath();
  ctx.arc(4, -18, 2, 0, Math.PI * 2);
  ctx.arc(-2, -5, 2.5, 0, Math.PI * 2);
  ctx.arc(6, 6, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Frost drop
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.arc(-8, -22, 1.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawBerryRocket(ctx: CanvasRenderingContext2D) {
  drawWoodenStick(ctx, 18, 24);

  // Top Section (Red Cherry/Berry)
  ctx.fillStyle = '#E91E63';
  ctx.beginPath();
  ctx.moveTo(-16, -18);
  ctx.quadraticCurveTo(0, -42, 16, -18);
  ctx.lineTo(16, -8);
  ctx.lineTo(-16, -8);
  ctx.closePath();
  ctx.fill();

  // Middle Section (White Vanilla)
  ctx.fillStyle = '#FFF8E1';
  ctx.fillRect(-16, -8, 32, 12);

  // Bottom Section (Blue Raspberry)
  ctx.fillStyle = '#00B0FF';
  ctx.beginPath();
  ctx.roundRect(-16, 4, 32, 16, [0, 0, 8, 8]);
  ctx.fill();

  // Glossy highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath();
  ctx.roundRect(-12, -28, 5, 42, 2);
  ctx.fill();
}

function drawMangoPop(ctx: CanvasRenderingContext2D) {
  drawWoodenStick(ctx, 18, 26);

  // Mango Gradient
  const grad = ctx.createLinearGradient(0, -35, 0, 20);
  grad.addColorStop(0, '#FF5722');
  grad.addColorStop(0.4, '#FF9800');
  grad.addColorStop(1, '#FFEB3B');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(-15, -34, 30, 52, [14, 14, 6, 6]);
  ctx.fill();

  // Texture grooves
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-6, -26);
  ctx.lineTo(-6, 12);
  ctx.moveTo(6, -26);
  ctx.lineTo(6, 12);
  ctx.stroke();

  // Mango slice / kiwi accent
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.arc(-9, -20, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawTwister(ctx: CanvasRenderingContext2D) {
  drawWoodenStick(ctx, 18, 26);

  // Base background
  ctx.fillStyle = '#FFEB3B';
  ctx.beginPath();
  ctx.roundRect(-14, -36, 28, 54, [14, 14, 6, 6]);
  ctx.fill();

  // Spiral swirl 1 (Lime Green)
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath();
  ctx.moveTo(-14, -30);
  ctx.quadraticCurveTo(0, -22, 14, -26);
  ctx.lineTo(14, -16);
  ctx.quadraticCurveTo(0, -12, -14, -20);
  ctx.closePath();
  ctx.fill();

  // Spiral swirl 2 (Strawberry Red)
  ctx.fillStyle = '#E91E63';
  ctx.beginPath();
  ctx.moveTo(-14, -10);
  ctx.quadraticCurveTo(0, -2, 14, -6);
  ctx.lineTo(14, 4);
  ctx.quadraticCurveTo(0, 8, -14, 0);
  ctx.closePath();
  ctx.fill();

  // Spiral swirl 3 (Lime Green)
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath();
  ctx.moveTo(-14, 8);
  ctx.quadraticCurveTo(0, 16, 14, 12);
  ctx.lineTo(14, 18);
  ctx.lineTo(-14, 18);
  ctx.closePath();
  ctx.fill();

  // Shimmer
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.roundRect(-10, -32, 4, 44, 2);
  ctx.fill();
}

function drawWonderCone(ctx: CanvasRenderingContext2D) {
  // Waffle cone
  ctx.fillStyle = '#D7995B';
  ctx.strokeStyle = '#B37233';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-16, 2);
  ctx.lineTo(0, 36);
  ctx.lineTo(16, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Waffle grid lines
  ctx.strokeStyle = 'rgba(120, 60, 10, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-10, 8);
  ctx.lineTo(6, 24);
  ctx.moveTo(-4, 2);
  ctx.lineTo(12, 18);
  ctx.moveTo(10, 8);
  ctx.lineTo(-6, 24);
  ctx.moveTo(4, 2);
  ctx.lineTo(-12, 18);
  ctx.stroke();

  // Ice cream scoop bottom
  ctx.fillStyle = '#FFF9C4';
  ctx.beginPath();
  ctx.arc(0, 2, 17, 0, Math.PI);
  ctx.fill();

  // Ice cream scoop top (Strawberry Swirl)
  ctx.fillStyle = '#F06292';
  ctx.beginPath();
  ctx.arc(0, 0, 18, Math.PI, 0);
  ctx.fill();

  // Swirl peak
  ctx.fillStyle = '#FF4081';
  ctx.beginPath();
  ctx.moveTo(-12, -2);
  ctx.quadraticCurveTo(0, -28, 6, -30);
  ctx.quadraticCurveTo(2, -18, 12, -2);
  ctx.closePath();
  ctx.fill();

  // Cherry on top
  ctx.fillStyle = '#D50000';
  ctx.beginPath();
  ctx.arc(6, -28, 5, 0, Math.PI * 2);
  ctx.fill();

  // Cherry stem
  ctx.strokeStyle = '#33691E';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(6, -33);
  ctx.quadraticCurveTo(12, -40, 16, -38);
  ctx.stroke();

  // Sprinkles
  const sprinkles = [
    { x: -8, y: -8, c: '#00E5FF' },
    { x: 2, y: -12, c: '#FFEB3B' },
    { x: 8, y: -4, c: '#76FF03' },
    { x: -2, y: -4, c: '#FFF' }
  ];
  sprinkles.forEach(s => {
    ctx.fillStyle = s.c;
    ctx.fillRect(s.x, s.y, 4, 1.8);
  });
}

function drawGoldenStar(ctx: CanvasRenderingContext2D) {
  drawWoodenStick(ctx, 16, 26);

  // Outer Golden Glow
  const grad = ctx.createRadialGradient(0, -8, 2, 0, -8, 24);
  grad.addColorStop(0, '#FFF9C4');
  grad.addColorStop(0.5, '#FFD700');
  grad.addColorStop(1, '#FF8F00');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(-16, -34, 32, 50, [16, 16, 6, 6]);
  ctx.fill();

  // Golden star badge
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  const starPoints = 5;
  const outerR = 10;
  const innerR = 4.5;
  for (let i = 0; i < starPoints * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / starPoints - Math.PI / 2;
    const px = Math.cos(angle) * r;
    const py = -10 + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Sparkles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(-8, -26, 2, 0, Math.PI * 2);
  ctx.arc(8, 6, 1.5, 0, Math.PI * 2);
  ctx.fill();
}
