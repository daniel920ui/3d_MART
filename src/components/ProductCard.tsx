import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Eye, Plus, Minus, Tag, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  storeId: string;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, storeId, onViewDetails }) => {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const discountedPrice = Number(
    (product.price! * (1 - (product.discountPercentage || 0) / 100)).toFixed(2)
  );

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdding(true);
    await addItem(storeId, product.id, qty);
    setAdding(false);
  };

  return (
    <div
      onClick={() => onViewDetails(product)}
      className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-50">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Discount Badge */}
        {product.discountPercentage && product.discountPercentage > 0 ? (
          <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1">
            <Tag className="w-3 h-3" />
            <span>{product.discountPercentage}% OFF</span>
          </div>
        ) : null}

        {/* Aisle Badge */}
        <div className="absolute top-3 right-3 bg-slate-900/75 backdrop-blur-sm text-slate-100 text-[11px] font-bold px-2 py-0.5 rounded-lg shadow">
          Aisle {product.aisle}
        </div>

        {/* Quick View Hover overlay */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/95 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            Quick Inspect
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
            <span>{product.brand}</span>
            <span>{product.packageSize}</span>
          </div>

          <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-emerald-700 transition">
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          {/* Price & Stock status */}
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-emerald-700">
                ${discountedPrice.toFixed(2)}
              </span>
              {product.discountPercentage && product.discountPercentage > 0 ? (
                <span className="text-xs text-slate-400 line-through">
                  ${product.price?.toFixed(2)}
                </span>
              ) : null}
            </div>

            <div className="text-[11px] font-semibold">
              {product.stockQuantity! > 5 ? (
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> In Stock
                </span>
              ) : product.stockQuantity! > 0 ? (
                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-600" /> {product.stockQuantity} left
                </span>
              ) : (
                <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Stepper & Add to Basket Button */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                disabled={qty <= 1}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-white disabled:opacity-30 transition"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center font-bold text-xs text-slate-800">{qty}</span>
              <button
                type="button"
                onClick={() => setQty(Math.min(product.stockQuantity || 1, qty + 1))}
                disabled={qty >= (product.stockQuantity || 1)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-white disabled:opacity-30 transition"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={!product.available || adding}
              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{adding ? 'Adding...' : 'Add'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
