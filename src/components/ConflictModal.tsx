import React from 'react';
import { useCart } from '../context/CartContext';
import { AlertTriangle, ArrowRight, Trash2 } from 'lucide-react';

export const ConflictModal: React.FC = () => {
  const { conflictModal, resolveConflict } = useCart();
  if (!conflictModal || !conflictModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Switch to a new Supermarket?
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed mb-6">
          Your current basket already contains items from <strong className="text-slate-900">{conflictModal.currentStoreName}</strong>. NearMart 3D processes orders store-by-store to ensure rapid direct local delivery.
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => resolveConflict(true)}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Current Basket & Add This Item</span>
          </button>

          <button
            onClick={() => resolveConflict(false)}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition text-xs"
          >
            Keep My Current Store & Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
