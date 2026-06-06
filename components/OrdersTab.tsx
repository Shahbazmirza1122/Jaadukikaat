import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  Loader2,
  Package,
  DollarSign,
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle,
  Truck,
  XCircle
} from "lucide-react";

export const OrdersTab: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDuration, setFilterDuration] = useState<"all" | "7" | "30">("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [filterDuration]);

  const fetchOrders = async () => {
    setIsLoading(true);
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
    
    if (filterDuration !== "all") {
        const date = new Date();
        date.setDate(date.getDate() - parseInt(filterDuration));
        query = query.gte('created_at', date.toISOString());
    }

    const { data, error } = await query;
    if (!error && data) {
      setOrders(data);
    } else {
        console.error("Error fetching orders", error);
    }
    setIsLoading(false);
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    if (!error) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedOrderId === id) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(id);
    }
  };

  // Analytics
  const totalRevenue = orders.reduce((acc, order) => acc + (order.total || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;
  const deliveredOrders = orders.filter(o => o.status?.toLowerCase() === "delivered").length;

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'delivered') return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">Delivered</span>;
    if (s === 'shipped') return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">Shipped</span>;
    if (s === 'cancelled') return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">Cancelled</span>;
    if (s.includes('pending')) return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold border border-orange-200">Pending</span>;
    return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold border border-gray-200">{status}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
          <div>
             <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
             <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="w-12 h-12 bg-spirit-50 text-spirit-600 rounded-full flex items-center justify-center">
            <DollarSign />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
          <div>
             <p className="text-sm text-gray-500 font-medium">Total Orders</p>
             <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <Package />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
          <div>
             <p className="text-sm text-gray-500 font-medium">Avg Order Value</p>
             <p className="text-2xl font-bold text-gray-900">${avgOrderValue.toFixed(2)}</p>
          </div>
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
            <TrendingUp />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
          <div>
             <p className="text-sm text-gray-500 font-medium">Delivered Orders</p>
             <p className="text-2xl font-bold text-gray-900">{deliveredOrders}</p>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle />
          </div>
        </div>
      </div>

      {/* Primary Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
             <Truck className="mr-2 text-spirit-600" /> Manage Orders
          </h2>
          <div className="flex bg-gray-100 rounded-lg p-1">
             <button 
                onClick={() => setFilterDuration("all")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${filterDuration === "all" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
             >
                 All Time
             </button>
             <button 
                onClick={() => setFilterDuration("30")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${filterDuration === "30" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
             >
                 Last 30 Days
             </button>
             <button 
                onClick={() => setFilterDuration("7")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${filterDuration === "7" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
             >
                 Last 7 Days
             </button>
          </div>
        </div>

        {isLoading ? (
            <div className="p-12 flex justify-center">
                <Loader2 className="animate-spin text-spirit-500 w-8 h-8" />
            </div>
        ) : orders.length === 0 ? (
            <div className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No orders found for this duration.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Ref</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Items</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {orders.map((order) => {
                            const date = new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                            let items: any[] = [];
                            let metaInfo: any = null;
                            try { 
                                const parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items; 
                                if (Array.isArray(parsedItems)) {
                                    items = parsedItems.filter(i => {
                                        if (i && i.isMeta) {
                                            metaInfo = i;
                                            return false;
                                        }
                                        return true;
                                    });
                                }
                            } catch(e){}
                            const isExpanded = expandedOrderId === order.id;

                            return (
                                <React.Fragment key={order.id}>
                                    <tr className={`hover:bg-gray-50 transition cursor-pointer ${isExpanded ? 'bg-gray-50' : 'bg-white'}`} onClick={() => toggleExpand(order.id)}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{order.id.slice(0,8).toUpperCase()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono" title={metaInfo?.email || order.user_id}>
                                            {metaInfo?.email || (order.user_id ? order.user_id.slice(0,8) + '...' : 'Guest')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{items?.length || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${parseFloat(order.total).toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-gray-50">
                                            <td colSpan={7} className="px-6 py-6 border-b border-gray-200">
                                                <div className="flex flex-col md:flex-row gap-8 absolute-z0 relative">
                                                    
                                                    {/* Order Items */}
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-bold text-gray-900 mb-4">Order Items</h4>
                                                        <div className="space-y-4">
                                                            {items && items.length > 0 ? items.map((item: any, i: number) => (
                                                                <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                                                                    <div className="w-12 h-12 bg-gray-100 rounded object-cover overflow-hidden flex-shrink-0">
                                                                        <img src={item.image || "https://images.unsplash.com/photo-1549557454-949e25d0c7d6?w=100&q=80"} alt={item.name} className="w-full h-full object-cover" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                                                        <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-sm font-bold text-gray-900">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                                                                    </div>
                                                                </div>
                                                            )) : (
                                                                <p className="text-sm text-gray-500">No items available.</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Actions & Details */}
                                                    <div className="w-full md:w-1/3 bg-white p-6 rounded-xl border border-gray-200 h-max">
                                                        <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                                                            <CheckCircle className="w-4 h-4 mr-2 text-spirit-600" /> Status Management
                                                        </h4>
                                                        
                                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Update Order Status</label>
                                                        <select
                                                            className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-spirit-500 focus:border-spirit-500 block p-2.5 outline-none mb-6 font-medium"
                                                            value={order.status || 'Pending'}
                                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                        >
                                                            <option value="Pending Verification">Pending Verification</option>
                                                            <option value="Paid">Paid (Processing)</option>
                                                            <option value="Shipped">Shipped</option>
                                                            <option value="Delivered">Delivered</option>
                                                            <option value="Cancelled">Cancelled</option>
                                                        </select>

                                                        <div className="pt-4 border-t border-gray-100">
                                                            <p className="text-sm font-bold text-gray-900 mb-2">Customer Details</p>
                                                            {metaInfo ? (
                                                                <div className="space-y-1 mb-4">
                                                                    <p className="text-xs text-gray-600"><span className="font-semibold">Name:</span> {metaInfo.fullName}</p>
                                                                    <p className="text-xs text-gray-600"><span className="font-semibold">Email:</span> {metaInfo.email}</p>
                                                                    <p className="text-xs text-gray-600"><span className="font-semibold">Method:</span> {metaInfo.paymentMethod}</p>
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-gray-500 mb-4">No additional details recorded.</p>
                                                            )}
                                                            <p className="text-xs text-gray-500 mb-1">Full Order ID</p>
                                                            <p className="text-xs font-mono text-gray-800 break-all bg-gray-50 p-2 rounded border border-gray-100">{order.id}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};
