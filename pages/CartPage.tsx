
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Lock, CircleCheck, Loader2, LogIn, CreditCard, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { submitToGoogleSheet, sendOrderEmail } from '../services/sheetService';

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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardBrand, setCardBrand] = useState<string>('unknown');

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Auto-fill user details if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
        setFullName(user.name || '');
        setEmail(user.email || '');
    }
  }, [isAuthenticated, user]);

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

    // 1. Submit to Sheet
    const orderData = {
        'Full Name': fullName,
        'Email Address': email,
        'Requesting Service': 'Order',
        'Message': `Order ID: ${orderId}. Address: ${address}, ${city}, ${zip}. 
                   Payment: ${paymentMethod.toUpperCase()} (${cardBrand.toUpperCase()} ending ${cardNumber.slice(-4)}). 
                   Order: ${orderDetails}. 
                   Total: $${cartTotal.toFixed(2)}`
    };

    await submitToGoogleSheet('Services', orderData);

    // 2. Send Email via Google Script (Acts as SMTP)
    await sendOrderEmail({
      fullName,
      email,
      details: orderDetails,
      total: `$${cartTotal.toFixed(2)}`,
      paymentMethod: paymentMethod === 'card' ? `Credit Card (${cardBrand.toUpperCase()})` : 'PayPal',
      orderId
    });

    setTimeout(() => {
        setIsProcessing(false);
        setOrderComplete(true);
        clearCart();
    }, 2000); 
  };

  if (orderComplete) {
    return (
        <div className="min-h-screen pt-24 pb-20 bg-spirit-50 flex items-center justify-center px-4">
            <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg w-full animate-fade-in-up">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CircleCheck className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-spirit-900 mb-4">Payment Successful!</h2>
                <p className="text-slate-600 mb-8 leading-relaxed">
                    Thank you, <span className="font-bold text-spirit-900">{fullName}</span>. Your order has been placed. 
                    <br/><br/>
                    <span className="bg-green-50 text-green-800 text-sm font-bold px-3 py-1 rounded-full">
                       ✓ A confirmation email has been sent to {email}
                    </span>
                </p>
                <Link to="/" className="inline-flex items-center justify-center bg-spirit-900 text-white font-bold py-4 px-10 rounded-xl hover:bg-accent-600 transition shadow-lg w-full">
                    Return Home
                </Link>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-spirit-50">
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
                  // Cart Item List
                  cart.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-6 animate-fade-in">
                      <div className="w-24 h-24 bg-spirit-50 rounded-xl overflow-hidden shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
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
                          </div>

                          {paymentMethod === 'card' ? (
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
                          ) : (
                              <div className="bg-blue-50 text-blue-800 p-6 rounded-xl text-center">
                                  <p className="font-bold mb-2">Redirect to PayPal</p>
                                  <p className="text-sm">You will be redirected to PayPal to securely complete your payment.</p>
                              </div>
                          )}
                      </div>
                  </form>
              )}
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 sticky top-28">
                <h3 className="font-serif font-bold text-xl text-spirit-900 mb-6">Order Summary</h3>
                
                {isCheckout && (
                    <div className="mb-6 space-y-3 max-h-48 overflow-y-auto custom-scrollbar border-b border-slate-100 pb-4">
                        {cart.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-slate-600">{item.name} <span className="text-xs text-slate-400">x{item.quantity}</span></span>
                                <span className="font-bold text-slate-800">{item.price}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="space-y-3 mb-6 pb-6 border-b border-slate-100">
                    <div className="flex justify-between text-slate-600">
                        <span>Subtotal</span>
                        <span className="font-bold">${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                        <span>Shipping</span>
                        <span className="font-bold text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                        <span>Taxes (Estimated)</span>
                        <span className="font-bold">$0.00</span>
                    </div>
                </div>
                
                <div className="flex justify-between text-xl font-bold text-spirit-900 mb-8">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                </div>

                {!isAuthenticated ? (
                    <div className="space-y-3">
                         <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl text-sm mb-2 flex items-start gap-2">
                            <Lock size={16} className="mt-0.5 shrink-0" />
                            <span>Please login to complete your secure checkout.</span>
                         </div>
                         <Link 
                            to="/login"
                            state={{ from: location }}
                            className="w-full bg-spirit-900 text-white font-bold py-4 rounded-xl hover:bg-spirit-800 transition shadow-lg flex items-center justify-center gap-2"
                        >
                            <LogIn size={20} /> Login to Checkout
                        </Link>
                    </div>
                ) : !isCheckout ? (
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
                            {isProcessing ? 'Processing...' : `Pay $${cartTotal.toFixed(2)}`}
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

                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <Lock size={12} />
                    <span>Secure Encrypted Checkout</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
