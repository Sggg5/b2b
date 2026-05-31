const AI_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders() });
}

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => ({}));
  const question = String(body.question || "").trim();

  if (!question) {
    return json({ error: "问题不能为空" }, 400);
  }

  const context = {
    products: safeArray(body.products).slice(0, 6),
    posts: safeArray(body.posts).slice(0, 5),
    downloads: safeArray(body.downloads).slice(0, 6)
  };

  const external = await askExternalAiSearch(question, context, env);
  if (external) return json(normalizeResult(external, context, "ai-search"));

  const workersAi = await askWorkersAi(question, context, env);
  if (workersAi) return json(normalizeResult(workersAi, context, "workers-ai"));

  return json({
    answer: fallbackAnswer(question, context),
    ...context,
    source: "local"
  });
}

async function askExternalAiSearch(question, context, env) {
  const endpoint = env.AI_SEARCH_URL || env.SG_AI_ENDPOINT || "";
  if (!endpoint) return null;

  const headers = new Headers({ "content-type": "application/json" });
  const token = env.AI_SEARCH_TOKEN || env.SG_AI_TOKEN || "";
  if (token) headers.set("authorization", `Bearer ${token}`);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ question, ...context })
    });

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function askWorkersAi(question, context, env) {
  if (!env.AI) return null;

  try {
    const aiResponse = await env.AI.run(AI_MODEL, {
      messages: [
        {
          role: "system",
          content: "你是 FRANTA 工业管件选型助手。只基于给定产品、文章和资料回答，用简体中文，输出简洁工程建议。"
        },
        {
          role: "user",
          content: `用户需求：${question}\n\n可推荐产品：${JSON.stringify(context.products)}\n\n相关博客：${JSON.stringify(context.posts)}\n\n可下载资料：${JSON.stringify(context.downloads)}`
        }
      ],
      max_tokens: 900
    });

    return {
      answer: aiResponse?.response || aiResponse?.result?.response || aiResponse?.choices?.[0]?.message?.content || "",
      ...context
    };
  } catch {
    return null;
  }
}

function normalizeResult(result, context, source) {
  return {
    answer: result.answer || result.response || result.text || fallbackAnswer("", context),
    products: safeArray(result.products).length ? result.products : context.products,
    posts: safeArray(result.posts).length ? result.posts : context.posts,
    downloads: safeArray(result.downloads).length ? result.downloads : context.downloads,
    sources: safeArray(result.sources),
    source
  };
}

function fallbackAnswer(question, context) {
  const product = context.products[0];
  if (!product) {
    return "请补充公称通径、压力等级、连接方式和使用场景，系统会进一步匹配产品、技术文章与下载资料。";
  }

  return `根据“${question || "当前需求"}”，建议先核对 ${product.name}。重点确认 ${product.size || "规格"}、${product.pressure || "压力等级"} 与 ${product.connection || "连接方式"}，再下载 PDF/CAD 与现场图纸比对。`;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function json(data, status = 200) {
  return Response.json(data, { status, headers: corsHeaders() });
}

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization"
  };
}
