import { useEffect, useMemo } from "react";
import { iterationVersions } from "../mockData/versions";
import type { PageNode } from "../types/page";
import type { IterationVersion } from "../types/version";
import { createPageTreeSnapshot } from "../utils/pageTreeArchive";
import { usePersistentState } from "../utils/persistentState";

const ITERATIONS_STORAGE_KEY = "prototype-as-prd:iterations";
const ACTIVE_ITERATION_STORAGE_KEY = "prototype-as-prd:active-iteration-id";

function createVersionLabel(index: number) {
  return `v${index + 1}.0.0`;
}

function ensureIterationSnapshots(iterations: IterationVersion[], pageTree: PageNode[]) {
  return iterations.map(item => ({
    ...item,
    pageTreeSnapshot: item.pageTreeSnapshot || createPageTreeSnapshot(pageTree, item.pageIds)
  }));
}

function createIterationRecord(title: string, pageIds: string[], pageTree: PageNode[], index: number): IterationVersion {
  return {
    id: `iteration-${Date.now()}`,
    version: createVersionLabel(index),
    title,
    status: "active",
    owner: "当前用户",
    lastUpdated: new Date().toISOString(),
    pageIds,
    pageTreeSnapshot: createPageTreeSnapshot(pageTree, pageIds),
    requirementIds: [],
    summary: "用户在迭代列表中创建的原型交付版本。"
  };
}

export function useIterations(pageTree: PageNode[]) {
  const [iterations, setIterations] = usePersistentState<IterationVersion[]>(
    ITERATIONS_STORAGE_KEY,
    ensureIterationSnapshots(iterationVersions, pageTree)
  );
  const [activeIterationId, setActiveIterationId] = usePersistentState<string>(ACTIVE_ITERATION_STORAGE_KEY, iterationVersions[0]?.id || "");

  const activeIteration = useMemo(() => {
    return iterations.find(item => item.id === activeIterationId) || iterations[0] || iterationVersions[0];
  }, [activeIterationId, iterations]);

  useEffect(() => {
    if (iterations.every(item => item.pageTreeSnapshot)) return;
    setIterations(current => ensureIterationSnapshots(current, pageTree));
  }, [iterations, pageTree, setIterations]);

  function createIteration(title: string, pageIds: string[]) {
    const newIteration = createIterationRecord(title, pageIds, pageTree, iterations.length);
    setIterations(current => [newIteration, ...current]);
    setActiveIterationId(newIteration.id);
  }

  function updateIteration(iterationId: string, title: string, pageIds: string[]) {
    setIterations(current =>
      current.map(item =>
        item.id === iterationId
          ? { ...item, title, pageIds, pageTreeSnapshot: createPageTreeSnapshot(pageTree, pageIds), lastUpdated: new Date().toISOString() }
          : item
      )
    );
  }

  function deleteIteration(iterationId: string) {
    setIterations(current => {
      const next = current.filter(item => item.id !== iterationId);
      if (activeIterationId === iterationId) setActiveIterationId(next[0]?.id || "");
      return next;
    });
  }

  return {
    iterations,
    activeIteration,
    activeIterationId,
    setActiveIterationId,
    createIteration,
    updateIteration,
    deleteIteration
  };
}
