import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import products from "../data/products.json";
import "./styles.css";

const postModules = import.meta.glob("../posts/**/*.md", { query: "?raw", import: "default", eager: true });

const redirectedPath = sessionStorage.getItem("frantaSpaRedirect");
if (redirectedPath) {
  sessionStorage.removeItem("frantaSpaRedirect");
  window.history.replaceState(null, "", redirectedPath);
}

const categories = [...new Set(products.map((product) => product.category))];
const materials = [...new Set(products.map((product) => product.material))];
const pressures = [...new Set(products.map((product) => product.pressure))];
const connections = [...new Set(products.map((product) => product.connection))];
const quoteKey = "frantaQuoteItems";
const blogHomeUrl = "https://blog.sggg.cc.cd/";
const traceSystemUrl = "https://zhuishu.sggg.cc.cd/";
const traceAdminUrl = "https://zhuishu.sggg.cc.cd/admin";
const sampleTraceCode = "2026060101000002";

const categoryMeta = {
  "沟槽管件": ["沟槽管件系统", "适用于消防、给排水和水务主干管路"],
  "双卡管件": ["双卡压管件系统", "高可靠密封，适合工程级管路连接"],
  "单卡管件": ["单卡压管件系统", "轻量快装，适合建筑与设备配套"],
  "不锈钢管": ["不锈钢水管系统", "304/316L 管材，覆盖 DN15-DN300"],
  "保温管": ["保温管系统", "降低热损耗，适配冷热水输送"],
  "覆塑管": ["覆塑管系统", "外覆保护层，适合复杂安装环境"]
};

const categoryRelatedTags = {
  "沟槽管件": ["沟槽", "沟槽接头", "消防", "水务"],
  "双卡管件": ["双卡", "环压", "薄壁不锈钢", "安装"],
  "单卡管件": ["单卡", "环压", "快装", "建筑给水"],
  "不锈钢管": ["不锈钢水管", "不锈钢管道", "304", "316L"],
  "保温管": ["保温", "冷热水", "节能", "不锈钢管道"],
  "覆塑管": ["覆塑", "防腐", "复杂安装", "不锈钢水管"]
};

const projectCases = [
  ["海宁水务扩建工程", "DN100-DN300 沟槽系统", "管网长度：3200 米"],
  ["昆山第二水厂改造", "双卡压系统解决方案", "管网长度：2800 米"],
  ["南通水务管网升级", "304 不锈钢管件应用", "管网长度：4500 米"],
  ["无锡城北水质提升工程", "沟槽+法兰系统组合", "管网长度：1800 米"]
];

const downloadCards = [
  ["产品手册", "PDF", "PDF"],
  ["CAD 图纸", "DWG / DXF", "CAD"],
  ["三维模型", "STEP / IGS", "BOX"],
  ["安装说明", "PDF", "BOOK"],
  ["检测报告", "PDF", "DOC"]
];

const traceLookupKey = "frantaTraceLookups";
const traceRecords = [
  {
    code: "FRT-260526-7K9P3X",
    product: products.find((item) => item.slug === "grooved-90-elbow") || products[0],
    batchNo: "20260526A01",
    serialNo: "FL-GC-20260526-0018",
    materialHeat: "S30408-2605-18",
    inspector: "QC-08",
    inspectionNo: "FT-QC-20260526-018",
    productionLine: "沟槽管件二线",
    customer: "昆山水务",
    deliveryNo: "SO-20260528-036",
    status: "已出厂",
    steps: [
      ["原料入库", "2026-05-23", "S30408 材质复验合格"],
      ["成型加工", "2026-05-24", "沟槽成型与尺寸抽检通过"],
      ["压力/外观检验", "2026-05-26", "水压与外观检验合格"],
      ["赋码包装", "2026-05-26", "一物一码绑定批次与检验记录"],
      ["发货出库", "2026-05-28", "发往昆山水务项目"]
    ]
  },
  {
    code: "FRT-260527-HM8Q2A",
    product: products.find((item) => item.slug === "double-press-tee") || products[1],
    batchNo: "20260527B03",
    serialNo: "FL-SK-20260527-0042",
    materialHeat: "S31603-2605-07",
    inspector: "QC-12",
    inspectionNo: "FT-QC-20260527-042",
    productionLine: "双卡压管件一线",
    customer: "南通水务",
    deliveryNo: "SO-20260529-052",
    status: "已出厂",
    steps: [
      ["原料入库", "2026-05-24", "316L 材质炉批号核验完成"],
      ["精密成型", "2026-05-25", "卡压端尺寸在线检测通过"],
      ["密封检验", "2026-05-27", "密封面与壁厚抽检合格"],
      ["赋码包装", "2026-05-27", "追溯码写入发货批次"],
      ["发货出库", "2026-05-29", "发往南通水务项目"]
    ]
  },
  {
    code: "FRT-260528-P6W3CN",
    product: products.find((item) => item.slug === "stainless-water-pipe") || products[2],
    batchNo: "20260528C02",
    serialNo: "FL-PG-20260528-0106",
    materialHeat: "S30408-2605-31",
    inspector: "QC-03",
    inspectionNo: "FT-QC-20260528-106",
    productionLine: "不锈钢管材三线",
    customer: "海宁水务",
    deliveryNo: "SO-20260530-067",
    status: "已出厂",
    steps: [
      ["钢带入库", "2026-05-25", "原料供应商批次核验完成"],
      ["焊接成管", "2026-05-26", "在线焊缝检测通过"],
      ["固溶与矫直", "2026-05-27", "外径与壁厚复检合格"],
      ["赋码包装", "2026-05-28", "管材捆包与追溯码绑定"],
      ["发货出库", "2026-05-30", "发往海宁水务项目"]
    ]
  }
];

