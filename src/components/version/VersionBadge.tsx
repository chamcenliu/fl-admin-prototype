import { GitBranch } from "lucide-react";
import type { IterationVersion } from "../../types/version";
import { formatReadableDate } from "../../utils/date";

export function VersionBadge({ version }: { version: IterationVersion }) {
  return (
    <aside className="fixed bottom-4 right-4 z-40 flex items-center gap-2 border border-white/60 bg-ink/70 px-3 py-2 text-xs text-white shadow-panel backdrop-blur-md" style={{ borderRadius: 8 }}>
      <GitBranch className="h-4 w-4" />
      <div className="grid">
        <strong className="font-bold">{version.version}</strong>
        <span className="text-white/75">{formatReadableDate(version.lastUpdated)}</span>
      </div>
    </aside>
  );
}
