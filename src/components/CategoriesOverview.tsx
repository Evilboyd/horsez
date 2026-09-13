import React from 'react';
import { 
  ChevronRight,
  Sparkles,
  FolderOpen,
  CheckCircle2,
  ShieldCheck,
  User,
  Headphones,
  Phone,
  ArrowRight,
  UserPlus,
  LogIn,
  Shield,
  ShoppingBag,
  Truck,
  Package,
  Tag,
  DollarSign
} from 'lucide-react';
import { CategoryId } from '../types';
import { MOCK_APPOINTMENTS, MOCK_HAULER_JOBS, MOCK_FEED_PRODUCTS, MOCK_MARKETPLACE_LISTINGS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { HorsezLogo } from './common/HorsezLogo';
import { FeedBagIcon } from './common/FeedBagIcon';

interface CategoriesOverviewProps {
  onSelectCategory: (id: CategoryId) => void;
  onOpenAI: () => void;
  onOpenDrive: () => void;
  onOpenSignUp: () => void;
  onOpenSignIn: () => void;
  onOpenProfile: () => void;
}

export const CategoriesOverview: React.FC<CategoriesOverviewProps> = ({
  onSelectCategory,
  onOpenAI,
  onOpenDrive,
  onOpenSignUp,
  onOpenSignIn,
  onOpenProfile
}) => {
  const { user, userProfile, userHorses, totalMembersCount } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-8 space-y-6 font-sans">
      
      {/* Brand Hero Card with exact #095DE3 background from logo */}
      <div className="bg-[#095DE3] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-400/30 relative overflow-hidden flex flex-col items-center text-center">
        {/* Subtle decorative background glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-300/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-sky-300/15 rounded-full blur-3xl pointer-events-none" />

        {/* Official Logo */}
        <HorsezLogo variant="badge" size="hero" showTagline={true} className="bg-transparent shadow-none border-none p-0" />

        {/* Sign In & Create Account Buttons directly beneath the Logo */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-5">
          {user ? (
            <button
              onClick={onOpenProfile}
              id="hero-profile-btn"
              className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Signed In as {userProfile?.fullName || user.email?.split('@')[0]} (Manage Account)</span>
            </button>
          ) : (
            <>
              <button
                onClick={onOpenSignIn}
                id="hero-signin-btn"
                className="bg-white hover:bg-slate-100 text-[#095DE3] font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer flex items-center gap-2 border border-white"
              >
                <LogIn className="w-4 h-4 text-[#095DE3]" />
                <span>Sign In</span>
              </button>

              <button
                onClick={onOpenSignUp}
                id="hero-create-account-btn"
                className="bg-[#5BC0BE] hover:bg-[#48b0ae] text-slate-950 font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-slate-950" />
                <span>Create Account</span>
              </button>
            </>
          )}
        </div>

        <p className="mt-4 text-xs sm:text-sm text-blue-100 font-medium tracking-wide">
          Or don't sign in and use a button to select services
        </p>

        <div className="mt-2 max-w-xl text-blue-100/90 text-xs sm:text-sm leading-relaxed">
          The all-in-one digital platform for equine care, veterinary dispatch, transportation, lodging, and stable management.
        </div>

        {/* Quick Action Buttons on Hero */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
          <button
            onClick={() => onSelectCategory('my-stable')}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
          >
            <span>🐴 Open My Stable</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectCategory('buy-sell')}
            className="bg-pink-500 hover:bg-pink-400 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
          >
            <Tag className="w-4 h-4 text-white" />
            <span>Buy &amp; Sell Market</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenAI}
            className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl border border-white/30 backdrop-blur-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#5BC0BE]" />
            <span>AI Stable Assistant</span>
          </button>
        </div>
      </div>

      {/* Logged In Member Badge Card */}
      {user && (
        <div className="bg-gradient-to-r from-teal-900/90 via-slate-900 to-teal-950 text-white rounded-3xl p-4 sm:p-5 shadow-lg border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-teal-400 text-slate-950 font-black text-xl flex items-center justify-center border-2 border-white shadow-md shrink-0">
              {userProfile?.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-white">Welcome back, {userProfile?.fullName || 'Member'}!</h3>
                <span className="bg-emerald-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  Database Connected
                </span>
              </div>
              <p className="text-xs text-teal-200">
                {userProfile?.equineRole || 'Horse Owner'} • {userProfile?.location || 'Santa Rosa, CA'} • {userHorses.length} Horse(s) Saved in Firestore
              </p>
            </div>
          </div>

          <button
            onClick={onOpenProfile}
            className="w-full sm:w-auto bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <User className="w-4 h-4" />
            <span>Manage Account Profile</span>
          </button>
        </div>
      )}

      {/* My Stable Status Box */}
      <div 
        onClick={() => onSelectCategory('my-stable')}
        className="bg-white hover:bg-amber-50/40 rounded-2xl p-4 sm:p-5 shadow-sm border-2 border-amber-300/80 hover:border-amber-400 flex flex-wrap items-center justify-between gap-4 transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=600" 
              alt="Thunder - Single Horse" 
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-300 group-hover:ring-amber-500 shadow-sm transition-all"
            />
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full ring-2 ring-white">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-800 group-hover:text-amber-950 transition-colors">
                My Stable: Thunder, Sarafina &amp; Blue Moon
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Coggins Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Next appointment: Dr. Sarah Evans ({MOCK_APPOINTMENTS[0].date}) • Tap to open Stable Dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onSelectCategory('my-stable')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-4 py-2 rounded-xl shadow-xs transition-all hover:scale-105 cursor-pointer"
          >
            <span>🐴 Open Stable</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenDrive}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-sky-600" />
            <span>Health Vault</span>
          </button>
        </div>
      </div>

      {/* Restored Feed & Supplies Category & Barn Delivery Showcase */}
      <div 
        onClick={() => onSelectCategory('feed-supplies')}
        className="bg-white hover:bg-amber-50/30 rounded-2xl p-4 sm:p-5 shadow-sm border-2 border-amber-300 hover:border-amber-400 transition-all cursor-pointer group space-y-3.5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <FeedBagIcon className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-800 group-hover:text-amber-950 transition-colors">
                  Feed &amp; Supplies Shop
                </h3>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Barn Delivery
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Alfalfa, Timothy, Orchard Grass, Grain, Electrolytes &amp; Shavings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onSelectCategory('feed-supplies')}
              id="overview-open-feed-shop-btn"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2 rounded-xl shadow-xs transition-all hover:scale-105 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Open Feed Shop</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Hay & Feed Preview Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {MOCK_FEED_PRODUCTS.slice(0, 4).map((product) => (
            <div 
              key={product.id}
              className="bg-slate-50 hover:bg-white rounded-xl p-2.5 border border-slate-200 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center gap-2">
                <img 
                  src={product.image} 
                  alt={product.title} 
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-extrabold text-slate-800 truncate">{product.title}</p>
                  <p className="text-[10px] text-amber-700 font-bold">${product.price.toFixed(2)} / {product.unit}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Restored Buy & Sell Marketplace Showcase */}
      <div 
        onClick={() => onSelectCategory('buy-sell')}
        className="bg-white hover:bg-pink-50/30 rounded-2xl p-4 sm:p-5 shadow-sm border-2 border-pink-300 hover:border-pink-400 transition-all cursor-pointer group space-y-3.5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-800 group-hover:text-pink-950 transition-colors">
                  Buy &amp; Sell Marketplace
                </h3>
                <span className="bg-pink-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Verified Escrow
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Horses for Sale, Living Quarter Trailers, English &amp; Western Tack, Apparel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onSelectCategory('buy-sell')}
              id="overview-open-market-btn"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-black px-4 py-2 rounded-xl shadow-xs transition-all hover:scale-105 cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Browse Marketplace</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Marketplace Preview Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {MOCK_MARKETPLACE_LISTINGS.slice(0, 4).map((item) => (
            <div 
              key={item.id}
              className="bg-slate-50 hover:bg-white rounded-xl p-2.5 border border-slate-200 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center gap-2">
                <img 
                  src={item.images[0]} 
                  alt={item.title} 
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-extrabold text-slate-800 truncate">{item.title}</p>
                  <p className="text-[10px] text-pink-600 font-bold">${item.price.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Live Haul or Appointment Summary Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-md space-y-3 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-300">
              Active Dispatch Status
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Sonoma Radius Monitoring</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-extrabold text-sm text-slate-100">{MOCK_HAULER_JOBS[0].pickup} → {MOCK_HAULER_JOBS[0].dropoff}</p>
            <p className="text-slate-400 mt-0.5">Hauler: {MOCK_HAULER_JOBS[0].haulerName} • {MOCK_HAULER_JOBS[0].rigRequirement}</p>
          </div>
          <button
            onClick={() => onSelectCategory('transportation')}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs cursor-pointer transition-all self-start sm:self-auto"
          >
            Track Live Haul
          </button>
        </div>
      </div>

      {/* 24/7 Contact & Equine Concierge Card */}
      <div className="bg-[#095DE3] text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-blue-400/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-400/20 text-[#5BC0BE] flex items-center justify-center shrink-0 border border-teal-400/30">
            <Headphones className="w-6 h-6 text-[#5BC0BE]" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-white">Need Help or Emergency Assistance?</h4>
            <p className="text-xs text-sky-100/90 mt-0.5">
              24/7 Dispatch Hotline <strong className="text-white">(408) 504-2185</strong> • General Support • Provider Onboarding &amp; Verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <a
            href="tel:4085042185"
            className="flex-1 sm:flex-initial bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            title="Call 24/7 Dispatch Hotline at 408 504-2185"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>(408) 504-2185</span>
          </a>
          <button
            onClick={() => onSelectCategory('contact')}
            className="flex-1 sm:flex-initial bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Contact Concierge</span>
          </button>
        </div>
      </div>
    </div>
  );
};
