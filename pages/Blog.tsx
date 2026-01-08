
import React, { useEffect, useState } from 'react';
import { Calendar, User, ArrowRight, CircleX } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { BlogPost } from '../types';
import { supabase } from '../lib/supabase';

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
        
        if (error) {
            console.error("Error fetching posts:", error);
            setLoading(false);
            return;
        }

        // Map database fields (snake_case) to app types (camelCase)
        let publishedPosts: BlogPost[] = (data || []).map((p: any) => ({
            ...p,
            imageUrl: p.image_url || p.imageUrl,
            relatedIds: p.related_ids || p.relatedIds,
            isLatest: p.is_latest || p.isLatest
        }));

        // In-memory Search Filtering
        if (searchFilter) {
            const lowerQ = searchFilter.toLowerCase();
            publishedPosts = publishedPosts.filter(p => 
                p.title.toLowerCase().includes(lowerQ) || 
                p.content.toLowerCase().includes(lowerQ) ||
                p.excerpt.toLowerCase().includes(lowerQ)
            );
        }

        if (publishedPosts.length > 0) {
            if (!categoryFilter && !searchFilter) {
                // Determine featured post
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
    <div className="bg-spirit-50 min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-spirit-900 mb-4">Jaadu ki kaat Journal</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Insights, stories, and wisdom to illuminate your spiritual path.</p>
        </div>

        {/* Filter Indicators */}
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
                {/* Latest Post */}
                {latest && (
                <div className="mb-16 animate-fade-in">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-spirit-100 group">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="h-64 lg:h-auto overflow-hidden">
                        <Link to={`/blog/${latest.id}`}>
                            <img 
                            src={latest.imageUrl} 
                            alt={latest.title} 
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                        </Link>
                        </div>
                        <div className="p-8 lg:p-12 flex flex-col justify-center">
                        <div className="flex items-center text-sm text-spirit-500 mb-4 space-x-4">
                            <span className="bg-spirit-100 text-spirit-800 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wide">Latest Feature</span>
                            <span className="flex items-center"><Calendar size={14} className="mr-1" /> {latest.date}</span>
                            {latest.category && <span className="text-gray-400">• {latest.category}</span>}
                        </div>
                        <Link to={`/blog/${latest.id}`}>
                            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4 hover:text-spirit-600 transition-colors cursor-pointer">
                            {latest.title}
                            </h2>
                        </Link>
                        <p className="text-gray-600 text-lg mb-6 leading-relaxed line-clamp-3">
                            {latest.excerpt}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center text-sm text-gray-500">
                            <User size={16} className="mr-2" />
                            {latest.author}
                            </div>
                            <Link to={`/blog/${latest.id}`} className="text-spirit-600 font-bold hover:text-spirit-800 flex items-center transition-colors">
                            Read Article <ArrowRight size={18} className="ml-2" />
                            </Link>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                )}

                {/* Empty State */}
                {!latest && posts.length === 0 && (
                <div className="text-center py-24 bg-white rounded-xl shadow-sm mb-12 border border-gray-100">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No articles found</h3>
                    <p className="text-gray-500 italic mb-6">Try adjusting your search or filters.</p>
                    <button onClick={clearFilters} className="text-spirit-600 font-bold hover:underline">View All Articles</button>
                </div>
                )}

                {/* Grid Posts */}
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
