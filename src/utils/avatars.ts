/**
 * Self-Contained Anime Vector Avatars for TutorLink
 * Uses Base64 data URIs for 100% bulletproof rendering in all browsers & WebViews
 */
import React from 'react';

// Helper to encode SVG string to Base64 Data URI
function svgToBase64Uri(svgString: string): string {
  const clean = svgString.trim();
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    try {
      return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(clean)))}`;
    } catch {
      // Fallback
    }
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(clean)}`;
}

// 1. Kavindu Perera - Engineering Tutor (Sharp anime hair, focused expressive eyes, indigo collar)
const KAVINDU_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_kavindu" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818CF8"/>
      <stop offset="100%" stop-color="#4F46E5"/>
    </linearGradient>
    <linearGradient id="hair_k" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E1B4B"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#bg_kavindu)"/>
  <!-- Jacket -->
  <path d="M22 100 C22 75, 35 70, 50 70 C65 70, 78 75, 78 100 Z" fill="#1E1B4B"/>
  <path d="M42 70 L50 82 L58 70 Z" fill="#EEF2FF"/>
  <path d="M47 80 L50 84 L53 80 Z" fill="#4F46E5"/>
  <!-- Neck -->
  <path d="M44 60 H56 V72 H44 Z" fill="#FBBF24"/>
  <!-- Face -->
  <path d="M32 38 C32 25, 68 25, 68 38 C68 56, 58 66, 50 67 C42 66, 32 56, 32 38 Z" fill="#FDE68A"/>
  <!-- Ears -->
  <circle cx="31" cy="42" r="5" fill="#FCD34D"/>
  <circle cx="69" cy="42" r="5" fill="#FCD34D"/>
  <!-- Anime Eyes -->
  <ellipse cx="41" cy="42" rx="4" ry="5.5" fill="#1E1B4B"/>
  <circle cx="39.5" cy="40" r="1.8" fill="#FFFFFF"/>
  <circle cx="42.5" cy="44" r="0.8" fill="#FFFFFF"/>
  <ellipse cx="59" cy="42" rx="4" ry="5.5" fill="#1E1B4B"/>
  <circle cx="57.5" cy="40" r="1.8" fill="#FFFFFF"/>
  <circle cx="60.5" cy="44" r="0.8" fill="#FFFFFF"/>
  <!-- Eyebrows -->
  <path d="M37 34 Q42 32 46 34" stroke="#1E1B4B" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <path d="M54 34 Q58 32 63 34" stroke="#1E1B4B" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <!-- Smile & Nose -->
  <path d="M50 47 V49" stroke="#D97706" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M46 54 Q50 58 54 54" stroke="#B45309" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <!-- Spiky Anime Hair -->
  <path d="M26 36 C24 16, 42 12, 50 12 C62 12, 76 16, 74 36 C70 28, 64 22, 58 20 C64 26, 62 34, 58 36 C56 28, 48 24, 46 22 C48 30, 44 38, 38 38 C40 28, 34 26, 26 36 Z" fill="url(#hair_k)"/>
  <!-- Hair highlight -->
  <path d="M38 18 Q50 15 62 18" stroke="#818CF8" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.8"/>
</svg>
`;

// 2. Thisal Jayawardena - Pre-med Chemistry/Biology Tutor
const THISAL_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_thisal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2DD4BF"/>
      <stop offset="100%" stop-color="#0D9488"/>
    </linearGradient>
    <linearGradient id="hair_t" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#134E4A"/>
      <stop offset="100%" stop-color="#042F2E"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#bg_thisal)"/>
  <!-- Shirt & Lab Collar -->
  <path d="M20 100 C20 75, 34 70, 50 70 C66 70, 80 75, 80 100 Z" fill="#0F766E"/>
  <path d="M40 70 L50 84 L60 70 Z" fill="#FFFFFF"/>
  <path d="M46 70 L50 78 L54 70 Z" fill="#14B8A6"/>
  <!-- Neck -->
  <path d="M44 60 H56 V72 H44 Z" fill="#FBBF24"/>
  <!-- Face -->
  <path d="M33 38 C33 24, 67 24, 67 38 C67 56, 58 66, 50 67 C42 66, 33 56, 33 38 Z" fill="#FDE68A"/>
  <!-- Ears -->
  <circle cx="31" cy="42" r="5" fill="#FCD34D"/>
  <circle cx="69" cy="42" r="5" fill="#FCD34D"/>
  <!-- Anime Eyes -->
  <ellipse cx="41" cy="43" rx="4.2" ry="5.5" fill="#042F2E"/>
  <circle cx="39.5" cy="41" r="1.6" fill="#FFFFFF"/>
  <ellipse cx="59" cy="43" rx="4.2" ry="5.5" fill="#042F2E"/>
  <circle cx="57.5" cy="41" r="1.6" fill="#FFFFFF"/>
  <!-- Glasses Rim Accent -->
  <rect x="34" y="37" width="14" height="11" rx="3" stroke="#14B8A6" stroke-width="1.4" fill="none"/>
  <rect x="52" y="37" width="14" height="11" rx="3" stroke="#14B8A6" stroke-width="1.4" fill="none"/>
  <path d="M48 42 H52" stroke="#14B8A6" stroke-width="1.4"/>
  <!-- Smile -->
  <path d="M47 55 Q50 58 53 55" stroke="#B45309" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <!-- Hair (Side Part Neat Anime) -->
  <path d="M28 36 C26 15, 45 10, 52 10 C66 10, 76 16, 73 36 C68 25, 58 20, 48 20 C42 20, 36 28, 30 36 Z" fill="url(#hair_t)"/>
  <path d="M30 22 C38 18, 52 18, 58 28 C54 36, 48 38, 44 38 C48 30, 40 24, 30 22 Z" fill="url(#hair_t)"/>
</svg>
`;

