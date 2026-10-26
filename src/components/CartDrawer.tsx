import React from 'react';
import { useCart } from '../context/CartContext';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Truck,
  ArrowRight,
  ShieldCheck,
  Store,
} from 'lucide-react';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const { cart, isOpen, setIsOpen, updateQuantity, removeItem, clearCart, loading } = useCart();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="absolute inset-y-0 right-0 max-w-full flex pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Your Grocery Basket</h3>
                {cart && cart.items.length > 0 && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-emerald-600" />
                    <span>From: <strong>{cart.supermarketName}</strong></span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
              aria-label="Close Basket"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {!cart || cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-300">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-700 mb-1">Your basket is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mb-6">
                  Explore fresh produce and grocery aisles in 3D or browse our store catalog!
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                  <span>{cart.items.reduce((s, i) => s + i.quantity, 0)} items in basket</span>
                  <button
                    onClick={() => clearCart()}
                    className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear all
                  </button>
                </div>

                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 bg-white"
                      />

                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-slate-400 font-medium">{item.brand}</p>
                        <h4 className="text-xs font-bold text-slate-800 truncate">{item.name}</h4>
                        <p className="text-[11px] text-slate-500">{item.packageSize}</p>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-emerald-700">
                            ${item.discountedPrice.toFixed(2)}
                          </span>
                          {item.discountPercentage > 0 && (
                            <span className="text-[10px] text-slate-400 line-through">
                              ${item.unitPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stepper */}
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition"
                          title="Remove item"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center border border-slate-200 rounded-lg bg-white p-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-slate-500 hover:bg-slate-50 rounded"
                            aria-label="Decrease"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.availableStock}
                            className="p-1 text-slate-500 hover:bg-slate-50 rounded disabled:opacity-30"
                            aria-label="Increase"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Free delivery promo progress */}
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100/80">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      {cart.totalAmount >= 35
                        ? '🎉 You unlocked Free Delivery!'
                        : `Add $${(35 - cart.totalAmount).toFixed(2)} more for Free Delivery`}
                    </span>
                    <span>{Math.min(100, Math.round((cart.totalAmount / 35) * 100))}%</span>
                  </div>
                  <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (cart.totalAmount / 35) * 100)}%` }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Summary & Checkout Footer */}
          {cart && cart.items.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-white space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Gross Subtotal</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>

                {cart.discountAmount > 0 && (
                  <div className="flex justify-between text-orange-600 font-semibold">
                    <span>Store Discounts</span>
                    <span>-${cart.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Standard Delivery Fee</span>
                  <span>
                    {cart.deliveryFee === 0 ? (
                      <strong className="text-emerald-700 uppercase">FREE</strong>
                    ) : (
                      `$${cart.deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline text-slate-900">
                  <span className="text-sm font-bold">Payable Total</span>
                  <span className="text-xl font-extrabold text-emerald-700">
                    ${cart.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onProceedToCheckout();
                }}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-emerald-600/30 transition flex items-center justify-center gap-2 text-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Stock reserved for 30 minutes • Safe Checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
