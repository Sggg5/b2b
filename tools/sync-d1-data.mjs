import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const databaseName = process.env.D1_DATABASE || "b2b-db";
const mode = process.argv.includes("--remote") ? "--remote" : "--local";
const blogRoot = resolve(root, "..", "blog", "src", "content", "blog");
const productsCsvPath = resolve(root, "data", "products.csv");
const productsJsonPath = resolve(root, "data", "products.json");
const productAssetMapPath = resolve(root, "data", "product-asset-map.csv");
const productAssetMap = readProductAssetMap();

const products = readProducts();
const blogPosts = readBlogPosts(blogRoot);
const sql = [
  "DELETE FROM products;",
  ...products.map((product, index) => upsertProductSql(product, index)),
  "DELETE FROM blog_posts;",
  ...blogPosts.map(upsertBlogPostSql)
].join("\n");

const tempDir = mkdtempSync(join(tmpdir(), "b2b-d1-sync-"));
const sqlPath = join(tempDir, "sync.sql");

try {
  writeFileSync(sqlPath, sql, "utf8");
  const command = wranglerCommand();
  execFileSync(command.file, [...command.args, "d1", "execute", databaseName, mode, "--file", sqlPath], {
    cwd: root,
    stdio: "inherit"
  });
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

function wranglerCommand() {
  if (process.env.WRANGLER_BIN) {
    return { file: process.execPath, args: [process.env.WRANGLER_BIN] };
  }

  const pathDirs = String(process.env.PATH || "").split(process.platform === "win32" ? ";" : ":");
  for (const dir of pathDirs) {
    const candidate = join(dir, "node_modules", "wrangler", "bin", "wrangler.js");
    if (existsSync(candidate)) return { file: process.execPath, args: [candidate] };
  }

  return { file: "wrangler", args: [] };
}

function readProducts() {
  if (existsSync(productsCsvPath)) {
    return parseCsv(readFileSync(productsCsvPath, "utf8"))
      .map(normalizeProduct)
      .filter((product) => product.id && product.slug && product.name);
  }

  return JSON.parse(readFileSync(productsJsonPath, "utf8")).map(normalizeProduct);
}

function readProductAssetMap() {
  if (!existsSync(productAssetMapPath)) return new Map();

  const rows = parseCsv(readFileSync(productAssetMapPath, "utf8"));
  return new Map(
    rows
      .map((row) => [field(row, "name", "存货名称", "产品名称", "名称"), field(row, "asset_slug", "图片标识", "资源标识")])
      .filter(([name, assetSlug]) => name && assetSlug)
  );
}

function normalizeProduct(product) {
  const id = field(product, "id", "code", "存货编码", "编码", "产品编码");
  const name = field(product, "name", "存货名称", "产品名称", "名称");
  const size = field(product, "size", "规格型号", "规格", "型号");
  const category = field(product, "category", "存货大类", "存货大类名称", "分类", "产品分类") || inferCategory(name);
  const material = field(product, "material", "材质") || inferMaterial(`${name} ${size}`);
  const connection = field(product, "connection", "连接方式") || inferConnection(`${name} ${category}`);
  const slug = field(product, "slug", "网址标识", "SEO标识") || slugFromCode(id);
  const assetSlug = field(product, "asset_slug", "图片标识", "资源标识") || productAssetMap.get(name) || slugFromName(name) || slug;
  const stoppedAt = field(product, "停用日期", "stop_date");
  const selected = field(product, "选择", "selected");

  return {
    id,
    slug,
    name,
    category,
    material,
    size,
    pressure: field(product, "pressure", "压力等级", "压力") || inferPressure(size),
    connection,
    description: field(product, "description", "描述", "产品描述") || `${name}${size ? `，规格 ${size}` : ""}`,
    image: field(product, "image", "图片", "图片路径") || `/files/products/images/catalog/${assetSlug}.png`,
    pdf: field(product, "pdf", "PDF", "pdf", "PDF路径") || `/files/products/pdf/${assetSlug}.pdf`,
    cad: field(product, "cad", "CAD", "cad", "CAD路径") || `/files/products/cad/${assetSlug}.dwg`,
    active: activeValue(field(product, "active", "启用", "是否启用"), stoppedAt, selected)
  };
}

function field(record, ...names) {
  for (const name of names) {
    if (record[name] !== undefined && String(record[name]).trim() !== "") return String(record[name]).trim();
  }
  return "";
}

function slugFromCode(code = "") {
  return String(code).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "";
}

function slugFromName(name = "") {
  const normalized = String(name).trim().toLowerCase();
  if (!normalized) return "";

  const direct = {
    "不锈钢管": "stainless-pipe",
    "覆塑管": "coated-pipe",
    "保温管": "insulated-pipe",
    "沟槽等径对接": "grooved-coupling",
    "沟槽异径对接": "grooved-reducing-coupling",
    "沟槽90°弯头": "grooved-90-elbow",
    "沟槽45°弯头": "grooved-45-elbow",
    "沟槽等径三通": "grooved-tee",
    "沟槽异径三通": "grooved-reducing-tee",
    "环压等径对接": "press-coupling",
    "环压异径对接": "press-reducing-coupling",
    "环压A型45°弯头": "press-a-45-elbow",
    "环压A型90°弯头": "press-a-90-elbow",
    "环压B型45°弯头": "press-b-45-elbow",
    "环压B型90°弯头": "press-b-90-elbow",
    "环压等径三通": "press-tee",
    "环压异径三通": "press-reducing-tee",
    "双卡等径对接": "double-press-coupling",
    "单卡等径对接": "single-press-coupling"
  };

  const key = normalized.replace(/\s+/g, "");
  if (direct[key]) return direct[key];

  return encodeURIComponent(normalized)
    .replace(/%/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "";
}

function activeValue(value, stoppedAt, selected) {
  if (stoppedAt && !/^#+$/.test(stoppedAt)) return 0;
  if (selected && selected !== "是" && selected.toLowerCase() !== "yes") return 0;
  if (value === "") return 1;
  return value === "1" || value === "是" || value.toLowerCase() === "true" ? 1 : 0;
}

function inferMaterial(text = "") {
  const upper = text.toUpperCase();
  if (upper.includes("316L")) return "SUS316L";
  if (upper.includes("304L")) return "SUS304L";
  if (upper.includes("304")) return "SUS304";
  if (upper.includes("201")) return "SUS201";
  return "";
}

function inferPressure(text = "") {
  const match = String(text).match(/PN\s*\d+|P\s*=\s*[\d.]+\s*MPA|[\d.]+\s*MPA/i);
  return match ? match[0].replace(/\s+/g, "") : "";
}

function inferConnection(text = "") {
  if (text.includes("沟槽")) return "沟槽连接";
  if (text.includes("双卡") || text.includes("卡压")) return "卡压连接";
  if (text.includes("法兰")) return "法兰连接";
  if (text.includes("螺纹") || text.includes("丝")) return "螺纹连接";
  return "";
}

function inferCategory(text = "") {
  if (text.includes("沟槽")) return "沟槽管件";
  if (text.includes("双卡")) return "双卡压管件";
  if (text.includes("单卡")) return "单卡压管件";
  if (text.includes("管")) return "不锈钢管";
  return "其它";
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  const [headers = [], ...records] = rows.filter((record) => record.some((value) => value.trim()));
  const keys = headers.map((header) => header.trim().replace(/^\uFEFF/, ""));

  return records.map((record) => Object.fromEntries(keys.map((key, index) => [key, record[index]?.trim() || ""])));
}

function readBlogPosts(dir) {
  let files = [];
  try {
    files = readdirSync(dir).filter((file) => /\.mdx?$/i.test(file));
  } catch {
    return [];
  }

  return files.map((file) => {
    const fullPath = join(dir, file);
    const markdown = readFileSync(fullPath, "utf8");
    const meta = parseFrontmatter(markdown);
    const slug = file.replace(/\.(md|mdx)$/i, "");

    return {
      slug,
      title: meta.title || slug,
      summary: meta.description || firstParagraph(markdown),
      date: meta.pubDate || meta.date || "",
      tags: meta.tags || [],
      href: `https://blog.sggg.cc.cd/blog/${encodeURIComponent(slug)}/`,
      sourcePath: fullPath
    };
  });
}

function parseFrontmatter(markdown = "") {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return { tags: [] };

  const meta = { tags: [] };
  let currentKey = "";

  for (const line of match[1].split(/\r?\n/)) {
    const listItem = line.match(/^\s*-\s*(.+)$/);
    if (listItem && currentKey === "tags") {
      meta.tags.push(cleanValue(listItem[1]));
      continue;
    }

    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;

    currentKey = pair[1];
    const value = pair[2].trim();

    if (currentKey === "tags") {
      meta.tags = parseTags(value);
    } else {
      meta[currentKey] = cleanValue(value);
    }
  }

  return meta;
}

function parseTags(value) {
  if (!value) return [];
  if (value.startsWith("[") && value.endsWith("]")) {
    return value.slice(1, -1).split(",").map(cleanValue).filter(Boolean);
  }
  return [cleanValue(value)].filter(Boolean);
}

function cleanValue(value = "") {
  return String(value).trim().replace(/^["']|["']$/g, "");
}

function firstParagraph(markdown = "") {
  return markdown
    .replace(/^---[\s\S]*?---/, "")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .find((part) => part && !part.startsWith("#")) || "";
}

function upsertProductSql(product, index) {
  return `INSERT INTO products (${[
    "id", "slug", "name", "category", "material", "size", "pressure", "connection",
    "description", "image", "pdf", "cad", "sort_order", "active", "updated_at"
  ].join(", ")}) VALUES (${[
    product.id,
    product.slug,
    product.name,
    product.category,
    product.material,
    product.size,
    product.pressure,
    product.connection,
    product.description,
    product.image,
    product.pdf,
    product.cad,
    index,
    product.active,
    new Date().toISOString()
  ].map(sqlValue).join(", ")});`;
}

function upsertBlogPostSql(post) {
  return `INSERT INTO blog_posts (${[
    "slug", "title", "summary", "date", "tags_json", "href", "source_path", "active", "updated_at"
  ].join(", ")}) VALUES (${[
    post.slug,
    post.title,
    post.summary,
    post.date,
    JSON.stringify(post.tags),
    post.href,
    post.sourcePath,
    1,
    new Date().toISOString()
  ].map(sqlValue).join(", ")});`;
}

function sqlValue(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}
