import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import products from "../data/products.json";
import "./styles.css";

const categories = ["沟槽管件", "环压管件", "分水器", "不锈钢管", "法兰", "阀门配件"];
const materials = [...new Set(products.map((product) => product.material))];
const pressures = [...new Set(products.map((product) => product.pressure))];
const quoteKey = "frantaQuoteItems";

const solutions = [
  ["市政水务系统", "不锈钢管、法兰、阀门配件组合，适配泵房、管廊和二次供水。", "不锈钢管"],
  ["消防与给排水", "沟槽管件快速连接，减少现场施工时间，便于后期维护。", "沟槽管件"],
  ["商业建筑分区供水", "分水器与环压管件配套，适合多支路、紧凑空间和标准化安装。", "分水器"],
  ["工业循环水管路", "按压力、材质和连接方式选型，支持资料下载与项目询价。", "环压管件"]
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
  ["参数清楚", "围绕材质、规格、压力、连接方式组织产品资料。"],
  ["资料完整", "PDF 样本、CAD 图纸、安装说明统一入口，后续可接 R2 文件库。"],
  ["快速询价", "选型后直接加入询价单，减少来回沟通成本。"],
  ["Cloudflare 架构", "Pages、Functions、R2、D1 与 GitHub 自动部署，轻量可靠。"]
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
  return (
    <>
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Stainless Piping Components</p>
          <h1>轻量版工业 B2B 官网，服务水务系统与不锈钢管路选型</h1>
          <p>覆盖沟槽管件、环压管件、分水器、不锈钢管、法兰与阀门配件，提供产品参数、资料下载、技术内容和快速询价入口。</p>
          <div className="hero-actions">
            <Link className="button large" href="/products/" navigate={navigate}>进入产品中心</Link>
            <Link className="button ghost large" href="/quote/" navigate={navigate}>提交询价</Link>
          </div>
          <div className="hero-metrics"><span><strong>{products.length}</strong> 款产品</span><span><strong>{categories.length}</strong> 大分类</span><span><strong>R2</strong> 文件资料</span></div>
        </div>
        <div className="hero-product-board">
          {products.slice(0, 4).map((product) => <ProductMini key={product.slug} product={product} navigate={navigate} />)}
        </div>
      </section>
      <SectionHead eyebrow="Product Range" title="产品分类" action={<Link className="text-button" href="/products/" navigate={navigate}>查看全部</Link>} />
      <section className="home-section home-category-grid">
        {categories.map((category) => {
          const product = products.find((item) => item.category === category);
          return <Link key={category} className="home-category-card" href={`/products/?category=${encodeURIComponent(category)}`} navigate={navigate}><img src={product.image} alt={category} /><span>{products.filter((item) => item.category === category).length} 款</span><strong>{category}</strong></Link>;
        })}
      </section>
      <SectionHead eyebrow="Popular" title="热门产品" action={<Link className="text-button" href="/quote/" navigate={navigate}>查看询价单</Link>} />
      <section className="home-section hot-product-grid">
        {products.slice(2, 8).map((product) => <HotProduct key={product.slug} product={product} addQuote={addQuote} navigate={navigate} />)}
      </section>
      <SectionHead eyebrow="Solutions" title="应用行业" />
      <section className="home-section solution-grid">
        {solutions.map(([title, text, category]) => <Link key={title} className="solution-card" href={`/products/?category=${encodeURIComponent(category)}`} navigate={navigate}><span>{category}</span><h3>{title}</h3><p>{text}</p></Link>)}
      </section>
      <section className="home-section split-home-section">
        <div className="section-heading"><p className="eyebrow">Technical Blog</p><h2>新闻 / 技术博客</h2><p>围绕选型、施工、资料交付和水务系统应用持续沉淀技术内容。</p></div>
        <div className="article-list">{blogPosts.map(([title, text]) => <article key={title}><span>选型指南</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>
      <SectionHead eyebrow="Cases" title="客户案例" />
      <section className="home-section case-grid">{cases.map(([title, productText, result]) => <article className="case-card" key={title}><h3>{title}</h3><strong>{productText}</strong><p>{result}</p></article>)}</section>
      <SectionHead eyebrow="Advantages" title="企业优势" />
      <section className="home-section advantage-grid">{advantages.map(([title, text]) => <article key={title}><strong>{title}</strong><p>{text}</p></article>)}</section>
      <section className="home-section contact-cta"><div><p className="eyebrow">Inquiry</p><h2>准备开始项目询价？</h2><p>选择产品加入询价单，补充工况、数量和交期，我们可以继续接入 Pages Functions + D1 保存线索。</p></div><Link className="button large" href="/quote/" navigate={navigate}>进入询价单</Link></section>
    </>
  );
}

function SectionHead({ eyebrow, title, action }) {
  return <div className="home-section home-section-head"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{action}</div>;
}

function ProductMini({ product, navigate }) {
  return <Link className="home-product-mini" href={`/products/${product.slug}/`} navigate={navigate}><img src={product.image} alt={product.name} /><span>{product.category}</span><strong>{product.name}</strong></Link>;
}

function HotProduct({ product, addQuote, navigate }) {
  return <article className="hot-product-card"><Link className="hot-product-image" href={`/products/${product.slug}/`} navigate={navigate}><img src={product.image} alt={product.name} /></Link><div><span>{product.id}</span><h3><Link href={`/products/${product.slug}/`} navigate={navigate}>{product.name}</Link></h3><p>{product.material} · {product.size} · {product.pressure}</p></div><button className="button small" onClick={() => addQuote(product.slug)}>加入询价</button></article>;
}

function Products({ addQuote, removeQuote, selectedProducts, navigate }) {
  const search = new URLSearchParams(window.location.search);
  const [category, setCategory] = useState(search.get("category") || "");
  const [material, setMaterial] = useState("");
  const [pressure, setPressure] = useState("");
  const [keyword, setKeyword] = useState("");
  const [view, setView] = useState("card");
  const filtered = useMemo(() => products.filter((product) =>
    (!category || product.category === category) &&
    (!material || product.material === material) &&
    (!pressure || product.pressure === pressure) &&
    (!keyword || `${product.name} ${product.id} ${product.description}`.toLowerCase().includes(keyword.toLowerCase()))
  ), [category, material, pressure, keyword]);

  return (
    <>
      <PageHead eyebrow="Products" title="产品中心" text="分类筛选、参数筛选、卡片/列表切换和产品详情页，面向工业采购选型。" />
      <section className="catalog-layout">
        <aside className="filters">
          <div className="filter-title">分类筛选</div>
          <div className="category-list"><button className={!category ? "category-chip active" : "category-chip"} onClick={() => setCategory("")}>全部产品<span>{products.length}</span></button>{categories.map((item) => <button key={item} className={category === item ? "category-chip active" : "category-chip"} onClick={() => setCategory(item)}>{item}<span>{products.filter((product) => product.category === item).length}</span></button>)}</div>
          <div className="filter-title sub">参数筛选</div>
          <label>关键词<input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="产品名 / 型号 / 描述" /></label>
          <label>材质<select value={material} onChange={(event) => setMaterial(event.target.value)}><option value="">全部材质</option>{materials.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>压力<select value={pressure} onChange={(event) => setPressure(event.target.value)}><option value="">全部压力</option>{pressures.map((item) => <option key={item}>{item}</option>)}</select></label>
          <button className="button ghost full" onClick={() => { setCategory(""); setMaterial(""); setPressure(""); setKeyword(""); }}>重置筛选</button>
        </aside>
        <div className="catalog-main">
          <div className="toolbar"><strong>{filtered.length} 个产品</strong><div className="segmented"><button className={view === "card" ? "active" : ""} onClick={() => setView("card")}>卡片</button><button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>列表</button></div></div>
          <div className={view === "card" ? "product-grid" : "product-grid list-view"}>{filtered.map((product) => <ProductCard key={product.slug} product={product} addQuote={addQuote} navigate={navigate} />)}</div>
        </div>
        <QuoteRail selectedProducts={selectedProducts} removeQuote={removeQuote} navigate={navigate} />
      </section>
    </>
  );
}

function ProductCard({ product, addQuote, navigate }) {
  return <article className="product-card"><Link className="product-image" href={`/products/${product.slug}/`} navigate={navigate}><img src={product.image} alt={product.name} loading="lazy" /></Link><div className="product-content"><div className="product-title-row"><div><div className="eyebrow">{product.category} · {product.id}</div><h3><Link href={`/products/${product.slug}/`} navigate={navigate}>{product.name}</Link></h3></div><span className="stock-badge">可询价</span></div><p>{product.description}</p><SpecTable product={product} compact /><div className="card-actions"><Link className="button ghost" href={`/products/${product.slug}/`} navigate={navigate}>查看详情</Link><button className="button" onClick={() => addQuote(product.slug)}>加入询价单</button></div></div></article>;
}

function ProductDetail({ product, addQuote, navigate }) {
  const related = [...products.filter((item) => item.slug !== product.slug && item.category === product.category), ...products.filter((item) => item.slug !== product.slug && item.category !== product.category)].slice(0, 3);
  return (
    <>
      <section className="detail-layout"><div className="detail-media"><img src={product.image} alt={product.name} /></div><div className="detail-copy"><p className="eyebrow">{product.category} · {product.id}</p><h1>{product.name}</h1><p>{product.description}</p><section className="detail-panel"><h2>核心参数</h2><SpecTable product={product} detail /></section><div className="detail-actions"><button className="button large" onClick={() => addQuote(product.slug)}>加入询价单</button><a className="button ghost large" href={product.pdf}>PDF 样本</a><a className="button ghost large" href={product.cad}>CAD 图纸</a></div></div></section>
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
  return <><PageHead eyebrow="Quote" title="询价单" text="本页只收集询价意向，不接支付、不做会员系统。后续可用 Pages Functions + D1 保存询价。" /><section className="quote-layout"><div><div className="toolbar"><strong>已选产品</strong><button className="text-button" onClick={clearQuote}>清空</button></div><div className="quote-items">{selectedProducts.length ? selectedProducts.map((product) => <article className="quote-item" key={product.slug}><img src={product.image} alt={product.name} /><div><strong>{product.name}</strong><span>{product.id} · {product.material} · {product.size}</span></div><button className="text-button" onClick={() => removeQuote(product.slug)}>移除</button></article>) : <p className="empty-panel">询价单为空，请先从产品中心加入产品。</p>}</div></div><form className="quote-form"><label>公司名称<input required placeholder="请输入公司名称" /></label><label>联系人<input required placeholder="请输入联系人" /></label><label>电话 / 邮箱<input required placeholder="手机号或邮箱" /></label><label>补充需求<textarea rows="5" placeholder="数量、工况、交期、收货地等" /></label><button className="button large full" type="button">提交询价</button><p className="form-note">静态演示，后续接入 Pages Functions 与 D1。</p></form></section></>;
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
