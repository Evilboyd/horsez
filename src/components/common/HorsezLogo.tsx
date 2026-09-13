import React from 'react';

interface HorsezLogoProps {
  variant?: 'horizontal' | 'stacked' | 'icon-only' | 'badge' | 'card';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showTagline?: boolean;
  className?: string;
  withBackground?: boolean;
}

/**
 * Stable Barn Mascot Icon:
 * Distinctive equestrian stable barn featuring a classic gambrel roof,
 * rooftop cupola with louvered vents and weather vane horse finial,
 * grand arched double Dutch stable doors with timber crossbuck (X) braces,
 * arched stall safety-barred windows, upper hayloft gable with 5-point barn star,
 * and solid timber foundation.
 */
export const StableBarnIcon: React.FC<{ 
  className?: string; 
  size?: number | string;
  primaryColor?: string;
  accentColor?: string;
}> = ({ 
  className = "w-12 h-12", 
  size,
  primaryColor = "#FFFFFF",
  accentColor = "#095DE3"
}) => {
  return (
    <svg
      viewBox="0 0 320 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="horsez stable barn logo"
    >
      <g>
        {/* Weathervane Spire & Equestrian Horse Finial */}
        <rect x="157.5" y="14" width="5" height="42" rx="2.5" fill={primaryColor} />
        
        {/* Running Horse Weathervane Pointer */}
        <path
          d="
            M 144 23
            C 146 21, 149 20, 152 20
            C 154 18, 155 16, 157 15
            C 158 14, 159 16, 158 18
            C 161 18, 164 20, 167 22
            C 170 20, 173 20, 176 23
            C 174 25, 171 25, 168 25
            C 166 27, 163 28, 160 28
            L 159 30
            L 156 30
            L 157 27
            C 152 27, 148 25, 144 23
            Z
          "
          fill={primaryColor}
        />
        {/* Weathervane directional arrow bar */}
        <line x1="136" y1="28" x2="184" y2="28" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
        <polygon points="185,25.5 191,28 185,30.5" fill={primaryColor} />
        <polygon points="135,25.5 129,28 135,30.5" fill={primaryColor} />

        {/* Cupola Pyramidal Roof */}
        <path
          d="M 160 42 L 188 56 L 132 56 Z"
          fill={primaryColor}
        />
        {/* Cupola Body */}
        <rect x="138" y="56" width="44" height="18" rx="3" fill={primaryColor} />
        {/* Cupola Louver Vents */}
        <rect x="144" y="60" width="5.5" height="11" rx="2.5" fill={accentColor} />
        <rect x="157.25" y="60" width="5.5" height="11" rx="2.5" fill={accentColor} />
        <rect x="170.5" y="60" width="5.5" height="11" rx="2.5" fill={accentColor} />

        {/* Main Gambrel Stable Barn Outline & Walls */}
        <path
          d="
            M 160 74
            L 220 114
            L 274 168
            L 254 168
            L 254 262
            L 66 262
            L 66 168
            L 46 168
            L 100 114
            Z
          "
          fill={primaryColor}
        />

        {/* Gambrel Roof Eave Trim / Fascia Overhang */}
        <path
          d="
            M 160 70
            L 222 112
            L 278 168
            L 269 173
            L 217 121
            L 160 82
            L 103 121
            L 51 173
            L 42 168
            L 98 112
            Z
          "
          fill={primaryColor}
        />

        {/* Ground Baseline Beam */}
        <rect x="36" y="262" width="248" height="12" rx="6" fill={primaryColor} />

        {/* Upper Hayloft Arched Window / Door Cutout */}
        <path
          d="
            M 138 152
            L 138 124
            C 138 111, 148 103, 160 103
            C 172 103, 182 111, 182 124
            L 182 152
            Z
          "
          fill={accentColor}
        />

        {/* Hayloft Hoist Beam extending above loft arch */}
        <rect x="157.5" y="94" width="5" height="14" rx="2" fill={primaryColor} />
        <circle cx="160" cy="107" r="2.5" fill={primaryColor} />

        {/* 5-Point Barn Star inside Hayloft */}
        <path
          d="
            M 160 117
            L 163.6 125.5
            L 172.5 126.3
            L 165.7 131.9
            L 167.9 140.7
            L 160 135.5
            L 152.1 140.7
            L 154.3 131.9
            L 147.5 126.3
            L 156.4 125.5
            Z
          "
          fill={primaryColor}
        />

        {/* Left Stall Window (Arched with vertical stall bars) */}
        <path
          d="
            M 78 226
            L 78 196
            C 78 188, 84 182, 93 182
            C 102 182, 108 188, 108 196
            L 108 226
            Z
          "
          fill={accentColor}
        />
        {/* Stall Bars */}
        <rect x="85" y="192" width="3.5" height="32" rx="1.75" fill={primaryColor} />
        <rect x="97.5" y="192" width="3.5" height="32" rx="1.75" fill={primaryColor} />
        {/* Window Sill */}
        <rect x="75" y="226" width="36" height="4" rx="2" fill={primaryColor} />

        {/* Right Stall Window (Arched with vertical stall bars) */}
        <path
          d="
            M 212 226
            L 212 196
            C 212 188, 218 182, 227 182
            C 236 182, 242 188, 242 196
            L 242 226
            Z
          "
          fill={accentColor}
        />
        {/* Stall Bars */}
        <rect x="219" y="192" width="3.5" height="32" rx="1.75" fill={primaryColor} />
        <rect x="231.5" y="192" width="3.5" height="32" rx="1.75" fill={primaryColor} />
        {/* Window Sill */}
        <rect x="209" y="226" width="36" height="4" rx="2" fill={primaryColor} />

        {/* Center Breezeway / Double Dutch Stable Doors */}
        {/* Grand Arched Doorway Cutout */}
        <path
          d="
            M 115 262
            L 115 200
            C 115 176, 134 162, 160 162
            C 186 162, 205 176, 205 200
            L 205 262
            Z
          "
          fill={accentColor}
        />

        {/* Left Stable Door Leaf with "X" Crossbucks */}
        <g>
          <rect x="119" y="196" width="38" height="66" rx="3" fill={primaryColor} />
          
          {/* Upper Inset Panel with X */}
          <rect x="122" y="199" width="32" height="29" rx="2" fill={accentColor} />
          <path
            d="
              M 123.5 200.5 L 152.5 226.5
              M 152.5 200.5 L 123.5 226.5
            "
            stroke={primaryColor}
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Lower Inset Panel with X */}
          <rect x="122" y="231" width="32" height="29" rx="2" fill={accentColor} />
          <path
            d="
              M 123.5 232.5 L 152.5 258.5
              M 152.5 232.5 L 123.5 258.5
            "
            stroke={primaryColor}
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Door Handle */}
          <circle cx="152.5" cy="230" r="2.2" fill={primaryColor} />
        </g>

        {/* Right Stable Door Leaf with "X" Crossbucks */}
        <g>
          <rect x="163" y="196" width="38" height="66" rx="3" fill={primaryColor} />

          {/* Upper Inset Panel with X */}
          <rect x="166" y="199" width="32" height="29" rx="2" fill={accentColor} />
          <path
            d="
              M 167.5 200.5 L 196.5 226.5
              M 196.5 200.5 L 167.5 226.5
            "
            stroke={primaryColor}
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Lower Inset Panel with X */}
          <rect x="166" y="231" width="32" height="29" rx="2" fill={accentColor} />
          <path
            d="
              M 167.5 232.5 L 196.5 258.5
              M 196.5 232.5 L 167.5 258.5
            "
            stroke={primaryColor}
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Door Handle */}
          <circle cx="167.5" cy="230" r="2.2" fill={primaryColor} />
        </g>
      </g>
    </svg>
  );
};

