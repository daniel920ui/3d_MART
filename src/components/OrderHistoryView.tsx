import React, { useState, useEffect } from 'react';
import { CustomerOrder, OrderStatus } from '../types';
import { api } from '../services/api';
import {
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Store,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const OrderHistoryView: React.FC = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data || []);
      if (data && data.length > 0 && !expandedOrderId) {
        setExpandedOrderId(data[0].id);
      }
    } catch (err) {
      console.warn('Notice loading orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stored inventory will be immediately restored.')) {
      return;
    }
    setCancellingId(orderId);
    try {
      await api.cancelOrder(orderId);
      setActionMessage('Order successfully cancelled. Inventory was restored to the supermarket.');
      await fetchOrders();
      setTimeout(() => setActionMessage(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Could not cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  const statusSteps: OrderStatus[] = [
    'PLACED',
    'CONFIRMED',
    'PACKING',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
  ];

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PLACED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CONFIRMED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'PACKING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'READY_FOR_PICKUP':
      case 'OUT_FOR_DELIVERY':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">Your Order History & Tracking</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review grocery purchases, monitor order fulfillment milestones, and inspect delivery items.
        </p>
      </div>

      {actionMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No orders placed yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Explore our 3D aisles or store catalog to place your first grocery order!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const canCancel = order.orderStatus === 'PLACED' || order.orderStatus === 'CONFIRMED';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition"
              >
                {/* Header Summary */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-5 cursor-pointer hover:bg-slate-50/50 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{order.orderNumber}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStatusColor(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Store className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{order.storeName}</span>
                        <span>•</span>
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">${order.totalAmount.toFixed(2)}</p>
                      <p className="text-[11px] text-slate-400 capitalize">
                        {order.fulfilmentMethod.toLowerCase()} • {order.paymentStatus}
                      </p>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50/40 space-y-6">
                    {/* Status Milestones Timeline */}
                    {order.orderStatus !== 'CANCELLED' ? (
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 mb-3">Fulfillment Progress</h4>
                        <div className="grid grid-cols-5 gap-2">
                          {statusSteps.map((step, idx) => {
                            const currentIdx = statusSteps.indexOf(
                              order.orderStatus === 'READY_FOR_PICKUP' ? 'OUT_FOR_DELIVERY' : order.orderStatus
                            );
                            const isCompleted = idx <= currentIdx;
                            const isCurrent = idx === currentIdx;

                            return (
                              <div key={step} className="flex flex-col items-center text-center">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition ${
                                    isCompleted
                                      ? 'bg-emerald-600 text-white shadow'
                                      : 'bg-slate-200 text-slate-400'
                                  } ${isCurrent ? 'ring-4 ring-emerald-200' : ''}`}
                                >
                                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                </div>
                                <span
                                  className={`text-[10px] font-semibold leading-tight ${
                                    isCompleted ? 'text-slate-800' : 'text-slate-400'
                                  }`}
                                >
                                  {step.replace(/_/g, ' ')}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
                        <XCircle className="w-4 h-4 shrink-0" />
                        <span>This order was cancelled. Inventory was returned to stock.</span>
                      </div>
                    )}

                    {/* Delivery & Customer Info */}
                    <div className="p-4 bg-white rounded-2xl border border-slate-200/80 text-xs space-y-2">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Recipient:</span>
                        <strong className="text-slate-800">{order.customerName} ({order.customerPhone})</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Fulfillment:</span>
                        <strong className="text-slate-800">{order.deliveryAddress}</strong>
                      </div>
                      {order.instructions && (
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Special Notes:</span>
                          <span className="text-slate-700 italic">"{order.instructions}"</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Payment Channel:</span>
                        <strong className="text-slate-800">{order.paymentMethod.replace(/_/g, ' ')} ({order.paymentStatus})</strong>
                      </div>
                    </div>

                    {/* Ordered Items */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 mb-2">Items in this Order</h4>
                      <div className="space-y-2">
                        {order.items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={item.imageUrlSnapshot}
                                alt={item.productNameSnapshot}
                                className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                              />
                              <div>
                                <p className="font-bold text-slate-900">{item.productNameSnapshot}</p>
                                <p className="text-[11px] text-slate-400">{item.brandSnapshot}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-800">
                                {item.quantity} x ${item.unitPriceSnapshot.toFixed(2)}
                              </p>
                              <p className="text-emerald-700 font-extrabold">
                                ${item.lineTotal.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cancel action */}
                    {canCancel && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingId === order.id}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{cancellingId === order.id ? 'Cancelling...' : 'Cancel Order & Restore Inventory'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
