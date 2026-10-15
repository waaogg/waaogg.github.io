---
schemaVersion: 1
contentId: posts-welcome-to-astro-blog
publication: published
title: 从这里开始，安放你的文字与日常
description: 认识这个小站的内容结构，以及从本地写作到上线发布的简单路径。
pubDate: 2026-10-15
tags: [Astro, 指引, 博客模板]
growth: evergreen
featured: true
---

欢迎来到你的新手记。这份模板把文字、日常、作品和书影音放在同一处，让不同长度的表达都能找到合适的位置。

## 先让这里成为自己的地方

在站点设置里填写名字、签名和联系入口，再按需更换首页介绍。示例内容可以直接替换；没有内容的板块，也可以先留白。

站点设置在 **src/data/site.json**。关于、近况和幕后说明在 **src/content/pages**，都是可以直接编辑的 Markdown。

## 写一篇文章

使用内容工具创建一篇草稿：

~~~bash
npm run content -- new posts my-first-note
~~~

文章由元信息和正文组成。标题、摘要、标签由作者填写；目录、阅读时间、归档与搜索索引会在构建时生成。

### 公开和草稿是两种状态

新内容默认是草稿。准备好后，将 publication 改为 published；文章的 isDraft 也必须为 false。

草稿不会进入正式页面和索引。但这个 GitHub 仓库是公开的，**请不要把私密草稿提交到公开仓库**。未来在线平台应把私密草稿放在受保护的存储里。

## 留下一则日常

不需要标题。写两句话，配一张照片，或者留下一条链接。

~~~bash
npm run content -- new memos a-little-moment
~~~

日常支持 Markdown、多图、图注和独立页面。它可以很轻，也可以成为一篇文章的开端。

## 检查与预览

~~~bash
npm run check
npm test
npm run build
npm run verify
npm run preview
~~~

构建会同步检查内容，再生成页面和搜索索引。预览构建产物时可以使用完整搜索。

## 放在你选择的地方

同一份构建产物可以放在 GitHub Pages，也可以由云服务器上的 Nginx 提供。切换域名时，通过 PUBLIC_SITE_URL 设置正式地址，重新构建即可。

评论由独立 Waline 服务提供。配置 PUBLIC_WALINE_SERVER_URL 后可以启用；邮件通知还需要评论后端的邮件配置。

文字属于你，托管只是它暂时居住的地方。
