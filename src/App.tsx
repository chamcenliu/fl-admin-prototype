import { PrdDrawer } from "./components/prd/PrdDrawer";
import { VersionBadge } from "./components/version/VersionBadge";
import { currentVersion } from "./mockData/versions";
import { usePageTree } from "./hooks/usePageTree";
import { usePrdDrawer } from "./hooks/usePrdDrawer";
import { GlobalLayout } from "./layout/GlobalLayout";
import { Dashboard } from "./pages/Dashboard";
import { VersionsPage } from "./pages/VersionsPage";
import { OrderApprovalPage } from "./pages/examples/OrderApprovalPage";
import { EmptyState } from "./components/ui/EmptyState";
import { useState } from "react";

function renderPage(activePageId: string, openPrdNote: (noteId: string) => void, setActivePageId: (pageId: string) => void) {
  if (activePageId === "dashboard") return <Dashboard onOpenPage={setActivePageId} />;
  if (activePageId === "versions") return <VersionsPage />;
  if (activePageId === "order-approval") return <OrderApprovalPage onOpenPrd={openPrdNote} />;

  return <EmptyState title="页面待生成" description="在左侧新建或选择页面后，可用同样的 PrdWrapper 模式继续扩展原型。" />;
}

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const pageTreeState = usePageTree();
  const prdDrawer = usePrdDrawer();

  return (
    <>
      <GlobalLayout
        tree={pageTreeState.tree}
        activeTitle={pageTreeState.activePage?.title}
        activePageId={pageTreeState.activePageId}
        collapsed={collapsed}
        onToggleSidebar={() => setCollapsed(value => !value)}
        onCreateFolder={pageTreeState.createFolder}
        onSelectPage={pageTreeState.setActivePageId}
        onReorder={pageTreeState.reorderPages}
      >
        {renderPage(pageTreeState.activePageId, prdDrawer.openPrdNote, pageTreeState.setActivePageId)}
      </GlobalLayout>

      <VersionBadge version={currentVersion} />
      <PrdDrawer note={prdDrawer.activeNote} onClose={prdDrawer.closePrdNote} />
    </>
  );
}