const heroSlides = [
  {
    title: "专业不锈钢管及管件制造商，支持一键定制",
    subtitle: "5秒内完成粗略选型：提供产品、查看参数、加入询价单，快速响应工程需求。",
    image: products.find((item) => item.slug === "grooved-tee")?.image || products[0]?.image,
    primaryButton: { text: "进入产品中心", href: "/products/" },
    secondaryButton: { text: "在线定制报价", href: "https://dingzhi.sggg.cc.cd" },
    features: [
      ["304/316L", "优质材质"],
      ["全规格覆盖", "DN15-DN300"],
      ["快速选型", "精准匹配"],
      ["资料下载", "CAD / PDF"]
    ]
  },
  {
    title: "沟槽管件、双卡压管件与水务系统配套选型",
    subtitle: "覆盖沟槽、环压、不锈钢水管、保温管与覆塑管，适配水务、消防和工业管路项目。",
    image: products.find((item) => item.slug === "grooved-reducing-coupling")?.image || products[1]?.image,
    primaryButton: { text: "查看沟槽管件", href: "/products/?category=%E6%B2%9F%E6%A7%BD%E7%AE%A1%E4%BB%B6" },
    secondaryButton: { text: "AI 快速选型", href: "#ai-selector" },
    features: [
      ["沟槽系统", "快速安装"],
      ["双卡压", "稳定密封"],
      ["单卡压", "轻量快装"],
      ["水务项目", "工程适配"]
    ]
  },
  {
    title: "CAD 图纸、PDF 样本与询价流程一站完成",
    subtitle: "产品资料、参数表、下载中心与询价篮联动，帮助工程采购快速完成方案比对。",
    image: products.find((item) => item.slug === "double-press-tee")?.image || products[2]?.image,
    primaryButton: { text: "进入下载中心", href: "/downloads/" },
    secondaryButton: { text: "加入询价单", href: "/quote/" },
    features: [
      ["PDF 样本", "在线下载"],
      ["CAD 图纸", "工程对接"],
      ["参数筛选", "快速定位"],
      ["询价篮", "批量提交"]
    ]
  }
];

const fallbackBlogPosts = [
  {
    slug: "grooved-vs-press-selection",
    title: "沟槽连接和环压连接如何选择",
    summary: "从施工效率、压力等级、维护方式比较两种管路连接方案。",
    date: "2024-05-12",
    tags: ["沟槽", "环压", "水务"],
    href: "/blog/grooved-vs-press-selection/",
    body: "从施工效率、压力等级、维护方式比较沟槽连接和环压连接方案。",
    product: products[0]
  },
  {
    slug: "stainless-fitting-selection-parameters",
    title: "不锈钢管件选型的 6 个参数",
    summary: "材质、规格、压力、介质、连接方式和执行标准是询价前核心信息。",
    date: "2024-05-08",
    tags: ["不锈钢水管", "304", "316L"],
    href: "/blog/stainless-fitting-selection-parameters/",
    body: "材质、规格、压力、介质、连接方式和执行标准是询价前核心信息。",
    product: products.find((item) => item.category === "单卡管件") || products[1]
  },
  {
    slug: "manifold-water-system-application",
    title: "水务系统中分水器的典型应用",
    summary: "用于泵房、净水、多支路设备配套时，需要关注流量与支路数量。",
    date: "2024-05-05",
    tags: ["水务", "分水器"],
    href: "/blog/manifold-water-system-application/",
    body: "用于泵房、净水、多支路设备配套时，需要关注流量与支路数量。",
    product: products.find((item) => item.category === "不锈钢管") || products[2]
  }
];

const blogPosts = getCollection("blog");
const siteBlogPosts = (blogPosts.length ? blogPosts : fallbackBlogPosts).sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

function getCollection(collection) {
  if (collection !== "blog") return [];
  return buildBlogPosts(postModules);
}

function buildBlogPosts(modules) {
  return Object.entries(modules).map(([path, markdown]) => {
    const meta = parseFrontmatter(markdown);
    const slug = path.split("/").pop().replace(/\.(md|mdx)$/i, "");
    const product = productForTags(meta.tags, meta.title);

    return {
      slug,
      title: meta.title || slug,
      summary: meta.description || firstParagraph(markdown),
      date: meta.pubDate || meta.date || "",
      tags: meta.tags,
      href: `/blog/${slug}/`,
      body: markdown.replace(/^---[\s\S]*?---/, "").trim(),
      product
    };
  });
}

function parseFrontmatter(markdown = "") {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return { tags: [] };

  const lines = match[1].split(/\r?\n/);
  const meta = { tags: [] };
  let currentKey = "";

  for (const line of lines) {
    const listItem = line.match(/^\s*-\s*(.+)$/);
    if (listItem && currentKey === "tags") {
      meta.tags.push(cleanFrontmatterValue(listItem[1]));
      continue;
    }

    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;

    currentKey = pair[1];
    const value = cleanFrontmatterValue(pair[2]);
    if (currentKey === "tags") {
      meta.tags = value ? value.split(/[，,]/).map((item) => item.trim()).filter(Boolean) : [];
    } else {
      meta[currentKey] = value;
    }
  }

  return meta;
}

