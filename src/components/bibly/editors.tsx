import { useState, forwardRef } from "react";
import { Plus, Settings, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const GearButton = forwardRef<HTMLButtonElement, { label?: string }>(({ label }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label={label ?? "Editar"}
    title={label ?? "Editar"}
    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
  >
    <Settings className="h-4 w-4" />
  </button>
));
GearButton.displayName = "GearButton";

export type Column<T> = {
  key: keyof T;
  label: string;
  type?: "text" | "number";
};

export function RowsEditorDialog<T extends Record<string, any>>({
  title,
  description,
  columns,
  rows,
  emptyRow,
  onSave,
}: {
  title: string;
  description?: string;
  columns: Column<T>[];
  rows: T[];
  emptyRow: () => T;
  onSave: (rows: T[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<T[]>(rows);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setDraft(rows);
      }}
    >
      <DialogTrigger asChild>
        <GearButton label={`Editar ${title}`} />
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </DialogHeader>
        <div className="space-y-3 py-2">
          {draft.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto] items-start gap-2 rounded-lg border border-border p-3"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {columns.map((col) => (
                  <label key={String(col.key)} className="space-y-1 text-xs">
                    <span className="text-muted-foreground">{col.label}</span>
                    <Input
                      type={col.type ?? "text"}
                      value={row[col.key] ?? ""}
                      onChange={(e) => {
                        const value = col.type === "number" ? Number(e.target.value) : e.target.value;
                        setDraft((prev) =>
                          prev.map((r, ri) => (ri === i ? { ...r, [col.key]: value } : r)),
                        );
                      }}
                    />
                  </label>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setDraft((prev) => prev.filter((_, ri) => ri !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDraft((prev) => [...prev, emptyRow()])}
          >
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSave(draft);
              setOpen(false);
            }}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ObjectEditorDialog<T extends Record<string, any>>({
  title,
  description,
  fields,
  value,
  onSave,
}: {
  title: string;
  description?: string;
  fields: Column<T>[];
  value: T;
  onSave: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<T>(value);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setDraft(value);
      }}
    >
      <DialogTrigger asChild>
        <GearButton label={`Editar ${title}`} />
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </DialogHeader>
        <div className="space-y-3 py-2">
          {fields.map((f) => (
            <label key={String(f.key)} className="block space-y-1 text-xs">
              <span className="text-muted-foreground">{f.label}</span>
              <Input
                type={f.type ?? "text"}
                value={draft[f.key] ?? ""}
                onChange={(e) => {
                  const val = f.type === "number" ? Number(e.target.value) : e.target.value;
                  setDraft((prev) => ({ ...prev, [f.key]: val }));
                }}
              />
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSave(draft);
              setOpen(false);
            }}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
