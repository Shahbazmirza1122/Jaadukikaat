
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Lock, LayoutDashboard, PenTool, LogOut, Save, Trash2, Plus, CircleCheck, Pencil, Eye, EyeOff, ArrowLeft, Image as ImageIcon, SquareCheck, ScrollText, Loader2, ShoppingBag, X } from 'lucide-react';
import { BlogPost } from '../types';
import RichTextEditor from '../components/RichTextEditor';
import { supabase } from '../lib/supabase';
import { Product } from '../data/products';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'blog' | 'duaa' | 'products'>('blog');

  // Blog State
  const [blogView, setBlogView] = useState<'list' | 'form'>('list');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  
  // Duaa State
  const [dailyDuaa, setDailyDuaa] = useState('');

  // Product State
  const [productView, setProductView] = useState<'list' | 'form'>('list');
  const [products, setProducts] = useState<Product[]>([]);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Omit<Product, 'id'>>({
    name: '',
    price: '',
    image: '',
    category: '',
    description: ''
  });
  
  // Loading States
  const [isLoading, setIsLoading] = useState(false);

  // Blog Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState(''); 
  const [blogAuthor, setBlogAuthor] = useState('Admin');
  const [blogImage, setBlogImage] = useState('https://picsum.photos/id/1015/800/600');
  
  // New Form Fields
  const [blogCategory, setBlogCategory] = useState('');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [selectedRelatedIds, setSelectedRelatedIds] = useState<string[]>([]);
  
  const [notification, setNotification] = useState<string | null>(null);

  // Initialize Data from Supabase
  useEffect(() => {
    if (isAuthenticated) {
        if (activeTab === 'blog') fetchPosts();
        if (activeTab === 'duaa') fetchDuaa();
        if (activeTab === 'products') fetchProducts();
    }
  }, [isAuthenticated, activeTab]);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching posts:', JSON.stringify(error, null, 2));
    } else {
        const mappedPosts = (data || []).map((p: any) => ({
            ...p,
            imageUrl: p.image_url || p.imageUrl,
            relatedIds: p.related_ids || p.relatedIds,
            isLatest: p.is_latest || p.isLatest
        }));
        setPosts(mappedPosts);
    }
    setIsLoading(false);
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setIsLoading(false);
  };

  const fetchDuaa = () => {
      const stored = localStorage.getItem('lumina_daily_duaa');
      if (stored) setDailyDuaa(stored);
  };

  // Derived state for existing categories
  const existingCategories = useMemo(() => {
    const cats = new Set(posts.map(p => p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [posts]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  const resetForm = () => {
    setEditId(null);
    setBlogTitle('');
    setBlogExcerpt('');
    setBlogContent('');
    setBlogAuthor('Admin');
    setBlogImage('https://picsum.photos/id/1015/800/600');
    setBlogCategory('');
    setNewCategoryInput('');
    setSelectedRelatedIds([]);
  };

  const handleSwitchToCreate = () => {
    resetForm();
    setBlogView('form');
  };

  const handleSwitchToList = () => {
    resetForm();
    setBlogView('list');
  };

  const handleEdit = (post: BlogPost) => {
    setEditId(post.id);
    setBlogTitle(post.title);
    setBlogExcerpt(post.excerpt);
    setBlogContent(post.content);
    setBlogAuthor(post.author);
    setBlogImage(post.imageUrl);
    setBlogCategory(post.category || '');
    setNewCategoryInput('');
    setSelectedRelatedIds(post.relatedIds || []);
    setBlogView('form');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
        const { error } = await supabase.from('posts').delete().eq('id', id);
        if (error) {
            alert('Error deleting post');
        } else {
            setPosts(posts.filter(p => p.id !== id));
            setNotification('Article deleted successfully.');
            setTimeout(() => setNotification(null), 3000);
        }
    }
  };

  const handleToggleStatus = async (id: string) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    
    const newStatus = post.status === 'draft' ? 'published' : 'draft';
    
    const { error } = await supabase
        .from('posts')
        .update({ status: newStatus })
        .eq('id', id);

    if (error) {
        alert('Error updating status');
    } else {
        setPosts(posts.map(p => p.id === id ? { ...p, status: newStatus } : p));
    }
  };

  const toggleRelatedPost = (id: string) => {
    setSelectedRelatedIds(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalCategory = newCategoryInput.trim() || blogCategory || 'Uncategorized';
    
    const postPayload = {
        title: blogTitle,
        excerpt: blogExcerpt,
        content: blogContent,
        author: blogAuthor,
        image_url: blogImage,
        category: finalCategory,
        related_ids: selectedRelatedIds,
        status: 'published',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    let error;
    if (editId) {
        const { error: updateError } = await supabase
            .from('posts')
            .update(postPayload)
            .eq('id', editId);
        error = updateError;
        setNotification('Article updated successfully!');
    } else {
        const { error: insertError } = await supabase
            .from('posts')
            .insert([postPayload]);
        error = insertError;
        setNotification('Article published successfully!');
    }
    
    if (error) {
        console.error("Save error:", JSON.stringify(error, null, 2));
        alert("Failed to save post to Supabase.");
        return;
    }
    
    await fetchPosts();
    
    setTimeout(() => {
      setNotification(null);
      handleSwitchToList();
    }, 1500);
  };

  const handleSaveDuaa = () => {
      localStorage.setItem('lumina_daily_duaa', dailyDuaa);
      setNotification('Daily Duaa updated successfully!');
      setTimeout(() => setNotification(null), 3000);
  };

  // --- PRODUCT HANDLERS ---
  const resetProductForm = () => {
    setEditProductId(null);
    setProductForm({ name: '', price: '', image: '', category: '', description: '' });
  };

  const handleSwitchToProductCreate = () => {
    resetProductForm();
    setProductView('form');
  };

  const handleSwitchToProductList = () => {
    resetProductForm();
    setProductView('list');
  };

  const handleEditProduct = (product: Product) => {
    setEditProductId(product.id);
    setProductForm({
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      description: product.description || ''
    });
    setProductView('form');
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        alert('Error deleting product');
      } else {
        setProducts(products.filter(p => p.id !== id));
        setNotification('Product deleted successfully.');
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      name: productForm.name,
      price: productForm.price,
      image: productForm.image,
      category: productForm.category,
      description: productForm.description
    };

    let error;
    if (editProductId) {
      const { error: updateError } = await supabase.from('products').update(payload).eq('id', editProductId);
      error = updateError;
      setNotification('Product updated successfully!');
    } else {
      const { error: insertError } = await supabase.from('products').insert([payload]);
      error = insertError;
      setNotification('Product created successfully!');
    }

    if (error) {
      console.error(error);
      alert('Failed to save product.');
    } else {
      await fetchProducts();
      setTimeout(() => {
        setNotification(null);
        handleSwitchToProductList();
      }, 1000);
    }
    setIsLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-spirit-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-spirit-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-spirit-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-spirit-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-spirit-900">Admin Portal</h2>
            <p className="text-gray-500 text-sm">Please login to manage the sanctuary.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                placeholder="admin123"
              />
            </div>
            <div className="space-y-4">
              <button className="w-full bg-spirit-900 text-white font-bold py-3 rounded-lg hover:bg-spirit-800 transition">
                Access Dashboard
              </button>
              <div className="text-center">
                <Link to="/" className="text-spirit-600 hover:text-spirit-800 text-sm font-medium transition">
                  &larr; Return to Website
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row pt-20">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-spirit-900 text-white min-h-[300px] md:min-h-screen flex-shrink-0">
        <div className="p-6">
          <h2 className="text-2xl font-serif font-bold mb-8 flex items-center">
            <LayoutDashboard className="mr-2" /> Admin CMS
          </h2>
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('blog')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'blog' ? 'bg-spirit-700 text-white' : 'text-spirit-200 hover:bg-spirit-800'}`}
            >
              <PenTool size={20} />
              <span>Manage Blog</span>
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'products' ? 'bg-spirit-700 text-white' : 'text-spirit-200 hover:bg-spirit-800'}`}
            >
              <ShoppingBag size={20} />
              <span>Manage Products</span>
            </button>
            <button 
              onClick={() => setActiveTab('duaa')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'duaa' ? 'bg-spirit-700 text-white' : 'text-spirit-200 hover:bg-spirit-800'}`}
            >
              <ScrollText size={20} />
              <span>Manage Duaa</span>
            </button>
            <div className="pt-8 border-t border-spirit-800 mt-8">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-300 hover:text-red-100 hover:bg-spirit-800 rounded-lg transition"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {notification && (
          <div className="mb-6 bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center animate-fade-in">
            <CircleCheck className="w-5 h-5 mr-2" />
            {notification}
          </div>
        )}

        {/* DUAA TAB */}
        {activeTab === 'duaa' && (
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-serif font-bold text-gray-800">Daily Duaa Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Update the scrolling message displayed below the website navigation.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Message Content</label>
                        <textarea 
                            rows={4}
                            value={dailyDuaa}
                            onChange={(e) => setDailyDuaa(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none text-lg"
                            placeholder="Enter the daily duaa or message here..."
                        />
                        <p className="text-xs text-gray-400 mt-2">
                            This text will scroll from right to left on the website header.
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <button 
                            onClick={handleSaveDuaa}
                            className="bg-spirit-600 text-white font-bold py-3 px-8 rounded-full hover:bg-spirit-700 transition shadow-md flex items-center"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            Update Message
                        </button>
                    </div>
                </div>

                <div className="mt-8 bg-spirit-50 rounded-xl p-6 border border-spirit-100">
                    <h3 className="text-sm font-bold text-spirit-900 uppercase tracking-wide mb-4">Preview</h3>
                    <div className="w-full bg-white border border-gray-200 h-16 flex relative shadow-sm rounded-lg overflow-hidden">
                        <div className="bg-spirit-900 text-white px-6 flex items-center justify-center font-serif font-bold text-sm tracking-widest shrink-0">
                            DAILY DUAA
                        </div>
                        <div className="flex-1 overflow-hidden relative flex items-center px-4">
                            <span className="text-spirit-800 font-medium text-lg truncate">
                                {dailyDuaa}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="max-w-6xl mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-serif font-bold text-gray-800">
                  {productView === 'list' ? 'All Products' : (editProductId ? 'Edit Product' : 'Add New Product')}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {productView === 'list' ? 'Manage your store inventory.' : 'Add items to the Sacred Store.'}
                </p>
              </div>

              {productView === 'list' ? (
                 <button 
                  onClick={handleSwitchToProductCreate}
                  className="bg-spirit-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-spirit-700 transition shadow-md flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  New Product
                </button>
              ) : (
                <button 
                  onClick={handleSwitchToProductList}
                  className="bg-white text-gray-600 font-bold py-2.5 px-6 rounded-lg border border-gray-200 hover:bg-gray-50 transition flex items-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to List
                </button>
              )}
            </div>

            {/* PRODUCT LIST */}
            {productView === 'list' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider w-20">Image</th>
                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider">Product Name</th>
                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider">Price</th>
                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {isLoading ? (
                           <tr><td colSpan={5} className="text-center py-8"><Loader2 className="animate-spin w-6 h-6 mx-auto text-spirit-500"/></td></tr>
                      ) : products.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                            No products found. Click "New Product" to add one.
                          </td>
                        </tr>
                      ) : (
                        products.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50 transition group">
                            <td className="px-6 py-4">
                              <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                {product.image ? (
                                  <img src={product.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-6 h-6 m-3 text-gray-300" />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-900">{product.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                            <td className="px-6 py-4 text-sm font-bold text-spirit-600">{product.price}</td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end space-x-2">
                                <button 
                                  onClick={() => handleEditProduct(product)}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                                  title="Edit"
                                >
                                  <Pencil size={18} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PRODUCT FORM */}
            {productView === 'form' && (
              <form onSubmit={handleSaveProduct} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-8 animate-fade-in">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
                      <input 
                        type="text" 
                        required
                        value={productForm.name}
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                        placeholder="e.g. Yemeni Aqeeq Ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Price</label>
                      <input 
                        type="text" 
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                        placeholder="e.g. $85.00"
                      />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                      <input 
                        type="text" 
                        required
                        value={productForm.category}
                        onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                        placeholder="e.g. Gemstones, Accessories"
                      />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                required
                                value={productForm.image}
                                onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                                placeholder="https://..."
                            />
                            {productForm.image && (
                                <div className="w-12 h-12 rounded overflow-hidden border border-gray-200 shrink-0">
                                    <img src={productForm.image} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea 
                        rows={4}
                        value={productForm.description}
                        onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none resize-none"
                        placeholder="Detailed product description..."
                    />
                 </div>

                 <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button 
                        type="button"
                        onClick={handleSwitchToProductList}
                        className="mr-4 text-gray-500 font-bold px-6 py-3 hover:text-gray-700 transition"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="bg-spirit-900 text-white font-bold px-8 py-3 rounded-lg hover:bg-spirit-800 transition shadow-lg flex items-center"
                    >
                        {isLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                        {editProductId ? 'Update Product' : 'Create Product'}
                    </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* BLOG TAB */}
        {activeTab === 'blog' && (
          <div className="max-w-6xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-serif font-bold text-gray-800">
                  {blogView === 'list' ? 'All Articles' : (editId ? 'Edit Article' : 'Write New Article')}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {blogView === 'list' 
                    ? 'Manage your published content and drafts.' 
                    : 'Share your wisdom with the community.'}
                </p>
              </div>

              {blogView === 'list' ? (
                 <button 
                  onClick={handleSwitchToCreate}
                  className="bg-spirit-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-spirit-700 transition shadow-md flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  New Article
                </button>
              ) : (
                <button 
                  onClick={handleSwitchToList}
                  className="bg-white text-gray-600 font-bold py-2.5 px-6 rounded-lg border border-gray-200 hover:bg-gray-50 transition flex items-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to List
                </button>
              )}
            </div>

            {/* LIST VIEW */}
            {blogView === 'list' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider w-20">Image</th>
                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider">Title / Excerpt</th>
                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {isLoading ? (
                           <tr><td colSpan={6} className="text-center py-8"><Loader2 className="animate-spin w-6 h-6 mx-auto text-spirit-500"/></td></tr>
                      ) : posts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            No articles found. Click "New Article" to create one.
                          </td>
                        </tr>
                      ) : (
                        posts.map((post) => (
                          <tr key={post.id} className="hover:bg-gray-50 transition group">
                            <td className="px-6 py-4">
                              <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                {post.imageUrl ? (
                                  <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-6 h-6 m-3 text-gray-300" />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-gray-900 mb-1 line-clamp-1">{post.title}</div>
                              <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">{post.excerpt}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{post.category || 'Uncategorized'}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{post.date}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                post.status === 'draft' 
                                  ? 'bg-gray-100 text-gray-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {post.status === 'draft' ? 'Draft' : 'Published'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end space-x-2">
                                <button 
                                  onClick={() => handleToggleStatus(post.id)}
                                  className="p-2 text-gray-400 hover:text-spirit-600 hover:bg-spirit-50 rounded-full transition"
                                  title={post.status === 'draft' ? "Publish" : "Unpublish"}
                                >
                                  {post.status === 'draft' ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                                <button 
                                  onClick={() => handleEdit(post)}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                                  title="Edit"
                                >
                                  <Pencil size={18} />
                                </button>
                                <button 
                                  onClick={() => handleDelete(post.id)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* FORM VIEW */}
            {blogView === 'form' && (
              <form onSubmit={handleSaveBlog} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-8 animate-fade-in">
                
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                    <input 
                      type="text" 
                      required
                      value={blogTitle}
                      onChange={(e) => setBlogTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                      placeholder="Enter article title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                    <div className="flex gap-2">
                        <select 
                            value={blogCategory} 
                            onChange={(e) => setBlogCategory(e.target.value)}
                            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                        >
                            <option value="">Select Category...</option>
                            {existingCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            <option value="new">+ Create New</option>
                        </select>
                        {(blogCategory === 'new' || (!existingCategories.includes(blogCategory) && blogCategory !== '')) && (
                             <input 
                                type="text"
                                value={newCategoryInput}
                                onChange={(e) => setNewCategoryInput(e.target.value)}
                                placeholder="New Category Name"
                                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                             />
                        )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Author</label>
                        <input 
                            type="text" 
                            value={blogAuthor}
                            onChange={(e) => setBlogAuthor(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image URL</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={blogImage}
                                onChange={(e) => setBlogImage(e.target.value)}
                                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                            />
                            {blogImage && (
                                <div className="w-12 h-12 rounded overflow-hidden border border-gray-200 shrink-0">
                                    <img src={blogImage} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Short Excerpt</label>
                    <textarea 
                        rows={3}
                        value={blogExcerpt}
                        onChange={(e) => setBlogExcerpt(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none resize-none"
                        placeholder="A brief summary for the blog list..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Content</label>
                    <RichTextEditor 
                        initialValue={blogContent}
                        onChange={setBlogContent}
                    />
                </div>

                {/* Related Articles Selection */}
                <div>
                     <label className="block text-sm font-bold text-gray-700 mb-4">Related Articles</label>
                     <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {posts.filter(p => p.id !== editId).map(p => (
                            <div 
                                key={p.id} 
                                onClick={() => toggleRelatedPost(p.id)}
                                className={`flex items-center p-2 rounded cursor-pointer border transition ${selectedRelatedIds.includes(p.id) ? 'bg-spirit-50 border-spirit-500' : 'hover:bg-gray-50 border-transparent'}`}
                            >
                                <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 ${selectedRelatedIds.includes(p.id) ? 'bg-spirit-600 border-spirit-600' : 'border-gray-300'}`}>
                                    {selectedRelatedIds.includes(p.id) && <SquareCheck size={14} className="text-white" />}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-bold text-gray-800 truncate">{p.title}</p>
                                    <p className="text-xs text-gray-500">{p.date}</p>
                                </div>
                            </div>
                        ))}
                        {posts.length <= 1 && <p className="text-sm text-gray-400 p-2">No other articles available to relate.</p>}
                     </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button 
                        type="button"
                        onClick={handleSwitchToList}
                        className="mr-4 text-gray-500 font-bold px-6 py-3 hover:text-gray-700 transition"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="bg-spirit-900 text-white font-bold px-8 py-3 rounded-lg hover:bg-spirit-800 transition shadow-lg flex items-center"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        {editId ? 'Update Article' : 'Publish Article'}
                    </button>
                </div>

              </form>
            )}

          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
