# Waline SQLite 初始数据库

`waline.sqlite` 是官方空数据库，包含 `wl_Comment`、`wl_Counter`、`wl_Users` 表，不含用户或评论。仅在首次部署且目标数据库不存在或为空时使用，不用于升级或覆盖已有数据库。

- 来源：[Waline 官方仓库](https://github.com/walinejs/waline/blob/c4b0f1ebb9a7970d36493d4c3580f3f43e098fa5/assets/waline.sqlite)
- 对应版本：`@waline/vercel@1.43.4`
- SHA-256：`ac08959a80b2756701742d97ad445fab24597428b3bc56e0c87541c4ea8b1b37`
- 大小：24576 字节

数据库初始化依据：[官方 SQLite 部署说明](https://waline.js.org/en/guide/database.html)。Waline 的 `SQLITE_PATH` 必须设置为数据库所在目录。

## 运行镜像

Dockerfile 以固定的官方 1.43.4 镜像为基础，将 better-sqlite3 固定为 13.0.3（N-API 实现），并在构建时验证 SQLite 写入、读取和四万次语句回收。原镜像使用的 v11 原生扩展在 Node 24 上实际触发了工作进程崩溃，见 [Node 官方问题记录](https://github.com/nodejs/node/issues/65446)。不改动 Waline 的数据表或业务代码。
