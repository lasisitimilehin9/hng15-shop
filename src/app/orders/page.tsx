"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatNaira, type OrderWithItems } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

function OrdersContent() {
  const searchParams = useSearchParams();
  const successRef = searchParams.get("ref");
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (!data.user) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/orders");
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Failed to load orders");
        } else {
          setOrders(json.orders || []);
        }
      } catch {
        setError("Network error loading orders");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-stone-500">
        Loading orders…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-serif text-3xl font-semibold">Your orders</h1>
        <p className="mt-2 text-stone-600">Sign in to view your order history.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-[#2d5a3d] px-6 py-3 text-sm text-white"
        >
          Sign in with Google
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold">My orders</h1>

      {successRef && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          Order <strong>{successRef}</strong> placed successfully. A confirmation
          email is on its way (when Mailgun is configured).
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {!error && orders.length === 0 && (
        <p className="mt-8 text-stone-600">
          No orders yet.{" "}
          <Link href="/products" className="text-[#2d5a3d] underline">
            Start shopping
          </Link>
        </p>
      )}

      <ul className="mt-8 space-y-6">
        {orders.map((order) => (
          <li
            key={order.id}
            className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-stone-900">{order.order_ref}</p>
                <p className="text-sm text-stone-500">
                  {new Date(order.created_at).toLocaleString("en-NG")}
                </p>
              </div>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-stone-700">
                {order.status}
              </span>
            </div>
            <ul className="mt-4 space-y-1 text-sm text-stone-700">
              {(order.order_items || []).map((item) => (
                <li key={item.id} className="flex justify-between gap-2">
                  <span>
                    {item.product_name} × {item.quantity}
                  </span>
                  <span>{formatNaira(item.line_total_kobo)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-stone-100 pt-3 text-right font-semibold">
              Total {formatNaira(order.total_kobo)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-16 text-center text-stone-500">
          Loading…
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
