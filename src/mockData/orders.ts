export const orderSummary = [
  { label: "待审批", value: "24", tone: "blue" },
  { label: "高风险", value: "6", tone: "red" },
  { label: "即将超时", value: "3", tone: "amber" }
];

export const approvalOrders = [
  { id: "ORD-260910-001", customer: "远舟内容科技", line: "企业订阅", amount: "¥28,600", risk: "高", status: "待审批", sla: "1h 20m" },
  { id: "ORD-260910-002", customer: "青梧设计社", line: "素材采购", amount: "¥8,240", risk: "中", status: "复核中", sla: "3h 45m" },
  { id: "ORD-260910-003", customer: "北境教育", line: "节点服务", amount: "¥16,900", risk: "低", status: "待审批", sla: "5h 10m" },
  { id: "ORD-260910-004", customer: "澄明实验室", line: "版权授权", amount: "¥42,100", risk: "高", status: "已退回", sla: "-" }
];
