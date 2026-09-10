import { Bell, Search } from "lucide-react";
import type { ReactNode } from "react";
import type { PageNode } from "../types/page";
import { Sidebar } from "./Sidebar";
import { IconButton } from "../components/ui/IconButton";
import { cn } from "../utils/classNames";

type GlobalLayoutProps = {
  tree: PageNode[];
  activeTitle?: string;
  activePageId: string;
  collapsed: boolean;
  children: ReactNode;
  onToggleSidebar: () => void;
  onCreateFolder: () => void;
  onSelectPage: (pageId: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
};

export function GlobalLayout({ children, collapsed, activeTitle, onToggleSidebar, ...props }: GlobalLayoutProps) {
  return (
    <div className={cn("grid min-h-screen", collapsed ? "grid-cols-[72px_minmax(0,1fr)]" : "grid-cols-[272px_minmax(0,1fr)]")}>
      <Sidebar collapsed={collapsed} onToggle={onToggleSidebar} {...props} />
      <section className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white/90 px-6 backdrop-blur">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-dark">Prototype-as-PRD</p>
            <h1 className="text-lg font-bold">{activeTitle || "首页导航"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <label className="hidden h-9 min-w-64 items-center gap-2 border border-line bg-white px-3 text-sm text-muted md:flex" style={{ borderRadius: 8 }}>
              <Search className="h-4 w-4" />
              <input className="w-full border-0 bg-transparent outline-none" placeholder="搜索页面、版本或需求" />
            </label>
            <IconButton label="通知" icon={<Bell className="h-4 w-4" />} />
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-6 py-6">{children}</main>
      </section>
    </div>
  );
}
