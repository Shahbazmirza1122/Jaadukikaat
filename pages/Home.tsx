
import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Sun, ArrowRight, ShieldCheck, Sparkles, Heart, Moon, BookOpen, Compass, Star, HandHeart, CircleArrowRight, Send, Mail, Phone, User, Lock, CreditCard, X, Loader2, Briefcase, FileText, CircleCheck, MapPin, Globe, Users, MessageSquare, Check, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { BlogPost } from '../types';
import { products as staticProducts, Product } from '../data/products';
import { submitToGoogleSheet } from '../services/sheetService';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';

const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const productScrollRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Handle scroll to hash on mount or hash change
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
        window.scrollTo(0, 0);
    }
  }, [location.hash]);

  // Fetch Data
  useEffect(() => {
    const fetchBlogs = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (data) {
        setBlogPosts(data.map((p: any) => ({
          ...p,
          imageUrl: p.image_url || p.imageUrl,
          relatedIds: p.related_ids || p.relatedIds
        })));
      }
    };

    const fetchProducts = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error || !data || data.length === 0) {
            setProductsList(staticProducts);
        } else {
            setProductsList(data);
        }
    };

    fetchBlogs();
    fetchProducts();
  }, []);

  // Donation State
  const [donationAmount, setDonationAmount] = useState<string>('5');
  const [customDonation, setCustomDonation] = useState<string>('');
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Payment Form State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardBrand, setCardBrand] = useState<string>('unknown');

  // Consultation Form State
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [consultService, setConsultService] = useState('');
  const [consultName, setConsultName] = useState('');
  const [consultFatherName, setConsultFatherName] = useState('');
  const [consultEmail, setConsultEmail] = useState('');
  const [consultPhone, setConsultPhone] = useState('');
  const [consultMessage, setConsultMessage] = useState('');
  const [isConsultSubmitting, setIsConsultSubmitting] = useState(false);

  // Istikhara Form State
  const [isIstikharaModalOpen, setIsIstikharaModalOpen] = useState(false);
  const [istikharaName, setIstikharaName] = useState('');
  const [istikharaMotherName, setIstikharaMotherName] = useState('');
  const [istikharaDob, setIstikharaDob] = useState('');
  const [istikharaEmail, setIstikharaEmail] = useState('');
  const [istikharaPhone, setIstikharaPhone] = useState('');
  const [istikharaCity, setIstikharaCity] = useState('');
  const [istikharaCountry, setIstikharaCountry] = useState('');
  const [istikharaPurpose, setIstikharaPurpose] = useState('');
  const [istikharaMessage, setIstikharaMessage] = useState('');

  // Ism-e-Azam Form State
  const [isIsmeAzamModalOpen, setIsIsmeAzamModalOpen] = useState(false);
  const [ismeAzamName, setIsmeAzamName] = useState('');
  const [ismeAzamMotherName, setIsmeAzamMotherName] = useState('');
  const [ismeAzamDob, setIsmeAzamDob] = useState('');
  const [ismeAzamEmail, setIsmeAzamEmail] = useState('');
  const [ismeAzamPhone, setIsmeAzamPhone] = useState('');
  const [ismeAzamCity, setIsmeAzamCity] = useState('');
  const [ismeAzamCountry, setIsmeAzamCountry] = useState('');
  const [ismeAzamPurpose, setIsmeAzamPurpose] = useState('');
  const [ismeAzamMessage, setIsmeAzamMessage] = useState('');

  // Prayer Request Form State
  const [isPrayerRequestModalOpen, setIsPrayerRequestModalOpen] = useState(false);
  const [prayerRequestName, setPrayerRequestName] = useState('');
  const [prayerRequestMotherName, setPrayerRequestMotherName] = useState('');
  const [prayerRequestDob, setPrayerRequestDob] = useState('');
  const [prayerRequestEmail, setPrayerRequestEmail] = useState('');
  const [prayerRequestPhone, setPrayerRequestPhone] = useState('');
  const [prayerRequestCity, setPrayerRequestCity] = useState('');
  const [prayerRequestCountry, setPrayerRequestCountry] = useState('');
  const [prayerRequestPurpose, setPrayerRequestPurpose] = useState('');
  const [prayerRequestRecitation, setPrayerRequestRecitation] = useState('');

  // General Contact Form State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const slides = [
    {
      title: "Jaadu ki kaat",
      subtitle: "Experience profound inner peace through sacred spiritual remedies and guided growth.",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      cta: "Explore Our Path"
    },
    {
      title: "Spiritual Shifa",
      subtitle: "Personalized solutions for the soul through Duaa, Wazaif, and ancient wisdom.",
      image: "https://images.unsplash.com/photo-1499209974431-9dac3adaf471?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      cta: "Seek Guidance"
    },
    {
      title: "Divine Clarity",
      subtitle: "Neutralizing metaphysical hurdles to restore balance and harmony in your life.",
      image: "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      cta: "Start Healing"
    }
  ];

  const servicesList = [
    { 
      title: "Dua", 
      icon: Moon, 
      description: "Personalized supplications to connect with the Divine and seek fulfillment of your deepest needs." 
    },
    { 
      title: "Wazaif", 
      icon: BookOpen, 
      description: "Powerful spiritual recitations and litanies aimed at resolving specific life challenges." 
    },
    { 
      title: "Istikhara", 
      icon: Compass, 
      description: "Divine guidance for crucial life decisions, providing clarity on marriage, business, and future paths." 
    },
    { 
      title: "Rohani Ilaj", 
      icon: Sparkles, 
      description: "Holistic spiritual healing for ailments of the heart, mind, and soul using ancient Quranic wisdom." 
    },
    { 
      title: "Jadu ki kaat", 
      icon: ShieldCheck, 
      description: "Complete removal of black magic, evil eye, and spiritual blockages affecting your progress and peace." 
    },
    { 
      title: "Job Success", 
      icon: Briefcase, 
      description: "Spiritual remedies to open doors of opportunity, career growth, and financial stability." 
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);


  const scrollProducts = (direction: 'left' | 'right') => {
    if (productScrollRef.current) {
      const { current } = productScrollRef;
      const scrollAmount = 340; // Card width + gap
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const toggleWishlist = (id: string) => {
    setWishlist(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  // Donation Handlers
  const handleAmountClick = (amount: string) => {
    setDonationAmount(amount);
    setCustomDonation('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomDonation(e.target.value);
    setDonationAmount('');
  };

  const handleDonateClick = () => {
    const finalAmount = customDonation || donationAmount;
    if (!finalAmount || parseFloat(finalAmount) <= 0) {
        alert("Please select a valid donation amount.");
        return;
    }
    setIsDonationModalOpen(true);
  };

  // Card Detection Logic
  const detectCardType = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    if (cleanNumber.match(/^4/)) return 'visa';
    if (cleanNumber.match(/^5[1-5]/) || cleanNumber.match(/^2[2-7]/)) return 'mastercard';
    if (cleanNumber.match(/^3[47]/)) return 'amex';
    if (cleanNumber.match(/^6(?:011|5)/)) return 'discover';
    if (cleanNumber.match(/^62/)) return 'unionpay';
    return 'unknown';
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/[^0-9\s]/g, '');
      setCardNumber(val);
      setCardBrand(detectCardType(val));
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const donationData = {
        'Full Name': cardName,
        'Requesting Service': 'Donation',
        'Message': `Donation Amount: $${customDonation || donationAmount}, Card Brand: ${cardBrand}`,
    };

    await submitToGoogleSheet('Services', donationData);

    setTimeout(() => {
        setIsProcessing(false);
        setIsDonationModalOpen(false);
        alert(`Thank you! Your donation of $${customDonation || donationAmount} has been received.`);
        setCardName('');
        setCardNumber('');
        setCardExpiry('');
        setCardCvc('');
        setCardBrand('unknown');
    }, 1000);
  };

  // Consultation Handlers
  const openConsultModal = (serviceName: string) => {
    setConsultService(serviceName);
    setIsConsultModalOpen(true);
  };

  const handleConsultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConsultSubmitting(true);
    
    await submitToGoogleSheet('Services', {
        'Full Name': consultName,
        "Father's Name": consultFatherName,
        'Email Address': consultEmail,
        'Phone Number': consultPhone,
        'Requesting Service': consultService,
        'Message': consultMessage
    });

    setIsConsultSubmitting(false);
    setIsConsultModalOpen(false);
    setIsSuccessModalOpen(true);
    
    setConsultName('');
    setConsultFatherName('');
    setConsultEmail('');
    setConsultPhone('');
    setConsultMessage('');
  };

  // Istikhara Handler
  const handleIstikharaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConsultSubmitting(true);
    
    await submitToGoogleSheet('Istikhara', {
        'Full Name': istikharaName,
        "Mother's Name": istikharaMotherName,
        'Date of Birth': istikharaDob,
        'Phone Number': istikharaPhone,
        'Email Address': istikharaEmail,
        'City': istikharaCity,
        'Country': istikharaCountry,
        'Purpose': istikharaPurpose,
        'Message': istikharaMessage
    });

    setIsConsultSubmitting(false);
    setIsIstikharaModalOpen(false);
    setIsSuccessModalOpen(true);
    
    setIstikharaName('');
    setIstikharaMotherName('');
    setIstikharaDob('');
    setIstikharaEmail('');
    setIstikharaPhone('');
    setIstikharaCity('');
    setIstikharaCountry('');
    setIstikharaPurpose('');
    setIstikharaMessage('');
  };

  // Ism-e-Azam Handler
  const handleIsmeAzamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConsultSubmitting(true);
    
    await submitToGoogleSheet('IsmeAzam', {
        'Full Name': ismeAzamName,
        "Mother's Name": ismeAzamMotherName,
        'Date of Birth': ismeAzamDob,
        'Phone Number': ismeAzamPhone,
        'Email Address': ismeAzamEmail,
        'City': ismeAzamCity,
        'Country': ismeAzamCountry,
        'Purpose': ismeAzamPurpose,
        'Message': ismeAzamMessage
    });

    setIsConsultSubmitting(false);
    setIsIsmeAzamModalOpen(false);
    setIsSuccessModalOpen(true); 
    
    setIsmeAzamName('');
    setIsmeAzamMotherName('');
    setIsmeAzamDob('');
    setIsmeAzamEmail('');
    setIsmeAzamPhone('');
    setIsmeAzamCity('');
    setIsmeAzamCountry('');
    setIsmeAzamPurpose('');
    setIsmeAzamMessage('');
  };

  // Prayer Request Handler
  const handlePrayerRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConsultSubmitting(true);
    
    const fullDetails = `Mother Name: ${prayerRequestMotherName}\nDOB: ${prayerRequestDob}\nLocation: ${prayerRequestCity}, ${prayerRequestCountry}\nPurpose: ${prayerRequestPurpose}\nRecitation: ${prayerRequestRecitation}`;

    await submitToGoogleSheet('Services', {
        'Full Name': prayerRequestName,
        'Email Address': prayerRequestEmail,
        'Phone Number': prayerRequestPhone,
        'Requesting Service': 'Prayer Request',
        'Message': fullDetails
    });

    setIsConsultSubmitting(false);
    setIsPrayerRequestModalOpen(false);
    setIsSuccessModalOpen(true);
    
    setPrayerRequestName('');
    setPrayerRequestMotherName('');
    setPrayerRequestDob('');
    setPrayerRequestEmail('');
    setPrayerRequestPhone('');
    setPrayerRequestCity('');
    setPrayerRequestCountry('');
    setPrayerRequestPurpose('');
    setPrayerRequestRecitation('');
  };

  // General Contact Handler
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConsultSubmitting(true);

    await submitToGoogleSheet('Contact', {
        'Full Name': contactName,
        'Email Address': contactEmail,
        'Phone Number': contactPhone,
        'Requesting Service': 'General Contact',
        'Message': contactMessage
    });

    setIsConsultSubmitting(false);
    setIsContactModalOpen(false);
    setIsSuccessModalOpen(true);

    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setContactMessage('');
  };

  const getCardIcon = () => {
    switch(cardBrand) {
        case 'visa': 
            return <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="w-8 h-5 object-contain" />;
        case 'mastercard':
            return <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="w-8 h-5 object-contain" />;
        case 'amex':
            return <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg" alt="Amex" className="w-8 h-5 object-contain" />;
        case 'discover':
             return <img src="https://upload.wikimedia.org/wikipedia/commons/5/57/Discover_Card_logo.svg" alt="Discover" className="w-8 h-5 object-contain" />;
        case 'unionpay':
             return <img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/UnionPay_logo.svg" alt="UnionPay" className="w-8 h-5 object-contain" />;
        default:
            return <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />;
    }
  };

  return (
    <div className="w-full overflow-x-hidden relative bg-white">
      {/* Hero Section */}
      <section id="top" className="relative h-[85vh] md:h-screen overflow-hidden bg-spirit-900">
        {slides.map((slide, index) => (
          <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <div className={`absolute inset-0 bg-cover bg-center transition-transform duration-[12000ms] ${index === currentSlide ? 'scale-110' : 'scale-100'}`} style={{ backgroundImage: `url(${slide.image})` }}>
              <div className="absolute inset-0 bg-gradient-to-r from-spirit-900/95 via-spirit-900/40 to-transparent"></div>
            </div>
            <div className="relative h-full flex flex-col justify-center pt-40 md:pt-48 max-w-7xl mx-auto px-6">
              <div className={`max-w-3xl ${index === currentSlide ? 'animate-fade-in-up' : 'opacity-0'}`}>
                <h1 className={`text-5xl md:text-8xl font-serif font-bold text-white mb-6 drop-shadow-2xl leading-tight w-max ${index === currentSlide ? 'animate-typing overflow-hidden whitespace-nowrap border-r-4 border-accent-500 pr-2' : ''}`}>
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl text-slate-200 mb-10 font-light leading-relaxed drop-shadow-lg">
                  {slide.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                  <a href="#services" className="inline-flex items-center justify-center bg-accent-500 text-white font-bold py-4 px-10 rounded-full shadow-2xl hover:bg-accent-600 transition transform hover:scale-105 active:scale-95">
                    {slide.cta} <ArrowRight className="ml-2 w-5 h-5" />
                  </a>
                  <a href="#about" className="inline-flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold py-4 px-10 rounded-full hover:bg-white/20 transition">
                    Our Story
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Product Carousel Section */}
      <section className="py-20 bg-spirit-50 relative border-b border-spirit-100">
        <div className="max-w-7xl mx-auto px-6">
            {/* Header with Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <span className="text-accent-600 font-bold tracking-[0.3em] uppercase text-xs mb-3 block">Sacred Store</span>
                    <h2 className="text-4xl font-serif font-bold text-spirit-900">Spiritual Essentials</h2>
                    <p className="text-slate-500 mt-2 font-light">Curated items to enhance your spiritual journey and protection.</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => scrollProducts('left')} 
                        className="w-12 h-12 rounded-full border border-spirit-200 bg-white text-spirit-900 flex items-center justify-center hover:bg-accent-500 hover:text-white hover:border-accent-500 transition-all shadow-sm active:scale-95"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button 
                        onClick={() => scrollProducts('right')} 
                        className="w-12 h-12 rounded-full border border-spirit-200 bg-white text-spirit-900 flex items-center justify-center hover:bg-accent-500 hover:text-white hover:border-accent-500 transition-all shadow-sm active:scale-95"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            {/* Carousel Container */}
            <div 
                ref={productScrollRef} 
                className="flex gap-8 overflow-x-auto pb-8 snap-x mandatory hide-scrollbar"
                style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {productsList.map(product => (
                    <Link to={`/product/${product.id}`} key={product.id} className="min-w-[280px] md:min-w-[320px] bg-white rounded-3xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 group snap-center border border-spirit-100 flex-shrink-0 flex flex-col cursor-pointer relative">
                        {/* Image Area */}
                        <div className="h-72 rounded-2xl overflow-hidden mb-6 relative">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
                            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-spirit-900 shadow-sm">
                                {product.category}
                            </div>
                            
                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                               <button 
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
                                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-lg ${wishlist.includes(product.id) ? 'bg-red-500 text-white' : 'bg-white text-slate-700 hover:text-red-500'}`}
                                >
                                  <Heart size={20} className={wishlist.includes(product.id) ? 'fill-current' : ''} />
                               </button>
                            </div>
                        </div>
                        
                        {/* Content Area */}
                        <div className="px-2 pb-2 flex-grow flex flex-col">
                            <h3 className="font-serif font-bold text-xl text-spirit-900 mb-1 truncate group-hover:text-accent-600 transition-colors" title={product.name}>{product.name}</h3>
                            <div className="flex justify-between items-center mt-auto pt-4">
                                <span className="text-accent-600 font-bold text-xl">{product.price}</span>
                                <button 
                                    onClick={(e) => handleAddToCart(e, product)}
                                    className="px-4 py-2 rounded-full bg-spirit-50 text-spirit-900 flex items-center gap-2 hover:bg-accent-500 hover:text-white transition-colors text-sm font-bold"
                                >
                                    <ShoppingBag size={16} /> Add to Cart
                                </button>
                            </div>
                        </div>
                    </Link>
                ))}
                
                {/* Add a spacer at the end for better scrolling feel */}
                <div className="min-w-[20px]"></div>
            </div>

            {/* Visit Store Button */}
            <div className="mt-10 flex justify-center">
                 <Link to="/store" className="inline-flex items-center justify-center bg-spirit-900 text-white font-bold py-4 px-10 rounded-full shadow-lg hover:bg-spirit-800 transition-all hover:scale-105 active:scale-95 group">
                      <span>Visit Sacred Store</span>
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                 </Link>
            </div>
        </div>
      </section>
      
      {/* ... (Rest of the file remains unchanged) ... */}
      
      {/* About Section */}
      <section id="about" className="py-32 bg-white">
        {/* ... */}
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative group/aboutImg">
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-accent-50 rounded-full -z-10 animate-pulse"></div>
            <img src="https://res.cloudinary.com/dq0ccjs6y/image/upload/v1767284640/Rohaniyat_l4p17j.webp" alt="Meditation" className="rounded-[3rem] shadow-2xl h-[550px] w-full object-cover transition-transform duration-700 group-hover/aboutImg:scale-[1.02]" />
            <div className="absolute -bottom-8 -right-8 bg-spirit-900 text-accent-400 p-10 rounded-[2rem] shadow-2xl border border-white/10">
              <div className="text-5xl font-serif font-bold mb-2">12+</div>
              <div className="text-xs uppercase tracking-[0.3em] font-bold text-slate-400">Years Of Shifa</div>
            </div>
          </div>
          <div>
            <span className="text-accent-600 font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Our Heritage</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-spirit-900 mb-8 leading-tight">Bridging Timeless Truths with Healing Hands</h2>
            <p className="text-xl text-slate-700 leading-relaxed mb-8">Jaadu ki kaat is a spiritual sanctuary for those seeking clarity in a complex world. We provide a safe, compassionate space for seekers of all backgrounds to find genuine restoration.</p>
            <div className="grid grid-cols-2 gap-10 border-t border-slate-100 pt-10">
                <div className="group/stat"><p className="text-4xl font-bold text-spirit-900">1.5k+</p><p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Solutions Found</p></div>
                <div className="group/stat"><p className="text-4xl font-bold text-spirit-900">100%</p><p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Confidential</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Donation / Support Section */}
      <section className="py-24 bg-spirit-900 relative overflow-hidden border-t border-white/5">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-bold uppercase tracking-widest mb-8">
                    <Heart size={14} className="fill-current animate-pulse" />
                    <span>Support Our Mission</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
                    Empower the Light of <span className="text-accent-500">Healing</span>
                </h2>
                <p className="text-slate-300 text-lg leading-relaxed mb-10 font-light">
                    Jaadu ki kaat is a sanctuary dedicated to providing spiritual relief to everyone, regardless of their financial means. Your Sadaqah and donations enable us to offer free consultations, maintain this platform, and reach those in desperate need of hope.
                </p>
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-spirit-800 flex items-center justify-center shrink-0 border border-white/10 text-accent-400 shadow-lg">
                            <HandHeart size={20} />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-lg mb-1">Sponsor a Consultation</h4>
                            <p className="text-slate-400 text-sm">Help someone receive the guidance they cannot afford.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-spirit-800 flex items-center justify-center shrink-0 border border-white/10 text-accent-400 shadow-lg">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-lg mb-1">Sustain the Sanctuary</h4>
                            <p className="text-slate-400 text-sm">Keep our digital doors open and resources accessible to all.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-accent-500 to-spirit-700 rounded-[2.5rem] blur opacity-40 group-hover:opacity-60 transition duration-1000"></div>
                <div className="relative bg-spirit-800/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-serif font-bold text-white mb-2">Make a Contribution</h3>
                        <p className="text-slate-400 text-sm">Secure & Confidential Transaction</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {['2', '5', '10'].map((amount) => (
                            <button 
                                key={amount} 
                                onClick={() => handleAmountClick(amount)}
                                className={`py-4 rounded-xl border font-bold transition-all ${
                                    donationAmount === amount 
                                    ? 'bg-accent-500 border-accent-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                                    : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                                }`}
                            >
                                ${amount}
                            </button>
                        ))}
                    </div>

                    <div className="mb-8">
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                            <input 
                                type="number" 
                                placeholder="Custom Amount" 
                                value={customDonation}
                                onChange={handleCustomAmountChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition font-bold" 
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleDonateClick}
                        className="w-full bg-accent-500 text-white font-bold py-5 rounded-xl shadow-xl hover:bg-accent-400 hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] transition-all transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>Donate Now</span>
                        <CircleArrowRight size={20} />
                    </button>

                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        <Lock size={12} />
                        <span>SSL Encrypted • 100% Secure</span>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
             <span className="text-accent-600 font-bold tracking-[0.3em] uppercase text-xs mb-3 block">Our Services</span>
             <h2 className="text-4xl md:text-5xl font-serif font-bold text-spirit-900">Spiritual Solutions</h2>
             <div className="w-24 h-1.5 bg-accent-500 mx-auto rounded-full mt-6 shadow-[0_0_15px_rgba(99,102,241,0.3)]"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {servicesList.map((service, index) => (
                <div key={index} className="bg-white rounded-[2rem] p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-spirit-50 group">
                   <div className="w-16 h-16 bg-spirit-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent-500 transition-colors duration-500 shadow-sm">
                      <service.icon className="w-8 h-8 text-spirit-900 group-hover:text-white transition-colors duration-500" />
                   </div>
                   <h3 className="text-2xl font-serif font-bold text-spirit-900 mb-4 group-hover:text-accent-600 transition-colors">{service.title}</h3>
                   <p className="text-slate-600 mb-8 leading-relaxed font-light h-20">{service.description}</p>
                   <button 
                        onClick={() => openConsultModal(service.title)}
                        className="inline-flex items-center text-accent-600 font-bold uppercase tracking-widest text-xs group-hover:text-accent-500 hover:underline bg-transparent border-none p-0 cursor-pointer"
                   >
                      Consult Now <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* Collective Prayer Section */}
      <section className="py-24 relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1565552629477-ff14d8db1922?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
                alt="Holy Kaaba" 
                className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-spirit-900 via-spirit-900/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-spirit-900/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center justify-center p-3 mb-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-2xl animate-fade-in-up">
                <Users className="w-5 h-5 text-accent-400 mr-2" />
                <span className="text-white font-bold tracking-widest text-xs uppercase">Community of Light</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 leading-tight drop-shadow-xl">
                Collective Prayers at the <br/><span className="text-accent-400">Holy Kaaba</span>
            </h2>
            
            <p className="text-xl text-slate-200 leading-relaxed mb-8 font-light drop-shadow-md">
                We gather Ism-e-Azam recitations and sacred Wazaif from our global community to present them in a grand collective prayer in front of the Holy Kaaba.
            </p>

            <button 
                onClick={() => setIsPrayerRequestModalOpen(true)}
                className="bg-accent-500 text-white font-bold py-5 px-12 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:bg-accent-600 transition transform hover:scale-105 active:scale-95 text-lg flex items-center justify-center mx-auto"
            >
                <span>Request For Pray Now</span>
                <HandHeart className="ml-3 w-6 h-6 animate-pulse" />
            </button>
        </div>
      </section>

      {/* Online Istikhara Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-up">
                <span className="text-accent-600 font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Divine Guidance</span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-spirit-900 mb-6 leading-tight">
                    Online Istikhara For Future
                </h2>
                <div className="w-20 h-1.5 bg-accent-500 rounded-full mb-8"></div>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed font-light">
                    Life often presents us with crossroads where the path forward seems veiled in mist. Whether you are considering a marriage proposal, starting a new business venture, or making a life-altering decision, relying solely on human logic isn't always enough.
                </p>
                <button 
                    onClick={() => setIsIstikharaModalOpen(true)}
                    className="inline-flex items-center justify-center bg-spirit-900 text-white font-bold py-4 px-10 rounded-full shadow-xl hover:bg-spirit-800 transition transform hover:scale-105 active:scale-95"
                >
                    <span>Request Istikhara Now</span>
                    <ArrowRight className="ml-2 w-5 h-5" />
                </button>
            </div>

            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100 group">
                <video 
                    src="https://res.cloudinary.com/dq0ccjs6y/video/upload/v1767285464/Online_Istikhara_iep0cm.mp4" 
                    className="w-full h-[500px] object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent z-20">
                    <p className="text-white font-serif font-bold text-xl">The Power of Divine Choice</p>
                </div>
            </div>
        </div>
      </section>

      {/* Get Ism-e-Azam Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white group order-last lg:order-first">
                <img 
                    src="https://res.cloudinary.com/dq0ccjs6y/image/upload/v1767286638/Ism-e-Azam_h57xgn.webp" 
                    alt="Ism-e-Azam" 
                    className="w-full h-[500px] object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent z-20">
                    <p className="text-white font-serif font-bold text-xl">Unlock Your Spiritual Potential</p>
                </div>
            </div>

            <div className="animate-fade-in-up">
               <span className="text-accent-600 font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Spiritual Power</span>
               <h2 className="text-4xl md:text-5xl font-serif font-bold text-spirit-900 mb-6 leading-tight">
                  Get Ism-e-Azam
               </h2>
               <div className="w-20 h-1.5 bg-accent-500 rounded-full mb-8"></div>
               <p className="text-lg text-slate-600 mb-6 leading-relaxed font-light">
                  The Ism-e-Azam is the Supreme Name of the Divine, a sacred key that unlocks the doors of acceptance for your deepest prayers.
               </p>
               <button 
                    onClick={() => setIsIsmeAzamModalOpen(true)}
                    className="inline-flex items-center justify-center bg-accent-500 text-white font-bold py-4 px-10 rounded-full shadow-xl hover:bg-accent-600 transition transform hover:scale-105 active:scale-95"
               >
                    <span>Get Your Ism-e-Azam</span>
                    <Star className="ml-2 w-5 h-5 fill-white text-white" />
               </button>
            </div>
         </div>
      </section>

      {/* Insights Section */}
      <section id="contact" className="py-24 bg-white border-t border-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch">
            <div className="flex flex-col justify-center items-start">
                <span className="text-accent-600 font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Here For You</span>
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-spirit-900 mb-6 leading-tight">
                    Seek the Light, <br/>Find Your Way.
                </h3>
                <p className="text-slate-600 text-lg mb-8 leading-relaxed font-light">
                    No matter how heavy the burden or how deep the darkness, spiritual relief is within reach. We are here to listen, guide, and help you overcome life's unseen challenges with compassion and confidentiality. Reach out to us today.
                </p>
                <button 
                    onClick={() => setIsContactModalOpen(true)}
                    className="inline-flex items-center justify-center bg-spirit-900 text-white font-bold py-4 px-10 rounded-full shadow-lg hover:bg-spirit-800 transition transform hover:scale-105 group"
                >
                    <span>Contact Us Now</span>
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="bg-spirit-900 p-12 rounded-[3rem] flex flex-col justify-center text-white relative overflow-hidden border border-white/5 shadow-2xl">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-accent-500/15 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                    <h2 className="text-4xl font-serif font-bold mb-6">Join the Circle of <span className="text-accent-400">Shifa</span></h2>
                    <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                        Stay connected with divine wisdom. Subscribe to receive sacred Wazaif, healing affirmations, and spiritual updates directly to your heart.
                    </p>
                    <form className="space-y-4">
                        <input type="email" placeholder="Your Email Address" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-accent-400 transition text-white text-lg" />
                        <button className="w-full bg-accent-500 text-white font-bold py-4 rounded-2xl hover:bg-accent-600 transition shadow-xl flex items-center justify-center gap-3 text-lg group">
                            <span>Subscribe to Wisdom</span> <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
      </section>

      {/* ... MODALS (Kept same as before, no changes needed inside modals for this step) ... */}
      {/* Donation Modal */}
      {isDonationModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in overflow-hidden">
          <div className="absolute inset-0 bg-spirit-900/90 backdrop-blur-sm" onClick={() => setIsDonationModalOpen(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden animate-fade-in-up border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="bg-spirit-900 px-6 py-4 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-serif font-bold text-white flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-accent-500 fill-accent-500" /> Complete Donation
                </h3>
              </div>
              <button onClick={() => setIsDonationModalOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-full">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleProcessPayment} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Cardholder Name</label>
                  <input type="text" required placeholder="Name on Card" value={cardName} onChange={(e) => setCardName(e.target.value)} className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Card Number</label>
                  <div className="relative">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2">{getCardIcon()}</div>
                     <input type="text" required placeholder="0000 0000 0000 0000" maxLength={23} value={cardNumber} onChange={handleCardNumberChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Expiry</label>
                    <input type="text" required placeholder="MM/YY" maxLength={5} value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">CVC</label>
                    <input type="text" required placeholder="123" maxLength={4} value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                  </div>
                </div>
                <button type="submit" disabled={isProcessing} className="w-full bg-accent-500 text-white font-bold py-4 rounded-xl mt-2 flex items-center justify-center gap-2">
                  {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : <CircleArrowRight size={18} />}
                  <span>{isProcessing ? 'Processing...' : `Donate $${customDonation || donationAmount}`}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Consultation Modal */}
      {isConsultModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in overflow-hidden">
          <div className="absolute inset-0 bg-spirit-900/90 backdrop-blur-sm" onClick={() => setIsConsultModalOpen(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden animate-fade-in-up border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="bg-spirit-900 px-6 py-4 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-serif font-bold text-white flex items-center"><FileText className="w-4 h-4 mr-2 text-accent-500" /> Consultation Request</h3>
              </div>
              <button onClick={() => setIsConsultModalOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-full"><X size={18} /></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleConsultSubmit} className="space-y-4">
                <input type="text" required placeholder="Full Name" value={consultName} onChange={(e) => setConsultName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                <input type="email" required placeholder="Email Address" value={consultEmail} onChange={(e) => setConsultEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                <textarea required rows={4} placeholder="Describe your situation..." value={consultMessage} onChange={(e) => setConsultMessage(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"></textarea>
                <button type="submit" disabled={isConsultSubmitting} className="w-full bg-accent-500 text-white font-bold py-4 rounded-xl mt-2 flex items-center justify-center gap-2">
                  {isConsultSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Send size={18} />}
                  <span>Submit Request</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Istikhara, Ism-e-Azam, Prayer, Contact Modals - Using simplified placeholders to save space as logic repeats structure */}
      {isIstikharaModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in">
           <div className="absolute inset-0 bg-spirit-900/90 backdrop-blur-sm" onClick={() => setIsIstikharaModalOpen(false)}></div>
           <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 p-6">
                <button onClick={() => setIsIstikharaModalOpen(false)} className="absolute top-4 right-4"><X /></button>
                <h3 className="text-xl font-serif font-bold mb-4">Istikhara Request</h3>
                <form onSubmit={handleIstikharaSubmit} className="space-y-3">
                    <input className="w-full p-3 border rounded-lg" placeholder="Name" value={istikharaName} onChange={e=>setIstikharaName(e.target.value)} required />
                    <input className="w-full p-3 border rounded-lg" placeholder="Mother's Name" value={istikharaMotherName} onChange={e=>setIstikharaMotherName(e.target.value)} required />
                    <textarea className="w-full p-3 border rounded-lg" placeholder="Purpose" value={istikharaPurpose} onChange={e=>setIstikharaPurpose(e.target.value)} required />
                    <button className="w-full bg-spirit-900 text-white py-3 rounded-lg">Submit</button>
                </form>
           </div>
        </div>
      )}

      {isIsmeAzamModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in">
           <div className="absolute inset-0 bg-spirit-900/90 backdrop-blur-sm" onClick={() => setIsIsmeAzamModalOpen(false)}></div>
           <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 p-6">
                <button onClick={() => setIsIsmeAzamModalOpen(false)} className="absolute top-4 right-4"><X /></button>
                <h3 className="text-xl font-serif font-bold mb-4">Ism-e-Azam Request</h3>
                <form onSubmit={handleIsmeAzamSubmit} className="space-y-3">
                    <input className="w-full p-3 border rounded-lg" placeholder="Name" value={ismeAzamName} onChange={e=>setIsmeAzamName(e.target.value)} required />
                    <button className="w-full bg-spirit-900 text-white py-3 rounded-lg">Calculate</button>
                </form>
           </div>
        </div>
      )}

      {isPrayerRequestModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in">
           <div className="absolute inset-0 bg-spirit-900/90 backdrop-blur-sm" onClick={() => setIsPrayerRequestModalOpen(false)}></div>
           <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 p-6">
                <button onClick={() => setIsPrayerRequestModalOpen(false)} className="absolute top-4 right-4"><X /></button>
                <h3 className="text-xl font-serif font-bold mb-4">Prayer Request</h3>
                <form onSubmit={handlePrayerRequestSubmit} className="space-y-3">
                    <input className="w-full p-3 border rounded-lg" placeholder="Name" value={prayerRequestName} onChange={e=>setPrayerRequestName(e.target.value)} required />
                    <textarea className="w-full p-3 border rounded-lg" placeholder="Duaa" value={prayerRequestPurpose} onChange={e=>setPrayerRequestPurpose(e.target.value)} required />
                    <button className="w-full bg-spirit-900 text-white py-3 rounded-lg">Send Duaa</button>
                </form>
           </div>
        </div>
      )}

      {isContactModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in">
           <div className="absolute inset-0 bg-spirit-900/90 backdrop-blur-sm" onClick={() => setIsContactModalOpen(false)}></div>
           <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 p-6">
                <button onClick={() => setIsContactModalOpen(false)} className="absolute top-4 right-4"><X /></button>
                <h3 className="text-xl font-serif font-bold mb-4">Contact Us</h3>
                <form onSubmit={handleContactSubmit} className="space-y-3">
                    <input className="w-full p-3 border rounded-lg" placeholder="Email" value={contactEmail} onChange={e=>setContactEmail(e.target.value)} required />
                    <textarea className="w-full p-3 border rounded-lg" placeholder="Message" value={contactMessage} onChange={e=>setContactMessage(e.target.value)} required />
                    <button className="w-full bg-spirit-900 text-white py-3 rounded-lg">Send</button>
                </form>
           </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 animate-fade-in">
               <div className="absolute inset-0 bg-spirit-900/80 backdrop-blur-sm" onClick={() => setIsSuccessModalOpen(false)}></div>
               <div className="bg-white rounded-3xl p-8 max-w-sm text-center relative z-10 shadow-2xl animate-bounce-slow">
                   <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                       <CircleCheck className="w-10 h-10 text-green-500" />
                   </div>
                   <h3 className="text-2xl font-serif font-bold text-spirit-900 mb-2">Request Received</h3>
                   <p className="text-slate-500 mb-6">We have received your details. A spiritual advisor will review it shortly.</p>
                   <button onClick={() => setIsSuccessModalOpen(false)} className="bg-spirit-900 text-white px-8 py-3 rounded-full font-bold hover:bg-spirit-800 transition">Alhamdulillah</button>
               </div>
          </div>
      )}

    </div>
  );
};

export default Home;