// 3. Sanduni Senanayake - Literature Tutor
const SANDUNI_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_sanduni" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F472B6"/>
      <stop offset="100%" stop-color="#DB2777"/>
    </linearGradient>
    <linearGradient id="hair_s" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4A044E"/>
      <stop offset="100%" stop-color="#2E1065"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#bg_sanduni)"/>
  <!-- Hair Back -->
  <path d="M22 45 C18 70, 24 95, 30 100 L70 100 C76 95, 82 70, 78 45 Z" fill="url(#hair_s)"/>
  <!-- Blouse -->
  <path d="M24 100 C24 78, 36 74, 50 74 C64 74, 76 78, 76 100 Z" fill="#FDF2F8"/>
  <path d="M44 74 L50 82 L56 74 Z" fill="#F472B6"/>
  <!-- Face -->
  <path d="M33 39 C33 26, 67 26, 67 39 C67 56, 58 65, 50 66 C42 65, 33 56, 33 39 Z" fill="#FEF3C7"/>
  <!-- Large Anime Eyes -->
  <ellipse cx="41" cy="43" rx="4.5" ry="6" fill="#701A75"/>
  <circle cx="39.5" cy="41" r="2" fill="#FFFFFF"/>
  <circle cx="42.5" cy="45" r="0.9" fill="#FFFFFF"/>
  <ellipse cx="59" cy="43" rx="4.5" ry="6" fill="#701A75"/>
  <circle cx="57.5" cy="41" r="2" fill="#FFFFFF"/>
  <circle cx="60.5" cy="45" r="0.9" fill="#FFFFFF"/>
  <!-- Soft Blush -->
  <ellipse cx="37" cy="49" rx="3.5" ry="1.8" fill="#F472B6" opacity="0.6"/>
  <ellipse cx="63" cy="49" rx="3.5" ry="1.8" fill="#F472B6" opacity="0.6"/>
  <!-- Smile -->
  <path d="M47 55 Q50 58 53 55" stroke="#BE185D" stroke-width="1.4" stroke-linecap="round" fill="none"/>
  <!-- Bangs and Front Hair -->
  <path d="M27 38 C27 18, 42 12, 50 12 C58 12, 73 18, 73 38 C68 28, 62 25, 56 36 C54 28, 46 25, 42 36 C38 26, 32 28, 27 38 Z" fill="url(#hair_s)"/>
  <!-- Star hairpin -->
  <polygon points="31,24 33,28 37,28 34,31 35,35 31,32 27,35 28,31 25,28 29,28" fill="#FBBF24"/>
