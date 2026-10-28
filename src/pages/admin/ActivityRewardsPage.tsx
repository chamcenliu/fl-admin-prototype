import { useMemo, useState } from "react";
import { EditPageActions } from "../../components/admin/EditPageActions";
import { FormErrorBanner } from "../../components/admin/FormErrorBanner";
import { AdminContextBreadcrumb } from "../../components/admin/AdminContextBreadcrumb";
import { PrdWrapper } from "../../components/prd/PrdWrapper";
import { activityRewardRecords, activityRewardStatistics, activityRewards, type Reward, type RewardRecord, type RewardType } from "../../mockData/activityRewards";
import { rewardUserCandidates, rewardWinnerUsers, type RewardWinner } from "../../mockData/activityRewardWinners";
import { RewardWinnerManagement } from "./RewardWinnerManagement";
import "./ActivityRewardsPage.css";

function statusClass(value: string) {
  return /进行中|已发放/.test(value) ? "success" : /待审核|未生效/.test(value) ? "warning" : /已停用|已拒绝|已扣除/.test(value) ? "danger" : "neutral";
}

function winnerUsersForReward(reward: Reward): RewardWinner[] {
  const saved = rewardWinnerUsers[reward.id];
  if (reward.winnerUsers === undefined && saved?.length) return saved;
  return (reward.winnerUsers || []).map((name, index) => rewardUserCandidates.find(user => user.name.toLowerCase() === name.toLowerCase()) || {
    id: `${reward.id}-winner-${index}`,
    name,
    avatar: name.slice(0, 2).toUpperCase(),
    contacts: [],
    registeredAt: "—",
    tags: []
  });
}

