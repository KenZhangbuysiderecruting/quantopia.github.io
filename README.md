# Quantopia Blog — GitHub Pages 部署指南

零成本独立站，让 Google / 百度真正收录你的文章（微信公众号文章默认不被搜索引擎抓取）。

## 目录结构
```
quantopia-blog/
├── index.html          # 首页（文章列表 + 订阅 banner）
├── style.css           # 暗色主题样式
├── about.html          # 关于页（可选，可复制 index 改）
├── posts/
│   └── 2026-07-22-sa.html   # 每篇文章一个 HTML
└── README.md
```

## 部署步骤（约 30 分钟）
1. **建仓库**：GitHub 新建公开仓库 `quantopia-blog`。
2. **上传文件**：把本目录全部内容 push 到仓库 main 分支。
3. **开 Pages**：仓库 Settings → Pages → Source 选 `Deploy from a branch` → 选 `main` / `/(root)` → Save。
4. **等生效**：约 1–2 分钟，访问 `https://<你的用户名>.github.io/quantopia-blog/`。
5. **提交收录**：
   - Google Search Console → 添加站点（填上面 URL）→ 验证（用 HTML 文件或 DNS）→ 提交 `sitemap`（可手动在 GSC 填 URL 列表，或加 `sitemap.xml`）。
   - 百度资源平台（ziyuan.baidu.com）→ 注册 → 提交站点与 URL。
6. **持续更新**：每发一篇公众号，复制 `posts/` 下模板改成新文章，并在 `index.html` 加一张卡片。

## 发布新文章清单
- [ ] 复制 `posts/2026-07-22-sa.html` 改名 `YYYY-MM-DD-slug.html`
- [ ] 填标题 / meta / description（含关键词：全球顶级多策略平台/亚太做市商/量化/对冲基金/猎头/深圳 等脱敏词，按保密约定不列具体客户名）
- [ ] 正文贴公众号内容，末尾挂"关注公众号 Quantopia" + 二维码
- [ ] 在 `index.html` 的 `#posts` 区加一张卡片
- [ ] push 到 main 分支
- [ ] GSC / 百度资源平台 提交新 URL

## 注意
- 免费域名即 `*.github.io`；若要独立域名（quantopia.com 类）约 60–100 元/年，在 Pages 设置里填 Custom domain。
- 站内底部固定 banner 引导关注 Gravitas 人才服务（双号联动用，W8 后生效）。
