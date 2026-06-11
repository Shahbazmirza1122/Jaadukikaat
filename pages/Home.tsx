import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Heart,
  Moon,
  BookOpen,
  Compass,
  Star,
  HandHeart,
  CircleArrowRight,
  Send,
  Lock,
  CreditCard,
  X,
  Loader2,
  Briefcase,
  FileText,
  CircleCheck,
  Users,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Tag,
  Book,
} from "lucide-react";
import { BlogPost } from "../types";
import { products as staticProducts, Product } from "../data/products";
import { submitToGoogleSheet } from "../services/sheetService";
import { supabase } from "../lib/supabase";
import DynamicSection from "../components/DynamicSection";
import { PageSection } from "../types";
import { usePageSections } from "../hooks/usePageSections";
import { useCart } from "../context/CartContext";

// Dummy Data for Fallback
const dummyBlogPosts: BlogPost[] = [
  {
    id: "d1",
    title: "Finding Stillness: The Power of a Silent Heart",
    excerpt:
      "In an age of constant distraction, the ancient practice of cultivating inner silence offers a profound sanctuary. Discover how to quiet the mind.",
    content: "",
    author: "Imam Al-Ghazali",
    date: "July 28, 2024",
    imageUrl:
      "https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?q=80&w=800&auto=format&fit=crop",
    category: "Mindfulness",
    isLatest: true,
  },
  {
    id: "d2",
    title: "The Alchemy of Dua: Turning Desires into Connection",
    excerpt:
      "Dua is not merely a list of requests; it is the soul's conversation with its Creator. Learn how to transform your supplications.",
    content: "",
    author: "Rumi",
    date: "July 22, 2024",
    imageUrl:
      "https://images.unsplash.com/photo-1593225232335-3738b6f35334?q=80&w=800&auto=format&fit=crop",
    category: "Spirituality",
  },
  {
    id: "d3",
    title: "Decoding Dreams: A Spiritual Guide",
    excerpt:
      "Our dreams are a sacred bridge to the subconscious. This guide provides an introduction to interpreting dream symbols.",
    content: "",
    author: "Ibn Sirin",
    date: "July 15, 2024",
    imageUrl:
      "https://images.unsplash.com/photo-1532325329166-d9b9333a469a?q=80&w=800&auto=format&fit=crop",
    category: "Wisdom",
  },
  {
    id: "d4",
    title: "The Evil Eye: Protection in the Modern Age",
    excerpt:
      "Explore the ancient concept of the 'evil eye' (Nazar) and discover practical spiritual remedies and daily practices.",
    content: "",
    author: "Jaadu ki kaat",
    date: "July 08, 2024",
    imageUrl:
      "https://images.unsplash.com/photo-1559819225-3b2a578358ab?q=80&w=800&auto=format&fit=crop",
    category: "Protection",
  },
  {
    id: "d5",
    title: "Gratitude as a Gateway to Abundance",
    excerpt:
      "Shifting your focus from what's lacking to what you have is the first step towards attracting more blessings.",
    content: "",
    author: "Yasmin Mogahed",
    date: "July 01, 2024",
    imageUrl:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=800&auto=format&fit=crop",
    category: "Spirituality",
  },
];

