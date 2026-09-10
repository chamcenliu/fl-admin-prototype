# Prototype-as-PRD

这是一个面向 PM、研发、QA 协作的 React 原型脚手架。核心思想是把“可点击原型、页面结构、需求标注、迭代版本”放在同一个前端交付物里维护。

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

1. 在 `src/mockData/pageTree.ts` 中新增页面节点。
2. 在 `src/pages` 下创建页面组件。
3. 在 `src/App.tsx` 的 `renderPage` 中绑定页面 id 和组件。

## 如何添加 PRD 标注

1. 在 `src/mockData/prdNotes.ts` 中新增一条需求。
2. 用 `<PrdWrapper noteId="你的需求 id">` 包住页面上的 UI 区块。
3. 组件通过 props 接收数据，不要把复杂 mock 数据写在 UI 内部。

## 如何创建迭代

迭代数据集中在 `src/mockData/versions.ts`。每个版本可以绑定页面 `pageIds` 和需求 `requirementIds`，右下角的 `VersionBadge` 会展示当前版本与更新时间。

## 目录重点

- `src/layout`：全局布局和可折叠侧边栏。
- `src/components/prd`：PRD 标注包裹器、标记点和需求抽屉。
- `src/components/version`：版本水印。
- `src/mockData`：页面树、版本、需求和示例业务数据。
- `src/pages/examples`：示例业务页面。
