export type AdminStatus = "正常" | "待审核" | "冻结" | "已上线" | "未上线" | "封停" | "交易完成" | "交易异常" | "进行中" | "未发布";

export type AdminUser = {
  id: string;
  name: string;
  tags: string[];
  lastLogin: string;
  resources: number;
  nodes: number;
  contracts: number;
  trades: number;
  balance: number;
  contacts: string[];
  registeredAt: string;
  status: "正常" | "待审核" | "冻结";
  freezeReason?: string;
};

export type AdminPageMeta = {
  id: string;
  label: string;
  group: string;
};

export const adminNavGroups = [
  { label: "概览", icon: "⌂", pages: [{ id: "admin-dashboard", label: "首页" }] },
  {
    label: "用户",
    icon: "人",
    pages: [
      { id: "admin-users", label: "用户管理" },
      { id: "admin-user-tags", label: "用户标签管理" },
      { id: "admin-beta-review", label: "内测申请审核" },
      { id: "admin-invites", label: "邀请码管理" }
    ]
  },
  {
    label: "资源",
    icon: "资",
    pages: [
      { id: "admin-resources", label: "资源管理" },
      { id: "admin-resource-types", label: "资源类型管理" },
      { id: "admin-resource-tags", label: "资源标签管理" }
    ]
  },
  {
    label: "节点",
    icon: "节",
    pages: [
      { id: "admin-nodes", label: "节点管理" },
      { id: "admin-node-tags", label: "节点标签管理" },
      { id: "admin-exhibits", label: "展品管理" }
    ]
  },
  { label: "合约", icon: "约", pages: [{ id: "admin-contracts", label: "合约管理" }] },
  {
    label: "交易",
    icon: "易",
    pages: [
      { id: "admin-transactions", label: "交易管理" },
      { id: "admin-feather-coins", label: "羽币交易管理" },
      { id: "admin-payment-channels", label: "支付渠道管理" }
    ]
  },
  {
    label: "运营",
    icon: "营",
    pages: [
      { id: "admin-categories", label: "运营分类管理" },
      { id: "admin-topics", label: "专题管理" },
      { id: "admin-campaigns", label: "活动管理" },
      { id: "admin-ads", label: "站内广告管理" }
    ]
  },
  {
    label: "安全与合规",
    icon: "盾",
    pages: [
      { id: "admin-review-policies", label: "内容审核策略管理" },
      { id: "admin-version-review", label: "资源版本审核" },
      { id: "admin-comments", label: "freeBuzz 评论管理" }
    ]
  },
  {
    label: "国际化",
    icon: "译",
    pages: [
      { id: "admin-translations", label: "翻译管理" },
      { id: "admin-translation-tags", label: "翻译标签管理" }
    ]
  }
];

export const adminUsers: AdminUser[] = [
  {
    id: "user-001",
    name: "chtes",
    tags: ["测试", "资源作者"],
    lastLogin: "今天",
    resources: 20,
    nodes: 1,
    contracts: 3,
    trades: 2,
    balance: 1000,
    contacts: ["138 1234 1234", "chtes@qq.com"],
    registeredAt: "2020-09-01",
    status: "正常"
  },
  {
    id: "user-002",
    name: "chlll",
    tags: ["资源作者"],
    lastLogin: "一周前",
    resources: 0,
    nodes: 0,
    contracts: 0,
    trades: 3,
    balance: 200,
    contacts: ["chtes@qq.com"],
    registeredAt: "2020-09-01",
    status: "待审核"
  },
  {
    id: "user-003",
    name: "chtes01",
    tags: [],
    lastLogin: "07-07",
    resources: 20,
    nodes: 1,
    contracts: 3,
    trades: 1,
    balance: 1000,
    contacts: ["138 1234 1234"],
    registeredAt: "2020-09-01",
    status: "冻结",
    freezeReason: "恶意操作"
  },
  {
    id: "user-004",
    name: "chlll01",
    tags: ["测试"],
    lastLogin: "2019-07-07",
    resources: 0,
    nodes: 0,
    contracts: 0,
    trades: 0,
    balance: 200,
    contacts: ["138 1234 1234", "chtes@qq.com"],
    registeredAt: "2018-08-01",
    status: "正常"
  }
];

