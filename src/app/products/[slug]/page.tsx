import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { formatNaira } from "@/lib/types";
import { FALLBACK_PRODUCTS } from "@/lib/fallback-products";

type Props = { params: Promise<{ slug: string }> };

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();
    if (data) return data as Product;
  } catch {
    /* fall through */
  }
  return FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: product?.name ?? "Product" };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/products" className="text-sm text-[#2d5a3d] hover:underline">
        ← Back to shop
      </Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl bg-stone-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              product.image_url ||
              "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80"
            }
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-stone-500">
            {product.category}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-stone-900">
            {product.name}
          </h1>
          <p className="mt-3 text-2xl font-semibold text-[#2d5a3d]">
            {formatNaira(product.price_kobo)}
          </p>
          <p className="mt-6 leading-relaxed text-stone-600">
            {product.description}
          </p>
          <p className="mt-4 text-sm text-stone-500">
            {product.stock > 0
              ? `${product.stock} in stock`
              : "Currently out of stock"}
          </p>
          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
