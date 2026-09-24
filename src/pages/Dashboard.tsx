import { Archive, ArrowRight, GitCommitHorizontal } from "lucide-react";
import { iterationVersions } from "../mockData/versions";
import { pageTree } from "../mockData/pageTree";

export function Dashboard({ onOpenPage }: { onOpenPage: (pageId: string) => void }) {
  const activeVersion = iterationVersions.find(item => item.status === "active")!;

  return (
    <div className="grid gap-6">
      <section className="panel grid gap-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-dark">原型即交付物</p>
            <h2 className="text-2xl font-bold">团队云端原型工作台</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">页面、需求标注和迭代记录在同一个前端项目内同步演进。PM 看需求闭环，研发看接入边界，QA 看验收口径。</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["页面文件夹", "支持新增文件夹与拖拽排序"],
            ["版本水印", "每个页面固定展示版本号和更新时间"],
            ["PRD 标注", "点击页面标记即可查看需求说明与验收标准"]
          ].map(([title, desc]) => (
            <article key={title} className="border border-line bg-slate-50 p-4" style={{ borderRadius: 8 }}>
              <strong>{title}</strong>
              <p className="mt-2 text-sm leading-6 text-muted">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold">页面结构</h3>
            <span className="text-xs text-muted">来自 mockData/pageTree.ts</span>
          </div>
          <div className="grid gap-3">
            {pageTree.map(folder => (
              <div key={folder.id} className="border border-line p-3" style={{ borderRadius: 8 }}>
                <strong>{folder.title}</strong>
                <div className="mt-3 grid gap-2">
                  {folder.children?.map(page => (
                    <button key={page.id} type="button" onClick={() => onOpenPage(page.id)} className="flex items-center justify-between bg-white px-3 py-2 text-left text-sm hover:bg-brand-soft" style={{ borderRadius: 8 }}>
                      <span>{page.title}</span>
                      <ArrowRight className="h-4 w-4 text-muted" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold">当前迭代</h3>
            <GitCommitHorizontal className="h-5 w-5 text-brand-dark" />
          </div>
          <div className="border border-brand/40 bg-brand-soft p-4" style={{ borderRadius: 8 }}>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-dark">{activeVersion.version}</p>
            <h4 className="mt-2 text-lg font-bold">{activeVersion.title}</h4>
            <p className="mt-2 text-sm leading-6 text-muted">{activeVersion.summary}</p>
          </div>
          <div className="mt-4 grid gap-3">
            {iterationVersions.filter(item => item.status === "archived").map(item => (
              <div key={item.id} className="flex gap-3 border border-line p-3" style={{ borderRadius: 8 }}>
                <Archive className="mt-0.5 h-4 w-4 text-muted" />
                <div>
                  <strong className="text-sm">{item.version}</strong>
                  <p className="text-sm text-muted">{item.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
