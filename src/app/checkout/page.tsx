"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { createClient } from "@/lib/supabase/client";
import { formatNaira } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara",
];

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const totalKobo = useCartStore((s) => s.totalKobo());
  const clear = useCartStore((s) => s.clear);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthLoading(false);
    });
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!user) {
      setError("Please sign in before checking out.");
      return;
    }
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const form = new FormData(e.currentTarget);
    const payload = {
      customer_name: String(form.get("name") || "").trim(),
      customer_email: String(form.get("email") || "").trim(),
      customer_phone: String(form.get("phone") || "").trim(),
      shipping_address: String(form.get("address") || "").trim(),
      shipping_city: String(form.get("city") || "").trim(),
      shipping_state: String(form.get("state") || "").trim(),
      notes: String(form.get("notes") || "").trim(),
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    };

    if (
      !payload.customer_name ||
      !payload.customer_email ||
      !payload.customer_phone ||
      !payload.shipping_address ||
      !payload.shipping_city ||
      !payload.shipping_state
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Checkout failed");
        setSubmitting(false);
        return;
      }
      clear();
      router.push(`/orders?ref=${encodeURIComponent(data.order_ref)}`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-stone-500">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-serif text-3xl font-semibold">Sign in to checkout</h1>
        <p className="mt-2 text-stone-600">
          We need your Google account to save your order securely.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-[#2d5a3d] px-6 py-3 text-sm text-white"
        >
          Sign in with Google
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-serif text-3xl font-semibold">Nothing to checkout</h1>
        <Link href="/products" className="mt-4 inline-block text-[#2d5a3d]">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold">Checkout</h1>
      <p className="mt-1 text-stone-600">
        Order total: <strong>{formatNaira(totalKobo)}</strong>
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Full name *
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={user.user_metadata?.full_name || ""}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={user.email || ""}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium">
            Phone *
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="0803 000 0000"
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium">
            Street address *
          </label>
          <input
            id="address"
            name="address"
            required
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="city" className="block text-sm font-medium">
              City *
            </label>
            <input
              id="city"
              name="city"
              required
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium">
              State *
            </label>
            <select
              id="state"
              name="state"
              required
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
            >
              <option value="" disabled>
                Select
              </option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium">
            Order notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-[#2d5a3d] py-3 text-sm font-medium text-white hover:bg-[#244a32] disabled:opacity-60"
        >
          {submitting ? "Placing order…" : "Place order"}
        </button>
      </form>
    </div>
  );
}
