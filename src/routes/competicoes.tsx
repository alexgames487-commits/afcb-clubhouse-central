import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PublicLayout, Container } from "@/components/afcb/public-layout";
import { PageHeader, StatusPill } from "@/components/afcb/ui";
import { demoCompetitions } from "@/lib/demo-data";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/competicoes")({ head: () => seo("Competições", "Ligas, copas e torneios organizados pela AFCB."), component: Page });

function Page() {
  const match = useMatchRoute();
  if (match({ to: "/competicoes/$slug", fuzzy: true })) return <Outlet />;
  return (
    <PublicLayout><Container>
      <PageHeader eyebrow="Competições" title="Campeonatos AFCB" description="Cada competição possui página própria com participantes, regulamento, tabela, rodadas, súmulas e estatísticas." demo />
      <div className="grid gap-4 md:grid-cols-3">
        {demoCompetitions.map((c) => (
          <Link key={c.slug} to="/competicoes/$slug" params={{ slug: c.slug }} className="surface group p-6 hover:shadow-glow">
            <StatusPill status={c.status} />
            <h3 className="mt-4 text-2xl font-bold">{c.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.format} · {c.season}</p>
            <p className="mt-4 text-sm">{c.clubs} clubes participantes</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary">Abrir <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </div>
    </Container></PublicLayout>
  );
}
