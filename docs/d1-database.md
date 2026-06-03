# Cloudflare D1 数据维护

## 1. 创建数据库

```powershell
wrangler login
wrangler d1 create b2b-db
```

把命令返回的 `database_id` 填入 `wrangler.toml`，并确认绑定名为 `DB`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "b2b-db"
database_id = "你的 database_id"
```

## 2. 建表

本地 D1：

```powershell
npm run db:migrate:local
```

Cloudflare 远程 D1：

```powershell
npm run db:migrate:remote
```

## 3. 同步产品和博客索引

同步来源：

- 产品：优先读取 `data/products.csv`，没有这个文件时读取 `data/products.json`
- 博客：`../blog/src/content/blog/*.md`

Excel 维护产品时，用 [products-template.csv](../data/products-template.csv) 作为表头模板，在 Excel 中编辑后另存为 `data/products.csv`。字段说明：

- `id`：产品编号，例如 `FR-001`
- `slug`：网址唯一标识，只用英文、数字和短横线，例如 `grooved-tee`
- `name`：产品名称
- `category`：分类
- `material`：材质
- `size`：规格
- `pressure`：压力等级
- `connection`：连接方式
- `description`：产品描述
- `image`：图片路径
- `pdf`：PDF 路径
- `cad`：CAD 路径
- `active`：`1` 为启用，`0` 为下架

注意：`slug` 不能重复；批量同步会以 CSV/JSON 为准重写产品表。

本地同步：

```powershell
npm run db:sync:local
```

远程同步：

```powershell
npm run db:sync:remote
```

## 4. API

- `GET /api/products`：读取产品表
- `GET /api/blog-posts?random=true&limit=3`：随机读取博客索引
- `POST /api/quotes`：写入询价单
- `GET /api/quotes?token=...`：查看最近 200 条询价单，需要配置 `ADMIN_TOKEN`

## 产品图片维护

图片按“产品名称”共用，不按“存货编码”一物一图。维护 `data/product-asset-map.csv`：

```csv
name,asset_slug
不锈钢管,stainless-pipe
沟槽等径三通,grooved-tee
```

这样所有名称为“不锈钢管”的规格都会共用：

```text
/files/products/images/catalog/stainless-pipe.png
/files/products/pdf/stainless-pipe.pdf
/files/products/cad/stainless-pipe.dwg
```

如果 ERP 导出的 `products.csv` 里直接提供了 `image`、`pdf`、`cad` 或 `asset_slug` 列，脚本会优先使用表里的值。

## 5. 备份

```powershell
wrangler d1 export b2b-db --remote --output=backup.sql
```

大批量同步前建议先导出一次。
