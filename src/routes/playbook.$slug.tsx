import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PLAYBOOK } from "@/lib/aurora-data";
import { MarkdownLite } from "@/lib/markdown";
import { ObjectionsAndCompetitors } from "@/components/bibly/ObjectionsAndCompetitors";

export const Route = createFileRoute("/playbook/$slug")({
  head: ({ params }) => {
    const t = PLAYBOOK.find((p) => p.slug === params.slug);
    return {
      meta: [
        { title: t ? `${t.title} — Playbook Aurora` : "Playbook — Aurora" },
        { name: "description", content: t?.summary ?? "Tópico do playbook Aurora." },
      ],
    };
  },
  loader: ({ params }) => {
    const topic = PLAYBOOK.find((p) => p.slug === params.slug);
    if (!topic) throw notFound();
    return { topic };
  },
  component: TopicPage,
});

function TopicPage() {
  const { slug } = Route.useParams();
  const topic = PLAYBOOK.find((p) => p.slug === slug)!;
  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/playbook" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16} /> Voltar ao Playbook
      </Link>
      <header>
        <div className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "var(--category-label)" }}>
          {topic.category}
        </div>
        <h1 className="text-4xl font-bold mt-1">{topic.title}</h1>
        <p className="text-muted-foreground mt-2">{topic.summary}</p>
      </header>
      <div className="bg-card rounded-2xl shadow-card p-8">
        {topic.widget === "objections-competitors" ? <ObjectionsAndCompetitors /> : <MarkdownLite source={topic.body} />}
      </div>
    </div>
  );
}
