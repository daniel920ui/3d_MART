import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  Box,
  Store,
  Clock,
  Search,
  MapPin,
  Shield,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  selectedLocality: string;
  onLocalityChange: (locality: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onEnter3D: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  selectedLocality,
  onLocalityChange,
  searchQuery,
  onSearchChange,
  onEnter3D,
}) => {
  const { user, logout } = useAuth();
  const { cart, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalItems = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const localities = [
    { id: 'all', label: 'All Localities' },
    { id: 'Downtown Metro', label: 'Downtown Metro' },
    { id: 'Greenfield Suburb', label: 'Greenfield Suburb' },
    { id: 'Tech Park Avenue', label: 'Tech Park Avenue' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveView('home')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Box className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900">NearMart</span>
                <span className="text-xl font-black text-emerald-600">3D</span>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 tracking-wide -mt-1 hidden sm:block">
                Step Inside. Shop Smarter.
              </p>
            </div>
          </div>

          {/* Search Bar & Locality Selector (Desktop) */}
          <div className="hidden lg:flex items-center flex-1 max-w-xl mx-4 gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search fresh produce, milk, bakery, snacks..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition"
              />
            </div>

            {/* Locality Selector */}
            <div className="relative shrink-0">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedLocality}
                onChange={(e) => onLocalityChange(e.target.value)}
                className="pl-8 pr-7 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
              >
                {localities.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveView('home')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                activeView === 'home'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Nearby Stores
            </button>

            <button
              onClick={onEnter3D}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeView === 'virtual-store'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              <Box className="w-4 h-4 text-emerald-600" />
              <span>3D Supermarket</span>
            </button>

            <button
              onClick={() => setActiveView('orders')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                activeView === 'orders'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Orders</span>
            </button>

            {/* Role specific portals */}
            {user?.role === 'SHOP_OWNER' && (
              <button
                onClick={() => setActiveView('owner')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeView === 'owner'
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
                }`}
              >
                <Store className="w-4 h-4 text-emerald-600" />
                <span>Shop Owner</span>
              </button>
            )}

            {user?.role === 'ADMIN' && (
              <button
                onClick={() => setActiveView('admin')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeView === 'admin'
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* Right Action Icons (Cart & Account) */}
          <div className="flex items-center gap-2.5">
            {/* Basket Button with live counter badge */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition flex items-center gap-2"
              aria-label="View Shopping Basket"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
              <span className="hidden sm:inline text-xs font-bold">Basket</span>
              {totalItems > 0 && (
                <span className="bg-emerald-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-in zoom-in">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Profile / Logout */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800 leading-tight">{user?.fullName?.split(' ')[0]}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user?.role?.toLowerCase().replace(/_/g, ' ')}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Locality Row */}
        <div className="lg:hidden pb-3 pt-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search groceries..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
            />
          </div>

          <select
            value={selectedLocality}
            onChange={(e) => onLocalityChange(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            {localities.map((l) => (
              <option key={l.id} value={l.id}>
                {l.id === 'all' ? 'All Areas' : l.label.split(' ')[0]}
              </option>
            ))}
          </select>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-2 animate-in slide-in-from-top-2">
            <button
              onClick={() => {
                setActiveView('home');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 rounded-xl"
            >
              Nearby Stores
            </button>

            <button
              onClick={() => {
                onEnter3D();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-xl flex items-center gap-2"
            >
              <Box className="w-4 h-4" />
              <span>3D Virtual Supermarket</span>
            </button>

            <button
              onClick={() => {
                setActiveView('orders');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 rounded-xl"
            >
              Track Orders
            </button>

            {user?.role === 'SHOP_OWNER' && (
              <button
                onClick={() => {
                  setActiveView('owner');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-xl"
              >
                Shop Owner Dashboard
              </button>
            )}

            {user?.role === 'ADMIN' && (
              <button
                onClick={() => {
                  setActiveView('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-xl"
              >
                Admin Platform Dashboard
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
