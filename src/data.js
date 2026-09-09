export const navGroups = [
  { label: "概览", icon: "⌂", pages: [{ id: "dashboard", label: "首页" }] },
  { label: "用户", icon: "人", pages: [
    { id: "users", label: "用户管理" }, { id: "user-tags", label: "用户标签管理" },
    { id: "beta-review", label: "内测申请审核" }, { id: "invites", label: "邀请码管理" }
  ] },
  { label: "资源", icon: "资", pages: [
    { id: "resources", label: "资源管理" }, { id: "resource-types", label: "资源类型管理" },
    { id: "resource-attributes", label: "资源属性管理" }, { id: "resource-tags", label: "资源标签管理" }
  ] },
  { label: "节点", icon: "节", pages: [
    { id: "nodes", label: "节点管理" }, { id: "node-tags", label: "节点标签管理" }, { id: "exhibits", label: "展品管理" }
  ] },
  { label: "合约", icon: "约", pages: [{ id: "contracts", label: "合约管理" }] },
  { label: "交易", icon: "易", pages: [
    { id: "transactions", label: "交易管理" }, { id: "feather-coins", label: "羽币交易管理" },
    { id: "payment-channels", label: "支付渠道管理" }, { id: "payment-routes", label: "支付路由管理" }
  ] },
  { label: "运营", icon: "营", pages: [
    { id: "categories", label: "运营分类管理" }, { id: "topics", label: "专题管理" },
    { id: "featured", label: "编辑精选" }, { id: "campaigns", label: "活动管理" },
    { id: "tasks", label: "活动任务管理" }, { id: "rewards", label: "活动奖励管理" },
    { id: "reward-records", label: "活动奖励发放记录" }, { id: "ads", label: "站内广告管理" },
    { id: "auth-templates", label: "授权策略模板管理" }, { id: "demo-nodes", label: "示例节点" }
  ] },
  { label: "安全与合规", icon: "盾", pages: [
    { id: "review-policies", label: "内容审核策略管理" }, { id: "version-review", label: "资源版本审核" },
    { id: "comments", label: "freeBuzz 评论管理" }
  ] },
  { label: "国际化", icon: "译", pages: [
    { id: "translations", label: "翻译管理" }, { id: "translation-tags", label: "翻译标签管理" }
  ] }
];

const baseRows = {
  users: [
    ["chtes", "今天", "20", "3", "1,000.00", "138 1234 1234", "正常"],
    ["chlll", "一周前", "0", "200", "268.50", "chlll@qq.com", "待审核"],
    ["chtes01", "07-07", "5", "12", "86.00", "chtes01@qq.com", "冻结"],
    ["raccoon_88", "昨天", "11", "8", "420.00", "186 4455 0202", "正常"]
  ],
  resources: [
    ["巷口的小狗", "chtes / image-dogs", "5", "100", "2.0.0", "2020-09-01", "已上线"],
    ["巷口的小猫", "chtes / image-cats", "3", "200", "1.8.2", "2019-09-01", "未上线"],
    ["城市声音采样", "sonic / city-sounds", "8", "73", "3.1.0", "2024-06-12", "已上线"],
    ["格林童话", "chlll / grimms", "1", "42", "1.0.4", "2021-03-28", "已封禁"]
  ],
  nodes: [
    ["看看漫画", "kankan.freelog.com", "chtes", "100 / 200", "100", "2020-09-01", "正常"],
    ["多点小说", "duodian.freelog.com", "chlll", "200 / 200", "0", "2020-09-01", "正常"],
    ["摩登天空音乐", "modernsky.freelog.com", "modern", "86 / 200", "12", "2019-05-12", "封停"],
    ["80s 红白机游戏", "80sgames.freelog.com", "retro80", "10 / 200", "4", "2018-08-01", "正常"]
  ],
  transactions: [
    ["2020-09-01 14:53", "资源 · 格林童话 · 月订阅", "2021053122001128761407364718", "chtes", "chlll", "10.00", "交易完成"],
    ["2020-09-01 13:18", "转账 · Freelog", "2021053122001128761407364719", "Freelog", "chtes", "200.00", "交易异常"],
    ["2020-08-31 21:02", "资源 · 城市声音采样", "2021053122001128761407364720", "sonic", "raccoon_88", "25.00", "交易关闭"]
  ],
  campaigns: [
    ["内测资源大赛", "资源征集", "2021-08-06 至 2021-08-26", "即将开始", "2021-06-01"],
    ["创作者新星计划", "创作激励", "2024-05-01 至 2024-08-30", "进行中", "2024-04-18"],
    ["节点共建季", "节点运营", "2023-10-01 至 2023-12-31", "已结束", "2023-09-10"],
    ["夏日音频专题", "内容运营", "未设置", "未发布", "—"]
  ],
  topics: [
    ["TP-1024", "新手任务 · 资源任务奖励", "现金", "自动生成", "2021-08-06 至 2021-08-26", "未生效"],
    ["TP-1023", "内测调研 · 6 元奖励", "问卷", "人工维护", "2021-07-01 至 2021-07-30", "已结束"],
    ["TP-1022", "漫画家集结", "资源", "运营分类", "长期", "进行中"]
  ],
  translations: [
    ["msg_new_test_exhibit_added", "新增测试展品", "New test exhibit added", "msg · exhibit", "待提交"],
    ["hint_relativetime_cyclecount01", "刚刚", "Just now", "common · time", "已发布"],
    ["btn_resource_publish", "发布资源", "Publish resource", "btn · resource", "待翻译"],
    ["auth_plan_expired", "授权方案已失效", "Authorization plan expired", "auth · plan", "已发布"]
  ]
};

