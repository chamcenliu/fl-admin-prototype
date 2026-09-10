import { dashboardStats, navGroups, pageDefinitions, recentTasks, userManagementRows } from "./data.js";

const app = document.querySelector("#app");
const state = {
  page: location.hash.replace("#/", "") || "dashboard",
  search: "",
  filter: "全部状态",
  selected: new Set(),
  users: userManagementRows.map(user => ({ ...user, tags: [...user.tags], contacts: [...user.contacts] })),
  userSearchDraft: "",
  userSearch: "",
  userTagFilters: new Set(),
  userSort: "recent",
  userDateStart: "2020-10-23",
  userDateEnd: "2020-11-21",
  userDateActive: false,
  userPage: 1,
  collapsed: false,
  loggedIn: sessionStorage.getItem("fl-admin-session") !== "signed-out"
};

const icons = { search: "⌕", bell: "◉", chevron: "›", plus: "+", more: "•••", close: "×" };

function esc(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

function currentMeta() {
  for (const group of navGroups) {
    const page = group.pages.find(item => item.id === state.page);
    if (page) return { ...page, group: group.label };
  }
  return { id: "dashboard", label: "首页", group: "概览" };
}

function statusClass(value) {
  if (/正常|上线|完成|进行中|启用|发布|已定位/.test(value)) return "success";
  if (/待|即将|关注|未生效/.test(value)) return "warning";
  if (/异常|冻结|封停|封禁|关闭|停用/.test(value)) return "danger";
  return "neutral";
}

function renderLogin() {
  app.innerHTML = `
    <main class="login-shell">
      <section class="login-panel" aria-labelledby="login-title">
        <div class="login-brand"><span class="brand-mark">F</span><span>Freelog <b>Admin</b></span></div>
        <p class="login-kicker">管理控制台</p>
        <h1 id="login-title">欢迎回来</h1>
        <p class="login-copy">登录后进入 Freelog 产品管理后台。</p>
        <form id="login-form" class="login-form">
          <label>账号<input name="account" autocomplete="username" value="admin@freelog.com" required /></label>
          <label>密码<input name="password" type="password" autocomplete="current-password" value="prototype" required /></label>
          <div class="login-options"><label class="check"><input type="checkbox" checked /> 保持登录</label><button type="button" class="text-button">忘记密码</button></div>
          <button class="primary-button login-button" type="submit">登录管理后台</button>
        </form>
        <p class="prototype-note">交互原型：填写任意账号与密码即可登录</p>
      </section>
      <aside class="login-art" aria-label="Freelog Admin"><div class="art-grid"></div><div class="art-card"><span>PLATFORM STATUS</span><strong>服务运行正常</strong><i></i></div></aside>
    </main>`;
  document.querySelector("#login-form").addEventListener("submit", event => {
    event.preventDefault();
    sessionStorage.setItem("fl-admin-session", "active");
    state.loggedIn = true;
    render();
  });
}

function navTemplate() {
  return navGroups.map(group => `
    <section class="nav-group ${group.pages.some(page => page.id === state.page) ? "open" : ""}">
      <button class="nav-group-title" type="button" data-toggle-group>
        <span class="nav-icon">${group.icon}</span><span class="nav-label">${group.label}</span><span class="nav-caret">⌄</span>
      </button>
      <div class="nav-pages">
        ${group.pages.map(page => `<a href="#/${page.id}" class="nav-link ${state.page === page.id ? "active" : ""}" title="${page.label}"><span>${page.label}</span>${state.page === page.id ? `<b>${icons.chevron}</b>` : ""}</a>`).join("")}
      </div>
    </section>`).join("");
}

function shell(content) {
  const meta = currentMeta();
  return `
    <div class="admin-shell ${state.collapsed ? "sidebar-collapsed" : ""}">
      <aside class="sidebar">
        <div class="brand"><span class="brand-mark">F</span><span class="brand-name">Freelog <b>Admin</b></span></div>
        <nav aria-label="后台导航">${navTemplate()}</nav>
        <button class="sidebar-toggle" id="sidebar-toggle" type="button" aria-label="${state.collapsed ? "展开" : "收起"}导航">${state.collapsed ? "»" : "«"}</button>
        <div class="sidebar-footer"><span class="avatar small">AD</span><span class="nav-label"><strong>Admin</strong><small>超级管理员</small></span></div>
      </aside>
      <section class="workspace">
        <header class="topbar">
          <div class="breadcrumb"><span>${meta.group}</span><b>/</b><strong>${meta.label}</strong></div>
          <div class="top-actions">
            <button class="icon-button" type="button" aria-label="通知"><span>${icons.bell}</span><i>3</i></button>
            <button class="profile-button" type="button"><span class="avatar">AD</span><span>Admin</span><b>⌄</b></button>
            <button class="text-button logout" id="logout" type="button">退出登录</button>
          </div>
        </header>
        <main class="content">${content}</main>
      </section>
    </div>
    <div id="modal-root"></div><div id="toast-root" aria-live="polite"></div>`;
}

function renderDashboard() {
  const stats = dashboardStats.map(item => `<article class="stat-card ${item.tone}"><div><span>${item.label}</span><strong>${item.value}</strong></div><em>${item.delta}</em></article>`).join("");
  const taskRows = recentTasks.map((row, index) => `<tr>${row.map((cell, i) => `<td>${i === row.length - 1 ? `<span class="status ${statusClass(cell)}">${cell}</span>` : esc(cell)}</td>`).join("")}<td><button class="table-action" data-detail="${index}">处理</button></td></tr>`).join("");
  return `
    <div class="page-heading"><div><span class="eyebrow">管理概览</span><h1>首页</h1><p>查看平台重点指标和当前待办。</p></div><div class="date-chip">2026 年 9 月 9 日 · 周三</div></div>
    <section class="stats-grid">${stats}</section>
    <section class="dashboard-grid">
      <article class="panel trend-panel">
        <div class="panel-heading"><div><h2>近 7 日业务趋势</h2><p>新增用户与交易金额</p></div><select aria-label="趋势时间范围"><option>近 7 日</option><option>近 30 日</option></select></div>
        <div class="legend"><span><i class="legend-users"></i>新增用户</span><span><i class="legend-sales"></i>交易金额</span></div>
        <div class="chart" aria-label="业务趋势图">
          <div class="chart-y"><span>240</span><span>180</span><span>120</span><span>60</span><span>0</span></div>
          <div class="chart-bars">${[54, 67, 48, 78, 72, 88, 64].map((height, i) => `<div><i style="--h:${height}%"></i><b style="--h:${Math.max(24, height - 18)}%"></b><span>${["03", "04", "05", "06", "07", "08", "09"][i]} 日</span></div>`).join("")}</div>
        </div>
      </article>
      <article class="panel distribution-panel"><div class="panel-heading"><div><h2>内容分布</h2><p>当前在线资源</p></div><button class="more-button">${icons.more}</button></div><div class="donut-wrap"><div class="donut"><div><strong>12,860</strong><span>资源总量</span></div></div><ul><li><i class="dot blue"></i><span>图片 / 插画</span><b>42%</b></li><li><i class="dot green"></i><span>音频</span><b>28%</b></li><li><i class="dot violet"></i><span>文章</span><b>18%</b></li><li><i class="dot amber"></i><span>其他</span><b>12%</b></li></ul></div></article>
    </section>
    <section class="panel task-panel"><div class="panel-heading"><div><h2>待办事项</h2><p>按更新时间排序</p></div><button class="secondary-button" data-page="version-review">查看全部</button></div><div class="table-wrap"><table><thead><tr><th>类型</th><th>事项</th><th>来源</th><th>更新时间</th><th>状态</th><th>操作</th></tr></thead><tbody>${taskRows}</tbody></table></div></section>`;
}

function renderListPage(def, meta) {
  const needle = state.search.toLowerCase();
  const rows = def.rows.filter(row => (!needle || row.some(cell => String(cell).toLowerCase().includes(needle))) && (state.filter.startsWith("全部") || row.some(cell => String(cell) === state.filter)));
  return `
    <div class="page-heading"><div><span class="eyebrow">${def.eyebrow}</span><h1>${meta.label}</h1><p>管理和维护${meta.label.replace("管理", "")}相关数据。</p></div><button class="primary-button" id="create-item">${icons.plus} ${def.primary}</button></div>
    <section class="panel list-panel">
      <div class="toolbar">
        <label class="search-box"><span>${icons.search}</span><input id="search" value="${esc(state.search)}" placeholder="搜索名称、编号或用户" /></label>
        <select id="status-filter" aria-label="状态筛选">${def.filters.map(value => `<option ${value === state.filter ? "selected" : ""}>${value}</option>`).join("")}</select>
        <button class="secondary-button" id="date-filter">创建时间</button>
        <button class="secondary-button" id="reset-filter">重置</button>
        <span class="toolbar-result">共 ${rows.length * 9 + 2} 条</span>
      </div>
      ${state.selected.size ? `<div class="batch-bar"><span>已选择 ${state.selected.size} 项</span><button data-batch="enable">批量启用</button><button data-batch="export">导出所选</button><button data-batch="delete" class="danger-text">删除</button></div>` : ""}
      <div class="table-wrap"><table><thead><tr><th class="checkbox-cell"><input id="select-all" type="checkbox" ${rows.length && rows.every((_, i) => state.selected.has(i)) ? "checked" : ""} aria-label="全选" /></th>${def.columns.map(column => `<th>${column}</th>`).join("")}<th class="action-column">操作</th></tr></thead>
      <tbody>${rows.length ? rows.map((row, index) => `<tr class="${state.selected.has(index) ? "selected-row" : ""}"><td class="checkbox-cell"><input type="checkbox" data-select="${index}" ${state.selected.has(index) ? "checked" : ""} aria-label="选择第 ${index + 1} 行" /></td>${row.map((cell, cellIndex) => `<td>${cellIndex === row.length - 1 ? `<span class="status ${statusClass(cell)}">${esc(cell)}</span>` : cellIndex === 0 ? `<button class="record-link" data-detail="${index}">${esc(cell)}</button>` : esc(cell)}</td>`).join("")}<td class="row-actions"><button data-edit="${index}">编辑</button><button data-more="${index}">${icons.more}</button></td></tr>`).join("") : `<tr><td colspan="${def.columns.length + 2}"><div class="empty-state"><b>⌕</b><strong>没有匹配的数据</strong><span>调整搜索内容或筛选条件后重试。</span><button class="secondary-button" id="empty-reset">清除筛选</button></div></td></tr>`}</tbody></table></div>
      <footer class="pagination"><span>1–${Math.min(10, Math.max(rows.length, 1))} / ${rows.length * 9 + 2}</span><div><button disabled>‹</button><button class="active">1</button><button>2</button><button>3</button><button>4</button><button>›</button></div><label>跳至 <input value="1" aria-label="页码" /> 页</label></footer>
    </section>`;
}

const userTagOptions = ["小说", "测试", "节点商", "资源作者", "消费者"];

function filteredUsers() {
  const needle = state.userSearch.trim().toLowerCase();
  const activeTags = [...state.userTagFilters];
  const rows = state.users.filter(user => {
    const matchesSearch = !needle || [user.name, ...user.contacts].some(value => value.toLowerCase().includes(needle));
    const matchesTags = !activeTags.length || activeTags.every(tag => user.tags.includes(tag));
    const matchesDate = !state.userDateActive || (user.registeredAt >= state.userDateStart && user.registeredAt <= state.userDateEnd);
    return matchesSearch && matchesTags && matchesDate;
  });
  const sortKey = { resources: "resources", exhibits: "nodes", contracts: "contracts" }[state.userSort];
  return sortKey ? [...rows].sort((a, b) => b[sortKey] - a[sortKey]) : rows;
}

function renderUserTags(user) {
  return `<div class="user-name"><button class="record-link" data-user-detail="${user.id}">${esc(user.name)}</button><div class="user-tags">${user.tags.map(tag => `<span>${esc(tag)}<button type="button" data-remove-tag="${user.id}" data-tag="${esc(tag)}" aria-label="移除${esc(tag)}标签">×</button></span>`).join("")}<button class="add-tag-link" type="button" data-add-tags="${user.id}">+标签</button></div></div>`;
}

function renderUserActions(user) {
  if (user.status === "冻结") return `<button data-freeze-detail="${user.id}">详情</button><button data-restore-user="${user.id}">恢复</button>`;
  if (user.status === "待审核") return `<button data-review-user="${user.id}">审核</button>`;
  return `<button data-freeze-user="${user.id}">冻结</button>`;
}

function renderUsersPage() {
  const rows = filteredUsers();
  const visibleIds = rows.map(user => user.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every(id => state.selected.has(id));
  const start = state.userPage === 1 ? 1 : (state.userPage - 1) * 10 + 1;
  const end = state.userPage === 4 ? 38 : state.userPage * 10;
  const dateLabel = `${state.userDateStart.replaceAll("-", "/")} - ${state.userDateEnd.replaceAll("-", "/")}`;
  return `
    <div class="page-heading users-heading"><div><span class="eyebrow">用户中心</span><h1>用户管理</h1><p>查询用户资料并处理标签、审核和账号状态。</p></div></div>
    <section class="panel user-panel">
      ${state.selected.size ? `
        <div class="user-selection-bar"><strong>已选择 ${state.selected.size} 个用户</strong><button class="primary-button" id="batch-add-tags" type="button">添加标签</button><button class="text-button" id="clear-user-selection" type="button">取消选择</button></div>` : `
        <div class="user-filter-bar">
          <div class="tag-filter-group"><span>标签：</span>${["消费者", "节点商", "小说", "测试"].map(tag => `<button type="button" class="filter-chip ${state.userTagFilters.has(tag) ? "active" : ""}" data-filter-tag="${tag}">${tag}</button>`).join("")}<button class="manage-tags" id="manage-user-tags" type="button">⚙ 管理标签</button></div>
          <div class="date-filter-group"><span>注册时间：</span><button class="date-range-button ${state.userDateActive ? "active" : ""}" id="user-date-filter" type="button">${dateLabel}<b>▾</b></button></div>
        </div>`}
      <div class="user-search-bar">
        <label class="search-box user-search"><span>${icons.search}</span><input id="user-search" value="${esc(state.userSearchDraft)}" placeholder="请输入用户名、注册邮箱/手机号进行搜索" /></label>
        <button class="primary-button" id="user-search-button" type="button">搜索</button>
        ${(state.userSearch || state.userTagFilters.size || state.userDateActive) ? `<button class="secondary-button" id="reset-user-filters" type="button">重置</button>` : ""}
        <label class="user-sort-label">排序：<select id="user-sort" aria-label="用户排序"><option value="recent" ${state.userSort === "recent" ? "selected" : ""}>最近注册</option><option value="resources" ${state.userSort === "resources" ? "selected" : ""}>资源发布最多</option><option value="exhibits" ${state.userSort === "exhibits" ? "selected" : ""}>展品发布最多</option><option value="contracts" ${state.userSort === "contracts" ? "selected" : ""}>消费合约最多</option></select></label>
      </div>
      <div class="table-wrap user-table-wrap"><table class="user-table"><thead><tr><th class="checkbox-cell"><input id="select-all-users" type="checkbox" ${allSelected ? "checked" : ""} aria-label="全选用户" /></th><th>用户</th><th>最近登录</th><th>发布资源数</th><th>运营节点数</th><th>消费合约数</th><th>交易次数</th><th>代币余额</th><th>注册手机号/邮箱</th><th>注册时间</th><th>账号状态</th><th class="action-column">操作</th></tr></thead>
      <tbody>${rows.length ? rows.map(user => `<tr class="${state.selected.has(user.id) ? "selected-row" : ""}"><td class="checkbox-cell"><input type="checkbox" data-select-user="${user.id}" ${state.selected.has(user.id) ? "checked" : ""} aria-label="选择用户 ${esc(user.name)}" /></td><td>${renderUserTags(user)}</td><td>${esc(user.lastLogin)}</td><td>${user.resources}</td><td>${user.nodes}</td><td>${user.contracts}</td><td>${user.trades}</td><td>${user.balance.toLocaleString("zh-CN")}</td><td><div class="contact-list">${user.contacts.map(contact => `<span>${esc(contact)}<button type="button" data-copy="${esc(contact)}">复制</button></span>`).join("")}</div></td><td>${user.registeredAt}</td><td><span class="status ${statusClass(user.status)}">${user.status}</span></td><td class="row-actions user-row-actions">${renderUserActions(user)}</td></tr>`).join("") : `<tr><td colspan="12"><div class="empty-state"><b>⌕</b><strong>没有匹配的用户</strong><span>调整用户名、标签或注册时间后重试。</span><button class="secondary-button" id="empty-user-reset" type="button">清除筛选</button></div></td></tr>`}</tbody></table></div>
      <footer class="user-pagination"><span>${start}- ${end} of 38</span><div class="page-stepper"><button id="user-prev-page" type="button" ${state.userPage === 1 ? "disabled" : ""} aria-label="上一页">‹</button><strong>${state.userPage} / 4</strong><button id="user-next-page" type="button" ${state.userPage === 4 ? "disabled" : ""} aria-label="下一页">›</button></div><label><input id="user-page-input" type="number" min="1" max="4" value="${state.userPage}" aria-label="页码" /><button class="secondary-button" id="user-page-go" type="button">Go</button></label></footer>
    </section>`;
}

function renderForm(meta, mode = "create") {
  const noun = meta.label.replace("管理", "");
  return `
    <div class="page-heading"><div><button class="back-button" id="back-to-list">← 返回${meta.label}</button><span class="eyebrow">${meta.group}</span><h1>${mode === "edit" ? "编辑" : "新建"}${noun}</h1><p>带 <b class="required">*</b> 的字段为必填项。</p></div></div>
    <form class="panel edit-form" id="edit-form">
      <section><h2>基本信息</h2><div class="form-grid">
        <label><span>${noun}名称 <b class="required">*</b></span><input name="name" required placeholder="请输入${noun}名称" value="${mode === "edit" ? `示例${noun} A` : ""}" /><small>名称将用于管理列表和检索。</small></label>
        <label><span>业务编号</span><input name="code" value="${mode === "edit" ? "FL-20260909001" : ""}" placeholder="保存后自动生成" disabled /></label>
        <label><span>所属分类 <b class="required">*</b></span><select name="category" required><option value="">请选择分类</option><option selected>内容管理</option><option>用户运营</option><option>平台规则</option></select></label>
        <label><span>状态</span><div class="segmented"><button class="active" type="button">启用</button><button type="button">停用</button></div></label>
        <label class="full"><span>说明</span><textarea name="description" rows="5" placeholder="请输入说明，最多 500 字">${mode === "edit" ? "用于演示后台原型中的编辑流程。" : ""}</textarea><small class="count">0 / 500</small></label>
      </div></section>
      <section><h2>生效设置</h2><div class="form-grid"><label><span>开始时间</span><input type="datetime-local" value="2026-09-09T09:00" /></label><label><span>结束时间</span><input type="datetime-local" /></label><label class="full"><span>标签</span><div class="tag-input"><span>平台运营 ${icons.close}</span><span>内容管理 ${icons.close}</span><input placeholder="输入后按回车添加" /></div></label></div></section>
      <footer class="form-actions"><button type="button" class="secondary-button" id="cancel-form">取消</button><button type="submit" class="primary-button">保存</button></footer>
    </form>`;
}

function showModal({ title, body, confirm = "确认", danger = false, onConfirm }) {
  const root = document.querySelector("#modal-root");
  root.innerHTML = `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" aria-label="关闭">${icons.close}</button><div class="modal-icon ${danger ? "danger" : ""}">${danger ? "!" : "i"}</div><h2 id="modal-title">${title}</h2><p>${body}</p><footer><button class="secondary-button modal-cancel">取消</button><button class="${danger ? "danger-button" : "primary-button"} modal-confirm">${confirm}</button></footer></section></div>`;
  const close = () => root.replaceChildren();
  root.querySelector(".modal-close").onclick = close;
  root.querySelector(".modal-cancel").onclick = close;
  root.querySelector(".modal-backdrop").onclick = event => { if (event.target === event.currentTarget) close(); };
  root.querySelector(".modal-confirm").onclick = () => { close(); onConfirm?.(); };
}

function showUserDialog({ title, content, confirm = "确认", danger = false, wide = false, onConfirm, onOpen }) {
  const root = document.querySelector("#modal-root");
  root.innerHTML = `<div class="modal-backdrop"><section class="modal user-dialog ${wide ? "wide" : ""}" role="dialog" aria-modal="true" aria-labelledby="user-dialog-title"><button class="modal-close" type="button" aria-label="关闭">${icons.close}</button><h2 id="user-dialog-title">${title}</h2><div class="user-dialog-content">${content}</div><footer><button class="secondary-button modal-cancel" type="button">取消</button><button class="${danger ? "danger-button" : "primary-button"} modal-confirm" type="button">${confirm}</button></footer></section></div>`;
  const dialog = root.querySelector(".user-dialog");
  const close = () => root.replaceChildren();
  root.querySelector(".modal-close").onclick = close;
  root.querySelector(".modal-cancel").onclick = close;
  root.querySelector(".modal-backdrop").onclick = event => { if (event.target === event.currentTarget) close(); };
  root.querySelector(".modal-confirm").onclick = () => { if (onConfirm?.(dialog) !== false) close(); };
  onOpen?.(dialog, close);
}

function openAddTagsDialog(userIds) {
  const selectedUsers = state.users.filter(user => userIds.includes(user.id));
  const existingTags = new Set(selectedUsers.flatMap(user => user.tags));
  showUserDialog({
    title: "添加标签",
    content: `<p>为${selectedUsers.length > 1 ? `已选择的 ${selectedUsers.length} 个用户` : `用户 ${esc(selectedUsers[0]?.name || "")}`}添加标签。</p><div class="tag-choice-list">${userTagOptions.map(tag => `<label class="tag-choice"><input type="checkbox" name="user-tag" value="${tag}" ${existingTags.has(tag) ? "checked" : ""} /><span>${tag}</span></label>`).join("")}</div>`,
    onConfirm(dialog) {
      const tags = [...dialog.querySelectorAll('input[name="user-tag"]:checked')].map(input => input.value);
      selectedUsers.forEach(user => { user.tags = [...new Set([...user.tags, ...tags])]; });
      state.selected.clear();
      render();
      toast("标签已添加");
    }
  });
}

function openFreezeDialog(userId) {
  const user = state.users.find(item => item.id === userId);
  if (!user) return;
  const reasons = ["抄袭、侵权", "垃圾广告", "色情、暴力", "不实信息", "欺诈", "恶意操作"];
  showUserDialog({
    title: "冻结账户",
    confirm: "冻结",
    danger: true,
    content: `<p>冻结后，${esc(user.name)} 将无法继续使用该账号。</p><fieldset class="reason-list"><legend>冻结原因</legend>${reasons.map((reason, index) => `<label><input type="radio" name="freeze-reason" value="${reason}" ${index === 0 ? "checked" : ""} />${reason}</label>`).join("")}</fieldset><label class="dialog-field"><span>备注</span><textarea id="freeze-note" rows="3" placeholder="添加备注（选填）"></textarea></label>`,
    onConfirm(dialog) {
      const reason = dialog.querySelector('input[name="freeze-reason"]:checked')?.value;
      const note = dialog.querySelector("#freeze-note").value.trim();
      user.status = "冻结";
      user.freezeReason = note ? `${reason}：${note}` : reason;
      render();
      toast(`${user.name} 已冻结`);
    }
  });
}

function openRestoreDialog(userId) {
  const user = state.users.find(item => item.id === userId);
  if (!user) return;
  showUserDialog({
    title: "恢复账户",
    confirm: "恢复",
    content: `<p>确认要恢复该账号的使用吗？</p><div class="dialog-user-line"><strong>${esc(user.name)}</strong><span>当前状态：冻结</span></div>`,
    onConfirm() {
      user.status = "正常";
      user.freezeReason = "";
      render();
      toast(`${user.name} 已恢复`);
    }
  });
}

function openReviewDialog(userId) {
  const user = state.users.find(item => item.id === userId);
  if (!user) return;
  showUserDialog({
    title: "审核用户",
    confirm: "确认审核",
    content: `<p>请选择 ${esc(user.name)} 的审核结果。</p><div class="review-choices"><label><input type="radio" name="review-result" value="正常" checked /><span><strong>通过审核</strong><small>账号状态改为正常</small></span></label><label><input type="radio" name="review-result" value="冻结" /><span><strong>拒绝申请</strong><small>账号将被冻结</small></span></label></div>`,
    onConfirm(dialog) {
      user.status = dialog.querySelector('input[name="review-result"]:checked').value;
      user.freezeReason = user.status === "冻结" ? "审核未通过" : "";
      render();
      toast(`${user.name} 审核完成`);
    }
  });
}

function openDateDialog() {
  showUserDialog({
    title: "设置注册时间",
    confirm: "应用",
    content: `<p>选择用户注册日期范围。</p><div class="date-dialog-grid"><label><span>开始日期</span><input id="user-date-start" type="date" value="${state.userDateStart}" /></label><i>至</i><label><span>结束日期</span><input id="user-date-end" type="date" value="${state.userDateEnd}" /></label></div><button class="text-button clear-date-range" type="button">清除日期筛选</button><p class="dialog-error" role="alert"></p>`,
    onOpen(dialog, close) {
      dialog.querySelector(".clear-date-range").onclick = () => {
        state.userDateActive = false;
        state.userPage = 1;
        close();
        render();
      };
    },
    onConfirm(dialog) {
      const start = dialog.querySelector("#user-date-start").value;
      const end = dialog.querySelector("#user-date-end").value;
      if (!start || !end || start > end) {
        dialog.querySelector(".dialog-error").textContent = "请选择有效的开始和结束日期。";
        return false;
      }
      state.userDateStart = start;
      state.userDateEnd = end;
      state.userDateActive = true;
      state.userPage = 1;
      state.selected.clear();
      render();
    }
  });
}

function toast(message) {
  const root = document.querySelector("#toast-root");
  const item = document.createElement("div");
  item.className = "toast";
  item.innerHTML = `<b>✓</b><span>${esc(message)}</span>`;
  root.append(item);
  setTimeout(() => item.remove(), 2600);
}

function bindShell() {
  document.querySelector("#sidebar-toggle").onclick = () => { state.collapsed = !state.collapsed; render(); };
  document.querySelectorAll("[data-toggle-group]").forEach(button => button.onclick = () => button.closest(".nav-group").classList.toggle("open"));
  document.querySelector("#logout").onclick = () => showModal({ title: "退出登录？", body: "退出后需要重新登录才能进入管理后台。", confirm: "退出", onConfirm: () => { sessionStorage.setItem("fl-admin-session", "signed-out"); state.loggedIn = false; render(); } });
  document.querySelectorAll("[data-page]").forEach(button => button.onclick = () => { location.hash = `#/${button.dataset.page}`; });
}

function bindDashboard() {
  document.querySelectorAll("[data-detail]").forEach(button => button.onclick = () => toast("已打开待办详情"));
}

function bindForm(meta) {
  const goBack = () => { location.hash = `#/${meta.id}`; };
  document.querySelector("#back-to-list").onclick = goBack;
  document.querySelector("#cancel-form").onclick = goBack;
  document.querySelector("#edit-form").onsubmit = event => { event.preventDefault(); toast("保存成功"); setTimeout(goBack, 500); };
  document.querySelectorAll(".segmented button").forEach(button => button.onclick = () => { button.parentElement.querySelectorAll("button").forEach(item => item.classList.remove("active")); button.classList.add("active"); });
  const textarea = document.querySelector("textarea");
  const count = document.querySelector(".count");
  const updateCount = () => count.textContent = `${textarea.value.length} / 500`;
  textarea.oninput = updateCount;
  updateCount();
}

function bindUsersPage() {
  const searchInput = document.querySelector("#user-search");
  const commitSearch = () => {
    state.userSearchDraft = searchInput.value;
    state.userSearch = searchInput.value;
    state.userPage = 1;
    state.selected.clear();
    render();
  };
  searchInput.oninput = event => { state.userSearchDraft = event.target.value; };
  searchInput.onkeydown = event => { if (event.key === "Enter") commitSearch(); };
  document.querySelector("#user-search-button").onclick = commitSearch;
  document.querySelector("#user-sort").onchange = event => { state.userSort = event.target.value; state.userPage = 1; state.selected.clear(); render(); };
  document.querySelectorAll("[data-filter-tag]").forEach(button => button.onclick = () => {
    const tag = button.dataset.filterTag;
    state.userTagFilters.has(tag) ? state.userTagFilters.delete(tag) : state.userTagFilters.add(tag);
    state.userPage = 1;
    state.selected.clear();
    render();
  });
  document.querySelector("#manage-user-tags")?.addEventListener("click", () => { location.hash = "#/user-tags"; });
  document.querySelector("#user-date-filter")?.addEventListener("click", openDateDialog);
  const resetFilters = () => {
    state.userSearchDraft = "";
    state.userSearch = "";
    state.userTagFilters.clear();
    state.userDateActive = false;
    state.userSort = "recent";
    state.userPage = 1;
    state.selected.clear();
    render();
  };
  document.querySelector("#reset-user-filters")?.addEventListener("click", resetFilters);
  document.querySelector("#empty-user-reset")?.addEventListener("click", resetFilters);
  document.querySelector("#clear-user-selection")?.addEventListener("click", () => { state.selected.clear(); render(); });
  document.querySelector("#batch-add-tags")?.addEventListener("click", () => openAddTagsDialog([...state.selected]));
  document.querySelector("#select-all-users").onchange = event => {
    state.selected.clear();
    if (event.target.checked) filteredUsers().forEach(user => state.selected.add(user.id));
    render();
  };
  document.querySelectorAll("[data-select-user]").forEach(input => input.onchange = () => {
    input.checked ? state.selected.add(input.dataset.selectUser) : state.selected.delete(input.dataset.selectUser);
    render();
  });
  document.querySelectorAll("[data-add-tags]").forEach(button => button.onclick = () => openAddTagsDialog([button.dataset.addTags]));
  document.querySelectorAll("[data-remove-tag]").forEach(button => button.onclick = () => {
    const user = state.users.find(item => item.id === button.dataset.removeTag);
    if (!user) return;
    user.tags = user.tags.filter(tag => tag !== button.dataset.tag);
    render();
    toast("标签已移除");
  });
  document.querySelectorAll("[data-copy]").forEach(button => button.onclick = async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      toast("已复制到剪贴板");
    } catch {
      const helper = document.createElement("textarea");
      helper.value = button.dataset.copy;
      document.body.append(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
      toast("已复制到剪贴板");
    }
  });
  document.querySelectorAll("[data-freeze-user]").forEach(button => button.onclick = () => openFreezeDialog(button.dataset.freezeUser));
  document.querySelectorAll("[data-restore-user]").forEach(button => button.onclick = () => openRestoreDialog(button.dataset.restoreUser));
  document.querySelectorAll("[data-review-user]").forEach(button => button.onclick = () => openReviewDialog(button.dataset.reviewUser));
  document.querySelectorAll("[data-freeze-detail], [data-user-detail]").forEach(button => button.onclick = () => {
    const id = button.dataset.freezeDetail || button.dataset.userDetail;
    const user = state.users.find(item => item.id === id);
    showUserDialog({ title: user.status === "冻结" ? "冻结原因" : "用户详情", confirm: "知道了", content: user.status === "冻结" ? `<div class="freeze-detail"><strong>${esc(user.freezeReason || "未填写原因")}</strong><span>${esc(user.name)}</span></div>` : `<div class="user-summary"><strong>${esc(user.name)}</strong><span>${esc(user.contacts.join(" · "))}</span><span>注册时间：${user.registeredAt}</span><span>账号状态：${user.status}</span></div>` });
  });
  const goToPage = page => {
    state.userPage = Math.min(4, Math.max(1, Number(page) || 1));
    state.selected.clear();
    render();
    toast(`已切换至第 ${state.userPage} 页`);
  };
  document.querySelector("#user-prev-page").onclick = () => goToPage(state.userPage - 1);
  document.querySelector("#user-next-page").onclick = () => goToPage(state.userPage + 1);
  document.querySelector("#user-page-go").onclick = () => goToPage(document.querySelector("#user-page-input").value);
  document.querySelector("#user-page-input").onkeydown = event => { if (event.key === "Enter") goToPage(event.target.value); };
}

function bindList(def, meta) {
  document.querySelector("#search").addEventListener("input", event => { state.search = event.target.value; window.clearTimeout(window.searchTimer); window.searchTimer = window.setTimeout(render, 180); });
  document.querySelector("#status-filter").onchange = event => { state.filter = event.target.value; state.selected.clear(); render(); };
  const reset = () => { state.search = ""; state.filter = def.filters[0]; state.selected.clear(); render(); };
  document.querySelector("#reset-filter").onclick = reset;
  document.querySelector("#empty-reset")?.addEventListener("click", reset);
  document.querySelector("#date-filter").onclick = () => toast("时间范围筛选已展开");
  document.querySelector("#create-item").onclick = () => { location.hash = `#/${meta.id}/create`; };
  document.querySelector("#select-all").onchange = event => { state.selected.clear(); if (event.target.checked) def.rows.forEach((_, index) => state.selected.add(index)); render(); };
  document.querySelectorAll("[data-select]").forEach(input => input.onchange = () => { const index = Number(input.dataset.select); input.checked ? state.selected.add(index) : state.selected.delete(index); render(); });
  document.querySelectorAll("[data-edit]").forEach(button => button.onclick = () => { location.hash = `#/${meta.id}/edit`; });
  document.querySelectorAll("[data-detail]").forEach(button => button.onclick = () => toast("已打开详情面板"));
  document.querySelectorAll("[data-more]").forEach(button => button.onclick = () => showModal({ title: "操作当前条目", body: "可在正式产品中继续接入停用、归档或删除等业务动作。", confirm: "知道了" }));
  document.querySelectorAll("[data-batch]").forEach(button => button.onclick = () => {
    if (button.dataset.batch === "delete") showModal({ title: `删除 ${state.selected.size} 个条目？`, body: "删除后无法在原型中恢复。", confirm: "删除", danger: true, onConfirm: () => { state.selected.clear(); render(); toast("已删除所选条目"); } });
    else toast(button.dataset.batch === "export" ? "导出任务已创建" : "所选条目已启用");
  });
}

function render() {
  if (!state.loggedIn) return renderLogin();
  const route = state.page.split("/");
  const pageId = route[0];
  state.page = pageId;
  const meta = currentMeta();
  let content;
  if (route[1] === "create" || route[1] === "edit") content = renderForm(meta, route[1]);
  else if (pageId === "dashboard") content = renderDashboard();
  else if (pageId === "users") content = renderUsersPage();
  else content = renderListPage(pageDefinitions[pageId] || pageDefinitions.resources, meta);
  app.innerHTML = shell(content);
  bindShell();
  if (route[1]) bindForm(meta);
  else if (pageId === "dashboard") bindDashboard();
  else if (pageId === "users") bindUsersPage();
  else bindList(pageDefinitions[pageId] || pageDefinitions.resources, meta);
}

window.addEventListener("hashchange", () => {
  state.page = location.hash.replace("#/", "") || "dashboard";
  state.search = "";
  state.filter = "全部状态";
  state.selected.clear();
  if (state.page !== "users") {
    state.userSearchDraft = "";
    state.userSearch = "";
    state.userTagFilters.clear();
    state.userDateActive = false;
    state.userPage = 1;
  }
  render();
});

render();

function registerWebMcp() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const pageIds = navGroups.flatMap(group => group.pages.map(page => page.id));
  const lifecycle = new AbortController();
  const register = tool => Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {});

  register({
    name: "open_admin_page",
    title: "打开后台页面",
    description: "在 Freelog Admin 原型中打开一个指定的管理页面。",
    inputSchema: {
      type: "object",
      properties: { pageId: { type: "string", enum: pageIds } },
      required: ["pageId"],
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute(input) {
      if (!input || typeof input.pageId !== "string" || !pageIds.includes(input.pageId)) throw new Error("未知的后台页面");
      location.hash = `#/${input.pageId}`;
      return { pageId: input.pageId, status: "opened" };
    }
  });

  register({
    name: "filter_admin_records",
    title: "筛选后台记录",
    description: "在当前后台列表中设置搜索词和状态筛选，并更新可见结果。",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        status: { type: "string" }
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute(input) {
      if (!input || (input.query !== undefined && typeof input.query !== "string") || (input.status !== undefined && typeof input.status !== "string")) throw new Error("筛选参数格式错误");
      if (state.page === "dashboard" || !pageDefinitions[state.page]) throw new Error("当前页面不是可筛选的列表");
      if (state.page === "users") {
        state.userSearchDraft = input.query || "";
        state.userSearch = input.query || "";
        state.userPage = 1;
        state.selected.clear();
        render();
        return { pageId: state.page, query: state.userSearch };
      }
      state.search = input.query || "";
      state.filter = input.status || pageDefinitions[state.page].filters[0];
      state.selected.clear();
      render();
      return { pageId: state.page, query: state.search, status: state.filter };
    }
  });
}

registerWebMcp();
