import React from "react";

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
 * ("incorrect"). Idle breathing, blinking, head-sway, eye-glances and the
 * lamp flame all loop, and are auto-disabled under prefers-reduced-motion
 * via the rules in index.css.
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
      className={`ellen-stage ${reactionClass} relative overflow-hidden rounded-2xl border border-[#e2d2ac] shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] ${className}`}
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
            <stop offset="0%" stopColor="#fbdcc2" />
            <stop offset="55%" stopColor="#eab793" />
            <stop offset="100%" stopColor="#c88a67" />
          </radialGradient>
          <radialGradient id="ewIris" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#7a5a34" />
            <stop offset="70%" stopColor="#4a3320" />
            <stop offset="100%" stopColor="#2c1d10" />
          </radialGradient>
          <linearGradient id="ewHairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a3728" />
            <stop offset="55%" stopColor="#2e2118" />
            <stop offset="100%" stopColor="#17110c" />
          </linearGradient>
          <linearGradient id="ewLip" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#b56a5c" />
            <stop offset="100%" stopColor="#8f4438" />
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
        <circle cx="50" cy="50" r="140" fill="url(#ewLampGlow)" />
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
            {/* Back hair: center-parted crown swept to a low nape bun + ponytail */}
            <g id="ew-hair-back">
              {/* Smooth volume pulled back from the temples */}
              <path
                d="M 93,108 C 90,86 102,68 125,66 C 148,68 160,86 157,108
                   C 152,96 142,88 125,87 C 108,88 98,96 93,108 Z"
                fill="url(#ewHairGrad)"
              />
              {/* Low chignon knot at the nape */}
              <ellipse cx="125" cy="93" rx="15" ry="13" fill="url(#ewHairGrad)" stroke="#140f0c" strokeWidth="0.7" />
              {/* Traditional ponytail tail hanging behind the head */}
              <path
                d="M 118,99 C 114,112 113,128 116,148
                   C 120,152 125,153 130,152
                   C 134,148 137,128 136,112
                   C 134,102 130,98 125,98
                   C 121,98 120,99 118,99 Z"
                fill="url(#ewHairGrad)"
              />
              <path
                d="M 120,104 C 118,120 119,136 122,146
                   C 125,148 128,146 130,136
                   C 131,120 130,104 128,102"
                fill="none"
                stroke="#5a4535"
                strokeWidth="1"
                opacity="0.35"
              />
            </g>

            {/* Neck */}
            <path d="M 116,144 L 134,144 L 134,161 C 134,169 116,169 116,161 Z" fill="url(#ewSkinGrad)" />
            <path d="M 116,144 L 134,144 L 134,151 C 125,158 116,151 116,144 Z" fill="#95583a" opacity="0.4" filter="url(#ewSoftBlur)" />

            {/* Face base */}
            <path d="M 92,104 C 92,80 104,66 125,66 C 146,66 158,80 158,104 C 158,132 146,151 125,151 C 104,151 92,132 92,104 Z" fill="url(#ewSkinGrad)" />

            {/* Form shadows (shaded side away from the lamp) */}
            <path d="M 140,74 C 156,84 158,104 154,126 C 149,143 139,150 130,150 C 145,139 149,120 147,100 C 145,86 143,79 140,74 Z" fill="#b0764f" opacity="0.30" filter="url(#ewBlurBg)" />
            {/* Warm highlight on the lit cheek */}
            <path d="M 101,80 C 96,98 99,120 109,136 C 101,122 100,100 106,84 Z" fill="#ffe8d3" opacity="0.35" filter="url(#ewBlurBg)" />
            {/* Cheek blush */}
            <ellipse cx="107" cy="121" rx="8" ry="5" fill="#e28f77" opacity="0.20" filter="url(#ewBlurBg)" />
            <ellipse cx="143" cy="121" rx="8" ry="5" fill="#d98063" opacity="0.16" filter="url(#ewBlurBg)" />
            {/* Chin / jaw shading */}
            <ellipse cx="125" cy="147" rx="13" ry="6" fill="#a3663f" opacity="0.22" filter="url(#ewBlurBg)" />
            {/* Temple / hairline soft shadow */}
            <path d="M 96,96 C 96,84 102,78 110,78" fill="none" stroke="#a86e4b" strokeWidth="3" opacity="0.25" filter="url(#ewSoftBlur)" />

            {/* Nasolabial hints */}
            <path d="M 114,127 Q 111,134 114,139" fill="none" stroke="#a06b4b" strokeWidth="0.8" opacity="0.35" />
            <path d="M 136,127 Q 139,134 136,139" fill="none" stroke="#a06b4b" strokeWidth="0.8" opacity="0.35" />

            {/* Nose */}
            <path d="M 123,100 C 121,110 120,118 121,124" fill="none" stroke="#b47c57" strokeWidth="1" opacity="0.45" filter="url(#ewSoftBlur)" />
            <ellipse cx="124" cy="122" rx="3.5" ry="2.4" fill="#ffe8d3" opacity="0.45" filter="url(#ewSoftBlur)" />
            <path d="M 118,125 Q 125,130 132,125" fill="none" stroke="#9c5f3d" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            <ellipse cx="120.5" cy="125.5" rx="1.3" ry="0.9" fill="#7a4a30" opacity="0.5" />
            <ellipse cx="129.5" cy="125.5" rx="1.3" ry="0.9" fill="#7a4a30" opacity="0.5" />

            {/* Center-parted front hair framing the face */}
            <path
              d="M 90,110 C 87,82 105,64 125,66 C 145,64 163,82 160,110
                 C 155,92 144,84 125,82 C 106,84 95,92 90,110 Z"
              fill="url(#ewHairGrad)"
            />
            {/* Center part */}
            <path d="M 125,66 L 125,84" fill="none" stroke="#1a120c" strokeWidth="1.3" opacity="0.45" />
            <path d="M 99,94 C 108,84 118,82 125,84" fill="none" stroke="#6b503b" strokeWidth="1.2" opacity="0.5" />
            <path d="M 151,94 C 142,84 132,82 125,84" fill="none" stroke="#6b503b" strokeWidth="1.2" opacity="0.5" />
            {/* Silver strands (age) */}
            <path d="M 96,102 C 98,90 106,84 116,84" fill="none" stroke="#c3b6a4" strokeWidth="0.9" opacity="0.4" />
            <path d="M 154,102 C 152,90 144,84 134,84" fill="none" stroke="#c3b6a4" strokeWidth="0.9" opacity="0.35" />

            {/* Spectacles */}
            <g opacity="0.92">
              <ellipse cx="111" cy="106" rx="12.5" ry="10.5" fill="rgba(255,255,255,0.05)" stroke="#a9640f" strokeWidth="1.4" filter="url(#ewSoftShadow)" />
              <ellipse cx="139" cy="106" rx="12.5" ry="10.5" fill="rgba(255,255,255,0.05)" stroke="#a9640f" strokeWidth="1.4" filter="url(#ewSoftShadow)" />
              <path d="M 103,99 Q 108,97 113,99" fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.35" />
              <path d="M 131,99 Q 136,97 141,99" fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.35" />
              <path d="M 123.5,106 Q 125,104 126.5,106" fill="none" stroke="#a9640f" strokeWidth="1.4" />
              <line x1="98.5" y1="106" x2="89" y2="101" stroke="#a9640f" strokeWidth="1.4" />
              <line x1="151.5" y1="106" x2="161" y2="101" stroke="#a9640f" strokeWidth="1.4" />
            </g>

            {/* Eyes */}
            <g id="ew-eyes">
              {/* Upper-lid cast shadow */}
              <path d="M 104,104 Q 111,99 118,104 Q 111,106 104,104 Z" fill="#a06b4b" opacity="0.25" filter="url(#ewSoftBlur)" />
              <path d="M 132,104 Q 139,99 146,104 Q 139,106 132,104 Z" fill="#a06b4b" opacity="0.25" filter="url(#ewSoftBlur)" />

              <g id="ew-eye-left">
                <path d="M 104,106 Q 111,100.5 118,106 Q 111,110.5 104,106 Z" fill="#f4efe6" />
                <circle cx="111" cy="106" r="3.4" fill="url(#ewIris)" />
                <circle cx="111" cy="106" r="3.4" fill="none" stroke="#241608" strokeWidth="0.7" opacity="0.7" />
                <circle cx="111" cy="106" r="1.5" fill="#140d07" />
                <circle cx="109.9" cy="104.8" r="0.9" fill="#ffffff" opacity="0.9" />
                <path d="M 104,105.6 Q 111,100.3 118,105.6" fill="none" stroke="#3f2a1b" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 105,102.4 Q 111,99.4 117,102.4" fill="none" stroke="#b98c6d" strokeWidth="0.7" opacity="0.45" />
                <path d="M 105.5,108 Q 111,110 116.5,108" fill="none" stroke="#cf9d7d" strokeWidth="0.8" opacity="0.5" />
              </g>

              <g id="ew-eye-right">
                <path d="M 132,106 Q 139,100.5 146,106 Q 139,110.5 132,106 Z" fill="#f4efe6" />
                <circle cx="139" cy="106" r="3.4" fill="url(#ewIris)" />
                <circle cx="139" cy="106" r="3.4" fill="none" stroke="#241608" strokeWidth="0.7" opacity="0.7" />
                <circle cx="139" cy="106" r="1.5" fill="#140d07" />
                <circle cx="137.9" cy="104.8" r="0.9" fill="#ffffff" opacity="0.9" />
                <path d="M 132,105.6 Q 139,100.3 146,105.6" fill="none" stroke="#3f2a1b" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 133,102.4 Q 139,99.4 145,102.4" fill="none" stroke="#b98c6d" strokeWidth="0.7" opacity="0.45" />
                <path d="M 133.5,108 Q 139,110 144.5,108" fill="none" stroke="#cf9d7d" strokeWidth="0.8" opacity="0.5" />
              </g>
            </g>

            {/* Eyebrows (feathered) */}
            <g id="ew-eyebrow-left">
              <path d="M 101,97 C 106,93 115,93.5 120,98" fill="none" stroke="#2a1d12" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M 102,95.5 C 107,92 114,92.5 119,96.5" fill="none" stroke="#3c2a1a" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
            </g>
            <g id="ew-eyebrow-right">
              <path d="M 149,97 C 144,93 135,93.5 130,98" fill="none" stroke="#2a1d12" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M 148,95.5 C 143,92 136,92.5 131,96.5" fill="none" stroke="#3c2a1a" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
            </g>

            {/* Mouth — neutral / smile / sad (toggled by CSS opacity) */}
            <g id="ew-neutral-mouth">
              <path d="M 114,136 Q 119,133.6 125,134.6 Q 131,133.6 136,136 Q 131,137.4 125,137.4 Q 119,137.4 114,136 Z" fill="url(#ewLip)" />
              <path d="M 115,137 Q 125,141.6 135,137 Q 130,139.8 125,140 Q 120,139.8 115,137 Z" fill="#b56a5c" />
              <path d="M 114,136 Q 125,137.4 136,136" fill="none" stroke="#6f322a" strokeWidth="1" strokeLinecap="round" />
            </g>
            <g id="ew-smile">
              <path d="M 112,134 Q 125,137 138,134 Q 131,133 125,133.4 Q 119,133 112,134 Z" fill="url(#ewLip)" />
              <path d="M 114,135.4 Q 125,138.4 136,135.4 Q 125,137 114,135.4 Z" fill="#fbf6ef" opacity="0.85" />
              <path d="M 112,134 Q 125,147 138,134 Q 125,143 112,134 Z" fill="#b56a5c" />
              <path d="M 112,134 Q 125,138 138,134" fill="none" stroke="#6f322a" strokeWidth="1" strokeLinecap="round" />
            </g>
            <g id="ew-sad-mouth">
              <path d="M 114,141 Q 125,135.5 136,141 Q 131,139 125,139.2 Q 119,139 114,141 Z" fill="url(#ewLip)" />
              <path d="M 115,141 Q 125,138.4 135,141 Q 130,140 125,140.2 Q 120,140 115,141 Z" fill="#b56a5c" />
              <path d="M 114,141 Q 125,136 136,141" fill="none" stroke="#6f322a" strokeWidth="1" strokeLinecap="round" />
            </g>

            {/* Left-edge warm rim light */}
            <path d="M 93,104 C 93,82 104,68 122,66.4" fill="none" stroke="#ffdca8" strokeWidth="2.4" opacity="0.30" filter="url(#ewSoftBlur)" />
          </g>
        </g>

        {/* Open book */}
        <g filter="url(#ewSoftShadow)">
          <path d="M 68,236 C 90,226 118,226 125,236 C 132,226 160,226 182,236 L 172,250 C 150,242 130,242 125,248 C 120,242 100,242 78,250 Z" fill="#78350f" />
          <path d="M 72,235 C 92,225 118,225 125,235 C 132,225 158,225 178,235 L 168,248 C 150,240 130,240 125,246 C 120,240 100,240 82,248 Z" fill="#fefaf0" stroke="#d4d4d8" strokeWidth="1" />
          <line x1="88" y1="236" x2="112" y2="236" stroke="#64748b" strokeWidth="1" />
          <line x1="86" y1="240" x2="114" y2="240" stroke="#64748b" strokeWidth="1" />
          <line x1="84" y1="244" x2="110" y2="244" stroke="#64748b" strokeWidth="1" />
          <line x1="138" y1="236" x2="162" y2="236" stroke="#64748b" strokeWidth="1" />
          <line x1="136" y1="240" x2="164" y2="240" stroke="#64748b" strokeWidth="1" />
        </g>

        {/* Ink bottle */}
        <g filter="url(#ewSoftShadow)" transform="translate(100, 0)">
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

        {/* Writing hand + quill */}
        <g id="ew-hand-quill" filter="url(#ewDropShadow)">
          <path d="M 75,190 C 65,130 90,110 93,105 C 98,125 95,160 77,192 Z" fill="#f1f5f9" />
          <path d="M 75,190 C 70,140 85,115 88,110 C 93,125 90,165 77,192 Z" fill="#e2e8f0" opacity="0.8" />
          <line x1="90" y1="108" x2="72" y2="225" stroke="#cbd5e1" strokeWidth="1.5" />
          <path d="M 68,225 C 65,215 70,205 75,205 C 80,205 85,215 85,225 C 85,235 75,235 68,225 Z" fill="url(#ewSkinGrad)" stroke="#a66e51" strokeWidth="0.5" />
          <path d="M 72,205 C 75,210 75,218 72,222" fill="none" stroke="#a66e51" strokeWidth="1" />
          <path d="M 76,206 C 79,210 79,218 76,222" fill="none" stroke="#a66e51" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
}
