import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export function StubPage({ breadcrumb, title, subtitle, children }: { breadcrumb: string; title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader breadcrumb={breadcrumb} title={title} subtitle={subtitle} />
      <Card className="shadow-card animate-fade-in">
        <CardContent className="p-8">
          {children ?? <p className="text-muted-foreground text-sm">Esta seção está pronta para receber conteúdo. Em breve.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
