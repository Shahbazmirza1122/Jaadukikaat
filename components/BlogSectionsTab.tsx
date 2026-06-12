import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Pencil, Trash2, ArrowLeft, Loader2, GripVertical } from 'lucide-react';

export const BlogSectionsTab: React.FC = () => {
  const [sections, setSections] = useState<any[]>([]);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [isLoading, setIsLoading] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    config: {
      layoutType: 'grid', // 'grid', 'carousel', 'marquee-left', 'marquee-right'
      columns: 3,
      postLimit: 6,
      categoryFilter: '',
      specificPostIds: [] as string[],
      displayPage: 'all',
      buttonText: '',
      buttonUrl: '',
      buttonAlignment: 'justify-center',
      headingAlignment: 'text-center',
      textAlignment: 'text-center',
      subtitleWidth: '100',
      headingAnimation: 'fade-in-up',
      textAnimation: 'fade-in-up',
      headingSize: 'text-[2rem] sm:text-5xl md:text-6xl',
      // The user wants these standard sizes too
      spacing: 'mb-4 md:mb-6',
    }
  });

  const [editId, setEditId] = useState<string | null>(null);

  const [categories, setCategories] = useState<{ id: string; title: string }[]>([]);
  const [allPosts, setAllPosts] = useState<{ id: string; title: string, category: string }[]>([]);

  useEffect(() => {
    fetchSections();
    fetchServiceCategories();
    fetchBlogCategories();
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('id, title, category')
      .neq('category', '_blog_category_')
      .neq('category', '_blog_section_')
      .neq('category', '_page_section_')
      .order('created_at', { ascending: false });
    if (data) setAllPosts(data);
  };

  const fetchServiceCategories = async () => {
    const { data } = await supabase.from('service_categories').select('*');
    if (data) setServiceCategories(data);
  };

  const fetchBlogCategories = async () => {
    const { data } = await supabase.from('posts').select('id, title').eq('category', '_blog_category_');
    if (data) setCategories(data);
  };

  const fetchSections = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('category', '_blog_section_')
      .order('created_at', { ascending: true }); 

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
          config
        };
      });
      setSections(mapped);
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setEditId(null);
    setForm({
      title: '',
      subtitle: '',
      config: {
        layoutType: 'grid',
        columns: 3,
        postLimit: 6,
        categoryFilter: '',
        specificPostIds: [] as string[],
        displayPage: 'all',
        buttonText: '',
        buttonUrl: '',
        buttonAlignment: 'justify-center',
        headingAlignment: 'text-center',
        textAlignment: 'text-center',
        subtitleWidth: '100',
        headingAnimation: 'fade-in-up',
        textAnimation: 'fade-in-up',
        headingSize: 'text-[2rem] sm:text-5xl md:text-6xl',
        spacing: 'mb-4 md:mb-6',
      }
    });
  };

  const handleEdit = (section: any) => {
    setEditId(section.id);
    setForm({
      title: section.title || '',
      subtitle: section.subtitle || '',
      config: {
        ...form.config,
        ...(section.config || {})
      }
    });
    setView('form');
  };

  const handleDelete = async (id: string) => {
    if(window.confirm('Are you sure you want to delete this section?')) {
        setIsLoading(true);
        await supabase.from('posts').delete().eq('id', id);
        await fetchSections();
        setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const payload = {
      title: form.title,
      excerpt: form.subtitle,
      category: '_blog_section_',
      content: JSON.stringify(form.config),
      status: 'published'
    };

    if (editId) {
      await supabase.from('posts').update(payload).eq('id', editId);
    } else {
      await supabase.from('posts').insert([payload]);
    }
    await fetchSections();
    resetForm();
    setView('list');
    setIsLoading(false);
  };

  if (view === 'list') {
    return (
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-800">Blog Sections</h1>
              <p className="text-gray-500 text-sm mt-1">Design your blog landing page by creating custom sections.</p>
            </div>
            <button
              onClick={() => { resetForm(); setView('form'); }}
              className="bg-spirit-900 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-spirit-800 transition shadow-md flex items-center shrink-0"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Section
            </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {sections.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                  <Plus className="w-8 h-8 text-gray-300" />
                </div>
              </div>
              <p>No blog sections active. The default layout will be used.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold border-b border-gray-100 w-12"></th>
                    <th className="p-4 font-bold border-b border-gray-100">Heading</th>
                    <th className="p-4 font-bold border-b border-gray-100 w-32">Layout</th>
                    <th className="p-4 font-bold border-b border-gray-100 text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sections.map((section, index) => (
                    <tr key={section.id} className="hover:bg-slate-50 transition">
                       <td className="p-4 text-gray-300">
                          <GripVertical className="w-5 h-5 cursor-grab" />
                       </td>
                       <td className="p-4 max-w-sm">
                          <div className="font-bold text-spirit-900 truncate">{section.title}</div>
                          <div className="text-xs text-gray-500 truncate">{section.subtitle}</div>
                       </td>
                       <td className="p-4">
                           <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium capitalize whitespace-nowrap">
                             {section.config.layoutType.replace('-', ' ')}
                           </span>
                       </td>
                       <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(section)}
                              className="p-2 text-gray-500 hover:text-spirit-600 hover:bg-spirit-50 rounded transition"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(section.id)}
                              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h1 className="text-2xl font-bold font-serif text-gray-900">{editId ? 'Edit Section' : 'Add New Section'}</h1>
        </div>
        <button
          onClick={() => { resetForm(); setView('list'); }}
          className="text-gray-500 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 transition flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section Identity */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Section Header</h2>
            <p className="text-sm text-gray-500">Configure the title that appears above this block of blogs.</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Heading Title</label>
              <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 outline-none transition" placeholder="e.g. Latest Spiritual Insights" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sub-Text (Paragraph)</label>
              <textarea rows={2} value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 outline-none transition" placeholder="e.g. Discover our most recent articles..." />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Heading Alignment</label>
                <select value={form.config.headingAlignment || 'text-center'} onChange={e => setForm({...form, config: {...form.config, headingAlignment: e.target.value}})} className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-none">
                   <option value="text-left">Left</option>
                   <option value="text-center">Center</option>
                   <option value="text-right">Right</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Text/Sub-Text Alignment</label>
                <select value={form.config.textAlignment || 'text-center'} onChange={e => setForm({...form, config: {...form.config, textAlignment: e.target.value}})} className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-none">
                   <option value="text-left">Left</option>
                   <option value="text-center">Center</option>
                   <option value="text-right">Right</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sub-Text Width</label>
                <select value={form.config.subtitleWidth || '100'} onChange={e => setForm({...form, config: {...form.config, subtitleWidth: e.target.value}})} className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-none">
                   <option value="10">10%</option>
                   <option value="20">20%</option>
                   <option value="30">30%</option>
                   <option value="40">40%</option>
                   <option value="50">50%</option>
                   <option value="60">60%</option>
                   <option value="70">70%</option>
                   <option value="80">80%</option>
                   <option value="90">90%</option>
                   <option value="100">100%</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Heading Size</label>
                <select value={form.config.headingSize} onChange={e => setForm({...form, config: {...form.config, headingSize: e.target.value}})} className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-none">
                   <option value="text-2xl sm:text-3xl md:text-4xl">Small</option>
                   <option value="text-3xl sm:text-4xl md:text-5xl">Medium (Default)</option>
                   <option value="text-4xl sm:text-5xl md:text-6xl">Large</option>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Heading Animation</label>
                <select value={form.config.headingAnimation || 'fade-in-up'} onChange={e => setForm({...form, config: {...form.config, headingAnimation: e.target.value}})} className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-none">
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Text/Sub-Text Animation</label>
                <select value={form.config.textAnimation || 'fade-in-up'} onChange={e => setForm({...form, config: {...form.config, textAnimation: e.target.value}})} className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-none">
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Spacing Below</label>
                <select value={form.config.spacing || 'mb-6 md:mb-8'} onChange={e => setForm({...form, config: {...form.config, spacing: e.target.value}})} className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-none">
                   <option value="mb-4 md:mb-6">Compact (Small)</option>
                   <option value="mb-6 md:mb-8">Normal (Medium)</option>
                   <option value="mb-10 md:mb-12">Loose (Large)</option>
                   <option disabled>──────────</option>
                   <option value="mb-[10px]">10px</option>
                   <option value="mb-[20px]">20px</option>
                   <option value="mb-[30px]">30px</option>
                   <option value="mb-[40px]">40px</option>
                   <option value="mb-[50px]">50px</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Engine */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Blog Layout Engine</h2>
            <p className="text-sm text-gray-500">Configure how the blogs are displayed and constrained.</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Layout Style & Moving Effect</label>
                <select value={form.config.layoutType} onChange={e => {
                    const newType = e.target.value;
                    const updates: any = { layoutType: newType };
                    if (newType === 'grid') {
                        updates.postLimit = form.config.columns * (form.config.rows || 2);
                    }
                    setForm({...form, config: {...form.config, ...updates}});
                }} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 outline-none transition">
                   <option value="grid">Standard Grid</option>
                   <option value="carousel">Interactive Slider / Carousel</option>
                   <option value="marquee-left">Marquee (Moving Right to Left)</option>
                   <option value="marquee-right">Marquee (Moving Left to Right)</option>
                   <option value="featured">Hero Featured Post + Grid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Blogs in a row (Columns)</label>
                <select value={form.config.columns} onChange={e => setForm({...form, config: {...form.config, columns: parseInt(e.target.value), ...(form.config.layoutType === 'grid' ? {postLimit: parseInt(e.target.value) * (form.config.rows || 2)} : {})}})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 outline-none transition">
                   <option value="1">1 Column (List)</option>
                   <option value="2">2 Columns</option>
                   <option value="3">3 Columns</option>
                   <option value="4">4 Columns</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Where to Display</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-48 overflow-y-auto">
                    {[
                        { id: 'all', label: 'Everywhere (All Pages)' },
                        { id: 'home', label: 'Home Page' },
                        { id: 'blog', label: 'Main Blog Page' },
                        ...serviceCategories.map(cat => ({ id: `service_${cat.id}`, label: `Service: ${cat.name}` }))
                    ].map(option => {
                        const currentPages = form.config.displayPages || (form.config.displayPage ? [form.config.displayPage] : ['all']);
                        const isChecked = option.id === 'all' 
                            ? currentPages.includes('all') || currentPages.length === 0 
                            : currentPages.includes(option.id);
                        
                        return (
                            <label key={option.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-1.5 rounded transition">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 text-spirit-600 focus:ring-spirit-500"
                                    checked={isChecked}
                                    onChange={(e) => {
                                        let newPages = [...currentPages];
                                        
                                        if (option.id === 'all') {
                                            newPages = e.target.checked ? ['all'] : [];
                                        } else {
                                            // Ensure 'all' is removed if specifically selecting other pages
                                            newPages = newPages.filter(p => p !== 'all');
                                            
                                            if (e.target.checked) {
                                                if (!newPages.includes(option.id)) newPages.push(option.id);
                                            } else {
                                                newPages = newPages.filter(p => p !== option.id);
                                            }
                                        }
                                        
                                        if (newPages.length === 0) newPages = ['all'];
                                        
                                        setForm({...form, config: {...form.config, displayPages: newPages, displayPage: undefined}});
                                    }}
                                />
                                <span className="text-sm font-medium text-gray-700">{option.label}</span>
                            </label>
                        );
                    })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {form.config.layoutType === 'grid' ? "Number of Rows" : "Max Posts to Show"}
                </label>
                {form.config.layoutType === 'grid' ? (
                  <select 
                    value={form.config.rows || 2} 
                    onChange={e => setForm({...form, config: {...form.config, rows: parseInt(e.target.value), postLimit: parseInt(e.target.value) * form.config.columns}})} 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 outline-none transition"
                  >
                    <option value="1">1 Row</option>
                    <option value="2">2 Rows</option>
                    <option value="3">3 Rows</option>
                    <option value="4">4 Rows</option>
                    <option value="5">5 Rows</option>
                  </select>
                ) : (
                  <input type="number" min="1" max="50" value={form.config.postLimit} onChange={e => setForm({...form, config: {...form.config, postLimit: parseInt(e.target.value)}})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 outline-none transition" />
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Filter by Category</label>
                <select 
                    value={form.config.categoryFilter} 
                    onChange={e => setForm({...form, config: {...form.config, categoryFilter: e.target.value}})} 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 outline-none transition bg-white"
                >
                    <option value="">Off (Show all categories)</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.title}>{cat.title}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Action Button Text (Optional)</label>
                <input 
                    type="text" 
                    value={form.config.buttonText || ''} 
                    onChange={e => setForm({...form, config: {...form.config, buttonText: e.target.value}})} 
                    placeholder="e.g. View All Posts" 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 outline-none transition" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Action Button URL (Optional)</label>
                <input 
                    type="text" 
                    value={form.config.buttonUrl || ''} 
                    onChange={e => setForm({...form, config: {...form.config, buttonUrl: e.target.value}})} 
                    placeholder="e.g. /blog or /category/guidance" 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 outline-none transition" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Button Alignment</label>
                <select 
                    value={form.config.buttonAlignment || 'justify-center'} 
                    onChange={e => setForm({...form, config: {...form.config, buttonAlignment: e.target.value}})} 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 outline-none transition"
                >
                    <option value="justify-start">Left</option>
                    <option value="justify-center">Center</option>
                    <option value="justify-end">Right</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Manually Select Specific Blogs (Optional)</label>
                <p className="text-xs text-gray-500 mb-2">If you select specific blogs here, ONLY these blogs will be shown in this section.</p>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg bg-white p-3 space-y-2">
                    {allPosts.map(p => (
                        <label key={p.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-slate-50 rounded">
                            <input 
                                type="checkbox"
                                checked={(form.config.specificPostIds || []).includes(p.id)}
                                onChange={(e) => {
                                    const current = form.config.specificPostIds || [];
                                    if (e.target.checked) {
                                        setForm({...form, config: {...form.config, specificPostIds: [...current, p.id]}});
                                    } else {
                                        setForm({...form, config: {...form.config, specificPostIds: current.filter(id => id !== p.id)}});
                                    }
                                }}
                                className="w-4 h-4 text-spirit-600 rounded border-gray-300 focus:ring-spirit-500"
                            />
                            <span className="text-sm text-gray-800 line-clamp-1 flex-1">{p.title}</span>
                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">{p.category}</span>
                        </label>
                    ))}
                    {allPosts.length === 0 && <span className="text-sm text-gray-500 italic">No published blogs available.</span>}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isLoading} className="bg-spirit-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-spirit-800 flex items-center min-w-[150px] shadow-lg transition shadow-spirit-900/30">
             {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : <Plus className="w-5 h-5 mr-2" />}
             {isLoading ? 'Saving...' : 'Save Section'}
          </button>
        </div>
      </form>
    </div>
  );
};
