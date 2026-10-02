type OrderEmailPayload = {
  to: string;
  customerName: string;
  orderRef: string;
  items: { name: string; quantity: number; lineTotalKobo: number }[];
  totalKobo: number;
  orderDate: string;
  shippingAddress: string;
};

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

export async function sendOrderConfirmationEmail(
  payload: OrderEmailPayload
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const from =
    process.env.MAILGUN_FROM_EMAIL ||
    `Oriki Naturals <orders@${domain || "example.com"}>`;
  const dryRun = process.env.MAILGUN_DRY_RUN === "true";

  const rows = payload.items
    .map(
      (i) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatNaira(i.lineTotalKobo)}</td></tr>`
    )
    .join("");

  const html = `
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1a1a">
    <h1 style="color:#2d5a3d;font-size:22px">Oriki Naturals</h1>
    <p>Hi ${payload.customerName},</p>
    <p>Thank you for your order. We have received it and will prepare your items shortly.</p>
    <p><strong>Order reference:</strong> ${payload.orderRef}<br/>
    <strong>Date:</strong> ${payload.orderDate}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <thead>
        <tr style="background:#f5f5f0">
          <th style="padding:8px;text-align:left">Item</th>
          <th style="padding:8px;text-align:center">Qty</th>
          <th style="padding:8px;text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="font-size:18px"><strong>Total: ${formatNaira(payload.totalKobo)}</strong></p>
    <p><strong>Ship to:</strong><br/>${payload.shippingAddress.replace(/\n/g, "<br/>")}</p>
    <p style="color:#666;font-size:13px">Questions? Reply to this email. — The Oriki Naturals team, Osun State, Nigeria</p>
  </div>`;

  if (dryRun || !apiKey || !domain) {
    console.info("[mailgun] dry-run or missing config", {
      to: payload.to,
      orderRef: payload.orderRef,
    });
    return { ok: true };
  }

  const body = new URLSearchParams();
  body.set("from", from);
  body.set("to", payload.to);
  body.set(
    "subject",
    `Order confirmed — ${payload.orderRef} | Oriki Naturals`
  );
  body.set("html", html);

  const auth = Buffer.from(`api:${apiKey}`).toString("base64");
  const res = await fetch(
    `https://api.mailgun.net/v3/${domain}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("[mailgun] send failed", res.status, text.slice(0, 200));
    return { ok: false, error: "Failed to send confirmation email" };
  }

  return { ok: true };
}
