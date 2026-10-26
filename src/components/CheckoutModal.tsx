import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CustomerOrder } from '../types';
import {
  X,
  CheckCircle2,
  Truck,
  ShoppingBag,
  CreditCard,
  Banknote,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: (order: CustomerOrder) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderPlaced,
}) => {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState(user?.fullName || 'Jane Doe');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+1 555-0199');
  const [deliveryAddress, setDeliveryAddress] = useState(
    'Apt 4B, 350 Maple Avenue, Downtown Metro'
  );
  const [fulfilmentMethod, setFulfilmentMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<'DEMO_PAYMENT' | 'CASH_ON_DELIVERY'>('DEMO_PAYMENT');
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !cart) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const order = await api.checkout({
        customerName,
        customerPhone,
        deliveryAddress:
          fulfilmentMethod === 'PICKUP'
            ? `Store Counter Pickup: ${cart.supermarketName}`
            : deliveryAddress,
        fulfilmentMethod,
        paymentMethod,
        instructions,
      });

      await refreshCart();
      onOrderPlaced(order);
    } catch (err: any) {
      setError(err.message || 'Checkout failed. Please re-check item availability.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              {cart.supermarketName}
            </span>
            <h2 className="text-lg font-extrabold text-slate-900">Checkout & Fulfillment</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Fulfillment Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Fulfillment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFulfilmentMethod('DELIVERY')}
                className={`py-3 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  fulfilmentMethod === 'DELIVERY'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Home Delivery</span>
              </button>

              <button
                type="button"
                onClick={() => setFulfilmentMethod('PICKUP')}
                className={`py-3 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  fulfilmentMethod === 'PICKUP'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>Store Pickup</span>
              </button>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Recipient Full Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Phone *
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
                placeholder="+1 555-0199"
              />
            </div>
          </div>

          {fulfilmentMethod === 'DELIVERY' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Delivery Street Address *
              </label>
              <textarea
                required
                rows={2}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs resize-none"
                placeholder="Apartment, Suite, Unit, Street, City"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Delivery Notes / Instructions (Optional)
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
              placeholder="e.g. Ring doorbell #402, leave at front porch"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Payment Method
            </label>
            <div className="space-y-2">
              <label
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'DEMO_PAYMENT'
                    ? 'border-emerald-600 bg-emerald-50/60'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'DEMO_PAYMENT'}
                    onChange={() => setPaymentMethod('DEMO_PAYMENT')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Instant Demo Payment (College Presentation Simulation)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Simulates instantaneous gateway authorization without debiting real funds.
                    </p>
                  </div>
                </div>
                <CreditCard className="w-4 h-4 text-emerald-600" />
              </label>

              <label
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-emerald-600 bg-emerald-50/60'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'CASH_ON_DELIVERY'}
                    onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Cash on Delivery / Pickup</p>
                    <p className="text-[11px] text-slate-500">
                      Pay cash upon delivery or curbside counter pickup.
                    </p>
                  </div>
                </div>
                <Banknote className="w-4 h-4 text-emerald-600" />
              </label>
            </div>
          </div>

          {/* Pricing summary */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal ({cart.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
            {cart.discountAmount > 0 && (
              <div className="flex justify-between text-orange-600 font-semibold">
                <span>Total Store Savings</span>
                <span>-${cart.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Fulfillment Fee</span>
              <span>
                {fulfilmentMethod === 'PICKUP' || cart.deliveryFee === 0 ? (
                  <strong className="text-emerald-700">FREE</strong>
                ) : (
                  `$${cart.deliveryFee.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-900">
              <span>Payable Total</span>
              <span className="text-emerald-700 text-lg">
                ${(fulfilmentMethod === 'PICKUP' ? cart.subtotal - cart.discountAmount : cart.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
          >
            {submitting ? (
              <span>Verifying Stock & Authorizing...</span>
            ) : (
              <>
                <span>Confirm & Place Order</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
