export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return json({ error: "D1 binding DB is not configured" }, 501);
  }

  const url = new URL(request.url);
  const limit = Math.max(1, Math.min(Number(url.searchParams.get("limit") || 3), 12));
  const random = url.searchParams.get("random") !== "false";
  const order = random ? "RANDOM()" : "date DESC";

  const result = await env.DB.prepare(
    `SELECT slug, title, summary, date, tags_json, href FROM blog_posts WHERE active = 1 ORDER BY ${order} LIMIT ?`
  ).bind(limit).all();

  const posts = (result.results || []).map((post) => ({
    ...post,
    tags: safeJson(post.tags_json, [])
  }));

  return json({ posts });
}

function safeJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function json(data, status = 200) {
  return Response.json(data, { status });
}
