import { useEffect, useMemo, useRef, useState } from "react";
import {
  Database,
  FileText,
  Languages,
  LayoutDashboard,
  Megaphone,
  Network,
  ReceiptText,
  ShieldCheck,
  Users,
  type LucideIcon
} from "lucide-react";
import {
  adminAuthTemplates,
  adminDashboardStats,
  adminGenericColumns,
  adminGenericRows,
  adminNavGroups,
  adminRecentTasks,
  adminReviewPolicies,
  adminReviewRules,
  adminUsers,
  findAdminPage,
  type AdminAuthTemplate,
  type AdminReviewPolicy,
  type AdminReviewRule,
  type AdminUser
} from "../../mockData/adminPrototype";
import { PrdWrapper } from "../../components/prd/PrdWrapper";
import { TreeMultiSelect, expandTreeSelection, type TreeMultiSelectNode } from "../../components/admin/TreeMultiSelect";
import { EditPageActions } from "../../components/admin/EditPageActions";
import { FormErrorBanner } from "../../components/admin/FormErrorBanner";
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
  | { type: "preview"; templateId: string }
  | { type: "scope"; templateIds: string[] }
  | { type: "delete"; templateId: string }
  | null;

const tagOptions = ["小说", "测试", "节点商", "资源作者", "消费者"];
const freezeReasons = ["抄袭、侵权", "垃圾广告", "色情、暴力", "不实信息", "欺诈", "恶意操作"];

const resourceTypeTree: TreeMultiSelectNode[] = [
  { id: "图片", label: "图片", children: [{ id: "插画", label: "插画" }, { id: "照片", label: "照片" }] },
  { id: "音频", label: "音频", children: [{ id: "音乐", label: "音乐" }, { id: "音效", label: "音效" }, { id: "音乐专辑", label: "音乐专辑" }, { id: "连载博客", label: "连载博客" }] },
  { id: "视频", label: "视频", children: [{ id: "长视频", label: "长视频" }, { id: "短视频", label: "短视频" }] },
  { id: "阅读", label: "阅读", children: ["文章", "条漫", "页漫", "日漫", "专栏", "连载小说", "连载漫画"].map(id => ({ id, label: id })) },
  { id: "主题", label: "主题" },
  { id: "插件", label: "插件" },
  { id: "游戏", label: "游戏" }
];

type TargetType = "资源" | "资源合集" | "展品" | "展品合集";
const targetTypeOptions: TargetType[] = ["资源", "资源合集", "展品", "展品合集"];
const baseWorkTypeGroups: TreeMultiSelectNode[] = [
  { id: "图片", label: "图片", children: [{ id: "插画", label: "插画" }, { id: "照片", label: "照片" }] },
  { id: "音频", label: "音频", children: [{ id: "音乐", label: "音乐" }, { id: "音效", label: "音效" }] },
  { id: "视频", label: "视频", children: [{ id: "长视频", label: "长视频" }, { id: "短视频", label: "短视频" }] },
  { id: "阅读", label: "阅读", children: ["文章", "条漫", "页漫", "日漫"].map(id => ({ id, label: id })) },
  { id: "主题", label: "主题" },
  { id: "插件", label: "插件" },
  { id: "游戏", label: "游戏" }
];
const collectionWorkTypeGroups: TreeMultiSelectNode[] = [
  { id: "音频", label: "音频", children: [{ id: "音乐专辑", label: "音乐专辑" }, { id: "连载博客", label: "连载博客" }] },
  { id: "阅读", label: "阅读", children: ["专栏", "连载小说", "连载漫画"].map(id => ({ id, label: id })) }
];
function workTypeGroupsFor(targets: Set<string>) {
  const groups = new Map<string, TreeMultiSelectNode>();
  targetTypeOptions.filter(target => targets.has(target)).forEach(target => {
    (target.endsWith("合集") ? collectionWorkTypeGroups : baseWorkTypeGroups).forEach(group => {
      const existing = groups.get(group.id);
      if (!existing) groups.set(group.id, { ...group, children: group.children ? [...group.children] : undefined });
      else groups.set(group.id, { ...existing, children: [...(existing.children ?? []), ...(group.children ?? [])].filter((child, index, list) => list.findIndex(item => item.id === child.id) === index) });
    });
  });
  return [...groups.values()];
}
function workTypeIds(groups: TreeMultiSelectNode[]) { return groups.flatMap(group => [group.id, ...(group.children?.map(child => child.id) ?? [])]); }
function getScopeLabel(targets: TargetType[], types: string[]) { return targets.length ? `${targets.join("、")} · ${types.length ? types.join(" / ") : "未选择作品类型"}` : "未选择标的物类型"; }

const adminNavIconMap: Record<string, LucideIcon> = {
  概览: LayoutDashboard,
  用户: Users,
  资源: Database,
  节点: Network,
  合约: FileText,
  交易: ReceiptText,
  运营: Megaphone,
  安全与合规: ShieldCheck,
  国际化: Languages
};

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

