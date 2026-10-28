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
    id: "prd-fl-admin-auth-template-filter",
    title: "授权策略模板筛选条件按列表字段重组",
    owner: "PM",
    priority: "P0",
    status: "可验收",
    description: "授权策略模板管理页的筛选区需要围绕列表字段提供关键词、适用对象、资源类型、启停状态和推荐状态筛选，搜索与重置统一收纳在筛选区。",
    acceptance: ["适用范围筛选支持图片、插画、音乐、音频等资源类型", "筛选条件以标签形式展示并可单独移除", "状态筛选支持全部、已启用、已停用"],
    linkedIterationId: "it-20260914-prd-shell"
  },
  {
    id: "prd-fl-admin-auth-template-search",
    title: "授权策略模板支持搜索与重置",
    owner: "PM",
    priority: "P0",
    status: "可验收",
    description: "运营人员需要在筛选区内按模板名称或策略翻译快速定位授权策略模板，并能恢复默认列表状态。",
    acceptance: ["搜索框支持回车和按钮提交", "搜索匹配编号、模板名称、策略翻译和动态记录翻译", "重置按钮清空搜索、状态和适用范围筛选"],
    linkedIterationId: "it-20260914-prd-shell"
  },
  {
    id: "prd-fl-admin-auth-template-table",
    title: "授权策略模板表格还原 Axure 核心字段与动作",
    owner: "PM",
    priority: "P0",
    status: "可验收",
    description: "表格需要保留编号、模板标题、适用范围、状态和操作列，其中模板标题列仅展示模板名称，并支持新建、启停、推荐、预览、编辑、删除及批量修改适用范围。新建和编辑授权策略模板都属于核心条目的长表单操作，需要进入独立页面承载。",
    acceptance: ["表格展示编号、模板标题、适用范围、启停状态和操作，模板标题下不再重复展示编号", "行级操作支持启用/停用、推荐/取消推荐、预览、编辑和删除", "点击新模板进入独立新建页面，不使用弹窗承载长表单", "点击编辑进入独立编辑页面，不使用弹窗承载长表单", "新建页和编辑页在页面标题区右上角展示取消和保存，不再展示返回列表按钮", "页面有未保存变更时点击取消需提示保存；没有变更或变更已保存时直接返回模板列表", "批量选择后出现“已选中 N 条”和“修改适用范围”操作"],
    linkedIterationId: "it-20260914-prd-shell"
  },
  {
    id: "prd-fl-admin-activity-reward-basic",
    title: "活动奖励基础信息与有效期配置",
    owner: "PM",
    priority: "P0",
    status: "可验收",
    description: "活动奖励新建和编辑使用独立页面，按基础信息、关联活动、额度、名单生成方式和有效期完成奖励定义。",
    acceptance: ["新建和编辑均进入独立页面", "奖励编号以 RS 开头且保持唯一", "奖励额度支持金额单位和格式校验", "所属奖励组位于基础信息第一位", "自动生成名单时在发放规则中配置有效期，使用起止时间控件"],
    linkedIterationId: "it-20260914-prd-shell"
  },
  {
    id: "prd-fl-admin-activity-reward-config",
    title: "活动奖励配置分类与领取方式",
    owner: "PM",
    priority: "P0",
    status: "可验收",
    description: "奖励配置按配置表分为基本信息、奖励信息、发放规则、奖励互斥规则和是否审核，区分用户可见说明与内部备注。",
    acceptance: ["基本信息第一项为所属奖励组，并包含奖励编号、奖励名称、关联活动和备注", "奖励信息包含奖励类型、额度、说明和领取方式", "奖励类型包含现金、羽币、邀请次数、瓜分资格和积分", "领取方式支持手动领取和自动到账", "新建页所有单选下拉默认显示请选择且不预选任何业务值，编辑页保留原有配置", "备注标记为内部使用，奖励说明标记为用户端展示", "有效期、奖励互斥规则和是否审核仅在生成方式为自动生成时展示"],
    linkedIterationId: "it-20260914-prd-shell"
  },
  {
    id: "prd-fl-admin-activity-reward-list",
    title: "活动奖励列表与发放记录",
    owner: "PM",
    priority: "P0",
    status: "可验收",
    description: "活动奖励列表支持搜索、类型状态筛选、批量停用恢复和进入发放记录；发放记录支持状态筛选与审核动作。",
    acceptance: ["支持奖励名称、编号和活动搜索", "支持奖励类型、状态和名单生成方式筛选", "批量状态变更有确认与结果反馈", "点击具体奖励条目的发放记录仅展示该奖励的记录", "发放记录页面名称为发放记录", "发放记录标题下不展示页面说明", "发放记录页展示当前奖励信息并提供编辑入口", "发放记录页不重复展示返回奖励管理按钮", "页面内业务面包屑使用运营 · 活动奖励结构，点击活动奖励进入活动奖励管理", "自动生成奖励展示昨日与累计发放额度、次数、用户数，手动添加奖励展示累计发放额度和用户数", "发放记录支持待审核、已发放、已拒绝和已扣除筛选"],
    linkedIterationId: "it-20260914-prd-shell"
  },
  {
    id: "prd-fl-admin-activity-reward-rule",
    title: "活动奖励发放规则配置",
    owner: "PM",
    priority: "P0",
    status: "可验收",
    description: "发放规则按生成方式展示不同配置：手动添加名单配置发放时间和发放名单，自动生成名单配置发放条件与发放次数限制。",
    acceptance: ["生成方式支持手动添加名单和自动生成名单", "新建手动添加奖励只配置发放时间，奖励创建成功后编辑页才展示发放名单入口", "编辑手动添加奖励时可以维护获奖用户名单", "自动生成名单必须配置有效期、发放条件和完成次数", "规则内容按业务阶段分组展示", "规则校验失败时保留用户输入并显示字段错误"],
    linkedIterationId: "it-20260914-prd-shell"
  },
  {
    id: "prd-fl-admin-activity-reward-limit",
    title: "活动奖励发放次数限制",
    owner: "PM",
    priority: "P1",
    status: "可验收",
    description: "活动奖励支持配置总发放次数、统计周期和单个用户限制次数，关闭限制时相关字段不可编辑。",
    acceptance: ["可以开启或关闭发放次数限制", "开启后可以设置天、周或月的最大发放次数", "开启后必须设置每个用户限制次数", "限制次数校验失败时保留输入并显示字段错误"],
    linkedIterationId: "it-20260914-prd-shell"
  },
  {
    id: "prd-fl-admin-activity-reward-advanced",
    title: "活动奖励审核与互斥配置",
    owner: "PM",
    priority: "P1",
    status: "可验收",
    description: "奖励可以配置发放前审核和互斥奖励，状态变化及保存结果必须有明确反馈。",
    acceptance: ["开启审核后发放记录进入待审核", "互斥奖励开启后展示规则说明", "保存成功和停用恢复动作均有反馈"],
    linkedIterationId: "it-20260914-prd-shell"
  },
  {
    id: "prd-fl-admin-activity-reward-winners",
    title: "活动奖励获奖名单管理",
    owner: "PM",
    priority: "P0",
    status: "可验收",
    description: "编辑手动添加活动奖励时，通过简洁页面管理奖励信息和获奖用户列表，支持筛选添加、删除和跳转用户管理。",
    acceptance: ["获奖名单管理仅包含奖励信息和获奖用户列表", "奖励信息展示奖励名称、编号、类型额度和发放记录数量，并提供编辑入口", "获奖用户列表展示用户名、头像、用户标签、最近登录、注册时间、账号状态和删除操作", "点击用户名在新标签页打开用户管理并按用户名搜索", "添加获奖用户支持用户名、手机号、邮箱搜索，注册时间和标签筛选", "添加用户弹窗底部提供添加和取消，已加入名单的用户不再重复展示"],
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
