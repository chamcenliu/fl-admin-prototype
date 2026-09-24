import type { IterationVersion } from "../types/version";

export const iterationVersions: IterationVersion[] = [
  {
    id: "it-20260914-prd-shell",
    version: "v1.1.0",
    title: "Freelog 后台嵌入 Prototype-as-PRD",
    status: "active",
    owner: "产品架构组",
    lastUpdated: "2026-09-14T10:40:00+08:00",
    pageIds: ["admin-dashboard", "admin-users", "admin-resources", "admin-nodes", "admin-transactions", "admin-campaigns", "admin-auth-templates", "admin-review-policies"],
    requirementIds: ["prd-fl-admin-embedded-shell", "prd-fl-admin-dashboard", "prd-fl-admin-user-filter", "prd-fl-admin-user-search", "prd-fl-admin-user-table", "prd-fl-admin-auth-template-filter", "prd-fl-admin-auth-template-search", "prd-fl-admin-auth-template-table"],
    summary: "将 Freelog 管理后台交互原型接入 Prototype-as-PRD 交付框架，并补齐用户管理与授权策略模板管理的核心交互和 PRD 标注。"
  },
  {
    id: "it-20260910-beta",
    version: "v1.0.0-Beta",
    title: "原型脚手架首轮",
    status: "archived",
    owner: "产品架构组",
    lastUpdated: "2026-09-10T15:40:00+08:00",
    pageIds: ["dashboard", "versions"],
    requirementIds: ["prd-order-filter", "prd-risk-summary", "prd-approval-action"],
    summary: "完成页面组织、版本水印与 PRD 标注。"
  },
  {
    id: "it-20260909-alpha",
    version: "v0.9.0-Alpha",
    title: "后台原型导入归档",
    status: "archived",
    owner: "PMO",
    lastUpdated: "2026-09-09T18:20:00+08:00",
    pageIds: ["dashboard"],
    requirementIds: [],
    summary: "从旧交互原型中抽取核心后台信息架构。"
  }
];

export const currentVersion = iterationVersions[0];
