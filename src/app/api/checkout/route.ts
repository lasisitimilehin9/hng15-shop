import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderConfirmationEmail } from "@/lib/mailgun";

type BodyItem = { productId: string; quantity: number };

function orderRef() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ON-${t}-${r}`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: {
      customer_name?: string;
      customer_email?: string;
      customer_phone?: string;
      shipping_address?: string;
      shipping_city?: string;
      shipping_state?: string;
      notes?: string;
      items?: BodyItem[];
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      shipping_city,
      shipping_state,
      notes,
      items,
    } = body;

    if (
      !customer_name?.trim() ||
      !customer_email?.trim() ||
      !customer_phone?.trim() ||
      !shipping_address?.trim() ||
      !shipping_city?.trim() ||
      !shipping_state?.trim() ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required checkout fields" },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (
        !item.productId ||
        typeof item.quantity !== "number" ||
        item.quantity < 1 ||
        item.quantity > 99
      ) {
        return NextResponse.json({ error: "Invalid cart items" }, { status: 400 });
      }
    }

    const productIds = items.map((i) => i.productId);
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("id, name, price_kobo, stock, active")
      .in("id", productIds);

    if (prodErr || !products || products.length === 0) {
      return NextResponse.json(
        {
          error:
            "Could not load products. Ensure the database is set up and products are seeded.",
        },
        { status: 400 }
      );
    }

    const byId = new Map(products.map((p) => [p.id, p]));
    const lineItems: {
      product_id: string;
      product_name: string;
      unit_price_kobo: number;
      quantity: number;
      line_total_kobo: number;
    }[] = [];

    let totalKobo = 0;
    for (const item of items) {
      const p = byId.get(item.productId);
      if (!p || !p.active) {
        return NextResponse.json(
          { error: "One or more products are unavailable" },
          { status: 400 }
        );
      }
      if (p.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${p.name}` },
          { status: 400 }
        );
      }
      const line = p.price_kobo * item.quantity;
      totalKobo += line;
      lineItems.push({
        product_id: p.id,
        product_name: p.name,
        unit_price_kobo: p.price_kobo,
        quantity: item.quantity,
        line_total_kobo: line,
      });
    }

    const ref = orderRef();
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_ref: ref,
        status: "confirmed",
        customer_name: customer_name.trim(),
        customer_email: customer_email.trim().toLowerCase(),
        customer_phone: customer_phone.trim(),
        shipping_address: shipping_address.trim(),
        shipping_city: shipping_city.trim(),
        shipping_state: shipping_state.trim(),
        notes: notes?.trim() || null,
        total_kobo: totalKobo,
      })
      .select("id, order_ref, created_at")
      .single();

    if (orderErr || !order) {
      console.error("order insert", orderErr);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    const { error: itemsErr } = await supabase.from("order_items").insert(
      lineItems.map((li) => ({
        order_id: order.id,
        ...li,
      }))
    );

    if (itemsErr) {
      console.error("order items insert", itemsErr);
      return NextResponse.json(
        { error: "Failed to save order items" },
        { status: 500 }
      );
    }

    // Stock decrement via service role (no client product UPDATE policy)
    try {
      const admin = createAdminClient();
      for (const item of items) {
        const p = byId.get(item.productId)!;
        const { error: stockErr } = await admin.rpc("decrement_product_stock", {
          p_product_id: p.id,
          p_qty: item.quantity,
        });
        if (stockErr) {
          // Fallback direct update with service role if RPC not migrated yet
          await admin
            .from("products")
            .update({ stock: Math.max(0, p.stock - item.quantity) })
            .eq("id", p.id);
        }
      }
    } catch (stockEx) {
      console.error("stock decrement failed", stockEx);
    }

    // Clear server cart for this user after successful order
    await supabase.from("cart_items").delete().eq("user_id", user.id);

    await sendOrderConfirmationEmail({
      to: customer_email.trim(),
      customerName: customer_name.trim(),
      orderRef: ref,
      items: lineItems.map((li) => ({
        name: li.product_name,
        quantity: li.quantity,
        lineTotalKobo: li.line_total_kobo,
      })),
      totalKobo,
      orderDate: new Date(order.created_at).toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      shippingAddress: `${shipping_address.trim()}, ${shipping_city.trim()}, ${shipping_state.trim()}`,
    });

    return NextResponse.json({
      order_id: order.id,
      order_ref: order.order_ref,
    });
  } catch (e) {
    console.error("checkout error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
