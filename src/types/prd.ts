export type PrdNotePriority = "P0" | "P1" | "P2";

export type PrdNote = {
  id: string;
  title: string;
  owner: "PM" | "FE" | "QA" | "BE";
  priority: PrdNotePriority;
  status: "待确认" | "研发中" | "可验收";
  description: string;
  acceptance: string[];
  linkedIterationId: string;
};
