import { ChevronLeft, ChevronRight, FolderPlus } from "lucide-react";
import type { PageNode } from "../types/page";
import { cn } from "../utils/classNames";
import { Button } from "../components/ui/Button";
import { IconButton } from "../components/ui/IconButton";

type SidebarProps = {
  tree: PageNode[];
  collapsed: boolean;
  activePageId: string;
  onToggle: () => void;
  onCreateFolder: () => void;
  onSelectPage: (pageId: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
};

function StatusDot({ status }: { status?: PageNode["status"] }) {
  const color = status === "ready" ? "bg-brand" : status === "review" ? "bg-amber-500" : "bg-slate-300";
  return <span className={cn("h-2 w-2 rounded-full", color)} />;
}

function SidebarNode({ node, activePageId, collapsed, onSelectPage, onReorder }: Omit<SidebarProps, "tree" | "onToggle" | "onCreateFolder"> & { node: PageNode }) {
  const Icon = node.icon;
  const isFolder = node.type === "folder";

  return (
    <div>
      <button
        type="button"
        draggable={node.type === "page"}
        onDragStart={event => event.dataTransfer.setData("text/page-id", node.id)}
        onDragOver={event => event.preventDefault()}
        onDrop={event => onReorder(event.dataTransfer.getData("text/page-id"), node.id)}
        onClick={() => !isFolder && onSelectPage(node.id)}
        className={cn(
          "mb-1 grid min-h-10 w-full grid-cols-[24px_1fr_auto] items-center gap-2 px-2 text-left text-sm transition",
          isFolder ? "font-bold text-ink" : "text-muted hover:bg-slate-50 hover:text-ink",
          activePageId === node.id && "bg-brand-soft font-bold text-brand-dark",
          collapsed && "grid-cols-1 justify-items-center px-0"
        )}
        style={{ borderRadius: 8 }}
        title={node.title}
      >
        {Icon ? <Icon className="h-4 w-4" /> : <span className="h-4 w-4" />}
        {!collapsed ? <span className="truncate">{node.title}</span> : null}
        {!collapsed && !isFolder ? <StatusDot status={node.status} /> : null}
      </button>
      {!collapsed && node.children?.length ? (
        <div className="ml-3 border-l border-line pl-3">
          {node.children.map(child => (
            <SidebarNode key={child.id} node={child} activePageId={activePageId} collapsed={collapsed} onSelectPage={onSelectPage} onReorder={onReorder} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Sidebar(props: SidebarProps) {
  return (
    <aside className="sticky top-0 flex h-screen flex-col border-r border-line bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-line px-4">
        <div className="grid h-9 w-9 place-items-center bg-brand-dark text-sm font-black text-white" style={{ borderRadius: 8 }}>P</div>
        {!props.collapsed ? <strong className="leading-5">Prototype<br />as PRD</strong> : null}
      </div>

      <div className="flex items-center justify-between gap-2 px-3 py-3">
        {!props.collapsed ? <Button icon={<FolderPlus className="h-4 w-4" />} onClick={props.onCreateFolder}>文件夹</Button> : null}
        <IconButton label={props.collapsed ? "展开侧边栏" : "收起侧边栏"} icon={props.collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />} onClick={props.onToggle} />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6" aria-label="原型页面">
        {props.tree.map(node => (
          <SidebarNode key={node.id} node={node} {...props} />
        ))}
      </nav>
    </aside>
  );
}
