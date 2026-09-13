import React from 'react';
import { Star } from 'lucide-react';

export interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | number;
  showScore?: boolean;
  showCount?: boolean;
  reviewCount?: number;
  scoreClass?: string;
  countClass?: string;
  className?: string;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  hoverRating?: number;
  onHover?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'sm',
  showScore = false,
  showCount = false,
  reviewCount,
  scoreClass = 'font-extrabold text-slate-800 text-xs',
  countClass = 'text-slate-400 text-xs font-medium',
  className = '',
  interactive = false,
  onRatingChange,
  hoverRating,
  onHover
}) => {
  const getSizePx = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'xs': return 11;
      case 'sm': return 13;
      case 'md': return 16;
      case 'lg': return 20;
      default: return 13;
    }
  };

  const px = getSizePx();
  const currentRating = hoverRating !== undefined && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {showScore && (
        <span className={scoreClass}>
          {Number(currentRating).toFixed(1)}
        </span>
      )}

      <div className="flex items-center gap-[1px]">
        {Array.from({ length: maxRating }, (_, idx) => {
          const starNumber = idx + 1;
          const fillRatio = Math.max(0, Math.min(1, currentRating - idx));

          if (interactive) {
            const isActive = currentRating >= starNumber;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onRatingChange?.(starNumber)}
                onMouseEnter={() => onHover?.(starNumber)}
                onMouseLeave={() => onHover?.(0)}
                className="focus:outline-none transition-transform hover:scale-110 cursor-pointer p-[1px]"
                title={`${starNumber} out of ${maxRating} stars`}
              >
                <Star
                  style={{ width: px, height: px }}
                  className={`${
                    isActive
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300 fill-slate-100 hover:text-amber-300'
                  } transition-colors`}
                />
              </button>
            );
          }

          return (
            <div key={idx} className="relative inline-block" style={{ width: px, height: px }}>
              {/* Background Empty Star */}
              <Star
                style={{ width: px, height: px }}
                className="text-slate-200 fill-slate-100 absolute inset-0"
              />
              {/* Foreground Filled Star with percentage clip */}
              {fillRatio > 0 && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillRatio * 100}%` }}
                >
                  <Star
                    style={{ width: px, height: px }}
                    className="fill-amber-400 text-amber-400 max-w-none"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showCount && reviewCount !== undefined && (
        <span className={countClass}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
};
