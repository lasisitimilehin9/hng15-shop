"use client";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatNaira } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            product.image_url ||
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80"
          }
          alt={product.name}
          className="h-full w-full object-cover transition group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23e7e5e4' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23a8a29e' font-size='18'%3EOriki%3C/text%3E%3C/svg%3E";
          }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs uppercase tracking-wide text-stone-500">
          {product.category}
        </p>
        <h3 className="font-medium text-stone-900 group-hover:text-[#2d5a3d]">
          {product.name}
        </h3>
        <p className="mt-auto pt-2 font-semibold text-[#2d5a3d]">
          {formatNaira(product.price_kobo)}
        </p>
      </div>
    </Link>
  );
}