const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [bannerSlides, setBannerSlides] = useState<any[]>([]);
  const { sections: pageSections } = usePageSections("/");
  const location = useLocation();
  const navigate = useNavigate();
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
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.hash]);

  // Fetch Data
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("status", "published")
          .neq("category", "_page_section_")
          .neq("category", "_form_lead_")
          .neq("category", "_banner_")
          .order("created_at", { ascending: false });

        if (error || !data || data.length === 0) {
          // Use dummy data if DB is empty or error occurs
          console.log("Using fallback blog data");
          setBlogPosts(dummyBlogPosts);
        } else {
          setBlogPosts(
            data.map((p: any) => ({
              ...p,
              imageUrl: p.image_url || p.imageUrl,
              relatedIds: p.related_ids || p.relatedIds,
            })),
          );
        }
      } catch (err) {
        console.warn(
          "Failed to fetch blogs (network/offline), using fallback:",
          err,
        );
        setBlogPosts(dummyBlogPosts);
      }
    };

    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        if (error || !data || data.length === 0) {
          setProductsList(staticProducts);
        } else {
          const mapped = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image,
            category: p.category,
            description: p.description,
            sku: p.sku,
            salePrice: p.sale_price,
            saleStart: p.sale_start,
            saleEnd: p.sale_end,
            isOutOfStock: p.is_out_of_stock,
            isBlurBeforeBuy: p.is_blur_before_buy,
          }));
          setProductsList(mapped);
        }
      } catch (err) {
        console.warn("Failed to fetch products (network/offline):", err);
        setProductsList(staticProducts);
      } finally {
        setProductsLoading(false);
      }
    };

    const fetchBanners = async () => {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("category", "_banner_")
          .order("created_at", { ascending: true });

        if (!error && data && data.length > 0) {
           const mappedBanners = data.map((p: any) => {
              let config = {
                 imageTransition: 'zoom',
                 overlayHeight: '100%',
                 overlayWidth: '100%',
                 overlayPosition: 'bottom',
                 overlayColor: '#000000',
                 overlayOpacity: '0.4',
                 headingAnimation: 'fade-in-up',
                 textAnimation: 'fade-in-up'
              };
              try {
                if(p.content) config = JSON.parse(p.content);
              } catch(e) {}
              return {
                 id: p.id,
                 title: p.title,
                 subtitle: p.excerpt || "",
                 image: p.image_url || p.imageUrl,
                 cta: p.author || "Explore",
                 linkTarget: p.date || "#services",
                 config
              }
           });
           setBannerSlides(mappedBanners);
        }
      } catch (err) {
        console.warn("Failed to fetch banners");
      }
    };

    fetchBlogs();
    fetchProducts();
    fetchBanners();
  }, []);

  // Donation State
  const [donationAmount, setDonationAmount] = useState<string>("5");
  const [customDonation, setCustomDonation] = useState<string>("");
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment Form State
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardBrand, setCardBrand] = useState<string>("unknown");

  // Consultation Form State
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [consultService, setConsultService] = useState("");

  // Updated Consult Form Fields
  const [consultName, setConsultName] = useState("");
  const [consultMotherName, setConsultMotherName] = useState("");
  const [consultDob, setConsultDob] = useState("");
  const [consultPhone, setConsultPhone] = useState("");
  const [consultEmail, setConsultEmail] = useState("");
  const [consultCity, setConsultCity] = useState("");
  const [consultCountry, setConsultCountry] = useState("");
  const [consultPurpose, setConsultPurpose] = useState("");
  const [consultMessage, setConsultMessage] = useState("");
  const [isConsultSubmitting, setIsConsultSubmitting] = useState(false);

  // Istikhara Form State
  const [isIstikharaModalOpen, setIsIstikharaModalOpen] = useState(false);
  const [istikharaName, setIstikharaName] = useState("");
  const [istikharaMotherName, setIstikharaMotherName] = useState("");
  const [istikharaDob, setIstikharaDob] = useState("");
  const [istikharaEmail, setIstikharaEmail] = useState("");
  const [istikharaPhone, setIstikharaPhone] = useState("");
  const [istikharaCity, setIstikharaCity] = useState("");
  const [istikharaCountry, setIstikharaCountry] = useState("");
  const [istikharaPurpose, setIstikharaPurpose] = useState("");
  const [istikharaMessage, setIstikharaMessage] = useState("");

  // Ism-e-Azam Form State
  const [isIsmeAzamModalOpen, setIsIsmeAzamModalOpen] = useState(false);
  const [ismeAzamName, setIsmeAzamName] = useState("");
  const [ismeAzamMotherName, setIsmeAzamMotherName] = useState("");
  const [ismeAzamDob, setIsmeAzamDob] = useState("");
  const [ismeAzamEmail, setIsmeAzamEmail] = useState("");
  const [ismeAzamPhone, setIsmeAzamPhone] = useState("");
  const [ismeAzamCity, setIsmeAzamCity] = useState("");
  const [ismeAzamCountry, setIsmeAzamCountry] = useState("");
  const [ismeAzamPurpose, setIsmeAzamPurpose] = useState("");
  const [ismeAzamMessage, setIsmeAzamMessage] = useState("");

  // Prayer Request Form State
  const [isPrayerRequestModalOpen, setIsPrayerRequestModalOpen] =
    useState(false);
  const [prayerRequestName, setPrayerRequestName] = useState("");
  const [prayerRequestMotherName, setPrayerRequestMotherName] = useState("");
  const [prayerRequestDob, setPrayerRequestDob] = useState("");
  const [prayerRequestEmail, setPrayerRequestEmail] = useState("");
  const [prayerRequestPhone, setPrayerRequestPhone] = useState("");
  const [prayerRequestCity, setPrayerRequestCity] = useState("");
  const [prayerRequestCountry, setPrayerRequestCountry] = useState("");
  const [prayerRequestRecitation, setPrayerRequestRecitation] = useState("");
  const [prayerRequestRecitationCount, setPrayerRequestRecitationCount] =
    useState("");
  const [prayerRequestPurpose, setPrayerRequestPurpose] = useState("");
  const [prayerRequestMessage, setPrayerRequestMessage] = useState("");

  // General Contact Form State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  const slides = [
    {
      title: "Jaadu ki kaat",
      subtitle:
        "Experience profound inner peace through sacred spiritual remedies and guided growth.",
      image:
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      cta: "Explore Our Path",
    },
    {
      title: "Spiritual Shifa",
      subtitle:
        "Personalized solutions for the soul through Duaa, Wazaif, and ancient wisdom.",
      image:
        "https://images.unsplash.com/photo-1499209974431-9dac3adaf471?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      cta: "Seek Guidance",
    },
    {
      title: "Divine Clarity",
      subtitle:
        "Neutralizing metaphysical hurdles to restore balance and harmony in your life.",
      image:
        "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      cta: "Start Healing",
    },
  ];

  const servicesList = [
    {
      title: "Dua",
      icon: Moon,
      description:
        "Personalized supplications to connect with the Divine and seek fulfillment of your deepest needs.",
    },
    {
      title: "Wazaif",
      icon: BookOpen,
      description:
        "Powerful spiritual recitations and litanies aimed at resolving specific life challenges.",
    },
    {
      title: "Istikhara",
      icon: Compass,
      description:
        "Divine guidance for crucial life decisions, providing clarity on marriage, business, and future paths.",
    },
    {
      title: "Rohani Ilaj",
      icon: Sparkles,
      description:
        "Holistic spiritual healing for ailments of the heart, mind, and soul using ancient Quranic wisdom.",
    },
    {
      title: "Jadu ki kaat",
      icon: ShieldCheck,
      description:
        "Complete removal of black magic, evil eye, and spiritual blockages affecting your progress and peace.",
    },
    {
      title: "Job Success",
      icon: Briefcase,
      description:
        "Spiritual remedies to open doors of opportunity, career growth, and financial stability.",
    },
  ];

  useEffect(() => {
    const slideCount = bannerSlides.length > 0 ? bannerSlides.length : slides.length;
    const timer = setInterval(
      () => setCurrentSlide((prev) => (prev + 1) % slideCount),
      6000,
    );
    return () => clearInterval(timer);
  }, [slides.length, bannerSlides.length]);

  const scrollProducts = (direction: "left" | "right") => {
    if (productScrollRef.current) {
      const { current } = productScrollRef;
      const scrollAmount = 340; // Card width + gap
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id],
    );
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.isOutOfStock) return;
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  const isSaleActive = (product: Product) => {
    if (!product.salePrice) return false;
    const now = new Date();
    const start = product.saleStart ? new Date(product.saleStart) : null;
    const end = product.saleEnd ? new Date(product.saleEnd) : null;

    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  };

  // Donation Handlers
  const handleAmountClick = (amount: string) => {
    setDonationAmount(amount);
    setCustomDonation("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomDonation(e.target.value);
    setDonationAmount("");
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
    const cleanNumber = number.replace(/\D/g, "");
    if (cleanNumber.match(/^4/)) return "visa";
    if (cleanNumber.match(/^5[1-5]/) || cleanNumber.match(/^2[2-7]/))
      return "mastercard";
    if (cleanNumber.match(/^3[47]/)) return "amex";
    if (cleanNumber.match(/^6(?:011|5)/)) return "discover";
    if (cleanNumber.match(/^62/)) return "unionpay";
    return "unknown";
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9\s]/g, "");
    setCardNumber(val);
    setCardBrand(detectCardType(val));
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const donationData = {
      "Full Name": cardName,
      "Requesting Service": "Donation",
      Message: `Donation Amount: $${customDonation || donationAmount}, Card Brand: ${cardBrand}`,
    };

    // Send to "Donations" sheet
    await submitToGoogleSheet("Donations", donationData);

    setTimeout(() => {
      setIsProcessing(false);
      setIsDonationModalOpen(false);
      alert(
        `Thank you! Your donation of $${customDonation || donationAmount} has been received.`,
      );
      setCardName("");
      setCardNumber("");
      setCardExpiry("");
      setCardCvc("");
      setCardBrand("unknown");
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

    // Explicit mapping to Google Sheet columns
    const payload = {
      "Full Name": consultName,
      "Mother's Name": consultMotherName,
      "Date of Birth": consultDob,
      "Phone Number": consultPhone,
      "Email Address": consultEmail,
      City: consultCity,
      Country: consultCountry,
      Purpose: consultPurpose,
      "Requesting Service": consultService,
      Message: consultMessage,
    };

    // Use the Service Name as the Sheet Name (e.g. "Dua", "Wazaif", etc.)
    const targetSheet = consultService || "Consultations";

    console.log(`Sending to sheet: ${targetSheet}`, payload);

    await submitToGoogleSheet(targetSheet, payload);

    setIsConsultSubmitting(false);
    setIsConsultModalOpen(false);
    setIsSuccessModalOpen(true);

    // Reset fields
    setConsultName("");
    setConsultMotherName("");
    setConsultDob("");
    setConsultPhone("");
    setConsultEmail("");
    setConsultCity("");
    setConsultCountry("");
    setConsultPurpose("");
    setConsultMessage("");
  };

  // Istikhara Handler
  const handleIstikharaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConsultSubmitting(true);

    await submitToGoogleSheet("Istikhara", {
      "Full Name": istikharaName,
      "Mother's Name": istikharaMotherName,
      "Date of Birth": istikharaDob,
      "Phone Number": istikharaPhone,
      "Email Address": istikharaEmail,
      City: istikharaCity,
      Country: istikharaCountry,
      Purpose: istikharaPurpose,
      Message: istikharaMessage,
    });

    setIsConsultSubmitting(false);
    setIsIstikharaModalOpen(false);
    setIsSuccessModalOpen(true);

    setIstikharaName("");
    setIstikharaMotherName("");
    setIstikharaDob("");
    setIstikharaEmail("");
    setIstikharaPhone("");
    setIstikharaCity("");
    setIstikharaCountry("");
    setIstikharaPurpose("");
    setIstikharaMessage("");
  };

  // Ism-e-Azam Handler
  const handleIsmeAzamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConsultSubmitting(true);

    await submitToGoogleSheet("IsmeAzam", {
      "Full Name": ismeAzamName,
      "Mother's Name": ismeAzamMotherName,
      "Date of Birth": ismeAzamDob,
      "Phone Number": ismeAzamPhone,
      "Email Address": ismeAzamEmail,
      City: ismeAzamCity,
      Country: ismeAzamCountry,
      Purpose: ismeAzamPurpose,
      Message: ismeAzamMessage,
    });

    setIsConsultSubmitting(false);
    setIsIsmeAzamModalOpen(false);
    setIsSuccessModalOpen(true);

    setIsmeAzamName("");
    setIsmeAzamMotherName("");
    setIsmeAzamDob("");
    setIsmeAzamEmail("");
    setIsmeAzamPhone("");
    setIsmeAzamCity("");
    setIsmeAzamCountry("");
    setIsmeAzamPurpose("");
    setIsmeAzamMessage("");
  };

  // Prayer Request Handler
  const handlePrayerRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConsultSubmitting(true);

    const payload = {
      "Full Name": prayerRequestName,
      "Mother's Name": prayerRequestMotherName,
      "Date of Birth": prayerRequestDob,
      "Phone Number": prayerRequestPhone,
      "Email Address": prayerRequestEmail,
      City: prayerRequestCity,
      Country: prayerRequestCountry,
      "What You Have Recited": prayerRequestRecitation, // Correct key for Sheet
      "How Many Times": prayerRequestRecitationCount, // Correct key for Sheet
      Purpose: prayerRequestPurpose,
      Message: prayerRequestMessage,
      "Requesting Service": "Prayer Request",
    };

    // Send to "Prayer Requests" sheet
    await submitToGoogleSheet("Prayer Requests", payload);

    setIsConsultSubmitting(false);
    setIsPrayerRequestModalOpen(false);
    setIsSuccessModalOpen(true);

    setPrayerRequestName("");
    setPrayerRequestMotherName("");
    setPrayerRequestDob("");
    setPrayerRequestEmail("");
    setPrayerRequestPhone("");
    setPrayerRequestCity("");
    setPrayerRequestCountry("");
    setPrayerRequestRecitation("");
    setPrayerRequestRecitationCount("");
    setPrayerRequestPurpose("");
    setPrayerRequestMessage("");
  };

  // General Contact Handler
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConsultSubmitting(true);

    await submitToGoogleSheet("Contact", {
      "Full Name": contactName,
      "Email Address": contactEmail,
      "Phone Number": contactPhone,
      "Requesting Service": "General Contact",
      Message: contactMessage,
    });

    setIsConsultSubmitting(false);
    setIsContactModalOpen(false);
    setIsSuccessModalOpen(true);

    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setContactMessage("");
  };

  const getCardIcon = () => {
    switch (cardBrand) {
      case "visa":
        return (
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
            alt="Visa"
            className="w-8 h-5 object-contain"
          />
        );
      case "mastercard":
        return (
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
            alt="Mastercard"
            className="w-8 h-5 object-contain"
          />
        );
      case "amex":
        return (
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg"
            alt="Amex"
            className="w-8 h-5 object-contain"
          />
        );
      case "discover":
        return (
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/57/Discover_Card_logo.svg"
            alt="Discover"
            className="w-8 h-5 object-contain"
          />
        );
      case "unionpay":
        return (
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/1/1b/UnionPay_logo.svg"
            alt="UnionPay"
            className="w-8 h-5 object-contain"
          />
        );
      default:
        return (
          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        );
    }
  };

  const activeSlides = bannerSlides.length > 0 ? bannerSlides : slides;

  return (
    <div className="w-full overflow-x-hidden relative bg-white">
      {/* Hero Section */}
      <section
        id="top"
        className="relative h-[70vh] md:h-screen overflow-hidden bg-spirit-900"
      >
        {activeSlides.map((slide, index) => {
          const config = slide.config || {
             imageTransition: 'zoom',
             overlayHeight: '100%',
             overlayWidth: '100%',
             overlayPosition: 'bottom',
             overlayColor: '#0f172a',
             overlayOpacity: '0.6',
             headingAnimation: 'fade-in-up',
             textAnimation: 'fade-in-up'
          };
          
          let imgAnimClass = "scale-100";
          if(index === currentSlide) {
             if(config.imageTransition === 'zoom') imgAnimClass = "scale-110";
             else if(config.imageTransition === 'fade') imgAnimClass = "scale-100 opacity-100";
             else if(config.imageTransition === 'slide-left') imgAnimClass = "translate-x-[-5%] scale-105";
             else if(config.imageTransition === 'slide-right') imgAnimClass = "translate-x-[5%] scale-105";
             else if(config.imageTransition === 'pan-up') imgAnimClass = "translate-y-[-5%] scale-105";
             else if(config.imageTransition === 'pan-down') imgAnimClass = "translate-y-[5%] scale-105";
             else imgAnimClass = "scale-100";
          }
          
          let headingAnimClass = "opacity-0";
          if(index === currentSlide) {
             if(config.headingAnimation === 'none') {
                headingAnimClass = "opacity-100";
             } else if(config.headingAnimation === 'typewriter') {
                headingAnimClass = "animate-typing overflow-hidden whitespace-nowrap border-r-4 border-accent-500 pr-2";
             } else {
                headingAnimClass = `animate-${config.headingAnimation}`;
             }
          }

          let textAnimClass = "opacity-0";
          if(index === currentSlide) {
             if(config.textAnimation === 'none') {
                 textAnimClass = "opacity-100";
             } else {
                 textAnimClass = `animate-${config.textAnimation}`;
             }
          }

          // Overlay style
          let hex = config.overlayColor || '#000000';
          let r = 0; let g = 0; let b = 0;
          if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
              let c= hex.substring(1).split('');
              if(c.length== 3){
                  c= [c[0], c[0], c[1], c[1], c[2], c[2]];
              }
              c= '0x'+c.join('');
              r= (Number(c)>>16)&255;
              g= (Number(c)>>8)&255;
              b= Number(c)&255;
          }
          const rgbaOverlay = `rgba(${r}, ${g}, ${b}, ${config.overlayOpacity})`;
          
          let gradientStyle = "";
          let overlayPositionClasses = "";
          
          const position = config.overlayPosition || 'bottom';
          if(position === 'bottom') {
             overlayPositionClasses = "bottom-0 left-0 h-full w-full"; // height will be set inline
             gradientStyle = `linear-gradient(to top, ${rgbaOverlay} 0%, rgba(${r}, ${g}, ${b}, 0) 100%)`;
          } else if(position === 'top') {
             overlayPositionClasses = "top-0 left-0 h-full w-full";
             gradientStyle = `linear-gradient(to bottom, ${rgbaOverlay} 0%, rgba(${r}, ${g}, ${b}, 0) 100%)`;
          } else if(position === 'left') {
             overlayPositionClasses = "top-0 left-0 h-full w-full";
             gradientStyle = `linear-gradient(to right, ${rgbaOverlay} 0%, rgba(${r}, ${g}, ${b}, 0) 100%)`;
          } else if(position === 'right') {
             overlayPositionClasses = "top-0 right-0 h-full w-full";
             gradientStyle = `linear-gradient(to left, ${rgbaOverlay} 0%, rgba(${r}, ${g}, ${b}, 0) 100%)`;
          } else {
             // center
             overlayPositionClasses = "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full";
             gradientStyle = `radial-gradient(ellipse at center, ${rgbaOverlay} 0%, rgba(${r}, ${g}, ${b}, 0) 100%)`;
          }

          return (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            <div
              className={`absolute inset-0 bg-cover bg-center transition-all duration-[12000ms] ${imgAnimClass}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div 
                 className={`absolute ${overlayPositionClasses}`}
                 style={{
                    height: (position === 'top' || position === 'bottom') ? config.overlayHeight : '100%',
                    width: (position === 'left' || position === 'right') ? (config.overlayWidth || config.overlayHeight) : '100%',
                    background: gradientStyle
                 }}
              ></div>
            </div>
            <div className="relative h-full flex flex-col justify-center pt-40 md:pt-48 max-w-7xl mx-auto px-6 z-20 pointer-events-none">
              <div
                className={`max-w-3xl ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
              >
                <h1
                  className={`text-[2rem] sm:text-5xl md:text-8xl font-serif font-bold text-white mb-4 md:mb-6 drop-shadow-2xl leading-tight w-max ${headingAnimClass}`}
                >
                  {slide.title}
                </h1>
                <p className={`text-base sm:text-xl md:text-2xl text-slate-200 mb-6 md:mb-10 font-light leading-relaxed drop-shadow-lg max-w-2xl ${textAnimClass}`}>
                  {slide.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 pointer-events-auto">
                  <a
                    href={slide.linkTarget || "#services"}
                    className="inline-flex items-center justify-center bg-accent-500 text-white font-bold py-3 px-6 md:py-4 md:px-10 rounded-full shadow-2xl hover:bg-accent-600 transition transform hover:scale-105 active:scale-95 text-sm md:text-base pointer-events-auto"
                  >
                    {slide.cta} <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                  </a>
                  <a
                    href="#about"
                    className="inline-flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold py-3 px-6 md:py-4 md:px-10 rounded-full hover:bg-white/20 transition text-sm md:text-base pointer-events-auto"
                  >
                    Our Story
                  </a>
                </div>
              </div>
            </div>
          </div>
        )
      })}
      </section>

      {/* Product Carousel Section */}
      <section className="py-20 bg-spirit-50 relative border-b border-spirit-100">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <span className="text-accent-600 font-bold tracking-[0.3em] uppercase text-xs mb-3 block">
                Sacred Store
              </span>
              <h2 className="text-4xl font-serif font-bold text-spirit-900">
                Spiritual Essentials
              </h2>
              <p className="text-slate-500 mt-2 font-light">
                Curated items to enhance your spiritual journey and protection.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/store"
                className="text-spirit-600 font-bold hover:text-accent-500 flex items-center transition-colors"
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Carousel Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8">
            {productsLoading
              ? // Skeleton Loading State
                Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="bg-spirit-900 rounded-[2rem] shadow-xl flex flex-col relative h-[480px] animate-pulse"
                    >
                      <div className="h-60 w-full bg-slate-700 rounded-t-[2rem]"></div>
                      <div className="p-4 flex-grow flex flex-col relative bg-spirit-900 rounded-b-[2rem]">
                        <div className="border-[3px] border-slate-700 rounded-2xl p-4 flex-grow"></div>
                      </div>
                    </div>
                  ))
              : productsList.slice(0, 4).map((product, index) => {
                  const onSale = isSaleActive(product);
                  const currentPrice = onSale
                    ? product.salePrice
                    : product.price;

                  return (
                    <Link
                      to={`/product/${product.id}`}
                      key={product.id}
                      className="bg-spirit-900 rounded-[2rem] shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col relative h-[480px]"
                    >
                      {/* Price Tag */}
                      <div className="absolute top-0 right-0 bg-accent-500 text-white font-bold text-sm px-6 py-2 rounded-tr-[2rem] rounded-bl-3xl z-30 shadow-lg">
                        {currentPrice}
                      </div>

                      {/* Sale Tag */}
                      {onSale && !product.isOutOfStock && (
                        <div className="absolute top-0 left-0 bg-red-500 text-white font-bold text-xs uppercase px-5 py-2 rounded-tl-[2rem] rounded-br-2xl z-30 shadow-lg flex items-center gap-1">
                          <Tag size={12} /> Sale
                        </div>
                      )}

                      {/* Image Area */}
                      <div className="h-60 w-full relative rounded-t-[2rem] overflow-hidden bg-white/5 border-b border-white/10 flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading={index < 4 ? "eager" : "lazy"}
                          className={`w-full h-full object-cover transform group-hover:scale-110 transition duration-700 
                                          ${product.isOutOfStock ? "grayscale opacity-70" : ""} 
                                          ${product.isBlurBeforeBuy ? "blur-md scale-110" : ""}
                                      `}
                        />

                        {/* Blur Overlay Label */}
                        {product.isBlurBeforeBuy && !product.isOutOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 text-white font-bold uppercase text-[10px] tracking-widest shadow-lg flex items-center gap-2">
                              <Lock size={12} /> Hidden Content
                            </div>
                          </div>
                        )}

                        {/* Out of Stock Overlay */}
                        {product.isOutOfStock && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                            <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold uppercase text-xs tracking-wider shadow-lg">
                              Out of Stock
                            </span>
                          </div>
                        )}

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 z-10">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist(product.id);
                            }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-lg ${wishlist.includes(product.id) ? "bg-red-500 text-white" : "bg-white text-spirit-900 hover:text-red-500"}`}
                          >
                            <Heart
                              size={20}
                              className={
                                wishlist.includes(product.id)
                                  ? "fill-current"
                                  : ""
                              }
                            />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Container */}
                      <div className="p-4 flex-grow flex flex-col relative bg-spirit-900 rounded-b-[2rem]">
                        <div className="border-[3px] border-accent-500 rounded-2xl p-4 flex-grow flex relative mb-2">
                          {/* Left Column */}
                          <div className="w-[58%] pr-3 flex flex-col">
                            <h3 className="font-sans font-bold text-lg leading-tight uppercase tracking-wide text-white mb-2 line-clamp-2">
                              {product.name}
                            </h3>
                            <p className="text-[10px] text-slate-300 line-clamp-4 leading-relaxed mb-auto">
                              {product.description}
                            </p>
                            <div className="flex text-yellow-400 text-sm mt-3 tracking-widest">
                              ★★★★★
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="w-[1px] bg-white/20 my-1"></div>

                          {/* Right Column */}
                          <div className="w-[42%] pl-3 flex flex-col justify-start gap-4 mt-1">
                            <div>
                              <div className="font-bold text-[8px] text-white/50 uppercase tracking-wider mb-0.5">
                                Category
                              </div>
                              <div className="text-[10px] text-white line-clamp-2 leading-tight">
                                {product.category}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-[8px] text-white/50 uppercase tracking-wider mb-0.5">
                                SKU
                              </div>
                              <div className="text-[10px] text-white line-clamp-1 leading-tight">
                                {product.sku}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-[8px] text-white/50 uppercase tracking-wider mb-0.5">
                                Status
                              </div>
                              <div className="text-[10px] text-white leading-tight">
                                {product.isOutOfStock
                                  ? "Sold Out"
                                  : "Available"}
                              </div>
                            </div>
                          </div>

                          {/* Button */}
                          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-max z-30">
                            <button
                              onClick={(e) => handleAddToCart(e, product)}
                              disabled={!!product.isOutOfStock}
                              className={`px-8 py-2 rounded-full font-bold text-xs shadow-xl uppercase tracking-wider transition-colors 
                                                  ${product.isOutOfStock ? "bg-slate-500 text-slate-300 cursor-not-allowed border-none" : "bg-white text-accent-600 hover:text-white hover:bg-accent-600 border border-transparent"}
                                              `}
                            >
                              {product.isOutOfStock
                                ? "Sold Out"
                                : "Add to Cart"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
          </div>

          {/* Visit Store Button */}
          <div className="mt-10 flex justify-center">
            <Link
              to="/store"
              className="inline-flex items-center justify-center bg-spirit-900 text-white font-bold py-4 px-10 rounded-full shadow-lg hover:bg-spirit-800 transition-all hover:scale-105 active:scale-95 group"
            >
              <span>Visit Sacred Store</span>
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative group/aboutImg ml-4 md:ml-6 mb-12 md:mb-0 mr-4 md:mr-8">
            <div className="absolute -top-4 -left-4 md:-top-6 md:-left-6 w-24 h-24 md:w-32 md:h-32 bg-accent-50 rounded-full -z-10 animate-pulse"></div>
            <img
              src="https://res.cloudinary.com/dq0ccjs6y/image/upload/v1767284640/Rohaniyat_l4p17j.webp"
              alt="Meditation"
              className="rounded-[2rem] md:rounded-[3rem] shadow-2xl h-[350px] md:h-[550px] w-full object-cover transition-transform duration-700 group-hover/aboutImg:scale-[1.02]"
            />
            <div className="absolute -bottom-6 -right-4 md:-bottom-8 md:-right-8 bg-spirit-900 text-accent-400 p-6 md:p-10 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border border-white/10 z-10 w-[70%] sm:w-auto text-center md:text-left">
              <div className="text-4xl md:text-5xl font-serif font-bold mb-1 md:mb-2 text-center md:text-left">12+</div>
              <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-slate-400 text-center md:text-left">
                Years Of Shifa
              </div>
            </div>
          </div>
          <div>
            <span className="text-accent-600 font-bold tracking-[0.3em] uppercase text-xs mb-4 block">
              Our Heritage
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-spirit-900 mb-8 leading-tight">
              Bridging Timeless Truths with Healing Hands
            </h2>
            <p className="text-xl text-slate-700 leading-relaxed mb-8">
              Jaadu ki kaat is a spiritual sanctuary for those seeking clarity
              in a complex world. We provide a safe, compassionate space for
              seekers of all backgrounds to find genuine restoration.
            </p>
            <div className="grid grid-cols-2 gap-10 border-t border-slate-100 pt-10">
              <div className="group/stat">
                <p className="text-4xl font-bold text-spirit-900">1.5k+</p>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
                  Solutions Found
                </p>
              </div>
              <div className="group/stat">
                <p className="text-4xl font-bold text-spirit-900">100%</p>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
                  Confidential
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Section */}
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
              Empower the Light of{" "}
              <span className="text-accent-500">Healing</span>
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-10 font-light">
              Jaadu ki kaat is a sanctuary dedicated to providing spiritual
              relief to everyone, regardless of their financial means. Your
              Sadaqah and donations enable us to offer free consultations,
              maintain this platform, and reach those in desperate need of hope.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-spirit-800 flex items-center justify-center shrink-0 border border-white/10 text-accent-400 shadow-lg">
                  <HandHeart size={20} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-1">
                    Sponsor a Consultation
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Help someone receive the guidance they cannot afford.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-spirit-800 flex items-center justify-center shrink-0 border border-white/10 text-accent-400 shadow-lg">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-1">
                    Sustain the Sanctuary
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Keep our digital doors open and resources accessible to all.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-br from-accent-500 to-spirit-700 rounded-[2.5rem] blur opacity-40 group-hover:opacity-60 transition duration-1000"></div>
            <div className="relative bg-spirit-800/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-serif font-bold text-white mb-2">
                  Make a Contribution
                </h3>
                <p className="text-slate-400 text-sm">
                  Secure & Confidential Transaction
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {["2", "5", "10"].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleAmountClick(amount)}
                    className={`py-4 rounded-xl border font-bold transition-all ${
                      donationAmount === amount
                        ? "bg-accent-500 border-accent-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                        : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <div className="mb-8">
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    $
                  </span>
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
            <span className="text-accent-600 font-bold tracking-[0.3em] uppercase text-xs mb-3 block">
              Our Services
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-spirit-900">
              Spiritual Solutions
            </h2>
            <div className="w-24 h-1.5 bg-accent-500 mx-auto rounded-full mt-6 shadow-[0_0_15px_rgba(99,102,241,0.3)]"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicesList.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-[2rem] p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-spirit-50 group"
              >
                <div className="w-16 h-16 bg-spirit-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent-500 transition-colors duration-500 shadow-sm">
                  <service.icon className="w-8 h-8 text-spirit-900 group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-spirit-900 mb-4 group-hover:text-accent-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-slate-600 mb-8 leading-relaxed font-light h-20">
                  {service.description}
                </p>
                <button
                  onClick={() => openConsultModal(service.title)}
                  className="inline-flex items-center text-accent-600 font-bold uppercase tracking-widest text-xs group-hover:text-accent-500 hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  Consult Now{" "}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
            <span className="text-white font-bold tracking-widest text-xs uppercase">
              Community of Light
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 leading-tight drop-shadow-xl">
            Collective Prayers at the <br />
            <span className="text-accent-400">Holy Kaaba</span>
          </h2>

          <p className="text-xl text-slate-200 leading-relaxed mb-8 font-light drop-shadow-md">
            We gather Ism-e-Azam recitations and sacred Wazaif from our global
            community to present them in a grand collective prayer in front of
            the Holy Kaaba.
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
            <span className="text-accent-600 font-bold tracking-[0.3em] uppercase text-xs mb-4 block">
              Divine Guidance
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-spirit-900 mb-6 leading-tight">
              Online Istikhara For Future
            </h2>
            <div className="w-20 h-1.5 bg-accent-500 rounded-full mb-8"></div>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed font-light">
              Life often presents us with crossroads where the path forward
              seems veiled in mist. Whether you are considering a marriage
              proposal, starting a new business venture, or making a
              life-altering decision, relying solely on human logic isn't always
              enough.
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
              <p className="text-white font-serif font-bold text-xl">
                The Power of Divine Choice
              </p>
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
              <p className="text-white font-serif font-bold text-xl">
                Unlock Your Spiritual Potential
              </p>
            </div>
          </div>

          <div className="animate-fade-in-up">
            <span className="text-accent-600 font-bold tracking-[0.3em] uppercase text-xs mb-4 block">
              Spiritual Power
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-spirit-900 mb-6 leading-tight">
              Get Ism-e-Azam
            </h2>
            <div className="w-20 h-1.5 bg-accent-500 rounded-full mb-8"></div>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed font-light">
              The Ism-e-Azam is the Supreme Name of the Divine, a sacred key
              that unlocks the doors of acceptance for your deepest prayers.
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

      {/* NEW: Blog Carousel Section */}
      {blogPosts.length > 0 && (
        <section className="py-20 bg-white border-t border-slate-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
            <span className="text-accent-600 font-bold tracking-[0.3em] uppercase text-xs mb-3 block">
              Sacred Knowledge
            </span>
            <h2 className="text-4xl font-serif font-bold text-spirit-900">
              Wisdom & Insights
            </h2>
          </div>

          <div className="max-w-7xl mx-auto w-full group pb-8">
            <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-6 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {blogPosts.slice(0, 6).map((post) => (
                <div
                  key={post.id}
                  className="w-[85vw] sm:w-[350px] md:w-auto shrink-0 snap-center bg-white rounded-3xl border border-spirit-100 shadow-lg overflow-hidden flex flex-col h-[450px]"
                >
                  <div className="h-56 relative overflow-hidden">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                    <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-spirit-800 shadow-sm">
                      {post.category || "Wisdom"}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-serif font-bold text-xl text-spirit-900 mb-3 line-clamp-2 leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-3 mb-3 flex-grow">
                      {post.excerpt}
                    </p>
                    <Link
                      to={`/blog/${post.id}`}
                      className="w-full bg-spirit-50 text-spirit-900 font-bold py-3 rounded-xl hover:bg-spirit-900 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm mt-auto group/btn"
                    >
                      <Book size={16} /> <span>Read Article</span>{" "}
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            {blogPosts.length > 6 && (
              <div className="mt-12 text-center px-6">
                 <Link to="/blog" className="inline-flex items-center justify-center bg-spirit-900 text-white font-bold py-4 px-10 rounded-full shadow-lg hover:bg-spirit-800 transition-all hover:scale-105 active:scale-95 group">
                    <span>View All Insights</span>
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                 </Link>
              </div>
            )}
          </div>
        </section>
      )}
      
      {/* Target: home or / page sections */}
      {pageSections.filter(sec => sec.pageTarget === 'home' || sec.pageTarget === '/').map(section => (
         <DynamicSection key={section.id} section={section} />
      ))}

      {/* Insights Section */}
      <section id="contact" className="py-24 bg-white border-t border-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch">
          <div className="flex flex-col justify-center items-start">
            <span className="text-accent-600 font-bold tracking-[0.3em] uppercase text-xs mb-4 block">
              Here For You
            </span>
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-spirit-900 mb-6 leading-tight">
              Seek the Light, <br />
              Find Your Way.
            </h3>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed font-light">
              No matter how heavy the burden or how deep the darkness, spiritual
              relief is within reach. We are here to listen, guide, and help you
              overcome life's unseen challenges with compassion and
              confidentiality. Reach out to us today.
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
              <h2 className="text-4xl font-serif font-bold mb-6">
                Join the Circle of{" "}
                <span className="text-accent-400">Shifa</span>
              </h2>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                Stay connected with divine wisdom. Subscribe to receive sacred
                Wazaif, healing affirmations, and spiritual updates directly to
                your heart.
              </p>
              <form className="space-y-4">
                <input
                  type="email"
                  placeholder="Your Email Address"
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-accent-400 transition text-white text-lg"
                />
                <button className="w-full bg-accent-500 text-white font-bold py-4 rounded-2xl hover:bg-accent-600 transition shadow-xl flex items-center justify-center gap-3 text-lg group">
                  <span>Subscribe to Wisdom</span>{" "}
                  <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Modal */}
      {isDonationModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in overflow-hidden">
          <div
            className="absolute inset-0 bg-spirit-900/90 backdrop-blur-sm"
            onClick={() => setIsDonationModalOpen(false)}
          ></div>
          <div className="bg-white rounded-3xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden animate-fade-in-up border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="bg-spirit-900 px-6 py-4 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-serif font-bold text-white flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-accent-500 fill-accent-500" />{" "}
                  Complete Donation
                </h3>
              </div>
              <button
                onClick={() => setIsDonationModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleProcessPayment} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Name on Card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Card Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      {getCardIcon()}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="0000 0000 0000 0000"
                      maxLength={23}
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Expiry
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      CVC
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="123"
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-accent-500 text-white font-bold py-4 rounded-xl mt-2 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <CircleArrowRight size={18} />
                  )}
                  <span>
                    {isProcessing
                      ? "Processing..."
                      : `Donate $${customDonation || donationAmount}`}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Consultation Modal */}
      {isConsultModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in overflow-hidden">
          <div
            className="absolute inset-0 bg-spirit-900/90 backdrop-blur-sm"
            onClick={() => setIsConsultModalOpen(false)}
          ></div>
          <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden animate-fade-in-up border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="bg-spirit-900 px-6 py-4 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-serif font-bold text-white flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-accent-500" />{" "}
                  Consultation Request
                </h3>
                {consultService && (
                  <p className="text-xs text-slate-300 mt-1">
                    Service: {consultService}
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsConsultModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleConsultSubmit} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={consultName}
                  onChange={(e) => setConsultName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="Mother's Name"
                  value={consultMotherName}
                  onChange={(e) => setConsultMotherName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <input
                  type="date"
                  required
                  placeholder="Date of Birth"
                  value={consultDob}
                  onChange={(e) => setConsultDob(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-600"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone Number"
                  value={consultPhone}
                  onChange={(e) => setConsultPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={consultEmail}
                  onChange={(e) => setConsultEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={consultCity}
                    onChange={(e) => setConsultCity(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Country"
                    value={consultCountry}
                    onChange={(e) => setConsultCountry(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <input
                  type="text"
                  required
                  placeholder="Purpose of Consultation"
                  value={consultPurpose}
                  onChange={(e) => setConsultPurpose(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />

                <textarea
                  required
                  rows={4}
                  placeholder="Detailed Message / Situation..."
                  value={consultMessage}
                  onChange={(e) => setConsultMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"
                ></textarea>

                <button
                  type="submit"
                  disabled={isConsultSubmitting}
                  className="w-full bg-accent-500 text-white font-bold py-4 rounded-xl mt-2 flex items-center justify-center gap-2"
                >
                  {isConsultSubmitting ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <Send size={18} />
                  )}
                  <span>Submit Request</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Istikhara, Ism-e-Azam, Prayer, Contact Modals */}
      {isIstikharaModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in overflow-hidden">
          <div
            className="absolute inset-0 bg-spirit-900/90 backdrop-blur-sm"
            onClick={() => setIsIstikharaModalOpen(false)}
          ></div>
          <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 shadow-xl border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="bg-spirit-900 px-6 py-4 flex justify-between items-center shrink-0 rounded-t-3xl">
              <h3 className="text-lg font-serif font-bold text-white">
                Istikhara Request
              </h3>
              <button
                onClick={() => setIsIstikharaModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleIstikharaSubmit} className="space-y-4">
                <input
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition"
                  placeholder="Full Name"
                  value={istikharaName}
                  onChange={(e) => setIstikharaName(e.target.value)}
                  required
                />
                <input
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition"
                  placeholder="Mother's Name"
                  value={istikharaMotherName}
                  onChange={(e) => setIstikharaMotherName(e.target.value)}
                  required
                />
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-500 focus:ring-2 focus:ring-accent-500 transition"
                  placeholder="Date of Birth"
                  value={istikharaDob}
                  onChange={(e) => setIstikharaDob(e.target.value)}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="tel"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition"
                    placeholder="Phone Number"
                    value={istikharaPhone}
                    onChange={(e) => setIstikharaPhone(e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition"
                    placeholder="Email"
                    value={istikharaEmail}
                    onChange={(e) => setIstikharaEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition"
                    placeholder="City"
                    value={istikharaCity}
                    onChange={(e) => setIstikharaCity(e.target.value)}
                    required
                  />
                  <input
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition"
                    placeholder="Country"
                    value={istikharaCountry}
                    onChange={(e) => setIstikharaCountry(e.target.value)}
                    required
                  />
                </div>
                <input
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition"
                  placeholder="Purpose (e.g. Marriage, Business)"
                  value={istikharaPurpose}
                  onChange={(e) => setIstikharaPurpose(e.target.value)}
                  required
                />
                <textarea
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none focus:ring-2 focus:ring-accent-500 transition"
                  placeholder="Detailed Message / Situation..."
                  value={istikharaMessage}
                  onChange={(e) => setIstikharaMessage(e.target.value)}
                  rows={3}
                  required
                />

                <button
                  type="submit"
                  disabled={isConsultSubmitting}
                  className="w-full bg-spirit-900 text-white font-bold py-3 rounded-xl hover:bg-spirit-800 transition flex justify-center items-center gap-2"
                >
                  {isConsultSubmitting ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isIsmeAzamModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in overflow-hidden">
          <div
            className="absolute inset-0 bg-spirit-900/90 backdrop-blur-sm"
            onClick={() => setIsIsmeAzamModalOpen(false)}
          ></div>
          <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 shadow-xl border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="bg-spirit-900 px-6 py-4 flex justify-between items-center shrink-0 rounded-t-3xl">
              <h3 className="text-lg font-serif font-bold text-white">
                Ism-e-Azam Calculation
              </h3>
              <button
                onClick={() => setIsIsmeAzamModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleIsmeAzamSubmit} className="space-y-4">
                <input
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition"
                  placeholder="Full Name"
                  value={ismeAzamName}
                  onChange={(e) => setIsmeAzamName(e.target.value)}
                  required
                />
                <input
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition"
                  placeholder="Mother's Name"
                  value={ismeAzamMotherName}
                  onChange={(e) => setIsmeAzamMotherName(e.target.value)}
                  required
                />
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-500 focus:ring-2 focus:ring-accent-500 transition"
                  placeholder="Date of Birth"
                  value={ismeAzamDob}
                  onChange={(e) => setIsmeAzamDob(e.target.value)}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="tel"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition"
                    placeholder="Phone Number"
                    value={ismeAzamPhone}
                    onChange={(e) => setIsmeAzamPhone(e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition"
                    placeholder="Email"
                    value={ismeAzamEmail}
                    onChange={(e) => setIsmeAzamEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition"
                    placeholder="City"
                    value={ismeAzamCity}
                    onChange={(e) => setIsmeAzamCity(e.target.value)}
                    required
                  />
                  <input
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition"
                    placeholder="Country"
                    value={ismeAzamCountry}
                    onChange={(e) => setIsmeAzamCountry(e.target.value)}
                    required
                  />
                </div>
                <input
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition"
                  placeholder="Purpose / Problem"
                  value={ismeAzamPurpose}
                  onChange={(e) => setIsmeAzamPurpose(e.target.value)}
                  required
                />
                <textarea
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none focus:ring-2 focus:ring-accent-500 transition"
                  placeholder="Additional Details..."
                  value={ismeAzamMessage}
                  onChange={(e) => setIsmeAzamMessage(e.target.value)}
                  rows={3}
                  required
                />

                <button
                  type="submit"
                  disabled={isConsultSubmitting}
                  className="w-full bg-accent-500 text-white font-bold py-3 rounded-xl hover:bg-accent-600 transition flex justify-center items-center gap-2"
                >
                  {isConsultSubmitting ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    "Calculate Ism-e-Azam"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isPrayerRequestModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in overflow-hidden">
          <div
            className="absolute inset-0 bg-spirit-900/90 backdrop-blur-sm"
            onClick={() => setIsPrayerRequestModalOpen(false)}
          ></div>
          <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden animate-fade-in-up border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="bg-spirit-900 px-6 py-4 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-serif font-bold text-white flex items-center">
                  <HandHeart className="w-4 h-4 mr-2 text-accent-500" /> Prayer
                  Request
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Join the Collective Prayer
                </p>
              </div>
              <button
                onClick={() => setIsPrayerRequestModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form onSubmit={handlePrayerRequestSubmit} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={prayerRequestName}
                  onChange={(e) => setPrayerRequestName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="Mother's Name"
                  value={prayerRequestMotherName}
                  onChange={(e) => setPrayerRequestMotherName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <input
                  type="date"
                  required
                  placeholder="Date of Birth"
                  value={prayerRequestDob}
                  onChange={(e) => setPrayerRequestDob(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-600"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    value={prayerRequestPhone}
                    onChange={(e) => setPrayerRequestPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={prayerRequestEmail}
                    onChange={(e) => setPrayerRequestEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={prayerRequestCity}
                    onChange={(e) => setPrayerRequestCity(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Country"
                    value={prayerRequestCountry}
                    onChange={(e) => setPrayerRequestCountry(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="What You Have Recited?"
                    value={prayerRequestRecitation}
                    onChange={(e) => setPrayerRequestRecitation(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                  <input
                    type="number"
                    required
                    placeholder="Count (How many times)"
                    value={prayerRequestRecitationCount}
                    onChange={(e) =>
                      setPrayerRequestRecitationCount(e.target.value)
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <input
                  type="text"
                  required
                  placeholder="Purpose (e.g. Health, Success)"
                  value={prayerRequestPurpose}
                  onChange={(e) => setPrayerRequestPurpose(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <textarea
                  required
                  rows={3}
                  placeholder="Your Message or Specific Duaa..."
                  value={prayerRequestMessage}
                  onChange={(e) => setPrayerRequestMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"
                ></textarea>

                <button
                  type="submit"
                  disabled={isConsultSubmitting}
                  className="w-full bg-accent-500 text-white font-bold py-4 rounded-xl mt-2 flex items-center justify-center gap-2"
                >
                  {isConsultSubmitting ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <Send size={18} />
                  )}
                  <span>Submit Prayer Request</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isContactModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-spirit-900/90 backdrop-blur-sm"
            onClick={() => setIsContactModalOpen(false)}
          ></div>
          <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 shadow-xl border border-slate-100 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-bold text-spirit-900">
                Contact Us
              </h3>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="text-slate-400 hover:text-spirit-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <input
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-spirit-500 transition"
                placeholder="Email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
              />
              <input
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-spirit-500 transition"
                placeholder="Phone Number"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
              />
              <textarea
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none focus:ring-2 focus:ring-spirit-500 transition"
                placeholder="Message"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={4}
                required
              />
              <button
                type="submit"
                disabled={isConsultSubmitting}
                className="w-full bg-spirit-900 text-white font-bold py-3 rounded-xl hover:bg-spirit-800 transition flex justify-center items-center gap-2"
              >
                {isConsultSubmitting ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-spirit-900/80 backdrop-blur-sm"
            onClick={() => setIsSuccessModalOpen(false)}
          ></div>
          <div className="bg-white rounded-3xl p-8 max-w-sm text-center relative z-10 shadow-2xl animate-bounce-slow">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CircleCheck className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-spirit-900 mb-2">
              Request Received
            </h3>
            <p className="text-slate-500 mb-6">
              We have received your details. A spiritual advisor will review it
              shortly.
            </p>
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="bg-spirit-900 text-white px-8 py-3 rounded-full font-bold hover:bg-spirit-800 transition"
            >
              Alhamdulillah
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
