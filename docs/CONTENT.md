# 内容编辑与未来平台接入

## 你维护什么

| 对象 | 位置 | 你填写 | 自动生成 |
| --- | --- | --- | --- |
| 站点身份、首页介绍、导航、开关、歌单、一言 | src/data/site.json | 名称、简介、顺序、选择 | 全站同步 |
| 文章 | src/content/posts/*.md | 标题、正文、标签、封面、生长与发布状态 | 目录、阅读时间、标签聚合、RSS |
| 日常 | src/content/memos/*.md | 文字、照片、图注、心情 | 日期分组、独立链接 |
| 作品 | src/content/projects/*.json | 名称、介绍、阶段、链接、封面 | 列表和详情 |
| 书影音 | src/content/media/*.json | 条目、体验状态、可选评分与短评 | 书架和筛选 |
| 友链 | src/content/friends/*.json | 名称、网址、头像、分组 | 展示与缺图兜底 |
| 关于、近况、幕后 | src/content/pages/*.md | 自己的正文与更新时间 | 统一页面布局 |

默认内容都是可替换示例。文章数、搜索、目录、归档、构建时间不需要手填。

## 本地编辑

直接编辑文件后运行 npm run content -- validate，再构建。也可以使用：

~~~bash
npm run content -- new posts my-note
npm run content -- new memos a-little-moment
npm run content -- list
npm run content -- read posts my-note
~~~

新建内容默认 publication: draft。正式发表时设置 published；文章 isDraft 也必须为 false，pubDate 不能晚于构建时间。生长状态 seedling / budding / evergreen 与公开状态独立。

本仓库公开。未发布内容不进入网页，不等于仓库中的内容私密。私密草稿请在仓库外或未来平台的受保护存储中编辑。

## 共享内容契约

src/lib/schemas.ts 是本地构建与未来平台的共同验证依据。npm run contract 会生成 public/content-contract.json；其中是字段规范，不是写入 API。

本地内容工具支持 JSON 输入：

~~~bash
npm run content -- read posts my-note
npm run content -- save posts my-note --file payload.json --revision <上次读取的 SHA256>
~~~

payload 包含 data（元信息）和 body（Markdown 正文）。旧 revision 无法覆盖新内容；并发写使用排他锁；contentId 不能被改写。修改已存在文章的 slug 必须先规划重定向和评论迁移，内容工具会阻止直接修改。

## 在线平台的边界

未来服务接收相同 data/body，通过共享 Schema 校验，再保存到同一内容仓库。编辑器自行管理登录、私密草稿、图片上传和发布任务，不向浏览器交付 GitHub Token。

建议接口语义：list/read/save-draft/preview/publish/withdraw/upload-asset/job-status。保存必须传 baseRevision；冲突返回 409。网页和本地文件不能各维护一套权威内容库。

“保存”与“上线”分开：排队、构建中、已上线、失败分别返回状态；失败保留旧站。草稿预览不能混入公开 dist。定时发表需要外部调度触发构建，静态页面不会到时间自行改变。

图片可以写 Markdown 链接，也可使用日常的 images 数组，每张填写 src、alt、可选 caption。音频既支持站内路径，也支持 HTTPS 外链。内置 WAV 是本站脚本合成的轻音片段，可替换为自己的歌单。
