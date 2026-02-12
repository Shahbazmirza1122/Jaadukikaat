
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Search, Clock, ChevronRight, Tag, FolderOpen, PanelRightClose, PanelRightOpen, Send, CheckCircle } from 'lucide-react';
import { BlogPost } from '../types';
import BlogContentRenderer from '../components/BlogContentRenderer';
import { supabase } from '../lib/supabase';

// --- Dummy Data (Consistent with Blog.tsx but with full content) ---
const createRichContent = (paragraphs: string[], image?: string, quote?: string) => {
    const rows = paragraphs.map((p, i) => ({
        id: `p${i}`,
        columns: [{ id: `c${i}`, width: 100, content: `<p>${p}</p>` }]
    }));

    if (quote) {
        rows.splice(1, 0, {
            id: 'quote',
            columns: [{ id: 'q1', width: 100, content: `<blockquote style='border-left: 4px solid #16a34a; padding-left: 1rem; margin-left: 0; font-style: italic; color: #333;'>${quote}</blockquote>` }]
        });
    }

    if (image) {
        rows.splice(2, 0, {
            id: 'image',
            columns: [{ id: 'i1', width: 100, content: `<img src="${image}" style="width:100%; height:auto; display:block; border-radius: 8px; margin: 1rem 0;" />` }]
        });
    }
    
    return JSON.stringify({ version: 1, rows });
};

const dummyLatestPost: BlogPost = {
  id: 'd1',
  title: "Finding Stillness: The Power of a Silent Heart in a Noisy World",
  excerpt: "In an age of constant distraction, the ancient practice of cultivating inner silence offers a profound sanctuary. Discover how to quiet the mind, connect with your soul, and find unshakable peace amidst the chaos of modern life.",
  content: createRichContent(
    [
      "In an age defined by its relentless pace and constant digital clamor, the search for tranquility has become more urgent than ever. The ancient practice of cultivating inner silence, a cornerstone of many spiritual traditions, offers not just a momentary escape, but a profound and lasting sanctuary.",
      "The path to a silent heart begins with small, intentional steps. It requires a gentle commitment to disengage from the noise and listen to the subtle whispers of the soul.",
      "By integrating these practices into your daily life, you begin to cultivate a heart that remains steady and serene, a silent anchor in the midst of life's unpredictable storms. This inner stillness is your birthright, a source of infinite strength and wisdom waiting to be rediscovered."
    ],
    "https://images.unsplash.com/photo-1508921340878-ba53e1f416c5?q=80&w=1200&auto=format&fit=crop",
    "Within you, there is a stillness and a sanctuary to which you can retreat at any time and be yourself. - Hermann Hesse"
  ),
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
    content: createRichContent(
        ["Dua, or supplication, is one of the most profound and empowering acts of worship in a spiritual journey. It is a direct line of communication with the Divine, a moment where the heart speaks its deepest longings, fears, and hopes.", "True dua is an act of vulnerability and absolute trust. It acknowledges our limitations and recognizes the infinite capacity of our Creator. It transforms a simple wish into a powerful act of faith and connection.", "To elevate your dua, practice sincerity (ikhlas), have unwavering faith (yaqeen) that you will be answered, and be persistent. Your conversation with the Divine is a continuous one, a lifelong practice of turning towards the source of all peace and fulfillment."],
        "https://images.unsplash.com/photo-1587293852726-70cdb168417d?q=80&w=1200&auto=format&fit=crop"
    ),
    author: "Rumi",
    date: "July 22, 2024",
    imageUrl: "https://images.unsplash.com/photo-1593225232335-3738b6f35334?q=80&w=800&auto=format&fit=crop",
    category: "Spirituality"
  },
  {
    id: 'd3',
    title: "Decoding Dreams: A Spiritual Guide to Your Inner World",
    excerpt: "Our dreams are a sacred bridge to the subconscious and the unseen. This guide provides an introduction to interpreting dream symbols from a spiritual perspective.",
    content: "Full content would be rendered here.",
    author: "Ibn Sirin",
    date: "July 15, 2024",
    imageUrl: "https://images.unsplash.com/photo-1532325329166-d9b9333a469a?q=80&w=800&auto=format&fit=crop",
    category: "Wisdom"
  },
  {
    id: 'd4',
    title: "The Evil Eye: Understanding and Protection in the Modern Age",
    excerpt: "Explore the ancient concept of the 'evil eye' (Nazar) and discover practical spiritual remedies and daily practices to protect your energy and blessings from envy.",
    content: "Full content would be rendered here.",
    author: "Jaadu ki kaat",
    date: "July 08, 2024",
    imageUrl: "https://images.unsplash.com/photo-1559819225-3b2a578358ab?q=80&w=800&auto=format&fit=crop",
    category: "Protection"
  },
   {
    id: 'd5',
    title: "Gratitude as a Gateway to Abundance",
    excerpt: "Shifting your focus from what's lacking to what you have is the first step towards attracting more blessings. Learn the spiritual mechanics of gratitude (Shukr).",
    content: "Full content would be rendered here.",
    author: "Yasmin Mogahed",
    date: "July 01, 2024",
    imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=800&auto=format&fit=crop",
    category: "Spirituality"
  },
  {
    id: 'd6',
    title: "Warding Off Whispers: A Guide to Overcoming Waswasa",
    excerpt: "Intrusive thoughts (waswasa) can disturb our peace and worship. Discover Quranic and Prophetic methods to find refuge and regain mental clarity and focus.",
    content: "Full content would be rendered here.",
    author: "Imam An-Nawawi",
    date: "June 24, 2024",
    imageUrl: "https://images.unsplash.com/photo-1542382257-80ded14b0a88?q=80&w=800&auto=format&fit=crop",
    category: "Protection"
  },
   {
    id: 'd7',
    title: "The Healing Power of Forgiveness",
    excerpt: "Holding onto resentment is a heavy spiritual burden. Explore the transformative power of forgiveness for others and for oneself as a path to inner freedom.",
    content: "Full content would be rendered here.",
    author: "Rumi",
    date: "June 17, 2024",
    imageUrl: "https://images.unsplash.com/photo-1519415943484-2fa18734d0ac?q=80&w=800&auto=format&fit=crop",
    category: "Wisdom"
  },
  {
    id: 'd8',
    title: "The Gentle Art of Sabr: Finding Strength in Patience",
    excerpt: "Sabr (patience) is more than just waiting; it is a state of active endurance and trust in the divine plan. Learn how to cultivate this beautiful virtue to navigate life's trials with grace.",
    content: "Full content would be rendered here.",
    author: "Ibn Qayyim Al-Jawziyya",
    date: "June 10, 2024",
    imageUrl: "https://images.unsplash.com/photo-1543373014-cfe4f4bc1cdf?q=80&w=800&auto=format&fit=crop",
    category: "Wisdom"
  }
];


