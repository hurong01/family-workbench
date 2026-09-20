# 部署清单

本次升级后，需要在微信开发者工具中重新上传已有云函数，并首次上传新增云函数。

## 重新部署

- login
- createFamily
- createInvite
- joinFamily
- saveExpense

## 首次部署

- getFamily
- getBills
- updateExpense
- deleteExpense
- leaveFamily

每个目录均选择“上传并部署：云端安装依赖”。数据库集合 `users`、`families`、`expenses`、`invites` 建议设置为仅云函数可读写。

`expenses` 查询需要联合索引：`familyId` 升序、`month` 升序、`paidAt` 降序。

部署后使用两个不同微信账号完成：创建家庭、生成邀请、加入家庭、双方记账、编辑与删除权限、普通成员退出家庭等真机测试。
