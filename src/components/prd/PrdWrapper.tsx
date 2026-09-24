import type { ReactNode } from "react";
import { featureFlags } from "../../config/features";
import { PrdMarker } from "./PrdMarker";

type PrdWrapperProps = {
  noteId: string;
  children: ReactNode;
  onOpen: (noteId: string) => void;
};

// 用 PrdWrapper 包住任意 UI 区块，即可把“这块为什么这么做”绑定到 PRD 标注。
export function PrdWrapper({ noteId, children, onOpen }: PrdWrapperProps) {
  if (!featureFlags.prdAnnotations) return <>{children}</>;

  return (
    <div className="relative outline outline-1 outline-transparent transition hover:outline-brand/40">
      <PrdMarker onOpen={() => onOpen(noteId)} />
      {children}
    </div>
  );
}
