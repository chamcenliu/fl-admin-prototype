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
