
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Search, Filter, ArrowRight, Loader2 } from 'lucide-react';
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
        // Fallback if no data is found either
        setProductsList(staticProducts);
      } else {
        setProductsList(data);
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
    addToCart(product);
    alert(`${product.name} added to cart!`);
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
            {filteredProducts.map(product => (
              <Link to={`/product/${product.id}`} key={product.id} className="bg-white rounded-[2rem] p-4 shadow-lg hover:shadow-2xl transition-all duration-300 group border border-spirit-100 flex flex-col h-full">
                {/* Image Area */}
                <div className="h-72 rounded-3xl overflow-hidden mb-6 relative bg-spirit-50">
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
                    <h3 className="font-serif font-bold text-xl text-spirit-900 mb-2 truncate group-hover:text-accent-600 transition-colors" title={product.name}>{product.name}</h3>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-50">
                        <span className="text-accent-600 font-bold text-xl">{product.price}</span>
                        <button 
                            onClick={(e) => handleAddToCart(e, product)}
                            className="px-5 py-2.5 rounded-full bg-spirit-900 text-white flex items-center gap-2 hover:bg-accent-600 transition-colors text-sm font-bold shadow-md active:scale-95"
                        >
                            <ShoppingBag size={16} /> Add
                        </button>
                    </div>
                </div>
              </Link>
            ))}
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
