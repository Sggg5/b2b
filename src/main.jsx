import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import products from "../data/products.json";
import "./styles.css";

const categories = ["沟槽管件", "环压管件", "分水器", "不锈钢管", "法兰", "阀门配件"];
const materials = [...new Set(products.map((product) => product.material))];
const pressures = [...new Set(products.map((product) => product.pressure))];
const connections = [...new Set(products.map((product) => product.connection))];
const quoteKey = "frantaQuoteItems";
const r2Image = (path) => `/files/products/images/${path}`;

const categoryImages = {
  "沟槽管件": r2Image("grooved/category-grooved-fittings.webp"),
  "环压管件": r2Image("press/category-press-fittings.webp"),
  "分水器": r2Image("manifold/category-manifold.webp"),
  "不锈钢管": r2Image("pipe/category-stainless-pipe.webp"),
  "法兰": r2Image("flange/category-flange.webp"),
  "阀门配件": r2Image("flange/category-valve-accessories.webp")
};

const solutions = [
  ["市政水务系统", "不锈钢管、法兰、阀门配件组合，适配泵房、管廊和二次供水。", "不锈钢管", r2Image("pipe/solution-municipal-water.webp")],
  ["消防与给排水", "沟槽管件快速连接，减少现场施工时间，便于后期维护。", "沟槽管件", r2Image("grooved/solution-fire-water.webp")],
  ["商业建筑分区供水", "分水器与环压管件配套，适合多支路、紧凑空间和标准化安装。", "分水器", r2Image("manifold/solution-commercial-water.webp")],
  ["工业循环水管路", "按压力、材质和连接方式选型，支持资料下载与项目询价。", "环压管件", r2Image("press/solution-industrial-loop.webp")]
];

const blogPosts = [
  ["沟槽连接和环压连接如何选择", "从施工效率、压力等级、维护方式比较常见不锈钢管路连接方案。"],
  ["不锈钢管件选型前要确认的 6 个参数", "材质、规格、压力、介质、连接方式和执行标准是询价前的核心信息。"],
  ["水务系统中分水器的典型应用", "用于地暖、净水、多支路供水和设备配套时，需要关注流量与支路数量。"]
];

const cases = [
  ["商业综合体给水改造", "环压管件 + 304 薄壁不锈钢管", "缩短现场安装周期，减少动火作业。"],
  ["市政泵房设备配套", "法兰 + 阀门配件 + 工业不锈钢管", "按压力等级统一选型，资料交付更完整。"],
  ["厂区循环水支路改造", "沟槽管件 + 分水器", "支路清晰，便于后期维护和扩展。"]
];

const advantages = [
  ["工程参数清楚", "围绕材质、规格、压力、连接方式组织产品资料，减少选型沟通成本。"],
  ["图纸资料集中", "PDF 样本、CAD 图纸、安装说明统一入口，适合工程采购和设计配套。"],
  ["轻量快速询价", "产品加入询价篮后补充数量、工况、交期即可形成询价线索。"],
  ["Cloudflare 架构", "Pages、Functions、R2、D1 与 GitHub 自动部署，轻量可靠。"]
];

const projectCases = [
  ["市政二次供水泵房", "不锈钢管 + 法兰 + 阀门配件", "按 PN16 管路统一资料交付，方便设备集成与后期维护。", r2Image("pipe/case-municipal-pump-room.webp")],
  ["商业综合体给水改造", "环压管件 + 304 薄壁不锈钢管", "减少现场焊接与停水时间，提高施工效率。", r2Image("press/case-commercial-retrofit.webp")],
  ["厂区循环水支路", "沟槽管件 + 分水器", "支路清晰、拆装方便，适合后续扩容。", r2Image("grooved/case-industrial-loop.webp")],
  ["净水设备成套配管", "分水器 + 环压管件", "小空间多支路安装，适配设备模块化交付。", r2Image("manifold/case-water-equipment.webp")]
];

