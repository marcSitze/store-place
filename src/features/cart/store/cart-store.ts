import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // ProductVariant ID
  productId: string;
  name: string;
  image: string;
  price: number;
  discountPrice?: number;
  color?: string;
  size?: string;
  quantity: number;
  sku: string;
  stock: number;
}

export interface Coupon {
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minPurchase?: number;
}

interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  taxRate: number;
  shippingRate: number;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  getTotals: () => {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      taxRate: 0.08, // 8% sales tax
      shippingRate: 15, // Flat $15 shipping

      addItem: (newItem, quantity = 1) => {
        const items = [...get().items];
        const existing = items.find(i => i.id === newItem.id);

        if (existing) {
          existing.quantity = Math.min(existing.quantity + quantity, newItem.stock);
        } else {
          items.push({ ...newItem, quantity: Math.min(quantity, newItem.stock) });
        }

        set({ items });
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter(i => i.id !== variantId) });
      },

      updateQuantity: (variantId, quantity) => {
        const items = get().items.map(item => {
          if (item.id === variantId) {
            return { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) };
          }
          return item;
        });
        set({ items });
      },

      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),
      clearCart: () => set({ items: [], coupon: null }),

      getTotals: () => {
        const { items, coupon, taxRate, shippingRate } = get();
        const subtotal = items.reduce((sum, item) => {
          const price = item.discountPrice ?? item.price;
          return sum + price * item.quantity;
        }, 0);

        let discount = 0;
        if (coupon) {
          if (coupon.minPurchase === undefined || subtotal >= coupon.minPurchase) {
            if (coupon.type === 'PERCENTAGE') {
              discount = subtotal * (coupon.value / 100);
            } else {
              discount = coupon.value;
            }
          }
        }

        const discountedSubtotal = Math.max(0, subtotal - discount);
        const shipping = subtotal > 150 || subtotal === 0 ? 0 : shippingRate;
        const tax = discountedSubtotal * taxRate;
        const total = discountedSubtotal + shipping + tax;

        return {
          subtotal,
          discount,
          tax,
          shipping,
          total,
        };
      },
    }),
    {
      name: 'ecommerce-cart-storage',
    }
  )
);
