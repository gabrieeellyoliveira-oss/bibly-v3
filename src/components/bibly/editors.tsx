import { useState, forwardRef, Fragment } from "react";
import { Plus, Settings, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function Panel({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

export const GearButton = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & { label?: string }
>(({ label, className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label={label ?? "Editar"}
    title={label ?? "Editar"}
    className={cn(
      "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
      className,
    )}
    {...props}
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

// ---------------------------------------------------------------------------
// RichText — renderizador markdown-lite (headings, listas, tabelas, negrito
// e links) usado no Playbook. Blocos são separados por linha em branco.
// ---------------------------------------------------------------------------

const URL_RE = /(https?:\/\/[^\s)]+)/g;
const BOLD_RE = /\*\*(.+?)\*\*/g;

function renderInline(text: string, keyPrefix: string) {
  const nodes: React.ReactNode[] = [];

  const pushPlain = (chunk: string, key: string) => {
    const parts = chunk.split(URL_RE);
    parts.forEach((part, i) => {
      if (!part) return;
      if (/^https?:\/\//.test(part)) {
        nodes.push(
          <a
            key={`${key}-url-${i}`}
            href={part}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-2"
          >
            {part}
          </a>,
        );
      } else {
        nodes.push(<Fragment key={`${key}-t-${i}`}>{part}</Fragment>);
      }
    });
  };

  let idx = 0;
  let match: RegExpExecArray | null;
  BOLD_RE.lastIndex = 0;
  let lastEnd = 0;
  while ((match = BOLD_RE.exec(text))) {
    const before = text.slice(lastEnd, match.index);
    if (before) pushPlain(before, `${keyPrefix}-${idx++}`);
    nodes.push(
      <strong key={`${keyPrefix}-b-${idx++}`} className="font-semibold text-foreground">
        {match[1]}
      </strong>,
    );
    lastEnd = match.index + match[0].length;
  }
  const tail = text.slice(lastEnd);
  if (tail) pushPlain(tail, `${keyPrefix}-${idx++}`);

  return nodes;
}

function parseTable(lines: string[]) {
  const cells = lines.map((l) =>
    l
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim()),
  );
  const [header, ...rest] = cells;
  const isSeparator = (row: string[]) => row.every((c) => /^:?-+:?$/.test(c));
  const body = isSeparator(rest[0] ?? []) ? rest.slice(1) : rest;
  return { header, body };
}

export function RichText({ text }: { text: string }) {
  const blocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="space-y-3 text-sm leading-relaxed text-foreground">
      {blocks.map((block, bi) => {
        const lines = block.split("\n");

        if (lines.every((l) => l.trim().startsWith("|"))) {
          const { header, body } = parseTable(lines);
          return (
            <div key={bi} className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-muted/60">
                    {header.map((h, hi) => (
                      <th key={hi} className="whitespace-nowrap px-3 py-2 font-semibold text-foreground">
                        {renderInline(h, `h${bi}-${hi}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {body.map((row, ri) => (
                    <tr key={ri} className="border-t border-border">
                      {row.map((cell, ci) => (
                        <td key={ci} className="whitespace-pre-line px-3 py-2 align-top text-muted-foreground">
                          {renderInline(cell, `r${bi}-${ri}-${ci}`)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (lines.length === 1 && /^#{2,4}\s/.test(lines[0])) {
          const level = lines[0].match(/^#{2,4}/)![0].length;
          const content = lines[0].replace(/^#{2,4}\s/, "");
          if (level === 2)
            return (
              <h2 key={bi} className="pt-2 text-base font-semibold text-foreground">
                {renderInline(content, `hd${bi}`)}
              </h2>
            );
          if (level === 3)
            return (
              <h3 key={bi} className="pt-2 text-[15px] font-semibold text-foreground">
                {renderInline(content, `hd${bi}`)}
              </h3>
            );
          return (
            <h4 key={bi} className="pt-1 text-sm font-semibold text-primary">
              {renderInline(content, `hd${bi}`)}
            </h4>
          );
        }

        if (lines.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={bi} className="list-disc space-y-1 pl-5 marker:text-primary">
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.trim().replace(/^-\s/, ""), `li${bi}-${li}`)}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={bi} className="whitespace-pre-line text-foreground/90">
            {renderInline(block, `p${bi}`)}
          </p>
        );
      })}
    </div>
  );
}

export function MarkdownEditorDialog({
  title,
  description,
  value,
  onSave,
}: {
  title: string;
  description?: string;
  value: string;
  onSave: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

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
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </DialogHeader>
        <div className="py-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-[50vh] font-mono text-xs"
          />
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
