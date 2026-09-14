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

function findFirstPageId(tree: PageNode[]): string {
  for (const node of tree) {
    if (node.type === "page") return node.id;
    const childPageId = node.children ? findFirstPageId(node.children) : "";
    if (childPageId) return childPageId;
  }

  return "";
}

function findNodePath(tree: PageNode[], nodeId: string, parents: PageNode[] = []): PageNode[] {
  for (const node of tree) {
    const path = [...parents, node];
    if (node.id === nodeId) return path;

    const childPath = node.children ? findNodePath(node.children, nodeId, path) : [];
    if (childPath.length) return childPath;
  }

  return [];
}

function containsNode(node: PageNode, nodeId: string): boolean {
  if (node.id === nodeId) return true;
  return node.children?.some(child => containsNode(child, nodeId)) ?? false;
}

function reorderWithinSiblings(nodes: PageNode[], draggedId: string, targetId: string) {
  const fromIndex = nodes.findIndex(item => item.id === draggedId);
  const toIndex = nodes.findIndex(item => item.id === targetId);
  if (fromIndex >= 0 && toIndex >= 0) {
    const [moved] = nodes.splice(fromIndex, 1);
    nodes.splice(toIndex, 0, moved);
    return true;
  }

  for (const node of nodes) {
    if (node.children && reorderWithinSiblings(node.children, draggedId, targetId)) {
      return true;
    }
  }

  return false;
}

function deleteFolderInTree(tree: PageNode[], folderId: string): PageNode | undefined {
  const index = tree.findIndex(node => node.id === folderId && node.type === "folder");
  if (index >= 0) {
    const [removed] = tree.splice(index, 1);
    return removed;
  }

  for (const node of tree) {
    if (!node.children) continue;
    const removed: PageNode | undefined = deleteFolderInTree(node.children, folderId);
    if (removed) return removed;
  }

  return undefined;
}

function renameFolderInTree(tree: PageNode[], folderId: string, title: string) {
  for (const node of tree) {
    if (node.id === folderId && node.type === "folder") {
      node.title = title;
      return true;
    }

    if (node.children && renameFolderInTree(node.children, folderId, title)) return true;
  }

  return false;
}

export function usePageTree() {
  const [tree, setTree] = useState<PageNode[]>(() => cloneTree(initialPageTree));
  const defaultPageId = useMemo(() => findFirstPageId(tree), [tree]);
  const [activePageId, setActivePageId] = useState(() => findFirstPageId(initialPageTree));

  const activePage = useMemo(() => findNode(tree, activePageId), [tree, activePageId]);
  const activePath = useMemo(() => findNodePath(tree, activePageId), [tree, activePageId]);
  const pageExists = (pageId: string) => Boolean(findNode(tree, pageId)?.type === "page");

  function createFolder(title: string) {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) return;

    setTree(current => [
      ...current,
      {
        id: `folder-${Date.now()}`,
        title: normalizedTitle,
        type: "folder",
        children: []
      }
    ]);
  }

  function renameFolder(folderId: string, title: string) {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) return;

    setTree(current => {
      const next = cloneTree(current);
      renameFolderInTree(next, folderId, normalizedTitle);
      return next;
    });
  }

  function deleteFolder(folderId: string) {
    setTree(current => {
      const next = cloneTree(current);
      const removed = deleteFolderInTree(next, folderId);
      if (removed && containsNode(removed, activePageId)) {
        setActivePageId(findFirstPageId(next));
      }
      return next;
    });
  }

  function reorderNodes(draggedId: string, targetId: string) {
    if (draggedId === targetId) return;
    setTree(current => {
      const next = cloneTree(current);
      reorderWithinSiblings(next, draggedId, targetId);
      return next;
    });
  }

  return { tree, activePage, activePath, activePageId, defaultPageId, pageExists, setActivePageId, createFolder, renameFolder, deleteFolder, reorderNodes };
}