function AdminReviewPolicyDialog({ policy, onClose, onSave }: { policy: AdminReviewPolicy; onClose: () => void; onSave: (policy: AdminReviewPolicy) => void }) {
  const [draft, setDraft] = useState(policy);
  const update = <K extends keyof AdminReviewPolicy>(key: K, value: AdminReviewPolicy[K]) => setDraft(current => ({ ...current, [key]: value }));
  return (
    <div className="fl-admin-modal-backdrop">
      <section className="fl-admin-modal fl-admin-review-policy-modal" role="dialog" aria-modal="true">
        <h3>{policy.name ? "编辑审核策略" : "新建审核策略"}</h3>
        <label className="fl-admin-dialog-field">名称<input value={draft.name} onChange={event => update("name", event.target.value)} placeholder="请输入审核策略名称" /></label>
        <label className="fl-admin-dialog-field">触发场景<select value={draft.trigger} onChange={event => update("trigger", event.target.value as AdminReviewPolicy["trigger"])}><option>发布前</option><option>发布后</option><option>实时</option></select></label>
        <label className="fl-admin-dialog-field">作用对象<select value={draft.object} onChange={event => update("object", event.target.value as AdminReviewPolicy["object"])}><option>资源版本</option><option>资源信息</option><option>用户信息</option><option>节点信息</option></select></label>
        <label className="fl-admin-dialog-field">内容类型<select value={draft.contentType} onChange={event => update("contentType", event.target.value as AdminReviewPolicy["contentType"])}><option>复合</option><option>文本</option><option>图片</option><option>音频</option><option>视频</option></select></label>
        <label className="fl-admin-dialog-field">描述<span className="fl-admin-field-hint">（选填）</span><textarea value={draft.description} onChange={event => update("description", event.target.value)} rows={4} /></label>
        <label className="fl-admin-review-enabled"><input type="checkbox" checked={draft.status === "已启用"} onChange={event => update("status", event.target.checked ? "已启用" : "未启用")} /> 启用规则</label>
        <footer><button className="fl-admin-secondary-button" type="button" onClick={onClose}>取消</button><button className="fl-admin-button" type="button" onClick={() => onSave({ ...draft, name: draft.name || "未命名审核策略", updatedAt: "2026-09-21 16:00:00" })}>保存</button></footer>
      </section>
    </div>
  );
}

function AdminReviewRuleDialog({ rule, onClose, onSave }: { rule: AdminReviewRule; onClose: () => void; onSave: (rule: AdminReviewRule) => void }) {
  const [draft, setDraft] = useState(rule);
  const update = <K extends keyof AdminReviewRule>(key: K, value: AdminReviewRule[K]) => setDraft(current => ({ ...current, [key]: value }));
  return <div className="fl-admin-modal-backdrop"><section className="fl-admin-modal fl-admin-review-policy-modal" role="dialog" aria-modal="true"><h3>{rule.name ? "编辑管理规则" : "新建管理规则"}</h3><label className="fl-admin-dialog-field">规则名称<input value={draft.name} onChange={event => update("name", event.target.value)} placeholder="请输入规则名称" /></label><label className="fl-admin-dialog-field">规则类型<select value={draft.type} onChange={event => update("type", event.target.value as AdminReviewRule["type"])}><option>关键词</option><option>正则表达式</option><option>模型识别</option></select></label><label className="fl-admin-dialog-field">适用对象<select value={draft.object} onChange={event => update("object", event.target.value as AdminReviewRule["object"])}><option>资源版本</option><option>资源信息</option><option>用户信息</option><option>节点信息</option></select></label><label className="fl-admin-review-enabled"><input type="checkbox" checked={draft.status === "已启用"} onChange={event => update("status", event.target.checked ? "已启用" : "未启用")} /> 启用规则</label><footer><button className="fl-admin-secondary-button" type="button" onClick={onClose}>取消</button><button className="fl-admin-button" type="button" onClick={() => onSave({ ...draft, name: draft.name || "未命名规则", updatedAt: "2026-09-23 16:00:00" })}>保存</button></footer></section></div>;
}

