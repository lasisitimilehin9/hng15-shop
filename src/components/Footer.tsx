import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-stone-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} Oriki Naturals · Natural body care from
          Osun State, Nigeria
        </p>
        <div className="flex gap-4">
          <Link href="/products" className="hover:text-[#2d5a3d]">
            Shop
          </Link>
          <Link href="/orders" className="hover:text-[#2d5a3d]">
            Orders
          </Link>
        </div>
      </div>
    </footer>
  );
}