export const adminDashboardStats = [
  { label: "今日新增用户", value: "128", delta: "+12.4%", tone: "blue" },
  { label: "待审核资源版本", value: "36", delta: "8 项临近超时", tone: "amber" },
  { label: "今日交易额", value: "¥ 28,640", delta: "+6.8%", tone: "green" },
  { label: "运行中活动", value: "7", delta: "2 项本周结束", tone: "violet" }
];

export const adminRecentTasks = [
  ["资源版本审核", "城市声音采样 · v3.1.0", "sonic", "8 分钟前", "待处理"],
  ["内测资格审核", "用户 chlll", "平台运营", "21 分钟前", "待处理"],
  ["评论风险提示", "freeBuzz #29481", "系统检测", "43 分钟前", "需关注"],
  ["支付路由异常", "微信支付 · CN-CNY-02", "支付服务", "1 小时前", "已定位"]
];

export const adminGenericRows: Record<string, string[][]> = {
  "admin-resources": [
    ["巷口的小狗", "chtes / image-dogs", "5", "100", "2.0.0", "2020-09-01", "已上线"],
    ["巷口的小猫", "chtes / image-cats", "3", "200", "1.8.2", "2019-09-01", "未上线"],
    ["城市声音采样", "sonic / city-sounds", "8", "73", "3.1.0", "2024-06-12", "已上线"],
    ["格林童话", "chlll / grimms", "1", "42", "1.0.4", "2021-03-28", "已封禁"]
  ],
  "admin-nodes": [
    ["看看漫画", "kankan.freelog.com", "chtes", "100 / 200", "100", "2020-09-01", "正常"],
    ["多点小说", "duodian.freelog.com", "chlll", "200 / 200", "0", "2020-09-01", "正常"],
    ["摩登天空音乐", "modernsky.freelog.com", "modern", "86 / 200", "12", "2019-05-12", "封停"],
    ["80s 红白机游戏", "80sgames.freelog.com", "retro80", "10 / 200", "4", "2018-08-01", "正常"]
  ],
  "admin-transactions": [
    ["2020-09-01 14:53", "资源 · 格林童话 · 月订阅", "2021053122001128761407364718", "chtes", "chlll", "10.00", "交易完成"],
    ["2020-09-01 13:18", "转账 · Freelog", "2021053122001128761407364719", "Freelog", "chtes", "200.00", "交易异常"],
    ["2020-08-31 21:02", "资源 · 城市声音采样", "2021053122001128761407364720", "sonic", "chtes", "25.00", "交易关闭"]
  ],
  "admin-campaigns": [
    ["内测资源大赛", "资源征集", "2021-08-06 至 2021-08-26", "即将开始", "2021-06-01"],
    ["创作者新星计划", "创作激励", "2024-05-01 至 2024-08-30", "进行中", "2024-04-18"],
    ["节点共建季", "节点运营", "2023-10-01 至 2023-12-31", "已结束", "2023-09-10"]
  ]
};

export const adminGenericColumns: Record<string, string[]> = {
  "admin-resources": ["资源", "资源标识", "需方合约数", "收藏数", "最新版本", "创建时间", "资源状态"],
  "admin-nodes": ["节点", "访问域名", "所属用户", "运营展品数", "需方合约数", "创建时间", "状态"],
  "admin-transactions": ["创建时间", "交易说明", "交易记录编号", "收款方", "付款方", "交易金额（枚）", "交易状态"],
  "admin-campaigns": ["活动名称", "活动类型", "活动时间", "状态", "发布时间"]
};

export function findAdminPage(pageId: string): AdminPageMeta {
  for (const group of adminNavGroups) {
    const page = group.pages.find(item => item.id === pageId);
    if (page) return { ...page, group: group.label };
  }

  return { id: "admin-dashboard", label: "首页", group: "概览" };
}
