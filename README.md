# Franta B2B

轻量版工业 B2B 产品中心，可与博客内容并行部署到 Cloudflare Pages。

## 功能

- `/products/` 产品中心，支持关键词、分类、材质、压力筛选
- `/products/[slug]/` 产品详情页
- `/quote/` 本地询价单，不接支付、不做会员系统
- `/downloads/` 下载中心
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

产品图片、PDF、CAD 通过 `/files/products/...` 读取 R2：

- 图片：`products/images/`
- PDF：`products/pdf/`
- CAD：`products/cad/`

询价提交可继续接入 Pages Functions 和 D1。
