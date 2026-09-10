import { ClipboardList, FolderKanban, Home, Layers3, ShieldCheck } from "lucide-react";
import type { PageNode } from "../types/page";

// 页面树是原型项目的导航中枢：后续接真实服务时，只需要替换这一份数据源。
export const pageTree: PageNode[] = [
  {
    id: "workspace",
    title: "项目工作台",
    type: "folder",
    icon: FolderKanban,
    children: [
      { id: "dashboard", title: "首页导航", type: "page", status: "ready", icon: Home },
      { id: "versions", title: "迭代版本库", type: "page", status: "review", icon: Layers3 }
    ]
  },
  {
    id: "business",
    title: "业务流程",
    type: "folder",
    icon: ClipboardList,
    children: [
      { id: "order-approval", title: "订单审批示例", type: "page", status: "draft", icon: ShieldCheck }
    ]
  }
];
