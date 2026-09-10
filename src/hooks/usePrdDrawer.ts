import { useMemo, useState } from "react";
import { findPrdNote } from "../mockData/prdNotes";

export function usePrdDrawer() {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const activeNote = useMemo(() => (activeNoteId ? findPrdNote(activeNoteId) : undefined), [activeNoteId]);

  return {
    activeNote,
    openPrdNote: setActiveNoteId,
    closePrdNote: () => setActiveNoteId(null)
  };
}
