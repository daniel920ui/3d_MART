import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, UserCheck, Shield, Store, User } from 'lucide-react';

export const DemoBar: React.FC = () => {
  const { user, switchDemoAccount } = useAuth();

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white text-xs border-b border-emerald-900/60 py-2 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/30">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            COLLEGE DEMO MODE
          </span>
          <span className="text-slate-300 hidden sm:inline">
            Active Identity: <strong className="text-white">{user?.fullName || 'Guest'}</strong> (Role: <span className="text-emerald-400 font-bold">{user?.role}</span>)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 mr-1 hidden md:inline">Switch Demo Persona:</span>

          <button
            onClick={() => switchDemoAccount('customer')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 ${
              user?.role === 'CUSTOMER'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <User className="w-3 h-3" />
            <span>Customer</span>
          </button>

          <button
            onClick={() => switchDemoAccount('owner')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 ${
              user?.role === 'SHOP_OWNER'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Store className="w-3 h-3" />
            <span>Shop Owner</span>
          </button>

          <button
            onClick={() => switchDemoAccount('admin')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 ${
              user?.role === 'ADMIN'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
};