</svg>
`;

// 4. Senuri Dias - Student / Tutee
const SENURI_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_senuri" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A78BFA"/>
      <stop offset="100%" stop-color="#6D28D9"/>
    </linearGradient>
    <linearGradient id="hair_sen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E1B4B"/>
      <stop offset="100%" stop-color="#312E81"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#bg_senuri)"/>
  <!-- Pigtails -->
  <ellipse cx="20" cy="46" rx="6" ry="14" fill="url(#hair_sen)"/>
  <ellipse cx="80" cy="46" rx="6" ry="14" fill="url(#hair_sen)"/>
  <circle cx="25" cy="38" r="3.5" fill="#F43F5E"/>
  <circle cx="75" cy="38" r="3.5" fill="#F43F5E"/>
  <!-- Cardigan -->
  <path d="M22 100 C22 75, 34 70, 50 70 C66 70, 78 75, 78 100 Z" fill="#EEF2FF"/>
  <path d="M38 70 L50 84 L62 70 Z" fill="#818CF8"/>
  <path d="M46 72 L50 78 L54 72 Z" fill="#F43F5E"/>
  <!-- Face -->
  <path d="M33 38 C33 24, 67 24, 67 38 C67 56, 58 66, 50 67 C42 66, 33 56, 33 38 Z" fill="#FEF3C7"/>
  <!-- Big Sparkling Anime Eyes -->
  <ellipse cx="41" cy="43" rx="4.8" ry="6.2" fill="#4338CA"/>
  <circle cx="39" cy="41" r="2.2" fill="#FFFFFF"/>
  <circle cx="43" cy="45" r="1.1" fill="#FFFFFF"/>
  <ellipse cx="59" cy="43" rx="4.8" ry="6.2" fill="#4338CA"/>
  <circle cx="57" cy="41" r="2.2" fill="#FFFFFF"/>
  <circle cx="61" cy="45" r="1.1" fill="#FFFFFF"/>
  <!-- Rosy Cheeks -->
  <ellipse cx="36" cy="49" rx="3.5" ry="2" fill="#FB7185" opacity="0.6"/>
  <ellipse cx="64" cy="49" rx="3.5" ry="2" fill="#FB7185" opacity="0.6"/>
  <!-- Cheerful Smile -->
  <path d="M46 54 Q50 59 54 54" stroke="#BE123C" stroke-width="1.6" stroke-linecap="round" fill="#FEE2E2"/>
  <!-- Bangs -->
  <path d="M28 35 C28 16, 44 12, 50 12 C56 12, 72 16, 72 35 C68 24, 60 22, 55 34 C53 26, 47 24, 43 35 C38 24, 32 26, 28 35 Z" fill="url(#hair_sen)"/>
</svg>
`;

// 5. Chamod Silva - Student
const CHAMOD_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_chamod" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#bg_chamod)"/>
  <!-- Hoodie -->
  <path d="M22 100 C22 75, 34 70, 50 70 C66 70, 78 75, 78 100 Z" fill="#0C4A6E"/>
  <circle cx="50" cy="74" r="8" fill="#38BDF8"/>
  <!-- Face -->
  <path d="M33 38 C33 24, 67 24, 67 38 C67 56, 58 66, 50 67 C42 66, 33 56, 33 38 Z" fill="#FDE68A"/>
  <!-- Eyes -->
  <ellipse cx="41" cy="43" rx="4" ry="5.5" fill="#0369A1"/>
  <circle cx="39.5" cy="41" r="1.8" fill="#FFFFFF"/>
  <ellipse cx="59" cy="43" rx="4" ry="5.5" fill="#0369A1"/>
  <circle cx="57.5" cy="41" r="1.8" fill="#FFFFFF"/>
  <!-- Smile -->
  <path d="M46 54 Q50 58 54 54" stroke="#B45309" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  <!-- Spiky Tousled Hair -->
  <path d="M26 36 C24 14, 42 10, 50 10 C62 10, 76 14, 74 36 C70 26, 64 20, 58 20 C64 26, 60 34, 56 36 C54 26, 46 22, 44 20 C46 30, 42 36, 36 36 C38 26, 32 24, 26 36 Z" fill="#0F172A"/>
</svg>
`;

// 6. Malani Jayawardena - Parent
const MALANI_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_malani" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FB7185"/>
      <stop offset="100%" stop-color="#E11D48"/>
    </linearGradient>
    <linearGradient id="hair_m" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#312E81"/>
      <stop offset="100%" stop-color="#1E1B4B"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#bg_malani)"/>
  <!-- Hair Back -->
  <path d="M24 45 C20 70, 26 95, 32 100 L68 100 C74 95, 80 70, 76 45 Z" fill="url(#hair_m)"/>
  <!-- Dress -->
  <path d="M22 100 C22 75, 34 70, 50 70 C66 70, 78 75, 78 100 Z" fill="#FFE4E6"/>
  <path d="M42 70 L50 80 L58 70 Z" fill="#F43F5E"/>
  <!-- Pearl Necklace -->
  <circle cx="46" cy="74" r="1.5" fill="#FFFFFF"/>
  <circle cx="50" cy="75" r="1.5" fill="#FFFFFF"/>
  <circle cx="54" cy="74" r="1.5" fill="#FFFFFF"/>
  <!-- Face -->
  <path d="M33 38 C33 24, 67 24, 67 38 C67 56, 58 66, 50 67 C42 66, 33 56, 33 38 Z" fill="#FEF3C7"/>
  <!-- Elegant Eyes -->
  <ellipse cx="41" cy="42" rx="4" ry="5" fill="#881337"/>
  <circle cx="39.5" cy="40.5" r="1.6" fill="#FFFFFF"/>
  <ellipse cx="59" cy="42" rx="4" ry="5.5" fill="#881337"/>
  <circle cx="57.5" cy="40.5" r="1.6" fill="#FFFFFF"/>
  <!-- Smile -->
  <path d="M47 54 Q50 57 53 54" stroke="#BE123C" stroke-width="1.4" stroke-linecap="round" fill="none"/>
  <!-- Swept Hair -->
  <path d="M27 36 C27 15, 45 10, 52 10 C66 10, 76 16, 73 36 C68 25, 58 20, 50 20 C42 20, 34 26, 27 36 Z" fill="url(#hair_m)"/>
  <!-- Earring -->
  <circle cx="30" cy="44" r="2" fill="#FDE047"/>
  <circle cx="70" cy="44" r="2" fill="#FDE047"/>
</svg>
`;

