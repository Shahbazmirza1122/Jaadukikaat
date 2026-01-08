
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Lock, LayoutDashboard, PenTool, LogOut, Save, Trash2, Plus, CircleCheck, Pencil, Eye, EyeOff, ArrowLeft, Image as ImageIcon, SquareCheck, ScrollText, Loader2, ShoppingBag, X, Database, Tag, CalendarClock, PackageX, EyeOff as EyeOffIcon, Settings, TicketPercent } from 'lucide-react';
import { BlogPost } from '../types';
import RichTextEditor from '../components/RichTextEditor';
import { supabase } from '../lib/supabase';
import { Product } from '../data/products';

// Interface for Coupon
interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  product_id: string | null; // null means all products
  product_name?: string; // For display
}

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'blog' | 'duaa' | 'products' | 'database'>('blog');

  // Blog State
  const [blogView, setBlogView] = useState<'list' | 'form'>('list');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  
  // Duaa State
  const [dailyDuaa, setDailyDuaa] = useState('');

  // Product State
  const [productView, setProductView] = useState<'list' | 'form'>('list');
  const [productSubTab, setProductSubTab] = useState<'inventory' | 'coupons'>('inventory'); // New sub-tab state
  const [products, setProducts] = useState<Product[]>([]);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  
  // Coupon State
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponForm, setCouponForm] = useState({
    code: '',
    percent: '',
    productId: 'all'
  });

  // Updated Product Form State with new fields
  const [productForm, setProductForm] = useState<Omit<Product, 'id'>>({
    name: '',
    price: '',
    image: '',
    category: '',
    description: '',
    sku: '',
    salePrice: '',
    saleStart: '',
    saleEnd: '',
    isOutOfStock: false,
    isBlurBeforeBuy: false
  });
  
  // Database Schema State
  const [missingTables, setMissingTables] = useState<string[]>([]);
  const [sqlInstructions, setSqlInstructions] = useState<string>('');
  
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
        if (activeTab === 'products') {
            fetchProducts();
            if (productSubTab === 'coupons') fetchCoupons();
        }
        // database tab doesn't need fetch
    }
  }, [isAuthenticated, activeTab, productSubTab]);

  const checkTableError = (error: any, tableName: string) => {
    if (!error) return false;

    // Check for "undefined_table" error (Postgres code 42P01) or specific message
    const isMissingTable = error.code === '42P01' || 
                          error.message?.includes('Could not find the table') || 
                          error.message?.includes('does not exist');

    // Check for "undefined_column" or missing relation (PGRST200 is common for missing embedding)
    const isSchemaError = error.code === 'PGRST204' || error.code === 'PGRST200';

    if (isMissingTable || isSchemaError) {
        setMissingTables(prev => prev.includes(tableName) ? prev : [...prev, tableName]);
        setSqlInstructions(getSqlSetupInstructions(tableName));
        return true;
    }
    return false;
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching posts:', error);
        checkTableError(error, 'posts');
    } else {
        const mappedPosts = (data || []).map((p: any) => ({
            ...p,
            imageUrl: p.image_url || p.imageUrl,
            relatedIds: p.related_ids || p.relatedIds,
            isLatest: p.is_latest || p.isLatest
        }));
        setPosts(mappedPosts);
        setMissingTables(prev => prev.filter(t => t !== 'posts'));
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
      checkTableError(error, 'products');
      setProducts([]); 
    } else {
      // Map database snake_case to camelCase for frontend
      const mappedProducts = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        category: p.category,
        description: p.description,
        sku: p.sku,
        salePrice: p.sale_price,
        saleStart: p.sale_start,
        saleEnd: p.sale_end,
        isOutOfStock: p.is_out_of_stock,
        isBlurBeforeBuy: p.is_blur_before_buy
      }));
      setProducts(mappedProducts);
      setMissingTables(prev => prev.filter(t => t !== 'products'));
    }
    setIsLoading(false);
  };

  const fetchCoupons = async () => {
      setIsLoading(true);
      // We select coupons and join with products to get product name
      const { data, error } = await supabase
        .from('coupons')
        .select(`
            *,
            products ( name )
        `)
        .order('created_at', { ascending: false });

      if (error) {
          console.error('Error fetching coupons:', JSON.stringify(error, null, 2));
          checkTableError(error, 'coupons');
          setCoupons([]);
      } else {
          // Safely map data
          const mapped = (data || []).map((c: any) => ({
              id: c.id,
              code: c.code,
              discount_percent: c.discount_percent,
              product_id: c.product_id,
              product_name: c.products ? c.products.name : 'All Products'
          }));
          setCoupons(mapped);
          setMissingTables(prev => prev.filter(t => t !== 'coupons'));
      }
      setIsLoading(false);
  };

  const fetchDuaa = () => {
      const stored = localStorage.getItem('lumina_daily_duaa');
      if (stored) setDailyDuaa(stored);
  };

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
            alert('Error deleting post: ' + (error.message || 'Unknown error'));
        } else {
            setPosts(posts.filter(p => p.id !== id));
            setNotification('Article deleted successfully.');
            setTimeout(() => setNotification(null), 3000);
        }
    }
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
        checkTableError(error, 'posts');
        alert("Failed to save post. " + (checkTableError(error, 'posts') ? "The database table is missing." : error.message));
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
    setProductForm({ 
      name: '', 
      price: '', 
      image: '', 
      category: '', 
      description: '', 
      sku: '',
      salePrice: '',
      saleStart: '',
      saleEnd: '',
      isOutOfStock: false,
      isBlurBeforeBuy: false
    });
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
      description: product.description || '',
      sku: product.sku || '',
      salePrice: product.salePrice || '',
      saleStart: product.saleStart || '',
      saleEnd: product.saleEnd || '',
      isOutOfStock: product.isOutOfStock || false,
      isBlurBeforeBuy: product.isBlurBeforeBuy || false
    });
    setProductView('form');
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        alert('Error deleting product: ' + (error.message || 'Unknown error'));
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

    // Map camelCase to snake_case for Supabase
    const payload = {
      name: productForm.name,
      price: productForm.price,
      image: productForm.image,
      category: productForm.category,
      description: productForm.description,
      sku: productForm.sku,
      sale_price: productForm.salePrice,
      sale_start: productForm.saleStart,
      sale_end: productForm.saleEnd,
      is_out_of_stock: productForm.isOutOfStock,
      is_blur_before_buy: productForm.isBlurBeforeBuy
    };

    let error;
    if (editProductId) {
      const { error: updateError } = await supabase.from('products').update(payload).eq('id', editProductId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('products').insert([payload]);
      error = insertError;
    }

    if (error) {
      console.error('Error saving product:', error);
      checkTableError(error, 'products');
      alert('Failed to save product. ' + (checkTableError(error, 'products') ? "Database columns are missing. Please run SQL from Database tab." : error.message));
      setIsLoading(false);
    } else {
      const successMessage = editProductId ? 'Product updated successfully!' : 'Product created successfully!';
      setNotification(successMessage);
      
      // Update list immediately
      await fetchProducts();
      
      // Switch view immediately
      handleSwitchToProductList();
      setIsLoading(false);

      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  // --- COUPON HANDLERS ---
  const handleSaveCoupon = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      const payload = {
          code: couponForm.code.toUpperCase(),
          discount_percent: parseInt(couponForm.percent),
          product_id: couponForm.productId === 'all' ? null : couponForm.productId
      };

      const { error } = await supabase.from('coupons').insert([payload]);

      if (error) {
          console.error("Coupon Error:", error);
          checkTableError(error, 'coupons');
          alert('Failed to save coupon. ' + (checkTableError(error, 'coupons') ? "The Coupons table is missing. Go to Database Setup tab." : error.message));
      } else {
          setNotification('Coupon created successfully!');
          setCouponForm({ code: '', percent: '', productId: 'all' });
          await fetchCoupons();
          setTimeout(() => setNotification(null), 3000);
      }
      setIsLoading(false);
  };

  const handleDeleteCoupon = async (id: string) => {
      if(window.confirm("Delete this coupon?")) {
          const { error } = await supabase.from('coupons').delete().eq('id', id);
          if (!error) {
              setCoupons(prev => prev.filter(c => c.id !== id));
          }
      }
  };


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-spirit-50 px-4">
        {/* Login Form Code (Unchanged) */}
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

  const getSqlSetupInstructions = (tableName: string) => {
    if (tableName === 'products' || tableName === 'coupons' || tableName === 'all') {
        const prodSql = `-- 1. PRODUCTS TABLE SETUP
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  price text not null,
  image text not null,
  category text not null,
  description text,
  sku text,
  sale_price text,
  sale_start text,
  sale_end text,
  is_out_of_stock boolean default false,
  is_blur_before_buy boolean default false
);

-- Add columns if table exists but columns do not
alter table public.products add column if not exists sku text;
alter table public.products add column if not exists sale_price text;
alter table public.products add column if not exists sale_start text;
alter table public.products add column if not exists sale_end text;
alter table public.products add column if not exists is_out_of_stock boolean default false;
alter table public.products add column if not exists is_blur_before_buy boolean default false;

-- Enable RLS for Products (Drop first to avoid duplication errors)
alter table public.products enable row level security;
drop policy if exists "Enable all access for all users" on public.products;
create policy "Enable all access for all users" on public.products for all using (true) with check (true);
`;
        
        const couponsSql = `
-- 4. COUPONS TABLE SETUP
create table if not exists public.coupons (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  code text not null,
  discount_percent numeric not null,
  product_id uuid references public.products(id) on delete cascade
);
-- Enable RLS for Coupons
alter table public.coupons enable row level security;
drop policy if exists "Enable all access for all users" on public.coupons;
create policy "Enable all access for all users" on public.coupons for all using (true) with check (true);

-- RELOAD SCHEMA CACHE (Critical for Foreign Keys)
NOTIFY pgrst, 'reload schema';
`;

        if (tableName === 'coupons') return couponsSql;
        if (tableName !== 'all') return prodSql;
        
        const ordersSql = `
-- 2. ORDERS TABLE SETUP
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid,
  items jsonb,
  total numeric,
  status text
);
-- Enable RLS for Orders (Drop first to avoid duplication errors)
alter table public.orders enable row level security;
drop policy if exists "Enable all access for all users" on public.orders;
create policy "Enable all access for all users" on public.orders for all using (true) with check (true);
`;
        const postsSql = `
-- 3. BLOG POSTS TABLE SETUP
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  excerpt text,
  content text,
  author text,
  image_url text,
  category text,
  status text default 'draft',
  date text,
  is_latest boolean default false,
  related_ids text[]
);
-- Enable RLS for Posts (Drop first to avoid duplication errors)
alter table public.posts enable row level security;
drop policy if exists "Enable all access for all users" on public.posts;
create policy "Enable all access for all users" on public.posts for all using (true) with check (true);`;

        return prodSql + ordersSql + postsSql + couponsSql;
    }
    return '';
  };

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
            <button 
              onClick={() => setActiveTab('database')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'database' ? 'bg-spirit-700 text-white' : 'text-spirit-200 hover:bg-spirit-800'}`}
            >
              <Database size={20} />
              <span>Database Setup</span>
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

        {/* Database Missing Warning - Only show if not on Database tab (to avoid dupes) */}
        {missingTables.length > 0 && activeTab !== 'database' && (
            <div className="mb-8 bg-amber-50 border border-amber-200 p-6 rounded-xl animate-fade-in">
                <div className="flex items-start gap-4">
                    <Database className="w-6 h-6 text-amber-600 mt-1 shrink-0" />
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-amber-800 mb-2">Database Issue Detected</h3>
                        <p className="text-amber-700 mb-4">
                            Tables or columns are missing. Go to the <strong>Database Setup</strong> tab to copy the SQL setup instructions.
                        </p>
                        <button 
                            onClick={() => setActiveTab('database')}
                            className="bg-amber-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-amber-700 transition"
                        >
                            Go to Setup
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* DATABASE SETUP TAB */}
        {activeTab === 'database' && (
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-serif font-bold text-gray-800">Database Setup</h1>
                    <p className="text-gray-500 text-sm mt-1">Run these SQL commands in your Supabase SQL Editor to configure the database schema.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700 flex items-center">
                            <Settings className="w-5 h-5 mr-2 text-spirit-600" />
                            Full Schema (Products, Orders, Posts, Coupons)
                        </h3>
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(getSqlSetupInstructions('all'));
                                alert('SQL copied to clipboard!');
                            }}
                            className="text-xs bg-spirit-900 text-white px-3 py-2 rounded-lg font-bold hover:bg-spirit-800 transition"
                        >
                            Copy All SQL
                        </button>
                    </div>
                    <div className="p-0">
                        <pre className="bg-slate-900 text-slate-50 p-6 overflow-x-auto text-xs font-mono leading-relaxed">
                            {getSqlSetupInstructions('all')}
                        </pre>
                    </div>
                </div>
            </div>
        )}

        {/* DUAA TAB */}
        {activeTab === 'duaa' && (
            <div className="max-w-4xl mx-auto">
                 {/* ... Duaa code ... */}
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
                    </div>
                    <div className="flex justify-end">
                        <button onClick={handleSaveDuaa} className="bg-spirit-600 text-white font-bold py-3 px-8 rounded-full hover:bg-spirit-700 transition shadow-md flex items-center">
                            <Save className="w-5 h-5 mr-2" /> Update Message
                        </button>
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
                  {productView === 'list' && productSubTab === 'inventory' ? 'All Products' : 
                   productView === 'list' && productSubTab === 'coupons' ? 'Coupon Codes' :
                   (editProductId ? 'Edit Product' : 'Add New Product')}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                   Manage your store inventory and promotional codes.
                </p>
              </div>

              {productView === 'list' && (
                 <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => { setProductSubTab('inventory'); fetchProducts(); }}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition ${productSubTab === 'inventory' ? 'bg-white shadow-sm text-spirit-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Inventory
                    </button>
                    <button 
                        onClick={() => { setProductSubTab('coupons'); fetchCoupons(); }}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition ${productSubTab === 'coupons' ? 'bg-white shadow-sm text-spirit-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Coupons
                    </button>
                 </div>
              )}

              {productView === 'list' && productSubTab === 'inventory' ? (
                 <button 
                  onClick={handleSwitchToProductCreate}
                  className="bg-spirit-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-spirit-700 transition shadow-md flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  New Product
                </button>
              ) : productView === 'form' ? (
                <button 
                  onClick={handleSwitchToProductList}
                  className="bg-white text-gray-600 font-bold py-2.5 px-6 rounded-lg border border-gray-200 hover:bg-gray-50 transition flex items-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to List
                </button>
              ) : null}
            </div>

            {/* COUPON SECTION */}
            {productView === 'list' && productSubTab === 'coupons' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Create Coupon Form */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                <TicketPercent className="w-5 h-5 mr-2 text-spirit-600" /> Create Coupon
                            </h3>
                            <form onSubmit={handleSaveCoupon} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Coupon Code</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={couponForm.code}
                                        onChange={e => setCouponForm({...couponForm, code: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-spirit-500 uppercase font-mono"
                                        placeholder="SALE2024"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Discount (%)</label>
                                    <input 
                                        type="number" 
                                        required
                                        min="1" max="100"
                                        value={couponForm.percent}
                                        onChange={e => setCouponForm({...couponForm, percent: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-spirit-500"
                                        placeholder="10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Applies To</label>
                                    <select 
                                        value={couponForm.productId} 
                                        onChange={e => setCouponForm({...couponForm, productId: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-spirit-500 text-sm"
                                    >
                                        <option value="all">All Products</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button disabled={isLoading} className="w-full bg-spirit-900 text-white font-bold py-3 rounded-lg hover:bg-spirit-800 transition">
                                    {isLoading ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : 'Create Coupon'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Coupon List */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                             <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase">Code</th>
                                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase">Discount</th>
                                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase">Target</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {coupons.length === 0 ? (
                                        <tr><td colSpan={4} className="text-center py-8 text-gray-500">No active coupons found.</td></tr>
                                    ) : (
                                        coupons.map(c => (
                                            <tr key={c.id}>
                                                <td className="px-6 py-4 font-mono font-bold text-spirit-900">{c.code}</td>
                                                <td className="px-6 py-4 text-green-600 font-bold">{c.discount_percent}% Off</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{c.product_name}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleDeleteCoupon(c.id)} className="text-gray-400 hover:text-red-500 transition">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                             </table>
                        </div>
                    </div>
                </div>
            )}

            {/* PRODUCT LIST */}
            {productView === 'list' && productSubTab === 'inventory' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider w-20">Image</th>
                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider">Product Name</th>
                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider">Price</th>
                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {isLoading ? (
                           <tr><td colSpan={6} className="text-center py-8"><Loader2 className="animate-spin w-6 h-6 mx-auto text-spirit-500"/></td></tr>
                      ) : products.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            {missingTables.includes('products') ? 'Database table missing or incomplete. Use the SQL above.' : 'No products found. Click "New Product" to add one.'}
                          </td>
                        </tr>
                      ) : (
                        products.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50 transition group">
                            <td className="px-6 py-4">
                              <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 relative">
                                {product.image ? (
                                  <img 
                                    src={product.image} 
                                    alt="" 
                                    className={`w-full h-full object-cover ${product.isBlurBeforeBuy ? 'blur-[2px]' : ''}`} 
                                  />
                                ) : (
                                  <ImageIcon className="w-6 h-6 m-3 text-gray-300" />
                                )}
                                {product.salePrice && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-900">
                                {product.name}
                                {product.sku && <div className="text-[10px] text-gray-400 font-mono mt-0.5">SKU: {product.sku}</div>}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                            <td className="px-6 py-4 text-sm font-bold text-spirit-600">
                                {product.salePrice ? (
                                    <div>
                                        <span className="text-red-600">{product.salePrice}</span>
                                        <span className="text-gray-400 text-xs line-through block">{product.price}</span>
                                    </div>
                                ) : product.price}
                            </td>
                            <td className="px-6 py-4 text-sm">
                                <div className="space-y-1">
                                    {product.isOutOfStock ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 uppercase tracking-wide">
                                            Out of Stock
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 uppercase tracking-wide">
                                            In Stock
                                        </span>
                                    )}
                                    {product.isBlurBeforeBuy && (
                                        <div className="flex items-center text-[10px] text-gray-500 font-bold uppercase tracking-wide">
                                            <EyeOffIcon className="w-3 h-3 mr-1" /> Blurred
                                        </div>
                                    )}
                                </div>
                            </td>
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
                 
                 {/* Main Info */}
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Price ($)</label>
                            <input 
                                type="text" 
                                required
                                value={productForm.price}
                                onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                                placeholder="$85.00"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">SKU <span className="text-gray-400 text-xs ml-2 font-normal">(Optional)</span></label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input 
                                    type="text" 
                                    value={productForm.sku}
                                    onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                                    className="w-full pl-9 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                                    placeholder="SKU-123"
                                />
                            </div>
                        </div>
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

                 {/* Advanced Options (Sale & Stock) */}
                 <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 flex items-center">
                        Advanced Options <span className="ml-2 text-xs text-gray-500 font-normal">(Optional)</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Out of Stock Toggle */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => setProductForm({...productForm, isOutOfStock: !productForm.isOutOfStock})}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${productForm.isOutOfStock ? 'bg-red-500' : 'bg-gray-200'}`}
                                >
                                    <span className="sr-only">Use setting</span>
                                    <span
                                        aria-hidden="true"
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${productForm.isOutOfStock ? 'translate-x-5' : 'translate-x-0'}`}
                                    />
                                </button>
                                <span className="ml-3 text-sm font-bold text-gray-700 flex items-center">
                                    <PackageX className="w-4 h-4 mr-2 text-gray-500" />
                                    Mark Out of Stock
                                </span>
                            </div>

                            {/* Blur Image Toggle */}
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => setProductForm({...productForm, isBlurBeforeBuy: !productForm.isBlurBeforeBuy})}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${productForm.isBlurBeforeBuy ? 'bg-spirit-600' : 'bg-gray-200'}`}
                                >
                                    <span className="sr-only">Use setting</span>
                                    <span
                                        aria-hidden="true"
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${productForm.isBlurBeforeBuy ? 'translate-x-5' : 'translate-x-0'}`}
                                    />
                                </button>
                                <span className="ml-3 text-sm font-bold text-gray-700 flex items-center">
                                    <EyeOffIcon className="w-4 h-4 mr-2 text-gray-500" />
                                    Blur Before Purchase
                                </span>
                            </div>
                        </div>

                        {/* Sale Price */}
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sale Price</label>
                             <input 
                                type="text" 
                                value={productForm.salePrice || ''}
                                onChange={(e) => setProductForm({...productForm, salePrice: e.target.value})}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none text-sm"
                                placeholder="Leave empty for no sale"
                             />
                        </div>

                        {/* Sale Dates */}
                        <div className="lg:col-span-1 grid grid-cols-2 gap-2">
                             <div>
                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sale Start</label>
                                 <input 
                                    type="datetime-local" 
                                    value={productForm.saleStart || ''}
                                    onChange={(e) => setProductForm({...productForm, saleStart: e.target.value})}
                                    className="w-full px-2 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none text-xs"
                                 />
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sale End</label>
                                 <input 
                                    type="datetime-local" 
                                    value={productForm.saleEnd || ''}
                                    onChange={(e) => setProductForm({...productForm, saleEnd: e.target.value})}
                                    className="w-full px-2 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none text-xs"
                                 />
                             </div>
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
      </main>
    </div>
  );
};

export default Admin;
