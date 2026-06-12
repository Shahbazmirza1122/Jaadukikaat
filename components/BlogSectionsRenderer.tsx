import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Book, ArrowRight, Calendar, User } from 'lucide-react';
import { BlogPost } from '../types';

interface BlogSectionsRendererProps {
  sections: any[];
  allPosts: BlogPost[];
}

export const BlogSectionsRenderer: React.FC<BlogSectionsRendererProps> = ({ sections, allPosts }) => {
  return (
    <div className="space-y-16">
      {sections.map(section => {
        let sectionPosts = [];
        
        if (section.config.specificPostIds && section.config.specificPostIds.length > 0) {
            // Explicitly requested posts override everything else
            sectionPosts = allPosts.filter(p => section.config.specificPostIds.includes(p.id));
        } else {
            // Otherwise use default logic based on form assignments and categories
            sectionPosts = allPosts.filter(p => {
              let belongsToThisSection = true;
              try {
                  if (p.relatedIds && p.relatedIds.length > 0) {
                      let config;
                      if (typeof p.relatedIds[0] === 'string') {
                          try { config = JSON.parse(p.relatedIds[0]); } catch(e){}
                      } else if (typeof p.relatedIds === 'string') {
                          try { config = JSON.parse(p.relatedIds as any); } catch(e){}
                      }
                      
                      if (config && config.displaySection && config.displaySection !== 'all') {
                          if (config.displaySection !== section.id) {
                              belongsToThisSection = false;
                          }
                      }
                  } else if (p.relatedIds && typeof p.relatedIds === 'string') {
                      const config = JSON.parse(p.relatedIds as string);
                      if (config && config.displaySection && config.displaySection !== 'all') {
                          if (config.displaySection !== section.id) {
                              belongsToThisSection = false;
                          }
                      }
                  }
              } catch(e) {}
              return belongsToThisSection;
            });
            
            if (section.config.categoryFilter) {
              sectionPosts = sectionPosts.filter(p => p.category.toLowerCase() === section.config.categoryFilter.toLowerCase());
            }
        }
        
        // Limit posts
        const postLimit = section.config.postLimit || 6;
        sectionPosts = sectionPosts.slice(0, postLimit);

        if (sectionPosts.length === 0) return null;

        const getAnimationProps = (anim: string) => {
            switch(anim) {
              case 'fade-in-up': return { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.8, ease: "easeOut" } };
              case 'fade-in-down': return { initial: { opacity: 0, y: -30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.8, ease: "easeOut" } };
              case 'fade-in-left': return { initial: { opacity: 0, x: -30 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { duration: 0.8, ease: "easeOut" } };
              case 'fade-in-right': return { initial: { opacity: 0, x: 30 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { duration: 0.8, ease: "easeOut" } };
              case 'zoom-in': return { initial: { opacity: 0, scale: 0.9 }, whileInView: { opacity: 1, scale: 1 }, viewport: { once: true }, transition: { duration: 0.8, ease: "easeOut" } };
              case 'zoom-in-up': return { initial: { opacity: 0, scale: 0.9, y: 30 }, whileInView: { opacity: 1, scale: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.8, ease: "easeOut" } };
              case 'bounce-in': return { initial: { opacity: 0, scale: 0.3 }, whileInView: { opacity: 1, scale: 1 }, viewport: { once: true }, transition: { type: "spring", stiffness: 200, damping: 15 } };
              case 'slide-in-left': return { initial: { opacity: 0, x: -100 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { duration: 0.8, ease: "easeOut" } };
              case 'slide-in-right': return { initial: { opacity: 0, x: 100 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { duration: 0.8, ease: "easeOut" } };
              case 'flip-in-x': return { initial: { opacity: 0, rotateX: 90 }, whileInView: { opacity: 1, rotateX: 0 }, viewport: { once: true }, transition: { duration: 0.8, ease: "easeOut" } };
              case 'flip-in-y': return { initial: { opacity: 0, rotateY: 90 }, whileInView: { opacity: 1, rotateY: 0 }, viewport: { once: true }, transition: { duration: 0.8, ease: "easeOut" } };
              case 'rotate-in': return { initial: { opacity: 0, rotate: -90 }, whileInView: { opacity: 1, rotate: 0 }, viewport: { once: true }, transition: { duration: 0.8, ease: "easeOut" } };
              case 'swing': return { initial: { rotate: 10 }, whileInView: { rotate: 0 }, viewport: { once: true }, transition: { type: "spring", stiffness: 200, damping: 10 } };
              case 'typewriter': return { initial: { clipPath: 'inset(0 100% 0 0)' }, whileInView: { clipPath: 'inset(0 0 0 0)' }, viewport: { once: true }, transition: { duration: 1.5, ease: "steps(40)" } };
              case 'typing-infinite': return { animate: { clipPath: ['inset(0 100% 0 0)', 'inset(0 0 0 0)', 'inset(0 0 0 0)', 'inset(0 100% 0 0)'] }, transition: { repeat: Infinity, duration: 4, times: [0, 0.4, 0.8, 1] } };
              default: return {};
            }
        };

        const renderGrid = (cols: number) => {
           let gridClass = "grid grid-cols-1 gap-6 place-items-center px-4 md:px-0";
           if (cols === 2) gridClass = "grid grid-cols-1 md:grid-cols-2 gap-6 place-items-center max-w-4xl mx-auto px-4 md:px-0";
           if (cols >= 3) gridClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center max-w-6xl mx-auto px-4 md:px-0";
           if (cols >= 4) gridClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 place-items-center max-w-7xl mx-auto px-4 md:px-0";

           return (
               <div className={gridClass}>
                 {sectionPosts.map(post => <PostCard key={post.id} post={post} />)}
               </div>
           );
        }

        const renderMarquee = (direction: 'left' | 'right') => {
           return (
             <div className="relative overflow-hidden w-full py-4 flex flex-nowrap" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
                 <motion.div 
                    className="flex space-x-8 whitespace-nowrap min-w-max"
                    animate={{ x: direction === 'left' ? [0, -1000] : [-1000, 0] }}
                    transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
                 >
                    {/* Duplicate list for infinite scroll feel */}
                    {[...sectionPosts, ...sectionPosts, ...sectionPosts].map((post, idx) => (
                       <div key={`${post.id}-${idx}`} className="w-[300px] shrink-0">
                          <PostCard post={post} />
                       </div>
                    ))}
                 </motion.div>
             </div>
           );
        }

        const renderSlider = () => {
           return (
             <div className="flex overflow-x-auto space-x-6 pb-8 px-4 max-w-7xl mx-auto snap-x snap-mandatory py-4 hide-scrollbar">
                 {sectionPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                 ))}
             </div>
           );
        };

        const renderFeatured = () => {
            const latest = sectionPosts[0];
            const others = sectionPosts.slice(1);
            return (
                <div>
                   <div className="mb-12 animate-fade-in text-left">
                        <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-spirit-100 group lg:h-[350px]">
                            <div className="flex flex-col lg:flex-row h-full">
                                <div className="h-64 lg:h-full lg:w-2/5 overflow-hidden">
                                    <Link to={`/blog/${latest.id}`}>
                                        <img 
                                            src={latest.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e"} 
                                            alt={latest.title} 
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                        />
                                    </Link>
                                </div>
                                <div className="p-8 flex flex-col lg:w-3/5">
                                    <div className="flex items-center text-sm text-spirit-500 mb-3 space-x-4">
                                        <span className="bg-spirit-100 text-spirit-800 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wide">Featured</span>
                                        <span className="hidden sm:flex items-center"><Calendar size={14} className="mr-1" /> {latest.date}</span>
                                    </div>
                                    <Link to={`/blog/${latest.id}`} className="block">
                                        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2 group-hover:text-spirit-600 transition-colors line-clamp-2">
                                        {latest.title}
                                        </h2>
                                    </Link>
                                    <p className="text-gray-700 text-base mb-4 leading-relaxed line-clamp-4 flex-grow font-light">
                                        {latest.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                                        <div className="flex items-center text-sm text-gray-500">
                                        <User size={16} className="mr-2" />
                                        {latest.author}
                                        </div>
                                        <Link to={`/blog/${latest.id}`} className="text-spirit-600 font-bold hover:text-spirit-800 flex items-center transition-colors text-sm">
                                        Read <ArrowRight size={16} className="ml-2" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {others.length > 0 && renderGrid(section.config.columns || 3)}
                </div>
            );
        }

        const getContainerClass = () => {
             let cols = section.config.columns || 3;
             if (section.config.layoutType === 'grid' || !section.config.layoutType) {
                 if (cols === 2) return "max-w-4xl mx-auto";
                 if (cols >= 4) return "max-w-7xl mx-auto";
                 return "max-w-6xl mx-auto";
             }
             if (section.config.layoutType === 'carousel' || section.config.layoutType === 'featured') {
                 return "max-w-7xl mx-auto";
             }
             return "max-w-6xl mx-auto";
        };
        const maxWClass = getContainerClass();

        return (
            <section key={section.id} className={`${section.config.spacing || 'mb-12'}`}>
                {(section.title || section.subtitle) && (
                    <div className={`${maxWClass} mb-10 px-4 md:px-0`}>
                        {section.title && (
                            <motion.h2 
                                className={`font-bold font-serif text-spirit-900 mb-4 ${section.config.headingAlignment || 'text-center'} ${section.config.headingSize || 'text-3xl sm:text-4xl'}`}
                                {...getAnimationProps(section.config.headingAnimation || 'fade-in-up')}
                            >
                                {section.title}
                            </motion.h2>
                        )}
                        {section.subtitle && (
                            <motion.p 
                                className={`text-gray-600 ${section.config.textAlignment || 'text-center'} ${(section.config.textAlignment || 'text-center') === 'text-center' ? 'mx-auto' : (section.config.textAlignment || 'text-center') === 'text-right' ? 'ml-auto' : 'mr-auto'}`}
                                style={{ width: `${section.config.subtitleWidth || 100}%` }}
                                {...getAnimationProps(section.config.textAnimation || section.config.headingAnimation || 'fade-in-up')}
                            >
                                {section.subtitle}
                            </motion.p>
                        )}
                    </div>
                )}

                {(section.config.layoutType === 'grid' || !section.config.layoutType) && renderGrid(section.config.columns || 3)}
                {section.config.layoutType === 'carousel' && renderSlider()}
                {section.config.layoutType === 'marquee-left' && renderMarquee('left')}
                {section.config.layoutType === 'marquee-right' && renderMarquee('right')}
                {section.config.layoutType === 'featured' && renderFeatured()}

                {section.config.buttonText && section.config.buttonUrl && (
                    <div className={`${maxWClass} mt-12 flex ${section.config.buttonAlignment || 'justify-center'} w-full px-4 md:px-0`}>
                        {section.config.buttonUrl.startsWith('http') ? (
                          <a 
                              href={section.config.buttonUrl} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-spirit-600 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-spirit-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center"
                          >
                              {section.config.buttonText}
                          </a>
                        ) : (
                          <Link 
                              to={section.config.buttonUrl} 
                              className="bg-spirit-600 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-spirit-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center"
                          >
                              {section.config.buttonText}
                          </Link>
                        )}
                    </div>
                )}

            </section>
        );
      })}
    </div>
  );
};

const PostCard = ({ post }: { post: BlogPost }) => (
  <Link
    to={`/blog/${post.id}`}
    className="w-full mx-auto max-w-[420px] shrink-0 bg-white rounded-3xl border border-spirit-100 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-[450px] group relative mt-4"
  >
      <div className="h-56 relative overflow-hidden shrink-0 rounded-t-3xl border-b border-spirit-50">
        <img
          src={post.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e"}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      <span className="absolute top-0 right-6 -translate-y-1/2 bg-white/95 backdrop-blur-sm px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-spirit-800 shadow-md z-10 border-2 border-spirit-900">
        {post.category || "Wisdom"}
      </span>
      <div className="p-6 flex flex-col flex-grow text-left">
          <h3 className="text-xl font-serif text-spirit-900 mb-2 line-clamp-2 uppercase">
            {post.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
            {post.excerpt}
          </p>
          <div className="mt-auto flex items-center justify-center py-3 bg-slate-50 rounded-xl text-spirit-800 text-sm font-semibold group-hover:bg-spirit-800 group-hover:text-white transition-colors duration-300">
             <Book className="w-4 h-4 mr-2" /> Read Article <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
      </div>
  </Link>
);
