"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/lib/cart-store";

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="flex items-center gap-2 text-sm text-stone-600">
        Qty
        <input
          type="number"
          min={1}
          max={Math.min(product.stock, 20)}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          className="w-16 rounded-lg border border-stone-300 px-2 py-1.5"
        />
      </label>
      <button
        type="button"
        onClick={handleAdd}
        disabled={product.stock < 1}
        className="rounded-full bg-[#2d5a3d] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#244a32] disabled:cursor-not-allowed disabled:bg-stone-300"
      >
        {product.stock < 1 ? "Out of stock" : added ? "Added ✓" : "Add to cart"}
      </button>
    </div>
  );
}
