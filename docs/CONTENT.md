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
| 首页生活卡片 | src/content/cards/*.json | 类型、文案、图片引用、日期、顺序与样式 | 叠放、拖拽、键盘切换和大图浏览 |
| 影像集 | src/content/gallery/*.json | 图片引用、标题、描述、日期、主题、可选地点 | 年份与主题筛选、详情、相邻影像 |
| 专题系列 | src/content/topics/*.md | 标题、简介、说明正文、文章 contentId 顺序 | 专题目录、上下篇衔接、本地阅读状态 |
| 小站更新 | src/content/updates/*.json | 日期、标题、说明、类型、可选关联内容 | 与文章、日常、影像、作品进展汇总为时间线 |
| 图片资源 | src/data/assets.json | 导入时填写 ID、说明、焦点与裁切方式 | WebP、多尺寸、元数据移除、共享引用 |

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

## 统一图库

本地导入一张图（不是在线上传平台）：

~~~bash
npm run assets -- import "D:/Photos/window.jpg" --id my-window --alt "窗边的一盆绿植" --title "午后" --x 50 --y 40 --fit cover
npm run assets -- list
npm run assets -- validate
~~~

支持 Sharp 能读取的静态图片；自动按相机方向旋转，生成320/640/960/1600宽度的WebP，小图不放大。导出的图片移除EXIF等源图元数据，原文件不复制到公开目录。所有导入结果都是公开资源，请只导入愿意公开的图片。输出文件名包含图片内容哈希，可长期缓存。

导入后可在 src/data/assets.json 修改 title、alt、caption、focal（x/y为0–100）与fit（cover铺满、contain完整显示）。不手改id、src、尺寸或variants；替换图片时导入新ID，再更改内容引用，避免破坏旧文章。

同一张图片可用于：文章 heroAsset、作品和书影音 coverAsset、卡片及影像的 assetId、日常 images: [{assetId, caption}]，以及 Markdown 的 `![图片说明](asset:my-window)`。构建时检查引用是否存在。原有src/heroImage/cover写法仍支持。

内置三张图片为本站绘制并标注的示例插画，不代表真实拍摄或个人经历。

## 首页卡片和影像

cards支持note、image、feature。图片卡和推荐卡必须有assetId；order越小越靠前；appearance支持tape胶带、plain纸卡、postcard明信片；fit可单独覆盖图片裁切方式。date为你填写的记录日期，不是构建日期。galleryId关联影像文件名；related使用 {kind, contentId} 关联文章、日常、作品或影像。未发布的关联不会生成公开入口。

首页建议精选4–8张，全部内容在影像集长期保存。gallery的themes用于筛选，location可省略，description为图注与故事。只有一张卡片时不显示翻页按钮；没有卡片时展示纯文字首页。手机支持左右拖动和正常纵向滚动。

## 专题、修订和本地阅读

topics的posts填写文章稳定contentId，按数组顺序排列；隐藏或未来文章不进入公开目录、衔接链接与阅读统计。topics是Markdown内容，可使用 npm run content -- new topics my-series 创建默认草稿。

文章或作品可填写 updates: [{date, text}]。文章修订在详情中展示，作品进展和文章修订汇入 /updates/；新增文章、日常和影像自动产生时间线条目。独立小站公告放在updates集合。所有未来更新记录在该时间到达并重新构建后才公开。

/library/仅使用当前浏览器localStorage保存收藏与最近100篇阅读位置。文章、日常、作品、影像、专题均可收藏；文章记录进度，首页提供继续阅读，专题显示已读状态。可以移除单条、清空收藏或阅读列表；浏览器禁用存储时会提示保存失败。没有账户或服务器同步，不属于在线编辑与发布台。
