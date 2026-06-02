
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Search, Filter, ArrowRight, Loader2, Tag, Lock } from 'lucide-react';
import { products as staticProducts, Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

const StorePage: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase error fetching products (falling back to static):', error.message || JSON.stringify(error));
        setProductsList(staticProducts);
      } else if (!data || data.length === 0) {
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
             isBlurBeforeBuy: p.is_blur_before_buy
        }));
        setProductsList(mapped);
      }
    } catch (err) {
      console.error('Unexpected error fetching products:', err);
      setProductsList(staticProducts);
    } finally {
      setIsLoading(false);
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

  const categories = ['All', ...Array.from(new Set(productsList.map(p => p.category)))];

  const filteredProducts = productsList.filter(product => {
    const matchesCategory = filter === 'All' || product.category === filter;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in pt-8">
          <span className="text-accent-600 font-bold tracking-[0.4em] uppercase text-xs mb-4 block">Sacred Store</span>
          <h1 className="text-5xl font-serif font-bold text-spirit-900 mb-6">Spiritual Essentials</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
            Curated tools to enhance your spiritual journey, protection, and peace. Each item is spiritually cleansed before shipping.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-spirit-50 p-4 rounded-2xl border border-spirit-100 animate-fade-in">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  filter === cat 
                    ? 'bg-spirit-900 text-white shadow-md' 
                    : 'bg-white text-slate-600 hover:bg-white hover:text-accent-600 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2.5 rounded-full border border-slate-200 focus:ring-2 focus:ring-accent-500 outline-none text-sm bg-white"
            />
          </div>
        </div>

        {isLoading ? (
             <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-spirit-500 w-10 h-10" /></div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
            {filteredProducts.map((product, index) => {
                const onSale = isSaleActive(product);
                const currentPrice = onSale ? product.salePrice : product.price;

                return (
                  <Link to={`/product/${product.id}`} key={product.id} className="bg-spirit-900 rounded-[2rem] shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col relative h-[480px]">
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
                      <div className="h-60 w-full relative rounded-t-[2rem] overflow-hidden bg-white/5 border-b border-white/10">
                          <img 
                              src={product.image} 
                              alt={product.name}
                              loading={index < 6 ? "eager" : "lazy"}
                              className={`w-full h-full object-cover transform group-hover:scale-110 transition duration-700 
                                  ${product.isOutOfStock ? 'grayscale opacity-70' : ''} 
                                  ${product.isBlurBeforeBuy ? 'blur-md scale-110' : ''}
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
                                  <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold uppercase text-xs tracking-wider shadow-lg">Out of Stock</span>
                              </div>
                          )}
                          
                          {/* Overlay Actions */}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 z-10">
                             <button 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-lg ${wishlist.includes(product.id) ? 'bg-red-500 text-white' : 'bg-white text-spirit-900 hover:text-red-500'}`}
                              >
                                <Heart size={20} className={wishlist.includes(product.id) ? 'fill-current' : ''} />
                             </button>
                          </div>
                      </div>
                      
                      {/* Bottom Container */}
                      <div className="p-4 flex-grow flex flex-col relative bg-spirit-900 rounded-b-[2rem]">
                          <div className="border-[3px] border-accent-500 rounded-2xl p-4 flex-grow flex relative mb-2">
                              {/* Left Column */}
                              <div className="w-[58%] pr-3 flex flex-col">
                                  <h3 className="font-sans font-bold text-lg leading-tight uppercase tracking-wide text-white mb-2 line-clamp-2">{product.name}</h3>
                                  <p className="text-[10px] text-slate-300 line-clamp-4 leading-relaxed mb-auto">{product.description}</p>
                                  <div className="flex text-yellow-400 text-sm mt-3 tracking-widest">
                                      ★★★★★
                                  </div>
                              </div>

                              {/* Divider */}
                              <div className="w-[1px] bg-white/20 my-1"></div>

                              {/* Right Column */}
                              <div className="w-[42%] pl-3 flex flex-col justify-start gap-4 mt-1">
                                  <div>
                                      <div className="font-bold text-[8px] text-white/50 uppercase tracking-wider mb-0.5">Category</div>
                                      <div className="text-[10px] text-white line-clamp-2 leading-tight">{product.category}</div>
                                  </div>
                                  <div>
                                      <div className="font-bold text-[8px] text-white/50 uppercase tracking-wider mb-0.5">SKU</div>
                                      <div className="text-[10px] text-white line-clamp-1 leading-tight">{product.sku}</div>
                                  </div>
                                  <div>
                                      <div className="font-bold text-[8px] text-white/50 uppercase tracking-wider mb-0.5">Status</div>
                                      <div className="text-[10px] text-white leading-tight">{product.isOutOfStock ? 'Sold Out' : 'Available'}</div>
                                  </div>
                              </div>

                              {/* Button */}
                              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-max z-30">
                                  <button 
                                      onClick={(e) => handleAddToCart(e, product)}
                                      disabled={!!product.isOutOfStock}
                                      className={`px-8 py-2 rounded-full font-bold text-xs shadow-xl uppercase tracking-wider transition-colors 
                                          ${product.isOutOfStock ? 'bg-slate-500 text-slate-300 cursor-not-allowed border-none' : 'bg-white text-accent-600 hover:text-white hover:bg-accent-600 border border-transparent'}
                                      `}
                                  >
                                      {product.isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                                  </button>
                              </div>
                          </div>
                      </div>
                  </Link>
                );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-spirit-50 rounded-3xl animate-fade-in">
             <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-slate-600">No products found</h3>
             <p className="text-slate-500 mt-2">Try adjusting your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorePage;
