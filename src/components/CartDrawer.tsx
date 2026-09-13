import React from 'react';
import { ShoppingBag, X, Trash2, CheckCircle2, ArrowRight, Truck, Sparkles, ShieldCheck, Plus, Minus } from 'lucide-react';
import { CartItem } from '../types';
import { FeedBagIcon } from './common/FeedBagIcon';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenCheckout
}) => {
  if (!isOpen) return null;

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.isSubscription ? item.product.price * 0.9 : item.product.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  const freeDeliveryThreshold = 100;
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const deliveryProgressPercent = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  const deliveryFee = isFreeDelivery ? 0 : 15;
  const total = subtotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end font-sans">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-250">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#0747ad] via-[#095DE3] to-[#0a66f7] text-white p-4 sm:p-5 flex items-center justify-between border-b border-blue-400/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
              <FeedBagIcon className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm text-white uppercase tracking-wide">
                  Feed & Supplies Cart
                </h2>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.2 rounded-full">
                  {totalItemsCount} units
                </span>
              </div>
              <p className="text-[11px] text-sky-200">
                Direct barn flatbed & squeeze truck delivery
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-800 text-[11px] mb-1">
            <span className="flex items-center gap-1.5 text-amber-950">
              <Truck className="w-3.5 h-3.5 text-amber-700" />
              {isFreeDelivery 
                ? 'You unlocked FREE Barn Flatbed Delivery!' 
                : `Add $${amountToFreeDelivery.toFixed(2)} more for FREE delivery`}
            </span>
            <span className="font-mono text-amber-900">{deliveryProgressPercent.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-amber-200/70 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-amber-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${deliveryProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-20 space-y-3 text-slate-400">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 mx-auto flex items-center justify-center text-slate-300">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">Your feed cart is empty</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explore premium alfalfa, timothy, orchard grass, equine nutrition pellets, and supplements in our store.
              </p>
            </div>
          ) : (
            cart.map((item, idx) => {
              const price = item.isSubscription ? item.product.price * 0.9 : item.product.price;
              return (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs hover:border-amber-300 transition-all">
                  <img 
                    src={item.product.image} 
                    alt="" 
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-white" 
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{item.product.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      ${price.toFixed(2)} / {item.product.weight || item.product.unit || 'unit'}
                      {item.isSubscription && (
                        <span className="ml-1 text-amber-700 font-extrabold bg-amber-100 px-1.5 py-0.2 rounded">
                          10% Auto-Ship
                        </span>
                      )}
                    </p>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <button 
                        onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                        className="w-6 h-6 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                      >
                        -
                      </button>
                      <span className="font-black text-slate-800 text-xs px-1.5 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right flex flex-col justify-between items-end h-full">
                    <button 
                      onClick={() => onRemoveItem(idx)}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="font-black text-slate-900 text-xs mt-3">
                      ${(price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout Trigger */}
        {cart.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50/80 p-4 sm:p-5 space-y-3 text-xs shrink-0">
            <div className="space-y-1.5 text-slate-600 font-semibold">
              <div className="flex justify-between">
                <span>Subtotal ({totalItemsCount} items)</span>
                <span className="text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Barn Delivery Freight</span>
                <span className={isFreeDelivery ? 'text-emerald-700 font-bold' : 'text-slate-900'}>
                  {isFreeDelivery ? 'FREE ($100+ Order)' : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-slate-200">
                <span>Estimated Total</span>
                <span className="text-teal-700 text-base">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenCheckout();
              }}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-black text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Feed Checkout & Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-semibold pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Credit Card • Apple Pay • Farm Net-30 • Check on Unload</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
