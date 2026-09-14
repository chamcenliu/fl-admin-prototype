import { useMemo, useState } from "react";
import {
  adminAuthTemplates,
  adminDashboardStats,
  adminGenericColumns,
  adminGenericRows,
  adminNavGroups,
  adminRecentTasks,
  adminResourceTypeOptions,
  adminUsers,
  findAdminPage,
  type AdminAuthTemplate,
  type AdminUser
} from "../../mockData/adminPrototype";
import { PrdWrapper } from "../../components/prd/PrdWrapper";
import "./AdminPrototypePage.css";

type AdminDialog =
  | { type: "tags"; userIds: string[] }
  | { type: "freeze"; userId: string }
  | { type: "restore"; userId: string }
  | { type: "review"; userId: string }
  | { type: "date" }
  | { type: "detail"; userId: string }
  | null;

type AuthTemplateDialog =
  | { type: "create" }
  | { type: "edit"; templateId: string }
  | { type: "preview"; templateId: string }
  | { type: "scope"; templateIds: string[] }
  | { type: "delete"; templateId: string }
  | null;

const tagOptions = ["小说", "测试", "节点商", "资源作者", "消费者"];
const freezeReasons = ["抄袭、侵权", "垃圾广告", "色情、暴力", "不实信息", "欺诈", "恶意操作"];

function statusClass(status: string) {
  if (/正常|上线|完成|进行中|启用|发布|已定位/.test(status)) return "success";
  if (/待|即将|关注|未生效/.test(status)) return "warning";
  if (/异常|冻结|封停|封禁|关闭|停用/.test(status)) return "danger";
  return "neutral";
}

function makeGenericRows(pageId: string) {
  const fallbackTitle = findAdminPage(pageId).label.replace("管理", "");
  return adminGenericRows[pageId] || [
    [`${fallbackTitle} A`, "FL-20260909001", "内容管理", "2026-09-09 10:30", "已启用"],
    [`${fallbackTitle} B`, "FL-20260908018", "用户运营", "2026-09-08 16:42", "待审核"],
    [`${fallbackTitle} C`, "FL-20260907007", "交易服务", "2026-09-07 09:15", "已停用"],
    [`${fallbackTitle} D`, "FL-20260906032", "平台规则", "2026-09-06 13:08", "已启用"]
  ];
}

function makeGenericColumns(pageId: string) {
  return adminGenericColumns[pageId] || ["名称", "编号", "分类", "更新时间", "状态"];
}

