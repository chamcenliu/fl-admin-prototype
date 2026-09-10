import { useMemo, useState } from "react";
import { pageTree as initialPageTree } from "../mockData/pageTree";
import type { PageNode } from "../types/page";

function cloneTree(tree: PageNode[]): PageNode[] {
  return tree.map(node => ({ ...node, children: node.children ? cloneTree(node.children) : undefined }));
}

function findNode(tree: PageNode[], nodeId: string): PageNode | undefined {
  for (const node of tree) {
    if (node.id === nodeId) return node;
    const child = node.children ? findNode(node.children, nodeId) : undefined;
    if (child) return child;
  }
  return undefined;
}

function reorderWithinSiblings(tree: PageNode[], draggedId: string, targetId: string) {
  for (const node of tree) {
    const siblings = node.children;
    if (!siblings) continue;

    const fromIndex = siblings.findIndex(item => item.id === draggedId);
    const toIndex = siblings.findIndex(item => item.id === targetId);
    if (fromIndex >= 0 && toIndex >= 0) {
      const [moved] = siblings.splice(fromIndex, 1);
      siblings.splice(toIndex, 0, moved);
      return true;
    }

    if (reorderWithinSiblings(siblings, draggedId, targetId)) return true;
  }

  return false;
}

export function usePageTree() {
  const [tree, setTree] = useState<PageNode[]>(() => cloneTree(initialPageTree));
  const [activePageId, setActivePageId] = useState("dashboard");

  const activePage = useMemo(() => findNode(tree, activePageId), [tree, activePageId]);

  function createFolder() {
    setTree(current => [
      ...current,
      {
        id: `folder-${Date.now()}`,
        title: "新建文件夹",
        type: "folder",
        children: []
      }
    ]);
  }

  function reorderPages(draggedId: string, targetId: string) {
    if (draggedId === targetId) return;
    setTree(current => {
      const next = cloneTree(current);
      reorderWithinSiblings(next, draggedId, targetId);
      return next;
    });
  }

  return { tree, activePage, activePageId, setActivePageId, createFolder, reorderPages };
}
