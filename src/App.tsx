import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { CategoryId, FeedProduct, CartItem, FeedOrder } from './types';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { NotificationProvider } from './context/NotificationContext';
import { SavedAddressProvider } from './context/SavedAddressContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { CategoriesOverview } from './components/CategoriesOverview';

// Category Views
import { MyStableView } from './components/categories/MyStableView';
import { RoutineVetView } from './components/categories/RoutineVetView';
import { FarrierView } from './components/categories/FarrierView';
import { TransportationView } from './components/categories/TransportationView';
import { TrainersView } from './components/categories/TrainersView';
import { FeedSuppliesView } from './components/categories/FeedSuppliesView';
import { LodgingView } from './components/categories/LodgingView';
import { BuySellView } from './components/categories/BuySellView';
import { ContactView } from './components/categories/ContactView';

// Modals
import { AiAssistantModal } from './components/AiAssistantModal';
import { DriveVaultModal } from './components/DriveVaultModal';
import { CartDrawer } from './components/CartDrawer';
import { FeedCheckoutModal } from './components/FeedCheckoutModal';
import { SignUpModal } from './components/SignUpModal';
import { UserProfileModal } from './components/UserProfileModal';
import { NotificationsModal } from './components/NotificationsModal';
import { NotificationToast } from './components/NotificationToast';

