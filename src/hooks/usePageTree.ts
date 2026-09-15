import { useEffect, useMemo, useState } from "react";
import { pageTree as initialPageTree } from "../mockData/pageTree";
import type { PageNode } from "../types/page";
import { readStorageValue, writeStorageValue } from "../utils/persistentState";

const PAGE_TREE_STORAGE_KEY = "prototype-as-prd:page-tree";

function cloneTree(tree: PageNode[]): PageNode[] {
  return tree.map(node => ({ ...node, children: node.children ? cloneTree(node.children) : undefined }));
}

function stripRuntimeFields(tree: PageNode[]): PageNode[] {
  return tree.map(({ icon: _icon, children, ...node }) => ({
    ...node,
    children: children ? stripRuntimeFields(children) : undefined
  }));
}

function findDefaultNode(nodeId: string): PageNode | undefined {
  return findNode(initialPageTree, nodeId);
}

function hydrateRuntimeFields(tree: PageNode[]): PageNode[] {
  return tree.map(node => {
    const defaultNode = findDefaultNode(node.id);
    return {
      ...node,
      icon: defaultNode?.icon,
      sourceFile: node.sourceFile || defaultNode?.sourceFile,
      status: node.status || defaultNode?.status,
      children: node.children ? hydrateRuntimeFields(node.children) : undefined
    };
  });
}

function collectPageIds(tree: PageNode[]): Set<string> {
  const ids = new Set<string>();
  for (const node of tree) {
    if (node.type === "page") ids.add(node.id);
    node.children?.forEach(child => collectPageIds([child]).forEach(id => ids.add(id)));
  }
  return ids;
}

function collectMissingNodes(defaultTree: PageNode[], savedPageIds: Set<string>): PageNode[] {
  return defaultTree.flatMap(node => {
    if (node.type === "page") return savedPageIds.has(node.id) ? [] : [cloneTree([node])[0]];

    const missingChildren = collectMissingNodes(node.children || [], savedPageIds);
    return missingChildren.length ? [{ ...node, children: missingChildren }] : [];
  });
}

function mergeMissingDefaultPages(savedTree: PageNode[]) {
  const next = cloneTree(savedTree);
  const missingNodes = collectMissingNodes(initialPageTree, collectPageIds(next));
  return missingNodes.length ? [...next, ...missingNodes] : next;
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

function removeNodeInTree(tree: PageNode[], nodeId: string): PageNode | undefined {
  const index = tree.findIndex(node => node.id === nodeId);
  if (index >= 0) {
    const [removed] = tree.splice(index, 1);
    return removed;
  }

  for (const node of tree) {
    if (!node.children) continue;
    const removed = removeNodeInTree(node.children, nodeId);
    if (removed) return removed;
  }

  return undefined;
}

function insertNearNode(tree: PageNode[], targetId: string, movedNode: PageNode, placement: "before" | "after") {
  const index = tree.findIndex(node => node.id === targetId);
  if (index >= 0) {
    tree.splice(placement === "before" ? index : index + 1, 0, movedNode);
    return true;
  }

  for (const node of tree) {
    if (node.children && insertNearNode(node.children, targetId, movedNode, placement)) return true;
  }

  return false;
}

function insertIntoFolder(tree: PageNode[], folderId: string, movedNode: PageNode) {
  for (const node of tree) {
    if (node.id === folderId && node.type === "folder") {
      node.children = [...(node.children || []), movedNode];
      return true;
    }

    if (node.children && insertIntoFolder(node.children, folderId, movedNode)) return true;
  }

  return false;
}

export function usePageTree() {
  const [tree, setTree] = useState<PageNode[]>(() =>
    mergeMissingDefaultPages(hydrateRuntimeFields(readStorageValue(PAGE_TREE_STORAGE_KEY, cloneTree(initialPageTree))))
  );
  const defaultPageId = useMemo(() => findFirstPageId(tree), [tree]);
  const [activePageId, setActivePageId] = useState(() => findFirstPageId(initialPageTree));

  const activePage = useMemo(() => findNode(tree, activePageId), [tree, activePageId]);
  const activePath = useMemo(() => findNodePath(tree, activePageId), [tree, activePageId]);
  const pageExists = (pageId: string) => Boolean(findNode(tree, pageId)?.type === "page");

  useEffect(() => {
    setTree(current => mergeMissingDefaultPages(current));
  }, [setTree]);

  useEffect(() => {
    writeStorageValue(PAGE_TREE_STORAGE_KEY, stripRuntimeFields(tree));
  }, [tree]);

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

  function reorderNodes(draggedId: string, targetId: string, placement: "before" | "after" | "inside" = "before") {
    if (draggedId === targetId) return;

    setTree(current => {
      const next = cloneTree(current);
      const draggedNode = findNode(next, draggedId);
      const targetNode = findNode(next, targetId);

      // 防止把父级文件夹拖进自己的子级，避免页面树形成循环结构。
      if (!draggedNode || !targetNode || containsNode(draggedNode, targetId)) return current;

      const movedNode = removeNodeInTree(next, draggedId);
      if (!movedNode) return current;

      if (placement === "inside" && targetNode.type === "folder" && movedNode.type === "page") {
        insertIntoFolder(next, targetId, movedNode);
      } else {
        insertNearNode(next, targetId, movedNode, placement === "after" ? "after" : "before");
      }

      return next;
    });
  }

  return { tree, activePage, activePath, activePageId, defaultPageId, pageExists, setActivePageId, createFolder, renameFolder, deleteFolder, reorderNodes };
}
