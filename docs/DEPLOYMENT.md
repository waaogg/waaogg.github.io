# 部署与迁移

## 同一份代码

前台静态生成；云服务器是正式目标。GitHub Pages 作为当前静态托管出口。没有为 Pages 引入专用路由或改变内容模型。

只通过以下公开构建变量切换环境：

- PUBLIC_SITE_URL：站点根地址，影响 canonical、RSS、sitemap 和永久链接。
- PUBLIC_WALINE_SERVER_URL：评论服务地址，留空时展示等待接入。

变量在构建期生效，修改后需要重新构建。其他部署密钥只放服务端 .env，不放 src/data/site.json。

## 本地验证

~~~bash
npm ci
npm run check
npm test
npm run test:publication
npm run verify
npm run preview
~~~

test:publication 实际注入草稿、归档、旧 isDraft 和未来日期样本，验证正式输出没有这些内容，再移除样本并恢复正式构建。

## GitHub Pages

当前使用 gh-pages 分支发布。已准备 deploy/github/pages.workflow.yml 自动检查与发布模板；当前 GitHub 凭据没有 workflow 权限，不能直接添加 Actions 工作流。取得该权限后，将模板复制到 .github/workflows/pages.yml，并将 Pages 设置切换为 GitHub Actions。该工作流在 main 更新后检查、构建与发布，PR 只验证。

npm run deploy 是保留的 gh-pages 分支发布备用入口；它构建后推送产物，不 force push。

Pages 不能运行数据库、Waline 后端、私有写入服务或邮件服务器。局域网 HTTP 评论地址无法供公网 HTTPS Pages 正常使用；需要公网可达的 HTTPS 评论域名。不要把局域网 IP 配入公网 Pages 来制造“已接入”的假象。

## 云服务器

复制 .env.example 为 .env，填写正式域名。纯前台：

~~~bash
npm run cloud:check
docker compose up -d --build blog
~~~

需要内置 Waline 编排时，设置评论 HTTPS 地址、至少 32 位的独立 JWT 密钥与允许域名：

~~~bash
npm run cloud:check -- --comments
docker compose --profile comments up -d --build
~~~

blog 默认监听服务器 127.0.0.1:8080，Waline 监听 127.0.0.1:8360，由已有反向代理接入 HTTPS。测试局域网地址时可以显式设置 BLOG_BIND，但正式环境不需要默认公网开放数据库或管理端口。

镜像构建使用 npm ci，不在失败后更换安装策略。Dockerfile 内部运行检查、测试、构建和静态产物检查。Nginx 只对哈希资源长期缓存，固定名搜索入口允许更新；无效地址返回真正 404。

Waline 使用独立数据卷，SQLite 路径是目录 /app/data。waline-init 在首次运行时复制官方空数据库（含表结构），已有非空数据库不会覆盖；完成后才启动评论服务。种子来源与校验见 deploy/waline/README.md。固定镜像版本与摘要；内存/CPU 和日志轮转已有默认限制。更新版本前先核对兼容性。

评论运行镜像从官方固定镜像构建，并固定 better-sqlite3 13.0.3，避免原镜像在 Node 24 上发生原生扩展崩溃。初始化服务只复制文件，不运行数据库。不要直接用 upstream latest 替换经过验证的运行镜像。

## 备份与恢复

静态站：保留上个镜像、源码提交、公开构建变量与配置。验证新镜像后切换；失败恢复上个镜像。不要把源码回滚当作评论数据库恢复。

评论：备份数据卷和环境配置；SQLite 备份应使用数据库一致性方式，或在已授权的短暂停机后复制。恢复先在独立位置核对版本、文件校验和评论数量，不覆盖唯一有效副本。

同一服务器上的其他服务、网络和权限不属于博客升级范围。运行在共享服务器时，登记资源归属、镜像、端口、基线与恢复位置。

## 邮件与未来后台

邮件回复通知需要 SMTP_HOST/PORT/SECURE/USER/PASS/SENDER 与 AUTHOR_EMAIL，由 Waline 后端执行。仅渲染评论框不能证明邮件送达。

未来在线平台需要独立私有服务处理鉴权、图片上传、内容冲突和发布任务；接口契约见 CONTENT.md。前台已发布后不依赖编辑平台持续在线。
