import React, { useState, useMemo, useEffect } from 'react';
import { 
  Truck, 
  Calendar, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Sparkles, 
  Package, 
  ArrowRight, 
  ShoppingBag, 
  Search, 
  X, 
  ShieldCheck, 
  Star,
  Flame,
  AlertCircle,
  Tag,
  Receipt,
  RotateCcw,
  Zap,
  Lock,
  Database,
  Trash2,
  Heart,
  Check,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FeedBagIcon } from '../common/FeedBagIcon';
import { MOCK_FEED_PRODUCTS } from '../../data/mockData';
import { FeedProduct, CartItem } from '../../types';
import { 
  EQUINE_COLLECTIONS, 
  publishToFirestore, 
  subscribeToFirestoreCollection,
  saveFeedBulkQuoteToFirestore,
  saveFeedProductToFirestore,
  deleteFromFirestore
} from '../../lib/equineDataService';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { FeedOrdersModal } from '../FeedOrdersModal';

interface FeedSuppliesViewProps {
  cart?: CartItem[];
  onAddToCart: (product: FeedProduct, quantity: number, isSubscription: boolean) => void;
  onOpenCart: () => void;
  onOpenCheckout?: () => void;
  onQuickBuy?: (product: FeedProduct, quantity: number, isSubscription: boolean) => void;
}

