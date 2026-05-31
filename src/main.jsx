import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import products from "../data/products.json";
import "./styles.css";

const categories = [...new Set(products.map((product) => product.category))];
const materials = [...new Set(products.map((product) => product.material))];
const pressures = [...new Set(products.map((product) => product.pressure))];
const connections = [...new Set(products.map((product) => product.connection))];
const quoteKey = "frantaQuoteItems";

const categoryMeta = {
  "沟槽管件": ["沟槽管件系统", "适用于消防、给排水和水务主干管路"],
  "双卡管件": ["双卡压管件系统", "高可靠密封，适合工程级管路连接"],
  "单卡管件": ["单卡压管件系统", "轻量快装，适合建筑与设备配套"],
  "不锈钢管": ["不锈钢水管系统", "304/316L 管材，覆盖 DN15-DN300"],
  "保温管": ["保温管系统", "降低热损耗，适配冷热水输送"],
  "覆塑管": ["覆塑管系统", "外覆保护层，适合复杂安装环境"]
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

const blogPosts = [
  ["沟槽连接和环压连接如何选择", "从施工效率、压力等级、维护方式比较两种管路连接方案。", "2024-05-12", products[0]],
  ["不锈钢管件选型的 6 个参数", "材质、规格、压力、介质、连接方式和执行标准是询价前核心信息。", "2024-05-08", products.find((item) => item.category === "单卡管件") || products[1]],
  ["水务系统中分水器的典型应用", "用于泵房、净水、多支路设备配套时，需要关注流量与支路数量。", "2024-05-05", products.find((item) => item.category === "不锈钢管") || products[2]]
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
        {route.name === "home" && <Home navigate={navigate} />}
        {route.name === "products" && <Products addQuote={addQuote} navigate={navigate} />}
        {route.name === "productDetail" && <ProductDetail product={route.product} addQuote={addQuote} navigate={navigate} />}
        {route.name === "downloads" && <Downloads />}
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
  if (path === "/quote" || path === "/quote/") return { name: "quote", active: "联系我们" };
  return { name: "home", active: "首页" };
}

function Link({ href, navigate, children, className }) {
  return (
    <a className={className} href={href} onClick={(event) => { event.preventDefault(); navigate(href); }}>
      {children}
    </a>
  );
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
  const nav = [["首页", "/"], ["产品中心", "/products/"], ["解决方案", "/products/"], ["下载中心", "/downloads/"], ["技术支持", "/downloads/"], ["关于我们", "/"]];
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
  const heroProduct = products.find((item) => item.slug === "grooved-tee") || products[0];

  function submitAi(event) {
    event.preventDefault();
    navigate(`/products/?q=${encodeURIComponent(aiQuery)}`);
  }

  return (
    <div className="pro-home">
      <section className="pro-hero">
        <div className="pro-hero-copy">
          <p className="eyebrow">STAINLESS PIPING COMPONENTS</p>
          <h1>不锈钢管件、沟槽管件与水务系统配套选型</h1>
          <p>5秒内完成粗略选型：提供产品、查看参数、下载 CAD/PDF、加入询价单，快速响应工程需求。</p>
          <div className="pro-hero-actions">
            <Link className="button large" href="/products/" navigate={navigate}>进入产品中心</Link>
            <Link className="button ghost large" href="/quote/" navigate={navigate}>提交询价</Link>
          </div>
          <div className="pro-features">
            <Feature title="304/316L" text="优质材质" />
            <Feature title="全规格覆盖" text="DN15-DN300" />
            <Feature title="快速选型" text="精准匹配" />
            <Feature title="资料下载" text="CAD / PDF" />
          </div>
        </div>
        <div className="pro-hero-media">
          <span className="hero-shape" />
          <ProductImage product={heroProduct} />
        </div>
      </section>
      <div className="slider-dots"><span /><span /><span /></div>

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

      <section className="pro-ai">
        <div>
          <h2>AI 智能选型助手</h2>
          <p>输入您的需求，AI 为您推荐最合适的产品方案。</p>
          <form onSubmit={submitAi} className="pro-ai-form">
            <input value={aiQuery} onChange={(event) => setAiQuery(event.target.value)} placeholder="输入公称通径、使用场景、压力等级..." />
            <button className="button" type="submit">开始选型</button>
          </form>
        </div>
        <div className="ai-ghost-card">
          <strong>推荐方案</strong>
          <span>沟槽式 90° 弯头</span>
          <span>DN100 / SUS304 / PN16</span>
          <Link href="/products/" navigate={navigate}>查看详情</Link>
        </div>
      </section>

      <HomeBlock title="技术博客" action="查看全部文章 →" href="/downloads/" navigate={navigate}>
        <div className="pro-blog-grid">
          {blogPosts.map(([title, text, date, product]) => <article className="pro-blog-card" key={title}><ProductImage product={product} /><div><h3>{title}</h3><p>{text}</p><span>{date}</span><Link href="/downloads/" navigate={navigate}>阅读全文 →</Link></div></article>)}
        </div>
      </HomeBlock>
    </div>
  );
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
  const [view, setView] = useState("table");

  const filtered = useMemo(() => products.filter((product) => {
    const matchKeyword = `${product.name}${product.id}${product.description}`.toLowerCase().includes(keyword.toLowerCase());
    return (category === "全部" || product.category === category) &&
      (material === "全部" || product.material === material) &&
      (pressure === "全部" || product.pressure === pressure) &&
      (connection === "全部" || product.connection === connection) &&
      matchKeyword;
  }), [category, material, pressure, connection, keyword]);

  return (
    <>
      <PageHead eyebrow="Products" title="产品中心" text="按分类、材质、压力等级和连接方式快速筛选产品，支持 CAD/PDF 下载与加入询价单。" />
      <section className="product-shell">
        <aside className="filters">
          <h2>筛选条件</h2>
          <FilterPills title="分类" options={["全部", ...categories]} value={category} setValue={setCategory} />
          <FilterPills title="材质" options={["全部", ...materials]} value={material} setValue={setMaterial} />
          <FilterPills title="压力等级" options={["全部", ...pressures]} value={pressure} setValue={setPressure} />
          <FilterPills title="连接方式" options={["全部", ...connections]} value={connection} setValue={setConnection} />
        </aside>
        <div className="product-main">
          <div className="product-toolbar">
            <label>关键词<input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="产品名 / 型号 / 描述" /></label>
            <div className="segmented"><button className={view === "table" ? "active" : ""} onClick={() => setView("table")}>表格</button><button className={view === "card" ? "active" : ""} onClick={() => setView("card")}>卡片</button></div>
          </div>
          {view === "table" ? <ProductTable products={filtered} addQuote={addQuote} navigate={navigate} /> : <div className="product-grid">{filtered.map((product) => <ProductCard key={product.slug} product={product} addQuote={addQuote} navigate={navigate} />)}</div>}
        </div>
        <aside className="quote-basket"><h2>询价篮</h2><p>在产品列表中点击“加入询价单”，统一提交工程需求。</p><Link className="button full" href="/quote/" navigate={navigate}>查看询价单</Link></aside>
      </section>
    </>
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
  return (
    <>
      <section className="detail-layout"><div className="detail-media"><ProductImage product={product} /></div><div className="detail-copy"><p className="eyebrow">{product.category} · {product.id}</p><h1>{product.name}</h1><p>{product.description}</p><section className="detail-panel"><h2>核心参数</h2><SpecTable product={product} /></section><div className="detail-actions"><button className="button large" onClick={() => addQuote(product.slug)}>加入询价单</button><a className="button ghost large" href={product.pdf}>PDF 样本</a><a className="button ghost large" href={product.cad}>CAD 图纸</a></div></div></section>
      <section className="section"><div className="section-head"><h2>相关产品</h2><Link href="/products/" navigate={navigate}>返回产品中心</Link></div><div className="product-grid">{related.map((item) => <ProductCard key={item.slug} product={item} addQuote={addQuote} navigate={navigate} />)}</div></section>
    </>
  );
}

function SpecTable({ product }) {
  return <dl className="spec-table"><div><dt>材质</dt><dd>{product.material}</dd></div><div><dt>规格</dt><dd>{product.size}</dd></div><div><dt>压力</dt><dd>{product.pressure}</dd></div><div><dt>连接</dt><dd>{product.connection}</dd></div></dl>;
}

function Downloads() {
  return <><PageHead eyebrow="Downloads" title="下载中心" text="产品资料、CAD 图纸、PDF 样本与安装说明统一归档。" /><section className="downloads-grid"><DownloadColumn title="产品资料" items={products.slice(0, 8)} field="pdf" /><DownloadColumn title="CAD 图纸" items={products.slice(8, 16)} field="cad" /><DownloadColumn title="安装说明" items={products.slice(16, 24)} field="pdf" /></section></>;
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
  return <footer className="site-footer pro-footer"><div><strong>Franta B2B</strong><p>Cloudflare Pages + Functions + R2 + D1 架构的轻量工业 B2B 官网。</p></div><nav><Link href="/products/" navigate={navigate}>产品中心</Link><Link href="/downloads/" navigate={navigate}>下载中心</Link><Link href="/downloads/" navigate={navigate}>技术支持</Link><Link href="/quote/" navigate={navigate}>联系我们</Link></nav><small>© 2024 Franta. All rights reserved.</small></footer>;
}

createRoot(document.getElementById("root")).render(<App />);
