
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Package, Calendar, Loader2, ArrowRight, X, Star, Check, ShieldCheck, Tag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const OrdersPage: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
        navigate('/login');
        return;
    }

    const fetchOrders = async () => {
        if (!user) return;
        setIsLoadingOrders(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching orders:", error);
        } else {
            setOrders(data || []);
        }
        setIsLoadingOrders(false);
    };

    fetchOrders();
  }, [user, isAuthenticated, loading, navigate]);

  if (loading || isLoadingOrders) {
      return <div className="min-h-screen pt-32 flex justify-center"><Loader2 className="animate-spin text-spirit-500 w-10 h-10" /></div>;
  }

  return (
    <div className="min-h-screen pt-36 pb-20 bg-spirit-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif font-bold text-spirit-900 mb-8 flex items-center">
            <Package className="mr-4" /> My Orders
        </h1>

        {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-10 h-10 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">No orders yet</h2>
                <p className="text-slate-500 mb-8">You haven't purchased any spiritual essentials yet.</p>
                <Link to="/store" className="inline-flex items-center text-accent-600 font-bold hover:underline">
                    Browse Store <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
            </div>
        ) : (
            <div className="space-y-8">
                {orders.map(order => (
                    <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-fade-in hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-slate-100 gap-4">
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Order Placed</p>
                                <div className="flex items-center text-spirit-900 font-bold">
                                    <Calendar size={16} className="mr-2 text-accent-500" />
                                    {new Date(order.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total</p>
                                <p className="text-spirit-900 font-bold">${order.total?.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Order ID</p>
                                <p className="text-slate-600 font-mono text-sm">{order.id.slice(0,8)}</p>
                            </div>
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center">
                                <Check size={12} className="mr-1" />
                                {order.status || 'Paid'}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {order.items && Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                                <div 
                                    key={idx} 
                                    onClick={() => setSelectedProduct(item)}
                                    className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl cursor-pointer group hover:bg-spirit-100 transition-colors border border-transparent hover:border-spirit-200"
                                >
                                    <div className="w-20 h-20 bg-white rounded-lg overflow-hidden shrink-0 shadow-sm relative">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-spirit-900 text-sm mb-1 group-hover:text-accent-600 transition-colors">{item.name}</h4>
                                        <p className="text-xs text-slate-500 mb-2">{item.category}</p>
                                        <div className="flex justify-between items-center w-full">
                                            <span className="text-xs font-bold bg-white px-2 py-1 rounded border border-slate-200 text-slate-600">Qty: {item.quantity}</span>
                                            <span className="font-bold text-accent-600 text-sm">{item.price}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* PRODUCT DETAIL MODAL */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-spirit-900/90 backdrop-blur-sm transition-opacity" onClick={() => setSelectedProduct(null)}></div>
                
                <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar relative z-10 shadow-2xl animate-fade-in-up flex flex-col md:flex-row overflow-hidden">
                    <button 
                        onClick={() => setSelectedProduct(null)}
                        className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white md:text-slate-500 md:bg-white md:hover:bg-slate-100 md:shadow-md transition-all"
                    >
                        <X size={24} />
                    </button>

                    {/* Image Section */}
                    <div className="w-full md:w-1/2 bg-spirit-50 relative h-72 md:h-auto">
                        <img 
                            src={selectedProduct.image} 
                            alt={selectedProduct.name} 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 left-4">
                             <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-spirit-900 shadow-lg flex items-center gap-2">
                                <ShieldCheck size={14} className="text-green-500" /> Verified Purchase
                            </span>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col">
                        <div className="mb-2">
                            <span className="text-accent-600 text-xs font-bold uppercase tracking-widest bg-accent-50 px-3 py-1 rounded-full">
                                {selectedProduct.category}
                            </span>
                        </div>
                        
                        <h2 className="text-3xl font-serif font-bold text-spirit-900 mb-4 leading-tight">
                            {selectedProduct.name}
                        </h2>

                        <div className="flex items-center space-x-4 mb-6 border-b border-slate-100 pb-6">
                            <span className="text-2xl font-bold text-spirit-900">{selectedProduct.price}</span>
                            <div className="flex items-center text-yellow-400 text-sm">
                                <Star className="fill-current w-4 h-4" />
                                <Star className="fill-current w-4 h-4" />
                                <Star className="fill-current w-4 h-4" />
                                <Star className="fill-current w-4 h-4" />
                                <Star className="fill-current w-4 h-4" />
                                <span className="text-slate-400 ml-2 font-bold text-xs uppercase tracking-wide">(Your Rating)</span>
                            </div>
                        </div>

                        <div className="prose prose-sm text-slate-600 leading-relaxed font-light mb-8 overflow-y-auto max-h-60 pr-2 custom-scrollbar">
                            <h4 className="text-spirit-900 font-bold text-sm uppercase tracking-wide mb-2">Item Description</h4>
                            <p>
                                {selectedProduct.description || "This sacred item was carefully selected to aid in your spiritual journey. It has been cleansed and prepared specifically for your order."}
                            </p>
                            <p className="mt-4">
                                <strong>Usage Note:</strong> Use this item with pure intention. Keep it in a clean, respectful place.
                            </p>
                        </div>

                        <div className="mt-auto bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="flex items-start gap-3">
                                <Tag size={18} className="text-spirit-400 mt-1 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-spirit-900 uppercase tracking-wide mb-1">SKU: {selectedProduct.sku || 'N/A'}</p>
                                    <p className="text-xs text-slate-500">
                                        If you need support regarding this specific item, please quote the Order ID from your dashboard.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default OrdersPage;
