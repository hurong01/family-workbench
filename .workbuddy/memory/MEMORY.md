# 项目长期约定 · 璀璨家庭账本（family-workbench）

微信小程序 + 云开发。AppID `wx5fd5bd5259d01a00`，云环境 `cloudfunctions-d1gi62wijfa055937`。

## 技术约定

- **前端**：原生小程序。每页四件套（wxml/wxss/js/json）。全局样式在 `app.wxss`，页面级样式在各自 `index.wxss`。
- **接口层**：所有云函数调用必须经 `miniprogram/services/cloud.js` 的 `cloudCall`，统一判 `success`、统一抛错、统一 toast。不要在页面里直接 `wx.cloud.callFunction`。
- **鉴权**：所有业务读写走云函数，每个函数校验 OpenID 与 familyId 归属。客户端不直接读写 `users`/`families`/`expenses`/`invites`/`backups`。
- **金额计算只在服务端做一次**，前端只负责显示。首页与账单必须共用同一数据源，禁止前端各自求和。
- **分页必须有唯一键并列排序**：云函数单次 `get()` 上限 100 条，跨页查询必须 `orderBy(业务字段).orderBy('_id', ...)`，否则并列记录会导致重复或遗漏。

## 操作约定

- **改完任何云函数都必须重新上传**（右键 → 上传并部署：云端安装依赖）。忘记部署是最隐蔽的 bug 来源——本地代码已修但线上仍跑旧逻辑。
- `getFamily`、`manageFamily`、`restoreFamily` 三者共用内部成员标识（sha256 派生），必须保持同一版本一起部署。
- 账目字段命名已从 `note` 迁移到 `itemName`（语义为「具体名称」）。读旧数据时用 `itemName || note` 兜底。

## 上线要求

- 收集 openid + 相册 + 摄像头，**必须在公众平台配置《用户隐私保护指引》**，且与 `pages/privacy/index` 文案一致。
- 提审必须提供**已创建家庭的测试账号或固定邀请码 + 说明**，否则审核员只看到 onboarding 页，会以「功能不完整」驳回。
- 这是私密账本，`sitemap.json` 应设为 `disallow`。

## 文档

- `docs/product-design.md` 产品设计
- `docs/database-design.md` 数据结构与安全规则
- `docs/deployment.md` 云函数部署细节
- `docs/release-checklist.md` 完整发布上线清单