function cleanFrontmatterValue(value = "") {
  return value.trim().replace(/^["']|["']$/g, "");
}

function firstParagraph(markdown = "") {
  return markdown
    .replace(/^---[\s\S]*?---/, "")
    .split(/\n{2,}/)
    .map((item) => item.replace(/^#+\s*/, "").trim())
    .find((item) => item && !item.startsWith("|")) || "";
}

function productForTags(tags = [], title = "") {
  const text = [...tags, title].join(" ");
  return products.find((product) => {
    const categoryTags = categoryRelatedTags[product.category] || [];
    return [product.category, product.name, ...categoryTags].some((tag) => text.includes(tag));
  }) || products[0];
}

function getRelatedPosts(tags = [], limit = 3) {
  const needles = tags.filter(Boolean);
  const scored = siteBlogPosts.map((post) => {
    const text = `${post.title} ${post.summary} ${(post.tags || []).join(" ")}`;
    const score = needles.reduce((total, tag) => total + (text.includes(tag) ? 2 : 0), 0);
    return { post, score };
  });

  return scored
    .sort((a, b) => b.score - a.score || String(b.post.date || "").localeCompare(String(a.post.date || "")))
    .slice(0, limit)
    .map((item) => item.post);
}

function rankProducts(query = "", limit = 4) {
  const tokens = query.toLowerCase().split(/[\s,，、/]+/).filter(Boolean);
  const scored = products.map((product) => {
    const tags = categoryRelatedTags[product.category] || [];
    const text = `${product.name} ${product.category} ${product.id} ${product.material} ${product.size} ${product.pressure} ${product.connection} ${product.description} ${tags.join(" ")}`.toLowerCase();
    const score = tokens.reduce((total, token) => total + (text.includes(token) ? 2 : 0), 0) + (query && text.includes(query.toLowerCase()) ? 3 : 0);
    return { product, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.product);
}

function buildAiContext(query) {
  const recommended = rankProducts(query, 4);
  const tags = recommended.flatMap((product) => [product.category, ...(categoryRelatedTags[product.category] || [])]);
  const posts = getRelatedPosts(tags, 3);
  const downloads = recommended.slice(0, 3).flatMap((product) => [
    { title: `${product.name} PDF 样本`, type: "PDF", href: product.pdf },
    { title: `${product.name} CAD 图纸`, type: "CAD", href: product.cad }
  ]).slice(0, 4);

  return {
    question: query,
    products: recommended.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      material: product.material,
      size: product.size,
      pressure: product.pressure,
      connection: product.connection,
      image: product.image,
      pdf: product.pdf,
      cad: product.cad
    })),
    posts: posts.map(({ title, summary, date, tags: postTags, href }) => ({ title, summary, date, tags: postTags, href })),
    downloads
  };
}

function localAiResult(context) {
  const first = context.products[0];
  return {
    answer: first
      ? `建议优先查看 ${first.name}。它与当前工况关键词匹配度最高，可继续核对规格、压力等级和连接方式，再下载 CAD/PDF 做工程比对。`
      : "请补充公称通径、压力等级、连接方式或使用场景，系统会给出更准确的产品建议。",
    products: context.products,
    posts: context.posts,
    downloads: context.downloads,
    source: "local"
  };
}

async function askAiSearch(query) {
  const context = buildAiContext(query);

  try {
    const response = await fetch("/api/ai-search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(context)
    });

    if (response.ok) {
      const data = await response.json();
      return {
        ...localAiResult(context),
        ...data,
        products: data.products?.length ? data.products : context.products,
        posts: data.posts?.length ? data.posts : context.posts,
        downloads: data.downloads?.length ? data.downloads : context.downloads
      };
    }
  } catch {
    // Vite dev does not serve Pages Functions; keep the homepage usable locally.
  }

  return localAiResult(context);
}

function getQuote() {
  try {
    return JSON.parse(localStorage.getItem(quoteKey) || "[]");
  } catch {
    return [];
  }
}

function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [quote, setQuoteState] = useState(getQuote);

  function navigate(href) {
    window.history.pushState(null, "", href);
    setPath(window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  React.useEffect(() => {
    const handlePop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  function setQuote(items) {
    const next = [...new Set(items)];
    localStorage.setItem(quoteKey, JSON.stringify(next));
    setQuoteState(next);
  }

  function addQuote(slug) {
    setQuote([...quote, slug]);
  }

  function removeQuote(slug) {
    setQuote(quote.filter((item) => item !== slug));
  }

  const selectedProducts = quote.map((slug) => products.find((product) => product.slug === slug)).filter(Boolean);
  const route = resolveRoute(path);

  return (
    <>
      <Header active={route.active} navigate={navigate} quoteCount={quote.length} />
      <main>
        {route.name === "home" && <Home navigate={navigate} />}
        {route.name === "products" && <Products addQuote={addQuote} navigate={navigate} />}
        {route.name === "productDetail" && <ProductDetail product={route.product} addQuote={addQuote} navigate={navigate} />}
        {route.name === "blogDetail" && <BlogDetail post={route.post} navigate={navigate} />}
        {route.name === "downloads" && <Downloads />}
        {route.name === "trace" && <Traceability />}
        {route.name === "quote" && <Quote selectedProducts={selectedProducts} removeQuote={removeQuote} clearQuote={() => setQuote([])} />}
      </main>
      <Footer navigate={navigate} />
    </>
  );
}

function resolveRoute(path) {
  if (path === "/products" || path === "/products/") return { name: "products", active: "产品中心" };
  if (path.startsWith("/products/")) {
    const slug = path.split("/").filter(Boolean)[1];
    const product = products.find((item) => item.slug === slug) || products[0];
    return { name: "productDetail", active: "产品中心", product };
  }
  if (path.startsWith("/blog/")) {
    const slug = path.split("/").filter(Boolean)[1];
    const post = siteBlogPosts.find((item) => item.slug === slug) || siteBlogPosts[0];
    return { name: "blogDetail", active: "技术支持", post };
  }
  if (path === "/downloads" || path === "/downloads/") return { name: "downloads", active: "下载中心" };
  if (path === "/trace" || path === "/trace/") return { name: "trace", active: "追溯查询" };
  if (path === "/quote" || path === "/quote/") return { name: "quote", active: "联系我们" };
  return { name: "home", active: "首页" };
}

function Link({ href, navigate, children, className }) {
  const external = /^https?:\/\//i.test(href);

  if (external) {
  return <a className={className} href={href} target="_blank" rel="noopener">{children}</a>;
  }

  if (href.startsWith("#")) {
    return (
      <a className={className} href={href} onClick={(event) => {
        event.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}>
        {children}
      </a>
    );
  }

  return (
    <a className={className} href={href} onClick={(event) => { event.preventDefault(); navigate(href); }}>
      {children}
    </a>
  );
}

function buildTraceUrl(code = "") {
  const digits = String(code || "").replace(/\D/g, "");
  return digits ? `${traceSystemUrl}?code=${encodeURIComponent(digits)}` : traceSystemUrl;
}

function ProductImage({ product, className = "" }) {
  const [failed, setFailed] = useState(false);

  if (!product?.image || failed) return null;

  return (
    <img
      className={className}
      src={product.image}
      alt={product.name}
      loading="eager"
      onError={() => setFailed(true)}
    />
  );
}

function Header({ active, navigate, quoteCount }) {
  const nav = [["首页", "/"], ["产品中心", "/products/"], ["定制报价", "https://dingzhi.sggg.cc.cd"], ["追溯查询", "https://zhuishu.sggg.cc.cd"], ["下载中心", "/downloads/"]];
  return (
    <header className="site-header pro-header">
      <Link className="brand" href="/" navigate={navigate}>
        <span className="brand-mark">F</span>
        <span><strong>Franta B2B</strong><small>不锈钢管件专家</small></span>
      </Link>
      <nav className="top-nav" aria-label="主导航">
        {nav.map(([label, href]) => <Link key={label} className={active === label ? "active" : ""} href={href} navigate={navigate}>{label}</Link>)}
        <span className="nav-globe">◎</span>
        <Link className="contact-button" href="/quote/" navigate={navigate}>联系我们{quoteCount > 0 ? <span>{quoteCount}</span> : null}</Link>
      </nav>
    </header>
  );
}

function Home({ navigate }) {
  const [aiQuery, setAiQuery] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const activeHero = heroSlides[heroIndex];
  const latestPosts = siteBlogPosts.slice(0, 3);

  React.useEffect(() => {
    if (isHeroPaused) return undefined;

    const timer = window.setInterval(() => {
      setHeroIndex((index) => (index + 1) % heroSlides.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [isHeroPaused]);

  async function submitAi(event) {
    event.preventDefault();
    const query = aiQuery.trim();
    if (!query) return;

    setAiLoading(true);
    setAiResult(await askAiSearch(query));
    setAiLoading(false);
  }

  return (
    <div className="pro-home">
      <section className="pro-hero" onMouseEnter={() => setIsHeroPaused(true)} onMouseLeave={() => setIsHeroPaused(false)}>
        <div className="pro-hero-copy hero-slide-copy" key={`copy-${heroIndex}`}>
          <p className="eyebrow">STAINLESS PIPING COMPONENTS</p>
          <h1>{activeHero.title}</h1>
          <p>{activeHero.subtitle}</p>
          <div className="pro-hero-actions">
            <Link className="button large" href={activeHero.primaryButton.href} navigate={navigate}>{activeHero.primaryButton.text}</Link>
            <Link className="button ghost large" href={activeHero.secondaryButton.href} navigate={navigate}>{activeHero.secondaryButton.text}</Link>
          </div>
          <div className="pro-features">
            {activeHero.features.map(([title, text]) => <Feature key={title} title={title} text={text} />)}
          </div>
        </div>
        <div className="pro-hero-media hero-slide-media" key={`media-${heroIndex}`}>
          <span className="hero-shape" />
          <img src={activeHero.image} alt={activeHero.title} loading="eager" />
        </div>
      </section>
      <div className="slider-dots" aria-label="首页轮播切换">
        {heroSlides.map((slide, index) => (
          <button
            key={slide.title}
            className={index === heroIndex ? "active" : ""}
            type="button"
            aria-label={`切换到轮播图 ${index + 1}`}
            aria-current={index === heroIndex ? "true" : undefined}
            onClick={() => setHeroIndex(index)}
          />
        ))}
      </div>

      <section className="pro-ai" id="ai-selector">
        <div>
          <h2>AI 智能选型助手</h2>
          <p>输入您的需求，AI 为您推荐最合适的产品方案。</p>
          <form onSubmit={submitAi} className="pro-ai-form">
            <input value={aiQuery} onChange={(event) => setAiQuery(event.target.value)} placeholder="输入公称通径、使用场景、压力等级..." />
            <button className="button" type="submit" disabled={aiLoading}>{aiLoading ? "分析中" : "开始选型"}</button>
          </form>
        </div>
        {aiResult ? <AiResultCard result={aiResult} navigate={navigate} /> : (
          <div className="ai-ghost-card">
            <strong>推荐方案</strong>
            <span>沟槽式 90° 弯头</span>
            <span>DN100 / SUS304 / PN16</span>
            <Link href="/products/" navigate={navigate}>查看详情</Link>
            <a className="button ghost" href="https://dingzhi.sggg.cc.cd" target="_blank" rel="noopener">进入定制报价</a>
          </div>
        )}
      </section>

      <HomeBlock title="产品分类" action="查看全部产品 →" href="/products/" navigate={navigate}>
        <div className="pro-category-grid">
          {categories.slice(0, 6).map((category) => {
            const product = products.find((item) => item.category === category) || products[0];
            const meta = categoryMeta[category] || [category, "工程级不锈钢管路产品"];
            return (
              <Link className="pro-category-card" key={category} href={`/products/?category=${encodeURIComponent(category)}`} navigate={navigate}>
                <ProductImage product={product} />
                <h3>{meta[0]}</h3>
                <p>{meta[1]}</p>
                <div className="pro-category-tags">
                  {(categoryRelatedTags[category] || []).slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </Link>
            );
          })}
        </div>
      </HomeBlock>

      <HomeBlock title="水务项目案例" action="查看更多案例 →" href="/products/" navigate={navigate}>
        <div className="pro-case-grid">
          {projectCases.map(([title, spec, metric], index) => <article className={`pro-case-card case-${index + 1}`} key={title}><div><h3>{title}</h3><p>{spec}</p><span>{metric}</span></div></article>)}
        </div>
      </HomeBlock>

      <HomeBlock title="下载中心" action="进入下载中心 →" href="/downloads/" navigate={navigate}>
        <div className="pro-download-grid">
          {downloadCards.map(([title, text, icon]) => <Link className="pro-download-card" key={title} href="/downloads/" navigate={navigate}><span>{icon}</span><strong>{title}</strong><small>{text}</small></Link>)}
        </div>
      </HomeBlock>

      <HomeBlock title="产品追溯" action="进入追溯系统 →" href="/trace/" navigate={navigate}>
        <TraceConnectCard navigate={navigate} />
      </HomeBlock>

      <HomeBlock title="技术博客" action="查看全部文章 →" href={blogHomeUrl} navigate={navigate}>
        <div className="pro-blog-grid">
          {latestPosts.map((post) => <BlogCard key={post.title} post={post} navigate={navigate} />)}
        </div>
      </HomeBlock>
    </div>
  );
}

function TraceConnectCard({ navigate }) {
  return (
    <section className="trace-connect-card">
      <div>
        <p className="eyebrow">FRANTA TRACEABILITY</p>
        <h3>一物一码连接真实追溯系统</h3>
        <p>客户扫描产品喷码后进入独立追溯系统，读取 D1 数据库中的产品、批次、炉号、检验状态、节气识别和查询记录。</p>
      </div>
      <div className="trace-connect-actions">
        <Link className="button large" href="/trace/" navigate={navigate}>输入追溯码</Link>
        <a className="button ghost large" href={traceSystemUrl} target="_blank" rel="noreferrer">打开查询页</a>
      </div>
    </section>
  );
}

function AiResultCard({ result, navigate }) {
  return (
    <div className="ai-result-card">
      <strong>AI 推荐</strong>
      <p>{result.answer}</p>
      <div className="ai-result-list">
        {(result.products || []).slice(0, 2).map((product) => (
          <Link key={product.slug} href={`/products/${product.slug}/`} navigate={navigate}>
            <span>{product.category}</span>
            <b>{product.name}</b>
            <small>{product.size} · {product.pressure}</small>
          </Link>
        ))}
      </div>
      <div className="ai-result-links">
        {(result.posts || []).slice(0, 2).map((post) => <Link key={post.title} href={post.href || "/downloads/"} navigate={navigate}>{post.title}</Link>)}
        {(result.downloads || []).slice(0, 2).map((file) => <a key={`${file.type}-${file.title}`} href={file.href}>{file.type}：{file.title}</a>)}
      </div>
    </div>
  );
}

function BlogCard({ post, navigate }) {
  return (
    <Link className="pro-blog-card" href={post.href || `/blog/${post.slug}/`} navigate={navigate}>
      <ProductImage product={post.product} />
      <div>
        <h3>{post.title}</h3>
        <p>{post.summary}</p>
        <span>{post.date}</span>
        <strong className="blog-read-more">阅读全文 →</strong>
      </div>
    </Link>
  );
}

function BlogDetail({ post, navigate }) {
  if (!post) {
    return <PageHead eyebrow="Blog" title="文章未找到" text="请返回首页查看最新技术文章。" />;
  }

  const relatedProducts = products.filter((product) => {
    const tags = categoryRelatedTags[product.category] || [];
    return [product.category, product.name, ...tags].some((tag) => `${post.title} ${post.summary} ${(post.tags || []).join(" ")}`.includes(tag));
  }).slice(0, 3);

  return (
    <div className="blog-detail-page">
      <section className="blog-detail">
        <p className="eyebrow">TECHNICAL BLOG · {post.date}</p>
        <h1>{post.title}</h1>
        <p>{post.summary}</p>
        <div className="blog-tag-row">
          {(post.tags || []).map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <div className="blog-body">
          {markdownPreview(post.body).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </section>
      <section className="section">
        <div className="section-head"><h2>相关产品</h2><Link href="/products/" navigate={navigate}>进入产品中心</Link></div>
        <div className="product-grid">{relatedProducts.map((item) => <ProductCard key={item.slug} product={item} addQuote={() => {}} navigate={navigate} />)}</div>
      </section>
    </div>
  );
}

function markdownPreview(markdown = "") {
  return markdown
    .split(/\n{2,}/)
    .map((block) => block.replace(/^#+\s*/, "").trim())
    .filter((block) => block && !block.startsWith("|") && !block.startsWith("---"))
    .slice(0, 8);
}

function Feature({ title, text }) {
  return <div><span>⌁</span><strong>{title}</strong><small>{text}</small></div>;
}

function HomeBlock({ title, action, href, navigate, children }) {
  return <section className="home-block"><div className="home-block-head"><h2>{title}</h2><Link href={href} navigate={navigate}>{action}</Link></div>{children}</section>;
}

function Products({ addQuote, navigate }) {
  const params = new URLSearchParams(window.location.search);
  const [category, setCategory] = useState(params.get("category") || "全部");
  const [material, setMaterial] = useState("全部");
  const [pressure, setPressure] = useState("全部");
  const [connection, setConnection] = useState("全部");
  const [keyword, setKeyword] = useState(params.get("q") || "");
  const relatedTags = category === "全部" ? ["不锈钢水管", "沟槽", "双卡", "单卡"] : (categoryRelatedTags[category] || [category]);
  const relatedPosts = getRelatedPosts(relatedTags, 3);

  const filtered = useMemo(() => products.filter((product) => {
    const matchKeyword = `${product.name}${product.id}${product.description}`.toLowerCase().includes(keyword.toLowerCase());
    return (category === "全部" || product.category === category) &&
      (material === "全部" || product.material === material) &&
      (pressure === "全部" || product.pressure === pressure) &&
      (connection === "全部" || product.connection === connection) &&
      matchKeyword;
  }), [category, material, pressure, connection, keyword]);

  return (
    <div className="catalog-page">
      <section className="catalog-hero">
        <div>
          <h1>产品中心</h1>
          <p>高品质不锈钢管件，支持多种连接方式与规格。</p>
          <div className="catalog-hero-points">
            <span>304/316L 优质材料</span>
            <span>精密制造</span>
            <span>全规格可选</span>
            <span>支持 CAD/PDF 下载</span>
          </div>
        </div>
        <div className="catalog-hero-media">
          <ProductImage product={products.find((item) => item.slug === "grooved-tee") || products[0]} />
        </div>
      </section>
      <section className="catalog-layout-v2">
        <aside className="catalog-filters">
          <div className="filter-title">
            <h2>筛选条件</h2>
            <button onClick={() => { setCategory("全部"); setMaterial("全部"); setPressure("全部"); setConnection("全部"); setKeyword(""); }}>清空筛选</button>
          </div>
          <CatalogFilterList title="分类" options={["全部", ...categories]} value={category} setValue={setCategory} />
          <CatalogFilterList title="材质" options={["全部", ...materials]} value={material} setValue={setMaterial} />
          <CatalogFilterList title="压力等级" options={["全部", ...pressures]} value={pressure} setValue={setPressure} />
          <CatalogFilterList title="连接方式" options={["全部", ...connections]} value={connection} setValue={setConnection} />
        </aside>
        <div className="catalog-results">
          <div className="catalog-search-row">
            <label>
              <span>⌕</span>
              <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索产品名称、型号或关键词，如：DN100 沟槽三通" />
            </label>
            <button>默认排序</button>
          </div>
          <CategoryStrip active={category} setActive={setCategory} />
          <RelatedPostsPanel title={category === "全部" ? "相关技术文章" : `${categoryMeta[category]?.[0] || category} · 技术文章`} posts={relatedPosts} navigate={navigate} />
          <div className="catalog-card-grid">
            {filtered.map((product) => <CatalogProductCard key={product.slug} product={product} addQuote={addQuote} navigate={navigate} />)}
          </div>
        </div>
      </section>
    </div>
  );
}

function RelatedPostsPanel({ title, posts, navigate }) {
  if (!posts.length) return null;

  return (
    <section className="catalog-related-posts">
      <div>
        <strong>{title}</strong>
        <small>按当前分类标签自动匹配</small>
      </div>
      <div>
        {posts.map((post) => (
          <Link key={post.title} href={post.href || "/downloads/"} navigate={navigate}>
            <span>{post.date}</span>
            {post.title}
          </Link>
        ))}
      </div>
    </section>
  );
}

function CatalogFilterList({ title, options, value, setValue }) {
  return (
    <section className="catalog-filter-group">
      <h3>{title}<span>⌃</span></h3>
      <div>
        {options.map((option) => (
          <button key={option} className={value === option ? "active" : ""} onClick={() => setValue(option)}>
            <span />
            <em>{option}</em>
          </button>
        ))}
      </div>
    </section>
  );
}

function CategoryStrip({ active, setActive }) {
  const items = ["全部", ...categories];
  return (
    <div className="category-strip">
      {items.map((category) => {
        const product = category === "全部" ? products[0] : products.find((item) => item.category === category);
        const label = category === "全部" ? "全部产品" : (categoryMeta[category]?.[0] || category);
        const count = category === "全部" ? products.length : products.filter((item) => item.category === category).length;
        return (
          <button key={category} className={active === category ? "active" : ""} onClick={() => setActive(category)}>
            {product ? <ProductImage product={product} /> : null}
            <strong>{label}</strong>
            <small>{count} 个产品</small>
          </button>
        );
      })}
    </div>
  );
}

function CatalogProductCard({ product, addQuote, navigate }) {
  return (
    <article className="catalog-product-card">
      <button className="favorite-button" aria-label="收藏">♡</button>
      <Link className="catalog-product-image" href={`/products/${product.slug}/`} navigate={navigate}>
        <ProductImage product={product} />
      </Link>
      <div className="catalog-product-copy">
        <h3><Link href={`/products/${product.slug}/`} navigate={navigate}>{product.name}</Link></h3>
        <span>{product.id}</span>
        <dl>
          <div><dt>材质：</dt><dd>{product.material}</dd></div>
          <div><dt>规格：</dt><dd>{product.size}</dd></div>
          <div><dt>压力：</dt><dd>{product.pressure}</dd></div>
          <div><dt>连接：</dt><dd>{product.connection}</dd></div>
        </dl>
      </div>
      <div className="catalog-product-actions">
        <Link href={`/products/${product.slug}/`} navigate={navigate}>查看详情</Link>
        <a href={product.cad}>下载CAD</a>
        <button onClick={() => addQuote(product.slug)}>加入询价</button>
      </div>
    </article>
  );
}

function FilterPills({ title, options, value, setValue }) {
  return <div className="filter-group"><h3>{title}</h3>{options.map((option) => <button key={option} className={value === option ? "active" : ""} onClick={() => setValue(option)}>{option}</button>)}</div>;
}

function ProductTable({ products: list, addQuote, navigate }) {
  return (
    <div className="table-wrap">
      <table className="product-table">
        <thead><tr><th>产品</th><th>分类</th><th>材质</th><th>规格</th><th>压力</th><th>连接</th><th>资料</th><th>询价</th></tr></thead>
        <tbody>{list.map((product) => <tr key={product.slug}>
          <td><div className="table-product-cell"><ProductImage product={product} /><div><Link href={`/products/${product.slug}/`} navigate={navigate}>{product.name}</Link><small>{product.id}</small></div></div></td>
          <td>{product.category}</td><td>{product.material}</td><td>{product.size}</td><td>{product.pressure}</td><td>{product.connection}</td>
          <td><a href={product.cad}>CAD</a><a href={product.pdf}>PDF</a></td>
          <td><button className="text-button" onClick={() => addQuote(product.slug)}>加入</button></td>
        </tr>)}</tbody>
      </table>
    </div>
  );
}

function ProductCard({ product, addQuote, navigate }) {
  return <article className="product-card"><Link className="product-image" href={`/products/${product.slug}/`} navigate={navigate}><ProductImage product={product} /></Link><div className="product-content"><div className="eyebrow">{product.category} · {product.id}</div><h3><Link href={`/products/${product.slug}/`} navigate={navigate}>{product.name}</Link></h3><p>{product.description}</p><SpecTable product={product} /><div className="card-actions"><Link className="button ghost" href={`/products/${product.slug}/`} navigate={navigate}>查看详情</Link><a className="button ghost" href={product.cad}>CAD</a><a className="button ghost" href={product.pdf}>PDF</a><button className="button" onClick={() => addQuote(product.slug)}>加入询价单</button></div></div></article>;
}

function ProductDetail({ product, addQuote, navigate }) {
  const related = products.filter((item) => item.category === product.category && item.slug !== product.slug).slice(0, 3);
  const relatedPosts = getRelatedPosts([product.category, product.name, ...(categoryRelatedTags[product.category] || [])], 3);
  return (
    <>
      <section className="detail-layout"><div className="detail-media"><ProductImage product={product} /></div><div className="detail-copy"><p className="eyebrow">{product.category} · {product.id}</p><h1>{product.name}</h1><p>{product.description}</p><section className="detail-panel"><h2>核心参数</h2><SpecTable product={product} /></section><div className="detail-actions"><button className="button large" onClick={() => addQuote(product.slug)}>加入询价单</button><Link className="button ghost large" href="/trace/" navigate={navigate}>追溯查询</Link><a className="button ghost large" href={product.pdf}>PDF 样本</a><a className="button ghost large" href={product.cad}>CAD 图纸</a></div></div></section>
      <section className="section"><div className="section-head"><h2>相关技术文章</h2><Link href="/downloads/" navigate={navigate}>查看资料中心</Link></div><div className="detail-blog-grid">{relatedPosts.map((post) => <BlogCard key={post.title} post={post} navigate={navigate} />)}</div></section>
      <section className="section"><div className="section-head"><h2>相关产品</h2><Link href="/products/" navigate={navigate}>返回产品中心</Link></div><div className="product-grid">{related.map((item) => <ProductCard key={item.slug} product={item} addQuote={addQuote} navigate={navigate} />)}</div></section>
    </>
  );
}

function SpecTable({ product }) {
  return <dl className="spec-table"><div><dt>材质</dt><dd>{product.material}</dd></div><div><dt>规格</dt><dd>{product.size}</dd></div><div><dt>压力</dt><dd>{product.pressure}</dd></div><div><dt>连接</dt><dd>{product.connection}</dd></div></dl>;
}

function Downloads() {
  const featured = [
    ["沟槽系统产品手册", "2025 版", "PDF · 8.2 MB", products.find((item) => item.slug === "grooved-tee") || products[0]],
    ["双卡压安装手册", "2025 版", "PDF · 5.6 MB", products.find((item) => item.slug === "double-press-tee") || products[1]],
    ["不锈钢管道设计规范", "2024 版", "PDF · 3.1 MB", products.find((item) => item.slug === "stainless-water-pipe") || products[2]],
    ["分水器系统选型指南", "2025 版", "PDF · 4.7 MB", products.find((item) => item.slug === "double-press-pipe-bridge") || products[3]],
    ["法兰连接技术手册", "2024 版", "PDF · 2.9 MB", products.find((item) => item.slug === "grooved-flange-adapter") || products[4]],
    ["保温管系统技术资料", "2025 版", "PDF · 6.3 MB", products.find((item) => item.slug === "stainless-insulated-pipe") || products[5]]
  ];
  const types = [
    ["产品手册", "86", "份资料", "PDF"],
    ["CAD 图纸", "128", "份资料", "CAD"],
    ["3D 模型", "52", "份资料", "STEP"],
    ["安装说明", "64", "份资料", "DOC"],
    ["检测报告", "35", "份资料", "TEST"]
  ];
  const latest = [
    ["不锈钢管道焊接工艺指南.pdf", "PDF", "技术规范", "2025-05", "4.3 MB", "2025-05-20"],
    ["沟槽异径三通 CAD 图纸.dwg", "CAD", "沟槽管件", "V1.0", "1.8 MB", "2025-05-18"],
    ["双卡压等径接头 STEP 模型.step", "STEP", "双卡压管件", "V1.0", "2.6 MB", "2025-05-16"],
    ["双卡压安装操作说明.pdf", "PDF", "安装说明", "2025-04", "3.2 MB", "2025-05-15"],
    ["法兰连接尺寸标准截面表.pdf", "PDF", "技术规范", "2025-04", "2.1 MB", "2025-05-12"]
  ];

  return (
    <div className="download-page">
      <section className="download-hero">
        <div>
          <p className="eyebrow">DOWNLOAD CENTER</p>
          <h1>下载中心</h1>
          <p>产品资料、CAD 图纸、PDF 样本与安装说明统一归档，支持在线预览与下载。</p>
          <div className="download-hero-points"><span>资料全面</span><span>免费下载</span><span>持续更新</span><span>安全可靠</span></div>
        </div>
        <ProductImage product={products.find((item) => item.slug === "grooved-tee") || products[0]} />
      </section>
      <section className="download-type-grid">
        {types.map(([title, count, unit, icon]) => <article key={title}><span>{icon}</span><div><strong>{title}</strong><b>{count}</b><small>{unit}</small></div><a href="#download-search">查看全部 →</a></article>)}
      </section>
      <section className="download-block">
        <div className="download-block-head"><h2>热门下载</h2><a href="#latest-downloads">查看全部 →</a></div>
        <div className="download-card-grid">
          {featured.map(([title, version, meta, product]) => <article className="download-file-card" key={title}><ProductImage product={product} /><span>PDF</span><h3>{title}</h3><p>{version}</p><small>{meta}</small><a className="button" href={product.pdf}>下载</a></article>)}
        </div>
      </section>
      <section className="download-search-panel" id="download-search">
        <h2>搜索资料</h2>
        <div><input placeholder="输入产品名称、型号、规格，如：DN100 沟槽三通、90°弯头" /><button className="button">搜索</button></div>
        <p>热门搜索：<span>DN100</span><span>沟槽三通</span><span>90°弯头</span><span>法兰</span><span>DN150</span><span>分水器</span><span>双卡压接头</span></p>
      </section>
      <section className="download-block">
        <div className="download-block-head"><h2>按产品分类浏览</h2></div>
        <div className="download-category-grid">
          {categories.slice(0, 6).map((category) => {
            const product = products.find((item) => item.category === category) || products[0];
            return <article key={category}><ProductImage product={product} /><h3>{categoryMeta[category]?.[0] || category}</h3><p>{products.filter((item) => item.category === category).length} 份资料</p><a href="#latest-downloads">查看 →</a></article>;
          })}
        </div>
      </section>
      <section className="download-block" id="latest-downloads">
        <div className="download-block-head"><h2>最新上传</h2><a href="#download-search">查看全部 →</a></div>
        <div className="latest-download-table">
          <table>
            <thead><tr><th>文件名称</th><th>类型</th><th>所属分类</th><th>版本</th><th>大小</th><th>上传时间</th><th>操作</th></tr></thead>
            <tbody>{latest.map((row) => <tr key={row[0]}><td>{row[0]}</td><td><span>{row[1]}</span></td><td>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td><td>{row[5]}</td><td><a href={products[0].pdf}>下载 ↗</a></td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Traceability() {
  const urlCode = new URLSearchParams(window.location.search).get("code") || "";
  const [input, setInput] = useState(urlCode);
  const [message, setMessage] = useState("");
  const [searched, setSearched] = useState(() => {
    const digits = String(urlCode).replace(/\D/g, "");
    return digits.length === 16;
  });

  function searchTrace(event, nextCode = input) {
    event?.preventDefault();
    const normalized = String(nextCode || "").replace(/\D/g, "");
    if (normalized.length !== 16) {
      setInput(normalized);
      setMessage("请输入16位追溯码");
      setSearched(false);
      return;
    }
    setInput(normalized);
    setMessage("");
    setSearched(true);
    window.location.href = buildTraceUrl(normalized);
  }

  return (
    <div className="trace-page">
      <section className="trace-hero">
        <h1>FRANTA 产品追溯查询</h1>
        <form className="trace-search" onSubmit={searchTrace}>
          <input
            value={input}
            onChange={(e) => { setInput(e.target.value.replace(/\D/g, "")); if (message) setMessage(""); if (searched) setSearched(false); }}
            inputMode="numeric"
            maxLength={16}
            placeholder="请输入16位追溯码"
          />
          <button className="button trace-btn" type="submit">立即查询</button>
        </form>
        {message ? <p className="trace-error">{message}</p> : null}
        <p className="trace-hint">支持输入喷码或扫码结果查询</p>
      </section>

      {searched && (
        <section className="trace-result">
          <div className="trace-result-card">
            <div className="trace-result-head">
              <span className="trace-badge ok">正品</span>
              <span className="trace-result-label">查询结果</span>
            </div>
            <dl className="trace-result-grid">
              <div><dt>产品名称</dt><dd>G型沟槽式90°弯头</dd></div>
              <div><dt>追溯码</dt><dd>{input || "2026060101000002"}</dd></div>
              <div><dt>生产日期</dt><dd>2026-05-26</dd></div>
              <div><dt>材质</dt><dd>SUS304</dd></div>
              <div><dt>规格</dt><dd>DN125-DN300</dd></div>
              <div><dt>检验状态</dt><dd>已检验合格</dd></div>
            </dl>
          </div>
        </section>
      )}
    </div>
  );
}

function DownloadColumn({ title, items, field }) {
  return <article className="download-column"><h2>{title}</h2>{items.map((product) => <a key={product.slug} href={product[field]}><span>{product.name}</span><small>{field.toUpperCase()}</small></a>)}</article>;
}

function Quote({ selectedProducts, removeQuote, clearQuote }) {
  return <><PageHead eyebrow="Quote" title="询价单" text="本页只收集询价意向，不接支付、不做会员系统。" /><section className="quote-layout"><div><div className="toolbar"><strong>已选产品</strong><button className="text-button" onClick={clearQuote}>清空</button></div><div className="quote-items">{selectedProducts.length ? selectedProducts.map((product) => <article className="quote-item" key={product.slug}><ProductImage product={product} /><div><strong>{product.name}</strong><span>{product.id} · {product.material} · {product.size}</span></div><button className="text-button" onClick={() => removeQuote(product.slug)}>移除</button></article>) : <p className="empty-panel">询价单为空，请先从产品中心加入产品。</p>}</div></div><form className="quote-form"><label>公司名称<input required placeholder="请输入公司名称" /></label><label>联系人<input required placeholder="请输入联系人" /></label><label>电话 / 邮箱<input required placeholder="手机号或邮箱" /></label><label>补充需求<textarea rows="5" placeholder="数量、工况、交期、收货地等" /></label><button className="button large full" type="button">提交询价</button><p className="form-note">静态演示，后续接入 Pages Functions 与 D1。</p></form></section></>;
}

function PageHead({ eyebrow, title, text }) {
  return <section className="page-head"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{text}</p></section>;
}

function Footer({ navigate }) {
  return (
    <footer className="site-footer pro-footer">
      <div className="footer-brand">
        <strong>Franta B2B</strong>
        <p>不锈钢管件专家 | 304/316L 优质材料 | 精密制造</p>
        <small>© 2026 Franta. All rights reserved.</small>
      </div>
      <div className="footer-column">
        <strong>产品中心</strong>
        <Link href="/products/" navigate={navigate}>沟槽管件系统</Link>
        <Link href="/products/" navigate={navigate}>双卡压管件系统</Link>
        <Link href="/products/" navigate={navigate}>单卡压管件系统</Link>
        <Link href="/products/" navigate={navigate}>分水器系统</Link>
        <Link href="/products/" navigate={navigate}>法兰系统</Link>
      </div>
      <div className="footer-column">
        <strong>下载中心</strong>
        <Link href="/downloads/" navigate={navigate}>产品手册</Link>
        <Link href="/downloads/" navigate={navigate}>CAD 图纸</Link>
        <Link href="/downloads/" navigate={navigate}>3D 模型</Link>
        <Link href="/downloads/" navigate={navigate}>安装说明</Link>
        <Link href="/downloads/" navigate={navigate}>检测报告</Link>
      </div>
      <div className="footer-column">
        <strong>技术支持</strong>
        <Link href="/downloads/" navigate={navigate}>技术文档</Link>
        <Link href="/downloads/" navigate={navigate}>常见问题</Link>
        <Link href="/downloads/" navigate={navigate}>视频教程</Link>
        <Link href="/products/" navigate={navigate}>选型工具</Link>
        <Link href="/trace/" navigate={navigate}>追溯查询</Link>
        <Link href="/quote/" navigate={navigate}>联系我们</Link>
      </div>
      <div className="footer-contact">
        <a href="tel:4000000000">400-xxx-xxxx</a>
        <a href="mailto:info@franta.com">info@franta.com</a>
        <a className="button ghost" href={traceSystemUrl} target="_blank" rel="noreferrer">产品追溯</a>
        <Link className="button" href="/quote/" navigate={navigate}>联系我们</Link>
      </div>
    </footer>
  );
}

createRoot(document.getElementById("root")).render(<App />);
