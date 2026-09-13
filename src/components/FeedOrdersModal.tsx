import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingBag, 
  Truck, 
  Calendar, 
  Clock, 
  MapPin, 
  Receipt, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  Package, 
  Printer, 
  Search,
  Building2,
  AlertCircle
} from 'lucide-react';
import { FeedOrder, CartItem, FeedProduct } from '../types';
import { EQUINE_COLLECTIONS, subscribeToFirestoreCollection } from '../lib/equineDataService';
import { useAuth } from '../context/AuthContext';
import { FeedBagIcon } from './common/FeedBagIcon';

interface FeedOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReorder: (items: CartItem[]) => void;
}

export const FeedOrdersModal: React.FC<FeedOrdersModalProps> = ({
  isOpen,
  onClose,
  onReorder
}) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<FeedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<FeedOrder | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Subscribe to real-time feedOrders from Firestore
  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    const unsubscribe = subscribeToFirestoreCollection<FeedOrder>(
      EQUINE_COLLECTIONS.FEED_ORDERS,
      (loadedOrders) => {
        // Sort most recent first
        const sorted = [...loadedOrders].sort((a, b) => {
          const tA = new Date(a.createdAt || 0).getTime();
          const tB = new Date(b.createdAt || 0).getTime();
          return tB - tA;
        });
        setOrders(sorted);
        setIsLoading(false);
      },
      (err) => {
        console.warn('feedOrders subscription note:', err);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredOrders = orders.filter(o => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      o.orderNumber?.toLowerCase().includes(q) ||
      o.barnName?.toLowerCase().includes(q) ||
      o.customerName?.toLowerCase().includes(q) ||
      o.items?.some(i => i.title.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Confirmed & Scheduled</span>;
      case 'in_transit':
        return <span className="bg-sky-100 text-sky-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">On Flatbed Truck</span>;
      case 'delivered':
        return <span className="bg-teal-100 text-teal-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Barn Stacked & Delivered</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">{status}</span>;
    }
  };

  const handleReorderClick = (order: FeedOrder) => {
    const cartItems: CartItem[] = order.items.map(item => ({
      product: {
        id: item.productId,
        title: item.title,
        category: (item.category as any) || 'hay',
        price: item.price,
        unit: item.unit || 'bale',
        weight: item.weight,
        description: `${item.title} - Reordered from past barn shipment.`,
        image: item.image || 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800',
        vendor: 'Ranch Direct Feed',
        rating: 5.0,
        inStock: true,
        subscriptionAvailable: true
      },
      quantity: item.quantity,
      isSubscription: item.isSubscription || false
    }));

    onReorder(cartItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0747ad] via-[#095DE3] to-[#0a66f7] text-white px-5 py-4 flex items-center justify-between shrink-0 border-b border-blue-400/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <Receipt className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black uppercase tracking-wide text-white">
                  Barn Feed Orders & Logistics History
                </h2>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  {orders.length} Logged
                </span>
              </div>
              <p className="text-xs text-sky-200">
                Live delivery tracking, invoice records, and 1-click barn re-ordering
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by Order #, Barn Name, or Product (e.g. Alfalfa)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">Loading live barn orders from Firebase...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center space-y-3 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8">
              <div className="w-14 h-14 rounded-2xl bg-white mx-auto flex items-center justify-center text-slate-300 shadow-xs">
                <FeedBagIcon className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">No feed orders found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once you place a feed delivery order through the checkout drawer, your itemized receipts and squeeze truck dispatch updates will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const totalBales = order.items.reduce((sum, i) => sum + i.quantity, 0);
                return (
                  <div 
                    key={order.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-amber-400/80 shadow-xs hover:shadow-md transition-all p-4 sm:p-5 space-y-3.5"
                  >
                    {/* Order Top Meta */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs border border-teal-200">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                              {order.orderNumber}
                            </span>
                            {getStatusBadge(order.orderStatus)}
                          </div>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Scheduled: <strong>{order.deliveryDate}</strong> ({order.deliveryTimeSlot})</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="font-black text-slate-900 text-sm sm:text-base">
                          ${order.total.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleReorderClick(order)}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Re-Order Feed</span>
                        </button>
                      </div>
                    </div>

                    {/* Barn Location & Unload details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-start gap-2">
                        <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-800">{order.barnName}</p>
                          <p className="text-[11px] text-slate-500">{order.deliveryAddress}, {order.deliveryCity}, {order.deliveryState} {order.deliveryZip}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Truck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-800">{order.dropLocationLabel || 'Ground Drop'}</p>
                          <p className="text-[11px] text-slate-500">Tracking: <span className="font-mono font-bold text-slate-700">{order.trackingNumber}</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Items Thumbnails List */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Ordered Items ({totalBales} units total):
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 bg-white p-2 rounded-lg border border-slate-100 text-xs">
                            {item.image && (
                              <img src={item.image} alt="" className="w-8 h-8 rounded object-cover border border-slate-200" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-800 truncate">{item.title}</p>
                              <p className="text-[10px] text-slate-500">{item.quantity} × ${item.price.toFixed(2)}</p>
                            </div>
                            <span className="font-bold text-slate-700 text-xs shrink-0">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
