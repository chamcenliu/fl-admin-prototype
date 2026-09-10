import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import type { PrdNote } from "../../types/prd";
import { IconButton } from "../ui/IconButton";

export function PrdDrawer({ note, onClose }: { note?: PrdNote; onClose: () => void }) {
  return (
    <AnimatePresence>
      {note ? (
        <div className="fixed inset-0 z-50">
          <motion.button
            type="button"
            aria-label="关闭需求抽屉"
            className="absolute inset-0 bg-ink/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-line bg-white p-6 shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <header className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-dark">{note.priority} · {note.owner}</p>
                <h2 className="text-xl font-bold leading-7">{note.title}</h2>
              </div>
              <IconButton label="关闭" icon={<X className="h-4 w-4" />} onClick={onClose} />
            </header>

            <dl className="mb-6 grid grid-cols-2 gap-3 text-sm">
              <div className="panel p-3">
                <dt className="text-xs text-muted">状态</dt>
                <dd className="mt-1 font-bold">{note.status}</dd>
              </div>
              <div className="panel p-3">
                <dt className="text-xs text-muted">绑定迭代</dt>
                <dd className="mt-1 font-bold">{note.linkedIterationId}</dd>
              </div>
            </dl>

            <section className="mb-6">
              <h3 className="mb-2 text-sm font-bold">需求说明</h3>
              <p className="text-sm leading-7 text-muted">{note.description}</p>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-bold">验收标准</h3>
              <ul className="grid gap-3">
                {note.acceptance.map(item => (
                  <li key={item} className="flex gap-3 text-sm leading-6">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-brand" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
