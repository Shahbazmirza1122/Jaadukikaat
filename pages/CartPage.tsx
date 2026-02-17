
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Lock, CircleCheck, Loader2, LogIn, CreditCard, ShieldCheck, Ticket, X, Smartphone, Mail } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { submitToGoogleSheet, sendOrderEmail } from '../services/sheetService';
import { supabase } from '../lib/supabase';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [isCheckout, setIsCheckout] = useState(false);
  const location = useLocation();
  
  // Checkout Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'jazzcash'>('card');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardBrand, setCardBrand] = useState<string>('unknown');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Info Popup State
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  // Check for direct checkout navigation
  useEffect(() => {
    if (location.state && location.state.openCheckout) {
        setIsCheckout(true);
    }
  }, [location.state]);

  // Auto-fill user details if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
        setFullName(user.name || '');
        setEmail(user.email || '');
    }
  }, [isAuthenticated, user]);

  // Show Info Popup after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
        // Only show if not already completed order
        if (!orderComplete) {
            setShowInfoPopup(true);
        }
    }, 5000);
    return () => clearTimeout(timer);
  }, [orderComplete]);

  // Recalculate discount if cart changes
  useEffect(() => {
    if (appliedCoupon) {
        calculateDiscount(appliedCoupon);
    } else {
        setDiscountAmount(0);
    }
  }, [cart, cartTotal, appliedCoupon]);

  const calculateDiscount = (coupon: any) => {
      let discount = 0;
      if (coupon.product_id) {
          // Specific product discount
          const item = cart.find(i => i.id === coupon.product_id);
          if (item) {
              const priceVal = parseFloat(item.price.replace(/[^0-9.]/g, ''));
              const itemTotal = priceVal * item.quantity;
              discount = itemTotal * (coupon.discount_percent / 100);
          } else {
              // Item removed from cart, invalidate discount but keep coupon state valid? 
              // Better to show 0 discount or auto-remove. Let's show 0.
              discount = 0;
          }
      } else {
          // Global discount
          discount = cartTotal * (coupon.discount_percent / 100);
      }
      setDiscountAmount(discount);
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    
    if (!code) return;

    setIsVerifyingCoupon(true);

    try {
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', code)
            .single();

        if (error || !data) {
            setCouponError('Invalid coupon code');
            setAppliedCoupon(null);
        } else {
            // Check if applicable
            if (data.product_id) {
                const hasItem = cart.some(i => i.id === data.product_id);
                if (!hasItem) {
                    setCouponError('This code applies to items not in your cart');
                    setIsVerifyingCoupon(false);
                    return;
                }
            }
            setAppliedCoupon(data);
            calculateDiscount(data);
            setCouponCode('');
        }
    } catch (err) {
        setCouponError('Error verifying coupon');
    } finally {
        setIsVerifyingCoupon(false);
    }
  };

  const removeCoupon = () => {
      setAppliedCoupon(null);
      setDiscountAmount(0);
  };

  const finalTotal = Math.max(0, cartTotal - discountAmount);

  // Card Detection Logic
  const detectCardType = (number: string) => {
    const clean = number.replace(/\D/g, '');
    if (clean.match(/^4/)) return 'visa';
    if (clean.match(/^5[1-5]/)) return 'mastercard';
    if (clean.match(/^3[47]/)) return 'amex';
    if (clean.match(/^62/)) return 'unionpay';
    if (clean.match(/^6(?:011|5)/)) return 'discover';
    return 'unknown';
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
        return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Only allow numbers and spaces
      if (!/^[0-9\s]*$/.test(raw)) return;
      
      const formatted = formatCardNumber(raw);
      setCardNumber(formatted);
      setCardBrand(detectCardType(formatted));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val.length < expiry.length) {
          // Allow backspace
          setExpiry(val);
          return;
      }
      if (val.length > 5) return;
      setExpiry(formatExpiry(val));
  };

  const getCardLogo = () => {
    const baseClass = "h-6 object-contain transition-all duration-300";
    switch (cardBrand) {
        case 'visa':
            return <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className={baseClass} />;
        case 'mastercard':
            return <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className={baseClass} />;
        case 'amex':
            return <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg" alt="Amex" className={baseClass} />;
        case 'discover':
            return <img src="https://upload.wikimedia.org/wikipedia/commons/5/57/Discover_Card_logo.svg" alt="Discover" className={baseClass} />;
        case 'unionpay':
            return <img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/UnionPay_logo.svg" alt="UnionPay" className={baseClass} />;
        default:
            return <CreditCard className="text-slate-400" />;
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const orderDetails = cart.map(item => `${item.name} (x${item.quantity})`).join(', ');
    
    const discountNote = appliedCoupon ? ` | Coupon: ${appliedCoupon.code} (-$${discountAmount.toFixed(2)})` : '';

    let paymentLabel = '';
    if (paymentMethod === 'card') paymentLabel = `Credit Card (${cardBrand.toUpperCase()} ending ${cardNumber.slice(-4)})`;
    else if (paymentMethod === 'jazzcash') paymentLabel = 'JazzCash (Manual)';
    else paymentLabel = 'PayPal';

    // 1. Submit to Sheet
    const orderData = {
        'Full Name': fullName,
        'Email Address': email,
        'Requesting Service': 'Order',
        'Message': `Order ID: ${orderId}. Address: ${address}, ${city}, ${zip}. 
                   Payment: ${paymentLabel}. 
                   Order: ${orderDetails}. 
                   Total: $${finalTotal.toFixed(2)}${discountNote}`
    };

    await submitToGoogleSheet('Services', orderData);

    // 2. Send Email via Google Script (Acts as SMTP)
    await sendOrderEmail({
      fullName,
      email,
      details: orderDetails,
      total: `$${finalTotal.toFixed(2)}`,
      paymentMethod: paymentLabel,
      orderId
    });

    // 3. Save to Supabase (For "My Orders" history)
    if (isAuthenticated && user) {
        const { error } = await supabase.from('orders').insert([{
            user_id: user.id,
            items: cart, // Store full cart array including blurred items
            total: finalTotal,
            status: paymentMethod === 'card' || paymentMethod === 'paypal' ? 'Paid' : 'Pending Verification'
        }]);
        if (error) {
            console.error("Failed to save order to history:", error);
        }
    }

    setTimeout(() => {
        setIsProcessing(false);
        setOrderComplete(true);
        clearCart();
        setAppliedCoupon(null);
        setDiscountAmount(0);
    }, 2000); 
  };

  if (orderComplete) {
    return (
        <div className="min-h-screen pt-24 pb-20 bg-spirit-50 flex items-center justify-center px-4">
            <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg w-full animate-fade-in-up">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CircleCheck className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-spirit-900 mb-4">Order Placed!</h2>
                <p className="text-slate-600 mb-8 leading-relaxed">
                    Thank you, <span className="font-bold text-spirit-900">{fullName}</span>. 
                    {paymentMethod === 'jazzcash' 
                        ? ' Your order has been placed. Please complete your JazzCash transfer to confirm.' 
                        : ' Your payment was successful.'}
                    <br/><br/>
                    <span className="bg-green-50 text-green-800 text-sm font-bold px-3 py-1 rounded-full">
                       ✓ A confirmation email has been sent to {email}
                    </span>
                </p>
                <div className="flex flex-col gap-3">
                    {isAuthenticated && (
                        <Link to="/orders" className="inline-flex items-center justify-center bg-spirit-900 text-white font-bold py-4 px-10 rounded-xl hover:bg-accent-600 transition shadow-lg w-full">
                            View My Orders
                        </Link>
                    )}
                    <Link to="/" className="inline-flex items-center justify-center bg-white text-spirit-900 font-bold py-4 px-10 rounded-xl border-2 border-spirit-100 hover:bg-spirit-50 transition w-full">
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-spirit-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif font-bold text-spirit-900 mb-8 flex items-center">
            <ShoppingBag className="mr-4" /> {isCheckout ? 'Secure Checkout' : 'Your Cart'}
        </h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 mb-8">Looks like you haven't added any spiritual essentials yet.</p>
            <Link to="/" className="inline-flex items-center text-accent-600 font-bold hover:underline">
                Continue Shopping <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Column: Cart Items OR Shipping/Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {!isCheckout ? (
                  // Cart Item List (Standard View)
                  cart.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-6 animate-fade-in">
                      <div className="w-24 h-24 bg-spirit-50 rounded-xl overflow-hidden shrink-0 relative">
                        <img 
                            src={item.image} 
                            alt={item.name} 
                            className={`w-full h-full object-cover ${item.isBlurBeforeBuy ? 'blur-[2px]' : ''}`} 
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-serif font-bold text-lg text-spirit-900 mb-1">{item.name}</h3>
                        <p className="text-slate-500 text-sm mb-4">{item.category}</p>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center bg-slate-50 rounded-lg p-1">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-white rounded-md transition"><Minus size={14}/></button>
                                <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-white rounded-md transition"><Plus size={14}/></button>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500 transition"><Trash2 size={18} /></button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-spirit-900">{item.price}</p>
                      </div>
                    </div>
                  ))
              ) : (
                  // Detailed Checkout Form
                  <form id="checkout-form" onSubmit={handleCheckout} className="space-y-8 animate-fade-in">
                      
                      {/* Section 1: Shipping Details */}
                      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                          <h3 className="text-xl font-serif font-bold text-spirit-900 mb-6 flex items-center">
                              <span className="bg-spirit-100 text-spirit-800 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">1</span>
                              Shipping Information
                          </h3>
                          <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                                    <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition" placeholder="e.g. Samuel Jackson" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
                                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition" placeholder="e.g. sam@gmail.com" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Street Address</label>
                                    <input required type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition" placeholder="123 Spiritual Lane" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">City</label>
                                        <input required type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition" placeholder="New York" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Zip Code</label>
                                        <input required type="text" value={zip} onChange={e => setZip(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition" placeholder="10001" />
                                    </div>
                                </div>
                          </div>
                      </div>

                      {/* Section 2: Payment Details */}
                      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                          <h3 className="text-xl font-serif font-bold text-spirit-900 mb-6 flex items-center">
                              <span className="bg-spirit-100 text-spirit-800 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">2</span>
                              Payment Method
                          </h3>
                          
                          {/* Payment Selector */}
                          <div className="flex gap-4 mb-6">
                              <button 
                                type="button"
                                onClick={() => setPaymentMethod('card')}
                                className={`flex-1 py-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'card' ? 'border-accent-500 bg-accent-50 text-accent-700' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}
                              >
                                  <CreditCard size={24} />
                                  <span className="text-sm font-bold">Credit Card</span>
                              </button>
                              <button 
                                type="button"
                                onClick={() => setPaymentMethod('paypal')}
                                className={`flex-1 py-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}
                              >
                                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M7.076 21.337l.756-4.728 6.506-1.376c2.518-.62 5.035-2.915 5.035-6.19 0-3.35-1.745-6.315-5.322-6.315H4.825a.89.89 0 00-.889.775L2.001 21.05a.44.44 0 00.438.517h3.915a.73.73 0 00.722-.23z"/></svg>
                                  <span className="text-sm font-bold">PayPal</span>
                              </button>
                              <button 
                                type="button"
                                onClick={() => setPaymentMethod('jazzcash')}
                                className={`flex-1 py-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'jazzcash' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}
                              >
                                  <Smartphone size={24} />
                                  <span className="text-sm font-bold">JazzCash</span>
                              </button>
                          </div>

                          {paymentMethod === 'card' && (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Cardholder Name</label>
                                    <input required type="text" value={cardName} onChange={e => setCardName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition" placeholder="Name on Card" />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Card Number</label>
                                    <div className="relative">
                                        <input 
                                            required 
                                            type="text" 
                                            value={cardNumber} 
                                            onChange={handleCardChange}
                                            maxLength={23}
                                            className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition" 
                                            placeholder="0000 0000 0000 0000" 
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            {getCardLogo()}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Expiry Date</label>
                                        <input required type="text" value={expiry} onChange={handleExpiryChange} maxLength={5} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition" placeholder="MM/YY" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">CVC / CVV</label>
                                        <input required type="text" value={cvc} onChange={e => setCvc(e.target.value.replace(/\D/g, ''))} maxLength={4} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition" placeholder="123" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                                    <ShieldCheck size={14} className="text-green-500" />
                                    <span>Payments are SSL encrypted and secured.</span>
                                </div>
                            </div>
                          )}
                          
                          {paymentMethod === 'paypal' && (
                              <div className="bg-blue-50 text-blue-800 p-6 rounded-xl text-center animate-fade-in">
                                  <p className="font-bold mb-2">Redirect to PayPal</p>
                                  <p className="text-sm">You will be redirected to PayPal to securely complete your payment.</p>
                              </div>
                          )}

                          {paymentMethod === 'jazzcash' && (
                              <div className="bg-red-50 border border-red-100 text-red-900 p-6 rounded-xl text-center animate-fade-in">
                                  <div className="mb-4 flex justify-center"><Smartphone className="w-10 h-10 text-red-600" /></div>
                                  <p className="font-serif font-bold text-lg mb-4">JazzCash Payment Instructions</p>
                                  <p className="text-sm mb-6 leading-relaxed">
                                      You can pay through Jazzcash. Make advance payment in the following account and share the screenshot on same number.
                                  </p>
                                  <div className="bg-white p-5 rounded-xl border border-red-100 shadow-sm inline-block text-left w-full">
                                      <div className="flex justify-between items-center mb-2 border-b border-dashed border-red-200 pb-2">
                                          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Our Account Till ID</span>
                                          <span className="font-mono font-bold text-lg text-red-700">982408323</span>
                                      </div>
                                      <div className="flex justify-between items-center pt-2">
                                          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Account Title</span>
                                          <span className="font-bold text-slate-800">Jaadu Ki Kaat</span>
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>
                  </form>
              )}
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 sticky top-28">
                <h3 className="font-serif font-bold text-2xl text-spirit-900 mb-6">Order Summary</h3>
                
                {isCheckout && (
                    <div className="mb-4 space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar border-b border-slate-100 pb-4 pt-2 px-1 animate-fade-in">
                        {cart.map(item => (
                            <div key={item.id} className="flex gap-4 items-center group">
                                <div className="relative w-14 h-14 bg-white border border-slate-200 rounded-xl p-1 shadow-sm shrink-0">
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover rounded-lg" 
                                    />
                                    <div className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md z-10 border-2 border-white">
                                        {item.quantity}
                                    </div>
                                </div>
                                <div className="flex-grow min-w-0">
                                    <h4 className="font-bold text-slate-800 text-base truncate">{item.name}</h4>
                                    <p className="text-sm text-slate-500 truncate mt-0.5">{item.category}</p>
                                </div>
                                <div className="text-base font-bold text-slate-800 whitespace-nowrap">
                                    {item.price}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Coupon Code Section */}
                <div className="mb-4 pb-4 border-b border-slate-100">
                    {appliedCoupon ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex justify-between items-center animate-fade-in">
                            <div className="flex items-center gap-2">
                                <Ticket size={14} className="text-green-600" />
                                <div>
                                    <p className="text-xs font-bold text-green-800 uppercase tracking-wider">Coupon Applied</p>
                                    <p className="text-sm font-bold text-green-700">{appliedCoupon.code}</p>
                                </div>
                            </div>
                            <button onClick={removeCoupon} className="text-green-500 hover:text-red-500 transition">
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div>
                            <form onSubmit={handleApplyCoupon} className="flex gap-2">
                                <div className="relative flex-grow">
                                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input 
                                        type="text" 
                                        placeholder="Discount code" 
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="w-full pl-9 pr-2 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-spirit-500 outline-none uppercase font-bold placeholder-slate-400 transition"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={!couponCode || isVerifyingCoupon}
                                    className="bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-300 transition disabled:opacity-50"
                                >
                                    {isVerifyingCoupon ? <Loader2 className="animate-spin w-3 h-3" /> : 'Apply'}
                                </button>
                            </form>
                            {couponError && <p className="text-xs text-red-500 mt-1 ml-1 font-bold">{couponError}</p>}
                        </div>
                    )}
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b border-slate-100">
                    <div className="flex justify-between text-slate-600 text-base">
                        <span>Subtotal</span>
                        <span className="font-bold text-slate-800">${cartTotal.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                        <div className="flex justify-between text-green-600 animate-fade-in text-base">
                            <span className="flex items-center gap-1"><Ticket size={16}/> Discount</span>
                            <span className="font-bold">-${discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-slate-600 text-base">
                        <span>Shipping</span>
                        <span className="font-bold text-green-600">Free</span>
                    </div>
                </div>
                
                <div className="flex justify-between text-3xl font-bold text-spirit-900 mb-6">
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                </div>

                {!isCheckout ? (
                    <button 
                        onClick={() => setIsCheckout(true)}
                        className="w-full bg-accent-500 text-white font-bold py-4 rounded-xl hover:bg-accent-600 transition shadow-lg flex items-center justify-center gap-2"
                    >
                        Proceed to Checkout <ArrowRight size={20} />
                    </button>
                ) : (
                    <>
                        <button 
                            type="submit" 
                            form="checkout-form"
                            disabled={isProcessing} 
                            className="w-full bg-spirit-900 text-white font-bold py-4 rounded-xl hover:bg-spirit-800 transition shadow-lg flex items-center justify-center gap-2"
                        >
                            {isProcessing ? <Loader2 className="animate-spin" /> : <Lock size={18} />}
                            {isProcessing ? 'Processing...' : paymentMethod === 'jazzcash' ? 'Confirm Payment' : `Pay $${finalTotal.toFixed(2)}`}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setIsCheckout(false)} 
                            disabled={isProcessing}
                            className="w-full text-slate-500 text-sm font-bold hover:text-spirit-900 py-3 mt-2"
                        >
                            Back to Cart
                        </button>
                    </>
                )}

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest">
                    <Lock size={14} />
                    <span>Secure Encrypted Checkout</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Info Popup - Appears after 5 seconds */}
      {showInfoPopup && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 animate-fade-in">
           <div className="absolute inset-0 bg-spirit-900/60 backdrop-blur-sm" onClick={() => setShowInfoPopup(false)}></div>
           <div className="bg-white rounded-2xl p-8 max-w-md w-full relative z-10 shadow-2xl border border-slate-100 animate-fade-in-up text-center">
                <button 
                    onClick={() => setShowInfoPopup(false)} 
                    className="absolute top-4 right-4 text-slate-400 hover:text-spirit-900 transition-colors"
                >
                    <X size={20} />
                </button>
                <div className="w-16 h-16 bg-accent-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-accent-600" />
                </div>
                <h3 className="text-xl font-serif font-bold text-spirit-900 mb-3">Delivery Information</h3>
                <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                    Your order will be delivered through <strong>WhatsApp</strong> or <strong>Email</strong>. 
                    Our spiritual team will reach out to you within a single working day to confirm details and provide guidance.
                </p>
                <button 
                    onClick={() => setShowInfoPopup(false)}
                    className="bg-spirit-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-spirit-800 transition w-full"
                >
                    Understood
                </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
