---
schemaVersion: 1
contentId: "posts-markdown-syntax-guide"
publication: published
title: "Markdown 语法与样式渲染参考指南"
description: "全面测试与展示本博客模板支持的 Markdown 语法元素：代码高亮、表格、引用块、列表与行内样式。"
pubDate: 2026-10-14
tags: ["Markdown", "语法", "指南"]
heroImage: ""
growth: "seedling"
isDraft: false
---

## Markdown 语法渲染示例

本篇用于展示与验证文章排版规范与样式渲染表现。

## 标题层级

### 三级标题 H3

正文支持清晰的字重与行高对比，具备舒缓的视线引导体验。

#### 四级标题 H4

精巧的层级细分，适合复杂知识点的小节拆解。

---

## 文本与行内强调

- **粗体文字**: 更加突出核心概念。
- *斜体文字*: 强调特定短语。
- ~~删除线文本~~: 用于展示修正或废弃内容。
- `行内代码`: 例如 `npm run dev` 或 `git commit -m "init"`。

---

## 代码块与语法高亮

支持主流编程语言的语法高亮：

```typescript {2-4}
interface UserProfile {
  name: string;
  role: 'developer' | 'designer' | 'creator';
  skills: string[];
}

function greet(user: UserProfile): string {
  return `Hello, ${user.name}! Welcome to the digital space.`;
}

console.log(greet({ name: 'Explorer', role: 'developer', skills: ['Astro', 'TypeScript'] }));
```

```bash
# 安装依赖并启动本地开发服务
npm install
npm run dev
```

---

## 表格渲染

| 模块名称 | 技术栈 | 职责定位 |
| :--- | :--- | :--- |
| **基础骨架** | Astro 7 + React 19 | 静态页面生成与客户端动态交互 |
| **样式系统** | Tailwind CSS v4 | 极简 Notion 视觉与亮暗色响应 |
| **搜索检索** | Pagefind (静态索引) | 本地离线毫秒级全文匹配 |
| **互动系统** | Waline | 评论留言与互动社区 |

---

## 引用块

> 极简不是缺乏，而是克制与纯粹。去掉一切无用的修饰，让文字与思想本身成为主角。
> 
> —— 排版示例

---

## 任务清单与嵌套列表

- [x] 完成博客框架的脚手架搭建与组件封装
- [x] 集成暗色模式平滑切换与 View Transitions 页面转场
- [x] 全站搜索快捷键与交互弹窗
- [ ] 撰写下一篇深入技术文章

## 统一图库中的图片

下面的图片引用共享图库，同一张图也可以放在首页卡片或日常里。原图是本站绘制的示例插画。

![窗边微光，一幅光与植物的示例插画](asset:window-light)

写法为 `![图片说明](asset:window-light)`。导入工具会提供图片 ID，构建时自动补齐响应式尺寸，点击图片可以查看大图。
