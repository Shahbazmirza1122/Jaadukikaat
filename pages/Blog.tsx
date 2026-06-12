
import React, { useEffect, useState } from 'react';
import { Calendar, User, ArrowRight, CircleX, Book, ChevronLeft, ChevronRight } from 'lucide-react';
import { Globe } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { BlogPost } from '../types';
import { supabase } from '../lib/supabase';

// --- Dummy Data for Demonstration ---
import { BlogSectionsRenderer } from '../components/BlogSectionsRenderer';

const dummyLatestPost: BlogPost = {
  id: 'd1',
  title: "Finding Stillness: The Power of a Silent Heart in a Noisy World",
  excerpt: "In an age of constant distraction, the ancient practice of cultivating inner silence offers a profound sanctuary. Discover how to quiet the mind, connect with your soul, and find unshakable peace amidst the chaos of modern life. This journey inward is not about escaping reality, but about finding a deeper, more resilient center within it. We'll explore simple yet profound techniques to detach from the external noise and cultivate a heart that remains steady regardless of the storms outside.",
  content: "Full content here...",
  author: "Imam Al-Ghazali",
  date: "July 28, 2024",
  imageUrl: "https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?q=80&w=1920&auto=format&fit=crop",
  category: "Mindfulness",
  isLatest: true
};

const dummyOtherPosts: BlogPost[] = [
  {
    id: 'd2',
    title: "The Alchemy of Dua: Turning Desires into Divine Connection",
    excerpt: "Dua is not merely a list of requests; it is the soul's conversation with its Creator. Learn how to transform your supplications into a powerful tool for spiritual growth and manifestation.",
    content: "...",
    author: "Rumi",
    date: "July 22, 2024",
    imageUrl: "https://images.unsplash.com/photo-1593225232335-3738b6f35334?q=80&w=800&auto=format&fit=crop",
    category: "Spirituality"
  },
  {
    id: 'd3',
    title: "Decoding Dreams: A Spiritual Guide to Your Inner World",
    excerpt: "Our dreams are a sacred bridge to the subconscious and the unseen. This guide provides an introduction to interpreting dream symbols from a spiritual perspective.",
    content: "...",
    author: "Ibn Sirin",
    date: "July 15, 2024",
    imageUrl: "https://images.unsplash.com/photo-1532325329166-d9b9333a469a?q=80&w=800&auto=format&fit=crop",
    category: "Wisdom"
  },
  {
    id: 'd4',
    title: "The Evil Eye: Understanding and Protection in the Modern Age",
    excerpt: "Explore the ancient concept of the 'evil eye' (Nazar) and discover practical spiritual remedies and daily practices to protect your energy and blessings from envy.",
    content: "...",
    author: "Jaadu ki kaat",
    date: "July 08, 2024",
    imageUrl: "https://images.unsplash.com/photo-1559819225-3b2a578358ab?q=80&w=800&auto=format&fit=crop",
    category: "Protection"
  },
   {
    id: 'd5',
    title: "Gratitude as a Gateway to Abundance",
    excerpt: "Shifting your focus from what's lacking to what you have is the first step towards attracting more blessings. Learn the spiritual mechanics of gratitude (Shukr).",
    content: "...",
    author: "Yasmin Mogahed",
    date: "July 01, 2024",
    imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=800&auto=format&fit=crop",
    category: "Spirituality"
  },
  {
    id: 'd6',
    title: "Warding Off Whispers: A Guide to Overcoming Waswasa",
    excerpt: "Intrusive thoughts (waswasa) can disturb our peace and worship. Discover Quranic and Prophetic methods to find refuge and regain mental clarity and focus.",
    content: "...",
    author: "Imam An-Nawawi",
    date: "June 24, 2024",
    imageUrl: "https://images.unsplash.com/photo-1542382257-80ded14b0a88?q=80&w=800&auto=format&fit=crop",
    category: "Protection"
  },
   {
    id: 'd7',
    title: "The Healing Power of Forgiveness",
    excerpt: "Holding onto resentment is a heavy spiritual burden. Explore the transformative power of forgiveness for others and for oneself as a path to inner freedom.",
    content: "...",
    author: "Rumi",
    date: "June 17, 2024",
    imageUrl: "https://images.unsplash.com/photo-1519415943484-2fa18734d0ac?q=80&w=800&auto=format&fit=crop",
    category: "Wisdom"
  },
  {
    id: 'd8',
    title: "The Gentle Art of Sabr: Finding Strength in Patience",
    excerpt: "Sabr (patience) is more than just waiting; it is a state of active endurance and trust in the divine plan. Learn how to cultivate this beautiful virtue to navigate life's trials with grace.",
    content: "...",
    author: "Ibn Qayyim Al-Jawziyya",
    date: "June 10, 2024",
    imageUrl: "https://images.unsplash.com/photo-1543373014-cfe4f4bc1cdf?q=80&w=800&auto=format&fit=crop",
    category: "Wisdom"
  }
];


