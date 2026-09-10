import { Archive, GitBranch, PackagePlus } from "lucide-react";
import { iterationVersions } from "../mockData/versions";
import { Button } from "../components/ui/Button";
import { formatReadableDate } from "../utils/date";

export function VersionsPage() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-dark">Versioning Ready</p>
          <h2 className="text-2xl font-bold">迭代版本库</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">每轮迭代绑定页面和需求，历史版本统一归档。接入后端后，这里可直接成为 PM、研发、QA 的版本回溯入口。</p>
        </div>
        <Button variant="primary" icon={<PackagePlus className="h-4 w-4" />}>新建迭代</Button>
      </div>
      <section className="grid gap-4">
        {iterationVersions.map(item => (
          <article key={item.id} className="panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-dark">{item.version}</p>
                <h3 className="mt-2 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.summary}</p>
              </div>
              <span className="inline-flex items-center gap-2 border border-line px-3 py-1 text-xs font-bold text-muted" style={{ borderRadius: 8 }}>
                {item.status === "active" ? <GitBranch className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                {item.status === "active" ? "当前迭代" : "历史归档"}
              </span>
            </div>
            <dl className="mt-5 grid gap-3 md:grid-cols-4">
              <div><dt className="text-xs text-muted">负责人</dt><dd className="mt-1 font-bold">{item.owner}</dd></div>
              <div><dt className="text-xs text-muted">更新时间</dt><dd className="mt-1 font-bold">{formatReadableDate(item.lastUpdated)}</dd></div>
              <div><dt className="text-xs text-muted">绑定页面</dt><dd className="mt-1 font-bold">{item.pageIds.length} 个</dd></div>
              <div><dt className="text-xs text-muted">绑定需求</dt><dd className="mt-1 font-bold">{item.requirementIds.length} 条</dd></div>
            </dl>
          </article>
        ))}
      </section>
    </div>
  );
}
