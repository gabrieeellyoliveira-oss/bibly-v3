import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { MarkdownEditorDialog, RichText } from "@/components/bibly/editors";
import { IconChip, type IconType } from "@/components/bibly/Playbook";

// ---------------------------------------------------------------------------
// ContentPage — página simples de conteúdo (ícone + título + texto editável),
// usada para abas do menu principal que são um único documento em markdown
// (Planos e Preços, Progressão de Carreira).
// ---------------------------------------------------------------------------

export function ContentPage({
  storageKey,
  title,
  summary,
  icon,
  defaultBody,
}: {
  storageKey: string;
  title: string;
  summary: string;
  icon: IconType;
  defaultBody: string;
}) {
  const [body, setBody] = useLocalStorageState<string>(storageKey, defaultBody);

  return (
    <div className="h-screen overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-8 sm:px-10">
        <div className="mb-1.5 flex items-center gap-3.5">
          <IconChip icon={icon} size={48} radius={14} />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        </div>
        <p className="mb-7 mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{summary}</p>

        <div className="rounded-[20px] border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-bold text-foreground">Conteúdo</div>
            <MarkdownEditorDialog
              title={title}
              description="Edite o conteúdo em markdown simples (##, ###, ####, listas com -, tabelas com |, **negrito**)."
              value={body}
              onSave={setBody}
            />
          </div>
          <RichText text={body} />
        </div>
      </div>
    </div>
  );
}
