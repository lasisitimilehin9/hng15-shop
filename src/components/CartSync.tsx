"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/cart-store";
import { mergeCartLines } from "@/lib/cart-logic";
import type { CartItem } from "@/lib/types";

/**
 * Auth-aware cart bridge:
 * - Logged out: localStorage only (serverSync=false)
 * - Login: one-shot GET → merge guest local with server → PUT → enable serverSync
 * - Logout / user switch: disable sync, clear local items (no cross-account leak)
 * - TOKEN_REFRESHED does not re-merge (would loop / inflate quantities)
 */
export default function CartSync() {
  const setItems = useCartStore((s) => s.setItems);
  const setServerSync = useCartStore((s) => s.setServerSync);
  const activeUserId = useRef<string | null>(null);
  const hydrating = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;

    async function hydrateForUser(userId: string) {
      if (hydrating.current) return;
      hydrating.current = true;
      // Prevent mutation pushes while we load/merge
      setServerSync(false);

      try {
        const res = await fetch("/api/cart");
        if (cancelled) return;

        if (!res.ok) {
          // Still mark this user as active; mutations will retry PUT
          activeUserId.current = userId;
          setServerSync(true);
          return;
        }

        const data = (await res.json()) as {
          items?: Array<{
            productId: string;
            quantity: number;
            slug: string;
            name: string;
            price_kobo: number;
            image_url: string | null;
          }>;
        };

        const serverItems = data.items ?? [];
        // Local at this point should be guest cart only (we clear on logout)
        const local = useCartStore.getState().items;

        const mergedLines = mergeCartLines(
          local.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          serverItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          }))
        );

        const byId = new Map<string, CartItem>();
        for (const s of serverItems) {
          byId.set(s.productId, {
            productId: s.productId,
            slug: s.slug,
            name: s.name,
            price_kobo: s.price_kobo,
            image_url: s.image_url,
            quantity: s.quantity,
          });
        }
        for (const l of local) {
          if (!byId.has(l.productId)) byId.set(l.productId, l);
        }

        const next: CartItem[] = mergedLines.map((line) => {
          const base = byId.get(line.productId);
          return {
            productId: line.productId,
            slug: base?.slug ?? "",
            name: base?.name ?? "Product",
            price_kobo: base?.price_kobo ?? 0,
            image_url: base?.image_url ?? null,
            quantity: line.quantity,
          };
        });

        if (cancelled) return;

        setItems(next);
        activeUserId.current = userId;

        const putRes = await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: next.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
            })),
          }),
        });

        if (!putRes.ok) {
          console.error("cart hydrate PUT failed", putRes.status);
        }

        if (!cancelled) setServerSync(true);
      } catch (e) {
        console.error("cart hydrate error", e);
        if (!cancelled) {
          activeUserId.current = userId;
          setServerSync(true);
        }
      } finally {
        hydrating.current = false;
      }
    }

    function handleSignedOut() {
      activeUserId.current = null;
      setServerSync(false);
      // Drop server-backed cart so the next account cannot see it
      setItems([]);
    }

    async function onUser(userId: string | null) {
      if (cancelled) return;
      if (!userId) {
        handleSignedOut();
        return;
      }
      if (activeUserId.current === userId) {
        // Same user (e.g. token refresh) — do not re-merge
        return;
      }
      // Different user or first login
      if (activeUserId.current && activeUserId.current !== userId) {
        setItems([]);
        setServerSync(false);
      }
      await hydrateForUser(userId);
    }

    async function run() {
      const supabase = createClient();
      if (!supabase) {
        setServerSync(false);
        return;
      }

      const { data } = await supabase.auth.getUser();
      await onUser(data.user?.id ?? null);

      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        // Ignore token refresh / user updates that are the same session
        if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          return;
        }
        if (event === "SIGNED_OUT") {
          void onUser(null);
          return;
        }
        // SIGNED_IN, INITIAL_SESSION
        void onUser(session?.user?.id ?? null);
      });
      unsub = () => sub.subscription.unsubscribe();
    }

    void run();
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [setItems, setServerSync]);

  return null;
}