// Aliases for backwards-compatibility
export const HorsezIcon = StableBarnIcon;
export const BarnLogoIcon = StableBarnIcon;

/**
 * Full Horsez Stable Barn Logo Card/Badge
 * Background: Exact vivid royal blue (#095DE3)
 */
export const HorsezLogo: React.FC<HorsezLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  showTagline = true,
  className = '',
  withBackground = false
}) => {
  if (variant === 'icon-only') {
    const sizeMap = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-14 h-14',
      xl: 'w-18 h-18',
      hero: 'w-28 h-28 sm:w-36 sm:h-36'
    }[size];

    return (
      <div className={`relative inline-flex items-center justify-center ${withBackground ? 'bg-[#095DE3] p-2.5 rounded-2xl' : ''} ${className}`}>
        <StableBarnIcon className={sizeMap} primaryColor="#FFFFFF" accentColor="#095DE3" />
      </div>
    );
  }

  // Exact Representation with Stable Barn Emblem
  if (variant === 'card' || variant === 'badge' || variant === 'stacked' || size === 'hero') {
    return (
      <div className={`flex flex-col items-center text-center select-none bg-[#095DE3] text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-blue-400/30 ${className}`}>
        {/* Stable Barn Logo Icon */}
        <div className="relative mb-3 flex items-center justify-center">
          <StableBarnIcon 
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 drop-shadow-md transition-transform hover:scale-105 duration-200" 
            primaryColor="#FFFFFF" 
            accentColor="#095DE3" 
          />
        </div>

        {/* Brand Name 'horsez' in bold clean white lowercase */}
        <div className="font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight leading-none text-white font-sans lowercase">
          horsez
        </div>

        {/* Tagline 'Your digital stable' */}
        {showTagline && (
          <div className="text-sm sm:text-base md:text-lg text-blue-100 font-medium tracking-wide mt-2 flex items-center gap-1.5">
            <span>Your digital stable</span>
          </div>
        )}
      </div>
    );
  }

  // Default 'horizontal' navbar/header layout
  const iconSizeClass = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    hero: 'w-20 h-20'
  }[size];

  const titleSizeClass = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    hero: 'text-4xl'
  }[size];

  const taglineSizeClass = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
    hero: 'text-base'
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${withBackground ? 'bg-[#095DE3] px-3 py-1.5 rounded-2xl' : ''} ${className}`}>
      {/* Stable Barn Logo Icon */}
      <div className="relative shrink-0 flex items-center justify-center">
        <StableBarnIcon className={iconSizeClass} primaryColor="#FFFFFF" accentColor="#095DE3" />
      </div>

      {/* Brand Text + Tagline */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-1 leading-none">
          <span className={`font-extrabold ${titleSizeClass} tracking-tight leading-none text-white font-sans lowercase`}>
            horsez
          </span>
          <span className="text-[10px] text-sky-200 font-bold tracking-wider uppercase opacity-90">
            .ai
          </span>
        </div>
        {showTagline && (
          <p className={`${taglineSizeClass} text-blue-100 leading-tight tracking-wide font-medium mt-0.5`}>
            Your digital stable
          </p>
        )}
      </div>
    </div>
  );
};
