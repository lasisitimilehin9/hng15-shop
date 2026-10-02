"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const totalItems = useCartStore((s) => s.totalItems());
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-[#faf8f5]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="font-serif text-xl font-semibold text-[#2d5a3d]">
          Oriki Naturals
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-stone-700 md:flex">
          <Link href="/products" className="hover:text-[#2d5a3d]">
            Shop
          </Link>
          <Link href="/orders" className="hover:text-[#2d5a3d]">
            My Orders
          </Link>
          <Link href="/cart" className="relative hover:text-[#2d5a3d]">
            Cart
            {totalItems > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2d5a3d] px-1.5 text-xs text-white">
                {totalItems}
              </span>
            )}
          </Link>
          {loading ? (
            <span className="text-stone-400">…</span>
          ) : user ? (
            <button
              type="button"
              onClick={signOut}
              className="rounded-full border border-stone-300 px-3 py-1.5 hover:bg-stone-100"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[#2d5a3d] px-3 py-1.5 text-white hover:bg-[#244a32]"
            >
              Sign in
            </Link>
          )}
        </nav>

        <button
          type="button"
          className="rounded-md p-2 md:hidden"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-stone-200 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            <Link href="/products" onClick={() => setOpen(false)}>
              Shop
            </Link>
            <Link href="/orders" onClick={() => setOpen(false)}>
              My Orders
            </Link>
            <Link href="/cart" onClick={() => setOpen(false)}>
              Cart ({totalItems})
            </Link>
            {user ? (
              <button type="button" onClick={signOut} className="text-left">
                Sign out
              </button>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)}>
                Sign in with Google
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
