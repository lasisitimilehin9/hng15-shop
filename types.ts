export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_kobo: number;
  image_url: string | null;
  category: string;
  stock: number;
  active: boolean;
  created_at?: string;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price_kobo: number;
  image_url: string | null;
  quantity: number;
};

export type Order = {
  id: string;
  user_id: string;
  order_ref: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  notes: string | null;
  total_kobo: number;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price_kobo: number;
  quantity: number;
  line_total_kobo: number;
};

export type OrderWithItems = Order & {
  order_items: OrderItem[];
};

export function formatNaira(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(kobo / 100);
}
