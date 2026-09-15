import type { PageNode } from "../types/page";

export function stripPageTreeRuntimeFields(tree: PageNode[]): PageNode[] {
  return tree.map(({ icon: _icon, children, ...node }) => ({
    ...node,
    children: children ? stripPageTreeRuntimeFields(children) : undefined
  }));
}

export function filterPageTreeByPageIds(tree: PageNode[], pageIds: string[]): PageNode[] {
  const selectedIds = new Set(pageIds);

  return tree.flatMap(node => {
    if (node.type === "page") return selectedIds.has(node.id) ? [{ ...node }] : [];

    const children = filterPageTreeByPageIds(node.children || [], pageIds);
    return children.length ? [{ ...node, children }] : [];
  });
}

export function createPageTreeSnapshot(tree: PageNode[], pageIds: string[]) {
  return stripPageTreeRuntimeFields(filterPageTreeByPageIds(tree, pageIds));
}

export function findFirstPageId(tree: PageNode[]): string {
  for (const node of tree) {
    if (node.type === "page") return node.id;
    const childPageId = node.children ? findFirstPageId(node.children) : "";
    if (childPageId) return childPageId;
  }

  return "";
}

export function findNode(tree: PageNode[], nodeId: string): PageNode | undefined {
  for (const node of tree) {
    if (node.id === nodeId) return node;
    const child = node.children ? findNode(node.children, nodeId) : undefined;
    if (child) return child;
  }

  return undefined;
}

export function findNodePath(tree: PageNode[], nodeId: string, parents: PageNode[] = []): PageNode[] {
  for (const node of tree) {
    const path = [...parents, node];
    if (node.id === nodeId) return path;

    const childPath = node.children ? findNodePath(node.children, nodeId, path) : [];
    if (childPath.length) return childPath;
  }

  return [];
}