function AdminReviewRulesPage({ policy, rules, onBack, onSaveRule }: { policy: AdminReviewPolicy; rules: AdminReviewRule[]; onBack: () => void; onSaveRule: (rule: AdminReviewRule) => void }) {
  const [ruleDialog, setRuleDialog] = useState<AdminReviewRule | null>(null);
  const blankRule: AdminReviewRule = { id: `RR-${String(rules.length + 1).padStart(4, "0")}`, policyId: policy.id, name: "", type: "关键词", object: policy.object, status: "已启用", updatedAt: "" };
  return <>
    <div className="fl-admin-page-heading"><div><button className="fl-admin-back-link" type="button" onClick={onBack}>‹ 返回策略列表</button><span className="fl-admin-eyebrow">内容审核策略 · 管理规则</span><h2>{policy.name}</h2><p className="fl-admin-page-subtitle">管理此内容审核策略包含的规则。</p></div><button className="fl-admin-button" type="button" onClick={() => setRuleDialog(blankRule)}>+ 新建规则</button></div>
    <section className="fl-admin-panel">
      <div className="fl-admin-rule-context"><strong>策略信息</strong><span>{policy.id} · {policy.object} · {policy.trigger} · {policy.contentType}</span></div>
      <div className="fl-admin-table-wrap"><table className="fl-admin-table fl-admin-review-rules"><thead><tr><th>序号</th><th>规则名称</th><th>规则类型</th><th>适用对象</th><th>状态</th><th>操作</th><th>最近更新</th></tr></thead><tbody>{rules.length ? rules.map((rule, index) => <tr key={rule.id}><td>{index + 1}</td><td>{rule.name || "未命名规则"}</td><td>{rule.type}</td><td>{rule.object}</td><td><span className={`fl-admin-status ${rule.status === "已启用" ? "success" : "danger"}`}>{rule.status}</span></td><td><button className="fl-admin-action-button" type="button" onClick={() => onSaveRule({ ...rule, status: rule.status === "已启用" ? "未启用" : "已启用" })}>{rule.status === "已启用" ? "停用" : "启用"}</button><button className="fl-admin-action-button" type="button" onClick={() => setRuleDialog(rule)}>编辑规则</button></td><td>{rule.updatedAt}</td></tr>) : <tr><td colSpan={7} className="fl-admin-empty-cell">暂无规则，请先新建规则</td></tr>}</tbody></table></div>
    </section>
    {ruleDialog ? <AdminReviewRuleDialog rule={ruleDialog} onClose={() => setRuleDialog(null)} onSave={rule => { onSaveRule(rule); setRuleDialog(null); }} /> : null}
  </>;
}

