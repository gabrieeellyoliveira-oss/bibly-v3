import React from "react";

/** Very small markdown-lite renderer: ##, ###, - lists, tables (|), **bold**, [text](url) */
export function MarkdownLite({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  const inline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text))) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      const t = m[0];
      if (t.startsWith("**")) parts.push(<strong key={parts.length}>{t.slice(2, -2)}</strong>);
      else {
        const mm = /\[([^\]]+)\]\(([^)]+)\)/.exec(t)!;
        parts.push(
          <a key={parts.length} href={mm[2]} className="text-primary underline" target="_blank" rel="noreferrer">
            {mm[1]}
          </a>,
        );
      }
      last = m.index + t.length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  };

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      out.push(
        <h3 key={key++} className="text-lg font-semibold mt-6 mb-2">
          {inline(line.slice(4))}
        </h3>,
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      out.push(
        <h2 key={key++} className="text-2xl font-bold mt-8 mb-3">
          {inline(line.slice(3))}
        </h2>,
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      out.push(
        <h1 key={key++} className="text-3xl font-bold mt-8 mb-3">
          {inline(line.slice(2))}
        </h1>,
      );
      i++;
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      out.push(
        <ul key={key++} className="list-disc pl-6 space-y-1 my-3">
          {items.map((it, idx) => (
            <li key={idx}>{inline(it)}</li>
          ))}
        </ul>,
      );
      continue;
    }
    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        const cells = lines[i].split("|").slice(1, -1).map((c) => c.trim());
        if (!cells.every((c) => /^-+$/.test(c))) rows.push(cells);
        i++;
      }
      if (rows.length) {
        const [head, ...body] = rows;
        out.push(
          <div key={key++} className="my-4 overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  {head.map((h, j) => (
                    <th key={j} className="text-left p-3 font-medium">
                      {inline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((r, ri) => (
                  <tr key={ri} className="border-t">
                    {r.map((c, ci) => (
                      <td key={ci} className="p-3">
                        {inline(c)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
      }
      continue;
    }
    out.push(
      <p key={key++} className="my-2 leading-relaxed text-foreground/85">
        {inline(line)}
      </p>,
    );
    i++;
  }

  return <div>{out}</div>;
}
