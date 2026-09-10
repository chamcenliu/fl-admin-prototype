import { FolderOpen } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid min-h-56 place-items-center px-6 text-center">
      <div className="grid justify-items-center gap-3">
        <FolderOpen className="h-9 w-9 text-muted" />
        <strong>{title}</strong>
        <p className="max-w-sm text-sm leading-6 text-muted">{description}</p>
      </div>
    </div>
  );
}
