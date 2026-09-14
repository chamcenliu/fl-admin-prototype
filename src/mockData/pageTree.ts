import { ClipboardList, LayoutDashboard, ShieldCheck, Users, Database, Network, ReceiptText, Megaphone, Languages, ShieldAlert } from "lucide-react";
import type { PageNode } from "../types/page";

// 页面树是原型项目的导航中枢：后续接真实服务时，只需要替换这一份数据源。
export const pageTree: PageNode[] = [
  {
    id: "fl-admin",
    title: "Freelog 管理后台",
    type: "folder",
    icon: LayoutDashboard,
    children: [
      { id: "admin-dashboard", title: "首页", type: "page", status: "ready", icon: LayoutDashboard, sourceFile: "src/pages/admin/AdminPrototypePage.tsx" },
      {
        id: "admin-user-folder",
        title: "用户",
        type: "folder",
        icon: Users,
        children: [
          { id: "admin-users", title: "用户管理", type: "page", status: "ready", icon: Users, sourceFile: "src/pages/admin/AdminPrototypePage.tsx" },
          { id: "admin-user-tags", title: "用户标签管理", type: "page", status: "draft", icon: Users, sourceFile: "src/pages/admin/AdminPrototypePage.tsx" },
          { id: "admin-beta-review", title: "内测申请审核", type: "page", status: "draft", icon: Users, sourceFile: "src/pages/admin/AdminPrototypePage.tsx" },
          { id: "admin-invites", title: "邀请码管理", type: "page", status: "draft", icon: Users, sourceFile: "src/pages/admin/AdminPrototypePage.tsx" }
        ]
      },
      {
        id: "admin-content-folder",
        title: "资源与节点",
        type: "folder",
        icon: Database,
        children: [
          { id: "admin-resources", title: "资源管理", type: "page", status: "review", icon: Database, sourceFile: "src/pages/admin/AdminPrototypePage.tsx" },
          { id: "admin-nodes", title: "节点管理", type: "page", status: "review", icon: Network, sourceFile: "src/pages/admin/AdminPrototypePage.tsx" },
          { id: "admin-exhibits", title: "展品管理", type: "page", status: "draft", icon: Network, sourceFile: "src/pages/admin/AdminPrototypePage.tsx" }
        ]
      },
      {
        id: "admin-trade-folder",
        title: "合约与交易",
        type: "folder",
        icon: ReceiptText,
        children: [
          { id: "admin-contracts", title: "合约管理", type: "page", status: "draft", icon: ReceiptText, sourceFile: "src/pages/admin/AdminPrototypePage.tsx" },
          { id: "admin-transactions", title: "交易管理", type: "page", status: "review", icon: ReceiptText, sourceFile: "src/pages/admin/AdminPrototypePage.tsx" },
          { id: "admin-feather-coins", title: "羽币交易管理", type: "page", status: "draft", icon: ReceiptText, sourceFile: "src/pages/admin/AdminPrototypePage.tsx" }
        ]
      },
      {
        id: "admin-ops-folder",
        title: "运营、安全与国际化",
        type: "folder",
        icon: Megaphone,
        children: [
          { id: "admin-campaigns", title: "活动管理", type: "page", status: "review", icon: Megaphone, sourceFile: "src/pages/admin/AdminPrototypePage.tsx" },
          { id: "admin-version-review", title: "资源版本审核", type: "page", status: "draft", icon: ShieldAlert, sourceFile: "src/pages/admin/AdminPrototypePage.tsx" },
          { id: "admin-translations", title: "翻译管理", type: "page", status: "draft", icon: Languages, sourceFile: "src/pages/admin/AdminPrototypePage.tsx" }
        ]
      }
    ]
  },
  {
    id: "business",
    title: "业务流程",
    type: "folder",
    icon: ClipboardList,
    children: [
      { id: "order-approval", title: "订单审批示例", type: "page", status: "draft", icon: ShieldCheck, sourceFile: "src/pages/examples/OrderApprovalPage.tsx" }
    ]
  }
];
