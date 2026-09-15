import type { PageNode } from "./page";

export type IterationStatus = "active" | "archived";

export type IterationVersion = {
  id: string;
  version: string;
  title: string;
  status: IterationStatus;
  owner: string;
  lastUpdated: string;
  pageIds: string[];
  pageTreeSnapshot?: PageNode[];
  requirementIds: string[];
  summary: string;
};
