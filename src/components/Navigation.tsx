import React from 'react';
import { 
  Home, 
  Stethoscope, 
  Truck, 
  UserCheck, 
  Tag, 
  Headphones,
  Hotel
} from 'lucide-react';
import { TwoHorseshoesIcon } from './common/TwoHorseshoesIcon';
import { FeedBagIcon } from './common/FeedBagIcon';
import { CategoryId } from '../types';

interface NavigationProps {
  currentCategory: CategoryId | 'home' | 'overview';
  onSelectCategory: (id: CategoryId | 'home' | 'overview') => void;
  cartCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentCategory,
  onSelectCategory,
  cartCount = 0
}) => {
  const isHome = currentCategory === 'home' || currentCategory === 'overview';

  const navButtons = [
    {
      id: 'home' as const,
      label: 'Home',
      icon: <Home className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110" />,
      colorClass: 'text-sky-400',
      activeBg: 'bg-sky-500/20 text-sky-200 ring-1 ring-sky-400/60 shadow-xs',
      hoverClass: 'hover:text-sky-300',
      isActive: isHome,
      title: 'Home & Directory Overview'
    },
    {
      id: 'my-stable' as const,
      label: 'Stable',
      icon: <span className="text-base sm:text-lg leading-none transition-transform group-hover:scale-110 select-none">🐴</span>,
      colorClass: 'text-amber-400',
      activeBg: 'bg-amber-500/25 text-amber-200 ring-1 ring-amber-400/80 shadow-xs',
      hoverClass: 'hover:text-amber-300',
      isActive: currentCategory === 'my-stable',
      title: 'My Stable Dashboard, Horses & Health Records'
    },
    {
      id: 'vets' as const,
      label: 'Vets',
      icon: <Stethoscope className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110" />,
      colorClass: 'text-rose-400',
      activeBg: 'bg-rose-500/20 text-rose-200 ring-1 ring-rose-400/60 shadow-xs',
      hoverClass: 'hover:text-rose-300',
      isActive: currentCategory === 'vets' || currentCategory === 'emergency-vet',
      badge: '24/7',
      badgeColor: 'bg-rose-500 text-white',
      title: 'Veterinarians, Mobile Ambulatory & 24/7 Emergency'
    },
    {
      id: 'farriers' as const,
      label: 'Farriers',
      icon: <TwoHorseshoesIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110" />,
      colorClass: 'text-orange-400',
      activeBg: 'bg-orange-500/20 text-orange-200 ring-1 ring-orange-400/60 shadow-xs',
      hoverClass: 'hover:text-orange-300',
      isActive: currentCategory === 'farriers',
      title: 'Farriers, Trimming, Shoeing & Therapeutic Hoof Care'
    },
    {
      id: 'transportation' as const,
      label: 'Hauling',
      icon: <Truck className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110" />,
      colorClass: 'text-emerald-400',
      activeBg: 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/60 shadow-xs',
      hoverClass: 'hover:text-emerald-300',
      isActive: currentCategory === 'transportation',
      title: 'Equine Transportation, Hauling Radar & Live Dispatch'
    },
    {
      id: 'trainers' as const,
      label: 'Trainers',
      icon: <UserCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110" />,
      colorClass: 'text-purple-400',
      activeBg: 'bg-purple-500/20 text-purple-200 ring-1 ring-purple-400/60 shadow-xs',
      hoverClass: 'hover:text-purple-300',
      isActive: currentCategory === 'trainers',
      title: 'Trainers, Freelance Instructors & Exercise Riders'
    },
    {
      id: 'lodging' as const,
      label: 'Lodging',
      icon: <Hotel className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110" />,
      colorClass: 'text-indigo-400',
      activeBg: 'bg-indigo-500/20 text-indigo-200 ring-1 ring-indigo-400/60 shadow-xs',
      hoverClass: 'hover:text-indigo-300',
      isActive: currentCategory === 'lodging',
      title: 'Bed & Bale, Horse Motels, RV Hookups & Pastures'
    },
    {
      id: 'feed-supplies' as const,
      label: 'Feed',
      icon: <FeedBagIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110" />,
      colorClass: 'text-yellow-400',
      activeBg: 'bg-yellow-500/20 text-yellow-200 ring-1 ring-yellow-400/60 shadow-xs',
      hoverClass: 'hover:text-yellow-300',
      isActive: currentCategory === 'feed-supplies',
      badge: cartCount > 0 ? String(cartCount) : undefined,
      badgeColor: 'bg-amber-500 text-slate-950',
      title: 'Feed, Hay, Supplements & Shavings Delivery'
    },
    {
      id: 'buy-sell' as const,
      label: 'Buy / Sell',
      icon: <Tag className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110" />,
      colorClass: 'text-pink-400',
      activeBg: 'bg-pink-500/20 text-pink-200 ring-1 ring-pink-400/60 shadow-xs',
      hoverClass: 'hover:text-pink-300',
      isActive: currentCategory === 'buy-sell',
      title: 'Buy & Sell Horses, Tack, Trailers & Apparel'
    },
    {
      id: 'contact' as const,
      label: 'Contact',
      icon: <Headphones className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110" />,
      colorClass: 'text-cyan-300',
      activeBg: 'bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-400/60 shadow-xs',
      hoverClass: 'hover:text-cyan-200',
      isActive: currentCategory === 'contact',
      title: '24/7 Dispatch Hotline & Support Concierge'
    }
  ];

  return (
    <nav 
      id="category-navigation-bar"
      aria-label="Main Categories Navigation Bar"
      className="bg-[#0a2944] border-t border-white/10 border-b border-black/20 px-1 sm:px-4 py-1.5 text-white shadow-inner"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 sm:gap-1.5 w-full overflow-x-auto no-scrollbar scroll-smooth">
        {navButtons.map((btn) => {
          return (
            <button
              key={btn.id}
              id={`nav-btn-${btn.id}`}
              onClick={() => onSelectCategory(btn.id)}
              title={btn.title}
              className={`group flex-1 min-w-[56px] sm:min-w-[62px] flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 sm:px-1 rounded-xl transition-all cursor-pointer relative shrink-0 sm:shrink ${
                btn.isActive
                  ? `${btn.activeBg} font-extrabold scale-102`
                  : `text-slate-300 hover:bg-white/10 hover:text-white ${btn.hoverClass}`
              }`}
            >
              {/* Distinct Color Icon */}
              <div className={`relative flex items-center justify-center ${btn.colorClass}`}>
                {btn.icon}

                {/* Optional Mini-Badge (e.g. 24/7 or Cart Count) */}
                {btn.badge && (
                  <span className={`absolute -top-1.5 -right-2 text-[8px] font-black px-1 py-0.2 rounded-full leading-none shadow-xs border border-slate-900 ${btn.badgeColor}`}>
                    {btn.badge}
                  </span>
                )}
              </div>

              {/* Text Label (Auto-scaled and centered so all fit) */}
              <span className={`text-[9px] xs:text-[10px] sm:text-[11px] font-bold leading-tight truncate w-full text-center mt-0.5 tracking-tight ${
                btn.isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
              }`}>
                {btn.label}
              </span>

              {/* Active Indicator Pip */}
              {btn.isActive && (
                <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${btn.colorClass.replace('text-', 'bg-')}`} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