const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relevantPosts, setRelevantPosts] = useState<BlogPost[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Comment Form State
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentMessage, setCommentMessage] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentSubmitted, setCommentSubmitted] = useState(false);


  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        let allPosts: BlogPost[];
        if (error || !data || data.length === 0) {
             console.warn("Supabase fetch failed or returned no posts. Falling back to dummy data.");
             allPosts = [dummyLatestPost, ...dummyOtherPosts];
        } else {
             allPosts = data.map((p: any) => ({
                ...p,
                imageUrl: p.image_url || p.imageUrl,
                relatedIds: p.related_ids || p.relatedIds,
                isLatest: p.is_latest || p.isLatest
            }));
        }
        
        const cats = new Set(allPosts.map(p => p.category).filter(Boolean));
        setAllCategories(Array.from(cats).sort());
        
        setRecentPosts(allPosts.filter(p => p.id !== id).slice(0, 5));

        const foundPost = allPosts.find(p => p.id === id);
        
        if (foundPost) {
            setPost(foundPost);
            
            let others: BlogPost[] = [];
            const published = allPosts.filter(p => p.id !== id);

            if (foundPost.relatedIds && foundPost.relatedIds.length > 0) {
                others = published.filter(p => foundPost.relatedIds?.includes(p.id));
            } 
            
            if (others.length < 3) {
                const categoryMatches = published.filter(p => p.category === foundPost.category && !others.find(o => o.id === p.id));
                others = [...others, ...categoryMatches];
            }

            if (others.length < 3) {
                const remaining = published.filter(p => !others.find(o => o.id === p.id));
                const randomFill = remaining.slice(0, 3 - others.length);
                others = [...others, ...randomFill];
            }

            setRelevantPosts(others.slice(0, 3));
        } else {
            console.error(`Post with id "${id}" not found. Navigating back to blog.`);
            navigate('/blog');
        }
        setLoading(false);
    };

    fetchData();
  }, [id, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
        navigate(`/blog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingComment(true);
    // In a real app, you'd send this to a backend. Here we simulate.
    setTimeout(() => {
        setIsSubmittingComment(false);
        setCommentSubmitted(true);
        setCommentName('');
        setCommentEmail('');
        setCommentMessage('');
        setTimeout(() => setCommentSubmitted(false), 5000); // Hide message after 5s
    }, 1000);
  };

  if (loading) {
    return (
        <div className="bg-spirit-50 min-h-screen pt-24 pb-20">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
                {/* Header Actions Skeleton */}
                <div className="flex justify-between mb-6">
                    <div className="h-6 w-32 bg-slate-200 rounded"></div>
                    <div className="h-8 w-32 bg-slate-200 rounded-lg"></div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Main Content Skeleton */}
                    <div className="w-full lg:w-3/4 space-y-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-spirit-100 overflow-hidden">
                            <div className="h-64 md:h-[500px] bg-slate-200 w-full"></div>
                            <div className="p-8 md:p-12 space-y-6">
                                <div className="flex gap-4">
                                    <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
                                    <div className="h-6 w-32 bg-slate-200 rounded-full"></div>
                                </div>
                                <div className="h-12 w-3/4 bg-slate-200 rounded-xl"></div>
                                <div className="space-y-4">
                                    <div className="h-4 w-full bg-slate-200 rounded"></div>
                                    <div className="h-4 w-full bg-slate-200 rounded"></div>
                                    <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
                                    <div className="h-4 w-full bg-slate-200 rounded"></div>
                                </div>
                                <div className="pt-8 border-t border-gray-100">
                                    <div className="h-6 w-48 bg-slate-200 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="w-full lg:w-1/4 space-y-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-spirit-100 h-32">
                            <div className="h-6 w-1/2 bg-slate-200 rounded mb-4"></div>
                            <div className="h-10 w-full bg-slate-200 rounded-lg"></div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-spirit-100 h-64">
                            <div className="h-6 w-1/2 bg-slate-200 rounded mb-4"></div>
                            <div className="space-y-3">
                                {[1,2,3,4].map(i => <div key={i} className="h-8 w-full bg-slate-200 rounded"></div>)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }
  
  if (!post) return null;

  return (
    <div className="bg-spirit-50 min-h-screen pt-24 pb-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <Link to="/blog" className="inline-flex items-center text-spirit-600 hover:text-spirit-800 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Journal
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center space-x-2 bg-white text-spirit-600 hover:text-spirit-800 hover:bg-spirit-50 px-4 py-2 rounded-lg border border-spirit-200 shadow-sm transition-all font-bold text-sm"
            title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          >
            {isSidebarOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
            <span className="hidden sm:inline">{isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start relative">
          
          <div className={`${isSidebarOpen ? 'lg:w-3/4' : 'w-full'} transition-all duration-300 space-y-12`}>
            <article className="bg-white rounded-2xl shadow-sm border border-spirit-100 overflow-hidden animate-fade-in">
              <div className="h-64 md:h-[500px] w-full overflow-hidden relative">
                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover"/>
                {post.category && (
                    <Link to={`/blog?category=${post.category}`} className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold text-spirit-800 shadow-sm hover:bg-white transition">
                        {post.category}
                    </Link>
                )}
              </div>
              <div className="p-8 md:p-12">
                <div className="flex flex-wrap items-center text-sm text-spirit-500 mb-6 gap-4">
                  <span className="flex items-center bg-spirit-50 px-3 py-1 rounded-full"><Calendar size={14} className="mr-2" /> {post.date}</span>
                  <span className="flex items-center"><User size={14} className="mr-2" /> {post.author}</span>
                  <span className="flex items-center text-spirit-400"><Clock size={14} className="mr-2" /> 5 min read</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-spirit-900 mb-8 leading-tight">{post.title}</h1>
                <BlogContentRenderer content={post.content} />
                <div className="mt-12 pt-8 border-t border-gray-100 flex items-center space-x-2">
                   <Tag className="w-5 h-5 text-spirit-400" /><span className="text-sm text-gray-500">Tags: Spirituality, {post.category || 'General'}</span>
                </div>
              </div>
            </article>

            {/* Comment Section */}
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-spirit-100">
                <h2 className="text-2xl font-serif font-bold text-spirit-900 mb-6">Leave a Comment</h2>
                {commentSubmitted ? (
                    <div className="bg-green-50 text-green-800 p-6 rounded-xl text-center animate-fade-in flex flex-col items-center">
                        <CheckCircle size={40} className="mb-4 text-green-500" />
                        <h3 className="font-bold text-lg">Thank You!</h3>
                        <p className="text-sm">Your comment has been submitted for review.</p>
                    </div>
                ) : (
                    <form onSubmit={handleCommentSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input type="text" placeholder="Your Name" required value={commentName} onChange={(e) => setCommentName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition" />
                            <input type="email" placeholder="Email (Optional)" value={commentEmail} onChange={(e) => setCommentEmail(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition" />
                        </div>
                        <textarea placeholder="Your thoughtful comment..." required rows={5} value={commentMessage} onChange={(e) => setCommentMessage(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent-500 transition resize-none"></textarea>
                        <button type="submit" disabled={isSubmittingComment} className="inline-flex items-center justify-center bg-accent-500 text-white font-bold py-4 px-10 rounded-full shadow-lg hover:bg-accent-600 transition disabled:opacity-70">
                            {isSubmittingComment ? 'Submitting...' : 'Post Comment'} <Send size={16} className="ml-2" />
                        </button>
                    </form>
                )}
            </div>

            {/* Relevant Articles Section */}
            <div>
                <h2 className="text-3xl font-serif font-bold text-spirit-900 mb-8">You Might Also Like</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {relevantPosts.map((post) => (
                    <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-spirit-100 flex flex-col group">
                    <div className="h-48 overflow-hidden relative"><Link to={`/blog/${post.id}`}><img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"/></Link></div>
                    <div className="p-6 flex flex-col flex-grow">
                        <span className="text-xs text-gray-400 mb-2">{post.date}</span>
                        <Link to={`/blog/${post.id}`}><h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-spirit-600 transition-colors line-clamp-2">{post.title}</h3></Link>
                        <Link to={`/blog/${post.id}`} className="mt-auto text-spirit-600 text-sm font-bold hover:text-spirit-800 self-start">Read More &rarr;</Link>
                    </div>
                    </div>
                ))}
                </div>
            </div>
          </div>

          {isSidebarOpen && (
            <aside className="w-full lg:w-1/4 space-y-8 animate-fade-in sticky top-28">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-spirit-100"><h3 className="text-lg font-serif font-bold text-spirit-900 mb-4">Search Journal</h3><form onSubmit={handleSearch} className="relative"><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Type to search..." className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none text-sm bg-gray-50 transition-all"/><button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-spirit-600"><Search className="w-5 h-5" /></button></form></div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-spirit-100"><h3 className="text-lg font-serif font-bold text-spirit-900 mb-4 flex items-center"><FolderOpen className="w-5 h-5 mr-2 text-spirit-600" /> Categories</h3><ul className="space-y-2">{allCategories.length > 0 ? (allCategories.map(cat => (<li key={cat}><Link to={`/blog?category=${cat}`} className="flex items-center justify-between text-gray-600 hover:text-spirit-600 hover:bg-spirit-50 p-2 rounded-lg transition"><span>{cat}</span><ChevronRight className="w-4 h-4 text-gray-300" /></Link></li>))) : (<li className="text-sm text-gray-400 italic">No categories found.</li>)}</ul></div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-spirit-100"><h3 className="text-lg font-serif font-bold text-spirit-900 mb-6">Recent Posts</h3><div className="space-y-4">{recentPosts.map(p => (<Link key={p.id} to={`/blog/${p.id}`} className="block group"><h4 className="font-bold text-gray-800 group-hover:text-spirit-600 transition-colors line-clamp-2 leading-snug">{p.title}</h4><span className="text-xs text-gray-400 mt-1 block">{p.date}</span></Link>))}</div></div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;
