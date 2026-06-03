export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return json({ error: "D1 binding DB is not configured" }, 501);
  }

  const url = new URL(request.url);
  const category = url.searchParams.get("category") || "";
  const query = url.searchParams.get("q") || "";

  const clauses = ["active = 1"];
  const values = [];

  if (category) {
    clauses.push("category = ?");
    values.push(category);
  }

  if (query) {
    clauses.push("(name LIKE ? OR category LIKE ? OR material LIKE ? OR description LIKE ?)");
    values.push(...Array(4).fill(`%${query}%`));
  }

  const result = await env.DB.prepare(
    `SELECT * FROM products WHERE ${clauses.join(" AND ")} ORDER BY sort_order ASC, id ASC`
  ).bind(...values).all();

  return json({ products: result.results || [] });
}

function json(data, status = 200) {
  return Response.json(data, { status });
}
