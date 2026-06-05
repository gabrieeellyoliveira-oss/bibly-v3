import { useState, useRef, useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CardConfig, CardSize } from "@/hooks/useEditMode";

const SIZE_COLS: Record<CardSize, string> = {
  P: "col-span-1",
  M: "col-span-2",
  G: "col-span-3",
};

const SIZE_LABELS: CardSize[] = ["P", "M", "G"];

interface EditableCardProps {
  cardId: string;
  config: CardConfig;
  editMode: boolean;
  onUpdate: (cardId: string, patch: Partial<CardConfig>) => void;
  children: ReactNode;
  /** override de col-span quando não está em editMode (deixa o card controlar seu próprio span) */
  defaultColSpan?: string;
}

export function EditableCard({
  cardId,
  config,
  editMode,
  onUpdate,
  children,
  defaultColSpan,
}: EditableCardProps) {
  const [renaming, setRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(config.name);
  const inputRef = useRef<HTMLInputElement>(null);

  // sync input when config changes externally
  useEffect(() => {
    setNameInput(config.name);
  }, [config.name]);

  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renaming]);

  // When leaving editMode, cancel any pending rename
  useEffect(() => {
    if (!editMode) setRenaming(false);
  }, [editMode]);

  if (!config.visible && !editMode) return null;

  const colSpan = editMode ? SIZE_COLS[config.size] : (defaultColSpan ?? SIZE_COLS[config.size]);

  function commitRename() {
    const trimmed = nameInput.trim();
    if (trimmed) onUpdate(cardId, { name: trimmed });
    setRenaming(false);
  }

  return (
    <div
      className={cn(
        "relative transition-all duration-200",
        colSpan,
        editMode && "animate-jiggle",
        !config.visible && editMode && "opacity-40",
      )}
    >
      {/* Edit-mode overlay controls */}
      {editMode && (
        <>
          {/* Remove / hide button */}
          <button
            className="absolute -top-2.5 -right-2.5 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow-md transition-opacity hover:opacity-80"
            onClick={() => onUpdate(cardId, { visible: !config.visible })}
            title={config.visible ? "Ocultar card" : "Mostrar card"}
          >
            <X className="h-3.5 w-3.5" />
          </button>

          {/* Rename button (click on title area) */}
          {renaming ? (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-lg bg-white shadow-elevated px-2 py-1" style={{ border: "1px solid #E5DDF7" }}>
              <input
                ref={inputRef}
                className="text-xs font-semibold text-foreground bg-transparent outline-none w-32"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") { setNameInput(config.name); setRenaming(false); }
                }}
                onBlur={commitRename}
              />
            </div>
          ) : (
            <button
              className="absolute top-2 left-1/2 -translate-x-1/2 z-20 max-w-[80%] truncate rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary bg-white/90 shadow border border-primary/20 hover:bg-primary/5 transition-colors"
              onClick={() => setRenaming(true)}
              title="Clique para renomear"
            >
              {config.name}
            </button>
          )}

          {/* Size buttons */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-0.5 rounded-full bg-white shadow-card px-1.5 py-0.5" style={{ border: "1px solid #E5DDF7" }}>
            {SIZE_LABELS.map((s) => (
              <button
                key={s}
                onClick={() => onUpdate(cardId, { size: s })}
                className={cn(
                  "h-5 w-5 rounded-full text-[9px] font-bold transition-all",
                  config.size === s
                    ? "text-white"
                    : "text-muted-foreground hover:text-primary",
                )}
                style={config.size === s ? { background: "linear-gradient(135deg,#8B5CF6,#EC4899)" } : {}}
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Card content */}
      <div className={cn("h-full", editMode && "pointer-events-none select-none")}>
        {children}
      </div>
    </div>
  );
}