export const FeedSuppliesView: React.FC<FeedSuppliesViewProps> = ({
  cart = [],
  onAddToCart,
  onOpenCart,
  onOpenCheckout,
  onQuickBuy
}) => {
  const { userProfile } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Real-time Firestore Feed Supplies State
  const [firestoreProducts, setFirestoreProducts] = useState<FeedProduct[]>([]);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState<boolean>(true);

  // Modals state
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncingCatalog, setIsSyncingCatalog] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Bulk Haul Quote Form State
  const [bulkBarnName, setBulkBarnName] = useState(userProfile?.barnName || 'Equine Ranch');
  const [bulkTons, setBulkTons] = useState('15');
  const [bulkVariety, setBulkVariety] = useState('Premium Alfalfa 3-String');
  const [bulkLocation, setBulkLocation] = useState(userProfile?.city || 'Petaluma, CA');
  const [bulkNotes, setBulkNotes] = useState('Requires squeeze forklift driver for indoor hayloft.');
  const [bulkSubmitted, setBulkSubmitted] = useState(false);

  // Publish Feed Product Modal State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'hay' | 'grain' | 'supplements' | 'tack'>('hay');
  const [newPrice, setNewPrice] = useState('24.50');
  const [newUnit, setNewUnit] = useState('bale');
  const [newWeight, setNewWeight] = useState('110 lbs 3-String Bale');
  const [newVendor, setNewVendor] = useState(userProfile?.fullName || 'Sonoma Valley Hay Co.');
  const [newDescription, setNewDescription] = useState('Certified weed-free premium hay, lab-tested RFV 175+, green fine-stem leafy flakes.');
  const [newPhoto, setNewPhoto] = useState('https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatusMsg, setPublishStatusMsg] = useState('');
  const [publishError, setPublishError] = useState('');

  const [quantities, setQuantities] = useState<Record<string, number>>({
    'fp-hay-1': 20,
    'fp-hay-2': 10,
    'fp-hay-4': 10,
    'fp-21': 5,
    'fp-24': 1
  });
  
  const [subscriptions, setSubscriptions] = useState<Record<string, boolean>>({
    'fp-hay-1': true,
    'fp-21': true
  });

  // Calculate cart metrics
  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const totalCartPrice = useMemo(() => {
    return cart.reduce((sum, item) => {
      const p = item.isSubscription ? item.product.price * 0.9 : item.product.price;
      return sum + p * item.quantity;
    }, 0);
  }, [cart]);

  // 1. Universal Real-Time Subscription to Firestore `feedSupplies`
  useEffect(() => {
    setIsFirebaseLoading(true);
    const unsubscribe = subscribeToFirestoreCollection<FeedProduct>(
      EQUINE_COLLECTIONS.FEED_SUPPLIES,
      (loaded) => {
        setFirestoreProducts(loaded);
        setIsFirebaseLoading(false);
      },
      (err) => {
        console.warn('Firestore feedSupplies subscription warning:', err);
        setIsFirebaseLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Combine Firestore products + Mock products (Firestore first)
  const allProducts: FeedProduct[] = useMemo(() => {
    const combined = [...firestoreProducts, ...MOCK_FEED_PRODUCTS];
    const seen = new Set<string>();
    return combined.filter(p => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [firestoreProducts]);

  const categoryCounts = useMemo(() => {
    return {
      all: allProducts.length,
      hay: allProducts.filter(p => p.category === 'hay').length,
      grain: allProducts.filter(p => p.category === 'grain').length,
      supplements: allProducts.filter(p => p.category === 'supplements').length,
      tack: allProducts.filter(p => p.category === 'tack').length,
    };
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchWeight = p.weight ? p.weight.toLowerCase().includes(q) : false;
        return matchTitle || matchDesc || matchWeight;
      }
      return true;
    });
  }, [allProducts, selectedCategory, searchQuery]);

  const updateQuantity = (id: string, delta: number) => {
    const current = quantities[id] || 1;
    const updated = Math.max(1, current + delta);
    setQuantities({ ...quantities, [id]: updated });
  };

  const toggleSubscription = (id: string) => {
    setSubscriptions({ ...subscriptions, [id]: !subscriptions[id] });
  };

  const handleAddToCartWithToast = (product: FeedProduct, qty: number, isSub: boolean) => {
    onAddToCart(product, qty, isSub);
    const unitPrice = isSub ? product.price * 0.9 : product.price;
    const totalItemPrice = (unitPrice * qty).toFixed(2);
    setToastMessage(`Added ${qty}× ${product.title} ($${totalItemPrice}) to Cart!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleQuickBuyClick = (product: FeedProduct, qty: number, isSub: boolean) => {
    if (onQuickBuy) {
      onQuickBuy(product, qty, isSub);
    } else {
      onAddToCart(product, qty, isSub);
      if (onOpenCheckout) {
        onOpenCheckout();
      } else {
        onOpenCart();
      }
    }
  };

  const handlePublishProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice.trim()) {
      setPublishError('Please enter a product title and price.');
      return;
    }

    setIsPublishing(true);
    setPublishError('');
    setPublishStatusMsg('Publishing feed & supply listing to Firebase database...');

    try {
      const payload: Partial<FeedProduct> = {
        title: newTitle.trim(),
        category: newCategory,
        price: Number(newPrice) || 24.50,
        unit: newUnit.trim() || 'bale',
        weight: newWeight.trim() || undefined,
        description: newDescription.trim(),
        image: newPhoto || 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800',
        vendor: newVendor.trim() || 'Equine Supply Co.',
        rating: 5.0,
        inStock: true,
        subscribeDiscountPercent: 5,
        bulkDiscount: '10% off 50+ units',
        isFirebase: true,
        publishedAsListing: true
      };

      await publishToFirestore(
        EQUINE_COLLECTIONS.FEED_SUPPLIES,
        payload
      );

      setPublishStatusMsg('Feed product published successfully!');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

      setTimeout(() => {
        setShowPublishModal(false);
        setNewTitle('');
        setPublishStatusMsg('');
      }, 800);

    } catch (err: any) {
      console.error('Failed to publish feed product:', err);
      setPublishError(err?.message || 'Database error occurred. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleBulkHaulSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkSubmitted(true);
    try {
      await saveFeedBulkQuoteToFirestore({
        barnName: bulkBarnName.trim() || 'Equine Facility',
        tons: Number(bulkTons) || 15,
        variety: bulkVariety,
        location: bulkLocation.trim() || 'Northern California',
        notes: bulkNotes.trim(),
        userId: userProfile?.uid || undefined,
        contactName: userProfile?.fullName || undefined,
        contactEmail: userProfile?.email || undefined,
        contactPhone: userProfile?.phone || undefined
      });
      confetti({ particleCount: 70, spread: 60 });
      setToastMessage('Bulk haul request saved to Firebase database!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.warn('Firebase bulk quote note:', err);
    }
    setTimeout(() => {
      setShowBulkModal(false);
      setBulkSubmitted(false);
    }, 1800);
  };

  const handleSyncCatalogToFirestore = async () => {
    setIsSyncingCatalog(true);
    setSyncMessage('Syncing feed catalog to Firebase Firestore database...');
    try {
      let added = 0;
      for (const prod of MOCK_FEED_PRODUCTS) {
        const exists = firestoreProducts.some(p => p.id === prod.id || p.title.toLowerCase() === prod.title.toLowerCase());
        if (!exists) {
          await saveFeedProductToFirestore({
            ...prod,
            isFirebase: true,
            publishedAsListing: true,
            createdAt: new Date().toISOString()
          });
          added++;
        }
      }
      confetti({ particleCount: 75, spread: 60 });
      setSyncMessage(added > 0 ? `Saved ${added} feed products to Firestore!` : 'Feed database is up-to-date!');
      setTimeout(() => setSyncMessage(null), 3500);
    } catch (err: any) {
      console.error('Error syncing feed catalog:', err);
      setSyncMessage('Sync note: check Firebase connection');
      setTimeout(() => setSyncMessage(null), 2500);
    } finally {
      setIsSyncingCatalog(false);
    }
  };

  const handleDeleteProduct = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this feed listing from the Firebase database?')) {
      await deleteFromFirestore(EQUINE_COLLECTIONS.FEED_SUPPLIES, id);
      setToastMessage('Item removed from Firebase database');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24 space-y-6 font-sans relative">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 sm:right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <p className="font-extrabold text-xs text-white">{toastMessage}</p>
            <p className="text-[10px] text-amber-300">Free delivery on orders $100+</p>
          </div>
          <button
            onClick={() => {
              if (onOpenCheckout) onOpenCheckout();
              else onOpenCart();
            }}
            className="ml-2 bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-black px-3 py-1.5 rounded-xl cursor-pointer"
          >
            Checkout ➔
          </button>
        </div>
      )}

      {/* Database Sync Feedback Banner */}
      {syncMessage && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-between gap-2 shadow-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-200 animate-pulse" />
            <span>{syncMessage}</span>
          </div>
          <button onClick={() => setSyncMessage(null)} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Title Header */}
      <div className="bg-[#095DE3] text-white p-4 sm:p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-blue-400/20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
            <FeedBagIcon className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black uppercase tracking-wide text-white">
                FEED & SUPPLIES
              </h1>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                {categoryCounts.hay} Hay Varieties
              </span>
            </div>
            <p className="text-xs text-sky-200 mt-0.5">
              Premium alfalfa, timothy, orchard, teff, grain, supplements & barn supplies
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleSyncCatalogToFirestore}
            disabled={isSyncingCatalog}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs px-3 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Save all default feed products to Firebase Firestore"
          >
            <Database className={`w-4 h-4 text-emerald-300 ${isSyncingCatalog ? 'animate-spin' : ''}`} />
            <span>{isSyncingCatalog ? 'Saving...' : 'Sync to Firebase'}</span>
          </button>

          <button
            onClick={() => setShowOrdersModal(true)}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="View past orders & reorder feed"
          >
            <Receipt className="w-4 h-4 text-amber-400" />
            <span>Barn Orders</span>
          </button>

          <button
            onClick={() => setShowPublishModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Publish Feed Product</span>
          </button>

          <button
            onClick={onOpenCart}
            className="bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer relative"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart</span>
            {totalCartCount > 0 && (
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.2 rounded-full">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Firebase Database Status Pill */}
      <div className="bg-slate-900 text-slate-200 px-4 py-2 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 shadow-sm border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-white">Firebase Firestore Connected</span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-slate-300 text-[11px] font-mono">
            Collections: <span className="text-amber-400 font-bold">feedSupplies</span> ({allProducts.length}), <span className="text-emerald-400 font-bold">feedOrders</span>, <span className="text-sky-400 font-bold">feedBulkQuotes</span>
          </span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-2">
          {firestoreProducts.length > 0 ? (
            <span className="text-emerald-400 font-medium">✓ {firestoreProducts.length} custom items saved in Firestore</span>
          ) : (
            <span className="text-slate-400">Ready to save custom listings</span>
          )}
        </div>
      </div>

      {/* Bulk Delivery Tractor-Trailer Request Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Truck className="w-8 h-8 text-amber-200 shrink-0" />
          <div>
            <h3 className="font-black text-sm uppercase">Request Bulk Tractor-Trailer Haul (10+ tons)</h3>
            <p className="text-xs text-amber-100">Direct farm-to-barn wholesale alfalfa or grass hay delivery with squeeze / forklift unload service.</p>
          </div>
        </div>
        <button
          onClick={() => setShowBulkModal(true)}
          className="bg-white hover:bg-amber-50 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl uppercase shrink-0 shadow transition-colors cursor-pointer"
        >
          Request Bulk Haul ➔
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hay varieties (Alfalfa, Timothy, Orchard, Teff, Bermuda, Compressed, Round Bale, Organic)..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 font-bold text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Switcher Tabs with Counts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedCategory === 'all' 
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>All Products</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'all' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-200 text-slate-600'}`}>
              {categoryCounts.all}
            </span>
          </button>
          <button
            onClick={() => setSelectedCategory('hay')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedCategory === 'hay' 
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>🌾 Hay Bales</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'hay' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-200 text-slate-600'}`}>
              {categoryCounts.hay}
            </span>
          </button>
          <button
            onClick={() => setSelectedCategory('grain')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedCategory === 'grain' 
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>🌽 Grains & Pellets</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'grain' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-200 text-slate-600'}`}>
              {categoryCounts.grain}
            </span>
          </button>
          <button
            onClick={() => setSelectedCategory('supplements')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedCategory === 'supplements' 
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>💊 Supplements</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'supplements' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-200 text-slate-600'}`}>
              {categoryCounts.supplements}
            </span>
          </button>
          <button
            onClick={() => setSelectedCategory('tack')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedCategory === 'tack' 
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>🐴 Tack & Gear</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'tack' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-200 text-slate-600'}`}>
              {categoryCounts.tack}
            </span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 space-y-3 shadow-sm">
          <FeedBagIcon className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-black text-slate-800">No products found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or browse all hay varieties in the store.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('hay'); }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            View All Hay Products
          </button>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((p) => {
          const qty = quantities[p.id] || 1;
          const isSubbed = subscriptions[p.id] || false;
          const currentPrice = isSubbed ? p.price * 0.9 : p.price;

          return (
            <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all">
              <div>
                <div className="relative h-44 rounded-xl overflow-hidden mb-3 border border-slate-100 bg-slate-100">
                  <img 
                    src={p.image} 
                    alt={p.title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                    loading="lazy"
                  />
                  <span className="absolute top-2 left-2 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{p.rating}</span>
                  </span>
                  {p.isFirebase && (
                    <span className="absolute top-2 left-14 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5 text-amber-300 fill-amber-300" /> Firebase
                    </span>
                  )}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    {p.isFirebase && (
                      <button
                        onClick={(e) => handleDeleteProduct(p.id, e)}
                        className="bg-red-600 hover:bg-red-500 text-white p-1 rounded-md shadow cursor-pointer transition-colors"
                        title="Delete from Firestore"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite({
                          id: p.id,
                          title: p.title,
                          category: 'feed',
                          location: p.vendor || 'Equine Supply',
                          rating: p.rating,
                          price: p.price,
                          image: p.image
                        });
                      }}
                      className={`p-1 rounded-md shadow transition-colors cursor-pointer ${
                        isFavorite(p.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-900/80 text-white hover:bg-slate-900'
                      }`}
                      title={isFavorite(p.id) ? 'Remove from Saved' : 'Save to Favorites (Firestore)'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFavorite(p.id) ? 'fill-current' : ''}`} />
                    </button>
                    {p.weight && (
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded shadow">
                        {p.weight}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-amber-50 text-amber-900 rounded border border-amber-200">
                    {p.category === 'hay' ? 'Hay Bales' : p.category.toUpperCase()}
                  </span>
                  {p.inStock && (
                    <span className="text-[9px] font-bold text-emerald-700 flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> In Stock
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-xs text-slate-900 leading-snug line-clamp-2">{p.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-3 leading-relaxed">{p.description}</p>
                
                <div className="text-base font-black text-slate-900 mt-2 flex items-baseline gap-1">
                  <span>${currentPrice.toFixed(2)}</span>
                  <span className="text-[10px] font-normal text-slate-500">/ {p.weight || p.unit || 'unit'}</span>
                  {isSubbed && (
                    <span className="text-[10px] text-amber-700 font-extrabold line-through ml-1">
                      ${p.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                {/* Subscription Toggle */}
                {p.subscriptionAvailable && (
                  <label className="flex items-center gap-2 cursor-pointer text-xs bg-amber-50/80 border border-amber-200/80 p-2 rounded-xl">
                    <input
                      type="checkbox"
                      checked={isSubbed}
                      onChange={() => toggleSubscription(p.id)}
                      className="w-3.5 h-3.5 accent-amber-600 rounded"
                    />
                    <span className="font-extrabold text-amber-950 text-[11px]">Auto-Ship Recurring (Save 10%)</span>
                  </label>
                )}

                {/* Quantity + Actions */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      onClick={() => updateQuantity(p.id, -1)}
                      className="px-2 py-1.5 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 font-black text-xs text-slate-800 min-w-[18px] text-center">{qty}</span>
                    <button
                      onClick={() => updateQuantity(p.id, 1)}
                      className="px-2 py-1.5 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
                      title="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleAddToCartWithToast(p, qty, isSubbed)}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs py-2 px-2.5 rounded-xl transition-all shadow hover:shadow-md cursor-pointer flex items-center justify-center gap-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={() => handleQuickBuyClick(p, qty, isSubbed)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2 px-2.5 rounded-xl transition-all shadow hover:shadow-md cursor-pointer flex items-center justify-center gap-1"
                    title="Instant Checkout & Pay"
                  >
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* 🚀 FLOATING STICKY CART & CHECKOUT BAR (WHEN CART HAS ITEMS) */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-2xl bg-gradient-to-r from-slate-900 via-[#133553] to-slate-900 text-white rounded-2xl shadow-2xl border border-sky-500/30 p-3 sm:p-4 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-white">
                  {totalCartCount} {totalCartCount === 1 ? 'Item' : 'Items'} in Barn Cart
                </span>
                <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.2 rounded-full">
                  ${totalCartPrice.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-sky-200">
                {totalCartPrice >= 100 ? '✅ Free Barn Flatbed Delivery Unlocked' : 'Flatbed & squeeze truck delivery ready'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCart}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              View Cart
            </button>
            <button
              onClick={() => {
                if (onOpenCheckout) onOpenCheckout();
                else onOpenCart();
              }}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-black text-xs px-4 py-2 rounded-xl uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Checkout & Pay ➔</span>
            </button>
          </div>
        </div>
      )}

      {/* 🟢 BULK HAUL QUOTE MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    Wholesale Tractor-Trailer Haul Request
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct grower freight & squeeze forklift unloading (10+ tons)
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bulkSubmitted ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-black text-base">Bulk Haul Request Transmitted!</h4>
                <p className="text-xs text-emerald-800">
                  A Horsez feed dispatch representative will contact you with wholesale pricing and delivery schedule within 2 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBulkHaulSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ranch / Barn Name *</label>
                  <input 
                    type="text" 
                    value={bulkBarnName} 
                    onChange={(e) => setBulkBarnName(e.target.value)}
                    className="w-full border border-slate-300 p-2.5 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Quantity (Tons) *</label>
                    <select 
                      value={bulkTons}
                      onChange={(e) => setBulkTons(e.target.value)}
                      className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 font-medium bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="10">10 Tons (Half Semi)</option>
                      <option value="15">15 Tons</option>
                      <option value="24">24 Tons (Full Semi-Truck Load)</option>
                      <option value="50">50+ Tons (Commercial Barn Fleet)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Forage Variety *</label>
                    <select 
                      value={bulkVariety}
                      onChange={(e) => setBulkVariety(e.target.value)}
                      className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 font-medium bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="Premium Alfalfa 3-String">Premium Alfalfa (3-String)</option>
                      <option value="Eastern Oregon Timothy (1st Cut)">Timothy Grass (1st Cut)</option>
                      <option value="Orchard Grass & Alfalfa Mix">Orchard / Alfalfa Mix</option>
                      <option value="Teff Low Sugar Grass">Teff Low NSC Grass</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Delivery Destination / City *</label>
                  <input 
                    type="text" 
                    value={bulkLocation} 
                    onChange={(e) => setBulkLocation(e.target.value)}
                    placeholder="e.g. Petaluma, CA 94952"
                    className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Special Delivery & Squeeze Access Notes</label>
                  <textarea 
                    value={bulkNotes} 
                    onChange={(e) => setBulkNotes(e.target.value)}
                    rows={2}
                    placeholder="e.g. Semi truck turnaround in lower arena, squeeze stack in barn bay #3."
                    className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowBulkModal(false)}
                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="w-2/3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 py-3 rounded-xl font-black shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Truck className="w-4 h-4 text-slate-950" />
                    <span>Submit Wholesale Quote Request</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 🟢 PUBLISH FEED PRODUCT MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <FeedBagIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    Publish Feed / Hay Supply Listing
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saves directly to Firebase feedSupplies collection with live orders
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowPublishModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {publishStatusMsg ? (
              <div className="p-6 text-center space-y-2 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-black text-base">{publishStatusMsg}</h4>
                <p className="text-xs text-amber-800">Your feed product is now live for all horse owners and barns to order.</p>
              </div>
            ) : (
              <form onSubmit={handlePublishProduct} className="space-y-3.5 text-xs">
                {publishError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{publishError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                  <input 
                    type="text" 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="E.g., Premium 1st Cut Alfalfa Hay (3-String)"
                    className="w-full border border-slate-300 p-2.5 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category</label>
                    <select 
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 font-medium bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="hay">🌾 Hay Bales</option>
                      <option value="grain">🌽 Grains & Pellets</option>
                      <option value="supplements">💊 Supplements</option>
                      <option value="tack">🐴 Tack & Gear</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Price ($) *</label>
                    <input 
                      type="number" 
                      step="0.25"
                      value={newPrice} 
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="24.50"
                      className="w-full border border-slate-300 p-2.5 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Packaging / Unit</label>
                    <input 
                      type="text" 
                      value={newUnit} 
                      onChange={(e) => setNewUnit(e.target.value)}
                      placeholder="bale / bag / tub"
                      className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Weight Specification</label>
                    <input 
                      type="text" 
                      value={newWeight} 
                      onChange={(e) => setNewWeight(e.target.value)}
                      placeholder="110 lbs 3-String Bale"
                      className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vendor / Ranch Name</label>
                  <input 
                    type="text" 
                    value={newVendor} 
                    onChange={(e) => setNewVendor(e.target.value)}
                    placeholder="Sonoma Valley Hay Co."
                    className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Description & Lab Specs</label>
                  <textarea 
                    value={newDescription} 
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows={2}
                    placeholder="Tested for low sugar/starch, high protein, weed free certificate..."
                    className="w-full border border-slate-300 p-2.5 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Photo Presets */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Photo Preset</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {[
                      { label: 'Green Alfalfa Bale', url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800' },
                      { label: 'Timothy Grass', url: 'https://images.unsplash.com/photo-1595053826286-2e59ef790563?auto=format&fit=crop&q=80&w=800' },
                      { label: 'Grain & Pellets', url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=800' }
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewPhoto(preset.url)}
                        className={`p-1.5 rounded-xl border text-left flex flex-col items-center gap-1 transition-all ${
                          newPhoto === preset.url ? 'border-amber-600 ring-2 ring-amber-500/30 bg-amber-50/50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-12 object-cover rounded-lg" />
                        <span className="text-[10px] font-bold text-slate-700">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowPublishModal(false)}
                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isPublishing}
                    className="w-2/3 bg-amber-500 hover:bg-amber-400 text-slate-950 py-3 rounded-xl font-black shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Flame className="w-4 h-4 text-slate-950" />
                    <span>{isPublishing ? 'Publishing...' : 'Publish Feed Product'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 🟢 FEED ORDERS & REORDER MODAL */}
      <FeedOrdersModal
        isOpen={showOrdersModal}
        onClose={() => setShowOrdersModal(false)}
        onReorder={(reorderedItems) => {
          reorderedItems.forEach(item => {
            onAddToCart(item.product, item.quantity, item.isSubscription);
          });
          if (onOpenCheckout) {
            onOpenCheckout();
          } else {
            onOpenCart();
          }
        }}
      />

    </div>
  );
};
