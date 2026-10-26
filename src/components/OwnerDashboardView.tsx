import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CustomerOrder, OrderStatus } from '../types';
import {
  Store,
  DollarSign,
  Package,
  AlertTriangle,
  ShoppingBag,
  TrendingUp,
  CheckCircle2,
  Clock,
  Truck,
  Edit2,
  Save,
  Check,
  UserCheck,
} from 'lucide-react';

export const OwnerDashboardView: React.FC = () => {
  const { user, switchDemoAccount } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  // Editable inventory state
  const [editingInvId, setEditingInvId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editDiscount, setEditDiscount] = useState<string>('');
  const [editStock, setEditStock] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashData, orderData] = await Promise.all([
        api.getOwnerDashboard(),
        api.getOwnerOrders(),
      ]);
      setMetrics(dashData);
      setOrders(orderData || []);
    } catch (err) {
      console.warn('Notice loading owner data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setStatusUpdating(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    } finally {
      setStatusUpdating(null);
    }
  };

  const startEditInventory = (inv: any) => {
    setEditingInvId(inv.id);
    setEditPrice(inv.price.toString());
    setEditDiscount(inv.discountPercentage.toString());
    setEditStock(inv.stockQuantity.toString());
  };

  const saveInventory = async (invId: string) => {
    try {
      await api.updateInventory(invId, {
        price: parseFloat(editPrice),
        discountPercentage: parseInt(editDiscount, 10),
        stockQuantity: parseInt(editStock, 10),
      });
      setEditingInvId(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update inventory.');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading store dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-emerald-900 text-white p-6 rounded-3xl shadow-xl">
        <div>
          <span className="px-3 py-1 bg-emerald-800 text-emerald-200 text-xs font-bold rounded-xl uppercase tracking-wider">
            Supermarket Merchant Portal
          </span>
          <h1 className="text-2xl font-black mt-1.5 flex items-center gap-2">
            <Store className="w-6 h-6 text-emerald-400" />
            {metrics?.store?.name || 'My Supermarket'}
          </h1>
          <p className="text-xs text-emerald-200/80 mt-1">
            {metrics?.store?.address} • Operating Hours: {metrics?.store?.openingHours}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
              activeTab === 'orders'
                ? 'bg-white text-emerald-900 shadow'
                : 'bg-emerald-800/60 text-emerald-200 hover:bg-emerald-800'
            }`}
          >
            Store Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
              activeTab === 'inventory'
                ? 'bg-white text-emerald-900 shadow'
                : 'bg-emerald-800/60 text-emerald-200 hover:bg-emerald-800'
            }`}
          >
            Inventory & Prices ({metrics?.totalProducts || 0})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-400 font-medium">Recorded Sales</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            ${metrics?.totalSales != null ? Number(metrics.totalSales).toFixed(2) : '0.00'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-400 font-medium">Total Orders</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{metrics?.totalOrders}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
            <Package className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-400 font-medium">Listed Products</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{metrics?.totalProducts}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-400 font-medium">Low Stock Alerts</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{metrics?.lowStockCount}</p>
        </div>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Store Orders Fulfillment</h2>
          {orders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 text-slate-400">
              No orders have been received for this store yet.
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-extrabold text-sm text-slate-900">{order.orderNumber}</span>
                    <span className="text-xs text-slate-400 ml-2">
                      {new Date(order.createdAt).toLocaleTimeString()} • {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                      ${order.totalAmount.toFixed(2)} ({order.paymentMethod.replace(/_/g, ' ')})
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700">
                      {order.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Customer & Address Details */}
                <div className="text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-slate-400 block">Customer:</span>
                    <strong className="text-slate-800">{order.customerName} ({order.customerPhone})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Destination:</span>
                    <strong className="text-slate-800">{order.deliveryAddress}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Notes:</span>
                    <span className="italic">{order.instructions || 'None'}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1.5">
                  <p className="font-bold text-slate-700">Items ordered:</p>
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-slate-600">
                      <span>• {item.productNameSnapshot} x {item.quantity}</span>
                      <span className="font-medium">${item.lineTotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Status Transitions */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-slate-400 mr-2">Update Stage:</span>

                  {order.orderStatus === 'PLACED' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                      disabled={statusUpdating === order.id}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
                    >
                      Accept & Confirm
                    </button>
                  )}

                  {order.orderStatus === 'CONFIRMED' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'PACKING')}
                      disabled={statusUpdating === order.id}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition"
                    >
                      Start Packing
                    </button>
                  )}

                  {order.orderStatus === 'PACKING' && (
                    <>
                      {order.fulfilmentMethod === 'DELIVERY' ? (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'OUT_FOR_DELIVERY')}
                          disabled={statusUpdating === order.id}
                          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition"
                        >
                          Send Out for Delivery
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'READY_FOR_PICKUP')}
                          disabled={statusUpdating === order.id}
                          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition"
                        >
                          Mark Ready for Pickup
                        </button>
                      )}
                    </>
                  )}

                  {(order.orderStatus === 'OUT_FOR_DELIVERY' ||
                    order.orderStatus === 'READY_FOR_PICKUP') && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                      disabled={statusUpdating === order.id}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                    >
                      Complete Delivery (Mark Delivered)
                    </button>
                  )}

                  {order.orderStatus === 'DELIVERED' && (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Fulfilled and Completed
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Inventory & Pricing */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Manage Store Inventory & Prices</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Updates to stock quantities and prices are immediately reflected across the 2D catalog and 3D supermarket.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Base Price ($)</th>
                  <th className="p-4">Discount (%)</th>
                  <th className="p-4">Stock Quantity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics?.lowStockProducts?.map((item: any) => {
                  const isEditing = editingInvId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-100"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-[11px] text-slate-400">{item.brand}</p>
                        </div>
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-20 px-2 py-1 rounded border border-slate-300 text-xs font-bold"
                          />
                        ) : (
                          <span className="font-extrabold text-slate-800">${item.price.toFixed(2)}</span>
                        )}
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editDiscount}
                            onChange={(e) => setEditDiscount(e.target.value)}
                            className="w-16 px-2 py-1 rounded border border-slate-300 text-xs font-bold"
                          />
                        ) : (
                          <span className="text-orange-600 font-bold">{item.discountPercentage}%</span>
                        )}
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            className="w-16 px-2 py-1 rounded border border-slate-300 text-xs font-bold"
                          />
                        ) : (
                          <span className="font-bold text-slate-800">{item.stockQuantity} units</span>
                        )}
                      </td>

                      <td className="p-4">
                        {item.stockQuantity <= item.lowStockThreshold ? (
                          <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-lg flex items-center gap-1 w-max">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg w-max">
                            Healthy
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        {isEditing ? (
                          <button
                            onClick={() => saveInventory(item.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition inline-flex items-center gap-1"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => startEditInventory(item)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="Edit Price & Stock"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
