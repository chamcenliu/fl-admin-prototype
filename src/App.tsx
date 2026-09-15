import { PrdDrawer } from "./components/prd/PrdDrawer";
import { VersionBadge } from "./components/version/VersionBadge";
import { currentVersion } from "./mockData/versions";
import { useIterations } from "./hooks/useIterations";
import { usePageTree } from "./hooks/usePageTree";
import { usePrdDrawer } from "./hooks/usePrdDrawer";
import { GlobalLayout } from "./layout/GlobalLayout";
import { IterationsModal } from "./pages/VersionsPage";
import { OrderApprovalPage } from "./pages/examples/OrderApprovalPage";
import { AdminPrototypePage } from "./pages/admin/AdminPrototypePage";
import { EmptyState } from "./components/ui/EmptyState";
import { findFirstPageId, findNode, findNodePath } from "./utils/pageTreeArchive";
import { useEffect, useMemo, useState } from "react";

function renderPage(activePageId: string, openPrdNote: (noteId: string) => void, onNavigate: (pageId: string) => void) {
  if (activePageId.startsWith("admin-")) return <AdminPrototypePage initialPageId={activePageId} onNavigate={onNavigate} onOpenPrd={openPrdNote} />;
  if (activePageId === "order-approval") return <OrderApprovalPage onOpenPrd={openPrdNote} />;

  return <EmptyState title="页面待生成" description="在左侧新建或选择页面后，可用同样的 PrdWrapper 模式继续扩展原型。" />;
}

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [prototypeFullscreen, setPrototypeFullscreen] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [iterationsOpen, setIterationsOpen] = useState(false);
  const pageTreeState = usePageTree();
  const iterationsState = useIterations(pageTreeState.tree);
  const prdDrawer = usePrdDrawer();
  const activeTree = useMemo(
    () => iterationsState.activeIteration?.pageTreeSnapshot?.length ? iterationsState.activeIteration.pageTreeSnapshot : pageTreeState.tree,
    [iterationsState.activeIteration, pageTreeState.tree]
  );
  const activePage = useMemo(() => findNode(activeTree, pageTreeState.activePageId), [activeTree, pageTreeState.activePageId]);
  const activePath = useMemo(() => findNodePath(activeTree, pageTreeState.activePageId), [activeTree, pageTreeState.activePageId]);
  const activeTreeDefaultPageId = useMemo(() => findFirstPageId(activeTree), [activeTree]);
  const activeTreePageExists = (pageId: string) => findNode(activeTree, pageId)?.type === "page";

  useEffect(() => {
    const readPageFromHash = () => {
      const pageId = window.location.hash.replace("#/", "");
      if (pageId && activeTreePageExists(pageId)) {
        pageTreeState.setActivePageId(pageId);
        return;
      }

      if (pageId && activeTreeDefaultPageId) {
        window.location.hash = `/${activeTreeDefaultPageId}`;
      }
    };

    readPageFromHash();
    window.addEventListener("hashchange", readPageFromHash);
    return () => window.removeEventListener("hashchange", readPageFromHash);
  }, [activeTree, activeTreeDefaultPageId, pageTreeState]);

  useEffect(() => {
    if (!activeTreeDefaultPageId || activeTreePageExists(pageTreeState.activePageId)) return;
    window.location.hash = `/${activeTreeDefaultPageId}`;
    pageTreeState.setActivePageId(activeTreeDefaultPageId);
  }, [activeTree, activeTreeDefaultPageId, pageTreeState]);

  function selectPage(pageId: string) {
    if (pageId === pageTreeState.activePageId || !activeTreePageExists(pageId)) return;
    window.location.hash = `/${pageId}`;
    pageTreeState.setActivePageId(pageId);
  }

  async function shareCurrentPage() {
    const url = `${window.location.origin}${window.location.pathname}#/${pageTreeState.activePageId}`;

    try {
      await navigator.clipboard.writeText(url);
      setShareStatus("已复制当前页面地址");
    } catch {
      setShareStatus(url);
    }

    window.setTimeout(() => setShareStatus(""), 2200);
  }

  return (
    <>
      <GlobalLayout
        tree={activeTree}
        activeTitle={activePage?.title}
        activePath={activePath}
        activePageId={pageTreeState.activePageId}
        collapsed={collapsed}
        prototypeFullscreen={prototypeFullscreen}
        shareStatus={shareStatus}
        onToggleSidebar={() => setCollapsed(value => !value)}
        onTogglePrototypeFullscreen={() => setPrototypeFullscreen(value => !value)}
        onBack={() => window.history.back()}
        onShareCurrentPage={shareCurrentPage}
        onCreateIteration={() => setIterationsOpen(true)}
        onCreateFolder={pageTreeState.createFolder}
        onRenameFolder={pageTreeState.renameFolder}
        onDeleteFolder={pageTreeState.deleteFolder}
        onSelectPage={selectPage}
        onReorder={pageTreeState.reorderNodes}
      >
        {renderPage(pageTreeState.activePageId, prdDrawer.openPrdNote, selectPage)}
      </GlobalLayout>

      <VersionBadge version={currentVersion} />
      <PrdDrawer note={prdDrawer.activeNote} onClose={prdDrawer.closePrdNote} />
      {iterationsOpen ? (
        <IterationsModal
          pageTree={pageTreeState.tree}
          iterations={iterationsState.iterations}
          activeIterationId={iterationsState.activeIterationId}
          onClose={() => setIterationsOpen(false)}
          onCreateIteration={iterationsState.createIteration}
          onUpdateIteration={iterationsState.updateIteration}
          onDeleteIteration={iterationsState.deleteIteration}
          onSwitchIteration={iterationsState.setActiveIterationId}
        />
      ) : null}
    </>
  );
}
