# AGENTS.md

本项目是 Franta 轻量版 B2B 网站，部署到 Cloudflare Pages。

技术要求：
- 使用 Cloudflare Pages
- 使用 Pages Functions 写接口
- 使用 R2 存产品图片、PDF、CAD、Markdown文章
- 使用 D1 存产品、分类、询价单
- 不使用传统后端，不使用 MySQL，不使用 Django
- 页面风格：工业、高级、简洁，适合不锈钢管件厂家
- 所有页面使用中文
- 保持现有博客功能，不要破坏 GitHub → R2 自动同步

第一阶段功能：
1. 首页
2. 产品中心
3. 产品详情页
4. 参数筛选
5. 下载中心
6. 加入询价单
7. 提交询价
8. 后台先用 JSON/D1 种子数据，不做复杂登录后台

目录建议：
- src/
- functions/
- public/
- data/
- migrations/# AGENTS.md

要求：
- 使用 Cloudflare Pages
- 使用 Pages Functions
- 使用 R2 存图片、PDF、CAD
- 使用 D1 存询价单
- 不使用 MySQL、Django、传统 Node 后端
- 不要提交任何 API Token、Secret、账号密码
- 所有密钥只放 GitHub Actions Secrets 或 Cloudflare Pages 环境变量
