# Franta B2B

轻量版工业 B2B 官网，使用 Vite/React 构建，部署到 Cloudflare Pages。

## 功能

- 首页企业站结构：Banner、产品分类、热门产品、企业优势、应用行业、新闻/技术博客、联系询价入口
- `/products/` 产品中心，支持关键词、分类、材质、压力筛选和卡片/列表切换
- `/products/[slug]/` 产品详情页
- `/quote/` 本地询价单，不接支付、不做会员系统
- `/downloads/` 下载中心，包含产品资料、CAD 图纸、PDF 样本和安装说明
- `data/products.json` 产品数据源

## 本地开发

```bash
npm run build
npm run dev
```

开发预览默认地址：`http://127.0.0.1:4173`

## Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- R2 binding: `PRODUCT_BUCKET`

当前为 React SPA，`public/_redirects` 会在构建时复制到 `dist/_redirects`：

```text
/* /index.html 200
```

产品图片、PDF、CAD 通过 `/files/products/...` 读取 R2：

- 图片：`products/images/`
- PDF：`products/pdf/`
- CAD：`products/cad/`

询价提交可继续接入 Pages Functions 和 D1。后续后台数据管理不使用 Django/MySQL，优先使用 JSON/D1。