export function AppContent() {
  const [currentCategory, setCurrentCategory] = useState<CategoryId | 'overview'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modals
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isDriveOpen, setIsDriveOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'signup' | 'signin'>('signup');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Shopping Cart & Payment State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Navigate & Refresh page view on button clicks
  const handleNavigate = useCallback((cat: CategoryId | 'overview' | 'home') => {
    const target = cat === 'home' ? 'overview' : cat;
    
    // Scroll window to top on page navigation
    try {
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }

    // Refresh view state & remount
    setIsRefreshing(true);
    setCurrentCategory(target);
    setRefreshKey(prev => prev + 1);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 280);
  }, []);

  // Dedicated manual refresh
  const handleManualRefresh = useCallback(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 350);
  }, []);

  const handleAddToCart = (product: FeedProduct, quantity: number, isSubscription: boolean) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id && item.isSubscription === isSubscription);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      }
      return [...prev, { product, quantity, isSubscription }];
    });
  };

  const handleUpdateCartQuantity = (index: number, newQty: number) => {
    setCart(prev => {
      const updated = [...prev];
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index] = { ...updated[index], quantity: newQty };
      return updated;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuickBuy = (product: FeedProduct, quantity: number, isSubscription: boolean) => {
    setCart([{ product, quantity, isSubscription }]);
    setIsCheckoutOpen(true);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#eaf2f9] text-slate-800 font-sans flex flex-col selection:bg-teal-500 selection:text-white relative">
      {/* Top Loading / Page Refresh Bar */}
      {isRefreshing && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-amber-400 to-sky-400 z-50 animate-pulse" />
      )}

      {/* Real-Time Push Notification Toast Alert */}
      <NotificationToast 
        onNavigateCategory={handleNavigate} 
      />

      {/* Top Header & Button Bar (Sticky on all pages) */}
      <header className="sticky top-0 z-40 w-full shadow-md">
        <Header
          currentCategory={currentCategory}
          onSelectCategory={handleNavigate}
          onRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
          onOpenAI={() => setIsAiOpen(true)}
          onOpenDrive={() => setIsDriveOpen(true)}
          onOpenSignUp={() => setIsSignUpOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          cartCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Category Button Bar below Header on All Pages */}
        <Navigation
          currentCategory={currentCategory}
          onSelectCategory={handleNavigate}
          cartCount={totalCartCount}
        />
      </header>

      {/* Main Dynamic View Content */}
      <main className="flex-1 pb-10">
        <motion.div
          key={`${currentCategory}-${refreshKey}`}
          initial={{ opacity: 0.85, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full"
        >
          {currentCategory === 'overview' && (
            <CategoriesOverview
              onSelectCategory={handleNavigate}
              onOpenAI={() => setIsAiOpen(true)}
              onOpenDrive={() => setIsDriveOpen(true)}
              onOpenSignUp={() => {
                setAuthInitialMode('signup');
                setIsSignUpOpen(true);
              }}
              onOpenSignIn={() => {
                setAuthInitialMode('signin');
                setIsSignUpOpen(true);
              }}
              onOpenProfile={() => setIsProfileOpen(true)}
            />
          )}

          {currentCategory === 'my-stable' && (
            <MyStableView
              onSelectCategory={handleNavigate}
              onOpenAI={() => setIsAiOpen(true)}
              onOpenDrive={() => setIsDriveOpen(true)}
              onOpenSignUp={() => setIsSignUpOpen(true)}
              onOpenProfile={() => setIsProfileOpen(true)}
              onAddToCart={handleAddToCart}
              onOpenCart={() => setIsCartOpen(true)}
            />
          )}

          {currentCategory === 'emergency-vet' && <RoutineVetView initialTab="emergency" />}
          {currentCategory === 'vets' && <RoutineVetView initialTab="clinics" />}
          {currentCategory === 'farriers' && <FarrierView />}
          {currentCategory === 'transportation' && <TransportationView />}
          {currentCategory === 'trainers' && <TrainersView />}
          {currentCategory === 'feed-supplies' && (
            <FeedSuppliesView
              cart={cart}
              onAddToCart={handleAddToCart}
              onOpenCart={() => setIsCartOpen(true)}
              onOpenCheckout={() => setIsCheckoutOpen(true)}
              onQuickBuy={handleQuickBuy}
            />
          )}
          {currentCategory === 'lodging' && <LodgingView />}
          {currentCategory === 'buy-sell' && <BuySellView />}
          {currentCategory === 'contact' && (
            <ContactView 
              onOpenAI={() => setIsAiOpen(true)}
              onSelectCategory={handleNavigate}
            />
          )}
        </motion.div>
      </main>

      {/* Footer Branding Bar */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-4 text-center text-xs space-y-2 border-t border-slate-800">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <p className="font-bold text-slate-200">
            horsez — All-in-One Equine Services Platform
          </p>
          <span className="text-slate-600">•</span>
          <button
            onClick={() => handleNavigate('contact')}
            className="text-teal-400 hover:text-teal-300 font-extrabold underline cursor-pointer"
          >
            Contact & 24/7 Concierge
          </button>
        </div>
        <p className="text-[11px] text-slate-500">
          Emergency Vet Dispatch • Bed & Bale • Farriers • Feed & Supplies • Trainers • Transportation • Routine Vet • Buy & Sell
        </p>
      </footer>

      {/* Modals & Drawers */}
      <SignUpModal
        isOpen={isSignUpOpen}
        initialMode={authInitialMode}
        onClose={() => setIsSignUpOpen(false)}
        onNavigateHome={() => handleNavigate('home')}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onReorder={(items) => {
          setCart(items);
          setIsProfileOpen(false);
          setIsCartOpen(true);
        }}
        onNavigateToFeed={() => {
          setIsProfileOpen(false);
          handleNavigate('feed-supplies');
        }}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateCategory={(cat) => setCurrentCategory(cat)}
      />

      <AiAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
      />

      <DriveVaultModal
        isOpen={isDriveOpen}
        onClose={() => setIsDriveOpen(false)}
      />

      {/* Feed Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCart([])}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Full-Featured Feed Checkout & Payment Modal */}
      <FeedCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCart([])}
        onOrderCompleted={(order: FeedOrder) => {
          console.log('Feed order successfully placed & saved to Firebase:', order.orderNumber);
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <SavedAddressProvider>
        <FavoritesProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </FavoritesProvider>
      </SavedAddressProvider>
    </AuthProvider>
  );
}

export default App;
