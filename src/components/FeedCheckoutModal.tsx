import React, { useState, useMemo } from 'react';
import { 
  X, 
  ShoppingBag, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  MapPin, 
  Tag, 
  Plus, 
  Minus, 
  Trash2, 
  AlertCircle, 
  Sparkles, 
  Receipt, 
  Printer, 
  Download, 
  ArrowRight, 
  Lock, 
  ChevronRight, 
  Building2, 
  Wallet,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, FeedOrder, FeedOrderItem, FeedPaymentMethod } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSavedAddress } from '../context/SavedAddressContext';
import { EQUINE_COLLECTIONS, publishToFirestore } from '../lib/equineDataService';
import { FeedBagIcon } from './common/FeedBagIcon';

interface FeedCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onOrderCompleted?: (order: FeedOrder) => void;
}

export const FeedCheckoutModal: React.FC<FeedCheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderCompleted
}) => {
  const { user, userProfile } = useAuth();
  const { savedAddress } = useSavedAddress();

  // Navigation Steps: 'checkout' | 'processing' | 'success'
  const [step, setStep] = useState<'checkout' | 'processing' | 'success'>('checkout');

  // Customer & Delivery Address State
  const [customerName, setCustomerName] = useState(userProfile?.fullName || 'Sarah Jenkins');
  const [customerEmail, setCustomerEmail] = useState(userProfile?.email || user?.email || 'sarah.jenkins@horsez-equine.com');
  const [customerPhone, setCustomerPhone] = useState(userProfile?.phone || '(707) 555-0194');
  const [barnName, setBarnName] = useState(userProfile?.barnName || 'Silver Spur Equestrian Ranch');
  const [deliveryAddress, setDeliveryAddress] = useState(savedAddress?.street || userProfile?.address || '4820 Valley Ford Road');
  const [deliveryCity, setDeliveryCity] = useState(savedAddress?.city || userProfile?.city || 'Petaluma');
  const [deliveryState, setDeliveryState] = useState(savedAddress?.state || userProfile?.state || 'CA');
  const [deliveryZip, setDeliveryZip] = useState(savedAddress?.zip || userProfile?.zipCode || '94952');
  const [gateCode, setGateCode] = useState('#8821');
  const [specialInstructions, setSpecialInstructions] = useState('Stack hay in main barn feed room bay #2. Dogs are friendly in turnout.');

  // Delivery & Unloading Preferences
  const [dropLocation, setDropLocation] = useState<'ground_drop' | 'squeeze_stack' | 'hayloft_stack' | 'stall_front'>('squeeze_stack');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('Morning (07:00 AM – 11:00 AM)');

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent?: number; discountAmount?: number } | null>(null);
  const [promoError, setPromoError] = useState('');

  // Payment Method Selection
  const [paymentMethod, setPaymentMethod] = useState<FeedPaymentMethod>('credit_card');

  // Credit Card Inputs
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(userProfile?.fullName || 'Sarah Jenkins');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('382');
  const [cardZip, setCardZip] = useState('94952');
  const [saveCard, setSaveCard] = useState(true);

  // Net-30 PO / Commercial Inputs
  const [poNumber, setPoNumber] = useState('PO-2026-HORSEZ-88');
  const [taxId, setTaxId] = useState('XX-XXX9281');

  // Apple Pay / Google Pay Simulator State
  const [isAuthorizingDigitalWallet, setIsAuthorizingDigitalWallet] = useState(false);

  // Completed Order Storage
  const [completedOrder, setCompletedOrder] = useState<FeedOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Calculate totals
  const {
    totalItemsCount,
    subtotal,
    subscriptionSavings,
    bulkDiscountAmount,
    deliveryFee,
    unloadFee,
    promoDiscountAmount,
    tax,
    finalTotal
  } = useMemo(() => {
    let itemsCount = 0;
    let baseSubtotal = 0;
    let subSavings = 0;

    cart.forEach(item => {
      itemsCount += item.quantity;
      const rawPrice = item.product.price * item.quantity;
      baseSubtotal += rawPrice;
      if (item.isSubscription) {
        subSavings += rawPrice * 0.10; // 10% auto-ship savings
      }
    });

    // Volume Bulk Tier Discounts: 10+ bales = 5% off, 50+ bales = 10% off
    let bulkDiscount = 0;
    if (itemsCount >= 50) {
      bulkDiscount = baseSubtotal * 0.10;
    } else if (itemsCount >= 10) {
      bulkDiscount = baseSubtotal * 0.05;
    }

    // Delivery Fee: Free over $100
    const delivery = baseSubtotal >= 100 ? 0 : 15;

    // Unload / Stacking Fee
    let unload = 0;
    if (dropLocation === 'squeeze_stack') unload = 45;
    else if (dropLocation === 'hayloft_stack') unload = 65;
    else if (dropLocation === 'stall_front') unload = 30;

    // Promo Discount
    let promoDisc = 0;
    if (appliedPromo) {
      if (appliedPromo.discountPercent) {
        promoDisc = (baseSubtotal - subSavings - bulkDiscount) * (appliedPromo.discountPercent / 100);
      } else if (appliedPromo.discountAmount) {
        promoDisc = Math.min(appliedPromo.discountAmount, baseSubtotal);
      }
    }

    // Tax: Standard forage hay is agricultural tax exempt in most states; tack & grain has 3% estimate
    const taxableAmount = cart
      .filter(i => i.product.category === 'tack' || i.product.category === 'grain')
      .reduce((s, i) => s + (i.product.price * i.quantity), 0);
    const taxAmt = taxableAmount * 0.075;

    const total = Math.max(0, baseSubtotal - subSavings - bulkDiscount - promoDisc + delivery + unload + taxAmt);

    return {
      totalItemsCount: itemsCount,
      subtotal: baseSubtotal,
      subscriptionSavings: subSavings,
      bulkDiscountAmount: bulkDiscount,
      deliveryFee: delivery,
      unloadFee: unload,
      promoDiscountAmount: promoDisc,
      tax: taxAmt,
      finalTotal: total
    };
  }, [cart, dropLocation, appliedPromo]);

  // Autofill barn address from profile/saved
  const handleAutofillBarnAddress = () => {
    if (savedAddress) {
      setDeliveryAddress(savedAddress.street || deliveryAddress);
      setDeliveryCity(savedAddress.city || deliveryCity);
      setDeliveryState(savedAddress.state || deliveryState);
      setDeliveryZip(savedAddress.zip || deliveryZip);
    } else if (userProfile) {
      setDeliveryAddress(userProfile.address || deliveryAddress);
      setDeliveryCity(userProfile.city || deliveryCity);
      setDeliveryState(userProfile.state || deliveryState);
      setDeliveryZip(userProfile.zipCode || deliveryZip);
      if (userProfile.barnName) setBarnName(userProfile.barnName);
    }
  };

  // Promo code validation
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'BARN10' || code === 'HORSEZ10') {
      setAppliedPromo({ code, discountPercent: 10 });
    } else if (code === 'FREESHIP') {
      setAppliedPromo({ code, discountAmount: 15 });
    } else if (code === 'RANCH20' || code === 'SPRINGHAY') {
      setAppliedPromo({ code, discountAmount: 20 });
    } else if (code === 'VIPFEED') {
      setAppliedPromo({ code, discountPercent: 15 });
    } else {
      setPromoError('Invalid promo code. Try BARN10, FREESHIP, or RANCH20.');
      return;
    }
    setPromoCodeInput('');
  };

  // Format Card Number
  const handleCardNumberChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').substring(0, 16);
    const parts = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      parts.push(cleaned.substring(i, i + 4));
    }
    setCardNumber(parts.join(' '));
  };

  // Format Expiry
  const handleExpiryChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').substring(0, 4);
    if (cleaned.length >= 3) {
      setCardExpiry(`${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`);
    } else {
      setCardExpiry(cleaned);
    }
  };

  // Detect card brand
  const cardBrand = useMemo(() => {
    const num = cardNumber.replace(/\s/g, '');
    if (num.startsWith('4')) return 'Visa';
    if (num.startsWith('5') || num.startsWith('2')) return 'Mastercard';
    if (num.startsWith('34') || num.startsWith('37')) return 'Amex';
    if (num.startsWith('6')) return 'Discover';
    return 'Card';
  }, [cardNumber]);

  const dropLocationLabels: Record<string, string> = {
    ground_drop: 'Standard Ground Drop (Free over $100)',
    squeeze_stack: 'Squeeze Truck Forklift Stacking (+$45)',
    hayloft_stack: 'Hayloft / Feed Room Hand Stacking (+$65)',
    stall_front: 'Stall-Front Ground Stacking (+$30)'
  };

  // Submit Order & Process Payment
  const handleProcessOrder = async () => {
    if (cart.length === 0) return;
    if (!deliveryAddress.trim() || !deliveryCity.trim() || !customerName.trim()) {
      setSubmitError('Please complete the barn delivery address and customer name.');
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);
    setStep('processing');

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `HZ-FEED-${randomSuffix}`;
    const trackingNumber = `TRK-HAUL-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderItems: FeedOrderItem[] = cart.map(i => ({
      productId: i.product.id,
      title: i.product.title,
      category: i.product.category,
      price: i.product.price,
      quantity: i.quantity,
      unit: i.product.unit || 'bale',
      weight: i.product.weight,
      image: i.product.image,
      isSubscription: i.isSubscription
    }));

    const orderPayload: FeedOrder = {
      id: `feed-order-${Date.now()}`,
      orderNumber,
      userId: user?.uid || userProfile?.uid || 'guest-ranch-client',
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      barnName: barnName.trim() || 'Equine Facility',
      deliveryAddress: deliveryAddress.trim(),
      deliveryCity: deliveryCity.trim(),
      deliveryState: deliveryState.trim().toUpperCase(),
      deliveryZip: deliveryZip.trim(),
      gateCode: gateCode.trim(),
      dropLocation,
      dropLocationLabel: dropLocationLabels[dropLocation] || 'Ground Drop',
      deliveryDate,
      deliveryTimeSlot,
      items: orderItems,
      subtotal,
      bulkDiscount: bulkDiscountAmount,
      subscriptionDiscount: subscriptionSavings,
      deliveryFee,
      unloadFee,
      promoDiscount: promoDiscountAmount,
      promoCode: appliedPromo?.code,
      tax,
      total: finalTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod_check' ? 'pending_cod' : paymentMethod === 'farm_credit_line' ? 'invoiced_net30' : 'paid',
      orderStatus: 'confirmed',
      trackingNumber,
      specialInstructions: specialInstructions.trim(),
      createdAt: new Date().toISOString()
    };

    // Simulate realistic bank authorization / inventory lock delay
    setTimeout(async () => {
      try {
        // Publish to Firebase Firestore `feedOrders`
        await publishToFirestore(
          EQUINE_COLLECTIONS.FEED_ORDERS,
          orderPayload
        );
      } catch (err) {
        console.warn('Firebase feedOrders write note:', err);
      }

      setCompletedOrder(orderPayload);
      setIsSubmitting(false);
      setStep('success');
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });

      if (onOrderCompleted) {
        onOrderCompleted(orderPayload);
      }
      onClearCart();
    }, 1600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-[#0747ad] via-[#095DE3] to-[#0a66f7] text-white px-5 py-4 flex items-center justify-between shrink-0 border-b border-blue-400/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <FeedBagIcon className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black uppercase tracking-wide text-white">
                  {step === 'success' ? 'Feed Order Confirmed' : 'Feed & Supplies Checkout'}
                </h2>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Secure SSL 256-Bit
                </span>
              </div>
              <p className="text-xs text-sky-200">
                {step === 'success' 
                  ? `Order #${completedOrder?.orderNumber} scheduled for barn delivery`
                  : 'Fast hay bale, grain & nutritional supply dispatch to your barn'
                }
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

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ===================== PROCESSING STATE ===================== */}
          {step === 'processing' && (
            <div className="py-16 text-center space-y-5 max-w-md mx-auto">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FeedBagIcon className="w-8 h-8 text-amber-600 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Authorizing Feed Payment...</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Connecting to equestrian merchant gateway, allocating hay lot inventory, and booking driver dispatch slot.
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-semibold text-slate-600 space-y-1.5 text-left">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified Forage Quality Inspection Passed</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Squeeze Forklift Logistics Reserved</span>
                </div>
                <div className="flex items-center gap-2 text-amber-700 font-bold">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Transmitting manifest to Petaluma Hay Dispatch</span>
                </div>
              </div>
            </div>
          )}

          {/* ===================== SUCCESS & RECEIPT STATE ===================== */}
          {step === 'success' && completedOrder && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-300">
              
              {/* Green Confirmation Hero Banner */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-3xl p-6 shadow-xl border border-emerald-400/30 text-center space-y-3 relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs text-white mx-auto flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black tracking-tight">Order Confirmed & Scheduled!</h3>
                <p className="text-xs text-emerald-100 max-w-md mx-auto">
                  Thank you, <strong className="text-white">{completedOrder.customerName}</strong>! Your feed delivery order has been logged into the logistics schedule.
                </p>
                <div className="inline-flex items-center gap-2 bg-slate-950/40 backdrop-blur-xs px-4 py-1.5 rounded-full text-xs font-black text-amber-300 border border-amber-400/30">
                  <span>Order Number:</span>
                  <span className="font-mono text-white tracking-wider">{completedOrder.orderNumber}</span>
                </div>
              </div>

              {/* Printable Invoice / Delivery Ticket */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-5 sm:p-7 space-y-5 text-slate-800">
                
                {/* Ticket Top Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Official Feed Delivery Manifest
                    </span>
                    <h4 className="text-lg font-black text-slate-900 mt-1">{completedOrder.barnName}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{completedOrder.deliveryAddress}, {completedOrder.deliveryCity}, {completedOrder.deliveryState} {completedOrder.deliveryZip}</span>
                    </p>
                  </div>

                  <div className="sm:text-right space-y-1 text-xs">
                    <p className="font-bold text-slate-900">
                      Delivery Date: <span className="text-amber-600">{completedOrder.deliveryDate}</span>
                    </p>
                    <p className="text-slate-500">
                      Window: <span className="font-semibold text-slate-700">{completedOrder.deliveryTimeSlot}</span>
                    </p>
                    <p className="text-slate-500">
                      Tracking ID: <span className="font-mono font-bold text-slate-700">{completedOrder.trackingNumber}</span>
                    </p>
                  </div>
                </div>

                {/* Drop Location & Special Driver Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <span className="font-extrabold text-slate-500 text-[10px] uppercase">Unloading & Stacking Service:</span>
                    <p className="font-bold text-slate-900 mt-0.5">{completedOrder.dropLocationLabel}</p>
                    {completedOrder.gateCode && (
                      <p className="text-[11px] text-slate-600 mt-1">
                        <strong>Gate / Lock Code:</strong> {completedOrder.gateCode}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-500 text-[10px] uppercase">Driver Special Notes:</span>
                    <p className="text-[11px] text-slate-700 italic mt-0.5">
                      "{completedOrder.specialInstructions || 'Standard barn drop off.'}"
                    </p>
                  </div>
                </div>

                {/* Itemized Table */}
                <div className="space-y-2">
                  <h5 className="font-black text-xs uppercase tracking-wider text-slate-700">Itemized Feed & Supplies</h5>
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {completedOrder.items.map((item, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{item.title}</p>
                            <p className="text-[10px] text-slate-500">
                              Qty: {item.quantity} × ${item.price.toFixed(2)} / {item.weight || item.unit || 'unit'}
                              {item.isSubscription && <span className="ml-1.5 text-amber-700 font-extrabold">• Auto-Ship (10% Off)</span>}
                            </p>
                          </div>
                        </div>
                        <span className="font-black text-slate-900 text-sm">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Cost Summary */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${completedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  {completedOrder.subscriptionDiscount > 0 && (
                    <div className="flex justify-between text-amber-700 font-bold">
                      <span>Auto-Ship Recurring Savings</span>
                      <span>-${completedOrder.subscriptionDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {completedOrder.bulkDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Volume Bulk Discount</span>
                      <span>-${completedOrder.bulkDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {completedOrder.promoDiscount > 0 && (
                    <div className="flex justify-between text-teal-700 font-bold">
                      <span>Promo Coupon ({completedOrder.promoCode})</span>
                      <span>-${completedOrder.promoDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Freight</span>
                    <span>{completedOrder.deliveryFee === 0 ? 'FREE ($100+ Order)' : `$${completedOrder.deliveryFee.toFixed(2)}`}</span>
                  </div>
                  {completedOrder.unloadFee > 0 && (
                    <div className="flex justify-between">
                      <span>Squeeze Stacking / Unload</span>
                      <span>${completedOrder.unloadFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Sales Tax (Forage Exempt)</span>
                    <span>${completedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Paid</span>
                    <span className="text-teal-700 text-base">${completedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                  <button
                    onClick={() => window.print()}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Delivery Receipt</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={onClose}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Done & Back to Feed Store</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ===================== MAIN CHECKOUT FORM ===================== */}
          {step === 'checkout' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Delivery & Payment Details (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">

                {/* 1. Barn Delivery Address Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-900 uppercase">
                        Barn Delivery Destination
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={handleAutofillBarnAddress}
                      className="text-[11px] font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Autofill Saved Barn
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Contact Name *</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Barn / Ranch Name *</label>
                      <input
                        type="text"
                        value={barnName}
                        onChange={(e) => setBarnName(e.target.value)}
                        placeholder="e.g. Silver Spur Ranch"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Street Address *</label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Ranch Road, Gate #, or Facility Address"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">City *</label>
                      <input
                        type="text"
                        value={deliveryCity}
                        onChange={(e) => setDeliveryCity(e.target.value)}
                        placeholder="City"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">State *</label>
                        <input
                          type="text"
                          value={deliveryState}
                          onChange={(e) => setDeliveryState(e.target.value)}
                          placeholder="CA"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 uppercase focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">ZIP *</label>
                        <input
                          type="text"
                          value={deliveryZip}
                          onChange={(e) => setDeliveryZip(e.target.value)}
                          placeholder="94952"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Phone (Driver Dispatch) *</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="(707) 555-0194"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Gate / Keypad Code</label>
                      <input
                        type="text"
                        value={gateCode}
                        onChange={(e) => setGateCode(e.target.value)}
                        placeholder="#1234 or Call on Arrival"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Unload Method & Scheduled Date Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                    <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900 uppercase">
                      Unloading & Scheduled Delivery Window
                    </h3>
                  </div>

                  <div className="space-y-2 text-xs">
                    <label className="block font-bold text-slate-700">Choose Farm Unloading & Stacking Option:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { id: 'ground_drop', title: 'Ground Drop (Flatbed)', desc: 'Tailgate drop at barn apron', fee: '$0' },
                        { id: 'squeeze_stack', title: 'Forklift / Squeeze Stacking', desc: 'Neat barn stack via diesel squeeze', fee: '+$45' },
                        { id: 'hayloft_stack', title: 'Hayloft / Elevator Stacking', desc: 'Hand stack up to second-story loft', fee: '+$65' },
                        { id: 'stall_front', title: 'Stall-Front Drop', desc: 'Bales dropped directly at stall doors', fee: '+$30' },
                      ].map(opt => (
                        <label
                          key={opt.id}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                            dropLocation === opt.id 
                              ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 shadow-xs' 
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="dropLocation"
                                value={opt.id}
                                checked={dropLocation === opt.id}
                                onChange={() => setDropLocation(opt.id as any)}
                                className="accent-teal-600"
                              />
                              <span className="font-extrabold text-slate-900">{opt.title}</span>
                            </div>
                            <span className="font-black text-teal-800 text-[11px]">{opt.fee}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 ml-5 mt-1">{opt.desc}</p>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Target Delivery Date *</label>
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Delivery Time Window *</label>
                      <select
                        value={deliveryTimeSlot}
                        onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      >
                        <option value="Morning (07:00 AM – 11:00 AM)">Morning (07:00 AM – 11:00 AM)</option>
                        <option value="Afternoon (12:00 PM – 04:00 PM)">Afternoon (12:00 PM – 04:00 PM)</option>
                        <option value="Evening (04:00 PM – 08:00 PM)">Evening (04:00 PM – 08:00 PM)</option>
                        <option value="Anytime (All Day Window)">Anytime (All Day Window)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Driver Drop Notes / Feed Room #</label>
                      <input
                        type="text"
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder="e.g. Feed room #2 on left side of barn aisle. Squeeze clear width is 12ft."
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Payment Method Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                    <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900 uppercase">
                      Payment Method
                    </h3>
                  </div>

                  {/* Payment Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('credit_card')}
                      className={`p-2.5 rounded-xl border font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'credit_card'
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Credit Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('apple_pay')}
                      className={`p-2.5 rounded-xl border font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'apple_pay'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Apple Pay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('farm_credit_line')}
                      className={`p-2.5 rounded-xl border font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'farm_credit_line'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Net-30 Invoice</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod_check')}
                      className={`p-2.5 rounded-xl border font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'cod_check'
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Check on Unload</span>
                    </button>
                  </div>

                  {/* Tab 1: Credit Card Form */}
                  {paymentMethod === 'credit_card' && (
                    <div className="space-y-4 pt-2">
                      
                      {/* Realistic Visual Card Mockup */}
                      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#1B4A72] text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-700 max-w-sm mx-auto space-y-3 relative overflow-hidden">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Equestrian Member Card</span>
                          <span className="font-extrabold text-xs text-amber-400">{cardBrand}</span>
                        </div>
                        <div className="w-9 h-7 rounded bg-amber-400/80 shadow-inner flex items-center justify-center border border-amber-300">
                          <div className="w-6 h-4 border border-amber-800/40 rounded-xs" />
                        </div>
                        <div className="font-mono text-base font-black tracking-widest text-slate-100">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </div>
                        <div className="flex justify-between items-end text-[10px]">
                          <div>
                            <span className="text-slate-400 block text-[8px] uppercase">Cardholder</span>
                            <span className="font-bold uppercase tracking-wider">{cardHolder || 'CARDHOLDER'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[8px] uppercase">Expires</span>
                            <span className="font-bold">{cardExpiry || 'MM/YY'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">Card Number</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => handleCardNumberChange(e.target.value)}
                              placeholder="4242 4242 4242 4242"
                              maxLength={19}
                              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3 py-2 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            />
                            <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Cardholder Name</label>
                          <input
                            type="text"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            placeholder="Name on card"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Expiry (MM/YY)</label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => handleExpiryChange(e.target.value)}
                              placeholder="MM/YY"
                              maxLength={5}
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">CVV</label>
                            <input
                              type="password"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.substring(0, 4))}
                              placeholder="123"
                              maxLength={4}
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="flex items-center gap-2 cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              checked={saveCard}
                              onChange={(e) => setSaveCard(e.target.checked)}
                              className="w-4 h-4 accent-teal-600 rounded"
                            />
                            <span className="font-semibold text-slate-700 text-xs">
                              Save encrypted card in Horsez Vault for automatic hay shipments
                            </span>
                          </label>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Tab 2: Apple Pay / Google Pay */}
                  {paymentMethod === 'apple_pay' && (
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-900 text-white mx-auto flex items-center justify-center">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900">1-Tap Instant Apple / Google Pay</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Authorize instantly with Face ID / Touch ID. Your default card ending in 4242 will be charged ${finalTotal.toFixed(2)}.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAuthorizingDigitalWallet(true);
                          setTimeout(() => {
                            setIsAuthorizingDigitalWallet(false);
                            handleProcessOrder();
                          }, 900);
                        }}
                        disabled={isAuthorizingDigitalWallet}
                        className="bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs px-6 py-3 rounded-xl uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 mx-auto cursor-pointer"
                      >
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <span>{isAuthorizingDigitalWallet ? 'Authorizing Biometrics...' : `Pay $${finalTotal.toFixed(2)} with Apple Pay`}</span>
                      </button>
                    </div>
                  )}

                  {/* Tab 3: Net-30 Barn Commercial Invoicing */}
                  {paymentMethod === 'farm_credit_line' && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 text-xs">
                      <div className="flex items-center gap-2 text-amber-900 font-extrabold">
                        <Building2 className="w-4 h-4" />
                        <span>Commercial Barn & Ranch Net-30 Account</span>
                      </div>
                      <p className="text-amber-800 text-[11px]">
                        Available for boarding barns, training facilities, and equine clinics with an approved Horsez Trade Credit Line. An itemized commercial invoice will be sent upon delivery.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block font-bold text-amber-950 mb-1">Purchase Order (PO #)</label>
                          <input
                            type="text"
                            value={poNumber}
                            onChange={(e) => setPoNumber(e.target.value)}
                            placeholder="PO-2026-001"
                            className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-amber-950 mb-1">Farm Tax ID / Business EIN</label>
                          <input
                            type="text"
                            value={taxId}
                            onChange={(e) => setTaxId(e.target.value)}
                            placeholder="XX-XXXXXXX"
                            className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Check / Cash on Unload */}
                  {paymentMethod === 'cod_check' && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-emerald-900 font-extrabold">
                        <Wallet className="w-4 h-4" />
                        <span>Check or COD on Squeeze Unload</span>
                      </div>
                      <p className="text-emerald-800 text-[11px]">
                        The squeeze delivery driver will verify bale count and forage RFV moisture analysis sheet upon arrival at your ranch apron before accepting a barn check or cash receipt.
                      </p>
                    </div>
                  )}

                </div>

              </div>

              {/* Right Column: Order Items Summary & Final Review (5 Cols) */}
              <div className="lg:col-span-5 space-y-5">
                
                {/* Cart Items Summary Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-amber-600" />
                      <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-900">
                        Order Summary ({totalItemsCount} units)
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {cart.length} Products
                    </span>
                  </div>

                  {/* Items Scrollable List */}
                  <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 divide-y divide-slate-100">
                    {cart.map((item, idx) => {
                      const itemPrice = item.isSubscription ? item.product.price * 0.9 : item.product.price;
                      return (
                        <div key={idx} className="pt-2.5 first:pt-0 flex items-center justify-between gap-2.5 text-xs">
                          <img 
                            src={item.product.image} 
                            alt="" 
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-white" 
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-slate-900 truncate">{item.product.title}</h5>
                            <p className="text-[10px] text-slate-500">
                              ${itemPrice.toFixed(2)} / {item.product.weight || item.product.unit || 'unit'}
                              {item.isSubscription && <span className="ml-1 text-amber-700 font-extrabold">(10% Auto-Ship)</span>}
                            </p>
                            
                            {/* Qty Counter */}
                            <div className="flex items-center gap-1.5 mt-1">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                                className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-[10px] cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-black text-slate-800 text-xs px-1">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                                className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-[10px] cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-black text-slate-900 text-xs block">
                              ${(itemPrice * item.quantity).toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(idx)}
                              className="text-slate-400 hover:text-red-500 p-1 text-[10px] transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Promo Code Input */}
                  <div className="pt-2 border-t border-slate-200">
                    <form onSubmit={handleApplyPromo} className="flex gap-1.5">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value)}
                          placeholder="Promo code (e.g. BARN10)"
                          className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-2 py-1.5 text-xs font-semibold text-slate-800 uppercase focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0"
                      >
                        Apply
                      </button>
                    </form>
                    {appliedPromo && (
                      <div className="flex items-center justify-between text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-1.5 rounded-lg mt-2 font-bold">
                        <span>Coupon '{appliedPromo.code}' Applied!</span>
                        <button type="button" onClick={() => setAppliedPromo(null)} className="text-slate-400 hover:text-red-500">✕</button>
                      </div>
                    )}
                    {promoError && (
                      <p className="text-[11px] text-red-600 mt-1 font-semibold">{promoError}</p>
                    )}
                  </div>

                  {/* Price Calculations Breakdown */}
                  <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs font-semibold text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal ({totalItemsCount} items)</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>

                    {subscriptionSavings > 0 && (
                      <div className="flex justify-between text-amber-700 font-bold">
                        <span>Auto-Ship Recurring Savings</span>
                        <span>-${subscriptionSavings.toFixed(2)}</span>
                      </div>
                    )}

                    {bulkDiscountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>Volume Bulk Discount ({totalItemsCount >= 50 ? '10%' : '5%'})</span>
                        <span>-${bulkDiscountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    {promoDiscountAmount > 0 && (
                      <div className="flex justify-between text-teal-700 font-bold">
                        <span>Promo Code Savings</span>
                        <span>-${promoDiscountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Delivery Freight</span>
                      <span>{deliveryFee === 0 ? 'FREE ($100+ Order)' : `$${deliveryFee.toFixed(2)}`}</span>
                    </div>

                    {unloadFee > 0 && (
                      <div className="flex justify-between">
                        <span>Squeeze / Stacking Service</span>
                        <span>+${unloadFee.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Agricultural Tax (Forage Exempt)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between font-black text-slate-900 text-sm pt-2 border-t border-slate-200">
                      <span>Total Amount</span>
                      <span className="text-teal-700 text-base">${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {submitError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Big Checkout Action Button */}
                  <button
                    type="button"
                    onClick={handleProcessOrder}
                    disabled={isSubmitting || cart.length === 0}
                    className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-black text-xs py-3.5 px-4 rounded-xl uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Complete Order & Authorize (${finalTotal.toFixed(2)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Guarantee Badges */}
                  <div className="pt-2 flex items-center justify-center gap-3 text-[10px] text-slate-500 font-semibold border-t border-slate-200">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>100% Blister Beetle Free</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>Weed-Free Certified</span>
                    </span>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
