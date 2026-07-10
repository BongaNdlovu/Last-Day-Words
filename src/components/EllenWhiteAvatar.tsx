
export type AvatarReaction = "idle" | "correct" | "incorrect";

interface EllenWhiteAvatarProps {
  reaction?: AvatarReaction;
  size?: number;
  className?: string;
}

/**
 * Animated Ellen White writing at her desk beneath a flickering oil lamp.
 * The oil lamp is decorative ambient light (always lit). When `reaction`
 * changes she nods & smiles ("correct") or shakes her head & frowns
 * ("incorrect"). Idle breathing, blinking, head-sway, downcast reading
 * glances, the writing hand and the lamp flame all loop, and are
 * auto-disabled under prefers-reduced-motion via the rules in index.css.
 */
export default function EllenWhiteAvatar({
  reaction = "idle",
  size = 240,
  className = "",
}: EllenWhiteAvatarProps) {
  const reactionClass =
    reaction === "correct" ? "reaction-correct" : reaction === "incorrect" ? "reaction-incorrect" : "";

  return (
    <div
      className={`ellen-stage ${reactionClass} relative overflow-hidden rounded-2xl border border-white/10 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] ${className}`}
      style={{ width: size, height: size, background: "#0f0a06" }}
      role="img"
      aria-label="Ellen White writing at her desk, illuminated by an oil lamp"
    >
      {/* Reactive divine aura */}
      <div className="ew-aura pointer-events-none absolute inset-0 rounded-full" style={{ mixBlendMode: "screen" }} />

      <svg viewBox="0 0 250 250" className="relative z-[2] w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="ewLampGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde047" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ewLightDefault" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde047" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ewLightCorrect" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ewLightIncorrect" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#64748b" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ewDeskGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a2c12" />
            <stop offset="100%" stopColor="#1f1109" />
          </linearGradient>
          <linearGradient id="ewDressGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2c2520" />
            <stop offset="50%" stopColor="#161310" />
            <stop offset="100%" stopColor="#070605" />
          </linearGradient>
          {/* Skin lit from the lower-left (the desk lamp) */}
          <radialGradient id="ewSkinGrad" cx="40%" cy="60%" r="68%">
            <stop offset="0%" stopColor="#f7d6bc" />
            <stop offset="55%" stopColor="#e4b18d" />
            <stop offset="100%" stopColor="#bd8262" />
          </radialGradient>
          <radialGradient id="ewIris" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#75633f" />
            <stop offset="70%" stopColor="#463522" />
            <stop offset="100%" stopColor="#2a1e12" />
          </radialGradient>
          {/* Greying hair of her later years */}
          <linearGradient id="ewHairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8d7b67" />
            <stop offset="50%" stopColor="#5d4d3e" />
            <stop offset="100%" stopColor="#332822" />
          </linearGradient>
          <linearGradient id="ewLip" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ad6d5c" />
            <stop offset="100%" stopColor="#8a4d3e" />
          </linearGradient>
          <linearGradient id="ewQuillVane" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d8d0bc" />
            <stop offset="55%" stopColor="#efe9da" />
            <stop offset="100%" stopColor="#f8f5ec" />
          </linearGradient>
          <filter id="ewBlurBg" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="ewSoftBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
          <filter id="ewDropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.6" />
          </filter>
          <filter id="ewSoftShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Blurred Victorian bookshelf backdrop */}
        <g filter="url(#ewBlurBg)" opacity="0.7">
          <rect x="0" y="10" width="250" height="240" fill="#1f1109" />
          <rect x="0" y="80" width="250" height="12" fill="#140a04" />
          <rect x="0" y="160" width="250" height="12" fill="#140a04" />
          <rect x="20" y="20" width="18" height="60" fill="#3d1b04" />
          <rect x="40" y="25" width="14" height="55" fill="#2a3018" />
          <rect x="56" y="15" width="20" height="65" fill="#4a1515" />
          <rect x="190" y="20" width="22" height="60" fill="#1a202c" />
          <rect x="215" y="100" width="16" height="60" fill="#78350f" />
          <rect x="10" y="95" width="22" height="65" fill="#1a202c" />
          <rect x="35" y="100" width="16" height="60" fill="#78350f" />
          <rect x="200" y="170" width="20" height="65" fill="#3d1b04" />
          <rect x="180" y="175" width="14" height="60" fill="#2a3018" />
        </g>

        {/* Lamp aura + volumetric light beam */}
        <circle className="ew-lamp-glow" cx="50" cy="50" r="140" fill="url(#ewLampGlow)" />
        <polygon
          className="ew-cinematic-light"
          points="-20,-20 120,-20 270,250 -20,250"
          fill="url(#ewLightDefault)"
          style={{ mixBlendMode: "overlay" }}
        />

        {/* Desk */}
        <rect x="0" y="200" width="250" height="50" fill="url(#ewDeskGrad)" />
        <line x1="0" y1="201" x2="250" y2="201" stroke="#5c3415" strokeWidth="1.5" opacity="0.5" />

        {/* Breathing torso */}
        <g id="ew-torso">
          <path d="M 55,250 C 55,190 80,165 125,165 C 170,165 195,190 195,250 Z" fill="url(#ewDressGrad)" filter="url(#ewDropShadow)" />
          <path d="M 95,175 C 85,210 75,250 75,250 L 100,250 C 100,250 105,210 100,175 Z" fill="#000000" opacity="0.4" />
          <path d="M 155,175 C 165,210 175,250 175,250 L 150,250 C 150,250 145,210 150,175 Z" fill="#000000" opacity="0.4" />
          {/* Warm rim light on the lamp-facing shoulder */}
          <path d="M 66,250 C 66,196 86,172 116,168" fill="none" stroke="#c98b3a" strokeWidth="2.5" opacity="0.25" filter="url(#ewSoftBlur)" />

          {/* Lace collar */}
          <path d="M 88,160 C 105,145 145,145 162,160 C 150,195 100,195 88,160 Z" fill="#f4efe4" filter="url(#ewSoftShadow)" />
          <path d="M 90,165 C 105,150 145,150 160,165" fill="none" stroke="#dcd3c2" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M 95,175 C 105,165 145,165 155,175" fill="none" stroke="#c8bda8" strokeWidth="1" strokeDasharray="1 2" />

          {/* Cameo brooch */}
          <g filter="url(#ewSoftShadow)">
            <ellipse cx="125" cy="172" rx="7" ry="9" fill="#d97706" stroke="#fbbf24" strokeWidth="1.5" />
            <ellipse cx="125" cy="172" rx="4" ry="6" fill="#1e1b18" />
            <path d="M 125,166 C 127,166 128,168 128,170 C 127,172 128,174 127,176 C 125,177 123,177 123,178 L 123,167 C 124,166 125,166 125,166 Z" fill="#eedec5" />
          </g>

          {/* Head */}
          <g id="ew-head" filter="url(#ewDropShadow)">
            {/* Back hair: pinned-up volume ending in a low nape bun (no loose hair) */}
            <g id="ew-hair-back">
              <path
                d="M 91,112 C 87,84 101,64 125,63 C 149,64 163,84 159,112
                   C 156,122 152,127 148,129 C 152,112 152,96 143,86
                   C 133,78 117,78 107,86 C 98,96 98,112 102,129
                   C 98,127 94,122 91,112 Z"
                fill="url(#ewHairGrad)"
              />
              {/* Low chignon peeking out at each side of the nape */}
              <ellipse cx="99" cy="126" rx="8" ry="11" fill="url(#ewHairGrad)" stroke="#241b14" strokeWidth="0.6" />
              <ellipse cx="151" cy="126" rx="8" ry="11" fill="url(#ewHairGrad)" stroke="#241b14" strokeWidth="0.6" />
              <path d="M 95,120 C 98,116 102,116 104,120" fill="none" stroke="#9d8b76" strokeWidth="0.8" opacity="0.5" />
              <path d="M 146,120 C 148,116 152,116 155,120" fill="none" stroke="#8a7761" strokeWidth="0.8" opacity="0.45" />
            </g>

            {/* Neck */}
            <path d="M 116,145 L 134,145 L 134,162 C 134,170 116,170 116,162 Z" fill="url(#ewSkinGrad)" />
            <path d="M 116,145 L 134,145 L 134,152 C 125,159 116,152 116,145 Z" fill="#95583a" opacity="0.4" filter="url(#ewSoftBlur)" />
            <path d="M 119,153 C 120,158 121,161 122,163" fill="none" stroke="#a86e4b" strokeWidth="0.7" opacity="0.35" />
            <path d="M 131,153 C 130,158 129,161 128,163" fill="none" stroke="#a86e4b" strokeWidth="0.7" opacity="0.3" />

            {/* Face base: high cheekbones tapering to a soft jaw and chin */}
            <path
              d="M 94,102 C 94,79 106,66 125,66 C 144,66 156,79 156,102
                 C 156,117 151,131 143,141 C 137,148 131,152 125,152
                 C 119,152 113,148 107,141 C 99,131 94,117 94,102 Z"
              fill="url(#ewSkinGrad)"
            />

            {/* Form shadows (shaded side away from the lamp) */}
            <path d="M 140,74 C 155,84 157,104 152,126 C 147,142 138,150 130,151 C 143,139 148,120 146,100 C 144,86 143,79 140,74 Z" fill="#b0764f" opacity="0.30" filter="url(#ewBlurBg)" />
            {/* Warm highlight on the lit cheek */}
            <path d="M 101,80 C 96,98 99,120 109,136 C 101,122 100,100 106,84 Z" fill="#ffe8d3" opacity="0.35" filter="url(#ewBlurBg)" />
            {/* Cheekbone hollows */}
            <path d="M 102,118 C 106,124 111,128 116,130 C 110,130 104,126 102,118 Z" fill="#a3663f" opacity="0.20" filter="url(#ewBlurBg)" />
            <path d="M 148,118 C 144,124 139,128 134,130 C 140,130 146,126 148,118 Z" fill="#96593a" opacity="0.22" filter="url(#ewBlurBg)" />
            {/* Faint cheek warmth */}
            <ellipse cx="108" cy="121" rx="7" ry="4.5" fill="#dd8b70" opacity="0.15" filter="url(#ewBlurBg)" />
            <ellipse cx="142" cy="121" rx="7" ry="4.5" fill="#cf7c5e" opacity="0.12" filter="url(#ewBlurBg)" />
            {/* Chin / jaw shading */}
            <ellipse cx="125" cy="147" rx="11" ry="5" fill="#a3663f" opacity="0.22" filter="url(#ewBlurBg)" />
            <path d="M 120,143.5 Q 125,141.5 130,143.5" fill="none" stroke="#a06b4b" strokeWidth="0.7" opacity="0.3" />
            {/* Temple / hairline soft shadow */}
            <path d="M 97,96 C 97,84 103,78 111,78" fill="none" stroke="#a86e4b" strokeWidth="3" opacity="0.25" filter="url(#ewSoftBlur)" />

            {/* Age lines: forehead, nasolabial, under-eye */}
            <path d="M 110,88 Q 125,85 140,88" fill="none" stroke="#a06b4b" strokeWidth="0.7" opacity="0.22" />
            <path d="M 112,92 Q 125,89.5 138,92" fill="none" stroke="#a06b4b" strokeWidth="0.6" opacity="0.16" />
            <path d="M 113,126 Q 110,133 113.5,139" fill="none" stroke="#a06b4b" strokeWidth="0.8" opacity="0.35" />
            <path d="M 137,126 Q 140,133 136.5,139" fill="none" stroke="#a06b4b" strokeWidth="0.8" opacity="0.35" />
            <path d="M 105,111.5 Q 111,114 117,111.5" fill="none" stroke="#a06b4b" strokeWidth="0.6" opacity="0.25" />
            <path d="M 133,111.5 Q 139,114 145,111.5" fill="none" stroke="#a06b4b" strokeWidth="0.6" opacity="0.25" />
            {/* Crow's feet at the outer corners */}
            <path d="M 101.5,105 L 98.5,103.8 M 101.5,107 L 98.5,107.6" stroke="#a06b4b" strokeWidth="0.5" opacity="0.3" />
            <path d="M 148.5,105 L 151.5,103.8 M 148.5,107 L 151.5,107.6" stroke="#a06b4b" strokeWidth="0.5" opacity="0.3" />

            {/* Nose */}
            <path d="M 122.5,98 C 121,108 120.3,116 121,122" fill="none" stroke="#b47c57" strokeWidth="1.1" opacity="0.4" filter="url(#ewSoftBlur)" />
            <path d="M 127,104 C 128,110 128.4,116 128,120" fill="none" stroke="#9c5f3d" strokeWidth="1" opacity="0.3" filter="url(#ewSoftBlur)" />
            <ellipse cx="123.8" cy="121" rx="3.2" ry="2.2" fill="#ffe8d3" opacity="0.45" filter="url(#ewSoftBlur)" />
            <path d="M 117.5,124.5 Q 116,122.5 118.2,120.8" fill="none" stroke="#9c5f3d" strokeWidth="0.8" opacity="0.5" />
            <path d="M 132.5,124.5 Q 134,122.5 131.8,120.8" fill="none" stroke="#9c5f3d" strokeWidth="0.8" opacity="0.5" />
            <path d="M 118,125 Q 125,129.5 132,125" fill="none" stroke="#9c5f3d" strokeWidth="1.1" strokeLinecap="round" opacity="0.55" />
            <ellipse cx="120.7" cy="125.3" rx="1.2" ry="0.8" fill="#7a4a30" opacity="0.5" />
            <ellipse cx="129.3" cy="125.3" rx="1.2" ry="0.8" fill="#7a4a30" opacity="0.5" />
            {/* Philtrum */}
            <path d="M 125,128 L 125,132.2" fill="none" stroke="#b47c57" strokeWidth="0.6" opacity="0.3" />

            {/* Center-parted front hair framing the face */}
            <path
              d="M 90,110 C 87,82 105,64 125,66 C 145,64 163,82 160,110
                 C 155,92 144,84 125,82 C 106,84 95,92 90,110 Z"
              fill="url(#ewHairGrad)"
            />
            {/* Center part */}
            <path d="M 125,66 L 125,84" fill="none" stroke="#241b14" strokeWidth="1.3" opacity="0.45" />
            {/* Smooth sweep of the hair, drawn as strand lines */}
            <path d="M 99,94 C 108,84 118,82 125,84" fill="none" stroke="#77644f" strokeWidth="1.1" opacity="0.5" />
            <path d="M 151,94 C 142,84 132,82 125,84" fill="none" stroke="#6a573f" strokeWidth="1.1" opacity="0.5" />
            <path d="M 95,101 C 101,88 112,83 122,83.6" fill="none" stroke="#51422f" strokeWidth="0.8" opacity="0.45" />
            <path d="M 155,101 C 149,88 138,83 128,83.6" fill="none" stroke="#51422f" strokeWidth="0.8" opacity="0.4" />
            {/* Silver strands (age) */}
            <path d="M 96,102 C 98,90 106,84 116,84" fill="none" stroke="#cfc4b3" strokeWidth="0.9" opacity="0.5" />
            <path d="M 154,102 C 152,90 144,84 134,84" fill="none" stroke="#cfc4b3" strokeWidth="0.9" opacity="0.45" />
            <path d="M 100,96 C 105,88 113,84.5 120,84.5" fill="none" stroke="#d9cfbf" strokeWidth="0.6" opacity="0.4" />
            <path d="M 150,96 C 145,88 137,84.5 130,84.5" fill="none" stroke="#d9cfbf" strokeWidth="0.6" opacity="0.35" />
            {/* Wispy flyaway strands catching the lamplight */}
            <path d="M 94,90 C 92,84 94,78 98,74" fill="none" stroke="#bdb09c" strokeWidth="0.5" opacity="0.35" />
            <path d="M 156,90 C 158,84 156,78 152,74" fill="none" stroke="#a5977f" strokeWidth="0.5" opacity="0.3" />

            {/* Spectacles: thin round wire rims */}
            <g opacity="0.92">
              <ellipse cx="111" cy="106.5" rx="12" ry="10" fill="rgba(255,255,255,0.05)" stroke="#a9640f" strokeWidth="1.2" filter="url(#ewSoftShadow)" />
              <ellipse cx="139" cy="106.5" rx="12" ry="10" fill="rgba(255,255,255,0.05)" stroke="#a9640f" strokeWidth="1.2" filter="url(#ewSoftShadow)" />
              <path d="M 103,100 Q 108,98 113,100" fill="none" stroke="#ffffff" strokeWidth="1.3" opacity="0.3" />
              <path d="M 131,100 Q 136,98 141,100" fill="none" stroke="#ffffff" strokeWidth="1.3" opacity="0.3" />
              <path d="M 123.5,106.5 Q 125,104.5 126.5,106.5" fill="none" stroke="#a9640f" strokeWidth="1.2" />
              <line x1="99" y1="106.5" x2="90" y2="102" stroke="#a9640f" strokeWidth="1.2" />
              <line x1="151" y1="106.5" x2="160" y2="102" stroke="#a9640f" strokeWidth="1.2" />
            </g>

            {/* Eyes */}
            <g id="ew-eyes">
              {/* Hooded upper lids casting soft shadow over the eyes */}
              <path d="M 103.5,104.5 Q 111,99 118.5,104.5 Q 111,101.8 103.5,104.5 Z" fill="#c98d66" opacity="0.5" filter="url(#ewSoftBlur)" />
              <path d="M 131.5,104.5 Q 139,99 146.5,104.5 Q 139,101.8 131.5,104.5 Z" fill="#bd8159" opacity="0.5" filter="url(#ewSoftBlur)" />
              {/* Lid crease lines */}
              <path d="M 104,102.5 Q 111,98.6 118,102.5" fill="none" stroke="#a86e4b" strokeWidth="0.7" opacity="0.45" />
              <path d="M 132,102.5 Q 139,98.6 146,102.5" fill="none" stroke="#a86e4b" strokeWidth="0.7" opacity="0.45" />

              <g id="ew-eye-left">
                <path d="M 104,106 Q 111,101.5 118,106 Q 111,109.8 104,106 Z" fill="#f1ece1" />
                <circle cx="111" cy="106.4" r="3.1" fill="url(#ewIris)" />
                <circle cx="111" cy="106.4" r="3.1" fill="none" stroke="#241608" strokeWidth="0.6" opacity="0.7" />
                <circle cx="111" cy="106.4" r="1.4" fill="#120c06" />
                <circle cx="110" cy="105.2" r="0.8" fill="#ffffff" opacity="0.9" />
                <circle cx="112.2" cy="107.4" r="0.45" fill="#f3d9a4" opacity="0.5" />
                {/* Upper lid overlapping the top of the iris */}
                <path d="M 104,106 Q 111,101.5 118,106 L 118,103.6 Q 111,100 104,103.6 Z" fill="#e0ab84" />
                <path d="M 104,105.7 Q 111,101 118,105.7" fill="none" stroke="#3f2a1b" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M 105.5,108.2 Q 111,110 116.5,108.2" fill="none" stroke="#cf9d7d" strokeWidth="0.8" opacity="0.5" />
              </g>

              <g id="ew-eye-right">
                <path d="M 132,106 Q 139,101.5 146,106 Q 139,109.8 132,106 Z" fill="#f1ece1" />
                <circle cx="139" cy="106.4" r="3.1" fill="url(#ewIris)" />
                <circle cx="139" cy="106.4" r="3.1" fill="none" stroke="#241608" strokeWidth="0.6" opacity="0.7" />
                <circle cx="139" cy="106.4" r="1.4" fill="#120c06" />
                <circle cx="138" cy="105.2" r="0.8" fill="#ffffff" opacity="0.9" />
                <circle cx="140.2" cy="107.4" r="0.45" fill="#f3d9a4" opacity="0.5" />
                <path d="M 132,106 Q 139,101.5 146,106 L 146,103.6 Q 139,100 132,103.6 Z" fill="#d9a077" />
                <path d="M 132,105.7 Q 139,101 146,105.7" fill="none" stroke="#3f2a1b" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M 133.5,108.2 Q 139,110 144.5,108.2" fill="none" stroke="#cf9d7d" strokeWidth="0.8" opacity="0.5" />
              </g>
            </g>

            {/* Eyebrows (feathered, lightly greyed) */}
            <g id="ew-eyebrow-left">
              <path d="M 101,97.5 C 106,93.8 115,94.2 120,98.4" fill="none" stroke="#3a2c1e" strokeWidth="2" strokeLinecap="round" />
              <path d="M 102,96 C 107,92.8 114,93.2 119,97" fill="none" stroke="#5c4a36" strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
              <path d="M 104,95.6 C 108,93.4 113,93.4 117,95.4" fill="none" stroke="#9c8b76" strokeWidth="0.5" strokeLinecap="round" opacity="0.5" />
            </g>
            <g id="ew-eyebrow-right">
              <path d="M 149,97.5 C 144,93.8 135,94.2 130,98.4" fill="none" stroke="#3a2c1e" strokeWidth="2" strokeLinecap="round" />
              <path d="M 148,96 C 143,92.8 136,93.2 131,97" fill="none" stroke="#5c4a36" strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
              <path d="M 146,95.6 C 142,93.4 137,93.4 133,95.4" fill="none" stroke="#9c8b76" strokeWidth="0.5" strokeLinecap="round" opacity="0.5" />
            </g>

            {/* Mouth — neutral / smile / sad (toggled by CSS opacity) */}
            <g id="ew-neutral-mouth">
              <path d="M 114.5,135 Q 119.5,132.8 125,133.6 Q 130.5,132.8 135.5,135 Q 130.5,136.2 125,136.2 Q 119.5,136.2 114.5,135 Z" fill="url(#ewLip)" />
              <path d="M 115.5,136 Q 125,139.4 134.5,136 Q 130,138 125,138.2 Q 120,138 115.5,136 Z" fill="#ad6d5c" />
              <path d="M 114.5,135 Q 125,136.4 135.5,135" fill="none" stroke="#6f322a" strokeWidth="0.9" strokeLinecap="round" />
              <ellipse cx="125" cy="139.8" rx="5" ry="1.2" fill="#ffe8d3" opacity="0.25" filter="url(#ewSoftBlur)" />
            </g>
            <g id="ew-smile">
              {/* Gentle closed-lip smile with raised cheeks */}
              <path d="M 112,133.2 Q 118.5,131 125,131.8 Q 131.5,131 138,133.2 Q 131.5,134.8 125,134.8 Q 118.5,134.8 112,133.2 Z" fill="url(#ewLip)" />
              <path d="M 113,133.8 Q 125,139.6 137,133.8 Q 130.5,137.4 125,137.6 Q 119.5,137.4 113,133.8 Z" fill="#ad6d5c" />
              <path d="M 112,133.2 Q 125,137.6 138,133.2" fill="none" stroke="#6f322a" strokeWidth="0.9" strokeLinecap="round" />
              {/* Deepened nasolabial folds and lifted cheeks */}
              <path d="M 111.5,125 Q 107.5,132 111.5,138.5" fill="none" stroke="#a06b4b" strokeWidth="0.9" opacity="0.45" />
              <path d="M 138.5,125 Q 142.5,132 138.5,138.5" fill="none" stroke="#a06b4b" strokeWidth="0.9" opacity="0.45" />
              <ellipse cx="107" cy="118" rx="6.5" ry="4" fill="#f0b593" opacity="0.3" filter="url(#ewBlurBg)" />
              <ellipse cx="143" cy="118" rx="6.5" ry="4" fill="#e3a582" opacity="0.25" filter="url(#ewBlurBg)" />
            </g>
            <g id="ew-sad-mouth">
              <path d="M 115,140 Q 125,135.8 135,140 Q 130,138.2 125,138.4 Q 120,138.2 115,140 Z" fill="url(#ewLip)" />
              <path d="M 116,140 Q 125,138 134,140 Q 129.5,139.4 125,139.5 Q 120.5,139.4 116,140 Z" fill="#ad6d5c" />
              <path d="M 115,140 Q 125,136.2 135,140" fill="none" stroke="#6f322a" strokeWidth="0.9" strokeLinecap="round" />
              {/* Downturned corner creases */}
              <path d="M 114,140.5 L 111.5,143" fill="none" stroke="#a06b4b" strokeWidth="0.7" opacity="0.4" />
              <path d="M 136,140.5 L 138.5,143" fill="none" stroke="#a06b4b" strokeWidth="0.7" opacity="0.4" />
            </g>

            {/* Left-edge warm rim light */}
            <path d="M 95,102 C 95,81 105,68 122,66.4" fill="none" stroke="#ffdca8" strokeWidth="2.4" opacity="0.30" filter="url(#ewSoftBlur)" />
          </g>
        </g>

        {/* Open book */}
        <g filter="url(#ewSoftShadow)">
          <path d="M 68,236 C 90,226 118,226 125,236 C 132,226 160,226 182,236 L 172,250 C 150,242 130,242 125,248 C 120,242 100,242 78,250 Z" fill="#78350f" />
          <path d="M 72,235 C 92,225 118,225 125,235 C 132,225 158,225 178,235 L 168,248 C 150,240 130,240 125,246 C 120,240 100,240 82,248 Z" fill="#fefaf0" stroke="#d4d4d8" strokeWidth="1" />
          <line x1="88" y1="236" x2="112" y2="236" stroke="#64748b" strokeWidth="1" />
          <line x1="86" y1="240" x2="114" y2="240" stroke="#64748b" strokeWidth="1" />
          <line x1="84" y1="244" x2="110" y2="244" stroke="#64748b" strokeWidth="1" />
          <line x1="138" y1="236" x2="150" y2="236" stroke="#64748b" strokeWidth="1" />
          <line x1="136" y1="240" x2="146" y2="240" stroke="#64748b" strokeWidth="1" />
        </g>

        {/* Ink bottle */}
        <g filter="url(#ewSoftShadow)" transform="translate(22, 0)">
          <rect x="180" y="215" width="16" height="18" rx="3" fill="#0f172a" stroke="#475569" strokeWidth="1" />
          <rect x="181" y="222" width="14" height="10" rx="1" fill="#000000" />
          <rect x="184" y="212" width="8" height="4" fill="#94a3b8" />
          <line x1="183" y1="217" x2="183" y2="230" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
        </g>

        {/* Ambient oil lamp on the desk */}
        <g transform="translate(45, 155)">
          <path d="M -15,50 L 15,50 L 10,40 L -10,40 Z" fill="#b45309" filter="url(#ewSoftShadow)" />
          <rect x="-4" y="25" width="8" height="15" fill="#d97706" />
          <path d="M -10,5 L 10,5 L 12,25 L -12,25 Z" fill="rgba(254, 240, 138, 0.4)" stroke="#e2e8f0" strokeWidth="1" />
          <path d="M -7,-15 L 7,-15 L 10,5 L -10,5 Z" fill="#fbbf24" />
          <ellipse className="ew-lamp-flame" cx="0" cy="-20" rx="3.5" ry="9" fill="#fef08a" />
          <ellipse cx="0" cy="-18" rx="1.5" ry="5" fill="#ffffff" opacity="0.8" />
          <path d="M -7,0 L -7,22" stroke="#ffffff" strokeWidth="1" opacity="0.3" />
        </g>

        {/* Writing arm, hand and feather quill (slow line-drift + quick pen strokes) */}
        <g id="ew-arm">
          <g id="ew-hand-quill" filter="url(#ewSoftShadow)">
            {/* Feather vane */}
            <path
              d="M 152,231 C 156,221 163,209 172,199 C 176,195 180,194 182,196
                 C 183,200 180,208 174,216 C 168,224 161,230 156,234 Z"
              fill="url(#ewQuillVane)"
            />
            {/* Barb lines */}
            <path d="M 158,226 C 163,219 169,211 175,204" fill="none" stroke="#cfc7b2" strokeWidth="0.6" opacity="0.8" />
            <path d="M 156,230 C 162,224 169,216 176,208" fill="none" stroke="#c4bba4" strokeWidth="0.6" opacity="0.7" />
            <path d="M 161,222 C 165,216 170,210 175,205" fill="none" stroke="#dbd3c0" strokeWidth="0.5" opacity="0.7" />
            {/* Rachis (shaft) down to the nib */}
            <line x1="177" y1="198" x2="146" y2="240" stroke="#b7aa8f" strokeWidth="1.3" />
            <line x1="146" y1="240" x2="143.5" y2="243" stroke="#3b3b3b" strokeWidth="1.4" />
            {/* Fresh ink at the nib */}
            <circle cx="143.8" cy="242.6" r="0.7" fill="#1e293b" opacity="0.7" />

            {/* Sleeve and cuff */}
            <path d="M 195,250 C 191,237 182,229 170,228 C 162,228 156,232 152.5,239 L 162,250 Z" fill="url(#ewDressGrad)" />
            <path d="M 153,237 C 156,231.5 162,228.6 168,229.2 L 168.6,235.4 C 163,235.2 158,237.6 155.8,241.6 Z" fill="#f4efe4" />

            {/* Hand gripping the quill */}
            <path
              d="M 154,241 C 152,234 156,229.6 161,230.4 C 166,231.2 168.4,236 166.6,241
                 C 164.4,245.4 157,245.6 154,241 Z"
              fill="url(#ewSkinGrad)"
              stroke="#a66e51"
              strokeWidth="0.5"
            />
            {/* Index finger extended along the shaft */}
            <path
              d="M 157,232.5 C 152.5,233.5 148.5,236 147.2,238.8 C 147.8,240.6 149.8,241.2 151.8,240.2
                 C 153.6,238 156.2,236 158.6,235 Z"
              fill="url(#ewSkinGrad)"
              stroke="#a66e51"
              strokeWidth="0.5"
            />
            {/* Thumb wrapping over */}
            <path
              d="M 159,238.5 C 155,239.5 151.5,240.8 150.4,242.4 C 151.4,244 154.4,244 157.4,242.8 Z"
              fill="#dba680"
              stroke="#a66e51"
              strokeWidth="0.5"
            />
            {/* Knuckle creases */}
            <path d="M 160,233 C 161.5,235 161.8,238 160.8,240.5" fill="none" stroke="#a66e51" strokeWidth="0.6" opacity="0.7" />
            <path d="M 163.5,233.8 C 165,236 165.2,238.8 164.2,241" fill="none" stroke="#a66e51" strokeWidth="0.6" opacity="0.6" />
          </g>
        </g>
      </svg>
    </div>
  );
}
