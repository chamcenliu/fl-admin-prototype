export type IterationStatus = "active" | "archived";

export type IterationVersion = {
  id: string;
  version: string;
  title: string;
  status: IterationStatus;
  owner: string;
  lastUpdated: string;
  pageIds: string[];
  requirementIds: string[];
  summary: string;
};
