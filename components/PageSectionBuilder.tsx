import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import RichTextEditor from './RichTextEditor';
import { Plus, Pencil, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { PageSection } from '../types';

const PageSectionBuilder: React.FC = () => {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [isLoading, setIsLoading] = useState(false);
  
  const [form, setForm] = useState<Omit<PageSection, 'id'>>({
    title: '',
    pageTarget: '/',
    config: {
      sectionType: 'text',
      bgUrl: '',
      bgColor: '#ffffff',
      overlayStyle: '0',
      textColor: '#000000',
      fontFamily: 'serif',
      animation: 'none',
      padding: 'medium',
      content: ''
    }
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('category', '_page_section_')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mapped = data.map((post: any) => {
        let config = form.config;
        try {
           config = JSON.parse(post.content);
        } catch(e) {}
        
        return {
          id: post.id,
          title: post.title,
          pageTarget: post.excerpt,
          config
        } as PageSection;
      });
      setSections(mapped);
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setEditId(null);
    setForm({
      title: '',
      pageTarget: '/',
      config: {
        sectionType: 'text',
        bgUrl: '',
        bgColor: '#ffffff',
        overlayStyle: '0',
        textColor: '#000000',
        fontFamily: 'serif',
        animation: 'none',
        padding: 'medium',
        content: ''
      }
    });
  };

  const handleEdit = (sec: PageSection) => {
    setEditId(sec.id);
    setForm({
      title: sec.title,
      pageTarget: sec.pageTarget,
      config: sec.config
    });
    setView('form');
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const executeDelete = async () => {
    if(!deleteConfirmId) return;
    setIsLoading(true);
    await supabase.from('posts').delete().eq('id', deleteConfirmId);
    await fetchSections();
    setDeleteConfirmId(null);
    setIsLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      title: form.title,
      category: '_page_section_',
      excerpt: form.pageTarget,
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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-800">Page Sections</h1>
            <p className="text-gray-500 mt-1">Design beautiful sections to display on your app's frontend.</p>
          </div>
          <button onClick={() => setView('form')} className="bg-spirit-600 text-white px-6 py-2.5 rounded-lg flex items-center font-bold hover:bg-spirit-700">
            <Plus className="w-5 h-5 mr-2" />
            Create Section
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-spirit-500"/></div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                   <tr>
                      <th className="p-4">Title</th>
                      <th className="p-4">Page Target</th>
                      <th className="p-4">Design</th>
                      <th className="p-4 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {sections.length === 0 ? (
                      <tr><td colSpan={4} className="p-8 text-center text-gray-500">No sections found.</td></tr>
                   ) : (
                      sections.map(sec => (
                         <tr key={sec.id} className="hover:bg-slate-50 transition">
                            <td className="p-4 font-bold text-spirit-900">{sec.title}</td>
                            <td className="p-4"><span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">{sec.pageTarget}</span></td>
                            <td className="p-4 text-xs text-gray-500">{sec.config.bgColor}, {sec.config.fontFamily}</td>
                            <td className="p-4 text-right">
                               <button onClick={() => handleEdit(sec)} className="p-2 text-gray-500 hover:text-spirit-600 rounded"><Pencil className="w-4 h-4"/></button>
                               <button onClick={() => handleDelete(sec.id)} className="p-2 text-gray-500 hover:text-red-600 rounded"><Trash2 className="w-4 h-4"/></button>
                            </td>
                         </tr>
                      ))
                   )}
                </tbody>
             </table>
          </div>
        )}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Delete</h3>
              <p className="text-gray-500 mb-6">Are you sure you want to delete this section?</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-800">{editId ? 'Edit Section' : 'Create Section'}</h1>
        <button onClick={() => { resetForm(); setView('list'); }} className="bg-white border border-gray-200 px-6 py-2.5 rounded-lg flex items-center font-bold text-gray-600 hover:bg-gray-50">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 mb-20 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Section Title (Internal)</label>
            <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-spirit-500" placeholder="e.g. Home Call To Action" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Page Target URL Path</label>
            <input required type="text" value={form.pageTarget} onChange={e => setForm({...form, pageTarget: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-spirit-500" placeholder="e.g. / or /about" />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Design & Styling</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Background Image URL</label>
              <input type="text" value={form.config.bgUrl} onChange={e => setForm({...form, config: {...form.config, bgUrl: e.target.value}})} className="w-full px-4 py-2 rounded-lg border border-gray-300" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Background Color</label>
              <input type="color" value={form.config.bgColor} onChange={e => setForm({...form, config: {...form.config, bgColor: e.target.value}})} className="w-full h-10 px-2 rounded border border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Overlay Opacity (Black)</label>
              <select value={form.config.overlayStyle} onChange={e => setForm({...form, config: {...form.config, overlayStyle: e.target.value}})} className="w-full px-4 py-2 rounded-lg border border-gray-300">
                 <option value="0">None</option>
                 <option value="0.2">Light (20%)</option>
                 <option value="0.5">Medium (50%)</option>
                 <option value="0.8">Dark (80%)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Text Color</label>
              <input type="color" value={form.config.textColor} onChange={e => setForm({...form, config: {...form.config, textColor: e.target.value}})} className="w-full h-10 px-2 rounded border border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Font Family</label>
              <select value={form.config.fontFamily} onChange={e => setForm({...form, config: {...form.config, fontFamily: e.target.value}})} className="w-full px-4 py-2 rounded-lg border border-gray-300">
                 <option value="serif">Serif (Elegant)</option>
                 <option value="sans-serif">Sans-Serif (Modern)</option>
                 <option value="monospace">Monospace</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Animation</label>
              <select value={form.config.animation} onChange={e => setForm({...form, config: {...form.config, animation: e.target.value}})} className="w-full px-4 py-2 rounded-lg border border-gray-300">
                 <option value="none">None</option>
                 <option value="fade-in-up">Fade In Up</option>
                 <option value="pulse">Pulse</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Padding</label>
              <select value={form.config.padding} onChange={e => setForm({...form, config: {...form.config, padding: e.target.value}})} className="w-full px-4 py-2 rounded-lg border border-gray-300">
                 <option value="small">Small</option>
                 <option value="medium">Medium</option>
                 <option value="large">Large</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8">
           <h2 className="text-lg font-bold text-gray-800 mb-4">Content Builder</h2>
           <RichTextEditor
             key={editId || 'new_section'}
             initialValue={form.config.content}
             onChange={(html) => setForm({...form, config: {...form.config, content: html}})}
           />
        </div>

        <div className="pt-6">
          <button type="submit" disabled={isLoading} className="bg-spirit-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-spirit-800 flex items-center justify-center min-w-[150px]">
             {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Save Section'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PageSectionBuilder;
