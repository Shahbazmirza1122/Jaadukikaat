
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Heart, Star, Check, ShieldCheck, Truck, RotateCcw, Loader2, Tag, XCircle, Lock, Zap } from 'lucide-react';
import { products as staticProducts, Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          // Fallback to static data
          const found = staticProducts.find(p => p.id === id);
          if (found) {
             setProduct(found);
          } else {
             navigate('/store'); // Redirect if not found
          }
        } else {
           // Map DB columns to Product Type
           setProduct({
             id: data.id,
             name: data.name,
             price: data.price,
             image: data.image,
             category: data.category,
             description: data.description,
             sku: data.sku,
             salePrice: data.sale_price,
             saleStart: data.sale_start,
             saleEnd: data.sale_end,
             isOutOfStock: data.is_out_of_stock,
             isBlurBeforeBuy: data.is_blur_before_buy
           });
        }
      } catch (err) {
        // Fallback
        const found = staticProducts.find(p => p.id === id);
        if (found) setProduct(found);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (product && !product.isOutOfStock) {
      addToCart(product);
      alert(`${product.name} added to cart!`);
    }
  };

  const handleBuyNow = () => {
    if (product && !product.isOutOfStock) {
        addToCart(product);
        // Navigate to cart with a state flag to open checkout immediately
        navigate('/cart', { state: { openCheckout: true } });
    }
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

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          {/* Back Button Skeleton */}
          <div className="h-6 w-32 bg-slate-100 rounded mb-8"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
            {/* Image Skeleton */}
            <div className="space-y-6">
              <div className="aspect-square bg-slate-100 rounded-[2rem] border border-slate-50"></div>
            </div>

            {/* Details Skeleton */}
            <div className="flex flex-col">
              {/* Badges */}
              <div className="flex gap-2 mb-6">
                <div className="h-6 w-20 bg-slate-100 rounded-full"></div>
                <div className="h-6 w-24 bg-slate-100 rounded-full"></div>
              </div>
              
              {/* Title */}
              <div className="h-12 w-3/4 bg-slate-100 rounded-xl mb-6"></div>
              
              {/* Price & Rating */}
              <div className="flex items-center space-x-4 mb-8">
                <div className="h-10 w-24 bg-slate-100 rounded-lg"></div>
                <div className="h-6 w-32 bg-slate-100 rounded-lg"></div>
              </div>

              {/* Description */}
              <div className="space-y-4 mb-8">
                <div className="h-4 w-full bg-slate-100 rounded"></div>
                <div className="h-4 w-full bg-slate-100 rounded"></div>
                <div className="h-4 w-2/3 bg-slate-100 rounded"></div>
              </div>

              {/* Checklist */}
              <div className="space-y-4 mb-8">
                <div className="h-5 w-48 bg-slate-100 rounded"></div>
                <div className="h-5 w-48 bg-slate-100 rounded"></div>
                <div className="h-5 w-48 bg-slate-100 rounded"></div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="h-24 bg-slate-100 rounded-xl"></div>
                <div className="h-24 bg-slate-100 rounded-xl"></div>
                <div className="h-24 bg-slate-100 rounded-xl"></div>
              </div>

              {/* Buttons */}
              <div className="mt-auto flex flex-row gap-2 sm:gap-4">
                <div className="h-14 sm:h-16 flex-1 bg-slate-100 rounded-xl"></div>
                <div className="h-14 sm:h-16 flex-1 bg-slate-100 rounded-xl"></div>
                <div className="h-14 sm:h-16 w-14 sm:w-20 bg-slate-100 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const onSale = isSaleActive(product);
  const currentPrice = onSale ? product.salePrice : product.price;

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-slate-500 hover:text-spirit-900 font-bold mb-8 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to Store
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery Side */}
          <div className="space-y-6">
            <div className="aspect-square bg-spirit-50 rounded-[2rem] overflow-hidden shadow-lg border border-spirit-100 relative group">
              <img 
                src={product.image} 
                alt={product.name} 
                className={`w-full h-full object-cover transition-transform duration-700 
                    ${product.isOutOfStock ? 'grayscale opacity-60' : 'hover:scale-105'}
                    ${product.isBlurBeforeBuy ? 'blur-xl scale-110' : ''}
                `}
              />
               
               {/* Blur Overlay */}
               {product.isBlurBeforeBuy && !product.isOutOfStock && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center">
                        <div className="bg-black/30 backdrop-blur-sm p-4 rounded-2xl border border-white/20 text-white shadow-2xl">
                            <Lock size={32} className="mx-auto mb-2 opacity-80" />
                            <p className="font-bold uppercase tracking-widest text-sm">Purchase to Unlock</p>
                            <p className="text-[10px] text-slate-200 mt-1">This item contains hidden spiritual content.</p>
                        </div>
                    </div>
               )}

               {product.isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none z-20">
                         <div className="bg-red-600 text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest text-lg shadow-2xl transform rotate-[-5deg]">
                            Out of Stock
                         </div>
                    </div>
               )}
            </div>
          </div>

          {/* Product Details Side */}
          <div className="flex flex-col">
            <div className="mb-4 flex flex-wrap gap-2">
               <span className="bg-accent-50 text-accent-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                 {product.category}
               </span>
               {product.sku && (
                   <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                     SKU: {product.sku}
                   </span>
               )}
               {onSale && !product.isOutOfStock && (
                   <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                     <Tag size={12} /> On Sale
                   </span>
               )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-spirit-900 mb-4 leading-tight">{product.name}</h1>
            
            <div className="flex items-center space-x-4 mb-6">
              {onSale ? (
                  <div className="flex items-baseline gap-3">
                      <div className="text-3xl font-bold text-red-600">{currentPrice}</div>
                      <div className="text-xl text-slate-400 line-through">{product.price}</div>
                  </div>
              ) : (
                  <div className="text-3xl font-bold text-accent-600">{product.price}</div>
              )}
              
              <div className="flex items-center text-yellow-400 border-l border-slate-200 pl-4 ml-4">
                <Star className="fill-current w-5 h-5" />
                <Star className="fill-current w-5 h-5" />
                <Star className="fill-current w-5 h-5" />
                <Star className="fill-current w-5 h-5" />
                <Star className="fill-current w-5 h-5" />
                <span className="text-slate-400 text-sm ml-2 font-bold">(5.0)</span>
              </div>
            </div>

            <div className="prose prose-lg text-slate-600 mb-8 font-light leading-relaxed">
              <p>{product.description || "Experience spiritual tranquility with this sacred item, curated to enhance your connection and bring peace to your daily life."}</p>
            </div>

            <div className="space-y-4 mb-8">
               <div className="flex items-center text-sm text-slate-600">
                  {product.isOutOfStock ? (
                      <span className="flex items-center text-red-600 font-bold"><XCircle className="w-5 h-5 mr-3" /> Currently Out of Stock</span>
                  ) : (
                      <span className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-3" /> In Stock & Ready to Ship</span>
                  )}
               </div>
               <div className="flex items-center text-sm text-slate-600">
                 <Check className="w-5 h-5 text-green-500 mr-3" /> Spiritually Cleansed
               </div>
               <div className="flex items-center text-sm text-slate-600">
                 <Check className="w-5 h-5 text-green-500 mr-3" /> Includes Usage Instructions
               </div>
            </div>

            {/* Features Icons - Moved and Animated */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-lg hover:bg-white hover:border-spirit-100 transition-all duration-300 transform hover:-translate-y-1 cursor-default group">
                <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-spirit-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide group-hover:text-spirit-600 transition-colors">Authentic</span>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-lg hover:bg-white hover:border-spirit-100 transition-all duration-300 transform hover:-translate-y-1 cursor-default group">
                <Truck className="w-6 h-6 mx-auto mb-2 text-spirit-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide group-hover:text-spirit-600 transition-colors">Worldwide</span>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-lg hover:bg-white hover:border-spirit-100 transition-all duration-300 transform hover:-translate-y-1 cursor-default group">
                <RotateCcw className="w-6 h-6 mx-auto mb-2 text-spirit-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide group-hover:text-spirit-600 transition-colors">Returns</span>
              </div>
            </div>

            <div className="mt-auto space-y-4">
              <div className="flex flex-row gap-2 sm:gap-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={!!product.isOutOfStock}
                  className={`flex-1 font-bold py-3 px-3 sm:py-4 sm:px-6 rounded-xl shadow-md flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-lg transition-all ${product.isOutOfStock ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-white border-2 border-spirit-900 text-spirit-900 hover:bg-spirit-50'}`}
                >
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" /> 
                  <span className="sm:hidden">Add</span>
                  <span className="hidden sm:inline">Add to Cart</span>
                </button>
                
                <button 
                  onClick={handleBuyNow}
                  disabled={!!product.isOutOfStock}
                  className={`flex-1 font-bold py-3 px-3 sm:py-4 sm:px-6 rounded-xl shadow-xl flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-lg transition-all ${product.isOutOfStock ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-accent-500 text-white hover:bg-accent-600 hover:shadow-2xl'}`}
                >
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> 
                  <span className="sm:hidden">Buy</span>
                  <span className="hidden sm:inline">Buy Now</span>
                </button>

                <button 
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`px-3 sm:px-6 rounded-xl border-2 flex items-center justify-center transition-colors ${isWishlisted ? 'border-red-500 text-red-500 bg-red-50' : 'border-slate-200 text-slate-400 hover:border-red-400 hover:text-red-400'}`}
                >
                  <Heart className={`w-6 h-6 sm:w-8 sm:h-8 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
              <p className="text-center text-xs text-slate-400">Secure Checkout • Satisfaction Guaranteed</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
