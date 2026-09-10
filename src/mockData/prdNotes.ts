import type { PrdNote } from "../types/prd";

// PRD 标注集中维护，组件只通过 noteId 引用，避免说明文字散落在 UI 里。
export const prdNotes: PrdNote[] = [
  {
    id: "prd-order-filter",
    title: "审批列表需要支持多条件筛选",
    owner: "PM",
    priority: "P1",
    status: "研发中",
    description: "审批人需要按订单状态、风险等级和关键词快速定位待处理订单。",
    acceptance: ["支持状态与风险等级筛选", "关键词匹配订单号、客户名和业务线", "筛选结果数量实时更新"],
    linkedIterationId: "it-20260910-beta"
  },
  {
    id: "prd-risk-summary",
    title: "顶部展示当前审批风险概览",
    owner: "PM",
    priority: "P0",
    status: "可验收",
    description: "QA 和研发需要在示例页上直接看到本轮迭代关注的风险摘要。",
    acceptance: ["展示待审批、高风险、超时三类指标", "指标文案来自 mockData", "指标卡片不硬编码复杂业务数据"],
    linkedIterationId: "it-20260910-beta"
  },
  {
    id: "prd-approval-action",
    title: "行级审批动作留出后端接入位",
    owner: "FE",
    priority: "P2",
    status: "待确认",
    description: "当前原型先完成交互占位，正式接入时由研发替换为接口调用。",
    acceptance: ["每行展示通过、退回按钮", "按钮有明确禁用状态", "需求抽屉说明后端接口待补字段"],
    linkedIterationId: "it-20260910-beta"
  }
];

export function findPrdNote(noteId: string) {
  return prdNotes.find(note => note.id === noteId);
}
