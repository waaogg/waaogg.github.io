# 日常之间

一个以个人杂志与数字花园为设计方向的独立博客。Astro 7 + React 19 + Tailwind CSS 4，前台静态生成，正式部署面向云服务器，也支持 GitHub Pages。

## 已有能力

- 文章、标签聚合、生长状态、相关文章、上下篇、桌面跟随目录与手机折叠目录。
- 无衬线/衬线、字号与主题偏好；主题支持亮色、暗色、跟随系统。
- 日常 Markdown、多图、独立详情；作品详情、书影音筛选、朋友与可编辑独立页面。
- 全文搜索、键盘选结果、错误重试、弹层焦点管理与无障碍快捷键。
- 跨页保持的播放器；两段站内合成轻音，默认暂停，无第三方音源依赖。
- 可刷新本地一言；代码复制、语言、行高亮和长代码折叠；脚注旁注、图片查看。
- 统一发布过滤、RSS、sitemap、真实 404、稳定内容 ID、乐观并发内容工具与共享编辑 Schema。
- 可选 Waline 独立后端、云部署 Docker/Nginx、GitHub 自动构建和发布。

## 开始

推荐 Node.js 24。先安装依赖，再检查与预览：

~~~bash
npm ci
npm run check
npm test
npm run build
npm run verify
npm run preview
~~~

开发模式使用 npm run dev -- --background，停止时 npm run astro -- dev stop。

全局设置：src/data/site.json。内容：src/content/。默认个人资料与文字是示例，可替换为空白模板或自己的记录。

详细说明：[编辑与内容平台](docs/CONTENT.md)、[云服务器与 Pages 部署](docs/DEPLOYMENT.md)。
