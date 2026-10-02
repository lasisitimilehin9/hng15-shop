import ProductCard from "@/components/ProductCard";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { FALLBACK_PRODUCTS } from "@/lib/fallback-products";

export const metadata = { title: "Shop" };

export default async function ProductsPage() {
  let products: Product[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("name");
    products = (data as Product[]) ?? [];
  } catch {
    products = [];
  }

  if (products.length === 0) {
    products = FALLBACK_PRODUCTS;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-stone-900">
        Shop all products
      </h1>
      <p className="mt-2 text-stone-600">
        Natural formulations made in small batches in Osun State.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
