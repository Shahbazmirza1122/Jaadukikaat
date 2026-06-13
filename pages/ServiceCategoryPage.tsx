import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Product } from "../data/products";
import { BlogPost } from "../types";
import { Tag, Lock, Heart, Book, X } from "lucide-react";
import { BlogSectionsRenderer } from "../components/BlogSectionsRenderer";

// Custom Typewriter component
// ...

const Typewriter = ({ text, delay = 100 }: { text: string; delay?: number }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentText('');
        setCurrentIndex(0);
      }, 3000); // 3-second pause before restarting the loop
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return (
    <span>
      {currentText}
      {currentIndex < text.length && (
        <span className="animate-pulse border-r-[3px] border-white ml-1.5 opacity-70 h-[0.9em] inline-block align-middle"></span>
      )}
    </span>
  );
};

export default function ServiceCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [blogSections, setBlogSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { addToCart } = useCart();
  const { purchasedProductIds } = useAuth();
  const [selectedWrapProduct, setSelectedWrapProduct] = useState<Product | null>(null);

  const toggleWishlist = (productId: string) => {
      setWishlist(prev => 
          prev.includes(productId) 
              ? prev.filter(id => id !== productId)
              : [...prev, productId]
      );
  };

  const isSaleActive = (product: any) => {
      if (!product.saleStart && !product.saleEnd) return false;
      const now = new Date();
      const start = product.saleStart ? new Date(product.saleStart) : null;
      const end = product.saleEnd ? new Date(product.saleEnd) : null;
      
      if (start && now < start) return false;
      if (end && now > end) return false;
      return true;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      // Fetch category
      const { data: catData } = await supabase
        .from("service_categories")
        .select("*")
        .eq("id", id)
        .single();


      if (catData) setCategory(catData);

      const relatedProductIds = catData?.related_products || [];
      const relatedArticleIds = catData?.related_articles || [];

      let queryProducts = supabase.from("products").select("*");
      if (relatedProductIds.length > 0) {
        queryProducts = queryProducts.in("id", relatedProductIds);
      } else {
        queryProducts = queryProducts.limit(4);
      }

      const { data: prodData } = await queryProducts;

      if (prodData) {
        setProducts(
          prodData.map((p: any) => ({
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
            isWrapBeforeBuy: p.is_wrap_before_buy,
          })),
        );
      }

      let queryPosts = supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .neq("category", "_page_section_")
        .neq("category", "_form_lead_")
        .neq("category", "_banner_")
        .neq("category", "_blog_section_");

      // We need all posts so BlogSectionsRenderer can pick specific posts if assigned.
      const [blogsRes, sectionsRes] = await Promise.all([
          queryPosts,
          supabase.from('posts').select('*').eq('category', '_blog_section_').order('created_at', { ascending: true })
      ]);

      if (blogsRes.data) {
        const allFormattedBlogs = blogsRes.data.map((p: any) => ({
            id: p.id,
            title: p.title,
            excerpt: p.excerpt,
            content: p.content,
            author: p.author,
            imageUrl: p.image_url,
            category: p.category,
            status: p.status,
            date: p.date,
            isLatest: p.is_latest,
            relatedIds: p.related_ids,
          }));
          
        const filteredForService = allFormattedBlogs; // Pass all posts to BlogSectionsRenderer
        setBlogs(filteredForService);
      }
      
      if (sectionsRes.data) {
          const allSections = sectionsRes.data.map(s => {
              let config: any = {};
              try { config = JSON.parse(s.content) } catch(e) {}
              return { id: s.id, title: s.title, subtitle: s.excerpt, config };
          });
          setBlogSections(allSections.filter(s => {
              const pages = s.config.displayPages || (s.config.displayPage ? [s.config.displayPage] : ['all']);
              return pages.includes(`service_${id}`) || pages.includes('all');
          }));
      }

      setLoading(false);
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 rounded-full border-4 border-accent-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen py-32 text-center">
        <h1 className="text-3xl font-bold">Category not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[70px] md:pt-[136px] pb-20">
      {/* Hero Header Wrapper */}
      <div className="relative mb-32 md:mb-40">
        <div className="h-[45vh] min-h-[350px] relative overflow-hidden bg-spirit-900 border-b border-white/10">
          {category.image_url && (
            <img
              src={category.image_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Floating Content Div */}
        <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2 z-20 px-4 md:px-8">
          <div className="max-w-7xl mx-auto text-center bg-spirit-900/95 backdrop-blur-xl p-8 md:p-12 rounded-xl border border-white/10 shadow-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 text-white drop-shadow-md min-h-[1.2em]">
              <Typewriter text={category.name} delay={100} />
            </h1>
            <p className="text-lg md:text-xl text-white/95 max-w-6xl mx-auto leading-relaxed drop-shadow-sm font-medium">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-20">
        {/* Top: Recommended Products */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-spirit-900">
              Recommended Products
            </h2>
            <Link
              to="/store"
              className="text-accent-600 hover:text-accent-700 font-bold flex items-center gap-2"
            >
              View All Store <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const onSale = isSaleActive(product);
              const currentPrice = onSale ? product.salePrice : product.price;

              const isPurchased = purchasedProductIds.includes(String(product.id));
              const shouldBlur = product.isBlurBeforeBuy && !isPurchased;
              const shouldWrap = product.isWrapBeforeBuy && !isPurchased;

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
                          className={`w-full h-full object-cover transform group-hover:scale-110 transition duration-700 
                              ${product.isOutOfStock ? 'grayscale opacity-70' : ''} 
                              ${shouldBlur ? 'blur-md scale-110' : ''}
                          `}
                          style={shouldWrap ? { clipPath: 'polygon(0 0, 100% 0, 100% 35%, 35% 100%, 0 100%)' } : undefined}
                      />
                      
                      {/* Wrap Overlay (Top-Left diagonal shroud) */}
                      {shouldWrap && !product.isOutOfStock && (
                          <div 
                              className="absolute inset-0 z-20 cursor-pointer pointer-events-auto"
                              onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedWrapProduct(product);
                              }}
                          >
                              <div 
                                  className="absolute inset-0 bg-amber-950/40 pointer-events-none"
                                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% 35%, 35% 100%, 0 100%)' }}
                              />
                              <div className="absolute top-4 left-4 bg-amber-500/80 backdrop-blur-sm text-spirit-950 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-md flex items-center gap-1 shadow-lg">
                                  <Lock size={10} /> Wrapped
                              </div>
                          </div>
                      )}
                      
                      {/* Blur Overlay Label */}
                      {shouldBlur && !product.isOutOfStock && (
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
                                  onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      addToCart(product);
                                  }}
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
            )})}
          </div>
        </section>

        {/* Bottom: Related Blogs/Articles */}
        {blogSections.length > 0 ? (
            <div className="mt-20">
                <BlogSectionsRenderer sections={blogSections} allPosts={blogs} />
            </div>
        ) : blogs.filter((p: any) => category?.related_articles?.includes(p.id)).length > 0 || (blogs.length > 0 && (!category?.related_articles || category.related_articles.length === 0)) ? (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-spirit-900">
              Articles & Insights
            </h2>
            <Link
              to="/blog"
              className="text-accent-600 hover:text-accent-700 font-bold flex items-center gap-2"
            >
              View All Articles <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs
                .filter((p: any) => category?.related_articles?.length > 0 ? category.related_articles.includes(p.id) : true)
                .slice(0, 6)
                .map((post) => (
              <Link
                to={`/blog/${post.id}`}
                key={post.id}
                className="bg-white rounded-3xl border border-spirit-100 shadow-lg overflow-hidden flex flex-col h-[450px] group"
              >
                  <div className="h-56 relative overflow-hidden">
                    <img
                      src={post.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e"}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
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
                    <div
                      className="w-full bg-spirit-50 text-spirit-900 font-bold py-3 rounded-xl group-hover:bg-spirit-900 group-hover:text-white transition-colors flex items-center justify-center gap-2 text-sm mt-auto"
                    >
                      <Book size={16} /> <span>Read Article</span>{" "}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
              </Link>
            ))}
          </div>
        </section>
        ) : null}
      </div>

      {/* REVEAL WRAPPED IMAGE MODAL */}
      {selectedWrapProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
              className="absolute inset-0 bg-spirit-950/80 backdrop-blur-md" 
              onClick={() => setSelectedWrapProduct(null)}
          />
          <div className="relative bg-white rounded-[2rem] max-w-sm w-full overflow-hidden shadow-2xl border border-spirit-100 z-10 animate-scale-up">
            <div className="bg-gradient-to-br from-spirit-900 to-amber-950 p-6 text-center text-white relative">
              <button 
                onClick={() => setSelectedWrapProduct(null)} 
                className="absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition"
              >
                <X size={16} />
              </button>
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3 text-amber-400">
                <Lock size={20} className="animate-pulse" />
              </div>
              <h3 className="font-serif font-bold text-lg uppercase tracking-wide text-amber-100 font-serif">Premium Image Wrapped</h3>
              <p className="text-[10px] text-slate-300 mt-1 font-sans">The original high-resolution original scan remains covered</p>
            </div>
            
            <div className="p-6 text-center space-y-4">
              <div className="w-28 h-28 mx-auto rounded-2xl overflow-hidden shadow-lg border border-slate-100 relative bg-slate-50">
                <img 
                  src={selectedWrapProduct.image} 
                  alt={selectedWrapProduct.name} 
                  className="w-full h-full object-cover" 
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% 10%, 10% 100%, 0 100%)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-spirit-950 to-amber-950/80" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 10%, 10% 100%, 0 100%)' }} />
                <div className="absolute right-2 bottom-2 bg-amber-500 text-spirit-950 p-1 rounded-full"><Lock size={12} /></div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-sans font-bold text-gray-800 uppercase tracking-wider text-xs">{selectedWrapProduct.name}</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed max-w-xs mx-auto">
                  To protect the authentic physical/spiritual properties, this image is partially covered.
                </p>
                <p className="text-[11px] text-spirit-800 font-bold bg-spirit-50 py-2 px-3 rounded-lg border border-spirit-100 inline-block font-mono">
                  🔒 Buy this product to view the full image.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => setSelectedWrapProduct(null)}
                className="flex-1 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Close
              </button>
              <Link
                to={`/product/${selectedWrapProduct.id}`}
                onClick={() => setSelectedWrapProduct(null)}
                className="flex-1 bg-spirit-900 text-white py-2 text-xs font-bold rounded-lg text-center hover:bg-spirit-800 transition shadow-md"
              >
                View Product
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
