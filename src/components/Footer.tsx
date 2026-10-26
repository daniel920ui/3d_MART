import React from 'react';
import { Box, Heart, ShieldCheck, Truck, Sparkles, MapPin, Store } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center">
                <Box className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight">NearMart 3D</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Transforming traditional grocery shopping into an interactive virtual 3D supermarket while empowering local physical supermarkets.
            </p>
            <p className="text-emerald-400 font-bold text-[11px]">
              "Step Inside. Shop Smarter."
            </p>
          </div>

          {/* Customer Navigation */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Customer Shopping</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-emerald-400 transition">
                  Nearby Supermarkets
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('virtual-store')} className="hover:text-emerald-400 transition">
                  Interactive 3D Supermarket
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('orders')} className="hover:text-emerald-400 transition">
                  Order Tracking & Timeline
                </button>
              </li>
              <li>
                <span className="text-slate-500">Fresh Fruits & Produce</span>
              </li>
            </ul>
          </div>

          {/* Supermarket Merchant & Admin */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Merchant & Admin</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('owner')} className="hover:text-emerald-400 transition">
                  Supermarket Owner Portal
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-emerald-400 transition">
                  Administrator Dashboard
                </button>
              </li>
              <li>
                <span className="text-slate-500">Inventory REST API</span>
              </li>
              <li>
                <span className="text-slate-500">Local Delivery Dispatch</span>
              </li>
            </ul>
          </div>

          {/* College Project Disclaimer */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Academic Project Details</h4>
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-1.5 text-[11px] text-slate-300">
              <p className="font-bold text-emerald-400">NearMart 3D — Final Year Capstone</p>
              <p>Demonstrating Three.js 3D web virtualization, full-stack REST API architecture, and store-specific inventory isolation.</p>
              <p className="text-slate-400 pt-1">Spring Boot + MySQL + React + Three.js</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} NearMart 3D. Designed for Academic Final-Year Project Demonstration.</p>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>API Documentation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
