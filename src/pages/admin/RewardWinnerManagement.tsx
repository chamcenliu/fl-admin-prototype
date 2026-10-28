import { useMemo, useState } from "react";
import { AdminContextBreadcrumb } from "../../components/admin/AdminContextBreadcrumb";
import { PrdWrapper } from "../../components/prd/PrdWrapper";
import { activityRewardRecords, type Reward } from "../../mockData/activityRewards";
import { rewardUserCandidates, rewardWinnerTags, type RewardWinner } from "../../mockData/activityRewardWinners";

type Props = { reward: Reward; initialWinners: RewardWinner[]; onClose: () => void; onEdit: () => void; onGoRewards?: () => void; onSaveWinners: (winners: RewardWinner[]) => void; onOpenPrd: (noteId: string) => void };

function userManagementUrl(name: string) {
  return `${window.location.origin}${window.location.pathname}#/admin-users?query=${encodeURIComponent(name)}`;
}

export function RewardWinnerManagement({ reward, initialWinners, onClose, onEdit, onGoRewards = onClose, onSaveWinners, onOpenPrd }: Props) {
  const [winners, setWinners] = useState(initialWinners);
  const [adding, setAdding] = useState(false);
  const [queryDraft, setQueryDraft] = useState("");
  const [query, setQuery] = useState("");
  const [registeredAfter, setRegisteredAfter] = useState("");
  const [registeredBefore, setRegisteredBefore] = useState("");
  const [tag, setTag] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const records = activityRewardRecords.filter(record => record.reward === reward.name);
  const candidates = useMemo(() => rewardUserCandidates.filter(user => {
    const matchesQuery = !query || [user.name, ...user.contacts].some(value => value.toLowerCase().includes(query.toLowerCase()));
    const matchesAfter = !registeredAfter || user.registeredAt >= registeredAfter;
    const matchesBefore = !registeredBefore || user.registeredAt <= registeredBefore;
    const matchesTag = !tag || user.tags.includes(tag);
    return matchesQuery && matchesAfter && matchesBefore && matchesTag && !winners.some(item => item.id === user.id);
  }), [query, registeredAfter, registeredBefore, tag, winners]);
  const allCandidatesSelected = candidates.length > 0 && candidates.every(user => selectedIds.has(user.id));
  function close() { onSaveWinners(winners); onClose(); }

  function resetFilters() {
    setQueryDraft(""); setQuery(""); setRegisteredAfter(""); setRegisteredBefore(""); setTag(""); setSelectedIds(new Set());
  }
  function addSelected() {
    const added = rewardUserCandidates.filter(user => selectedIds.has(user.id));
    setWinners(current => [...current, ...added.filter(user => !current.some(item => item.id === user.id))]);
    setSelectedIds(new Set()); setAdding(false); resetFilters();
  }

  return <div className="fl-reward-winner-page">
    <div className="fl-reward-winner-head"><div><AdminContextBreadcrumb onActivityClick={onGoRewards} /><h2 id="fl-reward-winner-title">获奖名单管理</h2></div></div>
      <PrdWrapper noteId="prd-fl-admin-activity-reward-winners" onOpen={onOpenPrd}><section className="fl-reward-winner-info"><div><span>奖励名称</span><strong>{reward.name}</strong></div><div><span>奖励编号</span><strong>{reward.id}</strong></div><div><span>奖励类型</span><strong>{reward.type} · {reward.amount}{reward.type === "现金" ? "元" : "枚"}</strong></div><div><span>发放记录</span><strong>{records.length} 条</strong></div><div><span>操作</span><button className="fl-reward-action-link fl-reward-info-edit" type="button" onClick={onEdit}>编辑</button></div></section></PrdWrapper>
      <PrdWrapper noteId="prd-fl-admin-activity-reward-winner-list" onOpen={onOpenPrd}><section className="fl-reward-winner-list"><div className="fl-reward-winner-list-head"><div><h3>获奖用户</h3><span>共 {winners.length} 人</span></div><button className="fl-admin-button" type="button" onClick={() => setAdding(true)}>+ 添加获奖用户</button></div><div className="fl-admin-table-wrap"><table className="fl-admin-table"><thead><tr><th>用户</th><th>用户标签</th><th>最近登录</th><th>注册时间</th><th>账号状态</th><th>操作</th></tr></thead><tbody>{winners.map(user => <tr key={user.id}><td><a className="fl-reward-user-cell" href={userManagementUrl(user.name)} target="_blank" rel="noreferrer"><span className="fl-reward-avatar">{user.avatar}</span><strong>{user.name}</strong></a></td><td>{user.tags.join("、") || "—"}</td><td>{user.lastLogin}</td><td>{user.registeredAt}</td><td><span className={`fl-admin-status ${user.status === "正常" ? "success" : "danger"}`}>{user.status}</span></td><td><button className="fl-admin-action-button danger" type="button" onClick={() => { if (window.confirm(`确认从获奖名单中删除“${user.name}”吗？`)) setWinners(current => current.filter(item => item.id !== user.id)); }}>删除</button></td></tr>)}</tbody></table></div>{!winners.length ? <div className="fl-reward-empty">暂无获奖用户</div> : null}</section></PrdWrapper>
      {adding ? <div className="fl-reward-add-modal-backdrop" role="presentation"><section className="fl-reward-add-modal" role="dialog" aria-modal="true" aria-labelledby="fl-reward-add-title"><div className="fl-reward-add-head"><h3 id="fl-reward-add-title">添加获奖用户</h3><button className="fl-reward-close-button" type="button" onClick={() => setAdding(false)} aria-label="关闭添加获奖用户">×</button></div><div className="fl-reward-add-filters"><div className="fl-reward-add-search-control"><label className="fl-admin-search-box fl-reward-add-search"><span>⌕</span><input value={queryDraft} onChange={event => setQueryDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter") setQuery(queryDraft); }} placeholder="用户名、手机号或邮箱" /></label><button className="fl-admin-button" type="button" onClick={() => setQuery(queryDraft)}>搜索</button></div><label>注册时间<input type="date" value={registeredAfter} onChange={event => setRegisteredAfter(event.target.value)} /></label><span>至</span><input aria-label="注册时间结束" type="date" value={registeredBefore} onChange={event => setRegisteredBefore(event.target.value)} /><select aria-label="用户标签" value={tag} onChange={event => setTag(event.target.value)}><option value="">所有标签</option>{rewardWinnerTags.map(item => <option key={item}>{item}</option>)}</select><button className="fl-admin-secondary-button" type="button" onClick={resetFilters}>重置</button></div><div className="fl-reward-add-selection"><label><input type="checkbox" checked={allCandidatesSelected} onChange={event => setSelectedIds(event.target.checked ? new Set(candidates.map(user => user.id)) : new Set())} /> 全选</label><span>已选 {selectedIds.size} 人</span></div><div className="fl-admin-table-wrap"><table className="fl-admin-table"><thead><tr><th>选择</th><th>用户</th><th>联系方式</th><th>用户标签</th><th>最近登录</th><th>注册时间</th><th>账号状态</th></tr></thead><tbody>{candidates.map(user => <tr key={user.id}><td><input type="checkbox" checked={selectedIds.has(user.id)} onChange={event => setSelectedIds(current => { const next = new Set(current); event.target.checked ? next.add(user.id) : next.delete(user.id); return next; })} aria-label={`选择用户 ${user.name}`} /></td><td><span className="fl-reward-user-cell"><span className="fl-reward-avatar">{user.avatar}</span><strong>{user.name}</strong></span></td><td>{user.contacts.join(" / ")}</td><td>{user.tags.join("、") || "—"}</td><td>{user.lastLogin}</td><td>{user.registeredAt}</td><td><span className={`fl-admin-status ${user.status === "正常" ? "success" : "danger"}`}>{user.status}</span></td></tr>)}</tbody></table></div>{!candidates.length ? <div className="fl-reward-empty">暂无符合条件的用户</div> : null}<div className="fl-reward-add-footer"><span>已选 {selectedIds.size} 人</span><div><button className="fl-admin-secondary-button" type="button" onClick={() => setAdding(false)}>取消</button><button className="fl-admin-button" type="button" disabled={!selectedIds.size} onClick={addSelected}>添加</button></div></div></section></div> : null}
  </div>;
}
