import { PrdDrawer } from "./components/prd/PrdDrawer";
import { VersionBadge } from "./components/version/VersionBadge";
import { currentVersion } from "./mockData/versions";
import { useIterations } from "./hooks/useIterations";
import { usePageTree } from "./hooks/usePageTree";
import { usePrdDrawer } from "./hooks/usePrdDrawer";
import { GlobalLayout } from "./layout/GlobalLayout";
import { IterationsModal } from "./pages/VersionsPage";
import { AdminPrototypePage } from "./pages/admin/AdminPrototypePage";
import { EmptyState } from "./components/ui/EmptyState";
import { filterPageTreeByPageIds, findFirstPageId } from "./utils/pageTreeArchive";
import { useEffect, useState } from "react";

const PROTOTYPE_FULLSCREEN_STORAGE_KEY = "prototype-as-prd:prototype-fullscreen";

function readPrototypeFullscreenPreference(): boolean {
  try {
    return window.localStorage.getItem(PROTOTYPE_FULLSCREEN_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function renderPage(activePageId: string, openPrdNote: (noteId: string) => void, onNavigate: (pageId: string) => void) {
  if (activePageId.startsWith("admin-")) return <AdminPrototypePage initialPageId={activePageId} onNavigate={onNavigate} onOpenPrd={openPrdNote} />;
  return <EmptyState title="页面待生成" description="在左侧新建或选择页面后，可用同样的 PrdWrapper 模式继续扩展原型。" />;
}

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [prototypeFullscreen, setPrototypeFullscreen] = useState(readPrototypeFullscreenPreference);
  const [shareStatus, setShareStatus] = useState("");
  const [iterationsOpen, setIterationsOpen] = useState(false);
  const pageTreeState = usePageTree();
  const iterationsState = useIterations(pageTreeState.tree);
  const prdDrawer = usePrdDrawer();
  // 页面收纳是原型交付框架的管理树，始终使用当前项目 live 页面树，不受迭代切换影响。
  const livePageTree = pageTreeState.tree;

  useEffect(() => {
    try {
      window.localStorage.setItem(PROTOTYPE_FULLSCREEN_STORAGE_KEY, String(prototypeFullscreen));
    } catch {
      // 本地存储不可用时仍保留当前会话内的模式切换能力。
    }
  }, [prototypeFullscreen]);

  useEffect(() => {
    const readPageFromHash = () => {
      const pageId = window.location.hash.replace("#/", "");
      if (pageId && pageTreeState.pageExists(pageId)) {
        pageTreeState.setActivePageId(pageId);
        return;
      }

      if (pageId && pageTreeState.defaultPageId) {
        window.location.hash = `/${pageTreeState.defaultPageId}`;
      }
    };

    readPageFromHash();
    window.addEventListener("hashchange", readPageFromHash);
    return () => window.removeEventListener("hashchange", readPageFromHash);
  }, [pageTreeState]);

  function selectPage(pageId: string) {
    if (pageId === pageTreeState.activePageId || !pageTreeState.pageExists(pageId)) return;
    window.location.hash = `/${pageId}`;
    pageTreeState.setActivePageId(pageId);
  }

  function switchIteration(iterationId: string) {
    const targetIteration = iterationsState.iterations.find(item => item.id === iterationId);
    const targetTree = targetIteration?.pageTreeSnapshot?.length
      ? targetIteration.pageTreeSnapshot
      : filterPageTreeByPageIds(livePageTree, targetIteration?.pageIds || []);
    const nextPageId = findFirstPageId(targetTree);

    iterationsState.setActiveIterationId(iterationId);
    if (nextPageId && pageTreeState.pageExists(nextPageId)) {
      window.location.hash = `/${nextPageId}`;
      pageTreeState.setActivePageId(nextPageId);
    }
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
        tree={livePageTree}
        activeTitle={pageTreeState.activePage?.title}
        activePath={pageTreeState.activePath}
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
          pageTree={livePageTree}
          iterations={iterationsState.iterations}
          activeIterationId={iterationsState.activeIterationId}
          onClose={() => setIterationsOpen(false)}
          onCreateIteration={iterationsState.createIteration}
          onUpdateIteration={iterationsState.updateIteration}
          onDeleteIteration={iterationsState.deleteIteration}
          onSwitchIteration={switchIteration}
        />
      ) : null}
    </>
  );
}
