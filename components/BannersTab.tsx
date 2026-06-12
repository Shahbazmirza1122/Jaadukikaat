import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Pencil, Trash2, ArrowLeft, Loader2, Image as ImageIcon, Crop } from 'lucide-react';
import { BlogPost } from '../types';
import { ImageCropper } from './ImageCropper';

export const BannersTab: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [isLoading, setIsLoading] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkText: 'Explore',
    linkTarget: '#services',
    config: {
      imageTransition: 'zoom', // 'zoom' | 'slide' | 'fade' | 'none'
      overlayHeight: '100%',
      overlayWidth: '100%',
      overlayPosition: 'bottom',
      overlayColor: '#000000',
      overlayOpacity: '0.4',
      headingAnimation: 'fade-in-up', // 'fade-in-up' | 'pulse' | 'typewriter' | 'none'
      textAnimation: 'fade-in-up',
      headingSize: 'text-[2rem] sm:text-5xl md:text-8xl',
      textSize: 'text-base sm:text-xl md:text-2xl',
      spacing: 'mb-4 md:mb-6',
      typewriterSpeed: 'normal'
    }
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('category', '_banner_')
      .order('created_at', { ascending: true }); // keep order

    if (!error && data) {
      const mapped = data.map((post: any) => {
        let config = form.config;
        try {
           config = JSON.parse(post.content);
        } catch(e) {}
        
        return {
          id: post.id,
          title: post.title,
          subtitle: post.excerpt,
          imageUrl: post.image_url,
          linkText: post.author, // reuse author for button text
          linkTarget: post.date, // reuse date for button target
          config
        };
      });
      setBanners(mapped);
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setEditId(null);
    setForm({
      title: '',
      subtitle: '',
      imageUrl: '',
      linkText: 'Explore',
      linkTarget: '#services',
      config: {
        imageTransition: 'zoom',
        overlayHeight: '100%',
        overlayWidth: '100%',
        overlayPosition: 'bottom',
        overlayColor: '#000000',
        overlayOpacity: '0.4',
        headingAnimation: 'fade-in-up',
        textAnimation: 'fade-in-up',
        headingSize: 'text-[2rem] sm:text-5xl md:text-8xl',
        textSize: 'text-base sm:text-xl md:text-2xl',
        spacing: 'mb-4 md:mb-6',
        typewriterSpeed: 'normal'
      }
    });
  };

  const handleEdit = (banner: any) => {
    setEditId(banner.id);
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl || '',
      linkText: banner.linkText || 'Explore',
      linkTarget: banner.linkTarget || '#services',
      config: banner.config || {
        imageTransition: 'zoom',
        overlayHeight: '100%',
        overlayWidth: '100%',
        overlayPosition: 'bottom',
        overlayColor: '#000000',
        overlayOpacity: '0.4',
        headingAnimation: 'fade-in-up',
        textAnimation: 'fade-in-up',
        headingSize: 'text-[2rem] sm:text-5xl md:text-8xl',
        textSize: 'text-base sm:text-xl md:text-2xl',
        spacing: 'mb-4 md:mb-6',
        typewriterSpeed: 'normal'
      }
    });
    setView('form');
  };

  const handleDelete = async (id: string) => {
    if(window.confirm('Are you sure you want to delete this banner?')) {
        setIsLoading(true);
        await supabase.from('posts').delete().eq('id', id);
        await fetchBanners();
        setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      title: form.title,
      excerpt: form.subtitle,
      image_url: form.imageUrl,
      category: '_banner_',
      author: form.linkText,
      date: form.linkTarget,
      content: JSON.stringify(form.config),
      status: 'published'
    };

    if (editId) {
      await supabase.from('posts').update(payload).eq('id', editId);
    } else {
      await supabase.from('posts').insert([payload]);
    }
    await fetchBanners();
    resetForm();
    setView('list');
    setIsLoading(false);
  };

  if (view === 'list') {
    return (
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-800">Home Page Banners</h1>
            <p className="text-gray-500 mt-1">Manage the hero slides on the main home page.</p>
          </div>
          <button onClick={() => { resetForm(); setView('form'); }} className="bg-spirit-600 text-white px-6 py-2.5 rounded-lg flex items-center font-bold hover:bg-spirit-700 transition">
            <Plus className="w-5 h-5 mr-2" />
            Add Banner
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-spirit-500"/></div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                   <tr>
                      <th className="p-4 w-20">Preview</th>
                      <th className="p-4">Title</th>
                      <th className="p-4 hidden md:table-cell">Transitions</th>
                      <th className="p-4 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {banners.length === 0 ? (
                      <tr><td colSpan={4} className="p-8 text-center text-gray-500">No banners configured. Add one to replace the default slides.</td></tr>
                   ) : (
                      banners.map(banner => (
                         <tr key={banner.id} className="hover:bg-slate-50 transition">
                            <td className="p-4">
                              {banner.imageUrl ? (
                                <img src={banner.imageUrl} alt={banner.title} className="w-16 h-12 object-cover rounded shadow-sm border" />
                              ) : (
                                <div className="w-16 h-12 bg-gray-100 flex items-center justify-center rounded"><ImageIcon className="text-gray-400 w-5 h-5"/></div>
                              )}
                            </td>
                            <td className="p-4 font-bold text-spirit-900">{banner.title || 'Untitled Banner'}</td>
                            <td className="p-4 text-xs text-gray-500 hidden md:table-cell">
                                <span className="bg-slate-100 px-2 py-1 rounded">Image: {banner.config?.imageTransition}</span>
                                <span className="bg-slate-100 px-2 py-1 rounded ml-1">Text: {banner.config?.headingAnimation}</span>
                            </td>
                            <td className="p-4 text-right">
                               <button onClick={() => handleEdit(banner)} className="p-2 text-gray-500 hover:text-spirit-600 rounded"><Pencil className="w-4 h-4"/></button>
                               <button onClick={() => handleDelete(banner.id)} className="p-2 text-gray-500 hover:text-red-600 rounded"><Trash2 className="w-4 h-4"/></button>
                            </td>
                         </tr>
                      ))
                   )}
                </tbody>
             </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-800">{editId ? 'Edit Banner' : 'New Banner'}</h1>
        <button onClick={() => { resetForm(); setView('list'); }} className="bg-white border border-gray-200 px-6 py-2.5 rounded-lg flex items-center font-bold text-gray-600 hover:bg-gray-50 transition">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Content & Media section */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Content & Media</h2>
            <p className="text-sm text-gray-500">Define the core content and background image of this slide.</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Heading Text</label>
              <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 focus:border-spirit-500 outline-none transition" placeholder="e.g. Divine Clarity" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sub-Text (Paragraph)</label>
              <textarea rows={3} value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 focus:border-spirit-500 outline-none transition" placeholder="e.g. Experience profound inner peace..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Button Text</label>
                <input required type="text" value={form.linkText} onChange={e => setForm({...form, linkText: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 focus:border-spirit-500 outline-none transition" placeholder="e.g. Explore Our Path" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Button Link / Target</label>
                <input required type="text" value={form.linkTarget} onChange={e => setForm({...form, linkTarget: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 focus:border-spirit-500 outline-none transition" placeholder="e.g. #services or /store" />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-end mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">Background Image URL</label>
                {form.imageUrl && (
                  <button 
                    type="button" 
                    onClick={() => setShowCropper(true)} 
                    className="text-xs font-bold text-spirit-600 flex items-center hover:text-spirit-800 bg-spirit-50 px-2 py-1 rounded"
                  >
                    <Crop className="w-3.5 h-3.5 mr-1" />
                    Preview & Crop
                  </button>
                )}
              </div>
              <input required type="text" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 focus:border-spirit-500 outline-none transition" placeholder="https://images.unsplash.com/photo-..." />
            </div>
          </div>
        </div>

        {/* Styling & Animations */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Styling & Animations</h2>
            <p className="text-sm text-gray-500">Configure layout sizing, text effects, and display transitions.</p>
          </div>
          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image Transition Style</label>
                <select value={form.config.imageTransition} onChange={e => setForm({...form, config: {...form.config, imageTransition: e.target.value}})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 focus:border-spirit-500 outline-none transition">
                   <option value="none">None</option>
                   <option value="zoom">Continuous Zoom</option>
                   <option value="fade">Simple Fade</option>
                   <option value="pan-up">Pan Up</option>
                   <option value="pan-down">Pan Down</option>
                   <option value="slide-left">Slide Left</option>
                   <option value="slide-right">Slide Right</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Heading Animation</label>
                <select value={form.config.headingAnimation || 'fade-in-up'} onChange={e => setForm({...form, config: {...form.config, headingAnimation: e.target.value}})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 focus:border-spirit-500 outline-none transition">
                   <option value="none">None</option>
                   <option value="fade-in-up">Fade In Up</option>
                   <option value="fade-in-down">Fade In Down</option>
                   <option value="fade-in-left">Fade In Left</option>
                   <option value="fade-in-right">Fade In Right</option>
                   <option value="zoom-in">Zoom In</option>
                   <option value="zoom-in-up">Zoom In Up</option>
                   <option value="bounce-in">Bounce In</option>
                   <option value="slide-in-left">Slide In Left</option>
                   <option value="slide-in-right">Slide In Right</option>
                   <option value="flip-in-x">Flip In X</option>
                   <option value="flip-in-y">Flip In Y</option>
                   <option value="rotate-in">Rotate In</option>
                   <option value="swing">Swing</option>
                   <option value="typewriter">Typewriter Reveal</option>
                   <option value="typing-infinite">Typewriter Infinite</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Text Animation</label>
                <select value={form.config.textAnimation || 'fade-in-up'} onChange={e => setForm({...form, config: {...form.config, textAnimation: e.target.value}})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 focus:border-spirit-500 outline-none transition">
                   <option value="none">None</option>
                   <option value="fade-in-up">Fade In Up</option>
                   <option value="fade-in-down">Fade In Down</option>
                   <option value="fade-in-left">Fade In Left</option>
                   <option value="fade-in-right">Fade In Right</option>
                   <option value="zoom-in">Zoom In</option>
                   <option value="zoom-in-up">Zoom In Up</option>
                   <option value="bounce-in">Bounce In</option>
                   <option value="slide-in-left">Slide In Left</option>
                   <option value="slide-in-right">Slide In Right</option>
                   <option value="flip-in-x">Flip In X</option>
                   <option value="flip-in-y">Flip In Y</option>
                   <option value="rotate-in">Rotate In</option>
                   <option value="swing">Swing</option>
                   <option value="typewriter">Typewriter Reveal</option>
                   <option value="typing-infinite">Typewriter Infinite</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-50 border border-slate-200 rounded-xl p-6 mx-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Heading Size</label>
                <select value={form.config.headingSize || 'text-[2rem] sm:text-5xl md:text-8xl'} onChange={e => setForm({...form, config: {...form.config, headingSize: e.target.value}})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 focus:border-spirit-500 outline-none transition">
                   <option value="text-[1.5rem] sm:text-3xl md:text-5xl">Small</option>
                   <option value="text-[2rem] sm:text-4xl md:text-6xl">Medium</option>
                   <option value="text-[2rem] sm:text-5xl md:text-8xl">Large (Default)</option>
                   <option value="text-[3rem] sm:text-6xl md:text-9xl">Extra Large</option>
                   <option disabled>──────────</option>
                   <option value="text-[40px] md:text-[48px] font-bold">Heading 1 (H1)</option>
                   <option value="text-[32px] md:text-[40px] font-bold">Heading 2 (H2)</option>
                   <option value="text-[28px] md:text-[32px] font-bold">Heading 3 (H3)</option>
                   <option value="text-[24px] md:text-[28px] font-bold">Heading 4 (H4)</option>
                   <option value="text-[20px] md:text-[24px] font-bold">Heading 5 (H5)</option>
                   <option value="text-[16px] md:text-[20px] font-bold">Heading 6 (H6)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Text Size</label>
                <select value={form.config.textSize || 'text-base sm:text-xl md:text-2xl'} onChange={e => setForm({...form, config: {...form.config, textSize: e.target.value}})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 focus:border-spirit-500 outline-none transition">
                   <option value="text-sm sm:text-base md:text-lg">Small</option>
                   <option value="text-base sm:text-xl md:text-2xl">Medium (Default)</option>
                   <option value="text-lg sm:text-2xl md:text-3xl">Large</option>
                   <option disabled>──────────</option>
                   <option value="text-[10px]">10px</option>
                   <option value="text-[11px]">11px</option>
                   <option value="text-[12px]">12px</option>
                   <option value="text-[13px]">13px</option>
                   <option value="text-[14px]">14px</option>
                   <option value="text-[15px]">15px</option>
                   <option value="text-[16px]">16px</option>
                   <option value="text-[18px]">18px</option>
                   <option value="text-[20px]">20px</option>
                   <option value="text-[22px]">22px</option>
                   <option value="text-[24px]">24px</option>
                   <option value="text-[26px]">26px</option>
                   <option value="text-[28px]">28px</option>
                   <option value="text-[32px]">32px</option>
                   <option value="text-[36px]">36px</option>
                   <option value="text-[40px]">40px</option>
                   <option value="text-[48px]">48px</option>
                   <option value="text-[56px]">56px</option>
                   <option value="text-[64px]">64px</option>
                   <option value="text-[72px]">72px</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vertical Spacing</label>
                <select value={form.config.spacing || 'mb-4 md:mb-6'} onChange={e => setForm({...form, config: {...form.config, spacing: e.target.value}})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 focus:border-spirit-500 outline-none transition">
                   <option value="mb-2 md:mb-4">Compact (Small)</option>
                   <option value="mb-4 md:mb-6">Normal (Medium)</option>
                   <option value="mb-8 md:mb-12">Loose (Large)</option>
                   <option value="mb-12 md:mb-16">Very Loose (X-Large)</option>
                   <option disabled>──────────</option>
                   <option value="mb-[0px]">0px</option>
                   <option value="mb-[1px]">1px</option>
                   <option value="mb-[2px]">2px</option>
                   <option value="mb-[4px]">4px</option>
                   <option value="mb-[6px]">6px</option>
                   <option value="mb-[8px]">8px</option>
                   <option value="mb-[10px]">10px</option>
                   <option value="mb-[12px]">12px</option>
                   <option value="mb-[16px]">16px</option>
                   <option value="mb-[20px]">20px</option>
                   <option value="mb-[24px]">24px</option>
                   <option value="mb-[28px]">28px</option>
                   <option value="mb-[32px]">32px</option>
                   <option value="mb-[40px]">40px</option>
                   <option value="mb-[48px]">48px</option>
                   <option value="mb-[56px]">56px</option>
                   <option value="mb-[64px]">64px</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Typewriter Speed</label>
                <select value={form.config.typewriterSpeed || 'normal'} onChange={e => setForm({...form, config: {...form.config, typewriterSpeed: e.target.value}})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 focus:border-spirit-500 outline-none transition">
                   <option value="fast">Fast</option>
                   <option value="normal">Normal</option>
                   <option value="slow">Slow</option>
                   <option value="very-slow">Very Slow</option>
                </select>
              </div>
          </div>
        </div>

        {/* Overlay Block */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-gray-200">
             <h3 className="text-lg font-bold text-gray-900">Overlay Interface Config</h3>
             <p className="text-sm text-gray-500">Configure the background overlay framing the copy over the slide image.</p>
          </div>
          <div className="p-6">
          
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Overlay Size / Width</label>
                <input type="text" value={form.config.overlayWidth || '100%'} onChange={e => setForm({...form, config: {...form.config, overlayWidth: e.target.value}})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 outline-none transition" placeholder="e.g. 100%, 50vw, 400px" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Overlay Height</label>
                <input type="text" value={form.config.overlayHeight} onChange={e => setForm({...form, config: {...form.config, overlayHeight: e.target.value}})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 outline-none transition" placeholder="e.g. 100%, 50vh, 20rem" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Overlay Position</label>
                <select value={form.config.overlayPosition || 'bottom'} onChange={e => setForm({...form, config: {...form.config, overlayPosition: e.target.value}})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 outline-none transition">
                   <option value="bottom">Bottom</option>
                   <option value="top">Top</option>
                   <option value="left">Left</option>
                   <option value="right">Right</option>
                   <option value="center">Center</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Overlay Color</label>
                <div className="flex gap-2">
                    <input type="color" value={form.config.overlayColor} onChange={e => setForm({...form, config: {...form.config, overlayColor: e.target.value}})} className="w-12 h-[42px] px-1 py-1 rounded border border-gray-300 cursor-pointer object-cover shrink-0" />
                    <input type="text" value={form.config.overlayColor} onChange={e => setForm({...form, config: {...form.config, overlayColor: e.target.value}})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 font-mono text-sm uppercase focus:ring-2 focus:ring-spirit-500 outline-none transition" />
                </div>
              </div>
              <div className="md:col-span-4 bg-slate-50/50 p-4 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Transparency</label>
                  <span className="font-bold text-spirit-800 text-sm">{Math.round(parseFloat(form.config.overlayOpacity) * 100)}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.05" value={form.config.overlayOpacity} onChange={e => setForm({...form, config: {...form.config, overlayOpacity: e.target.value}})} className="w-full accent-spirit-600 cursor-pointer h-2 bg-gray-200 rounded-lg appearance-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isLoading} className="bg-spirit-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-spirit-800 flex items-center min-w-[150px] shadow-lg transition">
             {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : <Plus className="w-5 h-5 mr-2" />}
             {isLoading ? 'Saving...' : 'Save Banner'}
          </button>
        </div>
      </form>

      {showCropper && form.imageUrl && (
        <ImageCropper 
          imageSrc={form.imageUrl} 
          onCancel={() => setShowCropper(false)}
          onCropComplete={(base64Img) => {
            setForm({ ...form, imageUrl: base64Img });
            setShowCropper(false);
          }}
        />
      )}
    </div>
  );
};
