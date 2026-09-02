import React from 'react';

interface Props {
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  avatarIndex?: number;
}

// 1. Cap Boy (Matching the reference user avatar with pink & orange cap + hoodie)
function CapBoyAvatar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF3366" />
          <stop offset="50%" stopColor="#FF7A00" />
          <stop offset="100%" stopColor="#FFBA00" />
        </linearGradient>
        <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE0BD" />
          <stop offset="100%" stopColor="#F7C49B" />
        </linearGradient>
        <linearGradient id="capPink" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF2A6D" />
          <stop offset="100%" stopColor="#D80045" />
        </linearGradient>
        <linearGradient id="capOrange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF9500" />
          <stop offset="100%" stopColor="#FF5E00" />
        </linearGradient>
        <linearGradient id="hoodiePink" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF2A6D" />
          <stop offset="100%" stopColor="#B30036" />
        </linearGradient>
        <linearGradient id="hoodieOrange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF9500" />
          <stop offset="100%" stopColor="#D94B00" />
        </linearGradient>
      </defs>

      {/* Background Sphere Glow */}
      <circle cx="50" cy="50" r="50" fill="url(#bgGrad)" />

      {/* Hoodie Body (Bottom) */}
      <path d="M22 100 C22 78 35 72 50 72 C65 72 78 78 78 100 Z" fill="url(#hoodiePink)" />
      {/* Hoodie Shoulder Accents */}
      <path d="M22 100 C22 84 30 76 38 74 L25 100 Z" fill="url(#hoodieOrange)" />
      <path d="M78 100 C78 84 70 76 62 74 L75 100 Z" fill="url(#hoodieOrange)" />
      {/* Hoodie Collar / Drawstrings */}
      <path d="M42 74 L42 88 M58 74 L58 88" stroke="#FFE600" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="42" cy="89" r="2" fill="#FFE600" />
      <circle cx="58" cy="89" r="2" fill="#FFE600" />

      {/* Neck */}
      <path d="M43 62 L57 62 L57 74 L43 74 Z" fill="#E8B084" />

      {/* Ears */}
      <circle cx="28" cy="52" r="7" fill="url(#skinGrad)" />
      <circle cx="28" cy="52" r="3.5" fill="#EAA97D" />
      <circle cx="72" cy="52" r="7" fill="url(#skinGrad)" />
      <circle cx="72" cy="52" r="3.5" fill="#EAA97D" />

      {/* Head / Face */}
      <ellipse cx="50" cy="52" rx="22" ry="20" fill="url(#skinGrad)" />

      {/* Cheeks Blush */}
      <circle cx="37" cy="56" r="4.5" fill="#FF5E7E" opacity="0.45" />
      <circle cx="63" cy="56" r="4.5" fill="#FF5E7E" opacity="0.45" />

      {/* Big Cute Eyes */}
      <ellipse cx="41" cy="48" rx="4" ry="5.5" fill="#221510" />
      <circle cx="42.5" cy="46" r="1.8" fill="#FFFFFF" />
      <circle cx="39.5" cy="50" r="0.9" fill="#FFFFFF" />

      <ellipse cx="59" cy="48" rx="4" ry="5.5" fill="#221510" />
      <circle cx="60.5" cy="46" r="1.8" fill="#FFFFFF" />
      <circle cx="57.5" cy="50" r="0.9" fill="#FFFFFF" />

      {/* Eyebrows */}
      <path d="M37 40 C39 38 44 39 45 41" stroke="#4A2A18" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M63 40 C61 38 56 39 55 41" stroke="#4A2A18" strokeWidth="1.8" strokeLinecap="round" />

      {/* Nose */}
      <circle cx="50" cy="53" r="1.5" fill="#DF9968" />

      {/* Joyful Open Mouth with Tongue */}
      <path d="M43 57 Q50 67 57 57 Z" fill="#781216" />
      <path d="M46 61 Q50 66 54 61 Q50 58 46 61 Z" fill="#FF5A78" />

      {/* Front Hair Bangs */}
      <path d="M32 40 Q40 46 45 38 Q50 47 56 38 Q61 46 68 40 Q62 33 50 33 Q38 33 32 40 Z" fill="#3D2115" />

      {/* Backwards Cap (Pink & Orange Segments) */}
      <path d="M28 35 C28 17 72 17 72 35 C72 37 28 37 28 35 Z" fill="url(#capPink)" />
      <path d="M42 19 C42 19 46 36 46 36 L54 36 L58 19 C54 18 46 18 42 19 Z" fill="url(#capOrange)" />
      
      {/* Cap Visor / Brim turned sideways/backwards */}
      <path d="M67 33 C77 34 82 42 75 44 C70 45 66 38 67 33 Z" fill="url(#capOrange)" stroke="#B34400" strokeWidth="1" />
      
      {/* Cap Top Button */}
      <circle cx="50" cy="18" r="3" fill="#FFE600" />
      <circle cx="50" cy="18" r="1.5" fill="#FFF" opacity="0.6" />
    </svg>
  );
}

