# Freelog Admin 可维护交互原型

本目录是根据 `FL ADMIN PROTOTYPE.rp` 和 `axure-export/` 重建的代码版原型。Axure 导出文件只作为设计依据，实际页面由 `src/` 中的代码生成。

在线预览：<https://chamcenliu.github.io/fl-admin-prototype/>

## 本地运行

```powershell
node server.mjs
```

浏览器打开 `http://127.0.0.1:4173`。首次进入默认为已登录状态；点击右上角“退出登录”可以查看登录页。

## 维护位置

- `src/data.js`：导航、页面名称、表格字段和演示数据。
- `src/app.js`：路由、筛选、表单、弹窗、登录等交互。
- `src/styles.css`：颜色、布局、响应式样式和组件外观。

新增普通管理页面时，先在 `navGroups` 中增加入口，再在 `pageDefinitions` 中配置字段和数据。列表、筛选、选择、编辑和新建流程会自动复用。

## 构建

```powershell
node build.mjs
```

构建结果生成在 `dist/`，可交给任意静态网站服务。
