import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeCartLines } from "@/lib/cart-logic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("cart_items")
      .select(
        "id, product_id, quantity, updated_at, products(id, slug, name, price_kobo, image_url, stock, active)"
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("cart GET", error);
      return NextResponse.json({ error: "Failed to load cart" }, { status: 500 });
    }

    const items = (data ?? []).map((row) => {
      const p = row.products as unknown as {
        id: string;
        slug: string;
        name: string;
        price_kobo: number;
        image_url: string | null;
        stock: number;
        active: boolean;
      } | null;
      return {
        productId: row.product_id as string,
        quantity: row.quantity as number,
        slug: p?.slug ?? "",
        name: p?.name ?? "Product",
        price_kobo: p?.price_kobo ?? 0,
        image_url: p?.image_url ?? null,
        stock: p?.stock ?? 0,
        active: p?.active ?? false,
      };
    });

    return NextResponse.json({ items });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** Replace entire cart with provided lines (authenticated). */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { items?: { productId: string; quantity: number }[] };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const lines = normalizeCartLines(body.items ?? []);

    // Delete existing
    const { error: delErr } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (delErr) {
      console.error("cart PUT delete", delErr);
      return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
    }

    if (lines.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // Validate products exist
    const ids = lines.map((l) => l.productId);
    const { data: products } = await supabase
      .from("products")
      .select("id, stock, active")
      .in("id", ids);

    const valid = new Set(
      (products ?? []).filter((p) => p.active).map((p) => p.id as string)
    );

    const rows = lines
      .filter((l) => valid.has(l.productId))
      .map((l) => ({
        user_id: user.id,
        product_id: l.productId,
        quantity: l.quantity,
        updated_at: new Date().toISOString(),
      }));

    if (rows.length > 0) {
      const { error: insErr } = await supabase.from("cart_items").insert(rows);
      if (insErr) {
        console.error("cart PUT insert", insErr);
        return NextResponse.json({ error: "Failed to save cart" }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("cart DELETE", error);
      return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
