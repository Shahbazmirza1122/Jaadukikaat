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
      textAnimation: 'fade-in-up'
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
        textAnimation: 'fade-in-up'
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
        textAnimation: 'fade-in-up'
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

      <form onSubmit={handleSave} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-8">
        
        {/* Basic Content */}
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Banner Content</h2>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Heading Text</label>
              <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-spirit-500" placeholder="e.g. Divine Clarity" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Sub-Text (Paragraph)</label>
              <textarea rows={3} value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-spirit-500" placeholder="e.g. Experience profound inner peace..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Button Text</label>
                <input required type="text" value={form.linkText} onChange={e => setForm({...form, linkText: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-spirit-500" placeholder="e.g. Explore Our Path" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Button Link / Target</label>
                <input required type="text" value={form.linkTarget} onChange={e => setForm({...form, linkTarget: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-spirit-500" placeholder="e.g. #services or /store" />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-bold text-gray-700">Background Image URL</label>
                {form.imageUrl && (
                  <button 
                    type="button" 
                    onClick={() => setShowCropper(true)} 
                    className="text-xs font-bold text-spirit-600 flex items-center hover:text-spirit-800"
                  >
                    <Crop className="w-3 h-3 mr-1" />
                    Preview & Crop
                  </button>
                )}
              </div>
              <input required type="text" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300" placeholder="https://images.unsplash.com/photo-..." />
            </div>
        </div>

        {/* Styling & Animations */}
        <div className="border-t border-gray-200 pt-8 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Styling & Animations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Image Transition Style</label>
              <select value={form.config.imageTransition} onChange={e => setForm({...form, config: {...form.config, imageTransition: e.target.value}})} className="w-full px-4 py-2 rounded-lg border border-gray-300">
                 <option value="none">None</option>
                 <option value="zoom">Continuous Zoom</option>
                 <option value="fade">Simple Fade</option>
                 <option value="pan-up">Pan Up</option>
                 <option value="pan-down">Pan Down</option>
                 <option value="slide-left">Slide Left</option>
                 <option value="slide-right">Slide Right</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Heading Animation</label>
                <select value={form.config.headingAnimation || 'fade-in-up'} onChange={e => setForm({...form, config: {...form.config, headingAnimation: e.target.value}})} className="w-full px-4 py-2 rounded-lg border border-gray-300">
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
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Text Animation</label>
                <select value={form.config.textAnimation || 'fade-in-up'} onChange={e => setForm({...form, config: {...form.config, textAnimation: e.target.value}})} className="w-full px-4 py-2 rounded-lg border border-gray-300">
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
                </select>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-6">
            <h3 className="font-bold text-gray-800">Overlay Box Configuration</h3>
            <p className="text-sm text-gray-500 mb-4">Configure the dark/colored overlay that sits between the background image and the text.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Overlay Size / Width</label>
                <input type="text" value={form.config.overlayWidth || '100%'} onChange={e => setForm({...form, config: {...form.config, overlayWidth: e.target.value}})} className="w-full px-4 py-2 rounded-lg border border-gray-300" placeholder="e.g. 100%, 50vw, 400px" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Overlay Height</label>
                <input type="text" value={form.config.overlayHeight} onChange={e => setForm({...form, config: {...form.config, overlayHeight: e.target.value}})} className="w-full px-4 py-2 rounded-lg border border-gray-300" placeholder="e.g. 100%, 50vh, 20rem" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Overlay Position</label>
                <select value={form.config.overlayPosition || 'bottom'} onChange={e => setForm({...form, config: {...form.config, overlayPosition: e.target.value}})} className="w-full px-4 py-2 rounded-lg border border-gray-300">
                   <option value="bottom">Bottom</option>
                   <option value="top">Top</option>
                   <option value="left">Left</option>
                   <option value="right">Right</option>
                   <option value="center">Center</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Overlay Color</label>
                <div className="flex gap-2">
                    <input type="color" value={form.config.overlayColor} onChange={e => setForm({...form, config: {...form.config, overlayColor: e.target.value}})} className="w-12 h-10 px-1 py-1 rounded border border-gray-300 cursor-pointer aspect-square" />
                    <input type="text" value={form.config.overlayColor} onChange={e => setForm({...form, config: {...form.config, overlayColor: e.target.value}})} className="w-full px-4 py-2 rounded-lg border border-gray-300 font-mono text-sm uppercase" />
                </div>
              </div>
              <div className="md:col-span-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Transparency (Opacity)</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="0" max="1" step="0.05" value={form.config.overlayOpacity} onChange={e => setForm({...form, config: {...form.config, overlayOpacity: e.target.value}})} className="flex-1" />
                  <span className="font-bold text-gray-700 w-12 text-right">{Math.round(parseFloat(form.config.overlayOpacity) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
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
