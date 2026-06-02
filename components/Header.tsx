
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, ShoppingCart, User as UserIcon, LogOut, Package, ChevronDown, ArrowDown, ArrowUp } from 'lucide-react';
import DailyDuaa from './DailyDuaa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<{id: string, name: string, description: string, imageUrl: string}[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  
  const servicesMenuRef = useRef<HTMLDivElement>(null);

  const scrollServicesMenu = (direction: 'up' | 'down') => {
    if (servicesMenuRef.current) {
        // Approximate height of one row (card height + grid gap)
        const scrollAmount = 250;
        servicesMenuRef.current.scrollBy({ top: direction === 'down' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchServiceCategories = async () => {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setServiceCategories(data.map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          imageUrl: c.image_url
      })));
    }
  };

  useEffect(() => {
    fetchServiceCategories();
  }, []);

  const toggleServicesMenu = () => {
    const newState = !servicesMenuOpen;
    setServicesMenuOpen(newState);
    if (newState) {
      fetchServiceCategories();
    }
  };

  const navLinks = [
    { label: 'About', path: '/#about' },
    { label: 'Services', path: '/#services' },
    { label: 'Products', path: '/store' },
    { label: 'Contact', path: '/#contact' },
    { label: 'Blog', path: '/blog' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path.startsWith('/#')) {
      const hash = path.substring(1); 
      const id = hash.substring(1);   

      if (location.pathname === '/') {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else if (id === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <div className="fixed w-full z-50 flex flex-col transition-all duration-300">
      {/* Primary Navigation Bar */}
      <header 
        className={`relative z-[60] w-full transition-all duration-300 border-b ${
          scrolled 
            ? 'bg-white/98 backdrop-blur-md shadow-lg py-1 md:py-2 border-slate-100' 
            : 'bg-spirit-900/85 backdrop-blur-md py-2 md:py-4 border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" onClick={(e) => handleNavClick(e, '/#top')} className="flex items-center group">
              <img src="https://res.cloudinary.com/dq0ccjs6y/image/upload/v1770399481/Jaadu_Ki-removebg-preview_wnzo57.png" alt="Jaadu ki kaat Logo" className={`transition-all duration-300 ${scrolled ? 'h-12 md:h-20 -my-2 md:-my-4 invert' : 'h-16 md:h-24 -my-2 md:-my-4'}`} />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex items-center space-x-8">
                {navLinks.map((link) => (
                  <div key={link.label} className="relative group/nav">
                    {link.label === 'Services' ? (
                      <button
                        onClick={toggleServicesMenu}
                        className={`text-xs font-sans font-bold uppercase tracking-[0.2em] transition-all hover:scale-105 flex items-center ${
                          scrolled 
                            ? 'text-slate-600 hover:text-accent-600' 
                            : 'text-white/90 hover:text-accent-300 drop-shadow-sm'
                        } ${servicesMenuOpen ? 'text-accent-600' : ''}`}
                      >
                        {link.label}
                        <ChevronDown size={14} className={`ml-1 transition-transform ${servicesMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                    ) : (
                      <Link
                        to={link.path}
                        onClick={(e) => handleNavClick(e, link.path)}
                        className={`text-xs font-sans font-bold uppercase tracking-[0.2em] transition-all hover:scale-105 inline-block ${
                          scrolled 
                            ? 'text-slate-600 hover:text-accent-600' 
                            : 'text-white/90 hover:text-accent-300 drop-shadow-sm'
                        } ${location.hash === link.path.substring(1) || (link.path === '/blog' && location.pathname === '/blog') ? 'border-b-2 border-accent-500 pb-1 text-accent-600' : ''}`}
                      >
                        {link.label}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                  {/* Cart Icon (Desktop) */}
                  <Link to="/cart" className={`relative p-2 transition-colors ${scrolled ? 'text-spirit-900 hover:text-accent-600' : 'text-white hover:text-accent-300'}`}>
                    <ShoppingCart size={24} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md border-2 border-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  {/* Auth Menu (Desktop) */}
                  {isAuthenticated && user ? (
                    <div className="relative">
                      <button 
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className={`flex items-center gap-2 font-bold text-sm transition-transform ${userMenuOpen ? 'scale-110' : ''} ${scrolled ? 'text-spirit-900' : 'text-white'}`}
                      >
                         <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white border-2 transition-colors ${userMenuOpen ? 'border-accent-300 bg-accent-600' : 'border-transparent bg-accent-500'}`}>
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                         </div>
                      </button>
                      
                      {/* Dropdown Menu */}
                      {userMenuOpen && (
                         <>
                           <div className="fixed inset-0 z-[90]" onClick={() => setUserMenuOpen(false)} />
                           <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden animate-fade-in z-[100] origin-top-right ring-1 ring-black/5">
                              <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
                                 <p className="text-sm font-bold text-spirit-900 truncate">{user.name}</p>
                                 <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                              </div>
                              <div className="p-2">
                                <Link 
                                  to="/orders" 
                                  onClick={() => setUserMenuOpen(false)}
                                  className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-spirit-900 rounded-xl flex items-center gap-3 transition-colors font-medium mb-1"
                                >
                                   <Package size={16} /> 
                                   <span>My Orders</span>
                                </Link>
                                <Link 
                                  to="/cart" 
                                  onClick={() => setUserMenuOpen(false)}
                                  className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-spirit-900 rounded-xl flex items-center gap-3 transition-colors font-medium mb-1"
                                >
                                   <ShoppingCart size={16} /> 
                                   <span>Cart</span>
                                </Link>
                                <button 
                                  onClick={handleLogout}
                                  className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl flex items-center gap-3 transition-colors font-medium"
                                >
                                   <LogOut size={16} /> 
                                   <span>Sign Out</span>
                                </button>
                              </div>
                           </div>
                         </>
                      )}
                    </div>
                  ) : (
                    <Link 
                        to="/login"
                        className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg border transition-all ${
                            scrolled 
                                ? 'border-spirit-900 text-spirit-900 hover:bg-spirit-900 hover:text-white' 
                                : 'border-white/30 text-white hover:bg-white hover:text-spirit-900'
                        }`}
                    >
                        Login
                    </Link>
                  )}
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-4">
               {/* Cart Icon (Mobile) */}
               <Link to="/cart" className={`relative p-2 transition-colors ${scrolled ? 'text-spirit-900' : 'text-white'}`}>
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button 
                className={`p-2 rounded-lg transition-colors ${
                  scrolled ? 'text-spirit-900 hover:bg-slate-100' : 'text-white hover:bg-white/10'
                }`}
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="md:hidden bg-white absolute top-full left-0 w-full shadow-2xl border-t border-slate-100 animate-fade-in-up">
            <div className="flex flex-col py-8 px-8 space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={(e) => handleNavClick(e, link.path)}
                  className="text-xl font-serif font-bold text-spirit-900 hover:text-accent-600 flex items-center justify-between group"
                >
                  {link.label}
                  <div className="w-2 h-2 rounded-full bg-accent-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
              ))}
              
              <div className="border-t border-slate-100 pt-6 space-y-4">
                  <Link 
                    to="/cart"
                    onClick={() => setIsOpen(false)}
                    className="text-xl font-serif font-bold text-spirit-900 hover:text-accent-600 flex items-center justify-between group"
                  >
                    Shopping Cart
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-sans text-slate-500">({cartCount})</span>
                      <ShoppingCart size={20} />
                    </div>
                  </Link>

                  {isAuthenticated && user ? (
                     <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center text-white font-bold">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                           </div>
                           <div>
                               <p className="font-bold text-spirit-900">{user.name}</p>
                               <p className="text-xs text-slate-500">Logged In</p>
                           </div>
                        </div>
                        <Link to="/orders" onClick={() => setIsOpen(false)} className="text-spirit-600 font-bold flex items-center gap-2"><Package size={18}/> My Orders</Link>
                        <button onClick={handleLogout} className="text-red-500 font-bold text-sm text-left flex items-center gap-2"><LogOut size={18}/> Logout</button>
                     </div>
                  ) : (
                    <Link 
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="block w-full text-center bg-spirit-900 text-white font-bold py-3 rounded-xl"
                    >
                        Login / Sign Up
                    </Link>
                  )}
              </div>
            </div>
          </div>
        )}
        {/* Services Full Width Mega Menu */}
        {servicesMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-2xl border-t border-slate-100 z-[80] animate-fade-in origin-top">
            <div className="max-w-7xl mx-auto px-8 pt-8 pb-4 relative flex flex-col">
              <button 
                onClick={() => setServicesMenuOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-spirit-900 transition-colors z-[90]"
                aria-label="Close services menu"
              >
                <X size={24} />
              </button>
              
              <div className="mb-4 border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-serif font-bold text-spirit-900">Our Services</h2>
                <p className="text-sm text-slate-500 mt-1">Explore our range of spiritual offerings and guidance</p>
              </div>

              {/* Scrollable Container */}
              <div className="relative">
                  <div 
                      ref={servicesMenuRef} 
                      className="max-h-[50vh] overflow-y-auto hide-scrollbar scroll-smooth pr-16" 
                      style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                  >
                      {serviceCategories.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-6">
                          {serviceCategories.map((category) => (
                            <Link
                              key={category.id}
                              to={`/service-category/${category.id}`}
                              onClick={() => setServicesMenuOpen(false)}
                              className="group flex flex-col items-center bg-slate-50 rounded-2xl p-4 transition-all hover:bg-spirit-50 hover:shadow-md border border-transparent hover:border-spirit-200"
                            >
                              {category.imageUrl ? (
                                <div className="w-full h-32 rounded-xl overflow-hidden mb-4 bg-slate-200">
                                   <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                              ) : (
                                <div className="w-full h-32 rounded-xl mb-4 bg-spirit-100 flex items-center justify-center text-spirit-300">
                                  <Package size={40} />
                                </div>
                              )}
                              <h3 className="font-bold text-spirit-900 group-hover:text-accent-600 transition-colors text-center">{category.name}</h3>
                              <p className="text-xs text-slate-500 mt-2 line-clamp-2 text-center">{category.description}</p>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-500">
                          <p>No service categories available at the moment.</p>
                        </div>
                      )}
                  </div>
                  
                  {/* Internal Scroll Buttons - absolute to this section */}
                  {serviceCategories.length > 4 && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-3 py-4 bg-white/90 backdrop-blur-sm px-2 rounded-xl shadow-lg border border-slate-100">
                          <button 
                              onClick={() => scrollServicesMenu('up')}
                              className="p-2 transition-all hover:scale-110 active:scale-95 text-slate-400 hover:text-spirit-900 border border-transparent hover:border-slate-200 rounded-full"
                              aria-label="Scroll Up"
                          >
                              <ArrowUp size={24} />
                          </button>
                          <div className="w-full h-[1px] bg-slate-100"></div>
                          <button 
                              onClick={() => scrollServicesMenu('down')}
                              className="p-2 transition-all hover:scale-110 active:scale-95 text-slate-400 hover:text-spirit-900 border border-transparent hover:border-slate-200 rounded-full"
                              aria-label="Scroll Down"
                          >
                              <ArrowDown size={24} />
                          </button>
                      </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* Daily Duaa Bar */}
      <div className="w-full">
        <DailyDuaa />
      </div>
    </div>
  );
};

export default Header;
