import type { CartItem } from "./types";

export type CartLineInput = { productId: string; quantity: number };

/** Normalize and merge cart lines by productId (last quantity wins if duplicate ids). */
export function normalizeCartLines(
  items: CartLineInput[]
): CartLineInput[] {
  const map = new Map<string, number>();
  for (const item of items) {
    if (!item.productId || typeof item.quantity !== "number") continue;
    const q = Math.floor(item.quantity);
    if (q < 1 || q > 99) continue;
    map.set(item.productId, q);
  }
  return Array.from(map.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

/** Merge local + server: sum quantities, cap at 99. */
export function mergeCartLines(
  local: CartLineInput[],
  server: CartLineInput[]
): CartLineInput[] {
  const map = new Map<string, number>();
  for (const item of [...server, ...local]) {
    if (!item.productId) continue;
    const q = Math.max(0, Math.min(99, Math.floor(item.quantity || 0)));
    if (q < 1) continue;
    map.set(item.productId, Math.min(99, (map.get(item.productId) || 0) + q));
  }
  return Array.from(map.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

export function cartItemsToLines(items: CartItem[]): CartLineInput[] {
  return items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
}
