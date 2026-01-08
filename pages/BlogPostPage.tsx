import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Search, Clock, ChevronRight, Tag, FolderOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { BlogPost } from '../types';
import BlogContentRenderer from '../components/BlogContentRenderer';
import { supabase } from '../lib/supabase';

const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
        setLoading(true);

        // Fetch All Published Posts (Needed for sidebar/related logic)
        // In a larger app, you'd optimize this to only fetch what's needed, but for simplicity we fetch all published
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (error || !data) {
             console.error("Error fetching posts", error);
             setLoading(false);
             return;
        }
        
        // Map fields
        const allPosts: BlogPost[] = data.map((p: any) => ({
            ...p,
            imageUrl: p.image_url || p.imageUrl,
            relatedIds: p.related_ids || p.relatedIds,
            isLatest: p.is_latest || p.isLatest
        }));

        // Extract unique categories
        const cats = new Set(allPosts.map(p => p.category).filter(Boolean));
        setAllCategories(Array.from(cats).sort());

        const foundPost = allPosts.find(p => p.id === id);
        
        if (foundPost) {
            setPost(foundPost);
            
            // Determine Relevant Articles
            let others: BlogPost[] = [];
            const published = allPosts.filter(p => p.id !== id);

            if (foundPost.relatedIds && foundPost.relatedIds.length > 0) {
                others = published.filter(p => foundPost.relatedIds?.includes(p.id));
            } 
            
            if (others.length === 0) {
                others = published.filter(p => p.category === foundPost.category);
                if (others.length < 3) {
                    const remaining = published.filter(p => !others.includes(p));
                    const randomFill = remaining.sort(() => 0.5 - Math.random()).slice(0, 3 - others.length);
                    others = [...others, ...randomFill];
                }
            }

            setRecentPosts(others.slice(0, 4));
        } else {
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

  if (loading) return <div className="min-h-screen bg-spirit-50 pt-24 text-center">Loading article...</div>;
  if (!post) return null;

  return (
    <div className="bg-spirit-50 min-h-screen pt-24 pb-20">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & Toolbar Row */}
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
          
          {/* Main Content Area - Left Side */}
          <div className={`${isSidebarOpen ? 'lg:w-3/4' : 'w-full'} transition-all duration-300`}>
            <article className="bg-white rounded-2xl shadow-sm border border-spirit-100 overflow-hidden animate-fade-in">
              <div className="h-64 md:h-[500px] w-full overflow-hidden relative">
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                />
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

                <h1 className="text-3xl md:text-5xl font-serif font-bold text-spirit-900 mb-8 leading-tight">
                  {post.title}
                </h1>

                {/* Content Rendering */}
                <BlogContentRenderer content={post.content} />

                {/* Tags / Footer of Article */}
                <div className="mt-12 pt-8 border-t border-gray-100 flex items-center space-x-2">
                   <Tag className="w-5 h-5 text-spirit-400" />
                   <span className="text-sm text-gray-500">
                       Tags: Spirituality, {post.category || 'General'}, {post.author}
                   </span>
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar - Right Side */}
          {isSidebarOpen && (
            <aside className="w-full lg:w-1/4 space-y-8 animate-fade-in">
              
              {/* Search Box */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-spirit-100">
                <h3 className="text-lg font-serif font-bold text-spirit-900 mb-4">Search Journal</h3>
                <form onSubmit={handleSearch} className="relative">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type to search..."
                    className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none text-sm bg-gray-50 transition-all"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-spirit-600">
                    <Search className="w-5 h-5" />
                  </button>
                </form>
              </div>

              {/* Categories Widget */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-spirit-100">
                  <h3 className="text-lg font-serif font-bold text-spirit-900 mb-4 flex items-center">
                      <FolderOpen className="w-5 h-5 mr-2 text-spirit-600" /> Categories
                  </h3>
                  <ul className="space-y-2">
                      {allCategories.length > 0 ? (
                          allCategories.map(cat => (
                              <li key={cat}>
                                  <Link 
                                      to={`/blog?category=${cat}`} 
                                      className="flex items-center justify-between text-gray-600 hover:text-spirit-600 hover:bg-spirit-50 p-2 rounded-lg transition"
                                  >
                                      <span>{cat}</span>
                                      <ChevronRight className="w-4 h-4 text-gray-300" />
                                  </Link>
                              </li>
                          ))
                      ) : (
                          <li className="text-sm text-gray-400 italic">No categories found.</li>
                      )}
                  </ul>
              </div>

              {/* Relevant Articles */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-spirit-100">
                <h3 className="text-lg font-serif font-bold text-spirit-900 mb-6 flex items-center justify-between">
                  <span>Relevant Articles</span>
                  <span className="text-xs text-spirit-400 font-sans font-normal">Curated for you</span>
                </h3>
                
                <div className="space-y-6">
                  {recentPosts.length > 0 ? (
                    recentPosts.map(recent => (
                      <Link key={recent.id} to={`/blog/${recent.id}`} className="flex group items-start">
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={recent.imageUrl} 
                            alt={recent.title} 
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="text-sm font-bold text-gray-800 group-hover:text-spirit-600 transition-colors line-clamp-2 leading-snug">
                            {recent.title}
                          </h4>
                          <span className="text-xs text-gray-400 mt-2 block">{recent.date}</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No other articles available.</p>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Link to="/blog" className="text-xs font-bold text-spirit-600 hover:text-spirit-800 flex items-center justify-center uppercase tracking-wider">
                    View All Posts <ChevronRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </div>

              {/* Newsletter Mini Widget */}
              <div className="bg-gradient-to-br from-spirit-800 to-spirit-900 p-8 rounded-xl shadow-md text-white text-center">
                <h3 className="text-xl font-serif font-bold mb-2">Inner Peace Daily</h3>
                <p className="text-spirit-200 text-sm mb-6">Join 500+ subscribers finding their path.</p>
                <Link to="/#contact" className="inline-block w-full bg-white text-spirit-900 font-bold py-2 rounded-lg hover:bg-spirit-50 transition text-sm">
                  Subscribe Now
                </Link>
              </div>

            </aside>
          )}

        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;