const downloadZones = [
  ["产品资料", "按产品查看核心参数、规格范围和连接方式。", "/downloads/"],
  ["CAD 图纸", "用于项目选型、设备配套和施工图沟通。", "/downloads/"],
  ["PDF 样本", "集中下载产品样本和技术资料。", "/downloads/"],
  ["安装说明", "确认介质、压力、连接方式和现场安装空间。", "/downloads/"]
];

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
        {route.name === "home" && <Home addQuote={addQuote} navigate={navigate} />}
        {route.name === "products" && <Products addQuote={addQuote} removeQuote={removeQuote} selectedProducts={selectedProducts} navigate={navigate} />}
        {route.name === "productDetail" && <ProductDetail product={route.product} addQuote={addQuote} navigate={navigate} />}
        {route.name === "downloads" && <Downloads addQuote={addQuote} navigate={navigate} />}
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
  if (path === "/downloads" || path === "/downloads/") return { name: "downloads", active: "下载中心" };
  if (path === "/quote" || path === "/quote/") return { name: "quote", active: "询价单" };
  return { name: "home", active: "首页" };
}

function Link({ href, navigate, children, className }) {
  return (
    <a
      className={className}
      href={href}
      onClick={(event) => {
        event.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}

function ProductImage({ product, className = "" }) {
  const [src, setSrc] = useState(product.image);
  return <img className={className} src={src} alt={product.name} loading="eager" onError={() => setSrc(imageFallback(product.image, product.name))} />;
}

function R2Image({ src, alt, className = "" }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  return <img className={className} src={currentSrc} alt={alt} loading="eager" onError={() => setCurrentSrc(imageFallback(src, alt))} />;
}

function imageFallback(src, alt) {
  const key = `${src} ${alt}`;
  const hue = Math.abs([...key].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % 38;
  const isPipe = key.includes("pipe");
  const isManifold = key.includes("manifold");
  const isFlange = key.includes("flange") || key.includes("valve");
  const isPress = key.includes("press");
  const title = alt.replace(/[<>&]/g, "").slice(0, 28);
  const productShape = isPipe
    ? `<g stroke="#2b3947" stroke-width="34" stroke-linecap="round"><path d="M150 440H1050"/><path d="M180 560H1020"/><path d="M220 680H980"/></g>`
    : isManifold
      ? `<g stroke="#2b3947" stroke-width="28" stroke-linecap="round" fill="none"><path d="M170 610H1030"/><path d="M300 610V360M460 610V360M620 610V360M780 610V360M940 610V360"/></g>`
      : isFlange
        ? `<g fill="none" stroke="#2b3947" stroke-width="30"><circle cx="600" cy="560" r="230"/><circle cx="600" cy="560" r="92"/><circle cx="455" cy="415" r="28"/><circle cx="745" cy="415" r="28"/><circle cx="455" cy="705" r="28"/><circle cx="745" cy="705" r="28"/></g>`
        : isPress
          ? `<g fill="none" stroke="#2b3947" stroke-width="32" stroke-linecap="round"><path d="M190 600H475c70 0 126-56 126-126V310h300"/><path d="M250 520h180M695 390h185"/></g>`
          : `<g fill="none" stroke="#2b3947" stroke-width="32" stroke-linecap="round"><path d="M190 620H520c92 0 166-74 166-166V300h330"/><path d="M240 530h220M770 405h205"/></g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200"><rect width="1200" height="1200" fill="#fff"/><rect x="70" y="70" width="1060" height="1060" rx="42" fill="#fff" stroke="#e3e8ed"/><ellipse cx="610" cy="820" rx="360" ry="42" fill="#eef2f5"/><g transform="translate(0 ${hue - 18})">${productShape}</g><rect x="120" y="980" width="960" height="2" fill="#e4e9ee"/><text x="120" y="1048" fill="#1f2c38" font-family="Arial, sans-serif" font-size="44" font-weight="700">${title}</text><text x="120" y="1105" fill="#6b7580" font-family="Arial, sans-serif" font-size="25">1200x1200 white background product image</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function Header({ active, navigate, quoteCount }) {
  const nav = [["首页", "/"], ["产品中心", "/products/"], ["下载中心", "/downloads/"], ["询价单", "/quote/"]];
  return (
    <header className="site-header">
      <Link className="brand" href="/" navigate={navigate}>
        <span className="brand-mark">F</span>
        <span><strong>Franta B2B</strong><small>不锈钢管件产品中心</small></span>
      </Link>
      <nav className="top-nav" aria-label="主导航">
        {nav.map(([label, href]) => (
          <Link key={label} className={active === label ? "active" : ""} href={href} navigate={navigate}>
            {label}{label === "询价单" && quoteCount > 0 ? <span className="nav-count">{quoteCount}</span> : null}
          </Link>
        ))}
      </nav>
    </header>
  );
}

function Home({ addQuote, navigate }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [aiUse, setAiUse] = useState("");
  const [aiSize, setAiSize] = useState("");
  const [aiPressure, setAiPressure] = useState("");
  const heroProduct = products[6] || products[0];

  function submitSearch(event) {
    event.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/products/?q=${encodeURIComponent(query)}` : "/products/");
  }

  function submitAi(event) {
    event.preventDefault();
    const query = [aiUse, aiSize, aiPressure].filter(Boolean).join(" ");
    navigate(query ? `/products/?q=${encodeURIComponent(query)}` : "/products/");
  }

  return (
    <>
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Stainless Piping Components</p>
          <h1>不锈钢管件、沟槽管件与水务系统配套选型</h1>
          <p>5 秒内完成路径判断：搜索产品，查看参数，下载 CAD/PDF，加入询价单。</p>
          <form className="home-search" onSubmit={submitSearch}>
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="搜索型号、分类、材质，如 DN50、法兰、SUS304" />
            <button className="button" type="submit">搜索产品</button>
          </form>
          <div className="hero-actions">
            <Link className="button large" href="/products/" navigate={navigate}>进入产品中心</Link>
            <Link className="button ghost large" href="/quote/" navigate={navigate}>提交询价</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-visual-main">
            <ProductImage product={heroProduct} />
            <div>
              <span>{heroProduct.category} · {heroProduct.id}</span>
              <strong>{heroProduct.name}</strong>
              <p>{heroProduct.material} · {heroProduct.size} · {heroProduct.pressure}</p>
            </div>
          </div>
        </div>
      </section>
      <SectionHead eyebrow="Product Range" title="产品分类" action={<Link className="text-button" href="/products/" navigate={navigate}>查看全部</Link>} />
      <section className="home-section home-category-grid">
        {categories.map((category) => {
          return <Link key={category} className="home-category-card" href={`/products/?category=${encodeURIComponent(category)}`} navigate={navigate}><R2Image src={categoryImages[category]} alt={`${category} 分类图`} /><strong>{category}</strong></Link>;
        })}
      </section>
      <section className="home-section ai-selector">
        <div><p className="eyebrow">AI Selection</p><h2>{"AI \u9009\u578b"}</h2><p>{"\u8f93\u5165 3 \u4e2a\u6761\u4ef6\uff0c\u5148\u7f29\u5c0f\u8303\u56f4\uff0c\u518d\u8fdb\u5165\u4ea7\u54c1\u4e2d\u5fc3\u67e5\u770b\u53c2\u6570\u548c\u8d44\u6599\u3002"}</p></div>
        <form className="ai-selector-form" onSubmit={submitAi}>
          <label>{"\u5e94\u7528\u573a\u666f"}<select value={aiUse} onChange={(event) => setAiUse(event.target.value)}><option value="">{"\u8bf7\u9009\u62e9"}</option><option>{"\u6c34\u52a1\u7cfb\u7edf"}</option><option>{"\u6d88\u9632\u7ed9\u6392\u6c34"}</option><option>{"\u5546\u4e1a\u5efa\u7b51"}</option><option>{"\u5de5\u4e1a\u5faa\u73af\u6c34"}</option></select></label>
          <label>{"\u7ba1\u5f84\u8303\u56f4"}<select value={aiSize} onChange={(event) => setAiSize(event.target.value)}><option value="">{"\u8bf7\u9009\u62e9"}</option><option>{"DN15-DN50"}</option><option>{"DN50-DN150"}</option><option>{"DN150-DN300"}</option></select></label>
          <label>{"\u538b\u529b\u7b49\u7ea7"}<select value={aiPressure} onChange={(event) => setAiPressure(event.target.value)}><option value="">{"\u8bf7\u9009\u62e9"}</option><option>{"PN10"}</option><option>{"PN16"}</option><option>{"PN25"}</option><option>{"PN40"}</option></select></label>
          <button className="button large" type="submit">{"\u67e5\u770b\u63a8\u8350\u4ea7\u54c1"}</button>
        </form>
      </section>
      <SectionHead eyebrow="Water Projects" title="水务项目案例" />
      <section className="home-section project-case-grid">
        {projectCases.map(([title, productText, result, image]) => <article className="project-case-card" key={title}><R2Image src={image} alt={`${title} 案例图`} /><h3>{title}</h3><strong>{productText}</strong><p>{result}</p></article>)}
      </section>
      <section className="home-section split-home-section">
        <div className="section-heading"><p className="eyebrow">Technical Blog</p><h2>新闻 / 技术博客</h2><p>围绕选型、施工、资料交付和水务系统应用持续沉淀技术内容。</p></div>
        <div className="article-list">{blogPosts.map(([title, text]) => <article key={title}><span>选型指南</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>
    </>
  );
}

function SectionHead({ eyebrow, title, action }) {
  return <div className="home-section home-section-head"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{action}</div>;
}

function ProductMini({ product, navigate }) {
  return <Link className="home-product-mini" href={`/products/${product.slug}/`} navigate={navigate}><ProductImage product={product} /><span>{product.category}</span><strong>{product.name}</strong></Link>;
}

function HotProduct({ product, addQuote, navigate }) {
  return <article className="hot-product-card"><Link className="hot-product-image" href={`/products/${product.slug}/`} navigate={navigate}><ProductImage product={product} /></Link><div><span>{product.id}</span><h3><Link href={`/products/${product.slug}/`} navigate={navigate}>{product.name}</Link></h3><p>{product.material} · {product.size} · {product.pressure}</p></div><button className="button small" onClick={() => addQuote(product.slug)}>加入询价</button></article>;
}

function Products({ addQuote, removeQuote, selectedProducts, navigate }) {
  const search = new URLSearchParams(window.location.search);
  const [category, setCategory] = useState(search.get("category") || "");
  const [material, setMaterial] = useState("");
  const [pressure, setPressure] = useState("");
  const [connection, setConnection] = useState("");
  const [keyword, setKeyword] = useState(search.get("q") || "");
  const [view, setView] = useState("table");
  const filtered = useMemo(() => products.filter((product) =>
    (!category || product.category === category) &&
    (!material || product.material === material) &&
    (!pressure || product.pressure === pressure) &&
    (!connection || product.connection === connection) &&
    (!keyword || `${product.name} ${product.id} ${product.description}`.toLowerCase().includes(keyword.toLowerCase()))
  ), [category, material, pressure, connection, keyword]);

  return (
    <>
      <PageHead eyebrow="Products" title="产品中心" text="分类筛选、参数筛选、卡片/列表切换和产品详情页，面向工业采购选型。" />
      <section className="catalog-layout">
        <aside className="filters">
          <div className="filter-title">分类</div>
          <div className="category-list"><button className={!category ? "category-chip active" : "category-chip"} onClick={() => setCategory("")}>全部产品<span>{products.length}</span></button>{categories.map((item) => <button key={item} className={category === item ? "category-chip active" : "category-chip"} onClick={() => setCategory(item)}>{item}<span>{products.filter((product) => product.category === item).length}</span></button>)}</div>
          <div className="filter-title sub">材质</div>
          <div className="filter-pill-list"><button className={!material ? "active" : ""} onClick={() => setMaterial("")}>全部</button>{materials.map((item) => <button key={item} className={material === item ? "active" : ""} onClick={() => setMaterial(item)}>{item}</button>)}</div>
          <div className="filter-title sub">压力等级</div>
          <div className="filter-pill-list"><button className={!pressure ? "active" : ""} onClick={() => setPressure("")}>全部</button>{pressures.map((item) => <button key={item} className={pressure === item ? "active" : ""} onClick={() => setPressure(item)}>{item}</button>)}</div>
          <div className="filter-title sub">连接方式</div>
          <div className="filter-pill-list"><button className={!connection ? "active" : ""} onClick={() => setConnection("")}>全部</button>{connections.map((item) => <button key={item} className={connection === item ? "active" : ""} onClick={() => setConnection(item)}>{item}</button>)}</div>
          <div className="filter-title sub">关键词</div>
          <label>关键词<input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="产品名 / 型号 / 描述" /></label>
          <button className="button ghost full" onClick={() => { setCategory(""); setMaterial(""); setPressure(""); setConnection(""); setKeyword(""); }}>重置筛选</button>
        </aside>
        <div className="catalog-main">
          <div className="toolbar"><strong>{filtered.length} 个产品</strong><div className="segmented"><button className={view === "card" ? "active" : ""} onClick={() => setView("card")}>卡片</button><button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>列表</button><button className={view === "table" ? "active" : ""} onClick={() => setView("table")}>表格</button></div></div>
          {view === "table" ? <ProductTable products={filtered} addQuote={addQuote} navigate={navigate} /> : <div className={view === "card" ? "product-grid" : "product-grid list-view"}>{filtered.map((product) => <ProductCard key={product.slug} product={product} addQuote={addQuote} navigate={navigate} />)}</div>}
        </div>
      </section>
    </>
  );
}

function ProductTable({ products: rows, addQuote, navigate }) {
  return (
    <div className="product-table-wrap">
      <table className="product-table">
        <thead><tr><th>产品</th><th>分类</th><th>材质</th><th>规格</th><th>压力</th><th>连接</th><th>CAD</th><th>PDF</th><th>询价</th></tr></thead>
        <tbody>
          {rows.map((product) => (
            <tr key={product.slug}>
              <td><Link href={`/products/${product.slug}/`} navigate={navigate}>{product.name}</Link><small>{product.id}</small></td>
              <td>{product.category}</td>
              <td>{product.material}</td>
              <td>{product.size}</td>
              <td>{product.pressure}</td>
              <td>{product.connection}</td>
              <td><a className="text-button" href={product.cad}>CAD</a></td>
              <td><a className="text-button" href={product.pdf}>PDF</a></td>
              <td><button className="button small" onClick={() => addQuote(product.slug)}>询价</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductCard({ product, addQuote, navigate }) {
  return <article className="product-card"><Link className="product-image" href={`/products/${product.slug}/`} navigate={navigate}><ProductImage product={product} /></Link><div className="product-content"><div className="product-title-row"><div><div className="eyebrow">{product.category} · {product.id}</div><h3><Link href={`/products/${product.slug}/`} navigate={navigate}>{product.name}</Link></h3></div><span className="stock-badge">可询价</span></div><p>{product.description}</p><SpecTable product={product} compact /><div className="card-actions"><Link className="button ghost" href={`/products/${product.slug}/`} navigate={navigate}>查看详情</Link><a className="button ghost" href={product.cad}>CAD</a><a className="button ghost" href={product.pdf}>PDF</a><button className="button" onClick={() => addQuote(product.slug)}>加入询价单</button></div></div></article>;
}

function ProductDetail({ product, addQuote, navigate }) {
  const related = [...products.filter((item) => item.slug !== product.slug && item.category === product.category), ...products.filter((item) => item.slug !== product.slug && item.category !== product.category)].slice(0, 3);
  return (
    <>
      <section className="detail-layout"><div className="detail-media"><ProductImage product={product} /></div><div className="detail-copy"><p className="eyebrow">{product.category} · {product.id}</p><h1>{product.name}</h1><p>{product.description}</p><section className="detail-panel"><h2>核心参数</h2><SpecTable product={product} detail /></section><div className="detail-actions"><button className="button large" onClick={() => addQuote(product.slug)}>加入询价单</button><a className="button ghost large" href={product.pdf}>PDF 样本</a><a className="button ghost large" href={product.cad}>CAD 图纸</a></div></div></section>
      <section className="section two-column-section"><div className="detail-panel"><p className="eyebrow">Downloads</p><h2>下载资料</h2><div className="download-list"><a href={product.pdf}><strong>PDF 产品样本</strong><span>规格、材质、安装说明</span></a><a href={product.cad}><strong>CAD 图纸</strong><span>用于项目选型和工程配套</span></a></div></div><div className="detail-panel"><p className="eyebrow">Related</p><h2>相关产品</h2><div className="related-list">{related.map((item) => <Link key={item.slug} href={`/products/${item.slug}/`} navigate={navigate}><span>{item.category}</span><strong>{item.name}</strong><small>{item.material} · {item.size}</small></Link>)}</div></div></section>
    </>
  );
}

function SpecTable({ product }) {
  return <table className="spec-table"><tbody><tr><th>材质</th><td>{product.material}</td><th>规格</th><td>{product.size}</td></tr><tr><th>压力</th><td>{product.pressure}</td><th>连接</th><td>{product.connection}</td></tr></tbody></table>;
}

function Downloads({ addQuote, navigate }) {
  return <><PageHead eyebrow="Downloads" title="下载中心" text="集中提供产品资料、CAD 图纸、PDF 样本和安装说明，文件从 Cloudflare R2 读取。" /><section className="download-center"><DownloadColumn title="产品资料" items={products} field="pdf" /><DownloadColumn title="CAD 图纸" items={products} field="cad" /><DownloadColumn title="PDF 样本" items={products} field="pdf" /><div className="download-column"><h2>安装说明</h2>{products.slice(0, 6).map((product) => <article key={product.slug}><strong>{product.name}</strong><span>确认介质、压力、连接方式和现场安装空间。</span><button className="text-button" onClick={() => addQuote(product.slug)}>加入询价</button></article>)}</div></section></>;
}

function DownloadColumn({ title, items, field }) {
  return <div className="download-column"><h2>{title}</h2>{items.slice(0, 6).map((product) => <article key={`${title}-${product.slug}`}><strong>{product.name}</strong><span>{product.id} · {product.category}</span><a className="text-button" href={product[field]}>下载</a></article>)}</div>;
}

function Quote({ selectedProducts, removeQuote, clearQuote }) {
  return <><PageHead eyebrow="Quote" title="询价单" text="本页只收集询价意向，不接支付、不做会员系统。后续可用 Pages Functions + D1 保存询价。" /><section className="quote-layout"><div><div className="toolbar"><strong>已选产品</strong><button className="text-button" onClick={clearQuote}>清空</button></div><div className="quote-items">{selectedProducts.length ? selectedProducts.map((product) => <article className="quote-item" key={product.slug}><ProductImage product={product} /><div><strong>{product.name}</strong><span>{product.id} · {product.material} · {product.size}</span></div><button className="text-button" onClick={() => removeQuote(product.slug)}>移除</button></article>) : <p className="empty-panel">询价单为空，请先从产品中心加入产品。</p>}</div></div><form className="quote-form"><label>公司名称<input required placeholder="请输入公司名称" /></label><label>联系人<input required placeholder="请输入联系人" /></label><label>电话 / 邮箱<input required placeholder="手机号或邮箱" /></label><label>补充需求<textarea rows="5" placeholder="数量、工况、交期、收货地等" /></label><button className="button large full" type="button">提交询价</button><p className="form-note">静态演示，后续接入 Pages Functions 与 D1。</p></form></section></>;
}

function QuoteRail({ selectedProducts, removeQuote, navigate }) {
  return <aside className="quote-rail"><div className="quote-rail-head"><div><p className="eyebrow">Quote Basket</p><h2>询价篮</h2></div><span>{selectedProducts.length}</span></div><div className="mini-quote-items">{selectedProducts.length ? selectedProducts.map((product) => <article className="mini-quote-item" key={product.slug}><div><strong>{product.name}</strong><span>{product.id}</span></div><button className="text-button" onClick={() => removeQuote(product.slug)}>移除</button></article>) : <p className="empty-panel tight">尚未加入产品。</p>}</div><Link className="button full" href="/quote/" navigate={navigate}>进入询价单</Link></aside>;
}

function PageHead({ eyebrow, title, text }) {
  return <section className="page-head"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{text}</p></section>;
}

function Footer({ navigate }) {
  return <footer className="site-footer"><div><strong>Franta B2B</strong><p>Cloudflare Pages + Functions + R2 + D1 架构的轻量工业 B2B 官网。</p></div><div className="footer-links"><Link href="/products/" navigate={navigate}>产品中心</Link><Link href="/downloads/" navigate={navigate}>下载中心</Link><Link href="/quote/" navigate={navigate}>询价单</Link></div></footer>;
}

createRoot(document.getElementById("root")).render(<App />);
