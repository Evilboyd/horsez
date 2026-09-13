import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Sparkles, 
  MapPin, 
  Bell, 
  ShieldCheck,
  FolderOpen,
  User,
  UserPlus,
  Heart,
  Clock,
  History,
  Trash2,
  TrendingUp,
  X,
  Home,
  RotateCw,
  Mic,
  MicOff,
  Volume2,
  Database
} from 'lucide-react';
import { CategoryId } from '../types';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useNotifications } from '../context/NotificationContext';
import { HorsezLogo } from './common/HorsezLogo';

interface HeaderProps {
  currentCategory: CategoryId | 'home' | 'overview';
  onSelectCategory: (id: CategoryId | 'home' | 'overview') => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAI: () => void;
  onOpenDrive: () => void;
  onOpenSignUp: () => void;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const RECENT_SEARCHES_KEY = 'horsez_recent_searches';
const DEFAULT_RECENT = [
  'Emergency Colic Vet',
  'Timothy Hay',
  'Hunter Jumper Trainer',
  'Interstate Hauling',
  'Hoof Trimmer Farrier'
];

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  onRefresh,
  isRefreshing = false,
  cartCount,
  onOpenCart,
  onOpenAI,
  onOpenDrive,
  onOpenSignUp,
  onOpenProfile,
  onOpenNotifications,
  searchQuery,
  onSearchChange
}) => {
  const { user, userProfile } = useAuth();
  const { favoritesCount } = useFavorites();
  const { unreadCount } = useNotifications();
  const [selectedLocation, setSelectedLocation] = useState('Santa Rosa, CA');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Voice Search States
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_RECENT;
    } catch {
      return DEFAULT_RECENT;
    }
  });

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const saveSearchQuery = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 6);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save recent searches', e);
      }
      return updated;
    });
  };

  const handleSelectSearch = (term: string) => {
    onSearchChange(term);
    saveSearchQuery(term);
    setShowSearchDropdown(false);
  };

  const removeRecentSearch = (e: React.MouseEvent, termToRemove: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((term) => term !== termToRemove);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save recent searches', e);
      }
      return updated;
    });
  };

  const clearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (e) {
      console.warn('Failed to clear recent searches', e);
    }
  };

  // Toggle Voice Search & Speech Recognition
  const toggleVoiceSearch = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setVoiceError(null);

    // If already listening, stop
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      setVoiceFeedback('Voice search stopped');
      feedbackTimeoutRef.current = setTimeout(() => setVoiceFeedback(null), 2500);
      return;
    }

    // Check SpeechRecognition support in browser
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    // First, request microphone access via MediaDevices API
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release the mic track so SpeechRecognition can take over
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (err: any) {
      console.warn('Microphone permission request:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setVoiceError('Microphone access was denied. Please allow microphone permissions in your browser.');
        feedbackTimeoutRef.current = setTimeout(() => setVoiceError(null), 5000);
        return;
      }
    }

    if (!SpeechRecognition) {
      // Fallback if browser does not support Web Speech API
      setVoiceError('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      feedbackTimeoutRef.current = setTimeout(() => setVoiceError(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceFeedback('Listening... Speak your search query now');
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const rawTranscript = (finalTranscript || interimTranscript).trim();
        if (rawTranscript) {
          // Clean standard conversational prefixes like "search for", "find me", "look up"
          let cleaned = rawTranscript;
          const prefixRegex = /^(search for|find me|look up|search|find|show me)\s+/i;
          cleaned = cleaned.replace(prefixRegex, '');

          // Check voice commands
          if (cleaned.toLowerCase() === 'clear' || cleaned.toLowerCase() === 'clear search') {
            onSearchChange('');
            setVoiceFeedback('Search cleared');
          } else {
            onSearchChange(cleaned);
            setVoiceFeedback(`Heard: "${cleaned}"`);
          }

          if (finalTranscript) {
            saveSearchQuery(cleaned);
            setShowSearchDropdown(false);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission blocked. Please enable microphone access.');
        } else if (event.error === 'no-speech') {
          setVoiceFeedback('No speech heard. Try clicking the mic and speaking again.');
        } else {
          setVoiceError(`Voice recognition: ${event.error}`);
        }
        feedbackTimeoutRef.current = setTimeout(() => {
          setVoiceFeedback(null);
          setVoiceError(null);
        }, 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
        feedbackTimeoutRef.current = setTimeout(() => {
          setVoiceFeedback(null);
        }, 3000);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setVoiceError('Could not start voice recognition. Please try again.');
      feedbackTimeoutRef.current = setTimeout(() => setVoiceError(null), 4000);
    }
  };

  const locations = [
    'Santa Rosa, CA',
    'Sonoma, CA',
    'Petaluma, CA',
    'Marin County, CA',
    'Sacramento, CA'
  ];

  return (
    <div className="bg-[#095DE3] text-white">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Logo & Brand */}
        <button 
          onClick={() => onSelectCategory('home')}
          className="flex items-center gap-2 group text-left focus:outline-none cursor-pointer hover:opacity-95 transition-opacity"
          title="horsez - Your digital stable"
        >
          <HorsezLogo variant="horizontal" size="md" showTagline={true} />
        </button>

        {/* Location Dropdown Picker */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-sky-100 text-xs px-2.5 py-1.5 rounded-lg border border-white/20 transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-teal-300" />
            <span className="font-medium">{selectedLocation}</span>
          </button>

          {showLocationDropdown && (
            <div className="absolute top-full mt-1 left-0 w-44 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Location
              </div>
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setSelectedLocation(loc);
                    setShowLocationDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-teal-50 transition-colors flex items-center justify-between cursor-pointer ${
                    selectedLocation === loc ? 'font-bold text-teal-700 bg-teal-50/50' : 'text-slate-700'
                  }`}
                >
                  {loc}
                  {selectedLocation === loc && <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Global Search Bar with Microphone Voice Commands */}
        <div className="flex-1 max-w-md mx-2 relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setShowSearchDropdown(true)}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveSearchQuery(searchQuery);
                  setShowSearchDropdown(false);
                }
              }}
              placeholder={isListening ? "Listening... Speak your search query" : "Search vets, farriers, feed, hauling, trainers..."}
              className={`w-full bg-white text-slate-900 placeholder-slate-400 text-xs rounded-full py-1.5 pl-9 pr-16 focus:outline-none transition-all shadow-inner ${
                isListening 
                  ? 'ring-2 ring-rose-400 bg-rose-50/20 placeholder-rose-500 font-medium' 
                  : 'focus:ring-2 focus:ring-teal-400'
              }`}
            />
            <Search className={`w-4 h-4 absolute left-3 top-2 pointer-events-none transition-colors ${isListening ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
            
            {/* Search Input Controls (Clear + Microphone Voice Search) */}
            <div className="absolute right-2.5 top-1.5 flex items-center gap-1">
              {searchQuery && (
                <button 
                  onClick={() => {
                    onSearchChange('');
                    setShowSearchDropdown(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-0.5 text-xs font-bold cursor-pointer rounded-full hover:bg-slate-100 transition-colors"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Microphone Voice Command Trigger */}
              <button
                type="button"
                onClick={toggleVoiceSearch}
                className={`p-1 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-md ring-2 ring-rose-300 scale-110'
                    : 'text-slate-400 hover:text-teal-600 hover:bg-slate-100'
                }`}
                title={isListening ? "Listening... Click to stop voice search" : "Click to search with your microphone voice command"}
              >
                <Mic className={`w-3.5 h-3.5 ${isListening ? 'animate-bounce' : ''}`} />
              </button>
            </div>
          </div>

          {/* Voice Search Feedback Banner */}
          {(isListening || voiceFeedback || voiceError) && (
            <div 
              className={`absolute top-full mt-1 left-0 right-0 py-1.5 px-3 rounded-xl text-[11px] font-bold shadow-lg z-50 flex items-center justify-between transition-all ${
                voiceError 
                  ? 'bg-rose-600 text-white' 
                  : isListening 
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white animate-pulse' 
                    : 'bg-slate-900 text-teal-300 border border-teal-500/30'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                {voiceError ? (
                  <MicOff className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 shrink-0 animate-bounce" />
                )}
                <span className="truncate">{voiceError || voiceFeedback}</span>
              </div>
              {isListening && (
                <button
                  type="button"
                  onClick={toggleVoiceSearch}
                  className="bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded-full text-[10px] uppercase font-black tracking-wider shrink-0 cursor-pointer ml-2"
                >
                  Stop
                </button>
              )}
            </div>
          )}

          {/* Recent Searches Dropdown */}
          {showSearchDropdown && !isListening && (
            <>
              {/* Backdrop listener to close when clicking outside */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowSearchDropdown(false)} 
              />

              <div className="absolute top-full mt-1.5 left-0 right-0 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 p-3 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header with Clear Button */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>Recent Searches</span>
                  </div>
                  {recentSearches.length > 0 && (
                    <button
                      onClick={clearAllRecent}
                      className="text-[10px] text-slate-400 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Clear all recent searches"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear All</span>
                    </button>
                  )}
                </div>

                {/* Recent Searches List */}
                {recentSearches.length > 0 ? (
                  <div className="space-y-1">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        onClick={() => handleSelectSearch(term)}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-teal-50/80 transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <History className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-colors shrink-0" />
                          <span className="font-semibold text-slate-700 group-hover:text-teal-900 truncate">
                            {term}
                          </span>
                        </div>
                        <button
                          onClick={(e) => removeRecentSearch(e, term)}
                          className="p-1 rounded-full hover:bg-slate-200/80 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          title="Remove from recent searches"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 py-1.5 text-center font-medium">
                    No recent searches yet
                  </p>
                )}

                {/* Popular Trending Topics */}
                <div className="mt-2.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400 font-extrabold uppercase tracking-wider text-[10px] mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                    <span>Popular Topics</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Emergency Vet',
                      'Timothy Hay',
                      'Jumping Trainer',
                      'Hoof Farrier',
                      'Bed & Bale'
                    ].map((topic) => (
                      <button
                        key={topic}
                        onClick={() => handleSelectSearch(topic)}
                        className="bg-slate-100 hover:bg-teal-100 text-slate-700 hover:text-teal-900 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>{topic}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Action Icons Button Bar */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Refresh Page & Data Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className={`p-1.5 sm:px-2 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sky-200 hover:text-white border border-white/15 transition-all flex items-center gap-1 text-xs font-bold cursor-pointer active:scale-95 ${
                isRefreshing ? 'bg-sky-500/30 text-sky-200 ring-2 ring-sky-400/50' : ''
              }`}
              title="Refresh Page & Live Equestrian Feed"
            >
              <RotateCw className={`w-3.5 h-3.5 text-sky-300 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline text-[11px]">Refresh</span>
            </button>
          )}

          {/* MY STABLE BUTTON */}
          <button
            onClick={() => onSelectCategory('my-stable')}
            className={`flex items-center gap-1 text-xs px-2.5 sm:px-3 py-1.5 rounded-full font-black transition-all cursor-pointer shadow-sm shrink-0 ${
              currentCategory === 'my-stable'
                ? 'bg-amber-400 text-slate-950 ring-2 ring-white scale-105'
                : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
            }`}
            title="Open My Stable Dashboard, Horses & Care Schedule"
          >
            <span className="text-sm">🐴</span>
            <span className="font-extrabold hidden xs:inline sm:inline">My Stable</span>
          </button>

          {/* Sign Up / User Profile Button */}
          {user ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 bg-teal-500/30 hover:bg-teal-500/40 text-white text-xs px-2 sm:px-2.5 py-1.5 rounded-full border border-teal-400/40 font-bold transition-all cursor-pointer shrink-0"
              title="View Account Profile & Firestore Data"
            >
              <div className="w-4 h-4 rounded-full bg-teal-300 text-slate-950 font-black text-[10px] flex items-center justify-center">
                {userProfile?.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="hidden md:inline max-w-[80px] truncate">{userProfile?.fullName || 'Account'}</span>
            </button>
          ) : (
            <button
              onClick={onOpenSignUp}
              className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-2.5 sm:px-3 py-1.5 rounded-full shadow-md transition-all hover:scale-105 cursor-pointer shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden xs:inline">Sign Up</span>
            </button>
          )}

          {/* AI Assistant Button */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white text-xs px-2 sm:px-2.5 py-1.5 rounded-full font-semibold shadow-sm transition-all hover:scale-105 cursor-pointer shrink-0"
            title="horsez AI Equine Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
            <span className="hidden sm:inline">horsez AI</span>
          </button>

          {/* Saved Favorites Button (Rose Icon) */}
          <button
            onClick={onOpenProfile}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors relative flex items-center gap-1 cursor-pointer shrink-0"
            title="Saved Favorites (Vets, Trainers, Listings)"
          >
            <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'text-rose-400 fill-rose-400' : 'text-rose-300'}`} />
            {favoritesCount > 0 && (
              <span className="bg-rose-500 text-white font-extrabold text-[10px] px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Google Drive Vault Sync (Emerald Icon) */}
          <button
            onClick={onOpenDrive}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors relative cursor-pointer shrink-0"
            title="Google Drive Document Vault"
          >
            <FolderOpen className="w-4 h-4 text-emerald-300" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full"></span>
          </button>

          {/* Notifications (Amber/Gold Icon) */}
          <button 
            onClick={onOpenNotifications}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors relative flex items-center justify-center cursor-pointer shrink-0"
            title="Push Notification Center (Saved Vets & Trainers)"
          >
            <Bell className="w-4 h-4 text-amber-300" />
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-slate-900">
                {unreadCount}
              </span>
            ) : (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
            )}
          </button>

          {/* Shopping Cart (Cyan/Purple Icon) */}
          <button
            onClick={onOpenCart}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors relative flex items-center gap-1 cursor-pointer shrink-0"
            title="View Cart & Orders"
          >
            <ShoppingBag className="w-4 h-4 text-cyan-300" />
            {cartCount > 0 && (
              <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