function AdminDashboard({ onOpenPrd }: { onOpenPrd: (noteId: string) => void }) {
  return (
    <>
      <div className="fl-admin-page-heading">
        <div>
          <span className="fl-admin-eyebrow">管理概览</span>
          <h2>首页</h2>
          <p>查看平台重点指标和当前待办。</p>
        </div>
        <span className="fl-admin-secondary-button">2026 年 9 月 14 日 · 周一</span>
      </div>

      <PrdWrapper noteId="prd-fl-admin-dashboard" onOpen={onOpenPrd}>
        <section className="fl-admin-stats">
          {adminDashboardStats.map(item => (
            <article key={item.label} className={`fl-admin-stat ${item.tone}`}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <em>{item.delta}</em>
            </article>
          ))}
        </section>
      </PrdWrapper>

      <section className="fl-admin-panel">
        <div className="fl-admin-toolbar">
          <strong>待办事项</strong>
          <span className="ml-auto text-sm text-muted">按更新时间排序</span>
        </div>
        <div className="fl-admin-table-wrap">
          <table className="fl-admin-table">
            <thead>
              <tr>{["类型", "事项", "来源", "更新时间", "状态", "操作"].map(column => <th key={column}>{column}</th>)}</tr>
            </thead>
            <tbody>
              {adminRecentTasks.map(row => (
                <tr key={row.join("-")}>
                  {row.map((cell, index) => (
                    <td key={`${cell}-${index}`}>{index === row.length - 1 ? <span className={`fl-admin-status ${statusClass(cell)}`}>{cell}</span> : cell}</td>
                  ))}
                  <td><button className="fl-admin-action-button" type="button">处理</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function AdminGenericList({ pageId }: { pageId: string }) {
  const meta = findAdminPage(pageId);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("全部状态");
  const columns = makeGenericColumns(pageId);
  const rows = makeGenericRows(pageId).filter(row => {
    const matchesQuery = !query || row.some(cell => cell.toLowerCase().includes(query.toLowerCase()));
    const matchesStatus = status === "全部状态" || row.includes(status);
    return matchesQuery && matchesStatus;
  });

  return (
    <>
      <div className="fl-admin-page-heading">
        <div>
          <span className="fl-admin-eyebrow">{meta.group}</span>
          <h2>{meta.label}</h2>
          <p>管理和维护{meta.label.replace("管理", "")}相关数据。</p>
        </div>
        <button className="fl-admin-button" type="button">+ 新建{meta.label.replace("管理", "")}</button>
      </div>

      <section className="fl-admin-panel">
        <div className="fl-admin-toolbar">
          <label className="fl-admin-search-box">
            <span>⌕</span>
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索名称、编号或用户" />
          </label>
          <select className="fl-admin-secondary-button" value={status} onChange={event => setStatus(event.target.value)}>
            {["全部状态", "正常", "已上线", "待审核", "冻结", "未上线", "封停", "交易完成", "交易异常", "进行中", "未发布"].map(item => <option key={item}>{item}</option>)}
          </select>
          <button className="fl-admin-secondary-button" type="button">创建时间</button>
          <button className="fl-admin-secondary-button" type="button" onClick={() => { setQuery(""); setStatus("全部状态"); }}>重置</button>
          <span className="ml-auto text-sm text-muted">共 {rows.length * 9 + 2} 条</span>
        </div>
        <div className="fl-admin-table-wrap">
          <table className="fl-admin-table">
            <thead>
              <tr>
                <th><input type="checkbox" aria-label="全选" /></th>
                {columns.map(column => <th key={column}>{column}</th>)}
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.join("-")}>
                  <td><input type="checkbox" aria-label={`选择 ${row[0]}`} /></td>
                  {row.map((cell, index) => (
                    <td key={`${cell}-${index}`}>{index === row.length - 1 ? <span className={`fl-admin-status ${statusClass(cell)}`}>{cell}</span> : index === 0 ? <button className="fl-admin-record-link" type="button">{cell}</button> : cell}</td>
                  ))}
                  <td><button className="fl-admin-action-button" type="button">编辑</button><button className="fl-admin-action-button" type="button">•••</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function toggleSetValue(current: Set<string>, value: string) {
  const next = new Set(current);
  next.has(value) ? next.delete(value) : next.add(value);
  return next;
}

function AuthTemplateName({ template }: { template: AdminAuthTemplate }) {
  return (
    <div className="fl-admin-auth-name">
      <button className="fl-admin-record-link" type="button">{template.name}</button>
      <span>{template.code}</span>
    </div>
  );
}

function AdminAuthTemplatesPage({ onOpenPrd }: { onOpenPrd: (noteId: string) => void }) {
  const [templates, setTemplates] = useState<AdminAuthTemplate[]>(() => adminAuthTemplates.map(item => ({ ...item, applyTo: [...item.applyTo], resourceTypes: [...item.resourceTypes] })));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [queryDraft, setQueryDraft] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("全部状态");
  const [scopeFilter, setScopeFilter] = useState<Set<string>>(() => new Set());
  const [dialog, setDialog] = useState<AuthTemplateDialog>(null);
  const [page, setPage] = useState(1);

  const filteredTemplates = useMemo(() => {
    const activeScopes = [...scopeFilter];
    return templates.filter(template => {
      const matchesQuery = !query || [template.code, template.name, template.policyTranslation, template.dynamicTranslation].some(value => value.toLowerCase().includes(query.toLowerCase()));
      const matchesStatus = status === "全部状态" || template.status === status;
      const matchesScope = !activeScopes.length || activeScopes.some(item => template.resourceTypes.includes(item));
      return matchesQuery && matchesStatus && matchesScope;
    });
  }, [query, scopeFilter, status, templates]);

  const allVisibleSelected = filteredTemplates.length > 0 && filteredTemplates.every(template => selectedIds.has(template.id));
  const selectedTemplates = templates.filter(template => selectedIds.has(template.id));

  function resetFilters() {
    setQueryDraft("");
    setQuery("");
    setStatus("全部状态");
    setScopeFilter(new Set());
    setSelectedIds(new Set());
    setPage(1);
  }

  function updateTemplate(templateId: string, update: (template: AdminAuthTemplate) => AdminAuthTemplate) {
    setTemplates(current => current.map(template => template.id === templateId ? update(template) : template));
  }

  function saveTemplate(template: AdminAuthTemplate) {
    setTemplates(current => current.some(item => item.id === template.id) ? current.map(item => item.id === template.id ? template : item) : [template, ...current]);
    setDialog(null);
  }

  function deleteTemplate(templateId: string) {
    setTemplates(current => current.filter(template => template.id !== templateId));
    setSelectedIds(current => {
      const next = new Set(current);
      next.delete(templateId);
      return next;
    });
    setDialog(null);
  }

  function applyScope(templateIds: string[], resourceTypes: string[], applyTo: ("资源" | "展品")[]) {
    setTemplates(current => current.map(template => templateIds.includes(template.id) ? { ...template, resourceTypes, applyTo, scope: `${applyTo.includes("资源") ? `资源(${Math.max(1, resourceTypes.length * 2)}/20)` : ""}${applyTo.length === 2 ? " · " : ""}${applyTo.includes("展品") ? `展品(${Math.max(1, resourceTypes.length)}/20)` : ""}` } : template));
    setSelectedIds(new Set());
    setDialog(null);
  }

  return (
    <>
      <div className="fl-admin-page-heading">
        <div>
          <span className="fl-admin-eyebrow">运营</span>
          <h2>授权策略模板管理</h2>
          <p>维护用户端策略模板库，控制模板启停、推荐、适用范围和策略预览。</p>
        </div>
        <button className="fl-admin-button" type="button" onClick={() => setDialog({ type: "create" })}>+ 新模板</button>
      </div>

      <section className="fl-admin-panel">
        {selectedIds.size ? (
          <div className="fl-admin-selection-bar">
            <strong>已选中 {selectedIds.size} 条</strong>
            <button className="fl-admin-button" type="button" onClick={() => setDialog({ type: "scope", templateIds: [...selectedIds] })}>修改适用范围</button>
            <button className="fl-admin-link-button" type="button" onClick={() => setSelectedIds(new Set())}>取消选择</button>
          </div>
        ) : (
          <PrdWrapper noteId="prd-fl-admin-auth-template-filter" onOpen={onOpenPrd}>
            <div className="fl-admin-auth-filter">
              <div className="fl-admin-tag-filter">
                <span>适用范围：</span>
                {["图片", "插画", "音乐", "音频"].map(type => (
                  <button
                    key={type}
                    type="button"
                    className={`fl-admin-filter-chip ${scopeFilter.has(type) ? "active" : ""}`}
                    onClick={() => {
                      setScopeFilter(current => toggleSetValue(current, type));
                      setSelectedIds(new Set());
                      setPage(1);
                    }}
                  >
                    {type}
                  </button>
                ))}
                {[...scopeFilter].map(type => <span key={type} className="fl-admin-filter-token">{type}<button type="button" onClick={() => setScopeFilter(current => toggleSetValue(current, type))}>×</button></span>)}
              </div>
              <label className="fl-admin-status-filter">状态：
                <select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}>
                  <option>全部状态</option>
                  <option>已启用</option>
                  <option>已停用</option>
                </select>
              </label>
            </div>
          </PrdWrapper>
        )}

        <PrdWrapper noteId="prd-fl-admin-auth-template-search" onOpen={onOpenPrd}>
          <div className="fl-admin-user-search">
            <label className="fl-admin-search-box">
              <span>⌕</span>
              <input value={queryDraft} onChange={event => setQueryDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { setQuery(queryDraft); setPage(1); } }} placeholder="搜索编号、授权策略模板或翻译内容" />
            </label>
            <button className="fl-admin-button" type="button" onClick={() => { setQuery(queryDraft); setPage(1); }}>搜索</button>
            {(query || status !== "全部状态" || scopeFilter.size) ? <button className="fl-admin-secondary-button" type="button" onClick={resetFilters}>重置</button> : null}
          </div>
        </PrdWrapper>

        <PrdWrapper noteId="prd-fl-admin-auth-template-table" onOpen={onOpenPrd}>
          <div className="fl-admin-table-wrap">
            <table className="fl-admin-table fl-admin-auth-table">
              <thead>
                <tr>
                  <th><input type="checkbox" checked={allVisibleSelected} onChange={event => setSelectedIds(event.target.checked ? new Set(filteredTemplates.map(template => template.id)) : new Set())} aria-label="全选授权策略模板" /></th>
                  {["编号", "授权策略模板", "适用范围", "状态", "操作"].map(column => <th key={column}>{column}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.map(template => (
                  <tr key={template.id} className={selectedIds.has(template.id) ? "selected" : ""}>
                    <td><input type="checkbox" checked={selectedIds.has(template.id)} onChange={event => {
                      setSelectedIds(current => {
                        const next = new Set(current);
                        event.target.checked ? next.add(template.id) : next.delete(template.id);
                        return next;
                      });
                    }} aria-label={`选择模板 ${template.name}`} /></td>
                    <td>{template.code}</td>
                    <td><AuthTemplateName template={template} /></td>
                    <td>
                      <div className="fl-admin-auth-scope">
                        <strong>{template.scope}</strong>
                        <span>{template.resourceTypes.join(" / ")}</span>
                      </div>
                    </td>
                    <td><span className={`fl-admin-status ${statusClass(template.status)}`}>{template.status}</span></td>
                    <td>
                      <button className="fl-admin-action-button" type="button" onClick={() => updateTemplate(template.id, item => ({ ...item, status: item.status === "已启用" ? "已停用" : "已启用" }))}>{template.status === "已启用" ? "停用" : "启用"}</button>
                      <button className="fl-admin-action-button" type="button" onClick={() => updateTemplate(template.id, item => ({ ...item, recommended: !item.recommended }))}>{template.recommended ? "取消推荐" : "推荐"}</button>
                      <button className="fl-admin-action-button" type="button" onClick={() => setDialog({ type: "preview", templateId: template.id })}>预览</button>
                      <button className="fl-admin-action-button" type="button" onClick={() => setDialog({ type: "edit", templateId: template.id })}>编辑</button>
                      <button className="fl-admin-action-button danger" type="button" onClick={() => setDialog({ type: "delete", templateId: template.id })}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PrdWrapper>

        <footer className="fl-admin-pagination">
          <span>1- {Math.min(10, filteredTemplates.length || 1)} of {Math.max(38, filteredTemplates.length)}</span>
          <div className="fl-admin-page-stepper">
            <button type="button" disabled={page === 1} onClick={() => setPage(value => Math.max(1, value - 1))}>‹</button>
            <strong>{page} / 4</strong>
            <button type="button" disabled={page === 4} onClick={() => setPage(value => Math.min(4, value + 1))}>›</button>
          </div>
          <label>跳至 <input type="number" min={1} max={4} value={page} onChange={event => setPage(Math.min(4, Math.max(1, Number(event.target.value) || 1)))} className="h-8 w-12 border border-line text-center" /> 页</label>
          <button className="fl-admin-secondary-button" type="button">Go</button>
        </footer>
      </section>

      {dialog ? (
        <AuthTemplateDialogView
          dialog={dialog}
          templates={templates}
          selectedTemplates={selectedTemplates}
          onClose={() => setDialog(null)}
          onSave={saveTemplate}
          onDelete={deleteTemplate}
          onApplyScope={applyScope}
        />
      ) : null}
    </>
  );
}

function AuthTemplateDialogView({
  dialog,
  templates,
  selectedTemplates,
  onClose,
  onSave,
  onDelete,
  onApplyScope
}: {
  dialog: Exclude<AuthTemplateDialog, null>;
  templates: AdminAuthTemplate[];
  selectedTemplates: AdminAuthTemplate[];
  onClose: () => void;
  onSave: (template: AdminAuthTemplate) => void;
  onDelete: (templateId: string) => void;
  onApplyScope: (templateIds: string[], resourceTypes: string[], applyTo: ("资源" | "展品")[]) => void;
}) {
  const existing = "templateId" in dialog ? templates.find(template => template.id === dialog.templateId) : undefined;
  const baseTemplate = existing || {
    id: `auth-tpl-${Date.now()}`,
    code: `AT-${String(templates.length + 1).padStart(4, "0")}`,
    name: "",
    scope: "资源(0/20)",
    applyTo: ["资源"] as ("资源" | "展品")[],
    resourceTypes: ["图片"],
    status: "已启用" as const,
    recommended: false,
    policyCode: "for public\ninitial:\n  auth",
    policyTranslation: "",
    dynamicTranslation: "",
    updatedAt: "2026-09-14 12:00"
  };
  const [name, setName] = useState(baseTemplate.name);
  const [status, setStatus] = useState<"已启用" | "已停用">(baseTemplate.status);
  const [applyTo, setApplyTo] = useState<Set<string>>(() => new Set(baseTemplate.applyTo));
  const [resourceTypes, setResourceTypes] = useState<Set<string>>(() => new Set(baseTemplate.resourceTypes));
  const [policyCode, setPolicyCode] = useState(baseTemplate.policyCode);
  const [policyTranslation, setPolicyTranslation] = useState(baseTemplate.policyTranslation);
  const [dynamicTranslation, setDynamicTranslation] = useState(baseTemplate.dynamicTranslation);

  if (dialog.type === "preview" && existing) {
    return (
      <div className="fl-admin-modal-backdrop">
        <section className="fl-admin-modal fl-admin-auth-preview" role="dialog" aria-modal="true">
          <h3>预览 · {existing.name}</h3>
          <div className="fl-admin-code-preview">
            <span>代码</span>
            <pre>{existing.policyCode}</pre>
          </div>
          <div className="fl-admin-code-preview translated">
            <span>翻译</span>
            <p>{existing.policyTranslation}</p>
            {existing.dynamicTranslation ? <p>{existing.dynamicTranslation}</p> : null}
          </div>
          <footer><button className="fl-admin-button" type="button" onClick={onClose}>关闭</button></footer>
        </section>
      </div>
    );
  }

  if (dialog.type === "delete" && existing) {
    return (
      <div className="fl-admin-modal-backdrop">
        <section className="fl-admin-modal" role="dialog" aria-modal="true">
          <h3>删除授权策略模板</h3>
          <p>确认删除“{existing.name}”吗？删除后该模板将从当前原型列表中移除。</p>
          <footer><button className="fl-admin-secondary-button" type="button" onClick={onClose}>取消</button><button className="fl-admin-danger-button" type="button" onClick={() => onDelete(existing.id)}>删除</button></footer>
        </section>
      </div>
    );
  }

  if (dialog.type === "scope") {
    const targetTemplates = selectedTemplates.length ? selectedTemplates : templates.filter(template => dialog.templateIds.includes(template.id));
    return (
      <div className="fl-admin-modal-backdrop">
        <section className="fl-admin-modal fl-admin-auth-form-modal" role="dialog" aria-modal="true">
          <h3>修改适用范围</h3>
          <p>为已选中的 {targetTemplates.length} 条授权策略模板设置适用对象和资源类型。</p>
          <fieldset className="fl-admin-auth-fieldset">
            <legend>应用于</legend>
            {["资源", "展品"].map(item => (
              <label key={item}><input type="checkbox" checked={applyTo.has(item)} onChange={() => setApplyTo(current => toggleSetValue(current, item))} /> {item}</label>
            ))}
          </fieldset>
          <fieldset className="fl-admin-auth-fieldset resource-types">
            <legend>适用资源类型</legend>
            {adminResourceTypeOptions.map(type => (
              <label key={type}><input type="checkbox" checked={resourceTypes.has(type)} onChange={() => setResourceTypes(current => toggleSetValue(current, type))} /> {type}</label>
            ))}
          </fieldset>
          <div className="fl-admin-dialog-actions">
            <button className="fl-admin-link-button" type="button" onClick={() => setResourceTypes(new Set(adminResourceTypeOptions))}>全选</button>
            <span>|</span>
            <button className="fl-admin-link-button" type="button" onClick={() => setResourceTypes(new Set())}>全不选</button>
          </div>
          <footer>
            <button className="fl-admin-secondary-button" type="button" onClick={onClose}>取消</button>
            <button className="fl-admin-button" type="button" onClick={() => onApplyScope(dialog.templateIds, [...resourceTypes], ([...applyTo].filter(Boolean) as ("资源" | "展品")[]))}>保存</button>
          </footer>
        </section>
      </div>
    );
  }

  if (dialog.type === "create" || (dialog.type === "edit" && existing)) {
    return (
      <div className="fl-admin-modal-backdrop">
        <section className="fl-admin-modal fl-admin-auth-form-modal" role="dialog" aria-modal="true">
          <h3>{dialog.type === "create" ? "新建模板" : "编辑授权策略模板"}</h3>
          <p>授权策略模板管理 ＞ {dialog.type === "create" ? "新建模板" : existing?.name}</p>
          <div className="fl-admin-auth-form">
            <label className="fl-admin-dialog-field">是否启用
              <select value={status} onChange={event => setStatus(event.target.value as "已启用" | "已停用")}>
                <option value="已启用">启用</option>
                <option value="已停用">停用</option>
              </select>
              <small>{status === "已启用" ? "在用户端策略模板库中显示，用户在创建授权策略时可使用此模板" : "在用户端策略模板库中隐藏"}</small>
            </label>
            <label className="fl-admin-dialog-field">名称<input value={name} onChange={event => setName(event.target.value)} placeholder="请输入授权策略模板名称" /></label>
            <label className="fl-admin-dialog-field">策略代码<textarea value={policyCode} onChange={event => setPolicyCode(event.target.value)} rows={7} /></label>
            <label className="fl-admin-dialog-field">策略翻译 (zh-CN)<textarea value={policyTranslation} onChange={event => setPolicyTranslation(event.target.value)} rows={3} /></label>
            <label className="fl-admin-dialog-field">动态记录翻译 (zh-CN)【选填】<textarea value={dynamicTranslation} onChange={event => setDynamicTranslation(event.target.value)} rows={2} /></label>
          </div>
          <fieldset className="fl-admin-auth-fieldset">
            <legend>应用于</legend>
            {["资源", "展品"].map(item => <label key={item}><input type="checkbox" checked={applyTo.has(item)} onChange={() => setApplyTo(current => toggleSetValue(current, item))} /> {item}</label>)}
          </fieldset>
          <fieldset className="fl-admin-auth-fieldset resource-types">
            <legend>适用资源类型</legend>
            {adminResourceTypeOptions.map(type => <label key={type}><input type="checkbox" checked={resourceTypes.has(type)} onChange={() => setResourceTypes(current => toggleSetValue(current, type))} /> {type}</label>)}
          </fieldset>
          <div className="fl-admin-dialog-actions">
            <button className="fl-admin-link-button" type="button" onClick={() => setResourceTypes(new Set(adminResourceTypeOptions))}>全选</button>
            <span>|</span>
            <button className="fl-admin-link-button" type="button" onClick={() => setResourceTypes(new Set())}>全不选</button>
          </div>
          <footer>
            <button className="fl-admin-secondary-button" type="button" onClick={onClose}>取消</button>
            <button className="fl-admin-button" type="button" onClick={() => {
              const nextApplyTo = ([...applyTo].filter(Boolean) as ("资源" | "展品")[]);
              const nextTypes = [...resourceTypes];
              onSave({
                ...baseTemplate,
                name: name || "未命名模板",
                status,
                applyTo: nextApplyTo.length ? nextApplyTo : ["资源"],
                resourceTypes: nextTypes.length ? nextTypes : ["图片"],
                scope: `${nextApplyTo.includes("资源") ? `资源(${Math.max(1, nextTypes.length * 2)}/20)` : ""}${nextApplyTo.length === 2 ? " · " : ""}${nextApplyTo.includes("展品") ? `展品(${Math.max(1, nextTypes.length)}/20)` : ""}`,
                policyCode,
                policyTranslation,
                dynamicTranslation,
                updatedAt: "2026-09-14 12:00"
              });
            }}>保存</button>
          </footer>
        </section>
      </div>
    );
  }

  return null;
}

function ContactList({ contacts }: { contacts: string[] }) {
  return (
    <div className="fl-admin-contact-list">
      {contacts.map(contact => (
        <span key={contact}>{contact}<button className="fl-admin-link-button" type="button" onClick={() => navigator.clipboard?.writeText(contact)}>复制</button></span>
      ))}
    </div>
  );
}

function UserTags({ user, onRemoveTag, onAddTags }: { user: AdminUser; onRemoveTag: (tag: string) => void; onAddTags: () => void }) {
  return (
    <div className="fl-admin-user-name">
      <button className="fl-admin-record-link" type="button">{user.name}</button>
      <div className="fl-admin-user-tags">
        {user.tags.map(tag => <span key={tag}>{tag}<button type="button" aria-label={`移除${tag}标签`} onClick={() => onRemoveTag(tag)}>×</button></span>)}
        <button className="fl-admin-link-button" type="button" onClick={onAddTags}>+标签</button>
      </div>
    </div>
  );
}

function AdminUsersPage({ onOpenPrd }: { onOpenPrd: (noteId: string) => void }) {
  const [users, setUsers] = useState<AdminUser[]>(() => adminUsers.map(user => ({ ...user, tags: [...user.tags], contacts: [...user.contacts] })));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [queryDraft, setQueryDraft] = useState("");
  const [query, setQuery] = useState("");
  const [tagFilters, setTagFilters] = useState<Set<string>>(() => new Set());
  const [sort, setSort] = useState("recent");
  const [dateActive, setDateActive] = useState(false);
  const [dateStart, setDateStart] = useState("2020-10-23");
  const [dateEnd, setDateEnd] = useState("2020-11-21");
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<AdminDialog>(null);

  const filteredUsers = useMemo(() => {
    const activeTags = [...tagFilters];
    const rows = users.filter(user => {
      const matchesQuery = !query || [user.name, ...user.contacts].some(value => value.toLowerCase().includes(query.toLowerCase()));
      const matchesTags = !activeTags.length || activeTags.every(tag => user.tags.includes(tag));
      const matchesDate = !dateActive || (user.registeredAt >= dateStart && user.registeredAt <= dateEnd);
      return matchesQuery && matchesTags && matchesDate;
    });
    const sortKey = ({ resources: "resources", exhibits: "nodes", contracts: "contracts" } as const)[sort as "resources" | "exhibits" | "contracts"];
    return sortKey ? [...rows].sort((a, b) => b[sortKey] - a[sortKey]) : rows;
  }, [dateActive, dateEnd, dateStart, query, sort, tagFilters, users]);

  const selectedUsers = users.filter(user => selectedIds.has(user.id));
  const allVisibleSelected = filteredUsers.length > 0 && filteredUsers.every(user => selectedIds.has(user.id));
  const dateLabel = `${dateStart.split("-").join("/")} - ${dateEnd.split("-").join("/")}`;

  function resetFilters() {
    setQueryDraft("");
    setQuery("");
    setTagFilters(new Set());
    setDateActive(false);
    setSort("recent");
    setPage(1);
    setSelectedIds(new Set());
  }

  function updateUser(userId: string, update: (user: AdminUser) => AdminUser) {
    setUsers(current => current.map(user => (user.id === userId ? update(user) : user)));
  }

  return (
    <>
      <div className="fl-admin-page-heading">
        <div>
          <span className="fl-admin-eyebrow">用户中心</span>
          <h2>用户管理</h2>
          <p>查询用户资料并处理标签、审核和账号状态。</p>
        </div>
      </div>

      <section className="fl-admin-panel">
        {selectedIds.size ? (
          <div className="fl-admin-selection-bar">
            <strong>已选择 {selectedIds.size} 个用户</strong>
            <button className="fl-admin-button" type="button" onClick={() => setDialog({ type: "tags", userIds: [...selectedIds] })}>添加标签</button>
            <button className="fl-admin-link-button" type="button" onClick={() => setSelectedIds(new Set())}>取消选择</button>
          </div>
        ) : (
          <PrdWrapper noteId="prd-fl-admin-user-filter" onOpen={onOpenPrd}>
            <div className="fl-admin-user-filter">
              <div className="fl-admin-tag-filter">
                <span>标签：</span>
                {["消费者", "节点商", "小说", "测试"].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`fl-admin-filter-chip ${tagFilters.has(tag) ? "active" : ""}`}
                    onClick={() => {
                      setTagFilters(current => {
                        const next = new Set(current);
                        next.has(tag) ? next.delete(tag) : next.add(tag);
                        return next;
                      });
                      setSelectedIds(new Set());
                      setPage(1);
                    }}
                  >
                    {tag}
                  </button>
                ))}
                <button className="fl-admin-link-button" type="button">⚙ 管理标签</button>
              </div>
              <div className="fl-admin-date-filter">
                <span>注册时间：</span>
                <button className={`fl-admin-date-button ${dateActive ? "active" : ""}`} type="button" onClick={() => setDialog({ type: "date" })}>{dateLabel} ▾</button>
              </div>
            </div>
          </PrdWrapper>
        )}

        <PrdWrapper noteId="prd-fl-admin-user-search" onOpen={onOpenPrd}>
          <div className="fl-admin-user-search">
            <label className="fl-admin-search-box">
              <span>⌕</span>
              <input value={queryDraft} onChange={event => setQueryDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { setQuery(queryDraft); setPage(1); } }} placeholder="请输入用户名、注册邮箱/手机号进行搜索" />
            </label>
            <button className="fl-admin-button" type="button" onClick={() => { setQuery(queryDraft); setPage(1); }}>搜索</button>
            {(query || tagFilters.size || dateActive) ? <button className="fl-admin-secondary-button" type="button" onClick={resetFilters}>重置</button> : null}
            <label className="fl-admin-sort">
              排序：
              <select value={sort} onChange={event => { setSort(event.target.value); setPage(1); }}>
                <option value="recent">最近注册</option>
                <option value="resources">资源发布最多</option>
                <option value="exhibits">展品发布最多</option>
                <option value="contracts">消费合约最多</option>
              </select>
            </label>
          </div>
        </PrdWrapper>

        <PrdWrapper noteId="prd-fl-admin-user-table" onOpen={onOpenPrd}>
          <div className="fl-admin-table-wrap">
            <table className="fl-admin-table">
              <thead>
                <tr>
                  <th><input type="checkbox" checked={allVisibleSelected} onChange={event => setSelectedIds(event.target.checked ? new Set(filteredUsers.map(user => user.id)) : new Set())} aria-label="全选用户" /></th>
                  {["用户", "最近登录", "发布资源数", "运营节点数", "消费合约数", "交易次数", "代币余额", "注册手机号/邮箱", "注册时间", "账号状态", "操作"].map(column => <th key={column}>{column}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className={selectedIds.has(user.id) ? "selected" : ""}>
                    <td><input type="checkbox" checked={selectedIds.has(user.id)} onChange={event => {
                      setSelectedIds(current => {
                        const next = new Set(current);
                        event.target.checked ? next.add(user.id) : next.delete(user.id);
                        return next;
                      });
                    }} aria-label={`选择用户 ${user.name}`} /></td>
                    <td><UserTags user={user} onAddTags={() => setDialog({ type: "tags", userIds: [user.id] })} onRemoveTag={tag => updateUser(user.id, item => ({ ...item, tags: item.tags.filter(value => value !== tag) }))} /></td>
                    <td>{user.lastLogin}</td>
                    <td>{user.resources}</td>
                    <td>{user.nodes}</td>
                    <td>{user.contracts}</td>
                    <td>{user.trades}</td>
                    <td>{user.balance.toLocaleString("zh-CN")}</td>
                    <td><ContactList contacts={user.contacts} /></td>
                    <td>{user.registeredAt}</td>
                    <td><span className={`fl-admin-status ${statusClass(user.status)}`}>{user.status}</span></td>
                    <td>
                      {user.status === "冻结" ? (
                        <>
                          <button className="fl-admin-action-button" type="button" onClick={() => setDialog({ type: "detail", userId: user.id })}>详情</button>
                          <button className="fl-admin-action-button" type="button" onClick={() => setDialog({ type: "restore", userId: user.id })}>恢复</button>
                        </>
                      ) : user.status === "待审核" ? (
                        <button className="fl-admin-action-button" type="button" onClick={() => setDialog({ type: "review", userId: user.id })}>审核</button>
                      ) : (
                        <button className="fl-admin-action-button" type="button" onClick={() => setDialog({ type: "freeze", userId: user.id })}>冻结</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PrdWrapper>

        <footer className="fl-admin-pagination">
          <span>{page === 1 ? 1 : (page - 1) * 10 + 1}- {page === 4 ? 38 : page * 10} of 38</span>
          <div className="fl-admin-page-stepper">
            <button type="button" disabled={page === 1} onClick={() => setPage(value => Math.max(1, value - 1))}>‹</button>
            <strong>{page} / 4</strong>
            <button type="button" disabled={page === 4} onClick={() => setPage(value => Math.min(4, value + 1))}>›</button>
          </div>
          <label>跳至 <input type="number" min={1} max={4} value={page} onChange={event => setPage(Math.min(4, Math.max(1, Number(event.target.value) || 1)))} className="h-8 w-12 border border-line text-center" /> 页</label>
        </footer>
      </section>

      {dialog ? (
        <AdminUserDialog
          dialog={dialog}
          users={users}
          selectedUsers={selectedUsers}
          dateStart={dateStart}
          dateEnd={dateEnd}
          setDateStart={setDateStart}
          setDateEnd={setDateEnd}
          onClose={() => setDialog(null)}
          onClearDate={() => { setDateActive(false); setDialog(null); }}
          onApplyDate={() => { setDateActive(true); setPage(1); setDialog(null); }}
          onUpdateUser={updateUser}
          onAddTags={(userIds, tags) => {
            setUsers(current => current.map(user => userIds.includes(user.id) ? { ...user, tags: [...new Set([...user.tags, ...tags])] } : user));
            setSelectedIds(new Set());
            setDialog(null);
          }}
        />
      ) : null}
    </>
  );
}

function AdminUserDialog({
  dialog,
  users,
  selectedUsers,
  dateStart,
  dateEnd,
  setDateStart,
  setDateEnd,
  onClose,
  onClearDate,
  onApplyDate,
  onUpdateUser,
  onAddTags
}: {
  dialog: Exclude<AdminDialog, null>;
  users: AdminUser[];
  selectedUsers: AdminUser[];
  dateStart: string;
  dateEnd: string;
  setDateStart: (value: string) => void;
  setDateEnd: (value: string) => void;
  onClose: () => void;
  onClearDate: () => void;
  onApplyDate: () => void;
  onUpdateUser: (userId: string, update: (user: AdminUser) => AdminUser) => void;
  onAddTags: (userIds: string[], tags: string[]) => void;
}) {
  const user = "userId" in dialog ? users.find(item => item.id === dialog.userId) : undefined;
  const [checkedTags, setCheckedTags] = useState<Set<string>>(() => new Set(dialog.type === "tags" ? users.filter(item => dialog.userIds.includes(item.id)).flatMap(item => item.tags) : []));
  const [freezeReason, setFreezeReason] = useState(freezeReasons[0]);
  const [freezeNote, setFreezeNote] = useState("");
  const [reviewResult, setReviewResult] = useState<"正常" | "冻结">("正常");

  if (dialog.type === "tags") {
    const targetUsers = users.filter(item => dialog.userIds.includes(item.id));
    return (
      <div className="fl-admin-modal-backdrop">
        <section className="fl-admin-modal" role="dialog" aria-modal="true">
          <h3>添加标签</h3>
          <p>为{targetUsers.length > 1 ? `已选择的 ${selectedUsers.length} 个用户` : `用户 ${targetUsers[0]?.name || ""}`}添加标签。</p>
          <div className="fl-admin-choice-list">
            {tagOptions.map(tag => (
              <label key={tag} className="fl-admin-secondary-button">
                <input type="checkbox" checked={checkedTags.has(tag)} onChange={event => {
                  setCheckedTags(current => {
                    const next = new Set(current);
                    event.target.checked ? next.add(tag) : next.delete(tag);
                    return next;
                  });
                }} /> {tag}
              </label>
            ))}
          </div>
          <footer><button className="fl-admin-secondary-button" type="button" onClick={onClose}>取消</button><button className="fl-admin-button" type="button" onClick={() => onAddTags(dialog.userIds, [...checkedTags])}>确认</button></footer>
        </section>
      </div>
    );
  }

  if (dialog.type === "date") {
    return (
      <div className="fl-admin-modal-backdrop">
        <section className="fl-admin-modal" role="dialog" aria-modal="true">
          <h3>设置注册时间</h3>
          <p>选择用户注册日期范围。</p>
          <label className="fl-admin-dialog-field">开始日期<input type="date" value={dateStart} onChange={event => setDateStart(event.target.value)} /></label>
          <label className="fl-admin-dialog-field">结束日期<input type="date" value={dateEnd} onChange={event => setDateEnd(event.target.value)} /></label>
          <button className="fl-admin-link-button" type="button" onClick={onClearDate}>清除日期筛选</button>
          <footer><button className="fl-admin-secondary-button" type="button" onClick={onClose}>取消</button><button className="fl-admin-button" type="button" onClick={onApplyDate}>应用</button></footer>
        </section>
      </div>
    );
  }

  if (!user) return null;

  if (dialog.type === "freeze") {
    return (
      <div className="fl-admin-modal-backdrop">
        <section className="fl-admin-modal" role="dialog" aria-modal="true">
          <h3>冻结账户</h3>
          <p>冻结后，{user.name} 将无法继续使用该账号。</p>
          <fieldset className="fl-admin-reason-list">
            <legend>冻结原因</legend>
            {freezeReasons.map(reason => <label key={reason}><input type="radio" name="freeze-reason" checked={freezeReason === reason} onChange={() => setFreezeReason(reason)} /> {reason}</label>)}
          </fieldset>
          <label className="fl-admin-dialog-field">备注<textarea value={freezeNote} onChange={event => setFreezeNote(event.target.value)} rows={3} placeholder="添加备注（选填）" /></label>
          <footer>
            <button className="fl-admin-secondary-button" type="button" onClick={onClose}>取消</button>
            <button className="fl-admin-danger-button" type="button" onClick={() => { onUpdateUser(user.id, item => ({ ...item, status: "冻结", freezeReason: freezeNote ? `${freezeReason}：${freezeNote}` : freezeReason })); onClose(); }}>冻结</button>
          </footer>
        </section>
      </div>
    );
  }

  if (dialog.type === "restore") {
    return (
      <div className="fl-admin-modal-backdrop">
        <section className="fl-admin-modal" role="dialog" aria-modal="true">
          <h3>恢复账户</h3>
          <p>确认要恢复该账号的使用吗？</p>
          <strong>{user.name}</strong>
          <footer><button className="fl-admin-secondary-button" type="button" onClick={onClose}>取消</button><button className="fl-admin-button" type="button" onClick={() => { onUpdateUser(user.id, item => ({ ...item, status: "正常", freezeReason: "" })); onClose(); }}>恢复</button></footer>
        </section>
      </div>
    );
  }

  if (dialog.type === "review") {
    return (
      <div className="fl-admin-modal-backdrop">
        <section className="fl-admin-modal" role="dialog" aria-modal="true">
          <h3>审核用户</h3>
          <p>请选择 {user.name} 的审核结果。</p>
          <div className="fl-admin-choice-list">
            <label className="fl-admin-secondary-button"><input type="radio" checked={reviewResult === "正常"} onChange={() => setReviewResult("正常")} /> 通过审核</label>
            <label className="fl-admin-secondary-button"><input type="radio" checked={reviewResult === "冻结"} onChange={() => setReviewResult("冻结")} /> 拒绝申请</label>
          </div>
          <footer><button className="fl-admin-secondary-button" type="button" onClick={onClose}>取消</button><button className="fl-admin-button" type="button" onClick={() => { onUpdateUser(user.id, item => ({ ...item, status: reviewResult, freezeReason: reviewResult === "冻结" ? "审核未通过" : "" })); onClose(); }}>确认审核</button></footer>
        </section>
      </div>
    );
  }

  return (
    <div className="fl-admin-modal-backdrop">
      <section className="fl-admin-modal" role="dialog" aria-modal="true">
        <h3>{user.status === "冻结" ? "冻结原因" : "用户详情"}</h3>
        <p>{user.status === "冻结" ? user.freezeReason || "未填写原因" : `${user.name} · ${user.contacts.join(" · ")}`}</p>
        <footer><button className="fl-admin-button" type="button" onClick={onClose}>知道了</button></footer>
      </section>
    </div>
  );
}

export function AdminPrototypePage({ initialPageId = "admin-users", onNavigate, onOpenPrd }: { initialPageId?: string; onNavigate?: (pageId: string) => void; onOpenPrd: (noteId: string) => void }) {
  const [localPageId, setLocalPageId] = useState(initialPageId);
  const activePageId = initialPageId || localPageId;
  const meta = findAdminPage(activePageId);

  function navigate(pageId: string) {
    setLocalPageId(pageId);
    onNavigate?.(pageId);
  }

  return (
    <div className="fl-admin-prototype">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-dark">Freelog Admin Prototype</p>
          <h2 className="text-2xl font-bold">产品管理后台交互原型</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">后台原型已作为 Prototype-as-PRD 框架中的业务交付页面维护，框架负责页面树、PRD 标注、迭代版本、分享和全屏预览。</p>
        </div>
      </div>

      <PrdWrapper noteId="prd-fl-admin-embedded-shell" onOpen={onOpenPrd}>
        <div className="fl-admin-frame">
          <aside className="fl-admin-sidebar">
            <div className="fl-admin-brand"><span className="fl-admin-brand-mark">F</span><span>Freelog <b>Admin</b></span></div>
            <nav aria-label="Freelog 后台导航">
              {adminNavGroups.map(group => (
                <section className="fl-admin-nav-group" key={group.label}>
                  <button className="fl-admin-nav-title" type="button"><span className="fl-admin-nav-icon">{group.icon}</span><span>{group.label}</span><span>⌄</span></button>
                  <div className="fl-admin-nav-pages">
                    {group.pages.map(page => <button key={page.id} className={`fl-admin-nav-link ${page.id === activePageId ? "active" : ""}`} type="button" onClick={() => navigate(page.id)}>{page.label}</button>)}
                  </div>
                </section>
              ))}
            </nav>
          </aside>
          <section className="fl-admin-workspace">
            <header className="fl-admin-topbar">
              <div className="fl-admin-breadcrumb"><span>{meta.group}</span><span>/</span><strong>{meta.label}</strong></div>
              <div className="flex items-center gap-2 text-sm text-muted"><span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-xs font-bold text-white">AD</span><strong>Admin</strong></div>
            </header>
            <main className="fl-admin-content">
              {activePageId === "admin-dashboard" ? <AdminDashboard onOpenPrd={onOpenPrd} /> : activePageId === "admin-users" ? <AdminUsersPage onOpenPrd={onOpenPrd} /> : activePageId === "admin-auth-templates" ? <AdminAuthTemplatesPage onOpenPrd={onOpenPrd} /> : <AdminGenericList pageId={activePageId} />}
            </main>
          </section>
        </div>
      </PrdWrapper>
    </div>
  );
}
