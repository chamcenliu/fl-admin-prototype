import { dashboardStats, navGroups, pageDefinitions, recentTasks } from "./data.js";

const app = document.querySelector("#app");
const state = {
  page: location.hash.replace("#/", "") || "dashboard",
  search: "",
  filter: "全部状态",
  selected: new Set(),
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
  else content = renderListPage(pageDefinitions[pageId] || pageDefinitions.resources, meta);
  app.innerHTML = shell(content);
  bindShell();
  if (route[1]) bindForm(meta);
  else if (pageId === "dashboard") bindDashboard();
  else bindList(pageDefinitions[pageId] || pageDefinitions.resources, meta);
}

window.addEventListener("hashchange", () => {
  state.page = location.hash.replace("#/", "") || "dashboard";
  state.search = "";
  state.filter = "全部状态";
  state.selected.clear();
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
      state.search = input.query || "";
      state.filter = input.status || pageDefinitions[state.page].filters[0];
      state.selected.clear();
      render();
      return { pageId: state.page, query: state.search, status: state.filter };
    }
  });
}

registerWebMcp();
