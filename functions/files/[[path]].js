const allowedPrefixes = [
  "products/images/",
  "products/pdf/",
  "products/cad/"
];

const contentTypes = {
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".dwg": "application/acad",
  ".dxf": "image/vnd.dxf"
};

export async function onRequestGet({ env, params }) {
  const key = normalizePath(params.path);

  if (!key || !allowedPrefixes.some((prefix) => key.startsWith(prefix))) {
    return new Response("Not found", { status: 404 });
  }

  const object = await env.PRODUCT_BUCKET.get(key);

  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=3600");

  if (!headers.has("content-type")) {
    headers.set("content-type", contentTypeFor(key));
  }

  return new Response(object.body, { headers });
}

function normalizePath(path) {
  const value = Array.isArray(path) ? path.join("/") : path || "";
  const decoded = decodeURIComponent(value).replace(/^\/+/, "");

  if (!decoded || decoded.includes("..") || decoded.includes("\\")) {
    return "";
  }

  return decoded;
}

function contentTypeFor(key) {
  const extension = key.slice(key.lastIndexOf(".")).toLowerCase();
  return contentTypes[extension] || "application/octet-stream";
}
