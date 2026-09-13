import React from 'react';

interface FeedBagIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

export const FeedBagIcon: React.FC<FeedBagIconProps> = ({
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
      {/* Feed Sack Body */}
      <path
        d="M6 8.5C6 7.8 6.5 7.2 7.2 7H16.8C17.5 7.2 18 7.8 18 8.5L19.5 19C19.6 20.1 18.7 21 17.6 21H6.4C5.3 21 4.4 20.1 4.5 19L6 8.5Z"
        fill="currentColor"
        fillOpacity="0.15"
      />

      {/* Sack Rolled / Tied Top Collar */}
      <path
        d="M5.5 7C5.5 5.8 6.8 5 8 5H16C17.2 5 18.5 5.8 18.5 7C18.5 7.6 18 8 17.2 8H6.8C6 8 5.5 7.6 5.5 7Z"
        fill="currentColor"
        fillOpacity="0.25"
      />

      {/* Tied Top Ruffled / Ears Crest */}
      <path d="M7 5L6 3C6 3 7.5 3.5 8.5 4" />
      <path d="M17 5L18 3C18 3 16.5 3.5 15.5 4" />

      {/* Bag Stitching / Crease Lines */}
      <path d="M6.5 10H17.5" strokeDasharray="1.5 1.5" strokeWidth="1.4" />

      {/* Grain / Wheat stalk emblem on the bag */}
      <path d="M12 11V18" strokeWidth="1.6" />
      {/* Wheat grains left and right */}
      <path d="M12 13C10.8 12.2 10 13 10 13C10 13 10.8 13.8 12 14" strokeWidth="1.4" />
      <path d="M12 13C13.2 12.2 14 13 14 13C14 13 13.2 13.8 12 14" strokeWidth="1.4" />
      <path d="M12 15C10.8 14.2 10 15 10 15C10 15 10.8 15.8 12 16" strokeWidth="1.4" />
      <path d="M12 15C13.2 14.2 14 15 14 15C14 15 13.2 15.8 12 16" strokeWidth="1.4" />
      <path d="M12 11.5L12 10" strokeWidth="1.4" />
    </svg>
  );
};
