import type { PrdNote } from "../types/prd";

// PRD 标注集中维护，组件只通过 noteId 引用，避免说明文字散落在 UI 里。
export const prdNotes: PrdNote[] = [
  {
    id: "prd-fl-admin-embedded-shell",
    title: "后台原型嵌入 Prototype-as-PRD 交付框架",
    owner: "PM",
    priority: "P0",
    status: "可验收",
    description: "Freelog 管理后台作为框架内的业务原型页面维护，外层框架负责页面树、迭代版本、分享、全屏预览和 PRD 标注；后台原型自身保留原有业务导航与交互。",
    acceptance: ["左侧页面树可进入 Freelog 后台原型", "后台原型内的二级导航可切换业务页面", "框架升级时业务原型代码集中保留在 src/pages/admin 与 src/mockData/adminPrototype.ts"],
    linkedIterationId: "it-20260914-prd-shell"
  },
  {
    id: "prd-fl-admin-dashboard",
    title: "后台首页保留运营概览和待办入口",
    owner: "PM",
    priority: "P1",
    status: "可验收",
    description: "管理后台首页需要保留关键指标、风险待办和快捷处理入口，用于团队评审平台运行态与审核压力。",
    acceptance: ["展示今日新增用户、待审核资源、交易额和活动数", "待办事项表格保留状态和处理入口", "内容放在框架页面内并支持 PRD 标注查看"],
    linkedIterationId: "it-20260914-prd-shell"
  },
  {
    id: "prd-fl-admin-user-filter",
    title: "用户管理按 Axure 原稿保留标签与注册时间筛选",
    owner: "PM",
    priority: "P0",
    status: "可验收",
    description: "用户管理页需要保留消费者、节点商、小说、测试等标签筛选，以及注册时间范围筛选，以支撑运营定位目标用户。",
    acceptance: ["标签筛选可多选并刷新表格", "注册时间弹窗可应用或清除日期筛选", "批量选择用户时切换到批量添加标签状态"],
    linkedIterationId: "it-20260914-prd-shell"
  },
  {
    id: "prd-fl-admin-user-search",
    title: "用户检索和排序保持可操作",
    owner: "PM",
    priority: "P0",
    status: "可验收",
    description: "运营需要按用户名、邮箱或手机号搜索用户，并按资源、展品或合约数量排序。",
    acceptance: ["搜索框支持回车和搜索按钮提交", "重置按钮清空搜索、标签、日期与排序", "排序选择会立即更新列表顺序"],
    linkedIterationId: "it-20260914-prd-shell"
  },
  {
    id: "prd-fl-admin-user-table",
    title: "用户表格还原 Axure 字段与账号动作",
    owner: "PM",
    priority: "P0",
    status: "可验收",
    description: "用户表格需要展示 Axure 中的核心字段，并支持标签管理、冻结、恢复、审核、详情和复制联系方式等交互。",
    acceptance: ["表格展示用户、最近登录、资源数、节点数、合约数、交易次数、余额、联系方式、注册时间和账号状态", "正常用户可冻结，待审核用户可审核，冻结用户可查看原因并恢复", "联系方式提供复制动作"],
    linkedIterationId: "it-20260914-prd-shell"
  },
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
