---
title: "欢迎使用 Notion 极简风 Astro 个人博客模板"
description: "这是一篇初始化指引文章，介绍如何快速配置博客、使用 Markdown 撰写内容以及本地与生产部署。"
pubDate: 2026-10-15
tags: ["Astro", "指引", "博客模板"]
heroImage: ""
growth: "evergreen"
isDraft: false
---

# 欢迎使用 Notion 极简风 Astro 博客模板

恭喜你！博客框架已成功初始化完毕。这是一个专为内容创作者与极客开发者打造的极简主义个人独立博客系统。

## ✨ 核心特性

- **现代技术栈**: 基于 **Astro 5** 原生构建，结合 **React 19** 交互组件与 **Tailwind CSS v4**。
- **Notion 极简美学**: 极简卡片、流体动效、沉浸式排版与精心调教的亮暗色（Dark Mode）对比度。
- **平滑动画与转场**: 内置 ParticleX 灵感极光动态背景、卡片物理悬浮反馈以及 Astro View Transitions 原生无缝切页。
- **毫秒级本地全文搜索**: 静态内置 **Pagefind** 全文检索，按 `⌘K` / `Ctrl+K` 或点击导航栏搜索按钮即可毫秒级即时查阅。
- **在线互动与留言**: 优雅降级集成的 **Waline 评论系统**，支持匿名评论、Markdown 语法与邮件提醒。
- **开箱即用容器化**: 提供完整的 `Dockerfile` 与 `docker-compose.yml`，一键部署 Nginx 静态服务与 Waline 服务端。

---

## 🚀 快速上手：修改你的个人信息

全站的博主昵称、个人签名、社交链接及 Waline 地址已集中收拢至配置文件：

```ts
// src/site.config.ts
export const siteConfig = {
  title: '我的个人博客',
  subtitle: 'My Personal Blog',
  description: '记录技术思考、架构沉淀与生活碎碎念。',

  author: '博主昵称',
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

只需修改该文件中的字段，全站的标题、头部、页脚、关于页、友链模板与 RSS 订阅元数据将全部自动同步生效！

---

## 📝 开始撰写文章

在 `src/content/posts/` 目录下新建 `.md` 或 `.mdx` 文件，并在文件头部添加 Frontmatter：

```markdown
---
title: "你的文章标题"
description: "文章的简短摘要或前言。"
pubDate: 2026-10-15
tags: ["技术", "心得"]
isDraft: false
---

你的正文内容...
```

祝你创作愉快！开启属于你的赛博数字花园之旅吧。
