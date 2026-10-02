"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { formatNaira } from "@/lib/types";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const totalKobo = useCartStore((s) => s.totalKobo());

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-serif text-3xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-stone-600">Add something lovely from the shop.</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-[#2d5a3d] px-6 py-3 text-sm text-white"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold">Cart</h1>
      <ul className="mt-8 divide-y divide-stone-200">
        {items.map((item) => (
          <li key={item.productId} className="flex gap-4 py-6">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image_url || ""}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex justify-between gap-2">
                <Link
                  href={`/products/${item.slug}`}
                  className="font-medium hover:text-[#2d5a3d]"
                >
                  {item.name}
                </Link>
                <p className="font-medium">
                  {formatNaira(item.price_kobo * item.quantity)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  Qty
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={item.quantity}
                    onChange={(e) =>
                      setQuantity(item.productId, Number(e.target.value) || 1)
                    }
                    className="w-16 rounded border border-stone-300 px-2 py-1"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="text-sm text-red-700 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-6">
        <p className="text-lg font-semibold">Total: {formatNaira(totalKobo)}</p>
        <Link
          href="/checkout"
          className="rounded-full bg-[#2d5a3d] px-6 py-3 text-sm font-medium text-white hover:bg-[#244a32]"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}