const definitions = {
  users: { eyebrow: "用户中心", columns: ["用户名", "最近登录", "发布资源数", "运营节点数", "代币余额", "注册手机号 / 邮箱", "账号状态"], rows: baseRows.users, filters: ["全部状态", "正常", "待审核", "冻结"], primary: "导出用户" },
  resources: { eyebrow: "资源中心", columns: ["资源", "资源标识", "需方合约数", "收藏数", "最新版本", "创建时间", "资源状态"], rows: baseRows.resources, filters: ["全部资源", "已上线", "未上线", "已封禁"], primary: "新建资源" },
  nodes: { eyebrow: "节点中心", columns: ["节点", "访问域名", "所属用户", "运营展品数", "需方合约数", "创建时间", "状态"], rows: baseRows.nodes, filters: ["全部节点", "正常", "封停"], primary: "创建节点" },
  transactions: { eyebrow: "交易中心", columns: ["创建时间", "交易说明", "交易记录编号", "收款方", "付款方", "交易金额（枚）", "交易状态"], rows: baseRows.transactions, filters: ["全部状态", "交易完成", "交易异常", "交易关闭"], primary: "导出记录" },
  campaigns: { eyebrow: "运营中心", columns: ["活动名称", "活动类型", "活动时间", "状态", "发布时间"], rows: baseRows.campaigns, filters: ["全部状态", "即将开始", "进行中", "已暂停", "未发布", "已结束"], primary: "新建活动" },
  topics: { eyebrow: "运营中心", columns: ["编号", "专题名称", "内容类型", "内容来源", "有效时间", "状态"], rows: baseRows.topics, filters: ["全部专题", "未生效", "进行中", "已结束"], primary: "新建专题" },
  translations: { eyebrow: "国际化管理", columns: ["Key", "默认译文", "English (en-US)", "标签", "状态"], rows: baseRows.translations, filters: ["全部条目", "待翻译", "待提交", "已发布"], primary: "新建翻译" }
};