// 7. Dinuka Silva - Engineering Peer Tutor
const DINUKA_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_dinuka" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A855F7"/>
      <stop offset="100%" stop-color="#7E22CE"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#bg_dinuka)"/>
  <!-- Jacket -->
  <path d="M22 100 C22 75, 34 70, 50 70 C66 70, 78 75, 78 100 Z" fill="#3B0764"/>
  <path d="M42 70 L50 82 L58 70 Z" fill="#FAF5FF"/>
  <!-- Face -->
  <path d="M33 38 C33 24, 67 24, 67 38 C67 56, 58 66, 50 67 C42 66, 33 56, 33 38 Z" fill="#FDE68A"/>
  <!-- Anime Eyes -->
  <ellipse cx="41" cy="42" rx="4" ry="5.5" fill="#581C87"/>
  <circle cx="39.5" cy="40" r="1.8" fill="#FFFFFF"/>
  <ellipse cx="59" cy="42" rx="4" ry="5.5" fill="#581C87"/>
  <circle cx="57.5" cy="40" r="1.8" fill="#FFFFFF"/>
  <!-- Smile -->
  <path d="M47 54 Q50 57 53 54" stroke="#B45309" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <!-- Hair -->
  <path d="M26 36 C24 14, 44 10, 50 10 C64 10, 76 14, 74 36 C70 24, 62 20, 56 22 C60 28, 56 34, 52 36 C48 26, 42 22, 38 20 C42 28, 36 34, 26 36 Z" fill="#18181B"/>
</svg>
`;

export const ANIME_AVATARS = {
  kavindu: svgToBase64Uri(KAVINDU_SVG),
  thisal: svgToBase64Uri(THISAL_SVG),
  sanduni: svgToBase64Uri(SANDUNI_SVG),
  dinuka: svgToBase64Uri(DINUKA_SVG),
  senuri: svgToBase64Uri(SENURI_SVG),
  chamod: svgToBase64Uri(CHAMOD_SVG),
  malani: svgToBase64Uri(MALANI_SVG),
  nihal: svgToBase64Uri(KAVINDU_SVG),
  rashmi: svgToBase64Uri(SENURI_SVG),
  tharindu: svgToBase64Uri(CHAMOD_SVG),
};

export const ANIME_AVATAR_SVGS: Record<string, string> = {
  kavindu: KAVINDU_SVG,
  thisal: THISAL_SVG,
  sanduni: SANDUNI_SVG,
  dinuka: DINUKA_SVG,
  senuri: SENURI_SVG,
  chamod: CHAMOD_SVG,
  malani: MALANI_SVG,
};

export function getAnimeAvatarSvg(name: string): string | undefined {
  const normalized = name.toLowerCase();
  const key = Object.keys(ANIME_AVATAR_SVGS).find((avatarName) => normalized.includes(avatarName));
  if (key) return ANIME_AVATAR_SVGS[key];
  if (normalized.includes('tutor')) return ANIME_AVATAR_SVGS.kavindu;
  return ANIME_AVATAR_SVGS.senuri;
}

export function getAnimeAvatar(name: string, fallbackSeed: string = 'tutorlink'): string {
  if (!name) return ANIME_AVATARS.senuri;
  const normalized = name.toLowerCase();

  if (normalized.includes('kavindu')) return ANIME_AVATARS.kavindu;
  if (normalized.includes('thisal')) return ANIME_AVATARS.thisal;
  if (normalized.includes('sanduni')) return ANIME_AVATARS.sanduni;
  if (normalized.includes('dinuka')) return ANIME_AVATARS.dinuka;
  if (normalized.includes('senuri')) return ANIME_AVATARS.senuri;
  if (normalized.includes('chamod')) return ANIME_AVATARS.chamod;
  if (normalized.includes('malani')) return ANIME_AVATARS.malani;
  if (normalized.includes('rashmi')) return ANIME_AVATARS.senuri;
  if (normalized.includes('tharindu')) return ANIME_AVATARS.chamod;

  return normalized.includes('tutor') ? ANIME_AVATARS.kavindu : ANIME_AVATARS.senuri;
}
