import React from 'react';
import { Supermarket } from '../types';
import {
  MapPin,
  Clock,
  Truck,
  ShoppingBag,
  Star,
  Box,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface StoreCardProps {
  store: Supermarket;
  onSelect: (store: Supermarket, enter3D: boolean) => void;
  isSelected?: boolean;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, onSelect, isSelected }) => {
  return (
    <div
      className={`group bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl ${
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-500/30'
          : 'border-slate-100 hover:border-emerald-200'
      }`}
    >
      <div>
        {/* Store Banner */}
        <div className="relative aspect-16/9 overflow-hidden bg-slate-100">
          <img
            src={store.imageUrl}
            alt={store.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

          {/* Locality badge */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-slate-800 shadow-md flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>{store.locality}</span>
          </div>

          {/* Rating */}
          <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{store.rating.toFixed(1)}</span>
            <span className="text-slate-400 font-normal">({store.reviewCount})</span>
          </div>

          {/* Distance */}
          {store.distanceKm !== null && store.distanceKm !== undefined ? (
            <div className="absolute bottom-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-lg shadow">
              {store.distanceKm} km away
            </div>
          ) : null}

          {/* Min order */}
          <div className="absolute bottom-3 right-3 text-white text-xs font-medium">
            Min. order: <span className="font-bold">${store.minOrder}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition line-clamp-1">
            {store.name}
          </h3>

          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {store.description}
          </p>

          <div className="mt-4 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{store.openingHours}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">{store.address}</span>
            </div>
          </div>

          {/* Service options */}
          <div className="mt-4 flex flex-wrap gap-2">
            {store.deliveryAvailable && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                Home Delivery
              </span>
            )}
            {store.pickupAvailable && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold">
                <ShoppingBag className="w-3.5 h-3.5 text-sky-600" />
                Store Pickup
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-5 pt-0 grid grid-cols-2 gap-2.5">
        <button
          onClick={() => onSelect(store, false)}
          className="py-2.5 px-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition"
        >
          <span>View Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onSelect(store, true)}
          className="py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition group/btn"
        >
          <Box className="w-4 h-4 text-emerald-200 group-hover/btn:scale-110 transition-transform" />
          <span>Enter 3D Store</span>
        </button>
      </div>
    </div>
  );
};
