# Franta 产品图片规范

本规范用于 Cloudflare R2 中的产品展示图片。首页分类图、产品图、应用行业图和水务案例图全部从 R2 读取，不使用本地 SVG 占位图。

## R2 目录

所有图片放在 `PRODUCT_BUCKET` 的 `products/images/` 下。

```text
products/images/
  grooved/
  press/
  manifold/
  pipe/
  flange/
```

## 图片格式

- 尺寸：`1200x1200`
- 背景：纯白
- 格式：`webp`
- 建议质量：`82-90`
- 主体：产品居中，保留 8%-14% 安全边距
- 文件名：小写英文、数字和连字符，和产品 `slug` 保持一致

## 产品图片路径

`data/products.json` 的 `image` 字段必须使用：

```text
/files/products/images/{category-folder}/{product-slug}.webp
```

示例：

```text
/files/products/images/grooved/grooved-90-elbow-304.webp
/files/products/images/press/press-coupling-304.webp
/files/products/images/manifold/manifold-six-port.webp
/files/products/images/pipe/stainless-pipe-304.webp
/files/products/images/flange/plate-flange-304.webp
```

当前目录结构未单独设置 `valve/`，阀门配件图片先归入 `flange/` 配套件目录。

## 首页图片

首页图片也必须放在 R2：

```text
products/images/grooved/category-grooved-fittings.webp
products/images/press/category-press-fittings.webp
products/images/manifold/category-manifold.webp
products/images/pipe/category-stainless-pipe.webp
products/images/flange/category-flange.webp
products/images/flange/category-valve-accessories.webp

products/images/pipe/solution-municipal-water.webp
products/images/grooved/solution-fire-water.webp
products/images/manifold/solution-commercial-water.webp
products/images/press/solution-industrial-loop.webp

products/images/pipe/case-municipal-pump-room.webp
products/images/press/case-commercial-retrofit.webp
products/images/grooved/case-industrial-loop.webp
products/images/manifold/case-water-equipment.webp
```

## 页面读取规则

页面只引用 `/files/products/images/...`，由 `functions/files/[[path]].js` 从 `PRODUCT_BUCKET` 读取并返回。R2 中不存在的文件返回 `404`。
