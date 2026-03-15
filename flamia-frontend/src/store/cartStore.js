import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      // ── Actions ───────────────────────────────

      addItem: (product) => {
        set((state) => {
          const productId = product.productId || product.id;
          const existingIndex = state.items.findIndex(
            (item) => item.productId === productId
          );

          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + 1,
            };
            return { items: updated };
          }

          return {
            items: [
              ...state.items,
              {
                productId,
                name: product.name,
                slug: product.slug,
                price: product.price,
                image: product.image || product.primaryImageUrl || product.images?.[0]?.url,
                quantity: 1,
                maxStock: product.maxStock || product.stockQuantity || 99,
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      // ── Computed (as functions) ──────────────────
      getItemCount: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
    }),
    {
      name: 'flamia-cart',
      version: 1,
    }
  )
);

export default useCartStore;
