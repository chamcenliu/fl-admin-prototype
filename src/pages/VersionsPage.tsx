import { CheckCircle2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../components/ui/Button";
import { IconButton } from "../components/ui/IconButton";
import { pageTree } from "../mockData/pageTree";
import { iterationVersions } from "../mockData/versions";
import type { PageNode } from "../types/page";
import type { IterationVersion } from "../types/version";

type EditableIteration = Pick<IterationVersion, "id" | "title" | "pageIds">;

function collectPages(nodes: PageNode[]): Array<Pick<PageNode, "id" | "title">> {
  return nodes.flatMap(node => [
    ...(node.type === "page" ? [{ id: node.id, title: node.title }] : []),
    ...(node.children ? collectPages(node.children) : [])
  ]);
}

function IterationDialog({
  title,
  initialValue = "",
  initialPageIds = [],
  onClose,
  onSubmit
}: {
  title: string;
  initialValue?: string;
  initialPageIds?: string[];
  onClose: () => void;
  onSubmit: (name: string, pageIds: string[]) => void;
}) {
  const pages = collectPages(pageTree);
  const [name, setName] = useState(initialValue);
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(() => new Set(initialPageIds));

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
            {pages.map(page => (
              <label key={page.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedPageIds.has(page.id)}
                  onChange={event => {
                    setSelectedPageIds(current => {
                      const next = new Set(current);
                      event.target.checked ? next.add(page.id) : next.delete(page.id);
                      return next;
                    });
                  }}
                />
                <span>{page.title}</span>
              </label>
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

export function IterationsModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [activeIterationId, setActiveIterationId] = useState(iterationVersions[0].id);
  const [iterations, setIterations] = useState<EditableIteration[]>(() =>
    iterationVersions.map(item => ({ id: item.id, title: item.title, pageIds: item.pageIds }))
  );
  const [creating, setCreating] = useState(false);
  const [editingIteration, setEditingIteration] = useState<EditableIteration | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EditableIteration | null>(null);

  const filteredIterations = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return iterations;
    return iterations.filter(item => item.title.toLowerCase().includes(keyword));
  }, [iterations, query]);

  function createIteration(name: string, pageIds: string[]) {
    const id = `iteration-${Date.now()}`;
    setIterations(current => [{ id, title: name, pageIds }, ...current]);
    setActiveIterationId(id);
  }

  function renameIteration(iterationId: string, name: string, pageIds: string[]) {
    setIterations(current => current.map(item => (item.id === iterationId ? { ...item, title: name, pageIds } : item)));
  }

  function deleteIteration(iterationId: string) {
    setIterations(current => current.filter(item => item.id !== iterationId));
    if (activeIterationId === iterationId) {
      setActiveIterationId(iterations.find(item => item.id !== iterationId)?.id || "");
    }
  }

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
                    <IconButton label="切换到此迭代" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => setActiveIterationId(item.id)} />
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
        <IterationDialog title="新建迭代" onClose={() => setCreating(false)} onSubmit={createIteration} />
      ) : null}

      {editingIteration ? (
        <IterationDialog
          title="重命名迭代"
          initialValue={editingIteration.title}
          initialPageIds={editingIteration.pageIds}
          onClose={() => setEditingIteration(null)}
          onSubmit={(name, pageIds) => renameIteration(editingIteration.id, name, pageIds)}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmDialog
          name={deleteTarget.title}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteIteration(deleteTarget.id)}
        />
      ) : null}
      </section>
    </div>
  );
}