const genericNames = {
  "user-tags": ["用户标签", "标签名称", "关联用户数", "创建时间", "状态"],
  "beta-review": ["内测申请", "申请人", "申请说明", "申请时间", "审核状态"],
  invites: ["邀请码", "生成批次", "领取用户", "生成时间", "使用状态"],
  "resource-types": ["资源类型", "类型标识", "包含属性", "关联资源数", "状态"],
  "resource-attributes": ["资源属性", "属性标识", "数据类型", "关联类型数", "状态"],
  "resource-tags": ["资源标签", "标签类型", "关联资源数", "创建时间", "状态"],
  "node-tags": ["节点标签", "标签名称", "关联节点数", "创建时间", "状态"],
  exhibits: ["展品", "所属节点", "引用资源", "创建时间", "状态"],
  contracts: ["合约编号", "合约名称", "甲方", "乙方", "签约时间", "状态"],
  "feather-coins": ["记录编号", "账户", "交易类型", "变动金额", "发生时间", "状态"],
  "payment-channels": ["支付渠道", "渠道编号", "支持币种", "优先级", "状态"],
  "payment-routes": ["支付路由", "路由编号", "匹配条件", "支付渠道", "状态"],
  categories: ["运营分类", "父类", "映射来源", "关联资源数量", "状态"],
  featured: ["精选内容", "内容类型", "推荐位置", "生效时间", "状态"],
  tasks: ["任务名称", "所属活动", "任务类型", "完成条件", "状态"],
  rewards: ["奖励名称", "所属活动", "奖励类型", "库存", "状态"],
  "reward-records": ["发放编号", "奖励名称", "领取用户", "发放时间", "状态"],
  ads: ["广告名称", "广告位置", "投放周期", "点击量", "状态"],
  "auth-templates": ["模板名称", "适用资源类型", "授权策略数", "更新时间", "状态"],
  "demo-nodes": ["示例节点", "节点域名", "展示分类", "更新时间", "状态"],
  "review-policies": ["策略名称", "审核对象", "处置动作", "更新时间", "状态"],
  "version-review": ["资源版本", "提交用户", "资源类型", "提交时间", "审核状态"],
  comments: ["评论内容", "评论用户", "所属内容", "发布时间", "审核状态"],
  "translation-tags": ["标签名称", "标签说明", "关联条目", "更新时间", "状态"]
};

const samples = [
  ["示例条目 A", "FL-20260909001", "内容管理", "2026-09-09 10:30", "已启用"],
  ["示例条目 B", "FL-20260908018", "用户运营", "2026-09-08 16:42", "待审核"],
  ["示例条目 C", "FL-20260907007", "交易服务", "2026-09-07 09:15", "已停用"],
  ["示例条目 D", "FL-20260906032", "平台规则", "2026-09-06 13:08", "已启用"]
];

for (const [id, columns] of Object.entries(genericNames)) {
  const rows = samples.map((sample, index) => {
    const row = [...sample];
    row[0] = `${columns[0]} ${String.fromCharCode(65 + index)}`;
    while (row.length < columns.length) row.splice(row.length - 1, 0, "2026-09-09");
    return row.slice(0, columns.length);
  });
  definitions[id] = {
    eyebrow: navGroups.find(group => group.pages.some(page => page.id === id))?.label || "管理后台",
    columns,
    rows,
    filters: ["全部状态", "已启用", "待审核", "已停用"],
    primary: `新建${columns[0]}`
  };
}

export const pageDefinitions = definitions;

export const dashboardStats = [
  { label: "今日新增用户", value: "128", delta: "+12.4%", tone: "blue" },
  { label: "待审核资源版本", value: "36", delta: "8 项临近超时", tone: "amber" },
  { label: "今日交易额", value: "¥ 28,640", delta: "+6.8%", tone: "green" },
  { label: "运行中活动", value: "7", delta: "2 项本周结束", tone: "violet" }
];

export const recentTasks = [
  ["资源版本审核", "城市声音采样 · v3.1.0", "sonic", "8 分钟前", "待处理"],
  ["内测资格审核", "用户 raccoon_88", "平台运营", "21 分钟前", "待处理"],
  ["评论风险提示", "freeBuzz #29481", "系统检测", "43 分钟前", "需关注"],
  ["支付路由异常", "微信支付 · CN-CNY-02", "支付服务", "1 小时前", "已定位"]
];
