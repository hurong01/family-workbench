# 云数据库设计

## users

`_openid`、`familyId`、`name`、`role`、`createdAt`。

## families

`name`、`address`、`room`、`ownerOpenid`、`members[]`、`reminders[]`、`createdAt`。

> 地址和房号是隐私字段，不应在分享卡片或公开页面中出现。

## expenses

`familyId`、`creatorOpenid`、`amount`、`category`、`payerName`、`paidAt`、`month`、`note`、`createdAt`。

建议为 `familyId + month` 建联合索引，以支持家庭月账单查询。

## invites

`code`、`familyId`、`createdBy`、`expiresAt`、`used`、`usedBy`、`createdAt`。

邀请码必须由云函数生成和验证，过期或已使用的邀请码不能再次加入。

## 安全规则

客户端默认不直接写入 `families`、`users`、`invites` 和 `expenses`；业务写操作统一调用云函数。生产环境还需在每个云函数中校验成员身份与角色。

