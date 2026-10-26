import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  Tag,
  Store,
  Layers,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  storeId: string;
  storeName: string;
  onClose: () => void;
  onNavigateToProduct?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  storeId,
  storeName,
  onClose,
}) => {
  if (!product) return null;

  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const discountedPrice = Number(
    (product.price! * (1 - (product.discountPercentage || 0) / 100)).toFixed(2)
  );

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addItem(storeId, product.id, quantity);
    setIsAdding(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-700 bg-white/80 hover:bg-white rounded-full backdrop-blur-md shadow-sm transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Gallery */}
        <div className="md:w-1/2 relative bg-slate-50 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-100">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-sm"
          />

          {product.discountPercentage && product.discountPercentage > 0 ? (
            <div className="absolute top-6 left-6 bg-orange-600 text-white text-xs font-black px-3 py-1 rounded-xl shadow-md flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              <span>{product.discountPercentage}% DISCOUNT</span>
            </div>
          ) : null}

          <div className="absolute bottom-6 left-6 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-xl">
            Aisle {product.aisle} • Shelf {product.shelfSection}
          </div>
        </div>

        {/* Product Specs & Purchasing */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
                {product.categoryName || 'Grocery'}
              </span>
              <span className="text-xs text-slate-400 font-medium">{product.brand}</span>
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
              {product.name}
            </h2>

            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>Listed by: <strong className="text-slate-700">{storeName}</strong></span>
            </div>

            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              {product.description}
            </p>

            <div className="mt-3 py-2 px-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center justify-between">
              <span className="font-medium text-slate-500">Package Size:</span>
              <span className="font-bold text-slate-800">{product.packageSize}</span>
            </div>

            {/* Inventory and Pricing */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Store Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-700">
                    ${discountedPrice.toFixed(2)}
                  </span>
                  {product.discountPercentage && product.discountPercentage > 0 ? (
                    <span className="text-sm line-through text-slate-400">
                      ${product.price?.toFixed(2)}
                    </span>
                  ) : null}
                </div>
              </div>

              <div>
                {product.stockQuantity! > 5 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    In Stock ({product.stockQuantity} units)
                  </span>
                ) : product.stockQuantity! > 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Low Stock: {product.stockQuantity} left
                  </span>
                ) : (
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl">
                    Sold Out
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stepper & Add to Basket */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-200 rounded-2xl bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-2 rounded-xl text-slate-600 hover:bg-white disabled:opacity-30 transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-slate-800">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stockQuantity || 1, quantity + 1))}
                  disabled={quantity >= (product.stockQuantity || 1)}
                  className="p-2 rounded-xl text-slate-600 hover:bg-white disabled:opacity-30 transition"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.available || isAdding}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-bold rounded-2xl shadow-lg hover:shadow-emerald-600/25 transition flex items-center justify-center gap-2 text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isAdding ? 'Adding to Basket...' : `Add to Basket • $${(discountedPrice * quantity).toFixed(2)}`}</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600" /> Free delivery above $35
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Quality Guaranteed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
