import { CheckCircle2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../components/ui/Button";
import { IconButton } from "../components/ui/IconButton";
import type { PageNode } from "../types/page";
import type { IterationVersion } from "../types/version";

type EditableIteration = Pick<IterationVersion, "id" | "title" | "pageIds">;

function IterationDialog({
  title,
  pageTree,
  initialValue = "",
  initialPageIds = [],
  onClose,
  onSubmit
}: {
  title: string;
  pageTree: PageNode[];
  initialValue?: string;
  initialPageIds?: string[];
  onClose: () => void;
  onSubmit: (name: string, pageIds: string[]) => void;
}) {
  const [name, setName] = useState(initialValue);
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(() => new Set(initialPageIds));
  const togglePage = (pageId: string, checked: boolean) => {
    setSelectedPageIds(current => {
      const next = new Set(current);
      checked ? next.add(pageId) : next.delete(pageId);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/25 px-4">
      <form
        className="w-full max-w-md border border-line bg-white p-5 shadow-2xl"
        style={{ borderRadius: 8 }}
        onSubmit={event => {
          event.preventDefault();
          const normalizedName = name.trim();
          if (!normalizedName) return;
          onSubmit(normalizedName, [...selectedPageIds]);
          onClose();
        }}
      >
        <h2 className="text-lg font-bold">{title}</h2>

        <label className="mt-4 grid gap-2 text-sm font-bold">
          迭代版本名称
          <input
            autoFocus
            value={name}
            maxLength={32}
            onChange={event => setName(event.target.value)}
            className="h-10 border border-line px-3 font-normal outline-none focus:border-brand"
            style={{ borderRadius: 8 }}
            placeholder="例如：订单审批 v1.1"
          />
        </label>

        <fieldset className="mt-4 grid gap-2">
          <legend className="mb-2 text-sm font-bold">绑定页面</legend>
          <div className="grid max-h-48 gap-2 overflow-y-auto border border-line p-3" style={{ borderRadius: 8 }}>
            {pageTree.map(node => (
              <PageBindingNode key={node.id} node={node} selectedPageIds={selectedPageIds} onTogglePage={togglePage} />
            ))}
          </div>
        </fieldset>

        <footer className="mt-5 flex justify-end gap-2">
          <Button type="button" onClick={onClose}>取消</Button>
          <Button type="submit" variant="primary" disabled={!name.trim()}>保存</Button>
        </footer>
      </form>
    </div>
  );
}

function PageBindingNode({
  node,
  selectedPageIds,
  depth = 0,
  onTogglePage
}: {
  node: PageNode;
  selectedPageIds: Set<string>;
  depth?: number;
  onTogglePage: (pageId: string, checked: boolean) => void;
}) {
  if (node.type === "folder") {
    return (
      <div className="grid gap-2">
        <div className="text-xs font-bold text-muted" style={{ paddingLeft: depth * 16 }}>{node.title}</div>
        {node.children?.map(child => (
          <PageBindingNode key={child.id} node={child} selectedPageIds={selectedPageIds} depth={depth + 1} onTogglePage={onTogglePage} />
        ))}
      </div>
    );
  }

  return (
    <label className="flex items-center gap-2 text-sm" style={{ paddingLeft: depth * 16 }}>
      <input
        type="checkbox"
        checked={selectedPageIds.has(node.id)}
        onChange={event => onTogglePage(node.id, event.target.checked)}
      />
      <span>{node.title}</span>
      {node.sourceFile ? <code className="ml-auto truncate rounded bg-slate-100 px-2 py-0.5 text-xs text-muted">{node.sourceFile}</code> : null}
    </label>
  );
}

function DeleteConfirmDialog({ name, onClose, onConfirm }: { name: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/25 px-4">
      <section className="w-full max-w-sm border border-line bg-white p-5 shadow-2xl" style={{ borderRadius: 8 }} role="dialog" aria-modal="true">
        <h2 className="text-lg font-bold">删除操作</h2>
        <p className="mt-2 text-sm leading-6 text-muted">确认删除“{name}”？删除后该迭代版本会从当前列表中移除。</p>
        <footer className="mt-5 flex justify-end gap-2">
          <Button type="button" onClick={onClose}>取消</Button>
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center border border-red-700 bg-red-700 px-4 text-sm font-bold text-white transition hover:bg-red-800"
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

export function IterationsModal({
  pageTree,
  iterations,
  activeIterationId,
  onClose,
  onCreateIteration,
  onUpdateIteration,
  onDeleteIteration,
  onSwitchIteration
}: {
  pageTree: PageNode[];
  iterations: IterationVersion[];
  activeIterationId: string;
  onClose: () => void;
  onCreateIteration: (name: string, pageIds: string[]) => void;
  onUpdateIteration: (iterationId: string, name: string, pageIds: string[]) => void;
  onDeleteIteration: (iterationId: string) => void;
  onSwitchIteration: (iterationId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingIteration, setEditingIteration] = useState<EditableIteration | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EditableIteration | null>(null);

  const filteredIterations = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return iterations;
    return iterations.filter(item => item.title.toLowerCase().includes(keyword));
  }, [iterations, query]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/25 px-4 py-6">
      <section className="grid max-h-[86vh] w-full max-w-3xl gap-4 overflow-hidden border border-line bg-canvas p-5 shadow-2xl" style={{ borderRadius: 8 }} role="dialog" aria-modal="true" aria-labelledby="iterations-modal-title">
        <header className="flex items-center justify-between gap-4">
          <h2 id="iterations-modal-title" className="text-lg font-bold">迭代列表</h2>
          <IconButton label="关闭" icon={<X className="h-4 w-4" />} onClick={onClose} />
        </header>

      <section className="panel p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex h-10 min-w-80 items-center gap-2 border border-line bg-white px-3 text-sm text-muted" style={{ borderRadius: 8 }}>
            <Search className="h-4 w-4" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              className="w-full border-0 bg-transparent text-ink outline-none"
              placeholder="搜索迭代版本名称"
            />
          </label>
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>新建迭代</Button>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead className="bg-slate-50 text-left text-muted">
            <tr>
              <th className="border-b border-line px-4 py-3 font-bold">迭代版本名称</th>
              <th className="w-56 border-b border-line px-4 py-3 text-right font-bold">操作栏</th>
            </tr>
          </thead>
          <tbody>
            {filteredIterations.map(item => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="border-b border-line px-4 py-4">
                  <div className="flex items-center gap-2">
                    {activeIterationId === item.id ? <CheckCircle2 className="h-4 w-4 text-brand" /> : null}
                    <span className="font-bold">{item.title}</span>
                  </div>
                </td>
                <td className="border-b border-line px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <IconButton label="切换到此迭代" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => onSwitchIteration(item.id)} />
                    <IconButton label="重命名" icon={<Pencil className="h-4 w-4" />} onClick={() => setEditingIteration(item)} />
                    <IconButton label="删除" icon={<Trash2 className="h-4 w-4" />} className="text-red-600 hover:text-red-700" onClick={() => setDeleteTarget(item)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {creating ? (
        <IterationDialog title="新建迭代" pageTree={pageTree} onClose={() => setCreating(false)} onSubmit={onCreateIteration} />
      ) : null}

      {editingIteration ? (
        <IterationDialog
          title="重命名迭代"
          pageTree={pageTree}
          initialValue={editingIteration.title}
          initialPageIds={editingIteration.pageIds}
          onClose={() => setEditingIteration(null)}
          onSubmit={(name, pageIds) => onUpdateIteration(editingIteration.id, name, pageIds)}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmDialog
          name={deleteTarget.title}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => onDeleteIteration(deleteTarget.id)}
        />
      ) : null}
      </section>
    </div>
  );
}
