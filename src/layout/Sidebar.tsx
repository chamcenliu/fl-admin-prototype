import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUp, FolderPlus, Pencil, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PageNode } from "../types/page";
import { cn } from "../utils/classNames";
import { Button } from "../components/ui/Button";
import { IconButton } from "../components/ui/IconButton";

type SidebarProps = {
  tree: PageNode[];
  collapsed: boolean;
  activePageId: string;
  onToggle: () => void;
  onCreateFolder: (title: string) => void;
  onRenameFolder: (folderId: string, title: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onSelectPage: (pageId: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
};

function StatusDot({ status }: { status?: PageNode["status"] }) {
  const color = status === "ready" ? "bg-brand" : status === "review" ? "bg-amber-500" : "bg-slate-300";
  return <span className={cn("h-2 w-2 rounded-full", color)} />;
}

function filterTree(nodes: PageNode[], keyword: string): PageNode[] {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return nodes;

  return nodes.flatMap(node => {
    const children = node.children ? filterTree(node.children, normalizedKeyword) : [];
    const selfMatched = node.title.toLowerCase().includes(normalizedKeyword) || node.sourceFile?.toLowerCase().includes(normalizedKeyword);

    if (selfMatched || children.length) {
      return [{ ...node, children }];
    }

    return [];
  });
}

function FolderNameDialog({
  mode,
  initialValue,
  onSubmit,
  onClose
}: {
  mode: "create" | "rename";
  initialValue?: string;
  onSubmit: (title: string) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initialValue || "");

  useEffect(() => {
    setTitle(initialValue || "");
  }, [initialValue]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/25 px-4">
      <form
        className="w-full max-w-sm border border-line bg-white p-5 shadow-2xl"
        style={{ borderRadius: 8 }}
        onSubmit={event => {
          event.preventDefault();
          const normalizedTitle = title.trim();
          if (!normalizedTitle) return;
          onSubmit(normalizedTitle);
          onClose();
        }}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">{mode === "create" ? "新建文件夹" : "重命名文件夹"}</h2>
            <p className="mt-1 text-sm leading-6 text-muted">输入清晰的页面分组名称，方便 PM、研发和 QA 快速定位。</p>
          </div>
          <IconButton label="关闭" icon={<X className="h-4 w-4" />} onClick={onClose} />
        </div>

        <label className="grid gap-2 text-sm font-bold">
          文件夹名称
          <input
            autoFocus
            value={title}
            maxLength={24}
            onChange={event => setTitle(event.target.value)}
            className="h-10 border border-line px-3 font-normal outline-none focus:border-brand"
            style={{ borderRadius: 8 }}
            placeholder="例如：结算流程"
          />
        </label>

        <footer className="mt-5 flex justify-end gap-2">
          <Button type="button" onClick={onClose}>取消</Button>
          <Button type="submit" variant="primary" disabled={!title.trim()}>{mode === "create" ? "新建" : "保存"}</Button>
        </footer>
      </form>
    </div>
  );
}

function DeleteFolderDialog({
  folderTitle,
  onConfirm,
  onClose
}: {
  folderTitle: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/25 px-4">
      <section className="w-full max-w-sm border border-line bg-white p-5 shadow-2xl" style={{ borderRadius: 8 }} role="dialog" aria-modal="true" aria-labelledby="delete-folder-title">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="delete-folder-title" className="text-lg font-bold">删除操作</h2>
            <p className="mt-1 text-sm leading-6 text-muted">确认删除“{folderTitle}”文件夹？删除后该文件夹下的页面也会从当前原型树中移除。</p>
          </div>
          <IconButton label="关闭" icon={<X className="h-4 w-4" />} onClick={onClose} />
        </div>
        <footer className="flex justify-end gap-2">
          <Button type="button" onClick={onClose}>取消</Button>
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center gap-2 border border-red-700 bg-red-700 px-4 text-sm font-bold text-white transition hover:bg-red-800"
            style={{ borderRadius: 8 }}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            删除
          </button>
        </footer>
      </section>
    </div>
  );
}

function SidebarNode({
  node,
  activePageId,
  collapsed,
  collapsedFolderIds,
  searchActive,
  onSelectPage,
  onReorder,
  onRenameFolder,
  onRequestDeleteFolder,
  onToggleFolder
}: Omit<SidebarProps, "tree" | "onToggle" | "onCreateFolder" | "onDeleteFolder"> & {
  node: PageNode;
  collapsedFolderIds: Set<string>;
  searchActive: boolean;
  onRequestDeleteFolder: (folderId: string, folderTitle: string) => void;
  onToggleFolder: (folderId: string) => void;
}) {
  const Icon = node.icon;
  const isFolder = node.type === "folder";
  const isFolderCollapsed = collapsedFolderIds.has(node.id) && !searchActive;

  return (
    <div>
      {isFolder ? (
        <div
          draggable
          onDragStart={event => event.dataTransfer.setData("text/page-id", node.id)}
          onDragOver={event => event.preventDefault()}
          onDrop={event => onReorder(event.dataTransfer.getData("text/page-id"), node.id)}
          className={cn(
            "group mb-1 grid min-h-10 w-full cursor-grab grid-cols-[24px_1fr_auto] items-center gap-2 px-2 text-sm font-bold text-ink transition hover:bg-slate-50 active:cursor-grabbing",
            collapsed && "grid-cols-1 justify-items-center px-0"
          )}
          style={{ borderRadius: 8 }}
          title={node.title}
        >
          <button
            type="button"
            className="grid h-6 w-6 place-items-center text-muted transition hover:text-ink"
            style={{ borderRadius: 8 }}
            aria-label={isFolderCollapsed ? `展开${node.title}` : `收起${node.title}`}
            onClick={event => {
              event.stopPropagation();
              onToggleFolder(node.id);
            }}
          >
            {Icon && isFolderCollapsed ? <Icon className="h-4 w-4" /> : <ChevronDown className={cn("h-4 w-4 transition", isFolderCollapsed && "-rotate-90")} />}
          </button>
          {!collapsed ? <span className="truncate">{node.title}</span> : null}
          {!collapsed ? (
            <span className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
              <IconButton
                label={`重命名${node.title}`}
                icon={<Pencil className="h-3.5 w-3.5" />}
                className="h-7 w-7"
                onClick={() => onRenameFolder(node.id, node.title)}
              />
              <IconButton
                label={`删除${node.title}`}
                icon={<Trash2 className="h-3.5 w-3.5" />}
                className="h-7 w-7 text-red-600 hover:text-red-700"
                onClick={() => onRequestDeleteFolder(node.id, node.title)}
              />
            </span>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          draggable
          onDragStart={event => event.dataTransfer.setData("text/page-id", node.id)}
          onDragOver={event => event.preventDefault()}
          onDrop={event => onReorder(event.dataTransfer.getData("text/page-id"), node.id)}
          onClick={() => onSelectPage(node.id)}
          className={cn(
            "mb-1 grid min-h-10 w-full grid-cols-[24px_1fr_auto] items-center gap-2 px-2 text-left text-sm text-muted transition hover:bg-slate-50 hover:text-ink",
            activePageId === node.id && "bg-brand-soft font-bold text-brand-dark",
            collapsed && "grid-cols-1 justify-items-center px-0"
          )}
          style={{ borderRadius: 8 }}
          title={node.title}
        >
          {Icon ? <Icon className="h-4 w-4" /> : <span className="h-4 w-4" />}
          {!collapsed ? <span className="truncate">{node.title}</span> : null}
          {!collapsed ? <StatusDot status={node.status} /> : null}
        </button>
      )}
      {!collapsed && !isFolderCollapsed && node.children?.length ? (
        <div className="ml-3 border-l border-line pl-3">
          {node.children.map(child => (
            <SidebarNode
              key={child.id}
              node={child}
              activePageId={activePageId}
              collapsed={collapsed}
              collapsedFolderIds={collapsedFolderIds}
              searchActive={searchActive}
              onSelectPage={onSelectPage}
              onReorder={onReorder}
              onRenameFolder={onRenameFolder}
              onRequestDeleteFolder={onRequestDeleteFolder}
              onToggleFolder={onToggleFolder}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Sidebar(props: SidebarProps) {
  const [dialog, setDialog] = useState<{ mode: "create" } | { mode: "rename"; folderId: string; title: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ folderId: string; title: string } | null>(null);
  const [collapsedFolderIds, setCollapsedFolderIds] = useState<Set<string>>(() => new Set());
  const [pageQuery, setPageQuery] = useState("");
  const visibleTree = useMemo(() => filterTree(props.tree, pageQuery), [props.tree, pageQuery]);

  function collectFolderIds(nodes: PageNode[]): string[] {
    return nodes.flatMap(node => [
      ...(node.type === "folder" ? [node.id] : []),
      ...(node.children ? collectFolderIds(node.children) : [])
    ]);
  }

  return (
    <aside className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col border-r border-line bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-line px-4">
        <div className="grid h-9 w-9 place-items-center bg-brand-dark text-sm font-black text-white" style={{ borderRadius: 8 }}>P</div>
        {!props.collapsed ? <strong className="leading-5">Prototype<br />as PRD</strong> : null}
      </div>

      <div className="flex items-center justify-between gap-2 px-3 py-3">
        {!props.collapsed ? <Button icon={<FolderPlus className="h-4 w-4" />} onClick={() => setDialog({ mode: "create" })}>文件夹</Button> : null}
        <div className="flex items-center gap-2">
          {!props.collapsed ? (
            <IconButton
              label="收起所有文件夹"
              icon={<ChevronsUp className="h-4 w-4" />}
              onClick={() => setCollapsedFolderIds(new Set(collectFolderIds(props.tree)))}
            />
          ) : null}
          <IconButton label={props.collapsed ? "展开侧边栏" : "收起侧边栏"} icon={props.collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />} onClick={props.onToggle} />
        </div>
      </div>

      {!props.collapsed ? (
        <div className="border-t border-line px-3 py-3">
          <label className="flex h-9 items-center gap-2 border border-line bg-white px-3 text-sm text-muted" style={{ borderRadius: 8 }}>
            <Search className="h-4 w-4" />
            <input
              value={pageQuery}
              onChange={event => setPageQuery(event.target.value)}
              className="w-full border-0 bg-transparent text-ink outline-none"
              placeholder="搜索文件夹或页面"
            />
          </label>
        </div>
      ) : null}

      <nav className="flex-1 overflow-y-auto px-3 pb-6" aria-label="原型页面">
        {visibleTree.map(node => (
          <SidebarNode
            key={node.id}
            node={node}
            {...props}
            collapsedFolderIds={collapsedFolderIds}
            searchActive={Boolean(pageQuery.trim())}
            onRenameFolder={(folderId, title) => setDialog({ mode: "rename", folderId, title })}
            onRequestDeleteFolder={(folderId, title) => setDeleteTarget({ folderId, title })}
            onToggleFolder={folderId => {
              setCollapsedFolderIds(current => {
                const next = new Set(current);
                next.has(folderId) ? next.delete(folderId) : next.add(folderId);
                return next;
              });
            }}
          />
        ))}
        {!visibleTree.length ? (
          <div className="px-2 py-8 text-center text-sm text-muted">没有匹配的页面</div>
        ) : null}
      </nav>

      {dialog ? (
        <FolderNameDialog
          mode={dialog.mode}
          initialValue={dialog.mode === "rename" ? dialog.title : ""}
          onClose={() => setDialog(null)}
          onSubmit={title => {
            if (dialog.mode === "create") props.onCreateFolder(title);
            else props.onRenameFolder(dialog.folderId, title);
          }}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteFolderDialog
          folderTitle={deleteTarget.title}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            props.onDeleteFolder(deleteTarget.folderId);
            setCollapsedFolderIds(current => {
              const next = new Set(current);
              next.delete(deleteTarget.folderId);
              return next;
            });
          }}
        />
      ) : null}
    </aside>
  );
}
