import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (storeId: string, productId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: (newStoreId?: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  conflictModal: {
    isOpen: boolean;
    currentStoreName: string;
    newStoreId: string;
    pendingProductId: string;
  } | null;
  resolveConflict: (replace: boolean) => Promise<void>;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  hideToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [conflictModal, setConflictModal] = useState<{
    isOpen: boolean;
    currentStoreName: string;
    newStoreId: string;
    pendingProductId: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const hideToast = () => setToast(null);

  const refreshCart = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.getCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to load cart', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [user, refreshCart]);

  const addItem = async (storeId: string, productId: string, quantity: number = 1): Promise<boolean> => {
    if (!user) {
      showToast('Please sign in to add items to your cart.', 'error');
      return false;
    }

    // Check store mismatch on client first
    if (cart && cart.items.length > 0 && cart.supermarketId !== storeId) {
      setConflictModal({
        isOpen: true,
        currentStoreName: cart.supermarketName,
        newStoreId: storeId,
        pendingProductId: productId,
      });
      return false;
    }

    setLoading(true);
    try {
      const updatedCart = await api.addToCart(storeId, productId, quantity);
      setCart(updatedCart);
      showToast('Item added to your basket!', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Could not add item to cart.', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    setLoading(true);
    try {
      const updatedCart = await api.updateCartItem(itemId, quantity);
      setCart(updatedCart);
    } catch (err: any) {
      showToast(err.message || 'Failed to update item quantity.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    setLoading(true);
    try {
      const updatedCart = await api.removeCartItem(itemId);
      setCart(updatedCart);
      showToast('Item removed from cart.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove item.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async (newStoreId?: string) => {
    setLoading(true);
    try {
      const updatedCart = await api.clearCart(newStoreId);
      setCart(updatedCart);
      showToast('Cart cleared.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to clear cart.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resolveConflict = async (replace: boolean) => {
    if (!conflictModal) return;
    const { newStoreId, pendingProductId } = conflictModal;
    setConflictModal(null);

    if (replace) {
      try {
        await api.clearCart(newStoreId);
        const updated = await api.addToCart(newStoreId, pendingProductId, 1);
        setCart(updated);
        showToast('Cart replaced with items from selected supermarket!', 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to update cart.', 'error');
      }
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        isOpen,
        setIsOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
        conflictModal,
        resolveConflict,
        toast,
        hideToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
