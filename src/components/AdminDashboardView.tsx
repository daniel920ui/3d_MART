import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, Supermarket } from '../types';
import {
  Shield,
  Users,
  Store,
  DollarSign,
  Package,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Supermarket[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'stores'>('overview');
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [dash, uList, sList] = await Promise.all([
        api.getAdminDashboard(),
        api.getAdminUsers(),
        api.getAdminStores(),
      ]);
      setMetrics(dash);
      setUsers(uList);
      setStores(sList);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleUser = async (userId: string) => {
    try {
      await api.toggleUserEnabled(userId);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    }
  };

  const handleToggleStore = async (storeId: string) => {
    try {
      await api.toggleStoreActive(storeId);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading admin console...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
        <div>
          <span className="px-3 py-1 bg-emerald-950 text-emerald-400 text-xs font-bold rounded-xl uppercase tracking-wider border border-emerald-800/60">
            System Administration Portal
          </span>
          <h1 className="text-2xl font-black mt-1.5 flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            NearMart 3D Platform Oversight
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage physical supermarket partners, customer accounts, role authorizations, and fulfillment telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Metrics Overview
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
              activeTab === 'stores'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Supermarkets ({stores.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
              activeTab === 'users'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            User Accounts ({users.length})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-400 font-medium">Platform Gross Sales</p>
          <p className="text-2xl font-black text-slate-900 mt-1">${metrics?.totalRevenue?.toFixed(2)}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
            <Package className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-400 font-medium">Total Orders Placed</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{metrics?.totalOrders}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
            <Store className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-400 font-medium">Active Supermarkets</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{metrics?.totalSupermarkets}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-400 font-medium">Registered Users</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{users.length}</p>
        </div>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-4">Orders by Lifecycle State</h3>
            <div className="space-y-3">
              {Object.entries(metrics?.statusCounts || {}).map(([st, cnt]) => (
                <div key={st} className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">{st.replace(/_/g, ' ')}</span>
                  <span className="px-3 py-1 bg-slate-100 font-extrabold rounded-lg text-slate-800">
                    {cnt as number} orders
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-4">Recent Platform Transactions</h3>
            <div className="space-y-2.5">
              {metrics?.recentOrders?.map((ord: any) => (
                <div
                  key={ord.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 text-xs"
                >
                  <div>
                    <span className="font-extrabold text-slate-900">{ord.orderNumber}</span>
                    <p className="text-[11px] text-slate-400">{ord.customerName} • {ord.storeName}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-emerald-700">${ord.totalAmount.toFixed(2)}</span>
                    <p className="text-[10px] text-slate-500 font-semibold">{ord.orderStatus}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Supermarkets */}
      {activeTab === 'stores' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Supermarket Partners</h3>
            <span className="text-xs text-slate-400">Total: {stores.length}</span>
          </div>

          <div className="divide-y divide-slate-100">
            {stores.map((store) => (
              <div key={store.id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <img
                    src={store.imageUrl}
                    alt={store.name}
                    className="w-16 h-14 rounded-2xl object-cover bg-slate-100"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{store.name}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          store.active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {store.active ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{store.address} ({store.locality})</p>
                    <p className="text-[11px] text-slate-400">Rating: {store.rating.toFixed(1)} ★ • Hours: {store.openingHours}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleStore(store.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    store.active
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {store.active ? 'Deactivate Store' : 'Activate Store'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">System Users & Roles</h3>
            <span className="text-xs text-slate-400">Total: {users.length} accounts</span>
          </div>

          <div className="divide-y divide-slate-100">
            {users.map((u) => (
              <div key={u.id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{u.fullName}</h4>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {u.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{u.email} • {u.phone}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold ${
                      (u as any).enabled !== false ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {(u as any).enabled !== false ? 'Active' : 'Disabled'}
                  </span>
                  {u.role !== 'ADMIN' && (
                    <button
                      onClick={() => handleToggleUser(u.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      {(u as any).enabled !== false ? 'Disable' : 'Enable'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
