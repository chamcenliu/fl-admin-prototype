import { FileText } from "lucide-react";

export function PrdMarker({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="absolute -right-3 -top-3 z-10 inline-grid h-7 w-7 place-items-center border border-brand bg-brand-soft text-brand-dark shadow-sm transition hover:scale-105"
      style={{ borderRadius: 8 }}
      aria-label="查看 PRD 标注"
      title="查看 PRD 标注"
    >
      <FileText className="h-4 w-4" />
    </button>
  );
}
