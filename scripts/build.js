import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const products = JSON.parse(await readFile(path.join(root, "data/products.json"), "utf8"));

const categories = ["沟槽管件", "环压管件", "分水器", "不锈钢管", "法兰", "阀门配件"];
const materials = [...new Set(products.map((product) => product.material))];
const pressures = [...new Set(products.map((product) => product.pressure))];

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const jsonScript = (id, value) =>
  `<script type="application/json" id="${id}">${JSON.stringify(value).replaceAll("<", "\\u003c")}</script>`;

function page({ title, description, active, body, scripts = "" }) {
  const nav = [
    ["首页", "/"],
    ["产品中心", "/products/"],
    ["下载中心", "/downloads/"],
    ["询价单", "/quote/"]
  ];

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/" aria-label="返回首页">
      <span class="brand-mark">F</span>
      <span>
        <strong>Franta B2B</strong>
        <small>不锈钢管件产品中心</small>
      </span>
    </a>
    <nav class="top-nav" aria-label="主导航">
      ${nav
        .map(([label, href]) => `<a class="${active === label ? "active" : ""}" href="${href}">${label}</a>`)
        .join("")}
    </nav>
  </header>
  <main>
    ${body}
  </main>
  <footer class="site-footer">
    <div>
      <strong>Franta B2B</strong>
      <p>轻量静态产品中心，可平滑接入 Cloudflare Pages、R2 与 D1。</p>
    </div>
    <div class="footer-links">
      <a href="/products/">产品中心</a>
      <a href="/downloads/">下载中心</a>
      <a href="/quote/">询价单</a>
    </div>
  </footer>
  <script src="/assets/app.js" defer></script>
  ${scripts}
</body>
</html>`;
}

function productCard(product) {
  return `<article class="product-card" data-category="${escapeHtml(product.category)}" data-material="${escapeHtml(product.material)}" data-pressure="${escapeHtml(product.pressure)}" data-name="${escapeHtml(product.name)}">
  <a class="product-image" href="/products/${product.slug}/"><img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy"></a>
  <div class="product-content">
    <div class="product-title-row">
      <div>
        <div class="eyebrow">${escapeHtml(product.category)} · ${escapeHtml(product.id)}</div>
        <h3><a href="/products/${product.slug}/">${escapeHtml(product.name)}</a></h3>
      </div>
      <span class="stock-badge">可询价</span>
    </div>
    <p>${escapeHtml(product.description)}</p>
    <table class="spec-table compact">
      <tbody>
        <tr><th>材质</th><td>${escapeHtml(product.material)}</td><th>规格</th><td>${escapeHtml(product.size)}</td></tr>
        <tr><th>压力</th><td>${escapeHtml(product.pressure)}</td><th>连接</th><td>${escapeHtml(product.connection)}</td></tr>
      </tbody>
    </table>
    <div class="card-actions">
      <a class="button ghost" href="/products/${product.slug}/">查看参数</a>
      <button class="button" data-add-quote="${escapeHtml(product.slug)}">加入询价单</button>
    </div>
  </div>
</article>`;
}

function homePage() {
  return page({
    title: "Franta B2B | 工业不锈钢管件与博客",
    description: "Franta 轻量 B2B 网站，包含博客入口、产品中心、下载中心与询价单。",
    active: "首页",
    body: `<section class="hero">
  <div class="hero-copy">
    <p class="eyebrow">工业管路 · 选型 · 询价</p>
    <h1>不锈钢管件产品资料，一站式查找和询价</h1>
    <p>按分类、材质、压力和连接方式快速筛选，适合轻量 B2B 官网与现有博客一起部署。</p>
    <div class="hero-actions">
      <a class="button large" href="/products/">进入产品中心</a>
      <a class="button ghost large" href="/downloads/">下载资料</a>
    </div>
  </div>
  <div class="hero-panel" aria-label="产品分类概览">
    ${categories.map((category) => `<a href="/products/?category=${encodeURIComponent(category)}">${category}<span>${products.filter((product) => product.category === category).length} 款</span></a>`).join("")}
  </div>
</section>
<section class="section">
  <div class="section-heading">
    <p class="eyebrow">Blog</p>
    <h2>博客功能保留</h2>
    <p>当前仓库尚未包含博客源文件；新增页面采用独立静态结构，后续可与 Markdown 博客列表并行。</p>
  </div>
</section>`
  });
}

function productsPage() {
  return page({
    title: "产品中心 | Franta B2B",
    description: "沟槽管件、环压管件、分水器、不锈钢管、法兰、阀门配件产品筛选与询价。",
    active: "产品中心",
    body: `<section class="page-head">
  <p class="eyebrow">Products</p>
  <h1>产品中心</h1>
  <p>像工业版米思米一样按清晰分类和核心参数筛选，先选型，再加入询价单。</p>
</section>
<section class="catalog-layout">
  <aside class="filters" aria-label="产品筛选">
    <div class="filter-title">分类筛选</div>
    <div class="category-list" aria-label="产品分类">
      <button class="category-chip active" type="button" data-category-choice="">全部产品<span>${products.length}</span></button>
      ${categories.map((category) => `<button class="category-chip" type="button" data-category-choice="${escapeHtml(category)}">${escapeHtml(category)}<span>${products.filter((product) => product.category === category).length}</span></button>`).join("")}
    </div>
    <div class="filter-title sub">参数筛选</div>
    <label>关键词<input id="keywordFilter" type="search" placeholder="产品名 / 型号 / 描述"></label>
    <label class="visually-compact">分类<select id="categoryFilter"><option value="">全部分类</option>${categories.map((category) => `<option value="${category}">${category}</option>`).join("")}</select></label>
    <label>材质<select id="materialFilter"><option value="">全部材质</option>${materials.map((material) => `<option value="${material}">${material}</option>`).join("")}</select></label>
    <label>压力<select id="pressureFilter"><option value="">全部压力</option>${pressures.map((pressure) => `<option value="${pressure}">${pressure}</option>`).join("")}</select></label>
    <button class="button ghost full" id="resetFilters">重置筛选</button>
  </aside>
  <div class="catalog-main">
    <div class="toolbar">
      <strong><span id="resultCount">${products.length}</span> 个产品</strong>
      <a class="quote-link" href="/quote/">查看询价单 <span data-quote-count>0</span></a>
    </div>
    <div class="product-grid" id="productGrid">
      ${products.map(productCard).join("")}
    </div>
    <p class="empty-state" id="emptyState" hidden>没有找到匹配产品，请调整筛选条件。</p>
  </div>
  <aside class="quote-rail" aria-label="询价篮">
    <div class="quote-rail-head">
      <div>
        <div class="eyebrow">Quote Basket</div>
        <h2>询价篮</h2>
      </div>
      <span data-quote-count>0</span>
    </div>
    <div id="catalogQuoteItems" class="mini-quote-items"></div>
    <a class="button full" href="/quote/">进入询价单</a>
  </aside>
</section>`
    ,
    scripts: jsonScript("productsData", products)
  });
}

function productPage(product) {
  const related = [
    ...products.filter((item) => item.slug !== product.slug && item.category === product.category),
    ...products.filter((item) => item.slug !== product.slug && item.category !== product.category)
  ].slice(0, 3);

  return page({
    title: `${product.name} | Franta B2B`,
    description: product.description,
    active: "产品中心",
    body: `<section class="detail-layout">
  <div class="detail-media"><img src="${product.image}" alt="${escapeHtml(product.name)}"></div>
  <div class="detail-copy">
    <p class="eyebrow">${escapeHtml(product.category)} · ${escapeHtml(product.id)}</p>
    <h1>${escapeHtml(product.name)}</h1>
    <p>${escapeHtml(product.description)}</p>
    <section class="detail-panel">
      <h2>核心参数</h2>
      <table class="spec-table detail">
        <tbody>
          <tr><th>产品编号</th><td>${escapeHtml(product.id)}</td><th>分类</th><td>${escapeHtml(product.category)}</td></tr>
          <tr><th>材质</th><td>${escapeHtml(product.material)}</td><th>规格范围</th><td>${escapeHtml(product.size)}</td></tr>
          <tr><th>压力等级</th><td>${escapeHtml(product.pressure)}</td><th>连接方式</th><td>${escapeHtml(product.connection)}</td></tr>
        </tbody>
      </table>
    </section>
    <div class="detail-actions">
      <button class="button large" data-add-quote="${escapeHtml(product.slug)}">加入询价单</button>
      <a class="button ghost large" href="${product.pdf}">PDF 样本</a>
      <a class="button ghost large" href="${product.cad}">CAD 图纸</a>
    </div>
  </div>
</section>
<section class="section two-column-section">
  <div class="detail-panel">
    <div class="section-heading compact-heading">
      <p class="eyebrow">Downloads</p>
      <h2>下载资料</h2>
    </div>
    <div class="download-list">
      <a href="${product.pdf}"><strong>PDF 产品样本</strong><span>规格、材质、安装说明</span></a>
      <a href="${product.cad}"><strong>CAD 图纸</strong><span>用于项目选型和工程配套</span></a>
    </div>
  </div>
  <div class="detail-panel">
    <div class="section-heading compact-heading">
      <p class="eyebrow">Related</p>
      <h2>相关产品</h2>
    </div>
    <div class="related-list">
      ${related.map((item) => `<a href="/products/${item.slug}/"><span>${escapeHtml(item.category)}</span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.material)} · ${escapeHtml(item.size)}</small></a>`).join("")}
    </div>
  </div>
</section>
<section class="section">
  <div class="section-heading">
    <p class="eyebrow">Selection Notes</p>
    <h2>选型提示</h2>
  </div>
  <div class="note-grid">
    <article><h3>确认工况</h3><p>下单前请确认介质、温度、压力、安装空间与执行标准。</p></article>
    <article><h3>确认连接</h3><p>沟槽、环压、螺纹、焊接和法兰连接需要与现场管路一致。</p></article>
    <article><h3>索取资料</h3><p>可在下载中心集中获取 PDF 与 CAD，占位文件后续可替换为 R2 资源。</p></article>
  </div>
</section>`
  });
}

function downloadsPage() {
  return page({
    title: "下载中心 | Franta B2B",
    description: "按产品下载 PDF 样本和 CAD 图纸。",
    active: "下载中心",
    body: `<section class="page-head">
  <p class="eyebrow">Downloads</p>
  <h1>下载中心</h1>
  <p>集中管理产品 PDF 样本与 CAD 图纸，后续可将链接切换到 Cloudflare R2。</p>
</section>
<section class="table-wrap">
  <table class="download-table">
    <thead><tr><th>产品</th><th>分类</th><th>规格</th><th>PDF</th><th>CAD</th><th>询价</th></tr></thead>
    <tbody>
      ${products.map((product) => `<tr>
        <td><a href="/products/${product.slug}/">${escapeHtml(product.name)}</a><small>${escapeHtml(product.id)}</small></td>
        <td>${escapeHtml(product.category)}</td>
        <td>${escapeHtml(product.size)}</td>
        <td><a class="text-button" href="${product.pdf}">下载 PDF</a></td>
        <td><a class="text-button" href="${product.cad}">下载 CAD</a></td>
        <td><button class="button small" data-add-quote="${escapeHtml(product.slug)}">加入</button></td>
      </tr>`).join("")}
    </tbody>
  </table>
</section>`
  });
}

function quotePage() {
  return page({
    title: "询价单 | Franta B2B",
    description: "查看已加入的产品并填写询价联系信息。",
    active: "询价单",
    body: `<section class="page-head">
  <p class="eyebrow">Quote</p>
  <h1>询价单</h1>
  <p>本页仅收集询价意向，不接支付、不做会员系统。提交后可接入 Pages Functions 与 D1。</p>
</section>
<section class="quote-layout">
  <div>
    <div class="toolbar"><strong>已选产品</strong><button class="text-button" id="clearQuote">清空</button></div>
    <div id="quoteItems" class="quote-items"></div>
  </div>
  <form class="quote-form" id="quoteForm">
    <label>公司名称<input name="company" required placeholder="请输入公司名称"></label>
    <label>联系人<input name="name" required placeholder="请输入联系人"></label>
    <label>电话 / 邮箱<input name="contact" required placeholder="手机号或邮箱"></label>
    <label>补充需求<textarea name="message" rows="5" placeholder="数量、工况、交期、收货地等"></textarea></label>
    <button class="button large full" type="submit">提交询价</button>
    <p class="form-note" id="quoteMessage">当前为静态演示，提交不会发送到服务器。</p>
  </form>
</section>`,
    scripts: jsonScript("productsData", products)
  });
}

async function write(target, content) {
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content, "utf8");
}

async function copyStatic() {
  await write(path.join(dist, "data/products.json"), JSON.stringify(products, null, 2));
  await write(path.join(dist, "assets/styles.css"), await readFile(path.join(root, "src/styles.css"), "utf8"));
  await write(path.join(dist, "assets/app.js"), await readFile(path.join(root, "src/app.js"), "utf8"));
}

await rm(dist, { recursive: true, force: true });
await copyStatic();
await write(path.join(dist, "index.html"), homePage());
await write(path.join(dist, "products/index.html"), productsPage());
await write(path.join(dist, "downloads/index.html"), downloadsPage());
await write(path.join(dist, "quote/index.html"), quotePage());
for (const product of products) {
  await write(path.join(dist, "products", product.slug, "index.html"), productPage(product));
}

console.log(`Built ${products.length} products into dist`);
