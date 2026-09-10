import type { LucideIcon } from "lucide-react";

export type PageNodeType = "folder" | "page";

export type PageNode = {
  id: string;
  title: string;
  type: PageNodeType;
  status?: "draft" | "review" | "ready";
  icon?: LucideIcon;
  children?: PageNode[];
};
