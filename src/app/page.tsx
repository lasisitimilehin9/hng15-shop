import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { FALLBACK_PRODUCTS } from "@/lib/fallback-products";

export default async function HomePage() {
  let products: Product[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("name")
      .limit(4);
    products = (data as Product[]) ?? [];
  } catch {
    products = [];
  }

  if (products.length === 0) {
    products = FALLBACK_PRODUCTS.slice(0, 4);
  }

  return (
    <div>
      <section className="bg-gradient-to-b from-[#e8f0ea] to-[#faf8f5] px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium uppercase tracking-widest text-[#2d5a3d]">
            From Osun State, Nigeria
          </p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl font-semibold leading-tight text-stone-900 sm:text-5xl">
            Natural body care, rooted in tradition
          </h1>
          <p className="mt-4 max-w-xl text-lg text-stone-600">
            Oriki Naturals makes pure shea butter, African black soap, and
            botanical oils the way our grandmothers did — with care, and without
            the fillers.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="rounded-full bg-[#2d5a3d] px-6 py-3 text-sm font-medium text-white hover:bg-[#244a32]"
            >
              Shop products
            </Link>
            <Link
              href="/cart"
              className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-800 hover:bg-stone-50"
            >
              View cart
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-serif text-2xl font-semibold text-stone-900">
            Featured products
          </h2>
          <Link href="/products" className="text-sm text-[#2d5a3d] hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