// 2. Joy Girl (Cute anime/cartoon girl with pink pigtails and headband)
function JoyGirlAvatar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="girlBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7928CA" />
          <stop offset="50%" stopColor="#FF0080" />
          <stop offset="100%" stopColor="#FF79C6" />
        </linearGradient>
        <linearGradient id="girlHair" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A1E16" />
          <stop offset="100%" stopColor="#2D110C" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="50" fill="url(#girlBg)" />

      {/* Pigtails */}
      <circle cx="20" cy="46" r="12" fill="url(#girlHair)" />
      <circle cx="80" cy="46" r="12" fill="url(#girlHair)" />
      <circle cx="24" cy="46" r="4" fill="#FF007F" />
      <circle cx="76" cy="46" r="4" fill="#FF007F" />

      {/* Dress */}
      <path d="M26 100 C26 78 36 74 50 74 C64 74 74 78 74 100 Z" fill="#FF1493" />
      <path d="M42 74 Q50 82 58 74 Z" fill="#FFF" />

      {/* Neck */}
      <path d="M44 64 L56 64 L56 75 L44 75 Z" fill="#F0B58E" />

      {/* Face */}
      <ellipse cx="50" cy="54" rx="21" ry="19" fill="#FFDFC4" />

      {/* Blush */}
      <circle cx="36" cy="58" r="5" fill="#FF69B4" opacity="0.5" />
      <circle cx="64" cy="58" r="5" fill="#FF69B4" opacity="0.5" />

      {/* Big Sparkling Anime Eyes */}
      <ellipse cx="40" cy="50" rx="4.5" ry="6" fill="#1A102F" />
      <circle cx="41.5" cy="48" r="2" fill="#FFF" />
      <circle cx="38.5" cy="53" r="1" fill="#FFF" />

      <ellipse cx="60" cy="50" rx="4.5" ry="6" fill="#1A102F" />
      <circle cx="61.5" cy="48" r="2" fill="#FFF" />
      <circle cx="58.5" cy="53" r="1" fill="#FFF" />

      {/* Cute Smile */}
      <path d="M44 59 Q50 67 56 59 Z" fill="#D81B60" />
      <circle cx="50" cy="55" r="1.5" fill="#E59866" />

      {/* Hair Bangs & Yellow Star Clip */}
      <path d="M29 44 C28 26 72 26 71 44 C67 36 58 46 50 36 C42 46 33 36 29 44 Z" fill="url(#girlHair)" />
      <polygon points="32,32 34,36 38,36 35,39 36,43 32,40 28,43 29,39 26,36 30,36" fill="#FFD700" />
    </svg>
  );
}

