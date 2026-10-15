# Astro Notion Blog (现代化极简独立博客模板)

一套基于 **Astro 5 + React 19 + Tailwind CSS v4** 打造的现代化、极简主义独立个人博客模板。采用 Notion / Craft 风格的克制设计，结合 ParticleX 灵感流体极光动效、无缝 View Transitions 页面转场与本地 Pagefind 静态全文检索。

---

## 🌟 核心特色与板块

1. **Notion 极简美学**：克制优雅的 Zinc 调色盘、自适应亮暗色模式、精美微质感卡片与大行高呼吸感排版。
2. **全局集中配置 (`src/site.config.ts`)**：全站博主昵称、签名、头像、站点域名、社交链接与 Waline 评论接口收拢至单文件，一键改动全站同步。
3. **流畅交互与动效**：
   - ParticleX 灵感流体动态极光背景与 360° 悬浮旋转头像
   - 瀑布流渐进平滑显现（Stagger Blur-in）动画
   - 原生 Astro View Transitions 跨页面无缝路由转场
4. **6 大强类型内容板块 (Astro Content Layer)**：
   - 📖 **文章沉淀 (`/posts`)**：长篇深度博文，按年度时间线自动归档，支持标签与文章目录树（TOC）。
   - 💡 **微动态 / 碎碎念 (`/memos`)**：即刻/微博客风格时间轴流，记录灵感火花与随笔。
   - 🛠️ **开源与作品集 (`/projects`)**：展示独立开发项目与工程实践，带技术栈徽章与演示外链。
   - 🎬 **书影音足迹 (`/media`)**：书籍、电影、游戏、音乐评分与短评追踪，直观 5 星可视化。
   - 🤝 **友情链接 (`/friends`)**：邻居友链墙与免维护申请指引。
   - 👤 **关于我 (`/about`)**：博主档案、技术栈矩阵、里程碑足迹与留言板。
5. **本地全文搜索引擎 (Pagefind)**：毫秒级离线全文检索，按 `⌘K` / `Ctrl+K` 或点击导航栏搜索按钮即可即时呼出，完全静态免第三方服务端依赖。
6. **在线互动评论 (Waline)**：优雅降级集成的 Waline 客户端，支持访客免登录匿名评论、Markdown 语法与邮件提醒。
7. **生产级 Docker 编排**：多阶段构建，Nginx Alpine 极速静态镜像 + 官方 Waline SQLite 独立容器一键拉起。

---

## 🚀 快速上手

### 1. 修改博客基础信息
打开 `src/site.config.ts` 文件，填入你的个人信息：
```ts
export const siteConfig = {
  title: '我的个人博客',
  subtitle: 'My Personal Blog',
  description: '记录技术思考、架构沉淀与生活碎碎念。',

  author: '你的昵称',
  bio: '这里是一句简短的个人签名或座右铭。保持好奇，持续造物。',
  avatar: '/avatar.svg',

  site: 'https://example.com',

  social: {
    github: 'https://github.com',
    email: 'hello@example.com',
  },

  waline: {
    serverURL: 'https://waline.example.com',
  },
};
```

### 2. 本地开发与调试
```bash
# 1. 安装项目依赖
npm install

# 2. 启动本地开发热重载服务器
npm run dev
```
打开浏览器访问 `http://localhost:4321` 即可体验。

### 3. 类型检查与整站打包（含 Pagefind 索引生成）
```bash
npm run check
npm run build
```
打包产物将输出在 `dist/` 目录，并自动在 `dist/pagefind/` 生成静态索引。

---

## 🐳 Docker 生产容器化部署

本项目已预置多阶段构建 `Dockerfile` 及 `docker-compose.yml`。

### 1. 验证编排配置
```bash
docker compose config
```

### 2. 一键拉起服务（静态博客 + Waline 评论后端）
```bash
docker compose up -d --build
```
- **博客前端访问**：`http://服务器IP:8080`
- **Waline 管理后台**：`http://服务器IP:8360`

---

## ✍️ 内容创作指引

所有内容均保存在 `src/content/` 目录下，享受 TypeScript 与 Zod 强类型 Schema 约束校验：

- **新增博文**：在 `src/content/posts/` 下新建 `.md` 文件，指定 `title`, `description`, `pubDate`, `tags` 等 Frontmatter。
- **发布动态**：在 `src/content/memos/` 下新建 `.md` 文件，指定 `date`, `mood`, `tags`，正文直接写随笔。
- **新增项目**：在 `src/content/projects/` 下新建 `.json`，填入标题、描述、技术栈与链接。
- **书影音打分**：在 `src/content/media/` 下新建 `.json`，录入影视或书籍评分与短评。
- **添加友链**：在 `src/content/friends/` 下新建 `.json` 即可自动渲染。
# GitHub 仓库与 Pages

- 源码：https://github.com/waaogg/waaogg.github.io （`main` 分支）
- 网站：https://waaogg.github.io/ （`gh-pages` 分支发布）
- 修改代码后先提交并推送 `main`，再运行 `npm run deploy` 构建并发布网站。
- 首次安装运行 `npm ci`；检查运行 `npm run check`。
- Pages 仅托管静态博客，Waline 评论需要独立服务并在 `src/site.config.ts` 配置地址。
- 若使用可选的 Docker 评论服务，先复制 `.env.example` 为 `.env` 并设置随机 `WALINE_JWT_TOKEN`。

