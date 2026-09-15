import { ArrowLeft, Code2, Copy, Layers3, Maximize2, Minimize2 } from "lucide-react";
import type { ReactNode } from "react";
import type { PageNode } from "../types/page";
import { Sidebar } from "./Sidebar";
import { cn } from "../utils/classNames";
import { IconButton } from "../components/ui/IconButton";

type GlobalLayoutProps = {
  tree: PageNode[];
  activeTitle?: string;
  activePath: PageNode[];
  activePageId: string;
  collapsed: boolean;
  prototypeFullscreen: boolean;
  shareStatus?: string;
  children: ReactNode;
  onToggleSidebar: () => void;
  onTogglePrototypeFullscreen: () => void;
  onCreateFolder: (title: string) => void;
  onRenameFolder: (folderId: string, title: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onBack: () => void;
  onShareCurrentPage: () => void;
  onCreateIteration: () => void;
  onSelectPage: (pageId: string) => void;
  onReorder: (draggedId: string, targetId: string, placement: "before" | "after" | "inside") => void;
};

function firstPageId(node: PageNode): string | undefined {
  if (node.type === "page") return node.id;
  for (const child of node.children || []) {
    const pageId = firstPageId(child);
    if (pageId) return pageId;
  }
  return undefined;
}

function PrototypeActions({
  prototypeFullscreen,
  shareStatus,
  onShareCurrentPage,
  onCreateIteration,
  onTogglePrototypeFullscreen
}: Pick<GlobalLayoutProps, "prototypeFullscreen" | "shareStatus" | "onShareCurrentPage" | "onCreateIteration" | "onTogglePrototypeFullscreen">) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <IconButton variant="frameless" label="分享当前原型页地址" icon={<Copy className="h-4 w-4" />} onClick={onShareCurrentPage} />
        {shareStatus ? (
          <span className="absolute right-0 top-11 whitespace-nowrap border border-line bg-white px-2 py-1 text-xs font-bold text-brand-dark shadow-panel" style={{ borderRadius: 8 }}>
            {shareStatus}
          </span>
        ) : null}
      </div>
      {!prototypeFullscreen ? (
        <IconButton variant="frameless" label="迭代列表" icon={<Layers3 className="h-4 w-4" />} onClick={onCreateIteration} />
      ) : null}
      <IconButton
        variant="frameless"
        label={prototypeFullscreen ? "显示导航" : "全屏显示原型"}
        icon={prototypeFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        onClick={onTogglePrototypeFullscreen}
        className="text-brand-dark hover:bg-brand-soft hover:text-brand-dark"
      />
    </div>
  );
}

function FullscreenActionDock({
  shareStatus,
  onShareCurrentPage,
  onTogglePrototypeFullscreen
}: Pick<GlobalLayoutProps, "shareStatus" | "onShareCurrentPage" | "onTogglePrototypeFullscreen">) {
  return (
    <div className="group fixed left-1/2 top-0 z-40 -translate-x-1/2">
      <div className="mx-auto h-2 w-16 bg-brand shadow-panel transition-all group-hover:h-0" />
      <div
        className="flex -translate-y-14 items-center gap-2 border border-line bg-white/95 px-3 py-2 opacity-0 shadow-panel backdrop-blur transition-all duration-200 group-hover:translate-y-3 group-hover:opacity-100"
        style={{ borderRadius: 8 }}
        aria-label="全屏原型操作"
      >
        <div className="relative">
          <IconButton variant="frameless" label="分享当前原型页地址" icon={<Copy className="h-4 w-4" />} onClick={onShareCurrentPage} />
          {shareStatus ? (
            <span className="absolute left-1/2 top-10 -translate-x-1/2 whitespace-nowrap border border-line bg-white px-2 py-1 text-xs font-bold text-brand-dark shadow-panel" style={{ borderRadius: 8 }}>
              {shareStatus}
            </span>
          ) : null}
        </div>
        <IconButton
          variant="frameless"
          label="显示导航"
          icon={<Minimize2 className="h-4 w-4" />}
          onClick={onTogglePrototypeFullscreen}
          className="text-brand-dark hover:bg-brand-soft hover:text-brand-dark"
        />
      </div>
    </div>
  );
}

export function GlobalLayout({ children, collapsed, activeTitle, activePath, prototypeFullscreen, shareStatus, onToggleSidebar, onBack, onShareCurrentPage, onCreateIteration, onTogglePrototypeFullscreen, onSelectPage, ...props }: GlobalLayoutProps) {
  const currentPage = activePath[activePath.length - 1];

  if (prototypeFullscreen) {
    return (
      <div className="min-h-screen bg-canvas">
        <FullscreenActionDock
          shareStatus={shareStatus}
          onShareCurrentPage={onShareCurrentPage}
          onTogglePrototypeFullscreen={onTogglePrototypeFullscreen}
        />
        <main className="prototype-fullscreen-main min-h-screen w-full p-0">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 grid min-h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 border-b border-line bg-white/90 px-4 py-3 backdrop-blur lg:px-6">
        <IconButton label="后退" icon={<ArrowLeft className="h-4 w-4" />} onClick={onBack} />

        <div className="flex min-w-0 items-center gap-3">
          <nav className="flex min-w-0 flex-none items-center gap-1 text-sm" aria-label="原型页面面包屑">
            {activePath.length ? activePath.map((node, index) => {
              const targetPageId = firstPageId(node);
              const isLast = index === activePath.length - 1;
              return (
                <span key={node.id} className="flex min-w-0 items-center gap-1">
                  <button
                    type="button"
                    disabled={!targetPageId}
                    onClick={() => targetPageId && onSelectPage(targetPageId)}
                    className={cn(
                      "max-w-40 truncate px-1 py-0.5 font-bold transition hover:text-brand-dark disabled:cursor-default disabled:text-muted",
                      isLast ? "text-ink" : "text-muted"
                    )}
                  >
                    {node.title}
                  </button>
                  {!isLast ? <span className="text-muted">/</span> : null}
                </span>
              );
            }) : <strong>{activeTitle || "首页导航"}</strong>}
          </nav>
          <div className="flex min-w-0 items-center gap-2 text-xs text-muted">
            <Code2 className="h-3.5 w-3.5 flex-none" />
            <code className="truncate rounded bg-slate-100 px-2 py-0.5">{currentPage?.sourceFile || "未绑定源码文件"}</code>
          </div>
        </div>

        <PrototypeActions
          prototypeFullscreen={prototypeFullscreen}
          shareStatus={shareStatus}
          onShareCurrentPage={onShareCurrentPage}
          onCreateIteration={onCreateIteration}
          onTogglePrototypeFullscreen={onTogglePrototypeFullscreen}
        />
      </header>

      <div className={cn("grid", collapsed ? "grid-cols-[72px_minmax(0,1fr)]" : "grid-cols-[272px_minmax(0,1fr)]")}>
        <Sidebar collapsed={collapsed} onToggle={onToggleSidebar} onSelectPage={onSelectPage} {...props} />
        <section className="min-w-0">
          <main className="prototype-display-main w-full px-6 py-6">{children}</main>
        </section>
      </div>
    </div>
  );
}
