import React from 'react';

interface TwoHorseshoesIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

export const TwoHorseshoesIcon: React.FC<TwoHorseshoesIconProps> = ({
  className = "w-5 h-5",
  size,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      {...props}
    >
      {/* First Horseshoe (Left / Front) */}
      <g transform="translate(1, 1)">
        {/* Outer & Inner U-arch with standard horseshoe calkins */}
        <path
          d="M4 17.5V14.5C4 9.5 6.8 5.5 11 5.5C15.2 5.5 18 9.5 18 14.5V17.5C18 18 17 18.5 16 18C15 17.5 15.5 15.5 15.5 14C15.5 10.5 13.5 8 11 8C8.5 8 6.5 10.5 6.5 14C6.5 15.5 7 17.5 6 18C5 18.5 4 18 4 17.5Z"
          fill="currentColor"
          fillOpacity="0.18"
        />
        {/* Nail holes on left horseshoe */}
        <circle cx="5.5" cy="11.5" r="0.65" fill="currentColor" />
        <circle cx="7" cy="8.2" r="0.65" fill="currentColor" />
        <circle cx="10" cy="6.8" r="0.65" fill="currentColor" />
        <circle cx="12" cy="6.8" r="0.65" fill="currentColor" />
        <circle cx="15" cy="8.2" r="0.65" fill="currentColor" />
        <circle cx="16.5" cy="11.5" r="0.65" fill="currentColor" />
      </g>

      {/* Second Horseshoe (Right / Offset angle) */}
      <g transform="translate(6, -1) rotate(14 12 12)">
        <path
          d="M6 16.5V13.5C6 9 8.5 5.5 12 5.5C15.5 5.5 18 9 18 13.5V16.5C18 17 17.2 17.3 16.5 16.8C15.8 16.3 16 14.5 16 13C16 10 14.2 7.8 12 7.8C9.8 7.8 8 10 8 13C8 14.5 8.2 16.3 7.5 16.8C6.8 17.3 6 17 6 16.5Z"
          fill="currentColor"
          fillOpacity="0.12"
        />
        {/* Nail holes on second horseshoe */}
        <circle cx="7.2" cy="11" r="0.55" fill="currentColor" />
        <circle cx="8.8" cy="8" r="0.55" fill="currentColor" />
        <circle cx="11.2" cy="6.8" r="0.55" fill="currentColor" />
        <circle cx="12.8" cy="6.8" r="0.55" fill="currentColor" />
        <circle cx="15.2" cy="8" r="0.55" fill="currentColor" />
        <circle cx="16.8" cy="11" r="0.55" fill="currentColor" />
      </g>
    </svg>
  );
};