function RewardEditor({ reward, existingRewards, onBack, onSave, onOpenPrd, onManageWinners }: { reward: Reward; existingRewards: Reward[]; onBack: () => void; onSave: (reward: Reward) => void; onOpenPrd: (noteId: string) => void; onManageWinners: (reward: Reward) => void }) {
  const [draft, setDraft] = useState(reward);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditing = Boolean(reward.id);
  const update = <K extends keyof Reward>(key: K, value: Reward[K]) => {
    setDraft(current => ({ ...current, [key]: value }));
    setErrors(current => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };
  const isDirty = JSON.stringify(draft) !== JSON.stringify(reward);
  function save() {
    const normalizedId = draft.id.trim();
    const nextErrors: Record<string, string> = {};
    if (!draft.group) nextErrors.group = "请选择所属奖励组";
    if (!draft.name.trim()) nextErrors.name = "请输入奖励名称";
    if (!/^RS[A-Z0-9-]+$/i.test(normalizedId)) nextErrors.id = "需以 RS 开头，仅支持字母、数字和短横线";
    if (existingRewards.some(item => item.id.toLowerCase() === normalizedId.toLowerCase() && item.id !== reward.id)) nextErrors.id = "奖励编号已存在，请更换编号";
    if (!draft.type) nextErrors.type = "请选择奖励类型";
    if (!draft.amount.trim() || !/^\d+(\.\d{1,2})?$/.test(draft.amount.trim()) || Number(draft.amount) <= 0) nextErrors.amount = "请输入大于 0 且最多两位小数的额度";
    if (!draft.description.trim()) nextErrors.description = "请输入奖励说明";
    if (!draft.claimMethod) nextErrors.claimMethod = "请选择领取方式";
    if (!draft.listMode) nextErrors.listMode = "请选择生成方式";
    if (draft.listMode === "手动添加" && !draft.releaseAt) nextErrors.releaseAt = "请选择奖励发放时间";
    if (draft.listMode === "自动生成" && !draft.startAt) nextErrors.startAt = "请选择奖励开始时间";
    if (draft.listMode === "自动生成" && draft.endAt && draft.startAt && draft.endAt <= draft.startAt) nextErrors.endAt = "结束时间必须晚于开始时间";
    if (draft.listMode === "手动添加" && isEditing && !(draft.winnerUsers?.length)) nextErrors.winnerUsers = "请至少添加一名获奖用户";
    if (draft.listMode === "自动生成" && !draft.conditionType) nextErrors.conditionType = "请选择条件组类型";
    if (draft.listMode === "自动生成" && !draft.ruleType) nextErrors.ruleType = "请选择计次方式";
    if (draft.listMode === "自动生成" && (!draft.ruleCount || Number(draft.ruleCount) < 1)) nextErrors.ruleCount = "完成次数必须大于 0";
    if (draft.listMode === "自动生成" && !draft.taskName) nextErrors.taskName = "请选择发放任务";
    if (draft.releaseLimitEnabled && (!draft.releaseLimit || Number(draft.releaseLimit) < 1)) nextErrors.releaseLimit = "请输入大于 0 的发放次数";
    if (draft.releaseLimitEnabled && !draft.releasePeriod) nextErrors.releasePeriod = "请选择限制周期";
    if (draft.releaseLimitEnabled && !draft.perUserLimit) nextErrors.perUserLimit = "请输入每个用户的限制次数";
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setErrors({});
    const validity = draft.listMode === "手动添加"
      ? `${draft.releaseAt!.replace("T", " ")} 发放`
      : `${draft.startAt!.replace("T", " ")} 至 ${draft.endAt ? draft.endAt.replace("T", " ") : "长期有效"}`;
    onSave({ ...draft, id: normalizedId, name: draft.name.trim(), amount: draft.amount.trim(), description: draft.description.trim(), validity, ruleCount: draft.ruleCount?.trim() || "1" });
  }
  const fieldError = (field: string) => errors[field];
  const errorMessage = Object.values(errors).join("；");
  return <div className="fl-reward-editor-page">
    <div className="fl-reward-editor-head"><div><span className="fl-admin-eyebrow">运营 · 活动奖励</span><h2>{reward.name ? "编辑活动奖励" : "新建活动奖励"}</h2><p>配置奖励基础信息、发放规则和审核策略；保存后返回奖励列表。</p></div><EditPageActions isDirty={isDirty} onCancel={onBack} onSave={save} /></div>
    <FormErrorBanner message={errorMessage} />
    <PrdWrapper noteId="prd-fl-admin-activity-reward-basic" onOpen={onOpenPrd}><section className="fl-reward-form-card">
      <div className="fl-reward-form-section"><h3>基础信息</h3><p>用于识别奖励并关联到具体运营活动。</p></div>
    <div className="fl-reward-form-grid">
      <label className={fieldError("group") ? "has-error" : ""}><span className="fl-reward-label-text">所属奖励组 *</span><span className="fl-reward-field-hint fl-reward-hint-slot" aria-hidden="true">&nbsp;</span><div className="fl-reward-control-row"><select aria-invalid={Boolean(fieldError("group"))} value={draft.group} onChange={e => update("group", e.target.value)}><option value="">请选择奖励组</option><option>新手任务奖励</option><option>用户调研奖励</option><option>邀请注册奖励</option><option>新春锦鲤奖励</option></select><button type="button" className="fl-admin-action-button fl-reward-inline-action">+ 新建奖励组</button></div>{fieldError("group") ? <em>{fieldError("group")}</em> : null}</label>
      <label className={fieldError("name") ? "has-error" : ""}><span className="fl-reward-label-text">奖励名称 *</span><span className="fl-reward-field-hint fl-reward-hint-slot" aria-hidden="true">&nbsp;</span><input aria-invalid={Boolean(fieldError("name"))} value={draft.name} onChange={e => update("name", e.target.value)} placeholder="请输入奖励名称" />{fieldError("name") ? <em>{fieldError("name")}</em> : null}</label>
      <label className={fieldError("id") ? "has-error" : ""}><span className="fl-reward-label-text">奖励编号 *</span><span className="fl-reward-field-hint fl-reward-hint-slot" aria-hidden="true">&nbsp;</span><input aria-invalid={Boolean(fieldError("id"))} value={draft.id} onChange={e => update("id", e.target.value)} placeholder="建议以 RS 开头" />{fieldError("id") ? <em>{fieldError("id")}</em> : null}</label>
      <label><span className="fl-reward-label-text">关联活动</span><span className="fl-reward-field-hint fl-reward-hint-slot">从后台活动列表中选择关联活动</span><select value={draft.activity} onChange={e => update("activity", e.target.value)}><option value="">请选择关联活动</option><option>资源创作大赛</option><option>推荐有奖</option><option>新手大作战</option><option>有奖调查问卷</option><option>邀请注册</option></select></label>
      <label className="span-2">备注<span className="fl-reward-field-hint">内部使用，不会展示给用户</span><input value={draft.note} onChange={e => update("note", e.target.value)} placeholder="请输入内部备注" /></label>
    </div>
    </section></PrdWrapper>
    <PrdWrapper noteId="prd-fl-admin-activity-reward-config" onOpen={onOpenPrd}><section className="fl-reward-form-card">
      <div className="fl-reward-form-section"><h3>奖励配置</h3><p>配置奖励内容、领取方式和名单来源。</p></div>
    <div className="fl-reward-form-grid">
      <label className={fieldError("type") ? "has-error" : ""}>奖励类型 *<select aria-invalid={Boolean(fieldError("type"))} value={draft.type} onChange={e => update("type", e.target.value as RewardType)}><option value="">请选择奖励类型</option><option>现金</option><option>羽币</option><option>邀请次数</option><option>瓜分资格</option><option>积分</option></select>{fieldError("type") ? <em>{fieldError("type")}</em> : null}</label>
      <label className={fieldError("amount") ? "has-error" : ""}>奖励额度 *<div className="fl-reward-input-with-unit"><input aria-invalid={Boolean(fieldError("amount"))} value={draft.amount} onChange={e => update("amount", e.target.value)} inputMode="decimal" /><span>{draft.type === "现金" ? "元" : draft.type === "羽币" ? "枚" : draft.type === "瓜分资格" ? "资格" : "次"}</span></div>{fieldError("amount") ? <em>{fieldError("amount")}</em> : null}</label>
      <label className={`span-2 ${fieldError("description") ? "has-error" : ""}`}>奖励说明 *<textarea aria-invalid={Boolean(fieldError("description"))} value={draft.description} onChange={e => update("description", e.target.value)} rows={2} placeholder="在用户端奖励明细中展示" />{fieldError("description") ? <em>{fieldError("description")}</em> : null}</label>
      <label className={fieldError("claimMethod") ? "has-error" : ""}>领取方式 *<select aria-invalid={Boolean(fieldError("claimMethod"))} value={draft.claimMethod || ""} onChange={e => update("claimMethod", e.target.value as Reward["claimMethod"])}><option value="">请选择领取方式</option><option>手动领取</option><option>自动到账</option></select>{fieldError("claimMethod") ? <em>{fieldError("claimMethod")}</em> : null}</label>
    </div>
    </section></PrdWrapper>
    <PrdWrapper noteId="prd-fl-admin-activity-reward-rule" onOpen={onOpenPrd}><section className="fl-reward-form-card"><div className="fl-reward-form-section"><h3>发放规则</h3><p>{draft.listMode === "手动添加" ? "手动维护获奖用户名单，并设置统一发放时间。" : draft.listMode === "自动生成" ? "自动生成名单需要配置有效期、用户完成任务的条件和发放限制。" : "请选择名单生成方式后继续配置发放规则。"}</p></div><div className="fl-reward-generation-row"><label className={fieldError("listMode") ? "has-error" : ""}>生成方式 *<select aria-invalid={Boolean(fieldError("listMode"))} value={draft.listMode} onChange={e => update("listMode", e.target.value as Reward["listMode"])}><option value="">请选择生成方式</option><option>手动添加</option><option>自动生成</option></select>{fieldError("listMode") ? <em>{fieldError("listMode")}</em> : null}</label></div>{draft.listMode === "手动添加" ? <div className="fl-reward-manual-config"><label className={fieldError("releaseAt") ? "has-error" : ""}>发放时间 *<input type="datetime-local" aria-label="奖励发放时间" aria-invalid={Boolean(fieldError("releaseAt"))} value={draft.releaseAt || ""} onChange={e => update("releaseAt", e.target.value)} />{fieldError("releaseAt") ? <em>{fieldError("releaseAt")}</em> : null}<span className="fl-reward-field-hint">开始时间默认为发放时间前 30 分钟，结束时间默认为发放时间后 30 天。</span></label>{isEditing ? <div className={fieldError("winnerUsers") ? "has-error" : ""}><span className="fl-reward-field-label">发放名单 *</span><div className="fl-reward-winner-box"><strong>{draft.winnerUsers?.length || 0} 名获奖用户</strong><button type="button" className="fl-admin-action-button" onClick={() => onManageWinners(draft)}>管理获奖名单</button></div>{fieldError("winnerUsers") ? <em>{fieldError("winnerUsers")}</em> : null}</div> : <div className="fl-reward-post-create-hint">奖励创建成功后，可在编辑页维护发放名单。</div>}</div> : draft.listMode === "自动生成" ? <><div className="fl-reward-date-field"><span>有效期 *</span><div className="fl-reward-date-row"><label className={fieldError("startAt") ? "has-error" : ""}><input type="datetime-local" aria-label="开始时间" aria-invalid={Boolean(fieldError("startAt"))} value={draft.startAt || ""} onInput={e => update("startAt", e.currentTarget.value)} onChange={e => update("startAt", e.currentTarget.value)} />{fieldError("startAt") ? <em>{fieldError("startAt")}</em> : null}</label><span>至</span><label className={fieldError("endAt") ? "has-error" : ""}><input type="datetime-local" aria-label="结束时间" aria-invalid={Boolean(fieldError("endAt"))} value={draft.endAt || ""} onInput={e => update("endAt", e.currentTarget.value)} onChange={e => update("endAt", e.currentTarget.value)} />{fieldError("endAt") ? <em>{fieldError("endAt")}</em> : null}</label></div><span className="fl-reward-field-hint">结束时间为空表示长期有效。</span></div><div className="fl-reward-condition-row"><label className={fieldError("conditionType") ? "has-error" : ""}>条件组类型<select aria-invalid={Boolean(fieldError("conditionType"))} value={draft.conditionType || ""} onChange={e => update("conditionType", e.target.value as Reward["conditionType"])}><option value="">请选择条件组类型</option><option>满足以下所有条件</option><option>满足以下任一条件</option></select>{fieldError("conditionType") ? <em>{fieldError("conditionType")}</em> : null}</label><label className={fieldError("taskName") ? "has-error" : ""}>发放条件 *<select aria-invalid={Boolean(fieldError("taskName"))} value={draft.taskName || ""} onChange={e => update("taskName", e.target.value)}><option value="">请选择任务</option><option>资源任务 · 上架一个全新资源</option><option>完成有奖调查问卷</option><option>邀请一位好友</option><option>创建一个节点</option></select>{fieldError("taskName") ? <em>{fieldError("taskName")}</em> : null}</label><label className={` ${fieldError("ruleType") || fieldError("ruleCount") ? "has-error" : ""}`}>计次方式与次数<div className="fl-reward-count-row"><select aria-invalid={Boolean(fieldError("ruleType"))} value={draft.ruleType || ""} onChange={e => update("ruleType", e.target.value as Reward["ruleType"])}><option value="">请选择计次方式</option><option>完成指定任务</option><option>完成任一任务</option><option>完成所有任务</option></select><input value={draft.ruleCount || ""} onChange={e => update("ruleCount", e.target.value)} inputMode="numeric" aria-label="完成次数" /> <span>次</span></div>{fieldError("ruleType") || fieldError("ruleCount") ? <em>{fieldError("ruleType") || fieldError("ruleCount")}</em> : null}</label></div><button type="button" className="fl-admin-action-button fl-reward-add-condition">+ 添加条件组</button></> : null}</section></PrdWrapper>
    {draft.listMode === "自动生成" ? <PrdWrapper noteId="prd-fl-admin-activity-reward-limit" onOpen={onOpenPrd}><section className="fl-reward-form-card"><div className="fl-reward-form-section"><h3>发放次数限制</h3><p>可限制总发放次数或指定周期内发放的次数，默认不限制。</p></div><div className="fl-reward-limit-row"><label><input type="checkbox" checked={draft.releaseLimitEnabled ?? false} onChange={e => update("releaseLimitEnabled", e.target.checked)} /> 限制发放次数</label><span>最多发放</span><input disabled={!draft.releaseLimitEnabled} value={draft.releaseLimit || ""} onChange={e => update("releaseLimit", e.target.value)} inputMode="numeric" aria-label="最大发放次数" /><select disabled={!draft.releaseLimitEnabled} value={draft.releasePeriod || ""} onChange={e => update("releasePeriod", e.target.value as Reward["releasePeriod"])}><option value="">请选择周期</option><option>天</option><option>周</option><option>月</option></select><span>，每个用户限</span><input disabled={!draft.releaseLimitEnabled} className={fieldError("perUserLimit") ? "has-error" : ""} value={draft.perUserLimit || ""} onChange={e => update("perUserLimit", e.target.value)} inputMode="numeric" aria-label="每个用户限制次数" /><span>次。</span>{fieldError("releaseLimit") || fieldError("perUserLimit") || fieldError("releasePeriod") ? <em>{fieldError("releaseLimit") || fieldError("perUserLimit") || fieldError("releasePeriod")}</em> : null}</div></section></PrdWrapper> : null}
    {draft.listMode === "自动生成" ? <PrdWrapper noteId="prd-fl-admin-activity-reward-advanced" onOpen={onOpenPrd}><section className="fl-reward-form-card"><div className="fl-reward-form-section"><h3>奖励互斥规则</h3><p>选择与当前奖励互斥的奖励；如果用户已获得所选奖励，则不再发放当前奖励。</p></div><label className="fl-reward-switch-row"><input type="checkbox" checked={draft.mutualExclusion ?? false} onChange={e => update("mutualExclusion", e.target.checked)} /> 不可与指定奖励同时领取</label>{draft.mutualExclusion ? <div className="fl-reward-muted-box"><label>互斥奖励<select multiple value={draft.mutualExclusionRewards || []} onChange={e => update("mutualExclusionRewards", [...e.target.selectedOptions].map(option => option.value))}><option value="RS000802">RS000802 · 新手任务 - 资源任务奖励</option><option value="RS000803">RS000803 · 内测调研 - 6元奖励</option><option value="RS000804">RS000804 · 2025贺岁纪 - 一等奖</option></select></label><span>按住 Ctrl / Command 可多选奖励。</span></div> : null}<div className="fl-reward-review-block"><h3>是否审核</h3><p>奖励发放前审核关联信息，例如用户发布的资源、展品、节点或帖子。</p><label className="fl-reward-switch-row"><input type="checkbox" checked={draft.review} onChange={e => update("review", e.target.checked)} /> 发放前需要审核</label><div className="fl-reward-audit-hint">开启后，审核项目会出现在“活动奖励发放记录”的关联信息中。</div></div></section></PrdWrapper> : null}
  </div>;
}

export function ActivityRewardsPage({ onOpenPrd }: { onOpenPrd: (noteId: string) => void }) {
  const [rewards, setRewards] = useState(activityRewards);
  const [records, setRecords] = useState(activityRewardRecords);
  const [view, setView] = useState<"rewards" | "records">("rewards");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("所有");
  const [status, setStatus] = useState("所有");
  const [recordStatus, setRecordStatus] = useState("所有");
  const [recordRewardId, setRecordRewardId] = useState<string | null>(null);
  const [listMode, setListMode] = useState("所有");
  const [editor, setEditor] = useState<Reward | null>(null);
  const [winnerManagerReward, setWinnerManagerReward] = useState<Reward | null>(null);
  const [feedback, setFeedback] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const filteredRewards = useMemo(() => rewards.filter(item => (!query || `${item.id} ${item.name} ${item.activity}`.includes(query)) && (type === "所有" || item.type === type) && (status === "所有" || item.status === status) && (listMode === "所有" || item.listMode === listMode)), [listMode, query, rewards, status, type]);
  const recordReward = useMemo(() => recordRewardId ? rewards.find(item => item.id === recordRewardId) || null : null, [recordRewardId, rewards]);
  const filteredRecords = useMemo(() => records.filter(item => (!recordReward || item.rewardId === recordReward.id) && (!query || `${item.id} ${item.reward} ${item.user}`.includes(query)) && (recordStatus === "所有" || item.status === recordStatus)), [query, recordReward, recordStatus, records]);
  function openRewardRecords(reward: Reward) { setRecordRewardId(reward.id); setQuery(""); setRecordStatus("所有"); setView("records"); }
  function saveReward(item: Reward) { setRewards(current => current.some(row => row.id === item.id) ? current.map(row => row.id === item.id ? item : row) : [item, ...current]); setEditor(null); setFeedback("活动奖励已保存"); window.setTimeout(() => setFeedback(""), 2200); }
  function saveWinnerUsers(reward: Reward, winners: RewardWinner[]) {
    const names = winners.map(user => user.name);
    setRewards(current => current.map(item => item.id === reward.id ? { ...item, winnerUsers: names } : item));
    setEditor(current => current?.id === reward.id ? { ...current, winnerUsers: names } : current);
  }
  function toggleReward(id: string, confirmAction = true) { const target = rewards.find(item => item.id === id); if (!target || (confirmAction && !window.confirm(`确认${target.status === "已停用" ? "恢复" : "停用"}“${target.name}”吗？`))) return; setRewards(current => current.map(item => item.id === id ? { ...item, status: item.status === "已停用" ? "未生效" : "已停用" } : item)); setFeedback(target.status === "已停用" ? "奖励已恢复" : "奖励已停用"); window.setTimeout(() => setFeedback(""), 2200); }
  function reviewRecord(id: string, next: RewardRecord["status"]) { setRecords(current => current.map(item => item.id === id ? { ...item, status: next } : item)); setFeedback(next === "已发放" ? "奖励发放审核已通过" : next === "已拒绝" ? "奖励发放已拒绝" : "奖励已扣除"); window.setTimeout(() => setFeedback(""), 2200); }
  const allSelected = filteredRewards.length > 0 && filteredRewards.every(item => selected.has(item.id));
  if (winnerManagerReward) return <RewardWinnerManagement reward={winnerManagerReward} initialWinners={winnerUsersForReward(winnerManagerReward)} onOpenPrd={onOpenPrd} onClose={() => setWinnerManagerReward(null)} onEdit={() => { setWinnerManagerReward(null); setEditor(winnerManagerReward); }} onSaveWinners={winners => saveWinnerUsers(winnerManagerReward, winners)} />;
  if (editor) return <RewardEditor reward={editor} existingRewards={rewards} onBack={() => setEditor(null)} onSave={saveReward} onOpenPrd={onOpenPrd} onManageWinners={reward => setWinnerManagerReward(reward)} />;
  return <PrdWrapper noteId="prd-fl-admin-activity-reward-list" onOpen={onOpenPrd}>
    {feedback ? <div className="fl-reward-feedback" role="status">{feedback}</div> : null}
    <div className="fl-admin-page-heading"><div>{view === "records" ? <AdminContextBreadcrumb onActivityClick={() => { setView("rewards"); setRecordRewardId(null); setQuery(""); setRecordStatus("所有"); }} /> : <span className="fl-admin-eyebrow">运营</span>}<h2>{view === "rewards" ? "活动奖励管理" : "发放记录"}</h2>{view === "rewards" ? <p>配置活动奖励、发放规则与获奖名单。</p> : null}</div><div className="fl-reward-heading-actions">{view === "rewards" ? <button className="fl-admin-button" type="button" onClick={() => setEditor({ id: "", name: "", type: "" as RewardType, amount: "", listMode: "" as Reward["listMode"], review: false, validity: "", startAt: "", endAt: "", releaseAt: "", winnerUsers: [], status: "未生效", activity: "", group: "", description: "", note: "", claimMethod: "" as Reward["claimMethod"], conditionType: "" as Reward["conditionType"], taskName: "", ruleType: "" as Reward["ruleType"], ruleCount: "", releaseLimitEnabled: false, releasePeriod: "" as Reward["releasePeriod"], perUserLimit: "", mutualExclusion: false, mutualExclusionRewards: [] })}>+ 新建活动奖励</button> : null}</div></div>
    {view === "records" && recordReward ? <><section className="fl-reward-winner-info fl-reward-record-summary"><div><span>奖励名称</span><strong>{recordReward.name}</strong></div><div><span>奖励编号</span><strong>{recordReward.id}</strong></div><div><span>奖励类型</span><strong>{recordReward.type} · {recordReward.amount}{recordReward.type === "现金" ? "元" : "枚"}</strong></div><div><span>发放记录</span><strong>{filteredRecords.length} 条</strong></div><div><span>操作</span><button className="fl-reward-action-link fl-reward-info-edit" type="button" onClick={() => setEditor(recordReward)}>编辑</button></div></section><section className="fl-reward-record-statistics"><h3>统计信息</h3><div className="fl-reward-stats-grid">{(recordReward.listMode === "自动生成" ? [["昨日发放额度", activityRewardStatistics[recordReward.id]?.yesterdayAmount], ["昨日发放次数", activityRewardStatistics[recordReward.id]?.yesterdayCount], ["昨日发放用户数", activityRewardStatistics[recordReward.id]?.yesterdayUsers], ["累计发放额度", activityRewardStatistics[recordReward.id]?.totalAmount], ["累计发放次数", activityRewardStatistics[recordReward.id]?.totalCount], ["累计发放用户数", activityRewardStatistics[recordReward.id]?.totalUsers]] : [["累计发放额度", activityRewardStatistics[recordReward.id]?.totalAmount], ["累计发放用户数", activityRewardStatistics[recordReward.id]?.totalUsers]]).map(([label, value]) => <div key={label}><span>{label}</span><strong>{value || "0"}</strong></div>)}</div></section></> : null}
    <section className="fl-admin-panel"><div className="fl-admin-toolbar"><label className="fl-admin-search-box"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder={view === "rewards" ? "搜索奖励名称、编号或活动" : "搜索记录编号、奖励或用户"} /></label>{view === "rewards" ? <><select className="fl-admin-secondary-button" value={type} onChange={e => setType(e.target.value)}><option>所有</option><option>现金</option><option>羽币</option><option>邀请次数</option><option>积分</option></select><select className="fl-admin-secondary-button" value={status} onChange={e => setStatus(e.target.value)}><option>所有</option><option>未生效</option><option>进行中</option><option>已结束</option><option>已停用</option></select><select className="fl-admin-secondary-button" value={listMode} onChange={e => setListMode(e.target.value)}><option>所有</option><option>手动添加</option><option>自动生成</option></select></> : <select className="fl-admin-secondary-button" value={recordStatus} onChange={e => setRecordStatus(e.target.value)}><option>所有</option><option>待审核</option><option>已发放</option><option>已拒绝</option><option>已扣除</option></select>}<button className="fl-admin-secondary-button" type="button" onClick={() => { setQuery(""); setType("所有"); setStatus("所有"); setListMode("所有"); setRecordStatus("所有"); }}>重置</button><span className="ml-auto text-sm text-muted">共 {view === "rewards" ? filteredRewards.length : filteredRecords.length} 条</span></div>
      {view === "rewards" ? <div className="fl-reward-selection">{selected.size ? <><strong>已选 {selected.size} 条</strong><button className="fl-admin-action-button" type="button" onClick={() => { if (window.confirm(`确认批量变更 ${selected.size} 条奖励的状态吗？`)) { [...selected].forEach(id => toggleReward(id, false)); setSelected(new Set()); } }}>批量停用/恢复</button><button className="fl-admin-action-button" type="button" onClick={() => setSelected(new Set())}>取消选择</button></> : <span>奖励将在有效期内按配置规则自动生成或手动发放</span>}</div> : null}
      <div className="fl-admin-table-wrap"><table className="fl-admin-table"><thead><tr>{view === "rewards" ? <><th><input type="checkbox" checked={allSelected} onChange={e => setSelected(e.target.checked ? new Set(filteredRewards.map(item => item.id)) : new Set())} /></th><th>奖励编号</th><th>奖励名称</th><th>奖励类型</th><th>名单生成方式</th><th>发放审核</th><th>发放时间 / 有效期</th><th>状态</th><th>操作</th></> : <><th>记录编号</th><th>关联信息</th><th>用户</th><th>生成日期</th><th>发放额度</th><th>发放状态</th><th>操作</th></>}</tr></thead><tbody>{view === "rewards" ? filteredRewards.map(item => <tr key={item.id}><td><input type="checkbox" checked={selected.has(item.id)} onChange={e => setSelected(current => { const next = new Set(current); e.target.checked ? next.add(item.id) : next.delete(item.id); return next; })} /></td><td>{item.id}</td><td><button className="fl-admin-record-link" type="button" onClick={() => setEditor(item)}>{item.name}</button><small>{item.activity} · {item.group}</small></td><td>{item.type}<small>{item.amount} {item.type === "现金" ? "元" : "枚"}</small></td><td>{item.listMode}</td><td>{item.review ? "是" : "否"}</td><td>{item.validity}</td><td><span className={`fl-admin-status ${statusClass(item.status)}`}>{item.status}</span></td><td><button className="fl-admin-action-button" type="button" onClick={() => setEditor(item)}>编辑</button><button className="fl-admin-action-button" type="button" onClick={() => openRewardRecords(item)}>发放记录</button><button className="fl-admin-action-button" type="button" onClick={() => toggleReward(item.id)}>{item.status === "已停用" ? "恢复" : "停用"}</button></td></tr>) : filteredRecords.map(item => <tr key={item.id}><td>{item.id}</td><td>{item.reward}<small>{item.activity}</small></td><td>{item.user}</td><td>{item.date}</td><td>{item.amount}</td><td><span className={`fl-admin-status ${statusClass(item.status)}`}>{item.status}</span></td><td>{item.status === "待审核" ? <><button className="fl-admin-action-button" type="button" onClick={() => reviewRecord(item.id, "已发放")}>审核通过</button><button className="fl-admin-action-button" type="button" onClick={() => reviewRecord(item.id, "已拒绝")}>拒绝</button></> : item.status === "已发放" ? <button className="fl-admin-action-button" type="button" onClick={() => reviewRecord(item.id, "已扣除")}>扣除</button> : <button className="fl-admin-action-button" type="button">详情</button>}</td></tr>)}</tbody></table></div>
    </section>
  </PrdWrapper>;
}