function AdminReviewPoliciesPage({ onOpenPrd }: { onOpenPrd: (noteId: string) => void }) {
  const [policies, setPolicies] = useState<AdminReviewPolicy[]>(() => adminReviewPolicies.map(item => ({ ...item })));
  const [rules, setRules] = useState<AdminReviewRule[]>(() => adminReviewRules.map(item => ({ ...item })));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("所有");
  const [object, setObject] = useState("所有");
  const [dialog, setDialog] = useState<AdminReviewPolicy | null>(null);
  const [rulesPolicyId, setRulesPolicyId] = useState<string | null>(null);
  const filtered = useMemo(() => policies.filter(policy => {
    const matchesQuery = !query || `${policy.id} ${policy.name}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === "所有" || policy.status === status) && (object === "所有" || policy.object === object);
  }), [object, policies, query, status]);
  const allSelected = filtered.length > 0 && filtered.every(policy => selectedIds.has(policy.id));
  function toggleStatus(ids: string[], nextStatus: AdminReviewPolicy["status"]) { setPolicies(current => current.map(policy => ids.includes(policy.id) ? { ...policy, status: nextStatus } : policy)); setSelectedIds(new Set()); }
  function savePolicy(policy: AdminReviewPolicy) { setPolicies(current => current.some(item => item.id === policy.id) ? current.map(item => item.id === policy.id ? policy : item) : [policy, ...current]); setDialog(null); }
  function saveRule(rule: AdminReviewRule) { setRules(current => current.some(item => item.id === rule.id) ? current.map(item => item.id === rule.id ? rule : item) : [rule, ...current]); setRuleDialog(null); }
  const blankPolicy: AdminReviewPolicy = { id: `RP-${String(policies.length + 1).padStart(4, "0")}`, name: "", object: "资源版本", status: "已启用", updatedAt: "", trigger: "发布前", contentType: "复合", description: "" };
  const rulesPolicy = rulesPolicyId ? policies.find(policy => policy.id === rulesPolicyId) : null;
  if (rulesPolicy) return <AdminReviewRulesPage policy={rulesPolicy} rules={rules.filter(rule => rule.policyId === rulesPolicy.id)} onBack={() => setRulesPolicyId(null)} onSaveRule={saveRule} />;
  return <>
    <div className="fl-admin-page-heading"><div><span className="fl-admin-eyebrow">安全与合规</span><h2>内容审核策略管理</h2></div><button className="fl-admin-button" type="button" onClick={() => setDialog(blankPolicy)}>+ 新建审核策略</button></div>
    <section className="fl-admin-panel">
      <PrdWrapper noteId="prd-fl-admin-review-policy-filter" onOpen={onOpenPrd}>
        {selectedIds.size ? <div className="fl-admin-selection-bar"><strong>已选 {selectedIds.size} 条</strong><button className="fl-admin-button" type="button" onClick={() => toggleStatus([...selectedIds], "未启用")}>停用</button><button className="fl-admin-secondary-button" type="button" onClick={() => toggleStatus([...selectedIds], "已启用")}>启用</button><button className="fl-admin-secondary-button" type="button" onClick={() => setSelectedIds(new Set())}>取消选择</button></div> : <div className="fl-admin-review-filter"><label className="fl-admin-search-box compact"><span>⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索审核策略" /></label><label className="fl-admin-status-filter">状态<select value={status} onChange={event => setStatus(event.target.value)}><option>所有</option><option>已启用</option><option>未启用</option></select></label><label className="fl-admin-status-filter">作用对象<select value={object} onChange={event => setObject(event.target.value)}><option>所有</option><option>资源版本</option><option>资源信息</option><option>用户信息</option><option>节点信息</option></select></label><button className="fl-admin-secondary-button" type="button" onClick={() => { setQuery(""); setStatus("所有"); setObject("所有"); }}>重置</button></div>}
      </PrdWrapper>
      <PrdWrapper noteId="prd-fl-admin-review-policy-table" onOpen={onOpenPrd}><div className="fl-admin-table-wrap"><table className="fl-admin-table fl-admin-review-table"><thead><tr><th><input type="checkbox" checked={allSelected} onChange={event => setSelectedIds(event.target.checked ? new Set(filtered.map(policy => policy.id)) : new Set())} aria-label="全选审核策略" /></th><th>ID</th><th>审核策略</th><th>状态</th><th>操作</th><th>最近更新</th></tr></thead><tbody>{filtered.map(policy => <tr key={policy.id}><td><input type="checkbox" checked={selectedIds.has(policy.id)} onChange={event => setSelectedIds(current => { const next = new Set(current); event.target.checked ? next.add(policy.id) : next.delete(policy.id); return next; })} aria-label={`选择 ${policy.name}`} /></td><td>{policy.id}</td><td><button className="fl-admin-record-link" type="button" onClick={() => setDialog(policy)}>{policy.name}</button><span className="fl-admin-review-object">{policy.object} · {policy.contentType} · {policy.trigger}</span></td><td><span className={`fl-admin-status ${policy.status === "已启用" ? "success" : "danger"}`}>{policy.status}</span></td><td><button className="fl-admin-action-button" type="button" onClick={() => toggleStatus([policy.id], policy.status === "已启用" ? "未启用" : "已启用")}>{policy.status === "已启用" ? "停用" : "启用"}</button><button className="fl-admin-action-button" type="button" onClick={() => setDialog(policy)}>编辑策略</button><button className="fl-admin-action-button" type="button" onClick={() => setRulesPolicyId(policy.id)}>管理规则</button></td><td>{policy.updatedAt}</td></tr>)}</tbody></table></div></PrdWrapper>
      <footer className="fl-admin-pagination"><span>1- {filtered.length} of {filtered.length}</span><button className="fl-admin-secondary-button" type="button">‹</button><strong>1 / 1</strong><button className="fl-admin-secondary-button" type="button">›</button></footer>
    </section>
    {dialog ? <AdminReviewPolicyDialog policy={dialog} onClose={() => setDialog(null)} onSave={savePolicy} /> : null}
  </>;
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

type DynamicTranslationRow = { id: string; event: string; translation: string };

function parseDynamicTranslations(value: string): DynamicTranslationRow[] {
  const rows = value.split("\n").map(item => item.trim()).filter(Boolean).map((item, index) => {
    const separatorIndex = item.indexOf("：") >= 0 ? item.indexOf("：") : item.indexOf(":");
    return {
      id: `dynamic-${index}`,
      event: separatorIndex >= 0 ? item.slice(0, separatorIndex).trim() : item,
      translation: separatorIndex >= 0 ? item.slice(separatorIndex + 1).trim() : ""
    };
  });
  return rows.length ? rows : [{ id: "dynamic-0", event: "", translation: "" }];
}

function AuthTemplateName({ template }: { template: AdminAuthTemplate }) {
  return (
    <div className="fl-admin-auth-name">
      <button className="fl-admin-record-link" type="button">{template.name}</button>
    </div>
  );
}

function AuthTemplateScope({ template }: { template: AdminAuthTemplate }) {
  const [expanded, setExpanded] = useState(false);
  const [collapsible, setCollapsible] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);
  const summaries = template.applyTo.map(target => {
    const groups = workTypeGroupsFor(new Set([target]));
    const availableTypes = groups.flatMap(group => group.children?.length ? group.children.map(child => child.id) : [group.id]);
    return { target, types: availableTypes.filter(type => template.resourceTypes.includes(type)) };
  });
  const detailsText = summaries.map(item => `${item.target}：${item.types.join("、") || "未配置"}`);

  useEffect(() => {
    const element = detailsRef.current;
    if (element) setCollapsible(element.scrollHeight > element.clientHeight + 1);
  }, [detailsText.join("；")]);

  return <div className="fl-admin-auth-scope">
    <strong>{summaries.map(item => `${item.target}（${item.types.length}）`).join(" · ")}</strong>
    <div className={`fl-admin-auth-scope-detail-row ${expanded ? "expanded" : ""}`}>
      <div ref={detailsRef} className={`fl-admin-auth-scope-details ${expanded ? "expanded" : ""}`}><ul>{detailsText.map(item => <li key={item}>{item}</li>)}</ul></div>
      {collapsible ? <button className="fl-admin-scope-toggle" type="button" onClick={() => setExpanded(current => !current)}>{expanded ? "收起" : "展开"}</button> : null}
    </div>
  </div>;
}

function createBlankAuthTemplate(index: number): AdminAuthTemplate {
  return {
    id: `auth-tpl-${Date.now()}`,
    code: `AT-${String(index + 1).padStart(4, "0")}`,
    name: "",
    scope: "",
    applyTo: [],
    resourceTypes: [],
    status: "已启用",
    recommended: false,
    policyCode: "",
    policyTranslation: "",
    dynamicTranslation: "",
    updatedAt: "2026-09-15 12:00"
  };
}

function AdminAuthTemplatesPage({ onOpenPrd }: { onOpenPrd: (noteId: string) => void }) {
  const [templates, setTemplates] = useState<AdminAuthTemplate[]>(() => adminAuthTemplates.map(item => ({ ...item, applyTo: [...item.applyTo], resourceTypes: [...item.resourceTypes] })));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [queryDraft, setQueryDraft] = useState("");
  const [query, setQuery] = useState("");
  const [applyToFilter, setApplyToFilter] = useState("全部对象");
  const [status, setStatus] = useState("全部状态");
  const [recommendFilter, setRecommendFilter] = useState("全部推荐状态");
  const [scopeFilter, setScopeFilter] = useState<Set<string>>(() => new Set());
  const [dialog, setDialog] = useState<AuthTemplateDialog>(null);
  const [page, setPage] = useState(1);

  const filteredTemplates = useMemo(() => {
    const activeScopes = [...expandTreeSelection(resourceTypeTree, scopeFilter)];
    return templates.filter(template => {
      const matchesQuery = !query || [template.code, template.name, template.policyTranslation, template.dynamicTranslation].some(value => value.toLowerCase().includes(query.toLowerCase()));
      const matchesApplyTo = applyToFilter === "全部对象" || template.applyTo.includes(applyToFilter as TargetType);
      const matchesStatus = status === "全部状态" || template.status === status;
      const matchesRecommend = recommendFilter === "全部推荐状态" || (recommendFilter === "已推荐" ? template.recommended : !template.recommended);
      const matchesScope = !activeScopes.length || activeScopes.some(item => template.resourceTypes.includes(item));
      return matchesQuery && matchesApplyTo && matchesStatus && matchesRecommend && matchesScope;
    });
  }, [applyToFilter, query, recommendFilter, scopeFilter, status, templates]);

  const allVisibleSelected = filteredTemplates.length > 0 && filteredTemplates.every(template => selectedIds.has(template.id));
  const selectedTemplates = templates.filter(template => selectedIds.has(template.id));

  function resetFilters() {
    setQueryDraft("");
    setQuery("");
    setApplyToFilter("全部对象");
    setStatus("全部状态");
    setRecommendFilter("全部推荐状态");
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

  function applyScope(templateIds: string[], resourceTypes: string[], applyTo: TargetType[]) {
    setTemplates(current => current.map(template => templateIds.includes(template.id) ? { ...template, resourceTypes, applyTo, scope: getScopeLabel(applyTo, resourceTypes) } : template));
    setSelectedIds(new Set());
    setDialog(null);
  }

  const editingTemplate = editingTemplateId ? templates.find(template => template.id === editingTemplateId) : undefined;
  const creatingTemplateDraft = useMemo(() => createBlankAuthTemplate(templates.length), [templates.length]);

  if (creatingTemplate) {
    return (
      <AuthTemplateFormPage
        mode="create"
        template={creatingTemplateDraft}
        onCancel={() => setCreatingTemplate(false)}
        onSave={template => {
          saveTemplate(template);
          setCreatingTemplate(false);
        }}
      />
    );
  }

  if (editingTemplate) {
    return (
      <AuthTemplateFormPage
        mode="edit"
        template={editingTemplate}
        onCancel={() => setEditingTemplateId(null)}
        onSave={template => {
          saveTemplate(template);
          setEditingTemplateId(null);
        }}
      />
    );
  }

  return (
    <>
      <div className="fl-admin-page-heading">
        <div>
          <span className="fl-admin-eyebrow">运营</span>
          <h2>授权策略模板管理</h2>
        </div>
        <button className="fl-admin-button" type="button" onClick={() => setCreatingTemplate(true)}>+ 新模板</button>
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
              <label className="fl-admin-search-box compact">
                <span>⌕</span>
                <input value={queryDraft} onChange={event => setQueryDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { setQuery(queryDraft); setPage(1); } }} placeholder="搜索模板名称或翻译内容" />
              </label>
              <label className="fl-admin-status-filter">适用对象
                <select value={applyToFilter} onChange={event => { setApplyToFilter(event.target.value); setPage(1); }}>
                  <option>全部对象</option>
                  {targetTypeOptions.map(item => <option key={item}>{item}</option>)}
                </select>
              </label>
              <TreeMultiSelect
                label="资源类型"
                nodes={resourceTypeTree}
                value={scopeFilter}
                onChange={value => { setScopeFilter(value); setSelectedIds(new Set()); setPage(1); }}
              />
              <label className="fl-admin-status-filter">状态
                <select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}>
                  <option>全部状态</option>
                  <option>已启用</option>
                  <option>已停用</option>
                </select>
              </label>
              <label className="fl-admin-status-filter">推荐
                <select value={recommendFilter} onChange={event => { setRecommendFilter(event.target.value); setPage(1); }}>
                  <option>全部推荐状态</option>
                  <option>已推荐</option>
                  <option>未推荐</option>
                </select>
              </label>
              <button className="fl-admin-button" type="button" onClick={() => { setQuery(queryDraft); setPage(1); }}>搜索</button>
              {(query || queryDraft || applyToFilter !== "全部对象" || status !== "全部状态" || recommendFilter !== "全部推荐状态" || scopeFilter.size) ? <button className="fl-admin-secondary-button" type="button" onClick={resetFilters}>重置</button> : null}
            </div>
          </PrdWrapper>
        )}

        <PrdWrapper noteId="prd-fl-admin-auth-template-table" onOpen={onOpenPrd}>
          <div className="fl-admin-table-wrap">
            <table className="fl-admin-table fl-admin-auth-table">
              <thead>
                <tr>
                  <th><input type="checkbox" checked={allVisibleSelected} onChange={event => setSelectedIds(event.target.checked ? new Set(filteredTemplates.map(template => template.id)) : new Set())} aria-label="全选授权策略模板" /></th>
                  {["编号", "模板标题", "适用范围", "状态", "操作"].map(column => <th key={column}>{column}</th>)}
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
                      <AuthTemplateScope template={template} />
                    </td>
                    <td><span className={`fl-admin-status ${statusClass(template.status)}`}>{template.status}</span></td>
                    <td>
                      <button className="fl-admin-action-button" type="button" onClick={() => updateTemplate(template.id, item => ({ ...item, status: item.status === "已启用" ? "已停用" : "已启用" }))}>{template.status === "已启用" ? "停用" : "启用"}</button>
                      <button className="fl-admin-action-button" type="button" onClick={() => updateTemplate(template.id, item => ({ ...item, recommended: !item.recommended }))}>{template.recommended ? "取消推荐" : "推荐"}</button>
                      <button className="fl-admin-action-button" type="button" onClick={() => setDialog({ type: "preview", templateId: template.id })}>预览</button>
                      <button className="fl-admin-action-button" type="button" onClick={() => setEditingTemplateId(template.id)}>编辑</button>
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
          onDelete={deleteTemplate}
          onApplyScope={applyScope}
        />
      ) : null}
    </>
  );
}

function WorkTypePicker({ targets, value, onChange }: { targets: Set<string>; value: Set<string>; onChange: (value: Set<string>) => void }) {
  const groups = workTypeGroupsFor(targets);
  const leafIds = groups.flatMap(group => group.children?.length ? group.children.map(child => child.id) : [group.id]);
  const allSelected = leafIds.length > 0 && leafIds.every(id => value.has(id));
  function toggleAll() { onChange(allSelected ? new Set() : new Set(leafIds)); }
  function toggle(id: string) { const next = new Set(value); next.has(id) ? next.delete(id) : next.add(id); onChange(next); }
  return (
    <fieldset className="fl-admin-auth-fieldset resource-types">
      <legend className="fl-admin-work-type-legend"><span>适用作品类型</span>{groups.length ? <span className="fl-admin-select-actions"><label className="fl-admin-select-all"><input type="checkbox" checked={allSelected} onChange={toggleAll} /> 全选</label><button className="fl-admin-link-button" type="button" disabled={!value.size} onClick={() => onChange(new Set())}>清空已选</button></span> : null}</legend>
      {!groups.length ? <p className="fl-admin-empty-hint">请先选择适用标的物类型</p> : null}
      {groups.map(group => (
        <div className="fl-admin-work-type-group" key={group.id}>
          <strong>{group.label}</strong>
          <div>{group.children?.length ? group.children.map(child => <label key={child.id}><input type="checkbox" checked={value.has(child.id)} onChange={() => toggle(child.id)} /> {child.label}</label>) : <label><input type="checkbox" checked={value.has(group.id)} onChange={() => toggle(group.id)} /> {group.label}</label>}</div>
        </div>
      ))}
    </fieldset>
  );
}

function AuthTemplateFormPage({ mode, template, onCancel, onSave }: { mode: "create" | "edit"; template: AdminAuthTemplate; onCancel: () => void; onSave: (template: AdminAuthTemplate) => void }) {
  const [name, setName] = useState(template.name);
  const [status, setStatus] = useState<"" | "已启用" | "已停用">(mode === "create" ? "" : template.status);
  const [applyTo, setApplyTo] = useState<Set<string>>(() => new Set(template.applyTo));
  const [resourceTypes, setResourceTypes] = useState<Set<string>>(() => new Set(template.resourceTypes));
  const [policyCode, setPolicyCode] = useState(template.policyCode);
  const [policyTranslation, setPolicyTranslation] = useState(template.policyTranslation);
  const [dynamicTranslations, setDynamicTranslations] = useState<DynamicTranslationRow[]>(() => parseDynamicTranslations(template.dynamicTranslation));
  const [formError, setFormError] = useState("");

  const isDirty = JSON.stringify({ name, status, applyTo: [...applyTo].sort(), resourceTypes: [...resourceTypes].sort(), policyCode, policyTranslation, dynamicTranslations }) !== JSON.stringify({ name: template.name, status: mode === "create" ? "" : template.status, applyTo: [...template.applyTo].sort(), resourceTypes: [...template.resourceTypes].sort(), policyCode: template.policyCode, policyTranslation: template.policyTranslation, dynamicTranslations: parseDynamicTranslations(template.dynamicTranslation) });

  function handleSave() {
    const missingFields: string[] = [];
    if (!name.trim()) missingFields.push("名称");
    if (!status) missingFields.push("是否启用");
    if (!policyCode.trim()) missingFields.push("策略代码");
    if (!policyTranslation.trim()) missingFields.push("策略翻译 (zh-CN)");
    if (!applyTo.size) missingFields.push("适用标的物类型");
    if (!resourceTypes.size) missingFields.push("适用作品类型");
    if (missingFields.length) {
      setFormError(`请填写必填项：${missingFields.join("、")}`);
      return;
    }
    const nextApplyTo = ([...applyTo].filter(Boolean) as TargetType[]);
    const nextTypes = [...resourceTypes];
    onSave({
      ...template,
      name: name || "未命名模板",
      status: status as "已启用" | "已停用",
      applyTo: nextApplyTo,
      resourceTypes: nextTypes,
      scope: getScopeLabel(nextApplyTo, nextTypes),
      policyCode,
      policyTranslation,
      dynamicTranslation: dynamicTranslations.filter(item => item.event.trim() || item.translation.trim()).map(item => `${item.event.trim()}：${item.translation.trim()}`).join("\n"),
      updatedAt: "2026-09-15 12:00"
    });
  }

  return (
    <>
      <div className="fl-admin-page-heading">
        <div>
          <span className="fl-admin-eyebrow">授权策略模板管理 ＞ {mode === "create" ? "新建模板" : "编辑模板"}</span>
          <h2>{mode === "create" ? "新建授权策略模板" : "编辑授权策略模板"}</h2>
          <p>{mode === "create" ? `将创建 ${template.code}。核心条目的长表单创建使用独立页面承载，保存后返回模板列表。` : `正在编辑 ${template.code} · ${template.name}。长表单编辑使用独立页面承载，保存后返回模板列表。`}</p>
        </div>
        <EditPageActions isDirty={isDirty} onCancel={onCancel} onSave={handleSave} />
      </div>

      <FormErrorBanner message={formError} />

      <section className="fl-admin-panel fl-admin-edit-page">
        <div className="fl-admin-edit-form-header">
          <div>
            <strong>基础信息</strong>
            <span>控制模板启停、展示名称、授权策略代码与翻译文案。</span>
          </div>
          <span className={`fl-admin-status ${statusClass(status)}`}>{status}</span>
        </div>

        <div className="fl-admin-auth-form fl-admin-auth-form-page">
          <label className="fl-admin-dialog-field">是否启用
            <select value={status} onChange={event => { setStatus(event.target.value as "" | "已启用" | "已停用"); setFormError(""); }}>
              <option value="">请选择</option>
              <option value="已启用">启用</option>
              <option value="已停用">停用</option>
            </select>
            <small>{status === "已启用" ? "在用户端策略模板库中显示，用户在创建授权策略时可使用此模板" : "在用户端策略模板库中隐藏"}</small>
          </label>
          <label className="fl-admin-dialog-field">名称<input value={name} onChange={event => { setName(event.target.value); setFormError(""); }} placeholder="请输入授权策略模板名称" /></label>
          <label className="fl-admin-dialog-field fl-admin-code-field">策略代码<div className="fl-admin-code-editor-shell"><div className="fl-admin-code-line-numbers" aria-hidden="true">{policyCode.split("\n").map((_, index) => <span key={index}>{index + 1}</span>)}</div><textarea className="fl-admin-code-editor" value={policyCode} onChange={event => { setPolicyCode(event.target.value); setFormError(""); }} rows={9} spellCheck={false} /></div></label>
          <label className="fl-admin-dialog-field fl-admin-translation-field">策略翻译 (zh-CN)<textarea className="fl-admin-translation-editor" value={policyTranslation} onChange={event => { setPolicyTranslation(event.target.value); setFormError(""); }} rows={9} /></label>
          <div className="fl-admin-dialog-field fl-admin-dynamic-translation">
            <span>动态记录翻译 (zh-CN) <small className="fl-admin-field-hint">（选填）</small></span>
            <div className="fl-admin-dynamic-list">
              {dynamicTranslations.map((row, index) => <div className="fl-admin-dynamic-row" key={row.id}>
                <span className="fl-admin-dynamic-index" aria-label={`第 ${index + 1} 条`}>{index + 1}</span>
                <label>事件定位<input value={row.event} onChange={event => setDynamicTranslations(current => current.map(item => item.id === row.id ? { ...item, event: event.target.value } : item))} placeholder="请输入事件定位" /></label>
                <label>翻译<input value={row.translation} onChange={event => setDynamicTranslations(current => current.map(item => item.id === row.id ? { ...item, translation: event.target.value } : item))} placeholder="请输入翻译内容" /></label>
                <button className="fl-admin-link-button fl-admin-dynamic-delete" type="button" onClick={() => setDynamicTranslations(current => current.filter(item => item.id !== row.id))}>删除</button>
              </div>)}
            </div>
            <button className="fl-admin-secondary-button fl-admin-dynamic-add" type="button" onClick={() => setDynamicTranslations(current => [...current, { id: `dynamic-${Date.now()}`, event: "", translation: "" }])}>+ 新增</button>
          </div>
        </div>

        <div className="fl-admin-edit-form-section">
          <div>
            <strong>适用范围</strong>
            <span>先选择适用标的物类型，再配置对应的适用作品类型。</span>
          </div>
          <fieldset className="fl-admin-auth-fieldset">
            <legend>适用标的物类型</legend>
            {targetTypeOptions.map(item => <label key={item}><input type="checkbox" checked={applyTo.has(item)} onChange={() => {
              setFormError("");
              setApplyTo(current => { const next = toggleSetValue(current, item); const allowed = new Set(workTypeIds(workTypeGroupsFor(next))); setResourceTypes(types => new Set([...types].filter(type => allowed.has(type)))); return next; });
            }} /> {item}</label>)}
          </fieldset>
          <WorkTypePicker targets={applyTo} value={resourceTypes} onChange={value => { setResourceTypes(value); setFormError(""); }} />
        </div>

      </section>
    </>
  );
}

function AuthTemplateDialogView({
  dialog,
  templates,
  selectedTemplates,
  onClose,
  onDelete,
  onApplyScope
}: {
  dialog: Exclude<AuthTemplateDialog, null>;
  templates: AdminAuthTemplate[];
  selectedTemplates: AdminAuthTemplate[];
  onClose: () => void;
  onDelete: (templateId: string) => void;
  onApplyScope: (templateIds: string[], resourceTypes: string[], applyTo: TargetType[]) => void;
}) {
  const existing = "templateId" in dialog ? templates.find(template => template.id === dialog.templateId) : undefined;
  const [applyTo, setApplyTo] = useState<Set<string>>(() => new Set(["资源"]));
  const [resourceTypes, setResourceTypes] = useState<Set<string>>(() => new Set(["插画"]));

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
          <p>为已选中的 {targetTemplates.length} 条授权策略模板设置适用标的物类型和作品类型。</p>
          <fieldset className="fl-admin-auth-fieldset">
            <legend>适用标的物类型</legend>
            {targetTypeOptions.map(item => (
              <label key={item}><input type="checkbox" checked={applyTo.has(item)} onChange={() => setApplyTo(current => { const next = toggleSetValue(current, item); const allowed = new Set(workTypeIds(workTypeGroupsFor(next))); setResourceTypes(types => new Set([...types].filter(type => allowed.has(type)))); return next; })} /> {item}</label>
            ))}
          </fieldset>
          <WorkTypePicker targets={applyTo} value={resourceTypes} onChange={setResourceTypes} />
          <footer>
            <button className="fl-admin-secondary-button" type="button" onClick={onClose}>取消</button>
            <button className="fl-admin-button" type="button" onClick={() => onApplyScope(dialog.templateIds, [...resourceTypes], ([...applyTo].filter(Boolean) as TargetType[]))}>保存</button>
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
      <PrdWrapper noteId="prd-fl-admin-embedded-shell" onOpen={onOpenPrd}>
        <div className="fl-admin-frame">
          <aside className="fl-admin-sidebar">
            <div className="fl-admin-brand"><span className="fl-admin-brand-mark">F</span><span>Freelog <b>Admin</b></span></div>
            <nav aria-label="Freelog 后台导航">
              {adminNavGroups.map(group => (
                <section className="fl-admin-nav-group" key={group.label}>
                  <button className="fl-admin-nav-title" type="button" aria-label={group.label}>
                    <span className="fl-admin-nav-icon" aria-hidden="true">
                      {(() => {
                        const NavIcon = adminNavIconMap[group.label] || LayoutDashboard;
                        return <NavIcon size={15} strokeWidth={1.9} />;
                      })()}
                    </span>
                    <span>{group.label}</span>
                    <span>⌄</span>
                  </button>
                  <div className="fl-admin-nav-pages">
                    {group.pages.map(page => <button key={page.id} className={`fl-admin-nav-link ${page.id === activePageId ? "active" : ""}`} type="button" onClick={() => navigate(page.id)}>{page.label}</button>)}
                  </div>
                </section>
              ))}
            </nav>
          </aside>
          <section className="fl-admin-workspace">
            <header className="fl-admin-topbar">
              <div className="flex items-center gap-2 text-sm text-muted"><span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-xs font-bold text-white">AD</span><strong>Admin</strong></div>
            </header>
            <main className="fl-admin-content">
              {activePageId === "admin-dashboard" ? <AdminDashboard onOpenPrd={onOpenPrd} /> : activePageId === "admin-users" ? <AdminUsersPage onOpenPrd={onOpenPrd} /> : activePageId === "admin-auth-templates" ? <AdminAuthTemplatesPage onOpenPrd={onOpenPrd} /> : activePageId === "admin-review-policies" ? <AdminReviewPoliciesPage onOpenPrd={onOpenPrd} /> : <AdminGenericList pageId={activePageId} />}
            </main>
          </section>
        </div>
      </PrdWrapper>
    </div>
  );
}
