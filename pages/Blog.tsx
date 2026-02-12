
import React, { useEffect, useState } from 'react';
import { Calendar, User, ArrowRight, CircleX } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { BlogPost } from '../types';
import { supabase } from '../lib/supabase';

// --- Dummy Data for Demonstration ---
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
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const categoryFilter = searchParams.get('category');
  const searchFilter = searchParams.get('search');

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
            .order('created_at', { ascending: false });

        if (categoryFilter) {
            query = query.eq('category', categoryFilter);
        }

        const { data, error } = await query;
        
        // --- Fallback to Dummy Data ---
        let publishedPosts: BlogPost[];
        if (error || !data || data.length === 0) {
            publishedPosts = [dummyLatestPost, ...dummyOtherPosts];
        } else {
             publishedPosts = (data || []).map((p: any) => ({
                ...p,
                imageUrl: p.image_url || p.imageUrl,
                relatedIds: p.related_ids || p.relatedIds,
                isLatest: p.is_latest || p.isLatest
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
        setLoading(false);
    };

    fetchPosts();
  }, [categoryFilter, searchFilter]);

  const clearFilters = () => {
      setSearchParams({});
  };

  return (
    <div className="bg-spirit-50 min-h-screen pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-spirit-900 mb-4">Jaadu ki kaat Journal</h1>
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
             <div className="text-center py-20 text-gray-500">Loading Journal...</div>
        ) : (
            <>
                {latest && (
                <div className="mb-16 animate-fade-in">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-spirit-100 group lg:h-[350px]">
                        <div className="flex flex-col lg:flex-row h-full">
                            <div className="h-64 lg:h-full lg:w-2/5 overflow-hidden">
                                <Link to={`/blog/${latest.id}`}>
                                    <img 
                                        src={latest.imageUrl} 
                                        alt={latest.title} 
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    />
                                </Link>
                            </div>
                            <div className="p-8 flex flex-col lg:w-3/5">
                                <div className="flex items-center text-sm text-spirit-500 mb-3 space-x-4">
                                    <span className="bg-spirit-100 text-spirit-800 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wide">Latest Feature</span>
                                    <span className="hidden sm:flex items-center"><Calendar size={14} className="mr-1" /> {latest.date}</span>
                                </div>
                                <Link to={`/blog/${latest.id}`} className="block">
                                    <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2 group-hover:text-spirit-600 transition-colors line-clamp-2">
                                    {latest.title}
                                    </h2>
                                </Link>
                                <p className="text-gray-700 text-base mb-4 leading-relaxed line-clamp-5 flex-grow font-light">
                                    {latest.excerpt}
                                </p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                                    <div className="flex items-center text-sm text-gray-500">
                                    <User size={16} className="mr-2" />
                                    {latest.author}
                                    </div>
                                    <Link to={`/blog/${latest.id}`} className="text-spirit-600 font-bold hover:text-spirit-800 flex items-center transition-colors text-sm">
                                    Read Article <ArrowRight size={16} className="ml-2" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                )}

                {!latest && posts.length === 0 && (
                <div className="text-center py-24 bg-white rounded-xl shadow-sm mb-12 border border-gray-100">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No articles found</h3>
                    <p className="text-gray-500 italic mb-6">Try adjusting your search or filters.</p>
                    <button onClick={clearFilters} className="text-spirit-600 font-bold hover:underline">View All Articles</button>
                </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                    <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-spirit-100 flex flex-col group animate-fade-in">
                    <div className="h-48 overflow-hidden relative">
                        <Link to={`/blog/${post.id}`}>
                        <img 
                            src={post.imageUrl} 
                            alt={post.title} 
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        />
                        </Link>
                        {post.category && (
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-spirit-800 shadow-sm">
                                {post.category}
                            </div>
                        )}
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center text-xs text-gray-400 mb-3 space-x-3">
                        <span className="flex items-center"><Calendar size={12} className="mr-1" /> {post.date}</span>
                        <span>•</span>
                        <span>{post.author}</span>
                        </div>
                        <Link to={`/blog/${post.id}`}>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-spirit-600 transition-colors line-clamp-2">
                            {post.title}
                        </h3>
                        </Link>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                        {post.excerpt}
                        </p>
                        <Link to={`/blog/${post.id}`} className="mt-auto text-spirit-600 text-sm font-bold hover:text-spirit-800 self-start group-hover:translate-x-1 transition-transform">
                        Read More &rarr;
                        </Link>
                    </div>
                    </div>
                ))}
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default Blog;