// 3. Cool Lion Cub Mascot (Elephant House theme buddy with cool sunglasses)
function CoolLionAvatar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="lionBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF9900" />
          <stop offset="100%" stopColor="#FF5500" />
        </linearGradient>
        <linearGradient id="maneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E65100" />
          <stop offset="100%" stopColor="#BF360C" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="50" fill="url(#lionBg)" />

      {/* Lion Mane */}
      <circle cx="50" cy="50" r="38" fill="url(#maneGrad)" />

      {/* Ears */}
      <circle cx="28" cy="28" r="10" fill="#FFA726" />
      <circle cx="28" cy="28" r="5" fill="#FFE082" />
      <circle cx="72" cy="28" r="10" fill="#FFA726" />
      <circle cx="72" cy="28" r="5" fill="#FFE082" />

      {/* Face */}
      <circle cx="50" cy="52" r="26" fill="#FFCC80" />
      <ellipse cx="50" cy="62" rx="14" ry="10" fill="#FFF8E1" />

      {/* Cool Black Sunglasses */}
      <rect x="28" y="42" width="18" height="12" rx="3" fill="#1A1A24" stroke="#FFE600" strokeWidth="1.5" />
      <rect x="54" y="42" width="18" height="12" rx="3" fill="#1A1A24" stroke="#FFE600" strokeWidth="1.5" />
      <line x1="46" y1="46" x2="54" y2="46" stroke="#FFE600" strokeWidth="2" />
      {/* Glare on Sunglasses */}
      <line x1="31" y1="44" x2="35" y2="52" stroke="#FFF" strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
      <line x1="57" y1="44" x2="61" y2="52" stroke="#FFF" strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />

      {/* Nose & Smile */}
      <polygon points="46,58 54,58 50,62" fill="#E65100" />
      <path d="M44 65 Q50 72 56 65" stroke="#BF360C" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Whiskers */}
      <line x1="26" y1="62" x2="38" y2="63" stroke="#8D6E63" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="74" y1="62" x2="62" y2="63" stroke="#8D6E63" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// 4. Frosty Elephant House Popsicle Buddy (Smiling cute popsicle mascot)
function PopsicleBuddyAvatar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="popBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00C9FF" />
          <stop offset="100%" stopColor="#92FE9D" />
        </linearGradient>
        <linearGradient id="popBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF1493" />
          <stop offset="50%" stopColor="#FF69B4" />
          <stop offset="100%" stopColor="#FFA07A" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="50" fill="url(#popBg)" />

      {/* Wooden Stick */}
      <rect x="44" y="70" width="12" height="24" rx="6" fill="#DEB887" stroke="#8B5A2B" strokeWidth="1.5" />

      {/* Popsicle Body */}
      <path d="M28 40 C28 22 72 22 72 40 L72 72 C72 75 69 77 66 77 L34 77 C31 77 28 75 28 72 Z" fill="url(#popBody)" />
      
      {/* Glaze Highlight */}
      <path d="M34 34 C34 26 44 24 50 24" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

      {/* Cute Face */}
      <ellipse cx="40" cy="46" rx="3.5" ry="5" fill="#1A1A24" />
      <circle cx="41.5" cy="44" r="1.5" fill="#FFF" />
      <ellipse cx="60" cy="46" rx="3.5" ry="5" fill="#1A1A24" />
      <circle cx="61.5" cy="44" r="1.5" fill="#FFF" />

      {/* Blush */}
      <circle cx="34" cy="53" r="4" fill="#FF007F" opacity="0.4" />
      <circle cx="66" cy="53" r="4" fill="#FF007F" opacity="0.4" />

      {/* Big Happy Smile with Tongue */}
      <path d="M43 54 Q50 63 57 54 Z" fill="#8B0000" />
      <circle cx="50" cy="57" r="2.5" fill="#FF69B4" />
    </svg>
  );
}

export default function CartoonAvatar({
  name = '',
  size = 'md',
  className = '',
  avatarIndex
}: Props) {
  // Determine avatar type based on explicit index or deterministic hash of player name
  const index =
    typeof avatarIndex === 'number'
      ? avatarIndex
      : Math.abs(
          name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        ) % 4;

  const sizeClass = {
    sm: 'w-8 h-8 sm:w-9 sm:h-9',
    md: 'w-11 h-11 sm:w-12 sm:h-12',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-20 h-20 sm:w-24 sm:h-24'
  }[size];

  let AvatarSvg = CapBoyAvatar;
  if (index === 1) AvatarSvg = JoyGirlAvatar;
  else if (index === 2) AvatarSvg = CoolLionAvatar;
  else if (index === 3) AvatarSvg = PopsicleBuddyAvatar;

  return (
    <div className={`rounded-full overflow-hidden flex items-center justify-center select-none ${sizeClass} ${className}`}>
      <AvatarSvg className="w-full h-full object-cover" />
    </div>
  );
}
