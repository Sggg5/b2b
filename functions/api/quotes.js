export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders() });
}

export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return json({ error: "D1 binding DB is not configured" }, 501);
  }

  const token = new URL(request.url).searchParams.get("token") || "";
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
    return json({ error: "Unauthorized" }, 401);
  }

  const result = await env.DB.prepare(
    "SELECT * FROM quotes ORDER BY created_at DESC LIMIT 200"
  ).all();

  const quotes = (result.results || []).map((quote) => ({
    ...quote,
    products: safeJson(quote.products_json, [])
  }));

  return json({ quotes });
}

export async function onRequestPost({ env, request }) {
  if (!env.DB) {
    return json({ error: "D1 binding DB is not configured" }, 501);
  }

  const body = await request.json().catch(() => ({}));
  const company = String(body.company || "").trim();
  const contact = String(body.contact || "").trim();
  const phoneEmail = String(body.phoneEmail || body.phone_email || "").trim();
  const message = String(body.message || "").trim();
  const products = Array.isArray(body.products) ? body.products : [];

  if (!company || !contact || !phoneEmail) {
    return json({ error: "请填写公司名称、联系人和电话/邮箱" }, 400);
  }

  const result = await env.DB.prepare(
    `INSERT INTO quotes (company, contact, phone_email, message, products_json, source)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(company, contact, phoneEmail, message, JSON.stringify(products), "b2b").run();

  return json({ ok: true, id: result.meta?.last_row_id || null }, 201);
}

function safeJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function json(data, status = 200) {
  return Response.json(data, { status, headers: corsHeaders() });
}

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization"
  };
}
