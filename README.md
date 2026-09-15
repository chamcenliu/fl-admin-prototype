# Freelog Admin Prototype as PRD

这是 Freelog 产品管理后台交互原型，已内嵌到 `Prototype as PRD` 原型交付框架中。框架负责“页面树、需求标注、迭代版本、分享、全屏预览”等交付能力，Freelog 后台原型作为业务页面在框架内维护。

## 技术栈

- React + Vite
- TailwindCSS
- Lucide React
- Framer Motion

## 本地运行

```powershell
pnpm install
pnpm dev
```

## 如何新增页面

1. 后台原型页面集中在 `src/pages/admin/AdminPrototypePage.tsx`。
2. 后台原型数据集中在 `src/mockData/adminPrototype.ts`。
3. 外层交付页面树集中在 `src/mockData/pageTree.ts`。
4. 如果新增独立业务页面，在 `src/App.tsx` 的 `renderPage` 中绑定页面 id 和组件。

## 新建/编辑长表单交互规范

后续如果新增“新建 XXXX”或“编辑 XXXX”功能，需要先判断它是否属于当前页面的核心条目操作，以及表单复杂度是否达到长表单标准。满足下列条件时，必须使用框架内独立页面承载，不要使用弹窗：

1. 新建或编辑的对象是当前页面的核心条目，或主列表中的条目。例如【授权策略模板管理】中的【新模板】和【授权策略模板条目】。
2. 新建或编辑配置项较多，表单输入控件数量大于等于 5 个。

独立页应保持统一结构：页面标题区说明当前操作，主体使用分组表单，底部提供“取消/保存”，保存或取消后回到原列表页。短操作、确认操作或少量字段配置可以继续使用弹窗，例如预览、删除确认、批量修改适用范围。

## 如何添加 PRD 标注

1. 在 `src/mockData/prdNotes.ts` 中新增一条需求。
2. 用 `<PrdWrapper noteId="你的需求 id">` 包住页面上的 UI 区块。
3. 组件通过 props 接收数据，不要把复杂 mock 数据写在 UI 内部。

## 如何创建迭代

迭代数据集中在 `src/mockData/versions.ts`。每个版本可以绑定页面 `pageIds` 和需求 `requirementIds`，右下角的 `VersionBadge` 会展示当前版本与更新时间。

## 如何同步 Prototype as PRD 框架升级

`Prototype as PRD` 框架源目录位于上级目录：

```text
C:/Users/Windows/Documents/ChatGPT/FL Admin Prototype/Prototype as PRD
```

当该框架后续新增功能或优化已有功能时，可在本项目目录运行：

```powershell
pnpm sync:prd-framework
```

同步脚本只更新框架层文件，例如 `src/components`、`src/hooks`、`src/layout`、`src/types`、`src/utils` 和基础配置。项目专属文件会保留，包括：

- `src/pages/admin`
- `src/mockData/adminPrototype.ts`
- `src/mockData/pageTree.ts`
- `src/mockData/prdNotes.ts`
- `src/mockData/versions.ts`
- `src/App.tsx`

同步后需要根据框架新增能力，手动检查 `src/App.tsx`、`src/mockData/pageTree.ts`、`src/mockData/prdNotes.ts` 和 `src/mockData/versions.ts` 是否需要补接入口或更新标注。

## 目录重点

- `src/layout`：全局布局和可折叠侧边栏。
- `src/components/prd`：PRD 标注包裹器、标记点和需求抽屉。
- `src/components/version`：版本水印。
- `src/mockData`：页面树、版本、需求和示例业务数据。
- `src/pages/examples`：示例业务页面。
