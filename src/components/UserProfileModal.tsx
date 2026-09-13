import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  LogOut, 
  Database, 
  Plus, 
  Heart, 
  Building2, 
  Phone, 
  Calendar,
  Sparkles,
  Check,
  Trash2,
  Bookmark,
  Star,
  ExternalLink,
  Receipt,
  Package,
  Truck,
  RotateCcw,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  ShoppingBag,
  Filter,
  ArrowRight,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { FeedOrder, CartItem } from '../types';
import { 
  EQUINE_COLLECTIONS, 
  subscribeToFirestoreCollection, 
  saveFeedOrderToFirestore, 
  deleteFromFirestore 
} from '../lib/equineDataService';
import { FeedBagIcon } from './common/FeedBagIcon';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReorder?: (items: CartItem[]) => void;
  onNavigateToFeed?: () => void;
  initialTab?: 'favorites' | 'horses' | 'orders' | 'info';
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onReorder,
  onNavigateToFeed,
  initialTab = 'favorites'
}) => {
  const { user, userProfile, userHorses, signOut, addHorse } = useAuth();
  const { favorites, removeFavorite } = useFavorites();

  const [activeTab, setActiveTab] = useState<'favorites' | 'horses' | 'orders' | 'info'>(initialTab);

  // Firestore Feed Orders State
  const [orders, setOrders] = useState<FeedOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderFilter, setOrderFilter] = useState<'all' | 'confirmed' | 'packing' | 'dispatched' | 'delivered'>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [viewScope, setViewScope] = useState<'my' | 'all'>('my');
  const [isSeedingOrder, setIsSeedingOrder] = useState(false);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);

  // Add Horse Form State
  const [showAddHorse, setShowAddHorse] = useState(false);
  const [newHorseName, setNewHorseName] = useState('');
  const [newHorseBreed, setNewHorseBreed] = useState('Dutch Warmblood');
  const [newHorseAge, setNewHorseAge] = useState(7);
  const [newHorseDiscipline, setNewHorseDiscipline] = useState('Hunter/Jumper');
  const [newHorseBarn, setNewHorseBarn] = useState('Santa Rosa Barn');
  const [isAddingHorse, setIsAddingHorse] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  // Subscribe to real-time feed orders in Firestore
  useEffect(() => {
    if (!isOpen) return;
    setIsLoadingOrders(true);
    const unsubscribe = subscribeToFirestoreCollection<FeedOrder>(
      EQUINE_COLLECTIONS.FEED_ORDERS,
      (fetched) => {
        // Sort descending by creation date
        const sorted = [...fetched].sort((a, b) => {
          const tA = new Date(a.createdAt || 0).getTime();
          const tB = new Date(b.createdAt || 0).getTime();
          return tB - tA;
        });
        setOrders(sorted);
        setIsLoadingOrders(false);
      },
      (err) => {
        console.warn('UserProfileModal: Error subscribing to feedOrders:', err);
        setIsLoadingOrders(false);
      }
    );
    return () => unsubscribe();
  }, [isOpen]);

  // User-specific orders
  const myOrders = useMemo(() => {
    return orders.filter(o => {
      const matchUid = Boolean(user?.uid && o.userId === user.uid);
      const matchEmail = Boolean(user?.email && o.customerEmail?.toLowerCase() === user.email.toLowerCase());
      const matchProfileEmail = Boolean(userProfile?.email && o.customerEmail?.toLowerCase() === userProfile.email.toLowerCase());
      return matchUid || matchEmail || matchProfileEmail;
    });
  }, [orders, user, userProfile]);

  // Orders filtered by search, status, and viewScope
  const displayedOrders = useMemo(() => {
    // If viewing 'my' and user has personal orders, show myOrders; otherwise show all facility orders
    const source = viewScope === 'my' ? (myOrders.length > 0 ? myOrders : orders) : orders;
    return source.filter(o => {
      if (orderFilter !== 'all' && o.orderStatus !== orderFilter) return false;
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        const matchNumber = o.orderNumber?.toLowerCase().includes(q);
        const matchBarn = o.barnName?.toLowerCase().includes(q);
        const matchCust = o.customerName?.toLowerCase().includes(q);
        const matchItems = o.items?.some(i => i.title.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
        if (!matchNumber && !matchBarn && !matchCust && !matchItems) return false;
      }
      return true;
    });
  }, [orders, myOrders, viewScope, orderFilter, orderSearch]);

  if (!isOpen || !user) return null;

  const handleAddHorse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHorseName.trim()) return;

    setIsAddingHorse(true);
    try {
      await addHorse({
        name: newHorseName.trim(),
        breed: newHorseBreed,
        age: Number(newHorseAge) || 5,
        discipline: newHorseDiscipline,
        stabledAt: newHorseBarn || userProfile?.barnName || 'Local Barn'
      });

      setAddSuccess(true);
      setTimeout(() => {
        setAddSuccess(false);
        setShowAddHorse(false);
        setNewHorseName('');
      }, 1000);
    } catch (err) {
      console.error('Failed to add horse:', err);
    } finally {
      setIsAddingHorse(false);
    }
  };

  // Seed sample feed purchase directly to Firestore
  const handleSeedSampleOrder = async () => {
    setIsSeedingOrder(true);
    try {
      const year = new Date().getFullYear();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const sampleOrderNumber = `HZF-${year}-${randomNum}`;
      const sampleTracking = `TRK-PETALUMA-${Math.floor(10000 + Math.random() * 90000)}`;

      const sampleOrder: Partial<FeedOrder> = {
        orderNumber: sampleOrderNumber,
        userId: user.uid,
        customerName: userProfile?.fullName || 'Sarah Jenkins',
        customerEmail: user.email || 'sarah.jenkins@horsez-equine.com',
        customerPhone: userProfile?.phone || '(707) 555-0194',
        barnName: userProfile?.barnName || 'Silver Spur Equestrian Ranch',
        deliveryAddress: userProfile?.address || '4820 Valley Ford Road',
        deliveryCity: userProfile?.city || 'Petaluma',
        deliveryState: userProfile?.state || 'CA',
        deliveryZip: userProfile?.zipCode || '94952',
        dropLocation: 'squeeze_stack',
        dropLocationLabel: 'Squeeze Stack — Main Barn Bay #2',
        deliveryDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        deliveryTimeSlot: 'Morning (08:00 - 12:00)',
        items: [
          {
            productId: 'sample-alfalfa-3string',
            title: 'Premium 3-String Alfalfa Bale (tested 21% CP)',
            category: 'hay',
            price: 28.50,
            quantity: 14,
            unit: 'bale',
            weight: '105 lbs',
            image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=600'
          },
          {
            productId: 'sample-purina-strategy',
            title: 'Purina Strategy Professional Formula GX Pellet',
            category: 'grain',
            price: 34.99,
            quantity: 4,
            unit: 'bag',
            weight: '50 lbs',
            image: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&q=80&w=600'
          },
          {
            productId: 'sample-electrolytes',
            title: 'Redmond Rock Crush Pure Natural Minerals (25 lb)',
            category: 'supplements',
            price: 38.50,
            quantity: 1,
            unit: 'bucket',
            weight: '25 lbs',
            image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=600'
          }
        ],
        subtotal: 577.46,
        bulkDiscount: 28.87,
        subscriptionDiscount: 0,
        deliveryFee: 45.00,
        unloadFee: 25.00,
        promoDiscount: 0,
        tax: 32.80,
        total: 651.39,
        paymentMethod: 'credit_card',
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
        trackingNumber: sampleTracking,
        specialInstructions: 'Stack hay in main barn bay #2. Squeeze forklift access cleared from west road.',
        createdAt: new Date().toISOString()
      };

      await saveFeedOrderToFirestore(sampleOrder);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      setOrderSuccessMessage(`Sample order #${sampleOrderNumber} created and saved to Firestore!`);
      setTimeout(() => setOrderSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to create sample order in Firestore:', err);
    } finally {
      setIsSeedingOrder(false);
    }
  };

  // Re-order past feed purchase
  const handleReorder = (order: FeedOrder) => {
    const cartItems: CartItem[] = order.items.map(item => ({
      product: {
        id: item.productId,
        title: item.title,
        category: (item.category as any) || 'hay',
        price: item.price,
        unit: item.unit || 'unit',
        weight: item.weight,
        description: `${item.title} - Reordered from past delivery order #${order.orderNumber}.`,
        image: item.image || 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800',
        vendor: 'Petaluma Regional Feed & Forage',
        rating: 5.0,
        inStock: true,
        subscriptionAvailable: true
      },
      quantity: item.quantity,
      isSubscription: item.isSubscription || false
    }));

    if (onReorder) {
      onReorder(cartItems);
      onClose();
    } else if (onNavigateToFeed) {
      onNavigateToFeed();
      onClose();
    }
  };

  // Delete an order from Firestore
  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (window.confirm(`Are you sure you want to remove feed order ${orderNumber} from Firestore?`)) {
      try {
        await deleteFromFirestore(EQUINE_COLLECTIONS.FEED_ORDERS, orderId);
      } catch (err) {
        console.error('Failed to delete feed order:', err);
      }
    }
  };

  // Status configuration helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Confirmed &amp; Scheduled</span>
          </span>
        );
      case 'packing':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
            <span>Loading Flatbed</span>
          </span>
        );
      case 'dispatched':
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-sky-300">
            <Truck className="w-3 h-3 text-sky-600" />
            <span>On Flatbed Truck</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-teal-300">
            <CheckCircle2 className="w-3 h-3 text-teal-600" />
            <span>Barn Stacked &amp; Delivered</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-slate-300">
            <Package className="w-3 h-3 text-slate-500" />
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#1B4A72] via-[#205886] to-[#1B4A72] text-white p-5 sm:p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 transition-colors cursor-pointer"
            title="Close"
          >
            ✕
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-teal-400 text-slate-950 font-black text-xl flex items-center justify-center border-2 border-white shadow-md">
              {userProfile?.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'H'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">{userProfile?.fullName || user.email}</h2>
                <span className="bg-teal-400/20 text-teal-300 border border-teal-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-teal-300" />
                  <span>Verified Member</span>
                </span>
              </div>
              <p className="text-xs text-sky-200">{userProfile?.equineRole || 'Horse Owner'}</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-sky-100">
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-teal-300" />
              <span>UID: {user.uid.substring(0, 12)}...</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-300 font-bold">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span>Synced with Firestore</span>
            </span>
          </div>
        </div>

        {/* Profile Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-3 sm:px-4 py-2 flex items-center gap-1.5 text-xs shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'favorites'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Saved Favorites</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'favorites' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {favorites.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('horses')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'horses'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>🐴 My Horses</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'horses' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {userHorses.length}
            </span>
          </button>

          {/* NEW ORDER HISTORY TAB */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-slate-900" />
            <span>Order History</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeTab === 'orders' ? 'bg-slate-950/15 text-slate-950' : 'bg-slate-200 text-slate-700'
            }`}>
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'info'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Account Info</span>
          </button>
        </div>

        {/* Profile Details Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          
          {/* TAB 1: SAVED FAVORITES */}
          {activeTab === 'favorites' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>Saved Vets, Trainers & Listings</span>
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    {user ? 'Synced with Firestore database' : 'Saved in browser local storage'}
                  </p>
                </div>
                <span className="text-xs text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  {favorites.length} Saved
                </span>
              </div>

              {favorites.length === 0 ? (
                <div className="p-8 bg-rose-50/50 border border-dashed border-rose-200 rounded-2xl text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto">
                    <Heart className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800">No Favorites Saved Yet</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Click the heart icon <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" /> on any vet clinic, trainer profile, or marketplace listing to save it here for quick access!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {favorites.map((fav) => (
                    <div 
                      key={fav.id}
                      className="bg-white border border-slate-200 hover:border-slate-300 p-3 rounded-2xl shadow-xs flex items-center justify-between gap-3 group transition-all"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {fav.image ? (
                          <img 
                            src={fav.image} 
                            alt={fav.title} 
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200" 
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 font-bold text-lg">
                            {fav.title.charAt(0)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="bg-rose-100 text-rose-800 font-black text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-tight">
                              {fav.category}
                            </span>
                            {fav.rating && (
                              <span className="text-[11px] font-bold text-amber-600 flex items-center gap-0.5">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                {fav.rating}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-xs text-slate-900 truncate mt-0.5">
                            {fav.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 truncate">
                            {fav.subtitle || fav.location || `Saved on ${fav.addedAt}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {fav.price && (
                          <span className="font-black text-xs text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">
                            {typeof fav.price === 'number' ? `$${fav.price.toLocaleString()}` : fav.price}
                          </span>
                        )}
                        <button
                          onClick={() => removeFavorite(fav.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove from favorites"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY HORSES */}
          {activeTab === 'horses' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                    <span>🐴 My Registered Horses</span>
                  </h3>
                  <p className="text-[10px] text-slate-500">Stored in Firestore `userHorses` collection</p>
                </div>

                <button
                  onClick={() => setShowAddHorse(!showAddHorse)}
                  className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 font-extrabold text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-teal-600" />
                  <span>Add Horse</span>
                </button>
              </div>

              {/* Add Horse Form */}
              {showAddHorse && (
                <form onSubmit={handleAddHorse} className="bg-teal-50/70 border border-teal-200 p-3.5 rounded-2xl space-y-2.5 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Horse Name *</label>
                      <input 
                        type="text" 
                        value={newHorseName}
                        onChange={(e) => setNewHorseName(e.target.value)}
                        placeholder="Show Name"
                        className="w-full bg-white border border-teal-300 rounded-xl px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Breed</label>
                      <input 
                        type="text" 
                        value={newHorseBreed}
                        onChange={(e) => setNewHorseBreed(e.target.value)}
                        placeholder="Breed"
                        className="w-full bg-white border border-teal-300 rounded-xl px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Discipline</label>
                      <select
                        value={newHorseDiscipline}
                        onChange={(e) => setNewHorseDiscipline(e.target.value)}
                        className="w-full bg-white border border-teal-300 rounded-xl px-2 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="Hunter/Jumper">Hunter/Jumper</option>
                        <option value="Dressage">Dressage</option>
                        <option value="Western / Reining">Western / Reining</option>
                        <option value="Eventing">Eventing</option>
                        <option value="Trail">Trail</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Barn / Location</label>
                      <input 
                        type="text" 
                        value={newHorseBarn}
                        onChange={(e) => setNewHorseBarn(e.target.value)}
                        placeholder="Barn Name"
                        className="w-full bg-white border border-teal-300 rounded-xl px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddHorse(false)}
                      className="w-1/3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold py-1.5 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isAddingHorse}
                      className="w-2/3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black py-1.5 rounded-xl shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {addSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Saved to Database!</span>
                        </>
                      ) : (
                        <>
                          <Database className="w-3.5 h-3.5" />
                          <span>Save to Firestore</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* List of Horses */}
              <div className="space-y-2">
                {userHorses.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                    No registered horses in database yet. Click "Add Horse" to save a record!
                  </div>
                ) : (
                  userHorses.map((h) => (
                    <div key={h.id || h.name} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 font-extrabold flex items-center justify-center text-sm border border-amber-300">
                          🐴
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900">{h.name}</h4>
                          <p className="text-[10px] text-slate-500">{h.breed} • {h.discipline} • {h.stabledAt}</p>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Database Synced
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ORDER HISTORY (FIRESTORE: feedOrders) */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Top Meta & Action Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-amber-600" />
                    <span>Feed &amp; Supplies Order History</span>
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <Database className="w-2.5 h-2.5 text-emerald-500" />
                      Live Firestore Collection: feedOrders
                    </span>
                    <span>•</span>
                    <span>{orders.length} Total Registered</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {/* Toggle My Orders vs All Facility Orders */}
                  {myOrders.length > 0 && orders.length > myOrders.length && (
                    <div className="bg-slate-100 p-0.5 rounded-xl flex items-center text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setViewScope('my')}
                        className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                          viewScope === 'my' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        My Orders ({myOrders.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewScope('all')}
                        className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                          viewScope === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        All Facility ({orders.length})
                      </button>
                    </div>
                  )}

                  {/* Test Order Generator Button */}
                  <button
                    type="button"
                    onClick={handleSeedSampleOrder}
                    disabled={isSeedingOrder}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    title="Creates a verified test feed order and persists it to Firestore"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isSeedingOrder ? 'Saving...' : 'Add Test Order'}</span>
                  </button>
                </div>
              </div>

              {/* Success Notification */}
              {orderSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{orderSuccessMessage}</span>
                </div>
              )}

              {/* Search & Status Filter Controls */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search past orders by order #, barn name, or item (e.g. Alfalfa)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  {orderSearch && (
                    <button 
                      onClick={() => setOrderSearch('')} 
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Status Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Status:</span>
                  {(['all', 'confirmed', 'packing', 'dispatched', 'delivered'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOrderFilter(st)}
                      className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                        orderFilter === st
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'all' ? 'All Orders' : st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loading State */}
              {isLoadingOrders ? (
                <div className="py-12 text-center space-y-2.5">
                  <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-500">Fetching past feed purchases from Firestore...</p>
                </div>
              ) : displayedOrders.length === 0 ? (
                /* Empty State */
                <div className="p-8 bg-amber-50/40 border border-dashed border-amber-200 rounded-3xl text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
                    <FeedBagIcon className="w-7 h-7 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {orderSearch || orderFilter !== 'all' ? 'No Matching Feed Orders' : 'No Feed Orders Found Yet'}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      {orderSearch || orderFilter !== 'all'
                        ? 'Try adjusting your search terms or filter buttons above.'
                        : 'Past feed orders placed through checkout are stored permanently in Firebase Firestore with flatbed delivery tracking and itemized receipts.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSeedSampleOrder}
                      disabled={isSeedingOrder}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isSeedingOrder ? 'Saving to Firestore...' : 'Create Sample Barn Order'}</span>
                    </button>

                    {onNavigateToFeed && (
                      <button
                        type="button"
                        onClick={() => {
                          onNavigateToFeed();
                          onClose();
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        Browse Feed &amp; Supplies
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Orders List */
                <div className="space-y-3.5">
                  {displayedOrders.map((order) => {
                    const isExpanded = expandedOrderId === order.id;
                    const totalUnits = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

                    return (
                      <div
                        key={order.id}
                        className="bg-white border border-slate-200 hover:border-amber-400/70 rounded-2xl shadow-xs hover:shadow-md transition-all p-3.5 sm:p-4 space-y-3"
                      >
                        {/* Order Header: Order #, Status, Scheduled Date, Total, Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono font-black text-slate-900 text-xs sm:text-sm bg-slate-100 px-2 py-0.5 rounded-lg">
                                {order.orderNumber || 'HZF-ORDER'}
                              </span>
                              {getStatusBadge(order.orderStatus)}
                              {order.paymentStatus === 'paid' && (
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                                  Paid
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>Delivery: <strong>{order.deliveryDate || 'Scheduled'}</strong></span>
                              </span>
                              {order.deliveryTimeSlot && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span>{order.deliveryTimeSlot}</span>
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Price & Reorder button */}
                          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                            <div className="text-right">
                              <span className="font-black text-slate-900 text-sm sm:text-base">
                                ${(order.total || 0).toFixed(2)}
                              </span>
                              <span className="block text-[10px] text-slate-400">
                                {totalUnits} {totalUnits === 1 ? 'unit' : 'units'}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleReorder(order)}
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                              title="Re-order all items from this delivery"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Re-Order</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                              title={isExpanded ? 'Collapse order' : 'Expand order details'}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Destination & Unload Banner */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div className="flex items-start gap-2">
                            <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{order.barnName || 'Equestrian Facility'}</p>
                              <p className="text-[10px] text-slate-500 truncate">
                                {order.deliveryAddress}{order.deliveryCity ? `, ${order.deliveryCity}` : ''} {order.deliveryState} {order.deliveryZip}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <Truck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">
                                {order.dropLocationLabel || 'Ground / Barn Drop'}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate font-mono">
                                Tracking: {order.trackingNumber || 'TRK-PENDING'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Items Preview List */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                            <span>Purchased Items ({order.items?.length || 0})</span>
                            <span className="text-slate-500">{totalUnits} total packages</span>
                          </div>

                          <div className="space-y-1.5">
                            {order.items?.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-2.5 bg-slate-50/70 p-2 rounded-xl border border-slate-100 text-xs"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.title}
                                      className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                                      <FeedBagIcon className="w-4 h-4 text-amber-700" />
                                    </div>
                                  )}

                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="bg-slate-200 text-slate-700 font-mono text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                                        {item.category}
                                      </span>
                                      {item.isSubscription && (
                                        <span className="bg-teal-100 text-teal-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                          Auto-Ship
                                        </span>
                                      )}
                                    </div>
                                    <p className="font-bold text-slate-900 truncate mt-0.5">{item.title}</p>
                                    <p className="text-[10px] text-slate-500">
                                      Qty: <strong className="text-slate-800">{item.quantity}</strong> {item.unit ? `${item.unit}s` : ''} • ${(item.price || 0).toFixed(2)} each {item.weight ? `(${item.weight})` : ''}
                                    </p>
                                  </div>
                                </div>

                                <span className="font-black text-slate-900 text-xs shrink-0">
                                  ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Expanded Receipt Breakdown & Special Instructions */}
                        {isExpanded && (
                          <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs text-slate-600 bg-slate-50/50 p-3 rounded-xl animate-in fade-in">
                            <div className="flex items-center justify-between font-bold text-slate-800 text-xs pb-1 border-b border-slate-200/60">
                              <span>Receipt &amp; Payment Summary</span>
                              <span className="font-mono text-[10px] text-slate-500 uppercase">
                                Method: {order.paymentMethod ? order.paymentMethod.replace('_', ' ') : 'Credit Card'}
                              </span>
                            </div>

                            <div className="space-y-1 text-[11px]">
                              <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>${(order.subtotal || 0).toFixed(2)}</span>
                              </div>
                              {Boolean(order.bulkDiscount && order.bulkDiscount > 0) && (
                                <div className="flex justify-between text-emerald-600 font-medium">
                                  <span>Bulk Commercial Discount</span>
                                  <span>-${order.bulkDiscount.toFixed(2)}</span>
                                </div>
                              )}
                              {Boolean(order.subscriptionDiscount && order.subscriptionDiscount > 0) && (
                                <div className="flex justify-between text-teal-600 font-medium">
                                  <span>Subscription Savings (5%)</span>
                                  <span>-${order.subscriptionDiscount.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-slate-600">
                                <span>Flatbed Freight Delivery</span>
                                <span>${(order.deliveryFee || 0).toFixed(2)}</span>
                              </div>
                              {Boolean(order.unloadFee && order.unloadFee > 0) && (
                                <div className="flex justify-between text-slate-600">
                                  <span>Squeeze Forklift / Hayloft Unload</span>
                                  <span>${order.unloadFee.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-slate-600">
                                <span>Estimated Sales Tax</span>
                                <span>${(order.tax || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-slate-900 font-black text-xs pt-1.5 border-t border-slate-200">
                                <span>Grand Total</span>
                                <span className="text-amber-600 font-black">${(order.total || 0).toFixed(2)}</span>
                              </div>
                            </div>

                            {order.specialInstructions && (
                              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px]">
                                <span className="font-bold text-slate-700 block">Driver Delivery Notes:</span>
                                <p className="text-slate-600 italic mt-0.5">"{order.specialInstructions}"</p>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1 text-[10px]">
                              <span className="text-slate-400">
                                Placed: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                                className="text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove Record</span>
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 4: ACCOUNT INFO */}
          {activeTab === 'info' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs text-slate-700">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Member Account & Address Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Email</p>
                    <p className="font-bold text-slate-900 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</p>
                    <p className="font-bold text-slate-900">{userProfile?.phone || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Primary Address</p>
                    <p className="font-bold text-slate-900">
                      {userProfile?.address ? `${userProfile.address}, ` : ''}
                      {userProfile?.city ? `${userProfile.city}, ` : ''}
                      {userProfile?.state ? `${userProfile.state} ` : ''}
                      {userProfile?.zipCode || userProfile?.location || 'Santa Rosa, CA'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Home Barn</p>
                    <p className="font-bold text-slate-900">{userProfile?.barnName || 'Private Facility'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Discipline</p>
                    <p className="font-bold text-slate-900">{userProfile?.primaryDiscipline || 'Hunter/Jumper'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sign Out Action */}
          <div className="pt-3 border-t border-slate-200">
            <button
              onClick={async () => {
                await signOut();
                onClose();
              }}
              className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Sign Out of horsez Account</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
