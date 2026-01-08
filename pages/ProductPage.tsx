
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Heart, Star, Check, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { products, Product } from '../data/products';
import { useCart } from '../context/CartContext';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const found = products.find(p => p.id === id);
    if (found) {
      setProduct(found);
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      alert(`${product.name} added to cart!`);
    }
  };

  if (!product) return null;

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
            <div className="aspect-square bg-spirit-50 rounded-[2rem] overflow-hidden shadow-lg border border-spirit-100">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Features Icons */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-spirit-600" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Authentic</span>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                <Truck className="w-6 h-6 mx-auto mb-2 text-spirit-600" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Worldwide</span>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                <RotateCcw className="w-6 h-6 mx-auto mb-2 text-spirit-600" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Returns</span>
              </div>
            </div>
          </div>

          {/* Product Details Side */}
          <div className="flex flex-col">
            <div className="mb-2">
               <span className="bg-accent-50 text-accent-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                 {product.category}
               </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-spirit-900 mb-4 leading-tight">{product.name}</h1>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-3xl font-bold text-accent-600">{product.price}</div>
              <div className="flex items-center text-yellow-400">
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
                 <Check className="w-5 h-5 text-green-500 mr-3" /> In Stock & Ready to Ship
               </div>
               <div className="flex items-center text-sm text-slate-600">
                 <Check className="w-5 h-5 text-green-500 mr-3" /> Spiritually Cleansed
               </div>
               <div className="flex items-center text-sm text-slate-600">
                 <Check className="w-5 h-5 text-green-500 mr-3" /> Includes Usage Instructions
               </div>
            </div>

            <div className="mt-auto space-y-4">
              <div className="flex gap-4">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-spirit-900 text-white font-bold py-4 rounded-xl hover:bg-accent-600 transition-all shadow-xl flex items-center justify-center gap-3 text-lg"
                >
                  <ShoppingBag className="w-6 h-6" /> Add to Cart
                </button>
                <button 
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`px-6 rounded-xl border-2 flex items-center justify-center transition-colors ${isWishlisted ? 'border-red-500 text-red-500 bg-red-50' : 'border-slate-200 text-slate-400 hover:border-red-400 hover:text-red-400'}`}
                >
                  <Heart className={`w-8 h-8 ${isWishlisted ? 'fill-current' : ''}`} />
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