const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [latest, setLatest] = useState<BlogPost | null>(null);
  const [allPagePosts, setAllPagePosts] = useState<BlogPost[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentLang, setCurrentLang] = useState<'en' | 'ur'>('en');

  const categoryFilter = searchParams.get('category');
  const searchFilter = searchParams.get('search');

  const handleLanguageToggle = () => {
    const newLang = currentLang === 'en' ? 'ur' : 'en';
    
    // Google Translate uses .goog-te-combo to change language programmatically
    const gtSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (gtSelect) {
      gtSelect.value = newLang;
      gtSelect.dispatchEvent(new Event('change'));
      setCurrentLang(newLang);
    } else {
      // Fallback if script hasn't loaded yet
      setTimeout(() => {
        const retrySelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (retrySelect) {
            retrySelect.value = newLang;
            retrySelect.dispatchEvent(new Event('change'));
            setCurrentLang(newLang);
        }
      }, 500);
    }
  };

  useEffect(() => {
    if (!categoryFilter && !searchFilter) {
        window.scrollTo(0, 0);
    }

    const fetchPosts = async () => {
        setLoading(true);
        
        let query = supabase
            .from('posts')
            .select('*')
            .eq('status', 'published')
            .neq('category', '_page_section_')
            .neq('category', '_form_lead_')
            .neq('category', '_banner_')
            .neq('category', '_blog_section_')
            .order('created_at', { ascending: false });

        if (categoryFilter) {
            query = query.eq('category', categoryFilter);
        }

        const [postsRes, sectionsRes] = await Promise.all([
          query,
          supabase.from('posts').select('*').eq('category', '_blog_section_').order('created_at', { ascending: true })
        ]);
        
        // --- Fallback to Dummy Data ---
        let publishedPosts: BlogPost[];
        if (postsRes.error || !postsRes.data || postsRes.data.length === 0) {
            publishedPosts = [dummyLatestPost, ...dummyOtherPosts];
        } else {
            const allParsed = (postsRes.data || []).map((p: any) => ({
                ...p,
                imageUrl: p.image_url || p.imageUrl,
                relatedIds: p.related_ids || p.relatedIds,
                isLatest: p.is_latest || p.isLatest
            }));
            
            // For sections renderer, we need to provide all valid posts the website has,
            // or at least all posts that *could* belong to this page's sections
            const validPagePosts = allParsed.filter(p => p.status !== 'draft');
            setAllPagePosts(validPagePosts);
            
            // publishedPosts is used for the generic blog grid/feed
            publishedPosts = allParsed.filter((p: any) => {
              let displayPage = 'all';
              let displaySection = 'all';
              try {
                  if (p.relatedIds) {
                     const idData = Array.isArray(p.relatedIds) ? p.relatedIds[0] : p.relatedIds;
                     if (idData && typeof idData === 'string') {
                         const config = JSON.parse(idData);
                         displayPage = config.displayPage || 'all';
                         displaySection = config.displaySection || 'all';
                     }
                  }
              } catch(e) {}
              
              // "when a blog will post other than blog page it should be updated to the blog page"
              // So we DO NOT filter by displayPage here. Everything comes to the Blog page feed 
              // unconditionally (as long as it fits other criteria).
              
              // "but if the admin choose to display it on the blog page then it should only be display to the blog page once under specific section and category"
              // If it's explicitly assigned to a specific layout section (displaySection),
              // it's rendered by the BlogSectionsRenderer and MUST NOT be in the generic grid feed.
              if (displaySection && displaySection !== 'all') {
                  return false;
              }
              
              return true;
            });
        }

        if (sectionsRes.data) {
             const allSections = sectionsRes.data.map(s => {
                 let config: any = {};
                 try { config = JSON.parse(s.content) } catch(e) {}
                 return { id: s.id, title: s.title, subtitle: s.excerpt, config };
             });
             setSections(allSections.filter(s => {
                 const pages = s.config.displayPages || (s.config.displayPage ? [s.config.displayPage] : ['all']);
                 return pages.includes('blog') || pages.includes('all');
             }));
        }

        // In-memory Search Filtering
        if (searchFilter) {
            const lowerQ = searchFilter.toLowerCase();
            publishedPosts = publishedPosts.filter(p => 
                p.title.toLowerCase().includes(lowerQ) || 
                (p.content && p.content.toLowerCase().includes(lowerQ)) ||
                p.excerpt.toLowerCase().includes(lowerQ)
            );
        }

        if (publishedPosts.length > 0) {
            if (!categoryFilter && !searchFilter) {
                const explicitLatest = publishedPosts.find(p => p.isLatest);
                const mainFeature = explicitLatest || publishedPosts[0];
                setLatest(mainFeature);
                setPosts(publishedPosts.filter(p => p.id !== mainFeature.id));
            } else {
                setLatest(null);
                setPosts(publishedPosts);
            }
        } else {
            setLatest(null);
            setPosts([]);
        }
        
        // Simulate network delay for better UX on fast connections if needed, or remove for production
        // setTimeout(() => setLoading(false), 500); 
        setLoading(false);
    };

    fetchPosts();
  }, [categoryFilter, searchFilter]);

  const clearFilters = () => {
      setSearchParams({});
  };

  return (
    <div className="bg-spirit-50 min-h-screen pt-[160px] md:pt-[220px] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="text-center mb-12 relative">
          <div className="flex flex-col md:flex-row items-center justify-center relative mb-4 min-h-[48px]">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-spirit-900">Jaadu ki kaat Journal</h1>
            <div className="md:absolute right-0 mt-4 md:mt-0">
              <button 
                  onClick={handleLanguageToggle}
                  className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-spirit-200 hover:bg-spirit-50 transition-colors text-sm font-semibold text-spirit-800"
              >
                  <Globe className="w-4 h-4 text-spirit-600" />
                  {currentLang === 'en' ? 'Translate to Urdu' : 'Switch to English'}
              </button>
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Insights, stories, and wisdom to illuminate your spiritual path.</p>
        </div>

        {(categoryFilter || searchFilter) && (
            <div className="mb-8 flex justify-center">
                <div className="bg-white px-6 py-3 rounded-full shadow-sm border border-spirit-200 flex items-center gap-3 animate-fade-in">
                    <span className="text-gray-500 text-sm font-medium">Filtering by:</span>
                    {categoryFilter && <span className="bg-spirit-100 text-spirit-800 px-3 py-1 rounded-full text-xs font-bold">Category: {categoryFilter}</span>}
                    {searchFilter && <span className="bg-spirit-100 text-spirit-800 px-3 py-1 rounded-full text-xs font-bold">Search: "{searchFilter}"</span>}
                    <button onClick={clearFilters} className="text-gray-400 hover:text-red-500 ml-2">
                        <CircleX size={20} />
                    </button>
                </div>
            </div>
        )}

        {loading ? (
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-12">
                {/* Featured Post Skeleton */}
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-spirit-100 h-[400px] flex flex-col lg:flex-row">
                    <div className="h-64 lg:h-full lg:w-2/5 bg-slate-200"></div>
                    <div className="p-8 flex flex-col lg:w-3/5 space-y-4">
                        <div className="flex gap-4">
                            <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
                            <div className="h-6 w-32 bg-slate-200 rounded-full"></div>
                        </div>
                        <div className="h-10 w-3/4 bg-slate-200 rounded-xl"></div>
                        <div className="space-y-2 flex-grow">
                            <div className="h-4 w-full bg-slate-200 rounded"></div>
                            <div className="h-4 w-full bg-slate-200 rounded"></div>
                            <div className="h-4 w-2/3 bg-slate-200 rounded"></div>
                        </div>
                        <div className="h-6 w-32 bg-slate-200 rounded pt-4"></div>
                    </div>
                </div>

                {/* Grid Skeletons */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-spirit-100 h-[400px] flex flex-col">
                            <div className="h-48 bg-slate-200"></div>
                            <div className="p-6 flex flex-col flex-grow space-y-4">
                                <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
                                <div className="h-8 w-full bg-slate-200 rounded"></div>
                                <div className="space-y-2 flex-grow">
                                    <div className="h-4 w-full bg-slate-200 rounded"></div>
                                    <div className="h-4 w-2/3 bg-slate-200 rounded"></div>
                                </div>
                                <div className="h-4 w-24 bg-slate-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        ) : (
            <>
                {latest && (
                    <div className="w-[96%] mx-auto mb-16 animate-fade-in">
                        <div className="bg-white rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 group flex flex-col lg:flex-row items-stretch">
                            <div className="lg:w-1/2 p-2 relative h-64 lg:h-auto min-h-[400px]">
                                <Link to={`/blog/${latest.id}`} className="block w-full h-full rounded-[2rem] overflow-hidden relative">
                                    <img 
                                        src={latest.imageUrl} 
                                        alt={latest.title} 
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    />
                                </Link>
                            </div>
                            <div className="p-8 md:p-12 flex flex-col justify-center lg:w-1/2">
                                <div className="mb-6">
                                     <span className="bg-spirit-50 text-spirit-700 px-4 py-2 rounded-full font-medium text-sm border border-spirit-100">
                                         {latest.category || 'Guidelines'}
                                     </span>
                                </div>
                                <h2 className="text-3xl md:text-[2.5rem] font-bold text-gray-900 mb-6 leading-tight group-hover:text-spirit-600 transition-colors">
                                    {latest.title}
                                </h2>
                                <p className="text-gray-500 text-lg mb-8 leading-relaxed font-light line-clamp-4">
                                    {latest.excerpt}
                                </p>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mt-auto">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-spirit-50 border border-spirit-100 rounded-full flex items-center justify-center text-spirit-600">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{latest.author}</div>
                                            <div className="text-gray-500 text-sm">{latest.date}</div>
                                        </div>
                                    </div>
                                    <Link to={`/blog/${latest.id}`} className="bg-spirit-600 hover:bg-spirit-700 text-white font-semibold py-3 mt-4 sm:mt-0 px-8 rounded-xl transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center">
                                        Read Article
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {sections.length > 0 && !categoryFilter && !searchFilter ? (
                         <BlogSectionsRenderer sections={sections} allPosts={allPagePosts} />
                    ) : (
                        <>
                            {!latest && posts.length === 0 && (
                            <div className="text-center py-24 bg-white rounded-xl shadow-sm mb-12 border border-gray-100">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No articles found</h3>
                                <p className="text-gray-500 italic mb-6">Try adjusting your search or filters.</p>
                                <button onClick={clearFilters} className="text-spirit-600 font-bold hover:underline">View All Articles</button>
                            </div>
                            )}

                            {posts.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {posts.map((post) => (
                                  <Link
                                    to={`/blog/${post.id}`}
                                    key={post.id}
                                    className="bg-white rounded-3xl border border-spirit-100 shadow-lg overflow-hidden flex flex-col h-[450px] group animate-fade-in"
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
                            )}
                        </>
                    )}
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default Blog;
