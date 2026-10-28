export function AdminContextBreadcrumb({ onActivityClick }: { onActivityClick: () => void }) {
  return <span className="fl-admin-eyebrow fl-admin-context-breadcrumb"><span>运营</span><span aria-hidden="true">·</span><button type="button" onClick={onActivityClick}>活动奖励</button></span>;
}
