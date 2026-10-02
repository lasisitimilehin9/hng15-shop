import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
    }

    return NextResponse.json({ orders: orders ?? [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
