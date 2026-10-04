import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Upsert one cart line */
export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { productId?: string; quantity?: number };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const productId = body.productId;
    const quantity = Math.floor(Number(body.quantity) || 0);
    if (!productId || quantity < 1 || quantity > 99) {
      return NextResponse.json({ error: "Invalid item" }, { status: 400 });
    }

    const { data: product } = await supabase
      .from("products")
      .select("id, active, stock")
      .eq("id", productId)
      .maybeSingle();

    if (!product?.active) {
      return NextResponse.json({ error: "Product unavailable" }, { status: 400 });
    }

    const qty = Math.min(quantity, product.stock || 99);

    const { error } = await supabase.from("cart_items").upsert(
      {
        user_id: user.id,
        product_id: productId,
        quantity: qty,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,product_id" }
    );

    if (error) {
      console.error("cart item POST", error);
      return NextResponse.json({ error: "Failed to upsert item" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, productId, quantity: qty });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** Set quantity for one product */
export async function PATCH(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { productId?: string; quantity?: number };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const productId = body.productId;
    const quantity = Math.floor(Number(body.quantity) || 0);
    if (!productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }

    if (quantity <= 0) {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
      if (error) {
        return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
      }
      return NextResponse.json({ ok: true, removed: true });
    }

    const q = Math.min(99, quantity);
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: q, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (error) {
      return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, productId, quantity: q });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** Remove one product from cart */
export async function DELETE(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const productId = request.nextUrl.searchParams.get("productId");
    if (!productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (error) {
      return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
