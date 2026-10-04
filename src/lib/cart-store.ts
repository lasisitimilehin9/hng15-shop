"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "./types";
import type { CartLineInput } from "./cart-logic";

type CartState = {
  items: CartItem[];
  /** When true, mutations also push to /api/cart (authenticated). */
  serverSync: boolean;
  /** Last server push error message, if any. */
  syncError: string | null;
  setServerSync: (v: boolean) => void;
  setItems: (items: CartItem[]) => void;
  addItem: (product: Product, qty?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  totalItems: () => number;
  totalKobo: () => number;
  toLines: () => CartLineInput[];
};

async function pushCartToServer(
  items: CartItem[]
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      }),
    });
    if (!res.ok) {
      const msg = `Cart sync failed (${res.status})`;
      console.error(msg);
      return { ok: false, error: msg };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Cart sync network error";
    console.error(msg);
    return { ok: false, error: msg };
  }
}

function schedulePush(items: CartItem[]) {
  void pushCartToServer(items).then((r) => {
    useCartStore.setState({ syncError: r.ok ? null : r.error ?? "sync failed" });
  });
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      serverSync: false,
      syncError: null,
      setServerSync: (v) => set({ serverSync: v }),
      // Local-only replace (used by CartSync hydrate); does not push
      setItems: (items) => set({ items }),
      addItem: (product, qty = 1) => {
        const quantity = Math.max(1, Math.min(qty, product.stock || 99));
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          let items: CartItem[];
          if (existing) {
            items = state.items.map((i) =>
              i.productId === product.id
                ? {
                    ...i,
                    quantity: Math.min(
                      i.quantity + quantity,
                      product.stock || 99
                    ),
                  }
                : i
            );
          } else {
            items = [
              ...state.items,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price_kobo: product.price_kobo,
                image_url: product.image_url,
                quantity,
              },
            ];
          }
          if (state.serverSync) schedulePush(items);
          return { items };
        });
      },
      setQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => {
          const items = state.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(quantity, 99) }
              : i
          );
          if (state.serverSync) schedulePush(items);
          return { items };
        });
      },
      removeItem: (productId) =>
        set((state) => {
          const items = state.items.filter((i) => i.productId !== productId);
          if (state.serverSync) schedulePush(items);
          return { items };
        }),
      clear: () => {
        const sync = get().serverSync;
        set({ items: [] });
        if (sync) schedulePush([]);
      },
      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
      totalKobo: () =>
        get().items.reduce((s, i) => s + i.price_kobo * i.quantity, 0),
      toLines: () =>
        get().items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
    }),
    {
      name: "oriki-cart",
      // Never persist serverSync / syncError — auth drives that each session
      partialize: (state) => ({ items: state.items }),
    }
  )
);
